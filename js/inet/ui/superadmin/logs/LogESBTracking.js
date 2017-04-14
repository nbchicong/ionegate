/**
 * Created by anttt on 13/04/2017.
 */
//#PACKAGE: log-esb-tracking
//#MODULE: LogESBTracking
$(function () {
    /**
     * @class iNet.ui.logs.LogESBTracking
     * @extends iNet.ui.onegate.OnegateWidget
     */

    var selected = null;
    var url = {
        trash: iNet.getUrl('xgate/ad/track/esb/trash'),
        del: iNet.getUrl('xgate/ad/track/esb/del'),
        search: iNet.getUrl('xgate/ad/track/esb/get')
    };

    /**
     * @param {String} uuids
     * @private
     */
    function trash(uuids) {
        console.log('trash ids', uuids);
        if (!uuids) return;
        var _this = this;
        if (!this.trashDlg)
            this.trashDlg = new iNet.ui.dialog.ModalDialog({
                id: iNet.generateId(),
                title: 'Bỏ thùng rác!',
                content: 'Bạn có chắc chắn đồng ý bỏ vào thùng rác? <br/> ' +
                '<i class="orange"><b>Lưu ý:</b> Dữ liệu đã bỏ vào thùng rác sẽ tự động xóa sau 5 ngày</i>',
                buttons: [
                    {
                        text: iNet.resources.message.button.ok,
                        cls: 'btn-primary',
                        icon: 'icon-ok icon-white',
                        fn: function () {
                            $.postJSON(url.trash, _this.trashDlg.getOptions(), function (result) {
                                if (!iNet.isEmpty(result))
                                    _this.getGrid().remove(result.join(';'));
                                _this.trashDlg.hide();
                            }, {
                                msg: iNet.resources.ajaxLoading.deleting,
                                mask: _this.getMask()
                            });
                        }
                    },{
                        text: iNet.resources.message.button.cancel,
                        cls: 'btn-default',
                        icon: 'icon-remove',
                        fn: function () {
                            this.hide();
                        }
                    }
                ]
            });
        this.trashDlg.setOptions({ids: uuids});
        this.trashDlg.show();
    }

    /**
     * @param {String} uuids
     * @private
     */
    function remove(uuids) {
        console.log('delete ids', uuids);
        if (!uuids) return;
        var _this = this;
        if (!this.removeDlg)
            this.removeDlg = new iNet.ui.dialog.ModalDialog({
                id: iNet.generateId(),
                title: 'Xóa Log!',
                content: 'Bạn có chắc chắn đồng ý xóa vĩnh viễn?',
                buttons: [
                    {
                        text: iNet.resources.message.button.ok,
                        cls: 'btn-primary',
                        icon: 'icon-ok icon-white',
                        fn: function () {
                            $.postJSON(url.del, _this.removeDlg.getOptions(), function (result) {
                                var __result = result || {};
                                var __ids = __result.ids || [];
                                if (!iNet.isEmpty(__ids))
                                    _this.getGrid().remove(__ids.join(';'));
                                _this.removeDlg.hide();
                            }, {
                                msg: iNet.resources.ajaxLoading.deleting,
                                mask: _this.getMask()
                            });
                        }
                    },{
                        text: iNet.resources.message.button.cancel,
                        cls: 'btn-default',
                        icon: 'icon-remove',
                        fn: function () {
                            this.hide();
                        }
                    }
                ]
            });
        this.removeDlg.setOptions({ids: uuids});
        this.removeDlg.show();
    }
    function getIdsSelected() {
        console.log('selected', selected);
        if (!selected)
            return null;
        var ids = [];
        for (var i = 0; i < selected.length; i++)
            ids.push(selected[i].uuid);
        return ids.join(',');
    }
    iNet.ns('iNet.ui.logs.LogESBTracking');
    iNet.ui.logs.LogESBTracking = function (options) {
        var _this = this;
        this.id = this.id || 'log-esb-tracking-wg';
        this.gridId = this.gridId || 'log-esb-tracking-list';
        var toolbar = {
            TRASH: $('#log-esb-tracking-btn-trash'),
            REMOVE: $('#log-esb-tracking-btn-remove')
        };
        var dataSource = new iNet.ui.grid.DataSource({
            columns: [{
                label: '#',
                type: 'selection',
                width: 30
            }, {
                property: 'name',
                label: 'name',
                type: 'label',
                sortable: true,
                width: 250
            }, {
                property: 'receiptCode',
                label: 'Mã hồ sơ',
                type: 'label',
                sortable: true,
                width: 250
            }, {
                property: 'orgFrom',
                label: 'orgFrom',
                sortable: true,
                type: 'label',
                fn: function (v) {
                    return !iNet.isEmpty(v.organName) ? v.organName : v.organId;
                }
            }, {
                property: 'orgTo',
                label: 'orgTo',
                sortable: true,
                type: 'label',
                fn: function (v) {
                    return !iNet.isEmpty(v.organName) ? v.organName : v.organId;
                }
            }, {
                property: 'status',
                label: 'status',
                sortable: true,
                type: 'label',
                width: 120
            }, {
                property: 'created',
                label: 'created',
                sortable: true,
                type: 'label',
                width: 120,
                renderer: function (v) {
                 return new Date(v).format('d/m/Y H:i');
                 }
            }, {
                label: '',
                type: 'action',
                separate: '&nbsp;',
                align: 'center',
                buttons: [{
                    text: 'Bỏ thùng rác',
                    icon: 'fa fa-trash',
                    labelCls: 'label label-warning',
                    fn: function (record) {
                        trash.call(_this, record.uuid);
                    }
                }, {
                    text: iNet.resources.message.button.del,
                    icon: 'fa fa-times',
                    labelCls: 'label label-important',
                    fn: function (record) {
                        remove.call(_this, record.uuid);
                    }
                }]
            }]
        });
        /**
         * @class BasicSearch
         * @extends iNet.ui.grid.Search
         * @constructor
         */
        var BasicSearch = function () {
            this.id = 'log-esb-tracking-list-basic-search';
            this.url = url.search;
        };
        iNet.extend(BasicSearch, iNet.ui.grid.Search, {
            intComponent: function () {
                var _search = this;
                this.$inputSearch = this.getEl().find('.grid-search-input');
                this.$inputFromTime = this.getEl().find('.grid-search-from-time');
                this.$inputToTime = this.getEl().find('.grid-search-to-time');
                this.$cbbTypes = this.getEl().find('.grid-search-type');
                this.$btnSearch = this.getEl().find('[data-action-search="search"]');
                this.fromTimeSearch = this.$inputFromTime.datepicker().on('changeDate', function(e) {
                    if (e.date.valueOf() > _search.toTimeSearch.date.valueOf()) {
                        var newDate = new Date(e.date);
                        newDate.setDate(newDate.getDate() + 1);
                        _search.toTimeSearch.setValue(newDate);
                    }
                    _search.fromTimeSearch.hide();
                    _search.toTimeSearch.focus();
                    _search.search();
                }).data('datepicker');
                this.toTimeSearch = this.$inputToTime.datepicker().on('changeDate', function(e) {
                    if (e.date.valueOf() > _search.fromTimeSearch.date.valueOf()) {
                        var newDate = new Date(e.date);
                        newDate.setDate(newDate.getDate() - 1);
                        _search.fromTimeSearch.setValue(newDate);
                    }
                    _search.toTimeSearch.hide();
                    _search.search();

                }).data('datepicker');

                var nowDate = iNet.today.format(iNet.dateFormat);
                var monthFirst = new Date().format('01/m/Y');

                this.$inputFromTime.val(monthFirst);
                this.$inputToTime.val(nowDate);

                this.$cbbTypes.on('change', function () {
                    _search.setTypes(this.value);
                    _search.search();
                });
            },
            getUrl: function () {
                return this.url;
            },
            convertDateToLong: function (date) {
                return !iNet.isEmpty(date) ? date.toDate().getTime() : "";
            },
            getData: function () {
                return {
                    keyword: this.$inputSearch.val(),
                    type: this.getTypes(),
                    start: this.convertDateToLong(this.$inputFromTime.val()),
                    end: this.convertDateToLong(this.$inputToTime.val()),
                    pageSize: 10,
                    pageNumber: 0
                };
            },
            setTypes: function (status) {
                this.status = status;
            },
            getTypes: function () {
                return this.status || '';
            },
            search: function () {
                this.$btnSearch.trigger('click');
            }
        });
        this.grid = new iNet.ui.grid.Grid({
            id: this.gridId,
            url: url.search,
            basicSearch: BasicSearch,
            remotePaging: true,
            dataSource: dataSource,
            idProperty: 'uuid',
            firstLoad: true,
            convertData: function(data) {
                _this.getGrid().setTotal(data.total || 0);
                return data.items || [];
            }
        });
        iNet.apply(this, options || {});
        iNet.ui.logs.LogESBTracking.superclass.constructor.call(this);
        this.getGrid().on('selectionchange', function (sm, data) {
            if (!iNet.isEmpty(data))
                selected = sm.getSelection();
            FormUtils.showButton(toolbar.TRASH, !iNet.isEmpty(selected));
            FormUtils.showButton(toolbar.REMOVE, !iNet.isEmpty(selected));
        });
        this.getGrid().on('click', function (record) {
            if (record)
                _this.fireEvent('open', record, _this);
        });
        toolbar.TRASH.on('click', function () {
            console.log('click trash');
            if (getIdsSelected()) {
                console.log('call trash', getIdsSelected());
                trash.call(_this, getIdsSelected());
            }
        });
        toolbar.REMOVE.on('click', function () {
            console.log('click remove');
            if (getIdsSelected()) {
                remove.call(_this, getIdsSelected());
            }
        });
    };
    iNet.extend(iNet.ui.logs.LogESBTracking, iNet.ui.onegate.OnegateWidget, {
        /**
         * @returns {iNet.ui.grid.Grid}
         */
        getGrid: function () {
            return this.grid;
        }
    });
});
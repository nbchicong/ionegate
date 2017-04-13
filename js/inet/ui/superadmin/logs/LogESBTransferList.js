/**
 * #PACKAGE: log-esb-transfer-list
 * #MODULE: LogESBTransferList
 */
/**
 * Copyright (c) 2016 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 9:24 AM 09/11/2016.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file LogESBTransferList.js
 */
$(function () {
  /**
   * @class iNet.ui.logs.LogESBTransferList
   * @extends iNet.ui.onegate.OnegateWidget
   */

  var selected = null;
  var url = {
    search: iNet.getUrl('onegate/log/transfer/search'),
    trash: iNet.getUrl('onegate/log/transfer/trash'),
    remove: iNet.getUrl('onegate/log/transfer/remove')
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
    this.trashDlg.setOptions({uuids: uuids});
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
              $.postJSON(url.remove, _this.removeDlg.getOptions(), function (result) {
                if (!iNet.isEmpty(result))
                  _this.getGrid().remove(result.join(';'));
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
    this.removeDlg.setOptions({uuids: uuids});
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
  iNet.ns('iNet.ui.logs.LogESBTransferList');
  iNet.ui.logs.LogESBTransferList = function (options) {
    var _this = this;
    this.id = this.id || 'log-esb-transfer-list-wg';
    this.gridId = this.gridId || 'log-esb-transfer-list';
    var toolbar = {
      TRASH: $('#list-btn-trash'),
      REMOVE: $('#list-btn-remove')
    };
    var dataSource = new iNet.ui.grid.DataSource({
      columns: [{
        label: '#',
        type: 'selection',
        width: 30
      }, {
        property: 'title',
        label: 'Title',
        type: 'label',
        sortable: true,
        width: 250
      }, {
        property: 'status',
        label: 'Status',
        sortable: true,
        type: 'label',
        width: 120
      }, {
        property: 'serviceName',
        label: 'Service Name',
        sortable: true,
        type: 'label'
      }, {
        property: 'exTime',
        label: 'Time',
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
      this.id = 'log-list-basic-search';
      this.url = url.search;
    };
    iNet.extend(BasicSearch, iNet.ui.grid.Search, {
      intComponent: function () {
        var _search = this;
        this.$inputSearch = this.getEl().find('.grid-search-input');
        this.$inputTime = this.getEl().find('.grid-search-time');
        this.$cbbStatus = this.getEl().find('.grid-search-status');
        this.$btnSearch = this.getEl().find('[data-action-search="search"]');
        this.timeSearch = this.$inputTime.datepicker().on('changeDate', function(e) {
          _search.setTime(e.date.valueOf());
          _search.timeSearch.hide();
          _search.search();
        }).data('datepicker');
        this.$cbbStatus.on('change', function () {
          _search.setStatus(this.value);
          _search.search();
        });
      },
      getUrl: function () {
        return this.url;
      },
      getData: function () {
        return {
          keyword: this.$inputSearch.val(),
          status: this.getStatus(),
          time: this.getTime(),
          pageSize: 10,
          pageNumber: 0
        };
      },
      setTime: function (time) {
        this.time = time;
      },
      getTime: function () {
        return this.time || new Date().getTime();
      },
      setStatus: function (status) {
        this.status = status;
      },
      getStatus: function () {
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
    iNet.ui.logs.LogESBTransferList.superclass.constructor.call(this);
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
  iNet.extend(iNet.ui.logs.LogESBTransferList, iNet.ui.onegate.OnegateWidget, {
    /**
     * @returns {iNet.ui.grid.Grid}
     */
    getGrid: function () {
      return this.grid;
    }
  });
});

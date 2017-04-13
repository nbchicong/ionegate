/**
 * #PACKAGE: notify-tracking-list
 * #MODULE: NotifyTrackingList
 */
/**
 * Copyright (c) 2016 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 11:29 AM 12/11/2016.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file NotifyTrackingList.js
 */
$(function () {
  /**
   * @class iNet.ui.logs.NotifyTrackingList
   * @extends iNet.ui.onegate.OnegateWidget
   */
  var selected = null;
  var url = {
    search: iNet.getUrl('onegate/notify/queue/search'),
    remove: iNet.getUrl('onegate/notify/queue/remove')
  };

  /**
   * @param {String} uuids
   * @private
   */
  function remove(uuids) {
    console.log('delete ids', uuids);
    if (!uuids) return;
    var _this = this;
    this.confirmDialog('', '', function () {
      $.postJSON(url.remove, _this.dialog.getOptions(), function (result) {
        if (!iNet.isEmpty(result))
          _this.getGrid().remove(result.join(';'));
        _this.dialog.hide();
      }, {
        msg: iNet.resources.ajaxLoading.deleting,
        mask: _this.getMask()
      });
    });
    this.dialog.setTitle('Xóa Log!');
    this.dialog.setContent('Bạn có chắc chắn đồng ý xóa?');
    this.dialog.setOptions({uuids: uuids});
    this.dialog.show();
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

  iNet.ns('iNet.ui.logs.NotifyTrackingList');
  iNet.ui.logs.NotifyTrackingList = function (options) {
    var _this = this;
    this.id = this.id || 'notify-tracking-list-wg';
    this.gridId = this.gridId || 'notify-tracking-list';
    var toolbar = {
      REMOVE: $('#list-btn-remove')
    };
    var dataSource = new iNet.ui.grid.DataSource({
      columns: [{
        label: '#',
        type: 'selection',
        width: 30
      }, {
        property: 'type',
        label: 'Type',
        type: 'label',
        sortable: true,
        width: 50
      }, {
        property: 'subject',
        label: 'Subject',
        type: 'label',
        sortable: true,
        width: 130
      }, {
        property: 'sent',
        label: 'Status',
        sortable: true,
        type: 'label',
        width: 80,
        renderer: function (v) {
          return v ? '<b class="green">ĐÃ GỬI</b>' : '<b class="orange">CHƯA GỬI</b>';
        }
      }, {
        property: 'message',
        label: 'Message',
        sortable: true,
        type: 'label'
      }, {
        property: 'phone',
        label: 'Phone',
        sortable: true,
        type: 'label',
        width: 90
      }, {
        property: 'email',
        label: 'Email',
        sortable: true,
        type: 'label',
        width: 120
      }, {
        property: 'sendTime',
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
        this.$cbbType = this.getEl().find('.grid-search-type');
        this.$btnSearch = this.getEl().find('[data-action-search="search"]');
        this.timeSearch = this.$inputTime.datepicker().on('changeDate', function(e) {
          _search.setTime(e.date.valueOf());
          _search.timeSearch.hide();
          _search.search();
        }).data('datepicker');
        this.$cbbType.on('change', function () {
          _search.search();
        });
      },
      getUrl: function () {
        return this.url;
      },
      getData: function () {
        return {
          keyword: this.$inputSearch.val(),
          type: this.$cbbType.val(),
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
    iNet.ui.logs.NotifyTrackingList.superclass.constructor.call(this);
    this.getGrid().on('selectionchange', function (sm, data) {
      if (!iNet.isEmpty(data))
        selected = sm.getSelection();
      FormUtils.showButton(toolbar.REMOVE, !iNet.isEmpty(selected));
    });
    toolbar.REMOVE.on('click', function () {
      console.log('click remove');
      if (getIdsSelected()) {
        remove.call(_this, getIdsSelected());
      }
    });
  };
  iNet.extend(iNet.ui.logs.NotifyTrackingList, iNet.ui.onegate.OnegateWidget, {
    /**
     * @returns {iNet.ui.grid.Grid}
     */
    getGrid: function () {
      return this.grid;
    }
  });
  new iNet.ui.logs.NotifyTrackingList();
});

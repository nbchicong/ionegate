/**
 * #PACKAGE: leader-account-list
 * #MODULE: LeaderAccountList
 */
/**
 * Copyright (c) 2017 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 5:22 PM 22/09/2017.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file LeaderAccountList.js
 */
$(function () {

  var url = {
    search: iNet.getUrl('igate/leader/list'),
    remove: iNet.getUrl('igate/leader/delete')
  };

  /**
   * @class iNet.ui.leader.LeaderAccountList
   * @extends iNet.ui.onegate.OnegateWidget
   */
  iNet.ns('iNet.ui.leader.LeaderAccountList');
  iNet.ui.leader.LeaderAccountList = function (options) {
    var _this = this;
    iNet.apply(this, options || {});
    this.id = 'leader-account-wg';
    this.gridId = this.gridId || 'leader-account-list';
    var toolbar = {
      CREATE: $('#list-btn-add')
    };
    var dataSource = new iNet.ui.grid.DataSource({
      columns: [{
        label: '#',
        type: 'selection',
        width: 30
      }, {
        property: 'name',
        label: 'Họ và tên',
        type: 'label',
        sortable: true,
        width: 250
      }, {
        property: 'orgName',
        label: 'Đơn vị',
        sortable: true,
        type: 'label'
      }, {
        property: 'phone',
        label: 'Điện thoại',
        sortable: true,
        type: 'label',
        width: 120
      }, {
        property: 'email',
        label: 'Email',
        sortable: true,
        type: 'label',
        width: 220
      }, {
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [{
          text: iNet.resources.message.button.del,
          icon: 'fa fa-trash',
          labelCls: 'label label-important',
          fn: function (record) {
            if (!_this.removeDlg)
              _this.removeDlg = new iNet.ui.dialog.ModalDialog({
                id: iNet.generateId(),
                title: 'Xóa tài khoản lãnh đạo!',
                content: 'Bạn có chắc chắn đồng ý xóa vĩnh viễn?',
                buttons: [
                  {
                    text: iNet.resources.message.button.ok,
                    cls: 'btn-primary',
                    icon: 'icon-ok icon-white',
                    fn: function () {
                      this.hide();
                      $.postJSON(url.remove, this.getOptions(), function (result) {
                        if (result.success)
                          _this.getGrid().remove(result.data.uuid);
                      }, {
                        msg: iNet.resources.ajaxLoading.deleting,
                        mask: _this.getMask()
                      });
                    }
                  }, {
                    text: iNet.resources.message.button.cancel,
                    cls: 'btn-default',
                    icon: 'icon-remove',
                    fn: function () {
                      this.hide();
                    }
                  }
                ]
              });

            _this.removeDlg.setOptions({uuid: record.uuid});
            _this.removeDlg.show();
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
      this.id = 'list-basic-search';
      this.url = url.search;
    };
    iNet.extend(BasicSearch, iNet.ui.grid.Search, {
      intComponent: function () {
        var _search = this;
        this.$inputSearch = this.getEl().find('.grid-search-input');
        this.$cbbOrgan = this.getEl().find('.cbb-organ');
        this.$btnSearch = this.getEl().find('[data-action-search="search"]');
        this.$cbbOrgan.on('change', function () {
          _search.search();
        });
      },
      getUrl: function () {
        return this.url;
      },
      getData: function () {
        return {
          keyword: this.$inputSearch.val(),
          orgPrefix: this.$cbbOrgan.val(),
          pageSize: 10,
          pageNumber: 0
        };
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
    iNet.ui.leader.LeaderAccountList.superclass.constructor.call(this);
    this.getGrid().on('click', function (record) {
      if (record)
        _this.fireEvent('open', record, _this);
    });
    toolbar.CREATE.on('click', function () {
      _this.fireEvent('create', _this);
    });
  };

  iNet.extend(iNet.ui.leader.LeaderAccountList, iNet.ui.onegate.OnegateWidget, {
    /**
     * @returns {iNet.ui.grid.Grid}
     */
    getGrid: function () {
      return this.grid;
    }
  });
});

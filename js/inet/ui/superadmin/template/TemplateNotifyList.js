/**
 * #PACKAGE: template-notify-list
 * #MODULE: TemplateNotifyList
 */
/**
 * Copyright (c) 2016 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 3:13 PM 20/09/2016.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file TemplateNotifyList.js
 */
$(function () {
  /**
   * @class iNet.ui.template.TemplateNotifyList
   * @extends iNet.ui.onegate.OnegateWidget
   */
  var url = {
    list: iNet.getUrl('onegate/templatenotify/list'),
    trash: iNet.getUrl('onegate/templatenotify/delete')
  };

  /**
   * @param {String} uuid
   * @private
   */
  function __trash(uuid) {
    if (!uuid) return;
    var _this = this;
    this.confirmDialog('Xóa mẫu thông báo!', 'Bạn có chắc chắn đồng ý xóa?', function () {
      $.postJSON(url.trash, _this.dialog.getOptions(), function (result) {
        if (result.uuid)
          _this.getGrid().remove(result.uuid);
        _this.dialog.hide();
      }, {
        msg: iNet.resources.ajaxLoading.deleting,
        mask: _this.getMask()
      });
    });
    this.dialog.setOptions({uuid: uuid});
    this.dialog.show();
  }
  iNet.ns('iNet.ui.template.TemplateNotifyList');
  iNet.ui.template.TemplateNotifyList = function (options) {
    var _this = this;
    this.id = this.id || 'tpl-notify-list-wg';
    this.gridId = this.gridId || 'tpl-notify-list';
    this.toolbar = {
      CREATE: $('#btn-tpl-create')
    };
    var dataSource = new iNet.ui.grid.DataSource({
      columns: [{
        property: 'name',
        label: 'Tên mẫu',
        type: 'label',
        sortable: true
      }, {
        property: 'type',
        label: 'TYPE',
        sortable: true,
        type: 'label',
        width: 120
      }, {
        property: 'status',
        label: 'Trạng thái',
        sortable: true,
        type: 'label',
        align: 'center',
        width: 120
      }, {
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [{
          text: iNet.resources.message.button.edit,
          icon: 'icon-pencil',
          fn: function (record) {
            _this.fireEvent('open', record || {});
          }
        }, {
          text: iNet.resources.message.button.del,
          icon: 'icon-trash',
          labelCls: 'label label-important',
          fn: function (record) {
            __trash.call(_this, record.uuid);
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
      this.id = 'tpl-list-basic-search';
      this.url = url.list;
    };
    iNet.extend(BasicSearch, iNet.ui.grid.Search, {
      intComponent: function () {
        var _this = this;
        this.$inputSearch = this.getEl().find('.grid-search-input');
        this.$btnSearch = this.getEl().find('[data-action-search="search"]');
        this.getEl().on('click', '[data-action]', function () {
          var $this = $(this);
          var action = this.getAttribute('data-action');
          _this.setType(this.getAttribute('data-name'));
          $this.parent().find('button[data-action]').removeClass('active');
          $this.addClass('active');
          if (iNet.isFunction(_this[action]))
            _this[action].call(_this, $this);
        });
      },
      getUrl: function () {
        return this.url;
      },
      getId: function () {
        return this.id;
      },
      setType: function (type) {
        this.type = type;
      },
      getType: function () {
        return this.type || 'SMS';
      },
      getData: function () {
        return {
          keyword: this.$inputSearch.val(),
          type: this.getType(),
          pageSize: 20,
          pageNumber: 0
        };
      },
      search: function () {
        this.$btnSearch.trigger('click');
      }
    });
    this.grid = new iNet.ui.grid.Grid({
      id: this.gridId,
      url: url.list,
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
    iNet.ui.template.TemplateNotifyList.superclass.constructor.call(this);
    this.grid.on('click', function (record) {
      _this.fireEvent('open', record || {}, _this);
    });
    this.toolbar.CREATE.click(function () {
      _this.fireEvent('new', _this);
    });
  };
  iNet.extend(iNet.ui.template.TemplateNotifyList, iNet.ui.onegate.OnegateWidget, {
    /**
     * @returns {iNet.ui.grid.Grid}
     */
    getGrid: function () {
      return this.grid;
    }
  });
});

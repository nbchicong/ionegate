// #PACKAGE: superadmin-office-search
// #MODULE: OfficeSearchService
$(function () {
  iNet.ns('iNet.ui.onegate.superadmin');
  iNet.ui.onegate.superadmin.OfficeLocationSearchWidget = function (config) {
    this.id = 'office-search-widget';
    var __config = config || {};
    iNet.apply(this, __config);

    iNet.ui.onegate.superadmin.OfficeLocationSearchWidget.superclass.constructor.call(this) ;
    var me= this;
    this.$toolbar = {
      CREATE: $('#office-search-btn-create')
    };

    var confirmDeleteDialog= null;

    var createConfirmDeleteDialog = function() {
      if(!confirmDeleteDialog) {
        confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'office-modal-confirm-delete',
          title: iNet.resources.dialog.delete_title,
          content: iNet.resources.dialog.delete_content,
          buttons: [
            {
              text: iNet.resources.message.button.ok,
              cls: 'btn-danger',
              icon: 'icon-ok icon-white',
              fn: function () {
                var __data = this.getData();
                if (!iNet.isEmpty(__data.uuid)) {
                  this.hide();
                  $.postJSON(iNet.getUrl('onegate/office/delete'), {
                    office: __data.uuid
                  }, function () {
                    me.getGrid().remove(__data.uuid);
                  }, {mask: this.getMask(), msg: iNet.resources.ajaxLoading.deleting});
                }
              }
            },
            {
              text: iNet.resources.message.button.cancel,
              icon: 'icon-remove',
              fn: function () {
                this.hide();
              }
            }
          ]
        });
      }
      return confirmDeleteDialog;
    };

    var __actionButtons = [{
      text: 'Danh sách giao dịch',
      icon: 'icon-list',
      fn: function (record) {
        me.fireEvent('list_paytrans', me, record);
      }
    }, {
      text: iNet.resources.message.button.edit,
      icon: 'icon-pencil',
      fn: function (record) {
        me.fireEvent("edit", me, record);
      }
    }, {
      text: iNet.resources.message.button.del,
      icon: 'icon-trash',
      labelCls: 'label label-important',
      fn: function (record) {
        var dialog = createConfirmDeleteDialog();
        dialog.setData(record);
        dialog.show();
      }
    }];

    var dataSource = new iNet.ui.grid.DataSource({
      columns: [{
          property: 'brief',
          label: 'Mã đơn vị',
          width: 100,
          sortable: true,
          type: 'label'
        }, {
          property: 'name',
          label: 'Tên đơn vị',
          sortable: true,
          type: 'label'
        }, {
          property: 'address1',
          label: 'Địa chỉ',
          width: 300,
          sortable: true,
          type: 'label'
        }, {
          property: 'enable',
          label: 'Trạng thái',
          width: 80,
          sortable: true,
          type: 'switches',
          typeCls: 'switch-4',
          onChange: function (record, status) {
            $.postJSON(iNet.getUrl('onegate/office/enable'), {
              uuid: record.uuid,
              enable: status
            }, function () {
            }, {
              mask: me.getMask(),
              msg: iNet.resources.ajaxLoading.saving
            });
          }
        }, {
          label: '',
          type: 'action',
          separate: '&nbsp;',
          align: 'center',
          buttons: __actionButtons
        }
      ]
    });

    //~~============BASIC SEARCH ====================
    var OfficeBasicSearch = function() {
      this.id = 'office-basic-search';
      this.url = iNet.getUrl('onegate/office/list');
      OfficeBasicSearch.superclass.constructor.call(this);
    };
    iNet.extend(OfficeBasicSearch, iNet.ui.grid.AbstractSearchForm, {
      intComponent : function() {
        this.$keyword = $('#office-basic-search-txt-keyword');
      },
      getData : function() {
        var __data = {
          district:'',
          ward: '',
          keyword: this.$keyword.val() || '',
          pageSize: 10,
          pageNumber: 0
        };
        return __data;
      }
    });

    this.grid = new iNet.ui.grid.Grid({
      id: 'office-grid-id',
      url: iNet.getUrl('onegate/office/list'),
      dataSource: dataSource,
      idProperty: 'uuid',
      remotePaging: true,
      basicSearch: OfficeBasicSearch,
      convertData: function (data) {
        var __data = data || {};
        me.getGrid().setTotal(__data.total);
        return __data.items;
      }
    });

    this.grid.on('click', function (record) {
      me.fireEvent('prosignedlist', me, record);
    });

    this.grid.on('selectionchange', function(sm) {
      var __records = sm.getSelection();
      FormUtils.showButton(me.$toolbar.PROSIGNED, __records.length == 1);
    });

    this.$toolbar.CREATE.click(function () {
      this.fireEvent('create', this);
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.onegate.superadmin.OfficeLocationSearchWidget, iNet.ui.onegate.OnegateWidget, {
    getGrid: function(){
      return this.grid;
    }
  });
});
// #PACKAGE: ionegate-superadmin-wf-node-attribute
// #MODULE: SuperadminWorkflowNodeAttributeService
$(function () {
  var url = {
    list: iNet.getUrl('onegate/nodeattr/list'),
    save: iNet.getUrl('onegate/nodeattr/create'),
    update: iNet.getUrl('onegate/nodeattr/update'),
    del: iNet.getUrl('onegate/nodeattr/delete')
  };

  var $toolbar = {
    CREATE: $('#btn-wf-node-create')
  };

  var confirmDeleteDialog = null;
  var createConfirmDeleteDialog = function () {
    if (!confirmDeleteDialog) {
      confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
        id: 'modal-confirm-delete',
        title: iNet.resources.message.dialog_confirm_title,
        content: iNet.resources.message.dialog_confirm_content,
        buttons: [
          {
            text: iNet.resources.message.button.ok,
            cls: 'btn-danger',
            icon: 'icon-ok icon-white',
            fn: function () {
              var __data = this.getData();
              if (!iNet.isEmpty(__data.uuid)) {
                this.hide();
                $.postJSON(url.del, {
                  uuid: __data.uuid
                }, function () {
                  grid.remove(__data.uuid);
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

  var dataSource = new DataSource({
    columns: [
      {
        property: 'name',
        label: 'Tên hiển thị',
        type: 'text',
        align: 'left'
      },
      {
        property: 'variable',
        label: 'Tên biến',
        sortable: true,
        type: 'text',
        width: 200,
        validate: function (v) {
          if (iNet.isEmpty(v))
            return "Tên biến không được để trống";
        }
      },
      {
        property: 'type',
        label: 'Loại đối tượng',
        sortable: true,
        type: 'select',
        width: 150,
        editData: [
          {value: 'TEXTFIELD', text: 'TEXTFIELD'},
          {value: 'DATETIME', text: 'DATETIME'},
          {value: 'CHECKBOX', text: 'CHECKBOX'}
        ]
      },
      {
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [
          {
            text: iNet.resources.message.button.edit,
            icon: 'icon-pencil',
            fn: function (record) {
              grid.edit(record.uuid);
            }
          },
          {
            text: iNet.resources.message.button.del,
            icon: 'icon-trash',
            labelCls: 'label label-important',
            fn: function (record) {
              var dialog = createConfirmDeleteDialog();
              dialog.setData(record);
              dialog.show();
            }
          }
        ]
      }
    ]
  });

  var grid = new iNet.ui.grid.Grid({
    id: 'wf-grid-id',
    url: url.list,
    dataSource: dataSource,
    idProperty: 'uuid',
    convertData: function (data) {
      return data.items;
    }
  });

  grid.on('save', function (data) {
    var __data = data || {};
    $.postJSON(url.save, __data, function (result) {
      var __result = result || {};
      grid.insert(__result);
      grid.newRecord();
    }, {mask: grid.getMask(), msg: iNet.resources.ajaxLoading.saving});
  });

  grid.on('update', function (data, odata) {
    var __data = data || {};
    $.postJSON(url.update, __data, function (result) {
      var __result = result || {};
      grid.update(__result);
      grid.commit();
    }, {mask: grid.getMask(), msg: iNet.resources.ajaxLoading.saving});
  });

  $toolbar.CREATE.click(function () {
    grid.newRecord();
  });
}); 
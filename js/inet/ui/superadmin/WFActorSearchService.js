// #PACKAGE: ionegate-superadmin-wf-actor-search
// #MODULE: SuperadminWorkflowActorSearchService
$(function () {
  iNet.ns('iNet.ui.onegate.superadmin');
  iNet.ui.onegate.superadmin.WorkflowActorSearchService = function (config) {
    this.url = {
      list: iNet.getUrl('cloud/workflow/alias/list'),
      del: iNet.getUrl('cloud/workflow/alias/delete')
    };
    this.$id = $("#div-wf-search");
    this.display = true;
    var __config = config || {};

    iNet.apply(this, __config);
    var self = this;
    this.$element = this.$id;
    this.$toolbar = {
      CREATE: $('#btn-wf-actor-create')
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
                  $.postJSON(self.url.del, {
                    procedure: __data.uuid
                  }, function () {
                    self.grid.remove(__data.uuid);
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
          property: 'code',
          label: 'Mã đại diện',
          sortable: true,
          type: 'label',
          width: 150
        },
        {
          property: 'name',
          label: 'Tên đại diện',
          type: 'label'
        },
        {
          property: 'defactor',
          label: 'Mặc định',
          type: 'label',
          width: 80
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
                self.fireEvent("edit", record);
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

    this.grid = new iNet.ui.grid.Grid({
      id: 'wf-grid-id',
      url: self.url.list,
      dataSource: dataSource,
      idProperty: 'uuid',
      firstLoad: true,
      convertData: function (data) {
        var __items = data.items || [];
        var __temp;
        for (var i = 0; i < __items.length; i++) {
          __temp = __items[i].attribute || {};
          __items[i].name = __temp.name;
          __items[i].position = __temp.position;
          __items[i].brief = __temp.brief;
        }
        return __items;
      }
    });

    this.grid.on('click', function (record) {
      self.fireEvent("edit", record);
    });
    // action -----------------------------------------------
    this.$toolbar.CREATE.click(function () {
      self.fireEvent("create");
    });

    // init widget
    (function () {
      (self.display) ? self.show() : self.hide();
    }());
  };

  iNet.extend(iNet.ui.onegate.superadmin.WorkflowActorSearchService, iNet.ui.onegate.OnegateWidget, {
    addRow: function (data) {
      this.grid.insert(data);
    },
    updateRow: function (data) {
      this.grid.update(data)
    },
    reload: function () {
      this.grid.reload();
    }

  });
});
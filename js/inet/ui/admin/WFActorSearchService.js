// #PACKAGE: ionegate-admin-wf-actor-search
// #MODULE: WorkflowActorSearchService
$(function () {
  iNet.ui.admin.WorkflowActorSearchService = function (config) {
    this.url = {
      list: iNet.getXUrl('onegate/dept/actorlist')
    };
    this.$id = $("#div-wf-search");
    this.display = true;
    var __config = config || {};
    iNet.apply(this, __config);
    var self = this;
    this.$element = this.$id;
    this.$toolbar = {
      RELOAD: $('#btn-wf-actor-refresh')
    };
    var dataSource = new DataSource({
      columns: [
        {
          property: 'code',
          label: 'Tên nhóm đại diện',
          sortable: true,
          type: 'label'
        },
        {
          property: 'brief',
          label: 'Mô tả',
          type: 'label'
        },
        {
          property: 'defactor',
          label: 'Mặc định',
          width: 100,
          sortable: true,
          type: 'label'
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


    this.$toolbar.RELOAD.click(function () {
      this.grid.load();
    }.createDelegate(this));

    // init widget
    (function () {
      (self.display) ? self.show() : self.hide();
    }());
  };

  iNet.extend(iNet.ui.admin.WorkflowActorSearchService, iNet.ui.onegate.OnegateWidget, {
    addRow: function (data) {
      this.grid.insert(data);
    },
    updateRow: function (data) {
      this.grid.update(data);
      this.grid.commit();
    },
    reload: function () {
      this.grid.reload();
    }
  });
});
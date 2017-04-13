// #PACKAGE: superadmin-plugin
// #MODULE: PluginWidget
$(function() {
  iNet.ui.admin.PluginWidget = function(config){
    var __config = config || {};
    iNet.apply(this, __config);
    this.id = 'plugin-widget';
    this._resource = iNet.resources.onegate.admin.holiday || {};

    iNet.ui.admin.PluginWidget.superclass.constructor.call(this) ;
    var me = this;
    var confirmDeleteDialog = null;

    this.$toolbar = {
      CREATE : $('#plugin-btn-create')
    };
    this.$formUpload = $('#plugin-form');
    this.$fileUpload = $('#fileUpload');
    this.$toolbar.CREATE.on('click', function(){
      this.$fileUpload.trigger('click');
    }.createDelegate(this));

    this.$fileUpload.on('change', function() {
      var loading;
      this.$formUpload.ajaxSubmit({
        beforeSubmit: function (arr, $form, options) {
          loading = new iNet.ui.form.LoadingItem({
            maskBody: me.$formUpload,
            msg: iNet.resources.ajaxLoading.saving
          });
        },
        success: function (result) {
          if(loading){
            loading.destroy();
          }
          var __result = result || {};
          var __record = me.grid.getById(__result.uuid) || {};
          if(__result.type=='ERROR') {
            me.showMessage('error', 'Tải ứng dụng', String.format('Có lỗi xảy ra khi tải ứng dụng lên hệ thống !'));
          } else {
            if (iNet.isEmpty(__record.uuid)) {
              me.grid.insert(__result);
              me.showMessage('success', 'Hồ sơ', String.format('Ứng dụng "<b>{0}</b>" đã được tải lên thành công !', __result.name));
            } else {
              me.showMessage('warning', 'Cảnh báo', String.format('Ứng dụng "<b>{0}</b>" đã tồn tại trong hệ thống !', __record.name));
            }
          }
          me.$fileUpload.val('');
        }
      });
    }.createDelegate(this));

    var createConfirmDeleteDialog = function(){
      if(!confirmDeleteDialog) {
        confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id : 'plugin-modal-confirm-delete',
          title : iNet.resources.dialog.delete_title,
          content : iNet.resources.dialog.delete_content,
          buttons : [{
            text : iNet.resources.message.button.ok,
            cls : 'btn-danger',
            icon : 'icon-ok icon-white',
            fn : function() {
              var __data= this.getData();
              var __uuid = __data.uuid;
              if (!iNet.isEmpty(__uuid)) {
                this.hide();
                $.postJSON(iNet.getUrl('onegate/pluginapp/unregistered'), {
                  plugin: __uuid
                }, function() {
                  me.grid.remove(__uuid);
                },{mask: this.getMask() , msg: iNet.resources.ajaxLoading.deleting});
              }
            }
          }, {
            text : iNet.resources.message.button.cancel,
            icon : 'icon-remove',
            fn : function() {
              this.hide();
            }
          }]
        });
      }
      return confirmDeleteDialog;
    };

    var __columns = [{
      label :'STT',
      type : 'rownumber',
      align: 'center',
      width : 50
    },{
      property : 'name',
      label : 'Tên ứng dụng',
      sortable : true,
      type : 'label',
      width: 200
    },{
      property : 'brief',
      label : 'Mô tả',
      sortable : true,
      type : 'label'
    },{
      property : 'modelName',
      label : 'Cơ sở dữ liệu',
      sortable : true,
      type : 'label',
      width: 200
    },{
      property : 'bucketData',
      label : 'Phân vùng dữ liệu',
      sortable : true,
      type : 'label',
      width: 150
    },{
      label : '',
      type : 'action',
      separate: '&nbsp;',
      align: 'center',
      buttons : [{
        text : iNet.resources.message.button.del,
        icon : 'icon-trash',
        labelCls: 'label label-important',
        fn : function(record) {
          var dialog =  createConfirmDeleteDialog();
          dialog.setData(record);
          dialog.show();
        }
      }]
    }];

    var dataSource = new DataSource({
      columns : __columns
    });

    this.grid = new iNet.ui.grid.Grid({
      id : 'plugin-grid-id',
      url : iNet.getUrl('onegate/pluginapp/list'),
      dataSource : dataSource,
      idProperty : 'uuid',
      convertData : function(data) {
        return data.items
      }
    });
  };
  iNet.extend(iNet.ui.admin.PluginWidget, iNet.ui.onegate.OnegateWidget, {
    getGrid: function(){
      return this.grid;
    }
  });

  //~========================EXECUTE SERVICE========================
  var pluginWidget=new iNet.ui.admin.PluginWidget();
  pluginWidget.show();
});

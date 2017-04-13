// #PACKAGE: superadmin-gateway
// #MODULE: GatewayService
$(function() {
  iNet.ns('iNet.ui.superadmin');
  iNet.ui.superadmin.GatewayWidget = function(config) {
    var __config = config || {};
    iNet.apply(this, __config);
    this.id = 'gateway-widget';

    iNet.ui.superadmin.GatewayWidget.superclass.constructor.call(this);
    var me = this;


    this.$toolbar = {
      CREATE : $('#gateway-btn-create')
    };

    var confirmDeleteDialog= null, notify= null;

    var createNotify = function () {
      if (!notify) {
        notify = new iNet.ui.form.Notify();
      }
      return notify;
    };

    var createConfirmDeleteDialog = function() {
      if(!confirmDeleteDialog) {
        confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'gateway-modal-confirm-delete',
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
                  $.postJSON(iNet.getUrl('onegate/getway/delete'), {
                    uuid: __data.uuid
                  }, function () {
                    me.getGrid().remove(__data.uuid);
                    var __notify = createNotify();
                    __notify.setTitle('Xóa');
                    __notify.setType('success');
                    __notify.setContent('Cấu hình đã được xóa !');
                  }, {mask: this.getMask(), msg: iNet.resources.ajaxLoading.deleting});
                }
              }
            },{
              text: iNet.resources.message.button.cancel,
              icon: 'icon-remove',
              cls: 'btn-success',
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
      columns : [{
          property : 'name',
          label : 'Tên đơn vị',
          sortable : true,
          type : 'text',
          valueField: 'value',
          width: 150,
          validate : function(v) {
              if (iNet.isEmpty(v))
                return 'Tên đơn vị không được để rỗng';
            }
      },{
        property : 'getwayService',
        label : 'Dịch vụ',
        sortable : true,
        type : 'select',
        editData: services || [],
        valueField: 'value',
        displayField: 'text',
        width: 150
      },{
        property : 'enpoint',
        label : 'Đường dẫn kết nối',
        sortable : true,
        type : 'text',
        validate : function(v) {
          if (iNet.isEmpty(v))
            return 'Đường dẫn kết nối không được để rỗng';
        }
      },{
        property : 'clientKey',
        label : 'Khóa kết nối',
        sortable : true,
        type : 'text',
        width: 150
      },{
        property : 'secretKey',
        label : 'Khóa bí mật',
        sortable : true,
        type : 'text',
        width: 150
      },{
        label : '',
        type : 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons : [{
          text : iNet.resources.message.button.edit,
          icon : 'icon-pencil',
          labelCls: 'label label-info',
          fn : function(record) {
            me.grid.edit(record.uuid);
          }
        },
        {
            text: 'Kiểm tra trực tuyến',
            icon: 'icon-globe',
            labelCls: 'label label-success',
            fn: function (record) {
              $.postJSON(iNet.getUrl('onegate/getway/check'), {
                uuid: record.uuid
              }, function (data) {
                var __notify = createNotify();
              __notify.setTitle('Kiểm tra trực tuyến');
              
              var online = "đang trực tuyến";
              
              if(data !== 'online'){
                online = "không trực tuyến";
                __notify.setType('error');
              }else{
                __notify.setType('success');
              }
                
                __notify.setContent('Dịch vụ ' + record.getwayService + " với đường dẫn " + record.enpoint + " " + online );
                __notify.show();
              }, {mask: me.grid.getMask(), msg: "Đang kiểm tra trực tuyến..."});
            }
        },{
          text: iNet.resources.message.button.del,
          icon: 'icon-trash',
          labelCls: 'label label-important',
          fn: function (record) {
            var dialog = createConfirmDeleteDialog();
            dialog.setData(record);
            dialog.show();
          }
        }]
      }]
    });

    this.grid = new iNet.ui.grid.Grid({
      id : 'gateway-grid-id',
      url : iNet.getUrl('onegate/getway/endpoints'),
      dataSource : dataSource,
      idProperty : 'uuid',
      convertData : function(data) {
        return data.items
      }
    });

    this.grid.on('update', function(data, odata) {
      var __data = data || {};
      var __odata = odata || {};
      var grid= me.getGrid();
      $.postJSON(iNet.getUrl('onegate/getway/update'), __data, function(result) {
        var __result = result || {};
        var __notify = createNotify();
        __notify.setTitle('Cập nhật');
        if(!iNet.isEmpty(__result.uuid)) {
          grid.update(__result);
          grid.commit();
          __notify.setType('success');
          __notify.setContent('Cấu hình đã được cập nhật !');
        } else {
          __notify.setType('error');
          __notify.setContent('Có lỗi xảy ra khi lưu dữ liệu !');
        }
        __notify.show();
      },{mask: grid.getMask() , msg: iNet.resources.ajaxLoading.saving});
    });


    this.grid.on('save', function(data) {
      var __data = data || {};
      var grid= me.getGrid();
      $.postJSON(iNet.getUrl('onegate/getway/create'), __data, function(result) {
        var __result = result || {};
        var __notify = createNotify();
        __notify.setTitle('Tạo mới');
        if(!iNet.isEmpty(__result.uuid)) {
          grid.insert(__result);
          grid.newRecord();
          __notify.setType('success');
          __notify.setContent('Cấu hình liên thông kết nối đã được lưu !');
        } else {
          __notify.setType('error');
          __notify.setContent('Có lỗi xảy ra khi lưu dữ liệu !');
        }
        __notify.show();
      },{mask: grid.getMask() , msg: iNet.resources.ajaxLoading.saving});
    });

    this.$toolbar.CREATE.on('click', function(){
      this.grid.newRecord();
    }.createDelegate(this));

  };

  iNet.extend(iNet.ui.superadmin.GatewayWidget, iNet.ui.Widget, {
    getGrid: function(){
      return this.grid;
    }
  });

  //~========================EXECUTE SERVICE========================
  var widget=new iNet.ui.superadmin.GatewayWidget();
  widget.show();
});
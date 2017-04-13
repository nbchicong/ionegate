// #PACKAGE: superadmin-dictionary
// #MODULE: Dictionary
$(function () {
  iNet.ns('iNet.ui.onegate.superadmin');
  iNet.ui.onegate.superadmin.DictionaryWidget = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);
    this.id = 'dictionary-widget';
    iNet.ui.onegate.superadmin.DictionaryWidget.superclass.constructor.call(this);
    var me = this;
    var confirmDeleteDialog = null;

    this.url = {
      list: iNet.getUrl('onegate/dictionary/list'),
      save: iNet.getUrl('onegate/dictionary/create'),
      update: iNet.getUrl('onegate/dictionary/update'),
      del: iNet.getUrl('onegate/dictionary/delete')
    };

    this.$typeSelect = $('#dictionary-select-type');
    this.$keySelect = $('#dictionary-select-key');
    this.$areaContainer = $('#dictionary-select-area-container');
    this.$districtContainer = $('#dictionary-select-district-container');
    this.$selectDistrict = $('#dictionary-select-district');
    this.$selectCity = $('#dictionary-select-city');

    this.$toolbar = {
      CREATE: $('#dictionary-btn-create'),
      DELETE: $('#dictionary-btn-delete'),
      IMPORT : $('#dictionary-btn-import')
    };

    this.$formUpload = $('#dictionary-import-form');
    this.$fileUpload = $('#fileUpload');

    this.$toolbar.IMPORT.on('click', function(){
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
          if(iNet.isEmpty(__record.uuid)) {
            me.grid.insert(__result);
            me.showMessage('success', 'Hồ sơ',  String.format('Dữ liệu "<b>{0}</b>" đã được kết nhập thành công !', __result.name));
          } else {
            me.showMessage('warning', 'Cảnh báo', String.format('Dữ liệu "<b>{0}</b>" đã tồn tại trong hệ thống !', __record.name));
          }
          me.$fileUpload.val('');
        }
      });
    }.createDelegate(this));


    var createConfirmDeleteDialog = function () {
      if (!confirmDeleteDialog) {
        confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'modal-confirm-delete',
          title: iNet.resources.message.dialog_confirm_title,
          content: iNet.resources.message.dialog_confirm_content,
          buttons: [{
            text: iNet.resources.message.button.ok,
            cls: 'btn-primary',
            icon: 'icon-ok icon-white',
            fn: function () {
              var __data = this.getData();
              var __ids = __data.ids || [];
              var __grid = __data.grid;
              if (__ids.length > 0) {
                this.hide();
                $.postJSON(me.url.del, {
                  uuid: __ids.join(',')
                }, function () {
                  if(__grid) {
                    __grid.remove(__ids.join(';'));
                  }
                }, {mask: this.getMask(), msg: iNet.resources.ajaxLoading.deleting});
              }
            }
          }, {
            text: iNet.resources.message.button.cancel,
            icon: 'icon-remove',
            fn: function () {
              this.hide();
            }
          }]
        });
      }
      return confirmDeleteDialog;
    };

    this.$typeSelect.on('change', function () {
      me.loadKeys($(this).val());
    });

    this.$selectCity.on('change', function () {
      var __type= me.$keySelect.val();
      var __value= $(this).val();
      if(__type=='DISTRICT') {
        me.grid.setParams({type: 'DISTRICT' , referID: __value});
        me.grid.load();
      } else if(__type=='WARD') {
        me.loadDistrict(__value);
      }
    });

    this.$selectDistrict.on('change', function () {
      var __value= $(this).val();
      me.grid.setParams({type: 'WARD' , referID: __value});
      me.grid.load();
    });

    this.$keySelect.on('change', function () {
      var __type= $(this).val();
      var __data = {type: __type};
      switch (__type) {
        case 'DISTRICT':
          me.$areaContainer.show();
          me.$districtContainer.hide();
          me.loadCity();
          break;
        case 'WARD':
          me.$areaContainer.show();
          me.$districtContainer.show();
         me.loadCity();
          break;
        default :
          me.$areaContainer.hide();
          me.$districtContainer.hide();
          me.grid.setParams(__data);
          me.grid.load();

      }
    });

    var dataSource = new DataSource({
      columns: [{
        type: 'selection',
        align: 'center',
        width: 30
      },{
        property: 'code',
        label: 'Giá trị',
        sortable: true,
        type: 'text',
        width: 200,
        validate: function (v) {
          if (iNet.isEmpty(v))
            return 'Giá trị không được để rỗng';
        }
      }, {
        property: 'name',
        label: 'Mô tả',
        sortable: true,
        type: 'text',
        validate: function (v) {
          if (iNet.isEmpty(v))
            return 'Mô tả không được để rỗng';
        }
      }, {
        property: 'order',
        label: 'Thứ tự hiển thị',
        sortable: true,
        align: 'right',
        width: 125,
        type: 'text',
        validate: function (v) {
          if (!iNet.isEmpty(v) && !iNet.isNumber(Number(v)))
            return 'Thứ tự hiển thị phải kiểu số nguyên';
        }
      }, {
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [{
          text: iNet.resources.message.button.edit,
          icon: 'icon-pencil',
          fn: function (record) {
            me.getGrid().edit(record.uuid);
          }
        }, {
          text: iNet.resources.message.button.del,
          icon: 'icon-trash',
          labelCls: 'label label-important',
          fn: function (record) {
            var dialog = createConfirmDeleteDialog();
            dialog.setData({ids: [record.uuid], grid: me.getGrid()});
            dialog.show();
          }
        }]
      }]
    });

    this.grid = new iNet.ui.grid.Grid({
      id: 'dictionary-grid-id',
      url: this.url.list,
      dataSource: dataSource,
      firstLoad: false,
      idProperty : 'uuid',
      convertData : function(data) {
        return data.items
      }
    });

    this.grid.on('save', function (data) {
      var __data = data || {};
      __data.type = me.$keySelect.val();
      if(__data.type=='DISTRICT') {
        __data.referID = me.$selectCity.val();
      } else if(__data.type=='WARD') {
        __data.referID = me.$selectDistrict.val();
      }
      $.postJSON(me.url.save, __data, function (result) {
        var __result = result || {};
        me.getGrid().insert(__result);
        me.getGrid().newRecord();
      }, {mask: me.getEl(), msg: iNet.resources.ajaxLoading.saving});
    });

    this.grid.on('update', function (data, odata) {
      var __data = data || {};
      var __odata = odata || {};
      __data.type = me.$keySelect.val();
      if(__data.type=='DISTRICT') {
        __data.referID = me.$selectCity.val();
      } else if(__data.type=='WARD') {
        __data.referID = me.$selectDistrict.val();
      } else {
        __data.referID = __odata.referID;
      }
      $.postJSON(me.url.update, __data, function (result) {
        var __result = result || {};
        var grid = me.getGrid();
        grid.update(__result);
        grid.commit();
      }, {mask: me.getEl(), msg: iNet.resources.ajaxLoading.saving});
    });

    this.grid.on('selectionchange', function (sm, data) {
      var records = sm.getSelection();
      FormUtils.showButton(me.$toolbar.DELETE, records.length > 0);
    });

    this.$toolbar.CREATE.click(function () {
      this.getGrid().newRecord();
    }.createDelegate(this));

    this.$toolbar.DELETE.click(function () {
      var grid =  me.getGrid();
      var sm = grid.getSelectionModel();
      var records = sm.getSelection();
      var __ids = [];
      for (var i = 0; i < records.length; i++) {
        var __record = records[i];
        __ids.push(__record.uuid);
      }
      var dialog = createConfirmDeleteDialog();
      dialog.setData({ids: __ids, grid: grid});
      dialog.show();
    });

    //first load
    this.$typeSelect.trigger('change');
  };
  iNet.extend(iNet.ui.onegate.superadmin.DictionaryWidget, iNet.ui.onegate.OnegateWidget, {
    getGrid: function () {
      return this.grid;
    },
    fillKeysToSelect: function (keys) {
      var __keys = keys || [];
      var __options = '';
      for (var i = 0; i < __keys.length; i++) {
        var __key = __keys[i] || {};
        __options += String.format('<option value="{0}">{1}</option>', __key.value, __key.text);
      }
      this.$keySelect.html(__options).trigger('change');
    },
    loadKeys: function (type) {
      var __type = type || 'area';
      var __keys = [];
      switch (__type.toLowerCase()) {
        case 'area':
          __keys = [{
            value: 'CITY',
            text: 'Tỉnh/Thành phố'
          }, {
            value: 'DISTRICT',
            text: 'Quận/Huyện'
          }, {
            value: 'WARD',
            text: 'Phường/Xã'
          }];
          break;
        case 'nation':
          __keys = [{
            value: 'TYPE',
            text: 'Loại hồ sơ'
          },{
            value: 'SERVICE',
            text: 'Dịch vụ'
          },{
            value: 'ETHENIC',
            text: 'Dân tộc'
          },{
            value: 'RELIGIOUS',
            text: 'Tôn giáo'
          },{
            value: 'NATION',
            text: 'Quốc tịch'
          },{
            value: 'TITLE',
            text: 'Chức danh'
          },{
            value: 'POSITION',
            text: 'Chức vụ'
          },{
            value: 'SEX',
            text: 'Giới tính'
          }];
          break;
      }
      this.fillKeysToSelect(__keys);
    },
    loadCity: function(fn){
      var me= this;
      var __fn = fn || iNet.emptyFn;
      this.$selectCity.empty();
      $.getJSON(this.url.list, {type: 'CITY'},function(result){
        var __result = result || {};
        var __items = __result.items || [];
        var __options = '';
        for (var i = 0; i < __items.length; i++) {
          var __item = __items[i] || {};
          __options += String.format('<option value="{0}">{1}</option>', __item.uuid, __item.name);
        }
        me.$selectCity.html(__options).trigger('change');
        __fn();
      });
    },
    loadDistrict: function(referID, fn){
      var me= this;
      var __fn = fn || iNet.emptyFn;
      this.$selectDistrict.empty();
      $.getJSON(this.url.list, {type: 'DISTRICT' , referID: referID},function(result){
        var __result = result || {};
        var __items = __result.items || [];
        var __options = '';
        for (var i = 0; i < __items.length; i++) {
          var __item = __items[i] || {};
          __options += String.format('<option value="{0}">{1}</option>', __item.uuid, __item.name);
        }
        me.$selectDistrict.html(__options).trigger('change');
        __fn();
      });
    }
  });

  //~========================EXECUTE SERVICE========================
  var dictionaryWidget = new iNet.ui.onegate.superadmin.DictionaryWidget();
  dictionaryWidget.show();
}); 
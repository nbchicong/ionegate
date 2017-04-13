// #PACKAGE: admin-payment-config
// #MODULE: ProcedureSearchService
$(function () {
  iNet.ns('iNet.ui.onegate.admin');
  iNet.ui.onegate.admin.PaymentConfigWidget = function (config) {
    this.id = 'payment-config-widget';
    var __config = config || {};
    iNet.apply(this, __config);
    this.$mask = $('#payment-config-body');
    this.$input = {
      methodName: $('#payment-config-select-method-name'),
      status: $('#payment-config-select-status'),
      providerId: $('#payment-config-txt-provider-id'),
      providerSecretkey: $('#payment-config-txt-provider-secretkey')
    };

    iNet.ui.onegate.admin.PaymentConfigWidget.superclass.constructor.call(this);

    var me = this;
    this.$toolbar = {
      SAVE: $('#payment-config-btn-save')
    };

    this.methodSelect = new iNet.ui.form.select.Select({
      id: this.$input.methodName.prop('id'),
      multiple: false,
      allowClear: true,
      data: this.getPayments(),
      idValue: function (item) {
        var __item = item || {};
        return __item.uuid;
      },
      initSelection: function (array) {
        return array;
      },
      formatSelection: function (item) {
        var __item = item || {};
        return __item.uuid;
      },
      formatResult: function (item) {
        var __item = item || {};
        return String.format('<span><i class="icon-credit-card"></i> {0}</span>', __item.uuid);
      }
    });

    this.validate = new iNet.ui.form.Validate({
      id: this.id,
      rules: [{
        id: 'payment-config-select-method-container',
        validate: function () {
          if (me.methodSelect) {
            var __method = me.methodSelect.getValue() || {};
            if (iNet.isEmpty(__method)) {
              return 'Tên phương thức không được để rỗng';
            }
          }
        }
      }, {
        id: this.$input.providerId.prop('id'),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return 'ID nhà cung cấp không được để rỗng';
        }
      }, {
          id: this.$input.providerSecretkey.prop('id'),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return 'Khóa bí mật không được để rỗng';
          }
        }
      ]
    });

    var datasource = new iNet.ui.grid.DataSource({
      columns: [{
        property: 'name',
        label: 'Tên thuộc tính',
        sortable: true,
        type: 'label',
        width: 300
      }, {
        property: 'value',
        label: 'Giá trị thuộc tính',
        type: 'text',
        sortable: true
      }, {
        type: 'action',
        align: 'center',
        buttons: [{
          text: iNet.resources.message.button.edit,
          icon: 'icon-pencil',
          fn: function (record) {
            me.grid.edit(record.name);
          }
        }]
      }]
    });

    this.grid = new iNet.ui.grid.Grid({
      id: 'grid-properties-id',
      url: iNet.getUrl('payment/methodinf'),
      dataSource: datasource,
      idProperty: 'name',
      firstLoad: false
    });
    this.grid.loadData([]);

    this.$toolbar.SAVE.click(function () {
      var me =this;
      if(this.validate.check()) {
        $.postJSON(iNet.getXUrl('onegate/deptchart/payment'), this.getData(),function(result){
          var __result = result || {};
          me.setData(__result.payment || {});
          me.showMessage('success','Thanh toán điện tử', 'Thông tin cấu hình đã được lưu !');
        },{mask: me.$mask, msg: iNet.resources.ajaxLoading.saving});
      }
    }.createDelegate(this));

    this.load();//first load
  };
  iNet.extend(iNet.ui.onegate.admin.PaymentConfigWidget, iNet.ui.onegate.OnegateWidget, {
    getPayments: function () {
      return payments || [];
    },
    getData: function () {
      var __data = {
        merchantId: this.$input.providerId.val(),
        merchantKey: this.$input.providerSecretkey.val(),
        method: this.methodSelect.getValue(),
        primary: false,
        expired: this.$input.status.val()
      };
      return __data;
    },
    setData: function(data){
      var __data = data || {};
      this.$input.providerId.val(__data.merchantId);
      this.$input.providerSecretkey.val(__data.merchantKey);
      this.$input.status.val(__data.expired ? 'EXPIRED': 'AVAILABLE');
      this.methodSelect.setData({uuid: __data.method, text: __data.method});
      //this.grid.setParams(__data);
      //this.grid.reload();
    },
    load: function () {
      var me = this;
      $.getJSON(iNet.getXUrl('onegate/dept/member'), function (result) {
        var __result = result || {};
        me.setData(__result.payment || {});
        me.ownerData = __result;
      },{mask: me.$mask, msg: iNet.resources.ajaxLoading.loading});
    }
  });
  //=====================
  var widget = new iNet.ui.onegate.admin.PaymentConfigWidget();
  widget.show();

});
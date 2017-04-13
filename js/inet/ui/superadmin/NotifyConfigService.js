// #PACKAGE: superadmin-notify-config
// #MODULE: NotifyConfigService
$(function () {
  iNet.ns('iNet.ui.onegate.superadmin');
  iNet.ui.onegate.superadmin.NotifyConfigWidget = function (config) {
    var that = this, __config = config || {};
    iNet.apply(this, __config);
    this.id = this.id || 'notify-config-widget';
    this.$input = {
      smsUrl: $('#notify-config-sms-txt-url'),
      smsAccount: $('#notify-config-sms-txt-account'),
      smsPass: $('#notify-config-sms-txt-pass'),
      smsCondition: $('[name="notify-config-sms-select-status"]'),
      emailAccount: $('#notify-config-email-txt-account'),
      emailPass: $('#notify-config-email-txt-pass'),
      emailCondition: $('[name="notify-config-email-select-status"]')
    };

    iNet.ui.onegate.superadmin.NotifyConfigWidget.superclass.constructor.call(this);

    this.$toolbar = {
      SAVE: $('#notify-config-btn-save')
    };

    this.validateSMS = new iNet.ui.form.Validate({
      id: this.id,
      rules: [{
        id: this.$input.smsUrl.prop('id'),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return 'Địa chỉ không được để rỗng';
        }
      }, {
        id: this.$input.smsAccount.prop('id'),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return 'Tài khoản không được để rỗng';
        }
      }, {
        id: this.$input.smsUrl.prop('id'),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return 'Mật khẩu không được để rỗng';
        }
      }]
    });
    this.validateEmail = new iNet.ui.form.Validate({
      id: this.id,
      rules: [{
          id: this.$input.emailAccount.prop('id'),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return 'Tài khoản không được để rỗng';
          }
      }, {
        id: this.$input.emailPass.prop('id'),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return 'Mật khẩu không được để rỗng';
        }
      }]
    });

    this.$toolbar.SAVE.click(function () {
      if (that.validateSMS.check() && that.validateEmail.check()) {
        $.when(that.__excService('sms', 'save'), that.__excService('email', 'save')).done(function (sms, email) {
          if (sms[0] && sms[0].uuid && email[0] && email[0].uuid)
            that.showMessage('success', 'Cấu hình', 'Cập nhật cấu hình <b>SMS & EMAIL</b> thành công!');
        });
      }
    });
    this.load();//first load
  };
  iNet.extend(iNet.ui.onegate.superadmin.NotifyConfigWidget, iNet.ui.onegate.OnegateWidget, {
    __excService: function (service, nameFn) {
      return this[String.format('__{0}{1}', service, nameFn)]();
    },
    __smssave: function () {
      return $.postJSON(iNet.getUrl('onegate/notifyconfig/update'), this.getSMSData(), function (result) {});
    },
    __emailsave: function () {
      return $.postJSON(iNet.getUrl('onegate/notifyconfig/update'), this.getEmailData(), function (result) {});
    },
    getSMSData: function () {
      var __condition = [];
      var __cbxName = this.$input.smsCondition.attr('name');
      $('[name="' + __cbxName + '"]:checked').each(function () {
        __condition.push($(this).val());
      });
      return {
        username: this.$input.smsAccount.val(),
        password: this.$input.smsPass.val(),
        endpoint: this.$input.smsUrl.val(),
        conditions: __condition.join(','),
        type: 'SMS'
      };
    },
    getEmailData: function () {
      var __condition = [];
      var __cbxName = this.$input.emailCondition.attr('name');
      $('[name="' + __cbxName + '"]:checked').each(function () {
        __condition.push($(this).val());
      });
      return {
        username: this.$input.emailAccount.val(),
        password: this.$input.emailPass.val(),
        conditions: __condition.join(','),
        type: 'EMAIL'
      };
    },
    setSMSData: function(data){
      var __condition = data.conditions.split(',');
      var __cbxName = this.$input.smsCondition.attr('name');
      this.$input.smsUrl.val(data.endpoint);
      this.$input.smsAccount.val(data.username);
      this.$input.smsPass.val(data.password);
      this.$input.smsCondition.each(function () {
        this.checked = false;
      });
      for (var i = 0; i < __condition.length; i ++) {
        $('input[name="' + __cbxName + '"][value="' + __condition[i] + '"]')[0].checked = true;
      }
    },
    setEmailData: function (data) {
      var __condition = data.conditions.split(',');
      var __cbxName = this.$input.emailCondition.attr('name');
      this.$input.emailAccount.val(data.username);
      this.$input.emailPass.val(data.password);
      this.$input.emailCondition.each(function () {
        this.checked = false;
      });
      for (var i = 0; i < __condition.length; i ++) {
        $('input[name="' + __cbxName + '"][value="' + __condition[i] + '"]')[0].checked = true;
      }
    },
    load: function () {
      var that = this;
      $.getJSON(iNet.getUrl('onegate/notifyconfig/view'), {type: 'SMS'}, function (smsConfig) {
        that.setSMSData(smsConfig);
      });
      $.getJSON(iNet.getUrl('onegate/notifyconfig/view'), {type: 'EMAIL'}, function (emailConfig) {
        that.setEmailData(emailConfig);
      });
    }
  });
  //=====================
  var widget = new iNet.ui.onegate.superadmin.NotifyConfigWidget();
  widget.show();

});
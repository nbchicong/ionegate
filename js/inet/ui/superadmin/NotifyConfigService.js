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
      smsBegin: $('#notify-config-sms-begin'),
      smsEnd: $('#notify-config-sms-end'),
      emailUrl: $('#notify-config-email-txt-url'),
      emailPort: $('#notify-config-email-txt-port'),
      emailSender: $('#notify-config-email-txt-sender'),
      emailAccount: $('#notify-config-email-txt-account'),
      emailPass: $('#notify-config-email-txt-pass'),
      emailCondition: $('[name="notify-config-email-select-status"]'),
      emailBegin: $('#notify-config-email-begin'),
      emailEnd: $('#notify-config-email-end')
    };

    iNet.ui.onegate.superadmin.NotifyConfigWidget.superclass.constructor.call(this);

    this.$toolbar = {
      SAVE: $('#notify-config-btn-save')
    };

    // init sms limit time
    this.smsBegin = this.$input.smsBegin.datepicker({
    }).on('changeDate', function(ev) {
      that.smsBegin.hide();
      that.$input.smsEnd[0].focus();
    }).data('datepicker');

    this.smsEnd = this.$input.smsEnd.datepicker({
      onRender: function(date) {
        return date.valueOf() <= that.smsBegin.date.valueOf() ? 'disabled' : '';
      }
    }).on('changeDate', function(ev) {
      that.smsEnd.hide();
    }).data('datepicker');

    // init email limit time
    this.emailBegin = this.$input.emailBegin.datepicker({
    }).on('changeDate', function(ev) {
      that.emailBegin.hide();
      that.$input.emailEnd[0].focus();
    }).data('datepicker');

    this.emailEnd = this.$input.emailEnd.datepicker({
      onRender: function(date) {
        return date.valueOf() <= that.emailBegin.date.valueOf() ? 'disabled' : '';
      }
    }).on('changeDate', function(ev) {
      that.emailEnd.hide();
    }).data('datepicker');

    // validate sms
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
    // validate email
    this.validateEmail = new iNet.ui.form.Validate({
      id: this.id,
      rules: [{
          id: this.$input.emailUrl.prop('id'),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return 'Địa chỉ không được để rỗng';
          }
      }, {
          id: this.$input.emailSender.prop('id'),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return 'Tài khoản người gửi không được để rỗng';
          }
      }, {
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
        timeStart: (this.$input.smsBegin.val() !== -1) ? new Date(this.smsBegin.date).getTime() : this.$input.smsBegin.val(),
        timeEnd: (this.$input.smsEnd.val() !== -1) ? new Date(this.smsEnd.date).getTime() : this.$input.smsEnd.val(),
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
        endpoint: this.$input.emailUrl.val(),
        port: this.$input.emailPort.val(),
        sender: this.$input.emailSender.val(),
        username: this.$input.emailAccount.val(),
        password: this.$input.emailPass.val(),
        timeStart: (this.$input.emailBegin.val() !== -1) ? new Date(this.emailBegin.date).getTime() : this.$input.emailBegin.val(),
        timeEnd: (this.$input.emailEnd.val() !== -1) ? new Date(this.emailEnd.date).getTime() : this.$input.emailEnd.val(),
        conditions: __condition.join(','),
        type: 'EMAIL'
      };
    },
    setSMSData: function(data){
      var __condition = data.conditions.split(',');
      var __cbxName = this.$input.smsCondition.attr('name');
      this.$input.smsUrl.val(data.endpoint || '');
      this.$input.smsAccount.val(data.username || '');
      this.$input.smsPass.val(data.password || '');

      if (!data.timeStart || data.timeStart === -1 || data.timeStart === 0)
        this.$input.smsBegin.val(data.timeStart || 0);
      else
        this.smsBegin.setValue(new Date(data.timeStart));

      if (!data.timeEnd || data.timeEnd === -1 || data.timeEnd === 0)
        this.$input.smsEnd.val(data.timeEnd || 0);
      else
        this.smsEnd.setValue(new Date(data.timeEnd));

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
      this.$input.emailUrl.val(data.endpoint || '');
      this.$input.emailPort.val(data.port || '');
      this.$input.emailSender.val(data.sender || '');
      this.$input.emailAccount.val(data.username || '');
      this.$input.emailPass.val(data.password || '');

      if (!data.timeStart || data.timeStart === -1 || data.timeStart === 0)
        this.$input.emailBegin.val(data.timeStart || 0);
      else
        this.emailBegin.setValue(new Date(data.timeStart));

      if (!data.timeEnd || data.timeEnd === -1 || data.timeEnd === 0)
        this.$input.emailEnd.val(data.timeEnd || 0);
      else
        this.emailEnd.setValue(new Date(data.timeEnd));

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
  var a = {
    "firmContext": "inet",
    "username": "nbccong@inetcloud.vn",
    "$or": [{"appContext": {"$exists": false}}, {"$and": [{"appContext": {"$size": 1}}, {"appContext": {"$in": ["marketplace"]}}]}]
  };

  var b = {
    "tenNguoiDaiDien": "TEST-LT-DVC-001",
    "gioiTinh": 1,
    //"maThuTuc": "005001",
    //"ngayXuLy": "28/08/2017 10:53:53",
    "ngayCapCMND": "31/08/2007",
    //"maTrangThai": "VERIFIED",
    "maNguoiTiepNhanHoSo": "TNQBT",
    "dienThoai": "987654321",
    "soCMND": "098765432",
    //"maLinhVuc": "005",
    "hanXuLy": "19/09/2017 17:00:00",
    "noiDungMoRong": {
      "thongTinChuyenPhat": {
        "nguoiNhans": [{
          "chidinh": 1,
          "emailNhan": "nguyenthanhcong@gmail.com",
          "diaChiNhan": {
            "tenDuong": "Truong Dinnh",
            "diaChi": "123 Truong Dinh, Phuong 14",
            "quanHuyen": {"ten": "Quan 5", "ma": "730"},
            "phuong": {"ten": "5", "ma": "26010"},
            "thanhPho": {"ten": "'Ho Chi Minh", "ma": "75"}
          },
          "nguoiNhan": "Nguyen Thanh Cong",
          "dienThoaiNhan": "0987654345"
        }, {
          "chidinh": 2,
          "emailNhan": "nguyenthanhnhan@gmail.com",
          "diaChiNhan": {
            "tenDuong": "Truong Dinnh",
            "diaChi": "123 Truong Dinh, Phuong 14",
            "quanHuyen": {"ten": "Quan 5", "ma": "730"},
            "phuong": {"ten": "5", "ma": "26010"},
            "thanhPho": {"ten": "'Ho Chi Minh", "ma": "75"}
          },
          "nguoiNhan": "Nguyá»\u0085n Thanh Cong",
          "dienThoaiNhan": "0987654346"
        }],
        "nguoiLH": "Nguyen Thanh Cong",
        "diaChiLH": {
          "quanHuyen": {"ten": "Quan 5", "ma": "730"},
          "phuong": {"ten": "22", "ma": "26011"},
          "thanhPho": {"ten": "Ho Chi Minh", "ma": "75"}
        },
        "loaiDichVu": "Nhan Ho So - Chuyen Tra KQ",
        "dienThoaiLH": "0823234343"
      }, "hoSoKemTheos": []
    },
    "diaChi": {
      "tenDuong": "Truong Dinnh",
      "diaChi": "123 Truong Dinh, Phuong 14",
      "quanHuyen": {"ten": "Quan 5", "ma": "730"},
      "phuong": {"ten": "5", "ma": "26010"},
      "thanhPho": {"ten": "'Ho Chi Minh", "ma": "75"}
    },
    "ngaySinh": "11/07/1989",
    "tenNguoiTiepNhanHoSo": "Nguyễn Văn Ngô",
    //"soBienNhan": "77702201700500086"
  };
});
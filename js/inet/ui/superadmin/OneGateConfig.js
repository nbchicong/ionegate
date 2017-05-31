/**
 * #PACKAGE: super-global-config
 * #MODULE: OneGateConfig
 */
/**
 * Copyright (c) 2017 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 10:57 AM 19/05/2017.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file OneGateConfig.js
 */
$(function () {
  /**
   * @class iNet.ui.superadmin.OneGateConfig
   * @extends iNet.ui.onegate.OnegateWidget
   */
  var url = {
    load: iNet.getUrl('onegate/config/service/load'),
    save: iNet.getUrl('onegate/config/service/save')
  };
  iNet.ns('iNet.ui.superadmin.OneGateConfig');
  iNet.ui.superadmin.OneGateConfig = function (options) {
    var _this = this;
    iNet.apply(this, options || {});
    this.id = this.id || 'global-config-widget';
    this.input = {
      sqlHost: $('#onegate-config-txt-sql-host'),
      sqlPort: $('#onegate-config-txt-sql-port'),
      sqlDbName: $('#onegate-config-txt-sql-db'),
      sqlUser: $('#onegate-config-txt-sql-user'),
      sqlUserPassword: $('#onegate-config-txt-sql-password'),
      jndiName: $('#onegate-config-txt-jndi'),
      knobStickSlot: $('#onegate-config-txt-knobstick-slot'),
      threadSleep: $('#onegate-config-txt-thread-sleep'),
      extUploadAccepted: $('#onegate-config-txt-ext-upload'),
      maxSizeUpload: $('#onegate-config-txt-max-size-upload')
    };
    this.toolbar = {
      SAVE: $('#global-config-btn-save')
    };
    iNet.ui.superadmin.OneGateConfig.superclass.constructor.call(this);
    this.toolbar.SAVE.click(function () {
      _this.save();
    });
    this.load();
  };
  iNet.extend(iNet.ui.superadmin.OneGateConfig, iNet.ui.onegate.OnegateWidget, {
    load: function () {
      var _this = this;
      $.getJSON(url.load, {ac: 'load'}, function (result) {
        if (result.uuid)
          _this.setData(result);
      });
    },
    save: function () {
      var _this = this;
      $.postJSON(url.save, this.getData(), function (result) {
        if (result.success)
          _this.showMessage('success', 'Cấu hình chung', 'Lưu cấu hình thành công');
        else
          _this.showMessage('success', 'Cấu hình chung', 'Xảy ra lỗi trong quá trình lưu cấu hình.');
      });
    },
    setData: function (data) {
      this.input.sqlHost.val(data.sqlHost || '');
      this.input.sqlPort.val(data.sqlPort || '');
      this.input.sqlDbName.val(data.sqlDbName || '');
      this.input.sqlUser.val(data.sqlUser || '');
      this.input.sqlUserPassword.val(data.sqlUserPassword || '');
      this.input.jndiName.val(data.jndiName || '');
      this.input.knobStickSlot.val(data.knobStickSlot || 10);
      this.input.threadSleep.val(data.threadSleep || 2000);
      this.input.extUploadAccepted.val(data.extUploadAccepted || '');
      this.input.maxSizeUpload.val(data.maxSizeUpload || 31457280);
    },
    getData: function () {
      return {
        sqlHost: this.input.sqlHost.val(),
        sqlPort: this.input.sqlPort.val(),
        sqlDbName: this.input.sqlDbName.val(),
        sqlUser: this.input.sqlUser.val(),
        sqlUserPassword: this.input.sqlUserPassword.val(),
        jndiName: this.input.jndiName.val(),
        knobStickSlot: this.input.knobStickSlot.val(),
        threadSleep: this.input.threadSleep.val(),
        extUploadAccepted: this.input.extUploadAccepted.val(),
        maxSizeUpload: this.input.maxSizeUpload.val()
      };
    }
  });
  new iNet.ui.superadmin.OneGateConfig();
});

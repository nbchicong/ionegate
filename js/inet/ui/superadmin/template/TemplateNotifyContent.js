/**
 * #PACKAGE: template-notify-content
 * #MODULE: TemplateNotifyContent
 */
/**
 * Copyright (c) 2016 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 5:17 PM 20/09/2016.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file TemplateNotifyContent.js
 */
$(function () {
  /**
   * @class iNet.ui.template.TemplateNotifyContent
   * @extends iNet.ui.onegate.OnegateWidget
   */
  var __currentTplId = null;
  var __editor = null;
  var EMAIL_TYPE = 'EMAIL';
  var SMS_TYPE = 'SMS';
  var url = {
    create: iNet.getUrl('onegate/templatenotify/create'),
    update: iNet.getUrl('onegate/templatenotify/update'),
    trash: iNet.getUrl('onegate/templatenotify/delete')
  };
  var $form = {
    name: $('#txt-tpl-name'),
    status: $('#cbb-tpl-status'),
    type: $('#cbb-tpl-type'),
    content: $('#txt-tpl-content')
  };
  function __getData() {
    var __params = {
      name: $form.name.val(),
      status: $form.status.val(),
      type: $form.type.val()
    };
    if (__currentTplId)
      __params = iNet.apply(__params, {uuid: __currentTplId});
    if (__params.type == EMAIL_TYPE && __editor)
      __params = iNet.apply(__params, {
        content: __editor.getCode()
      });
    else
      __params = iNet.apply(__params, {
        content: $form.content.val()
      });
    return __params;
  }
  function __trash(uuid) {
    if (!uuid) return;
    var _this = this;
    this.confirmDialog('Xóa mẫu thông báo!', 'Bạn có chắc chắn đồng ý xóa?', function () {
      $.postJSON(url.trash, _this.dialog.getOptions(), function (result) {
        if (result.type == 'ERROR')
          _this.showMessage('error', 'Xóa mẫu thông báo!', 'Xóa mẫu thông báo xảy ra lỗi!');
        if (result.uuid) {
          __currentTplId = null;
          _this.showMessage('success', 'Xóa mẫu thông báo!', 'Xóa mẫu thông báo thành công!');
          _this.dialog.hide();
          _this.fireEvent('back', result.uuid, _this);
        }
      }, {
        msg: iNet.resources.ajaxLoading.deleting,
        mask: _this.getMask()
      });
    });
    this.dialog.setOptions({uuid: uuid});
    this.dialog.show();
  }
  function __create() {
    var _this = this;
    $.postJSON(url.create, __getData(), function (result) {
      if (result.type == 'ERROR')
        _this.showMessage('error', 'Tạo mẫu thông báo!', 'Tạo mới mẫu thông báo xảy ra lỗi!');
      if (result.uuid) {
        __currentTplId = result.uuid;
        _this.showMessage('success', 'Tạo mẫu thông báo!', 'Tạo mới mẫu thông báo thành công!');
        _this.fireEvent('created', result, _this);
      }
    }, {
      msg: iNet.resources.ajaxLoading.creating,
      mask: _this.getMask()
    });
  }
  function __update() {
    var _this = this;
    $.postJSON(url.update, __getData(), function (result) {
      if (result.type == 'ERROR')
        _this.showMessage('error', 'Cập nhật mẫu thông báo!', 'Cập nhật mẫu thông báo xảy ra lỗi!');
      if (result.uuid) {
        __currentTplId = result.uuid;
        _this.showMessage('success', 'Cập nhật mẫu thông báo!', 'Cập nhật mẫu thông báo thành công!');
        _this.fireEvent('updated', result, _this);
      }
    }, {
      msg: iNet.resources.ajaxLoading.updating,
      mask: _this.getMask()
    });
  }
  function __initEditor() {
    var value = $form.content.val();
    if (!__editor)
      __editor = $form.content.redactor({
        autoresize: false,
        minHeight: 300,
        mobile: true,
        lang: 'vi',
        source: true
      });
    if (value)
      __editor.setCode(value);
  }
  function __destroyEditor() {
    if (__editor) {
      var value = __editor.getCode();
      __editor.destroyEditor();
      __editor = null;
      $form.content.val(value.replace(/(<([^>]+)>)/ig, '')).removeAttr('style');
    }
  }
  iNet.ns('iNet.ui.template.TemplateNotifyContent');
  iNet.ui.template.TemplateNotifyContent = function (options) {
    var _this = this;
    this.id = this.id || 'tpl-notify-content-wg';
    iNet.apply(this, options || {});
    iNet.ui.template.TemplateNotifyContent.superclass.constructor.call(this);
    this.getEl().on('click', '[data-action]', function () {
      var action = this.getAttribute('data-action');
      if (iNet.isFunction(_this[action]))
        _this[action].call(_this, $(this));
    });
    $form.type.on('change', function () {
      if (this.value == EMAIL_TYPE)
        __initEditor();
      else if (this.value == SMS_TYPE)
        __destroyEditor();
    });
  };
  iNet.extend(iNet.ui.template.TemplateNotifyContent, iNet.ui.onegate.OnegateWidget, {
    setForm: function (data) {
      __currentTplId = data.uuid || null;
      $form.name.val(data.name || '');
      if (data.type == SMS_TYPE) {
        __destroyEditor();
        $form.content.val(data.content || '');
      }
      if (data.type == EMAIL_TYPE) {
        $form.content.val(data.content || '');
        __initEditor();
      }
      $form.type.val(data.type.toUpperCase());
      $form.status.val(data.status.toUpperCase());
    },
    clear: function () {
      __currentTplId = null;
      $form.name.val('');
      $form.content.val('');
      if (__editor)
        __editor.setCode('');
    },
    back: function () {
      __currentTplId = null;
      this.hide();
      this.fireEvent('back', null, this);
    },
    save: function () {
      if (__currentTplId)
        __update.call(this);
      else
        __create.call(this);
    },
    trash: function () {
      __trash.call(this, __currentTplId);
    }
  });
});

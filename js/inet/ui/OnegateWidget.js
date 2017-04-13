// #PACKAGE: ionegate-ui
// #MODULE: OnegateWidget
/**
 * Created by ntvy on 4/15/14.
 */
$(function () {

  /**
   * @class iNet.ui.onegate.OnegateWidget
   * @extends iNet.ui.Widget
   */
  iNet.ns('iNet.ui.onegate.OnegateWidget');
  iNet.ui.onegate.OnegateWidget = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);
    this.notify= null;
    this.dialog=null;
    iNet.ui.onegate.OnegateWidget.superclass.constructor.call(this);
  };
  iNet.extend(iNet.ui.onegate.OnegateWidget, iNet.ui.Widget, {
    showMessage: function (type, title, content) {
      if (!this.notify) {
        this.notify = new iNet.ui.form.Notify();
      }
      this.notify.setType(type || 'error');
      this.notify.setTitle(title|| '');
      this.notify.setContent(content || '');
      this.notify.show();
    },
    confirmDialog : function(title, content, okFn) {
      var __okFn = iNet.isFunction(okFn) ? okFn.createDelegate(this) : iNet.emptyFn;
      if(!this.dialog) {
        this.dialog = new iNet.ui.dialog.ModalDialog({
          id: iNet.generateId(),
          title: title || '',
          content: content || '',
          buttons: [
            {
              text: iNet.resources.message.button.ok,
              cls: 'btn-primary',
              icon: 'icon-ok icon-white',
              fn: __okFn
            },{
              text: iNet.resources.message.button.cancel,
              cls: 'btn-default',
              icon: 'icon-remove',
              fn: function () {
                this.hide();
              }
            }
          ]
        });
      }
      return this.dialog;
    },
    hasPattern: function () {
      return !iNet.isEmpty(iNet.pattern);
    },
    responseHandler: function (result, callback) {
      var __result = result || {};
      if (!(__result.type == 'ERROR'))
        callback && callback(__result);
      else {
        var msg = iNet.resources.message.errors || {};
        var errors = __result.errors || [];
        for (var i = 0; i < errors.length; i++) {
          var error = errors[i];
          this.showMessage(__result.type.toLowerCase(), msg[error.field] || error.field, msg[error.message] || error.message);
        }
      }
    }
  });

});
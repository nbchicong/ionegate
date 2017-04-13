// #PACKAGE: onegate-plugin
// #MODULE: PluginView
$(function () {
  iNet.ns('iNet.ui.onegate.plugin');
  iNet.ui.onegate.plugin.PluginView = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);
    this.id = this.id || 'plugin-view';
    iNet.ui.onegate.plugin.PluginView.superclass.constructor.call(this);

    this.$noselected = $('#plugin-view-no-selected');
    this.$content = $('#plugin-view-dp');
    this.$iframe = $('#plugin-view-frame-body');
    this.$loading = $('#plugin-view-loading-text');
    this.$btnFullScreen = $('#plugin-view-full');
    this.$actionToolbar = $('#plugin-view-toobar');
    var me = this;
    this.$btnFullScreen.on('click', function(){
      if(this.isFullScreen()) {
        this.viewNormal();
      } else {
        this.viewFull();
      }
    }.createDelegate(this));

    this.$toolbar = {
      CREATE: $('#plugin-view-btn-create'),
      SAVE: $('#plugin-view-btn-save'),
      UPLOAD: $('#plugin-view-btn-upload'),
      DELETE: $('#plugin-view-btn-delete')
    };

    this.$formUpload = $('#plugin-form-upload');
    this.$fileUpload = $('#fileUpload');

    this.plugin = new iNet.ui.onegate.Plugin({
      taskId: this.taskId
    });
    this.plugin.on('submit', function (wg, data) {
      var __data = data || {};
      var __plugin = __data.plugin || {};
      FormUtils.showButton(me.$toolbar.UPLOAD, !iNet.isEmpty(__plugin.id));
      me.pluginId =__plugin.id;
      me.fireEvent('saved', wg, data);
    });

    this.$toolbar.UPLOAD.on('click', function(){
      this.$fileUpload.trigger('click');
    }.createDelegate(this));

    this.$toolbar.SAVE.on('click', function () {
      this.plugin.submit();
    }.createDelegate(this));

    this.$fileUpload.on('change', function() {
      var loading;
      var __data = {task: this.getTaskId(), pluginDataID: this.plugin.getPluginId()};
      this.$formUpload.ajaxSubmit({
        data: __data,
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
          var __plugin = __result.plugin || {};
          if(!iNet.isEmpty(__plugin.id)) {
            me.showMessage('success', 'Tải tài liệu', 'Tài liệu đã được tải lên thành công !');
          } else {
            me.showMessage('error', 'Tải tài liệu', 'Có lỗi khi tải tài liệu !');
          }
          me.$fileUpload.val('');
          me.plugin.fillAttachment(__result.attachments || []);
        }
      });
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.onegate.plugin.PluginView, iNet.ui.onegate.OnegateWidget, {
    getMask: function(){
      return this.getEl();
    },
    setHeight: function(h){
      this.getEl().height(h);
    },
    clear: function(){
      this.$actionToolbar.find('button').hide();
      this.$content.hide();
      this.$noselected.show();
    },
    getTaskId: function(){
      return this.taskId;
    },
    getPluginId: function(){
      return this.pluginId;
    },
    viewFull: function () {
      this.fireEvent('beforeresize', this);
      var $el = this.getEl();
      var __normalCls = $el.attr('data-normal');
      var __fullCls = $el.attr('data-full');

      $('div.messageView').removeClass(__normalCls).addClass(__fullCls);
      this.fullScreen= true;
      var $button = this.$btnFullScreen;
      var $icon = $($button.find('i').get(0));
      $icon.removeClass('icon-fullscreen');
      $icon.addClass('icon-resize-small');
      $button.attr('data-status', 'full');
    },
    viewNormal: function () {
      this.fireEvent('beforeresize', this);
      var $el = this.getEl();
      var __normalCls = $el.attr('data-normal');
      var __fullCls = $el.attr('data-full');
      $('div.messageView').removeClass(__fullCls).addClass(__normalCls);
      this.fullScreen= false;
      var $button = this.$btnFullScreen;
      var $icon = $($button.find('i').get(0));
      var status = $button.attr('data-status');
      $icon.removeClass('icon-resize-small');
      $icon.addClass('icon-fullscreen');
      $button.attr('data-status', 'normal');
    },
    isFullScreen: function(){
      return this.fullScreen;
    },
    newRecord: function(){
      this.$noselected.hide();
      this.$content.show();
      this.$loading.hide();
      this.$actionToolbar.show();
      this.plugin.clearData();
      this.plugin.show();
      FormUtils.showButton(this.$toolbar.SAVE, true);
      FormUtils.showButton(this.$toolbar.UPLOAD, false);
    },
    load: function(id){
      var me= this;
      this.$noselected.hide();
      this.$content.show();
      this.$loading.show();
      this.$actionToolbar.hide();
      this.plugin.hide();
      $.getJSON(iNet.getXUrl('onegate/plugindata/view'), {task: this.getTaskId(),pluginDataID: id},function(result){
        var __result = result || {};
        me.$loading.hide();
        var __plugin =  __result.plugin || {};
        FormUtils.showButton(me.$toolbar.SAVE, true);
        FormUtils.showButton(me.$toolbar.UPLOAD, !iNet.isEmpty(__plugin.id));
        me.pluginId =__plugin.id;
        me.$actionToolbar.show();
        me.plugin.setData(__result);
        me.plugin.show();

      },{mask: me.getMask(), msg: '&nbsp;'});
    }
  });
});
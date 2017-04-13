// #PACKAGE: onegate-plugin
// #MODULE: Plugin
$(function () {
  iNet.ns('iNet.ui.onegate');
  iNet.ui.onegate.Plugin = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);// apply configuration
    this.id = this.id || 'plugin-form-body';
    iNet.ui.onegate.Plugin.superclass.constructor.call(this);

    var __rules = [];
    var $controls = this.getEl().find('[data-valid]');
    for (var i = 0; i < $controls.length; i++) {
      var $control = $($controls.get(i));
      var __type = $control.attr('data-valid');
      var __msg = $control.attr('data-'+ __type +'-msg');
      switch (__type) {
        case 'required':
          __rules.push({
            id: $control.prop('id'),
            validate: function (v) {
              if (iNet.isEmpty(v))
                return __msg || 'Ô dữ liệu không được để rỗng';
            }});
          break;
      }
    }

    this.pluginValidate = new iNet.ui.form.Validate({
      id: this.id,
      rules: __rules
    });
    this.applyUI();
  };
  iNet.extend(iNet.ui.onegate.Plugin, iNet.Component, {
    getEl: function () {
      return $.getCmp(this.id);
    },
    getMask: function(){
      return this.getEl();
    },
    getTaskId: function(){
      return this.taskId;
    },
    setPluginId: function(id){
      this.pluginId = id;
    },
    getPluginId: function(){
      return this.pluginId;
    },
    setProcedureId: function(procedureId){
      this.procedureId = procedureId;
    },
    getProcedureId: function(){
      return this.procedureId;
    },
    setModelName: function(name){
      this.modelName = name;
    },
    getModelName: function(){
      return this.modelName;
    },
    submit: function (data) {
      var me = this;
      var loading = null;
      var __data = data || {};
      if (this.pluginValidate.check()) {
        __data.task = __data.task || this.getTaskId();
        __data.pluginDataID = __data.pluginDataID || this.getPluginId();
        this.getEl().ajaxSubmit({
          url: iNet.getXUrl('onegate/plugindata/update'),
          data: __data,
          beforeSubmit: function (arr, $form, options) {
            me.fireEvent('beforesubmit', arr, $form, options, me);
            loading = new iNet.ui.form.LoadingItem({
              maskBody: me.getEl(),
              msg: '&nbsp;'
            });
          },
          success: function (result) {
            var __result = result || {};
            if (loading) {
              loading.destroy();
            }
            if(__result.type=='ERROR') {
              me.createNotifyMessage('error', 'Hồ sơ', 'Có lỗi xảy ra khi lưu dữ liệu');
            } else {
              me.setData(__result);
              me.createNotifyMessage('success', 'Hồ sơ', 'Hồ sơ đã được lưu !');
              me.fireEvent('submit', me,__result);
            }
          }
        });
      }
    },
    clear: function () {
      this.getEl().empty();
    },
    focus: function () {
      this.getEl().find('input:first').focus();
    },
    createNotifyMessage: function (type, title, content) {
      if (!this.notify) {
        this.notify = new iNet.ui.form.Notify();
      }
      this.notify.setType(type);
      this.notify.setTitle(title);
      this.notify.setContent(content || "");
      this.notify.show();
    },
    applyUI: function(){
      var $container = this.getEl();
      var $files = $container.find('input[type="file"]');
      for (var i = 0; i < $files.length; i++) {
        new iNet.ui.form.FileUpload({
          $element: $($files.get(i))
        })
      }
      var $dates = $container.find('input[data-type=date]');
      for (var j = 0; j < $dates.length; j++) {
        var $date = $($dates.get(j));
        new iNet.ui.form.DatePicker({
          $element: $date,
          format:  $date.attr('data-date-format') || 'dd/mm/yyyy'
        });
      }
    },
    isAllowDeleteFile: function(){
      return this.allowDeleteFile;
    },
    setAllowDeleteFile:function(v){
      this.allowDeleteFile = v;
    },
    hide: function(){
      this.getEl().hide();
    },
    show: function(){
      this.getEl().show();
    },
    setData: function(data) {
      var __data = data || {};
      this.clearData();
      this.setModelName(__data.modelName);
      var __plugin = __data.plugin || {};
      this.setPluginId(__plugin.id);
      this.setProcedureId(__plugin.procedure);
      var me = this;
      $.each(__plugin, function(i, v) {
        var $control = me.getEl().find(String.format('[name="{0}_{1}"]', me.getModelName(), i));
        if($control.length>0) {
          //var __tagName = ($control.prop("tagName") || '').toLowerCase();
          var __type = $control.attr('data-type');
          switch (__type) {
            case 'date':
               $control.val(v>0 ? new Date(v).format('d/m/Y') : '');
              break;
            default:
              $control.val(v);
              break;
          }
        }
      });
      this.fillAttachment(__data.attachments || []);
      this.pluginValidate.check();
    },
    clearData: function(){
      this.setPluginId(null);
      this.setProcedureId(null);
      this.getEl().find('input,select').val('');
      this.getEl().find('input:first').focus();
      this.fillAttachment([]);
    },
    fillAttachment: function (attachments) {
      var me = this;
      var __attachments = attachments.items || [];
      me.attachments =__attachments;
      var $table = $('#plugin-view-files-container');
      if(__attachments.length<1){
        $table.remove();
        return;
      }
      if ($table.length<1) {
        var __html = '<div id="plugin-view-files-container" class="col-xs-12 col-sm-12" style="padding: 0px">';
        __html += String.format('<div class="table-header"><i class="icon-paper-clip bigger-110"></i> {0}</div>', iNet.resources.onegate.ticket.xform_file_all);
        __html += '<table class="table table-bordered table-striped">';
        __html += '<thead class="thin-border-bottom">';
        __html += '<tr>';
        __html += '<th style="width: 20px"></th>';
        __html += String.format('<th>{0}</th>', iNet.resources.onegate.ticket.xform_file_name);
        __html += String.format('<th style="width: 120px">{0}</th>', iNet.resources.onegate.ticket.xform_file_size);
        __html += String.format('<th style="width: 150px">{0}</th>', iNet.resources.onegate.ticket.xform_file_created);
        __html += '<th style="width: 30px"></th>';
        __html += '</tr>';
        __html += '</thead>';
        __html += '<tbody></tbody>';
        __html += '</table></div>';
        $table = $(__html);
      }
      var $tbody = $table.find('tbody');
      $tbody.empty();
      for (var i = 0; i < __attachments.length; i++) {
        var __file = __attachments[i] || {};
         var __row = '<tr>';
        __row += String.format('<td><i class="{0}"></td>', iNet.FileFormat.getFileIcon(__file.file));
        __row += String.format('<td><a data-action="view" href="javascript:;">{0}</a></td>', __file.file);
        __row += String.format('<td><span class="label label-success"><strong>{0}</strong></span></td>', iNet.FileFormat.getSize(__file.size));
        __row += String.format('<td>{0}</td>', new Date(__file.created).format('d/m/Y H:i:s'));
        __row += String.format('<td><a data-action="download" href="javascript:;"><span class="label label-success"><i class="icon-download-alt"></i></span></a></td>');
        __row += '</tr>';
        $tbody.append($(__row).data('file', __file));
      }
      $tbody.on('click', '[data-action]', function () {
        var __action = $(this).attr('data-action');
        var $tr = $($(this).parent().parent());
        var __file = $tr.data('file');
        switch (__action) {
          case 'view':
          case 'download':
            window.location.href = iNet.urlAppend(iNet.getXUrl('onegate/plugindata/download'), String.format('uuid={0}&procedure={1}&file={2}', me.getPluginId(),me.getProcedureId(), __file.file));
            break;
        }
      });
      this.$attachment = $table;
      this.getEl().append($table);
    }
  });
});
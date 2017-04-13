// #PACKAGE: xform
// #MODULE: XForm
$(function () {
  iNet.ns('iNet.ui.onegate');
  iNet.ui.onegate.XForm = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);// apply configuration
    this.id = this.id || 'record-xform-id';
    this.disabled = !iNet.isEmpty(this.disabled)? this.disabled : false;
    iNet.ui.onegate.XForm.superclass.constructor.call(this);
    this.validForm = this.getEl().validate({
      errorElement: 'i',
      errorClass: 'help-block',
      focusInvalid: true,
      invalidHandler: function (event, validator) { //display error alert on form submit
        $(this).find('.error:first').focus();
      },
      highlight: function (e) {
      },
      success: function (e, element) {
        var $el = $(element);
        $el.removeClass('tooltip-error').removeClass('error').removeAttr('title');
        $el.tooltip('destroy');
      },
      errorPlacement: function (error, element) {
        var msg = $(error).text();
        var $el = $(element);
        $el.removeClass('tooltip-error').removeClass('error');
        $el.addClass('tooltip-error').addClass('error').attr('title', msg).attr('data-original-title', msg);
        $el.tooltip({placement: $el.data('placement') || 'top'});
      }
    });

  };
  iNet.extend(iNet.ui.onegate.XForm, iNet.Component, {
    getEl: function () {
      return $.getCmp(this.id);
    },
    getMask: function(){
      return this.getEl();
    },
    submit: function (data) {
      var me = this;
      var loading = null;
      if(this.getEl().valid()) {
        this.getEl().ajaxSubmit({
          data: data || {},
          beforeSubmit: function (arr, $form, options) {
            me.fireEvent('beforesubmit', arr, $form, options, me);
          },
          success: function (result) {
            var __result = result || {};
            if(__result.type=='ERROR' || iNet.isEmpty(__result.uuid)) {
              me.createNotifyMessage('error', iNet.resources.onegate.ticket.xform_save, 'Có lỗi xảy ra khi lưu dữ liệu');
            } else {
              me.fireEvent('submit', __result, me);
            }
          }
        });
      } else {
        this.createNotifyMessage('error', iNet.resources.onegate.ticket.xform_save, iNet.resources.onegate.ticket.xform_invalid);
      }
    },
    create: function (data) {
      var __data = data || {};
      var __xform = __data.xform;
      var __exist = iNet.isDefined(__xform);
      if (__exist && !iNet.isEmpty(__xform)) {
        this.getEl().html(__xform || '');
        this.initValidate(__data.validation || {});
        this.initMask(__data.mask);
        this.getEl().attr('action', __data.action);
      } else {
        this.getEl().html(String.format('<div class="red"><i><i class="icon-remove-sign"></i> {0}</i></div>', iNet.resources.onegate.ticket.xform_load_error));
      }
      this.applyUI();
      this.fillAttachment(__data.attachments || []);
      return __exist;
    },
    initValidate: function (validation) {
      var __json = {rules: {}, messages: {}};
      if (!$.isEmptyObject(validation)) {
        __json = eval("(function(){return {" + validation + "};})()");
      }
      var __global = {};
      $.extend(__json.rules, __global.rules);
      this.validForm.settings = $.extend({}, this.validForm.settings, __json);
    },
    initMask: function (mask) {
      var __mark = mask;
      if (!iNet.isEmpty(__mark)) {
        eval("(function(){ " + __mark + "})()");
      }
    },
    clear: function () {
      this.getEl().empty();
    },
    focus: function () {
      this.getEl().find('input:first').focus();
    },
    matchedAttachment: function(params){
      var __params = params || {};
      if(!this.$attachment || this.$attachment.length<0){
        return;
      }
      var $body = this.$attachment.find('tbody');
      $.getJSON(iNet.getXUrl('onegate/dept/attachmatched'), __params, function(result){
        var __result = result || {};
        var __elements = __result.elements || [];
        for(var i =0;i<__elements.length;i++){
          var __element = __elements[i] || {};
          if(!__element.matched) {
            var __fieldName = $.getCmp(__element.name).attr('title') || __element.name;
            var __row = '<tr class="danger">';
            __row += '<td><i class="icon-question-sign"></i></td>';
            __row += String.format('<td>{0}</td>', __fieldName);
            __row += String.format('<td colspan="5"><i>{0}</i></td>',iNet.resources.onegate.ticket.xform_file_empty);
           __row += '</tr>';
            $body.append(__row);
          }
        }
      });
    },
    fillAttachment: function (attachments) {
      var me = this;
      var __attachments = attachments.items || [];
      me.attachments =__attachments;
      if(__attachments.length<1){
        return;
      }
      var __html = '<div class="col-xs-12 col-sm-12" style="padding: 0px">';
      __html +=String.format('<div class="table-header"><i class="icon-paper-clip bigger-110"></i> {0}</div>', iNet.resources.onegate.ticket.xform_file_all);
      __html += '<table class="table table-bordered table-striped">';
      __html += '<thead class="thin-border-bottom">';
      __html += '<tr>';
      __html += '<th style="width: 20px"></th>';
      __html += String.format('<th style="width: 200px">{0}</th>',iNet.resources.onegate.ticket.xform_file_desc);
      __html += String.format('<th>{0}</th>',iNet.resources.onegate.ticket.xform_file_name);
      __html += String.format('<th style="width: 120px">{0}</th>', iNet.resources.onegate.ticket.xform_file_size);
      __html += String.format('<th style="width: 150px">{0}</th>', iNet.resources.onegate.ticket.xform_file_created);
      if(me.isAllowDeleteFile()) {
        __html += '<th style="width: 30px"></th>';
      }
      __html += '<th style="width: 30px"></th>';
      __html += '</tr>';
      __html += '</thead>';
      __html += '<tbody></tbody>';
      __html += '</table></div>';

      var $table = $(__html);
      var $tbody = $table.find('tbody');

      for (var i = 0; i < __attachments.length; i++) {
        var __file = __attachments[i] || {};
        var __fieldName = $.getCmp(__file.fieldname).attr('title') || __file.fieldname;
        __file.fieldname = __fieldName;
        var __row = '<tr>';
        __row += String.format('<td><i class="{0}"></td>', iNet.FileFormat.getFileIcon(__file.file));
        __row += String.format('<td>{0}</td>', __fieldName);
        __row += String.format('<td><a data-action="view" href="javascript:;">{0}</a></td>', __file.file);
        __row += String.format('<td><span class="label label-success"><strong>{0}</strong></span></td>', iNet.FileFormat.getSize(__file.size));
        __row += String.format('<td>{0}</td>', new Date(__file.created).format('d/m/Y H:i:s'));
        if(me.isAllowDeleteFile()) {
          __row += String.format('<td><a data-action="delete" href="javascript:;"><span class="label label-important"><i class="icon-trash"></i></span></a></td>');
        }
          __row += String.format('<td><a data-action="download" href="javascript:;"><span class="label label-success"><i class="icon-download-alt"></i></span></a></td>');
        __row += '</tr>';
        $tbody.append($(__row).data('file', __file));
      }

      $tbody.on('click', '[data-action]', function () {
        var __action = $(this).attr('data-action');
        var $tr = $($(this).parent().parent());
        var __file = $tr.data('file');
        switch (__action) {
          case 'delete':
            if(me.isAllowDeleteFile()) {
              var dialog = me.createConfirmDeleteDialog();
              dialog.setData({$tr: $tr, file: __file});
              dialog.setContent(String.format(iNet.resources.onegate.ticket.xform_delete_file, __file.file));
              dialog.show();
            }
            break;
          case 'view':
            var __data = {
              folder: me.getFolder(), //folder xform
              uuid : me.getUUID(), //ticket id
              file: __file.file,
              docID : __file.uuid,
              mimetype : __file.mimetype
            };
            var __params = iNet.Base64.encodeObject(__data);
            me.fireEvent('openfile',__params,me.attachments);
            break;
          case 'download':
            window.location.href = iNet.urlAppend(iNet.getXUrl('onegate/dept/download'), String.format('folder={0}&uuid={1}&file={2}', me.getFolder(), me.getUUID(), __file.file));
            break;
        }
      });
      this.$attachment = $table;
      this.getEl().append($table);
    },
    createConfirmDeleteDialog: function () {
      var me= this;
      if (!this.confirmDeleteDialog) {
        this.confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'file-modal-confirm-delete',
          title: iNet.resources.dialog.delete_title,
          content: iNet.resources.dialog.delete_content,
          buttons: [
            {
              text: iNet.resources.message.button.ok,
              cls: 'btn-danger',
              icon: 'icon-ok icon-white',
              fn: function () {
                var __data = this.getData();
                var $tr = __data.$tr;
                var __file = __data.file || {};

                if (!iNet.isEmpty(__file.uuid)) {
                  this.hide();
                  $.postJSON(iNet.getXUrl("bucket/object/detach"), {
                    folder: me.getFolder(),
                    uuid: me.getUUID(),
                    files: __file.uuid
                  }, function (result) {
                    var __result = result || {};
                    if (__result.type == 'ERROR') {
                      me.createNotifyMessage('error', iNet.resources.onegate.ticket.xform_delete_file_title, iNet.resources.onegate.ticket.xform_delete_file_error);
                    } else {
                      $tr.remove();
                      me.createNotifyMessage('success', iNet.resources.onegate.ticket.xform_delete_file_title, String.format(iNet.resources.onegate.ticket.xform_delete_file_success, __file.file));
                      if(me.$attachment && $(me.$attachment).find('tbody').find('tr').length<1){
                        me.$attachment.remove();
                      }
                    }
                  }, {mask: this.getMask(), msg: iNet.resources.ajaxLoading.deleting});
                }
              }
            },
            {
              text: iNet.resources.message.button.cancel,
              icon: 'icon-remove',
              fn: function () {
                this.hide();
              }
            }
          ]
        });
      }
      return this.confirmDeleteDialog;
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
    setUUID: function(uuid){
      this.uuid = uuid;
    },
    getUUID: function(){
      return this.uuid;
    },
    setFolder: function(folder){
      this.folder = folder;
    },
    getFolder: function(){
      return this.folder;
    },
    __applyType: function (type, el) {
      var __url = {
        dict: iNet.getUrl('onegate/dictionary/list')
      };
      var $el = $(el);
      switch (type) {
        case 'dict-location' :
          var __dictType = $el.attr("data-dict-location-type") || '';
          var __param = {type: __dictType};
          if (!iNet.isEmpty(__dictType)) {
            $.postJSON(__url.dict, __param, function(result) {
              if (!!result && !!result.items) {
                var __items = result.items , __item;
                for(var i = 0; i < __items.length; i ++){
                  __item = __items[i];
                  $el.append(String.format('<option data-id="{0}" value="{1}">{2}</option>',__item.uuid, __item.code, __item.name));
                }
                $el.trigger('change');
              }
            });
          }
          break;
        case 'dict-location-refer' :
          var __type = $el.attr("data-dict-location-type") || '';
          var __referElementId = $el.attr("data-dict-element-refer") || '';
          $.getCmp(__referElementId).change(function() {
            var $selected = $(this).find('option:selected');
            var __referId = $selected.data('id');
            var __param = {type: __type, referID: __referId};
            $.postJSON(__url.dict, __param, function(result) {
              if(!!result && !!result.items){
                $el.empty();
                var __items = result.items , __item;
                for(var i = 0; i < __items.length; i ++){
                  __item = __items[i];
                  $el.append(String.format('<option data-id="{0}" value="{1}">{2}</option>',__item.uuid, __item.code, __item.name));
                }
                $el.trigger('change');
              }
            });
          });
          break;
      }
    },
    applyUI: function(){
      var that = this;
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
      var $selectors = $container.find("input, select, textarea");
      $selectors.each(function(i, element) {
        var $el = $(element);
        that.__applyType($el.data('type'), $el);
      });
    },
    isAllowDeleteFile: function(){
      return this.allowDeleteFile;
    },
    setAllowDeleteFile:function(v){
      this.allowDeleteFile = v;
    },
    setDisabled: function(v){
      this.disabled = !!v;
      this.getEl().find('input,select,textarea').prop('disabled', !!v);
      if(this.isDisabled()) {
        this.getEl().find('[data-hide-disabled=true]').hide();
      } else {
        this.getEl().find('[data-hide-disabled=true]').show();
      }
    },
    isDisabled: function(){
      return this.disabled;
    },
    disable : function(){
      this.setDisabled(true);
    },
    enable: function(){
      this.setDisabled(false);
    }
  });
});
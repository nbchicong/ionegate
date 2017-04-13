// #PACKAGE: onegate-admin-import-template
// #MODULE: ImportTemplate
iNet.ns(
  "iNet.ui",
  "iNet.ui.admin",
  "iNet.ui.admin.ImportTemplate"
);
$(function() {
  iNet.ui.admin.ImportTemplate = function(config){
    this.id ="div-report-import-template";
    var __config = config || {};
    iNet.apply(this, __config);
    var self = this;
    this.$element = String.format("#{0}", this.id);
    this.fileFormat = '(xls|docx|xlsx)';
    this.fileMaxSize = 1024;
    this.data = {};
    var isFile = true;
    var isMaxSize = true;
    var template = "";
    var deleteIds = "";
    this.url = {
      create: iNet.getUrl('report/template/create'),
      update: iNet.getUrl('report/template/update'),
      del: iNet.getUrl('report/template/delete'),
      load: iNet.getUrl('report/template/list'),
      download : iNet.getUrl("report/template/download")
    };

    this.$toolbar = {
      CREATE: $('#import-template-btn-create'),
      SAVE: $('#import-template-btn-save'),
      SUBMIT: $('#import-template-btn-submit')
    };

    var $grid = $('#report-import-template-search-grid');
    var $frmSubmit = $('#import-template-frm');
    var $containerInputFile = $('#import-template-file');

    this.$input = {
      module: $('#report-import-template-model'),
      name: $('#report-import-template-txt-name'),
      file: $('#import-template-upload-file'),
      template: $('#import-template-value-template'),
      description : $("#report-import-template-txt-description")
    };
    
    this.$input.module.select2({
      placeholder: "Chọn module",
      matcher: function(term, text, opt){
            return text.toUpperCase().indexOf(term.toUpperCase())>=0 || opt.parent("optgroup").attr("label").toUpperCase().indexOf(term.toUpperCase())>=0
      },
      allowClear: true,
      data: this.renderModule()
    });

   // this.renderReportTemplate();

    var createValidate = new iNet.ui.form.Validate({
      id: $frmSubmit.prop('id'),
            rules: [{
        id: self.$input.file.prop("id"),
        validate: function(v) {
          var __files = self.$input.file.get(0).files;
          if (__files.length == 0 ) {

            // create but not check when update attachment
            if($.isEmptyObject(self.data)) {
              self.showMessage("error", iNet.resources.notify.title, self.getText("template_not_null"));
              return self.getText("template_not_null");
            }
          }else{
            if(!isFile){
              self.showMessage("error", iNet.resources.notify.title, self.getText('invalid_type'));
              clearFile();
              self.$input.file.trigger("click");
              return String.format(self.getText('invalid_type'));
            }
            if(!isMaxSize){
              self.showMessage("error", iNet.resources.notify.title, String.format(self.getText("over_file_size"), self.fileMaxSize));
              clearFile();
              self.$input.file.trigger("click");
              return String.format(self.getText("over_file_size"), self.fileMaxSize);
            }
          }
        }
      },{
        id: this.$input.name.prop('id'),
        validate: function(v) {
          if (iNet.isEmpty(v))
            return self.getText("name_not_null");
        }
      }]
    });

    var setData = function(data) {
      var __data = data || [];
      update = true;
      self.data = data;
      self.$input.name.val(__data.name || "");
      self.$input.module.select2('val',__data.module || "");
      self.$input.description.val(__data.description || "");
      self.$input.name.prop("disabled", true);
      self.$input.module.prop("disabled", true);
      $frmSubmit.attr("action", self.url.update);
      self.$input.template.val(self.data.uuid);


      clearFile();
    };

    var resetData = function() {
      template = "";
      update = false;
      self.data = {};
      $frmSubmit.get(0).reset();
      self.$input.name.prop("disabled", false);
      self.$input.module.prop("disabled", false);
      self.$input.module.select2('val', "");
      $frmSubmit.attr("action", self.url.create);
      self.$input.template.val("");
      clearFile();
    };

    var clearFile = function(){
      self.$input.file.val("");
      $containerInputFile.find("span").attr("data-title", "No File ...");
    };

    /*var fnDelete =  self.confirmDeleteDialog(iNet.resources.message.dialog_del_confirm_title, String.format(iNet.resources.htttcn.message.confirm_del_content, record.name), function() {
      if (!iNet.isEmpty(deleteIds)) {
        fnDelete.hide();
        $.postJSON(self.url.del, {
          template : deleteIds
        }, function() {
          var __ids= deleteIds.split(iNet.splitChar);

          for (var i =0;i<__ids.length;i++) {
            self.grid.remove(__ids[i]);
            if(!$.isEmptyObject(self.data)) {
                if(self.data.uuid == __ids[i]) {
                  resetData();
                }
            }
          }
          deleteIds = null;
        },{mask: this.getMask() , msg: iNet.resources.ajaxLoading.deleting});
      }
    });*/

    var update = false;
    var dataSource = new DataSource({
      columns: [{
        property: 'name',
        label: self.getText("Tên báo cáo"),
        sortable: true,
        type: 'label',
        width: 200
      },{
        property: 'description',
        label: self.getText("description"),
        sortable: true,
        type: 'label'
      },{
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [{
          text: iNet.resources.message.button.del,
          icon: 'ace-icon icon-trash',
          labelCls:'label label-important',

        fn : function(record) {
            var __id = record.uuid || '';

            var confirm = self.confirmDialog(iNet.resources.message.dialog_del_confirm_title, String.format(iNet.resources.onegate.message.confirm_del_content, record.name), function() {
                if (!iNet.isEmpty(__id)) {
                    confirm.hide();
                    $.postJSON(self.url.del, {
                        template : __id
                    }, function(result) {
                        if("ERROR" != result.type) {
                            self.grid.remove(__id);
                            self.showMessage('success', iNet.resources.notify.title, iNet.resources.onegate.message.del_success);
                        } else {
                            self.showMessage('success', iNet.resources.notify.title, iNet.resources.onegate.message.del_error);
                        }
                    },{mask: this.getMask() , msg: iNet.resources.ajaxLoading.deleting});
                }
            }).show();
        }
        },{
          text: iNet.resources.message.button.download,
          icon: 'ace-icon icon-download-alt',
          labelCls:'label label-success',
          fn: function(record) {
            $.download(self.url.download, {
              uuid: record.uuid
            });
          }
        }]
      }]
    });

    var getParams = function() {
      var __data = {
        application: iNet.pattern,
        module: self.$input.module.val()

      };
      return __data;
    };

    this.grid = new iNet.ui.grid.Grid({
      id: $grid.prop('id'),
      url: self.url.load,
      params: getParams(),
      dataSource: dataSource,
      idProperty: 'uuid',
      firstLoad: true,
      convertData: function(data) {
        var __data = data || {};
        return __data.items || [];
      }
    });

    this.grid.on('selectionchange', function(sm, data) {
      var __records = sm.getSelection();
      var __data = data || {};
      if (__records.length > 0) {
        setData(__data);
      }
      else {
        resetData();
      }
    });

    // ************ UPLOAD FILE TEMPLATE *****************//

    $containerInputFile.click(function() {
      self.$input.file.trigger('click');
    });

    self.$input.file.on('change', function() {
      if (this.files.length < 1) {
        this.files = [];
        return;
      }
      var __nameFile = this.files[0].name || "";
      self.$input.name.val(__nameFile.substring(0, __nameFile.indexOf(".")));
      $containerInputFile.find('span.ace-file-name').attr('data-title', __nameFile);
      isFile = self.detectFile(__nameFile);
      isMaxSize = this.files[0].size <= self.fileMaxSize * 1024;
      createValidate.check();
    });

    this.$input.module.on("change", function(){
      var __params = getParams();
      self.grid.setParams(__params);
      self.grid.reload();
      if (self.$input.file.get(0).files.length < 1) {
        return;
      }
      var __nameFile = self.$input.file.get(0).files[0].name || "";
      isFile = self.detectFile(__nameFile);
    });

    var markSubmitForm = new iNet.ui.form.FormLoading({
      maskBody: self.$element,
      msg: iNet.resources.ajaxLoading.saving
    });

    $frmSubmit.ajaxForm({
      beforeSubmit: function() {
        if(createValidate.check()) {
          markSubmitForm.start();
          return true;
        }
        return false;
      },
      uploadProgress: function(event, position, total, percentComplete) {
      },
      success: function() {
        update = true;
      },
      complete: function(xhr) {
        markSubmitForm.stop();
        var __responseJSON = xhr.responseJSON || {};
        if("ERROR" != __responseJSON.type) {
          if (!$.isEmptyObject(self.data)) {
            self.grid.update(__responseJSON);
            self.grid.commit();
            self.showMessage('success', iNet.resources.notify.title, String.format(iNet.resources.message.update_success, self.getText('template')));
          }
          else {
            self.grid.insert(__responseJSON);
            self.showMessage('success', iNet.resources.notify.title, String.format(iNet.resources.message.save_success,self.$input.name.val()));
          }
          setData(__responseJSON);
        }
      }
    });
    resetData();

    this.$toolbar.SAVE.click(function() {
      $frmSubmit.submit();
    });

    this.$toolbar.CREATE.click(function() {
      resetData();
    });
  };

  // extends
  iNet.extend(iNet.ui.admin.ImportTemplate, iNet.ui.onegate.OnegateWidget, {
    renderModule: function () {
      var __modules = ReportCommonService.modules;
      var __modulesArr = [];
      for (var key in __modules) {
        if (!iNet.isEmpty(__modules[key].module)) {
          __modulesArr.push({id: __modules[key].module, text: __modules[key].name});
        }
      }
      return __modulesArr;
    },
    /*
    renderChildTemplate : function(childs){
      var __childs = childs || [];
      var __html = "";
      for(var key in __childs){
        __html += String.format('<option value = "{0}">{1} ({2})</option>',__childs[key].module,  __childs[key].name, __childs[key].fileType)
      }
      return __html;
    },*/
    detectFile : function(filename){

      if (iNet.isEmpty(filename)) {
        return;
      }
      filename = filename.toLowerCase();
      var __module =  this.$input.module.val();
      if(iNet.isEmpty(__module)){
        return false;
      };

      var __moduleInfo = ReportCommonService.getModuleInfo(__module) || {};
      var reg = new RegExp("^.*\\.((" + __moduleInfo.fileType + "))$");
      return reg.test(filename);
    },
    getText : function(value){
      return iNet.resources.onegate.admin.ImportTemplate[value] || value;
    }
  });

  new iNet.ui.admin.ImportTemplate();
});
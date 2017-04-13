// #PACKAGE: admin-wf-detail
// #MODULE: WorkflowDetailService
$(function() {
  iNet.ui.admin.WorkflowDetailService = function(config){
    this.url = {
      create: iNet.getUrl('cloud/workflow/defproc/create'),
      update: iNet.getUrl('cloud/workflow/defproc/update'),
      del: iNet.getUrl('cloud/workflow/defproc/delete'),
      load: iNet.getUrl('cloud/workflow/defproc/view')
    };
    this.$id = $("#div-wf-detail");
    this.display = false;
    var __config = config || {};

    iNet.apply(this, __config);
    var self = this;
    var deleteIds = "";
    this.$element = this.$id;
    this.$toolbar = {
      SAVE : $('#btn-wf-detail-save'),
      BACK : $('#btn-wf-detail-back')
    };
    this.$form = $("#frm-wf-detail");
    var $input = {
      brief: $('#txt-wf-brief'),
      editor: CodeMirror.fromTextArea(document.getElementById("txt-content"), {
        mode: 'application/xml',
        theme: 'eclipse',
        lineNumbers: true,
        extraKeys: {"Ctrl-Space": "autocomplete"},
        matchBrackets: true,
        indentUnit: 2,
        indentWithTabs: true,
        enterMode: "keep",
        tabMode: "shift",
        tabSize: 2
      })
    };
    var getText = function(text) {
      if (!iNet.isEmpty(text)) {
        return iNet.resources.onegate.admin.procedure[text] || text;
      } else {
        return "";
      }
    };
    // validate ==================================
    var validation = new iNet.ui.form.Validate({
      id :  self.$form.prop("id"),
      rules : [{
        id : $input.brief.prop("id"),
        validate : function(v) {
          if (iNet.isEmpty(v))
            return getText("procedure_code_not_empty");
        }
      }]
    });

    this.validate = function(){
      return validation.check();
    };
    // set Data =================================
    this.setData = function(data){
      var __data = data || {};
      self.data = __data ;
      $input.brief.val(data.brief || "");
      $input.editor.setValue(data.content || "");
    };
    // get data =====================================
    this.getData = function(){
      return {
        uuid: self.data.uuid  || "",
        brief: $input.brief.val(),
        applyToService: 'ONEGATE',
        content: $input.editor.getValue()
      }
    };
    this.loadData = function(uuid){
      $.postJSON(self.url.load , {graph: uuid}, function(result){
        var __data = result || {};
        if(!iNet.isEmpty(__data.uuid)) {
          self.setData(__data);
        } else {
          // load error
          self.showMessage('error', iNet.resources.message["note"], iNet.resources.message["save_error"]);
        }
      },{
        mask : self.$element,
        msg : iNet.resources.ajaxLoading.saving
      });
    };
    // update =======================================
    this.save = function(data) {
      var __data = data || {};
      var isUpdate = false;
      if(!iNet.isEmpty(__data.uuid)){
        isUpdate = true;
      }
      $.postJSON(isUpdate ? self.url.update : self.url.create , __data, function(result){
        var __result = result || {};
        if(!iNet.isEmpty(__result.uuid)) {
          self.data = __result;
          // save success
          self.fireEvent(isUpdate ?"update":"save", __result);
          self.showMessage('success', iNet.resources.message["note"], isUpdate?iNet.resources.onegate.admin.procedure["update_success"]:iNet.resources.onegate.admin.procedure["save_success"]);
        } else {
          // save error
          self.showMessage('error', iNet.resources.message["note"], iNet.resources.message["save_error"]);
        }

      },{
        mask : self.$element,
        msg : iNet.resources.ajaxLoading.saving
      });
    };
    // action -----------------------------------------------
    this.$toolbar.SAVE.click(function() {
      if(self.validate()) {
        var __data = self.getData();
        self.save(__data);
      }
    });
    
    this.$toolbar.BACK.click(function(){
      self.fireEvent("back");
    });
    // init widget
    (function(){
      (self.display) ? self.show() : self.hide();
    }());
  };

  iNet.extend(iNet.ui.admin.WorkflowDetailService, iNet.ui.onegate.OnegateWidget, {
    addRow : function(data){
       this.grid.insert(data);
    },
    updateRow : function(data){
      this.grid.update(data)
    }
  });
});
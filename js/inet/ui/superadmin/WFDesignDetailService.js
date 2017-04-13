// #PACKAGE: ionegate-superadmin-wf-design-detail
// #MODULE: SuperadminWorkflowDesignDetailService
$(function() {
	iNet.ns('iNet.ui.onegate.superadmin');
	iNet.ui.onegate.superadmin.WorkflowDesignDetailService = function(config){
    this.url = {
      update: iNet.getUrl('onegate/wflprocedure/update'),
      save: iNet.getUrl('onegate/wflprocedure/create'),
      load: iNet.getUrl('onegate/wflprocedure/load')
    };

    this.$id = $("#div-wf-detail");
    this.owner = {data: {}, procedure: {}};
    var __config = config || {};
    iNet.apply(this, __config);
    
    var self = this;
    this.$element = this.$id;
    this.$toolbar = {
      SAVE : $('#btn-wf-detail-save'),
      BACK : $('#btn-wf-detail-back')
    };
    this.$form = $("#frm-wf-design-detail");
    
    var $input = {
      subject: $('#txt-detail-subject'),
      industry: $('#txt-detail-industry'),
      hourDate: $('#txt-detail-hour-date'),
      hourMinute: $('#cbb-detail-hour-minute'),
      xform: $('#cbb-detail-xform'),
      xformEx: $('#cbb-detail-xform-ex')
    };
    
//    this.getEl().find(".number").filter_input({
//      regex: '[0-9]',
//      events: 'keypress paste'
//    });
    
    var getText = function(text) {
      return text;
      /*
      if (!iNet.isEmpty(text)) {
        return iNet.resources.onegate.admin.procedure[text] || text;
      } else {
        return "";
      }*/
    };
    
    // validate ==================================
    var validation = new iNet.ui.form.Validate({
      id :  self.$form.prop("id"),
      rules : [{
        id : $input.subject.prop("id"),
        validate : function(v) {
          if (iNet.isEmpty(v))
            return getText("Tên quy trình không được để trống.");
        }
      },{
        id : $input.industry.prop("id"),
        validate : function(v) {
          if (iNet.isEmpty(v))
            return getText("Lĩnh vực không được để trống");
        }
      }]
    });

    this.validate = function(){
      return validation.check();
    };
    
    // set Data =================================
    this.setData = function(data){
      $input.subject.val(data.subject);
      $input.industry.val(data.industry);
      $input.xform.select2('val', data.xform);
      $input.xformEx.select2('val',data.xformEx);
      if(data.hours > 0){
        var date = Math.floor(data.hours / 8 );
        var hour = data.hours - (date * 8);
        $input.hourDate.val(date);
        $input.hourMinute.val(hour);
      }else if(!data.hours || data.hours == 0){
        $input.hourDate.val(0);
        $input.hourMinute.val(0);
      }
    };
    
    // get data =====================================
    this.getData = function(){
      var date = $input.hourDate.val();
      var hours = parseInt(date) *8  + parseInt($input.hourMinute.val());
      return {
        uuid: self.owner.data.uuid  || "",
        subject: $input.subject.val(),
        industry: $input.industry.val(),
        hours: hours,
        procedureID: this.owner.procedure.uuid,
        applyToService : 'ONEGATE',
        xform: $input.xform.val(),
        xformEx: $input.xformEx.val(),
        xformLx: $input.xformEx.val()
      }
    };
    
    this.reset = function(){
      this.owner.data = {};
      this.owner.procedure = {};
      $input.subject.val('');
      $input.industry.val(0);
      $input.hourDate.val('0');
      $input.industry.val('');
      $input.subject.prop('readonly', true);
      $input.industry.prop('readonly', true);
    };
    
    this.loadData = function(procedureID){
      $.getJSON(this.url.load, {procedure: procedureID}, function(result){
        var __result = result || {};
        if(!iNet.isEmpty(__result.uuid)) {
          self.owner.data = __result;
          self.setData(__result);
        } else {
          self.create();
        }
      },{
        mask : self.getEl(),
        msg : iNet.resources.ajaxLoading.saving
      });
    };
    
    // update =======================================
    this.save = function(data) {
      var url = self.url.save;
      var msg = '';
      if(!iNet.isEmpty(data.uuid)){
        url = self.url.update;
        msg = 'Quy trình đã được cập nhật thành công';
      } else {
        msg = 'Quy trình đã được tạo';
      }
      $.postJSON(url, data, function(result){
        var __result = result || {};
        if(!iNet.isEmpty(__result.uuid)) {
          __result.code = self.owner.procedure.code;
          self.owner.data = __result;
          
          // save success
          if(url == self.url.save){
            self.fireEvent("created", __result);
          }else{
            self.fireEvent("update", __result);
          }
          
          self.showMessage('success', 'Quy trình', msg);
          self.owner.actor = __result;
          self.setData(__result);
        } else {
          self.showMessage('error', 'Quy trình', iNet.resources.message["save_error"]);
        }
      },{
        mask : self.$element,
        msg : iNet.resources.ajaxLoading.saving
      });
    };
    
    this.create = function(){
      this.owner.data = {};
      this.setData({
        subject: this.owner.procedure.subject,
        industry: this.owner.procedure.industry,
        hours: 0,
        xform: '',
        xformEx: '',
        xformLx: ''
      });
    };
    // private function -------------------------------------
    this._view = function(data){
      this.reset();
      this.owner.procedure = data;
      this.loadData(data.uuid);
    };
    // action -----------------------------------------------
    this.$toolbar.SAVE.click(function() {
        self.save(self.getData());
    });
    
    this.$toolbar.BACK.click(function(){
      self.fireEvent("back");
    });

    $input.xform.select2();
    $input.xformEx.select2();
    // init data----------------------------------------------
    (function(){
      (self.display) ? self.show() : self.hide();
    }());
  };

  iNet.extend(iNet.ui.onegate.superadmin.WorkflowDesignDetailService, iNet.ui.onegate.OnegateWidget, {
    view: function(data){
      this._view(data);
    }
  });
});
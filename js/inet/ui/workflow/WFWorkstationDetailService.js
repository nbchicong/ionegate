// #PACKAGE: admin-wf-workstation-detail
// #MODULE: WorkflowWorkstationDetailService
$(function() {
  iNet.ui.admin.WorkflowWorkstationDetailService = function(config){
    this.url = {
      update: iNet.getUrl('onegate/unitwork/update'),
      save: iNet.getUrl('onegate/unitwork/create')
    };
    this.$id = $("#div-wf-detail");
    this.owner = {actor: {}, member: []};
    this.display = false;
    var __config = config || {};
    iNet.apply(this, __config);
    
    var self = this;
    var deleteIds = "";
    this.$element = this.$id;
    this.$toolbar = {
      SAVE : $('#btn-wf-actor-save'),
      ADD : $('#btn-wf-actor-add'),
      BACK : $('#btn-wf-actor-back')
    };
    this.$form = $("#frm-wf-actor-detail");
    var $input = {
      name: $('#txt-name'),
      representative: $('#txt-representative'),
      workers: $('#txt-workers')
    };
    var getText = function(text) {
      return text;
      /*
      if (!iNet.isEmpty(text)) {
        return iNet.resources.onegate.admin.procedure[text] || text;
      } else {
        return "";
      }
      */
    };
    
    // validate ==================================
    var validation = new iNet.ui.form.Validate({
      id :  self.$form.prop("id"),
      rules : [{
        id : $input.name.prop("id"),
        validate : function(v) {
          if (iNet.isEmpty(v))
            return getText("Tên đơn vị xử lý không được để trống");
        }
      },{
        id : $input.representative.prop("id"),
        validate : function(v) {
          if (iNet.isEmpty(v))
            return getText("Đại diện xử lý không được để trống");
        }
      }]
    });

    this.validate = function(){
      return validation.check();
    }
    
    // set Data =================================
    this.setData = function(data){
      $input.name.val(data.name);
      this.cbbRepresentative.setData({code: data.representative.actor});
      var actors = [], workers = data.workers;
      
      //TODO
      for(var i=0;i<workers.length;i++){
        actors.push({code: workers[i].actor});
      }
      this.cbbWorkers.setData(actors);
      //TODO
      $input.name.prop('readonly', true);
    };
    
    // get data =====================================
    this.getData = function(){
      return {
        uuid: self.owner.workstation.uuid  || "",
        name: $input.name.val(),
        representative: $input.representative.val(),
        workers: $input.workers.val()
      }
    };
    
    this.reset = function(){
      this.owner.workstation = {};
      $input.name.val('');
      $input.representative.val('');
      this.cbbWorkers.clear();
      this.cbbRepresentative.clear();
      
      $input.name.prop('readonly', false);
      
    };
    this.loadData = function(data){
      self.setData(data);
      self.owner.workstation = data;
    };
    
//    this.loadMember = function(actor){
//      $.postJSON(self.url.loadMember , {actor: actor}, function(result){
//        var __data = result || {};
//        var __items = __data.items || [];
//        var __users = [];
//        for(var i=0;i<__items.length;i++){
//          var __item = __items[i];
//          __users.push(__item.username);
//        }
//        self.cbbWorkers.setValue(__users);
//        self.owner.member = __items;
//      },{
//        mask : self.$element,
//        msg : iNet.resources.ajaxLoading.loading
//      });
//    }
    // update =======================================
    this.save = function(data) {
      var url = self.url.save;
      if(!iNet.isEmpty(data.uuid)){
        url = self.url.update;
      }
      
      $.postJSON(url, data, function(result){
        var __result = result || {};
        if(!iNet.isEmpty(__result.uuid)) {
          self.data = __result;
          // save success
          self.fireEvent("created", __result);
          
          if(url == self.url.save){
            self.showMessage('success', iNet.resources.message["note"], getText("Đơn vị xử lý đã được tạo thành công"));
          }else{
            self.showMessage('success', iNet.resources.message["note"], getText("Đơn vị xử lý đã được cập nhật thành công"));
          }
          
          self.owner.workstation = __result;
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
        self.save(self.getData());
      }
    });
    
    this.$toolbar.BACK.click(function(){
      self.fireEvent("back");
    });
    
    this.$toolbar.ADD.click(function(){
    });
    
    // event -------------------------------------------------
    
    // init data----------------------------------------------
    $.postJSON(iNet.getUrl("cloud/workflow/alias/list"), {}, function(result){
      if(!!result && !!result.items){
        self.cbbRepresentative = new iNet.ui.form.select.Select({
          id: $input.representative.prop("id"),
          idValue: function (item) {
            return item.code;
          },
          multiple: false,
          allowClear: true,
          data: function () {
            return {
              results: result.items,
              text: function (item) {
                return item.code;
              }};
          },
          initSelection: function (element, callback) {
            callback(element);
          },
          formatSelection: function (object) {
            var __object = object || {};
            return String.format('<span>{0}</span>', __object.code);
          },
          formatResult: function (object) {
            var __object = object || {};
            return String.format('<span><i class="icon-user"></i> {0}</span>', __object.code);
          }
        });
        
        self.cbbWorkers = new iNet.ui.form.select.Select({
          id: $input.workers.prop("id"),
          idValue: function (item) {
            return item.code;
          },
          multiple: true,
          allowClear: true,
          data: function () {
            return {
              results: result.items,
              text: function (item) {
                return item.code;
              }};
          },
          initSelection: function (element, callback) {
            callback(element);
		      },
          formatSelection: function (object) {
            var __object = object || {};
            return String.format('<span>{0}</span>', __object.code);
          },
          formatResult: function (object) {
            var __object = object || {};
            return String.format('<span><i class="icon-user"></i> {0}</span>', __object.code);
          }
        });
      }
    });

    (function(){
      (self.display) ? self.show() : self.hide();
    }());
  };

  iNet.extend(iNet.ui.admin.WorkflowWorkstationDetailService, iNet.ui.onegate.OnegateWidget, {
    addRow: function(data){
       this.grid.insert(data);
    },
    updateRow: function(data){
      this.grid.update(data)
    }    
  });
});
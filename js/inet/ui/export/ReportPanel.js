// #PACKAGE: report-panel
// #MODULE: ReportPanel
/**
 *
 */
iNet.ns(
  "iNet.ui",
  "iNet.ui.report",
  "iNet.ui.report.ReportPanel"
);
$.fn.modalmanager.defaults.resize = true;
iNet.ui.report.ReportPanel = function(config){

  var __config = config || {};

  this.globalParam = {
    "application" : iNet.pattern
  };

  this.id = iNet.generateId();
  this.module = {};
  this.dataModule = {};
  this.param = {};
  this.data = {};
  this.model = {};
  iNet.apply(this, __config);
  this.url = {
    template : iNet.getUrl("report/template/list")
  };

  var self = this;
  this.moduleInfo = {};
  this.dashboard = iNet.generateId();

  this.slModule = iNet.generateId();

  this.$slModule = function(){
    return $(String.format("#{0}",this.slModule));
  };
  this.formSlModule = iNet.generateId();

  this.$selector = function(){
    return $(String.format("#{0}", self.id));
  };

  this.$dashboard = function(){
    return $(String.format("#{0}", self.dashboard));
  };

  this.initialize();

  // Event ===========================================================================
  this.$dashboard().on("click", ".item", function(evt) {
    var __data = $(evt.currentTarget).data("data");
    var __params = this.preData(__data);
    var __export = this.isExportdata();
    if (__export) {
      this.hide();
    }
    self.fireEvent("download", __params,__export );

  }.createDelegate(this));

  $.getCmp(this.slModule).on("change", function(){
    var __module = $(this).val();
    var __params = {"module" : __module};
    var infoModule = ReportCommonService.getModuleInfo(__module) || {};
    if(!iNet.isEmpty(infoModule.required)) {
      var __message = "";
      if("model" == infoModule.required ) {
        if(!iNet.isEmpty(self.model)) {
          __params = {"module" : __module + "_" +self.model};
        } else {
          __message = self["def_model_not_found"];
        }
      }
      // TODO them cac module khac thuoc model vao cho nay
      if(!iNet.isEmpty(__message)) {
        self.showMessage("error", iNet.resources.message.note, __message);
        self.empty();
        return ;
      }
    }
    self.loadTemplate(__params);
  });
};

iNet.extend(iNet.ui.report.ReportPanel, iNet.Component, {

  initialize : function(){
    var __html = String.format('<div id="{0}" class="modal fade" data-width="750" tabindex="-1" style="display:none"  aria-hidden="false">', this.id)

      + '<div class="modal-header">'
        + '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
        + String.format('<h4><i class="ace-icon icon-bar-chart"></i> {0}</h4>',!iNet.isEmpty(this.getTitle()) ? this.getTitle() : this.select_template_export)
      + '</div>'
      + '<div class="modal-body">'
        + String.format('<form class="form-horizontal" id="{0}">', this.formSlModule)
          + '<div class="row-fluid">'
          + '<div class="control-group">'
          + '<label class="control-label" for="record-txt-shelf-code">' + this["select_template_export"]+ ':</label>'
          + '<div class="controls">'
          + String.format('<select id="{0}" class="span6" readonly="readonly" placeholder=""></select>', this.slModule)
          + '</div>'
          + '</div>'
          + '</div>'
          + '<div class="hr"></div>'
        + '</form>'

        + '<div>'
          //+ String.format('<div id="{0}" class=""></div>', this.dashboard)
          + String.format('<div class="template-report"><ul id="{0}" class="list-inline quick-access"></ul></div>',this.dashboard)
        + '</div>'
      + '</div>'
      + '<div class="modal-footer">'
        + '<button id="template-report-btn-cancel" class="btn btn-default" data-dismiss="modal"><span class="ace-icon icon-remove"></span>' + this.exit + '</button>'
      + '</div>'
    + '</div>';
    $(document.body).append(__html);

  },
  getColor: function(index) {
    var __index = index || 0;
    var __items = ['bg-color-blue', 'bg-color-orange', 'bg-color-green', 'bg-color-dark-blue'];
    if (iNet.isEmpty(__items[__index])) {
      this.colorIndex = (this.colorIndex || -1) + 1;
      return __items[this.colorIndex];
    }
    else {
      return __items[__index];
    }
  },

  renderItem : function(item,index){
    var __data = item || {};
    var __html = String.format('<li data-uuid="{0}" data-name="{1}" title="{2}" class="item">', __data.uuid, __data.description,(__data.description || "").toUpperCase()) +
        String.format('<a href="javascript:;">') +
        String.format('<span class="quick-access-item {0}">',this.getColor(index)) +
        String.format('<i class="fa fa-bar-chart-o"></i>') +
        String.format('<h5>{0}</h5>',(__data.name || "").toUpperCase()) +
        String.format('<em>{0}</em>',(__data.description || __data.name)) +
        String.format('</span>') +
        String.format('</a>') +
        String.format('</li> ');
    
//    var __html = String.format('<div class="col-xs-6 col-md-6 clearfix item" data-uuid="{0}">'/*, ReportCommonService.convertTypeToUrl(__data.type) + '?data={0}'*/, __data.uuid) +
//      String.format('<div class="thumbnail thumbnails poiter ithumbnail" style="height: 80px; ">') +
//      String.format('<div class="col-xs-4 col-md-4 report-icon report-edoc-in">') +
//      String.format('</div>') +
//      String.format('<div class="caption" class="pull-left" style="padding-top: 10px;">') +
//      String.format('<h5><a  class="a-action" href="javascript:;">{0}</a></h5>', __data.description || __data.name) +
//      String.format('</div>') +
//      String.format('</div>') +
//      String.format('</div>');

    return __html;
  },
  getParams : function(){
    return this.param || {};
  },
  loadTemplate : function( params ) {

    var __params = params || {};
    var __me = this;
    iNet.apply( __params, this.globalParam);
    this.param = __params;
    if(!$.isEmptyObject(__params)) {

      $.postJSON(this.url.template, __params, function(result){
       if(!$.isEmptyObject(result) && result.type != "ERROR")  {

         $.getCmp(__me.dashboard).html("");
         var __items = result.items || [];
         if(__items.length == 1){
           __me.hide();
           var __params = __me.preData(__items[0]);
           var __export = __me.isExportdata();
           __me.fireEvent("download", __params,__export );
           return;
         }
         if(!iNet.isEmpty(__items)) {
           for(var i =0 ; i < __items.length ; i++) {
             var __html = __me.renderItem(__items[i],i);
             $.getCmp(__me.dashboard).append(__html);
             $.getCmp(__me.dashboard).find(String.format("[data-uuid = {0}]", __items[i].uuid)).data("data", __items[i]);
           }
         } else {
           __me.empty();
         }
         __me.moduleInfo = ReportCommonService.getModuleInfo(__me.module);

        } else{
         __me.empty();
       }
        __me.show();
      },{
        mask: $.getCmp(__me.dashboard),
        msg : iNet.resources.ajaxLoading.loading
      });
    }
  },
  empty: function(){
    //this.$dashboard().html(String.format('<div class="alert alert-warning"><strong>{0}</strong><br></div>', this.template_not_found));
    this.$dashboard().html(String.format('<i class="ace-icon icon-hand-right" style="margin-left:20px;"></i> <i class="font-bold" style="color:#b94a48">{0}</i>', this.template_not_found));
  },
  show : function() {
    this.$selector().modal("show");
  },
  hide : function() {
    this.$selector().modal("hide");
  },
  showMessage : function(type,title,content ) {

    var notify = new iNet.ui.form.Notify({
      title: iNet.resources.Notify["title"],
      type:  'info'
    });

    notify.setType(type);
    notify.setTitle(title || "");
    notify.setContent(content || "");
    notify.show();
  },
  setModule : function(module, load){
    if(!iNet.isEmpty(module))  {
      this.module = module;
      $.getCmp(this.formSlModule).hide();
      if(load) {
        var __params = {"module" : module};
        this.loadTemplate(__params);
      }
    }
  },
  setModel : function(model){
    this.model = model
  },
  setType : function(type, load, model) {
    this.dataModule = ReportCommonService.getModules(type);
    if(!$.isEmptyObject(this.dataModule)) {
      $.getCmp(this.formSlModule).show();
      var __option = "";
      for(var k in this.dataModule) {
        __option  += String.format("<option value = '{0}'>{1}</option>", k, this.dataModule[k].name || k);
      };
      this.$slModule().html(__option);
      if(load)  {
        var __params = {"module" : $.getCmp(this.slModule).val()};
        this.loadTemplate(__params);
      }
    }
  },
  setData : function(data) {
    this.data = data || {};
  },
  getData : function(){
      return this.data;
  },
  preData : function(data){
    var __data = data;
      var __url = this.data.url || "";
      var __params = { module: this.module, url: __url};

      __params["requestContext"] = iNet.prefix + iNet.path  + "/" + iNet.pattern;
      __params["type"] =  this.module; // R5 & R6
      __params["uuid"] = __data.uuid;
      __params = iNet.apply(__params,this.data);
      __params["module"] = this.module;
      __params["templateID"] = __data.uuid;

      delete __params["pageSize"];
      delete __params["pageNumber"];

/*      if(this.moduleInfo.fileType == "docx") {

      } else if (this.moduleInfo.type =="searchlist"){

      } else {
          __params ={
              reportID : __data.uuid
          }
      }*/
      var __type = this.module.substr(0,this.module.indexOf("_"));
      if(["object"].indexOf(__type) > -1) {
          __params["folder"] = this.data.model;
          __params["document"] = this.data.document;
      }

      return __params;
  },
  getTitle: function(){
    return this.title;
  },
  setTitle: function(title){
    this.title = title;
    var $id = $('#' + this.id);
    var $header = $id.find('.modal-header h4');
    $header.html(String.format('<i class="ace-icon icon-bar-chart"></i> {0}',this.title));
  },
  setExportdata: function(exportdata){
    this.exportdata = exportdata;
  },
  isExportdata: function(){
    return !iNet.isEmpty(this.exportdata) ? this.exportdata : true; // exportdata= true: ket xuat du lieu
  },
  setRUuid : function(ruuid){ // uuid of report(use to download)
    this.ruuid = ruuid;
  },
  getRUuid : function(){
    return this.ruuid;
  }
});

/** apply resource  */

iNet.apply(iNet.ui.report.ReportPanel.prototype, iNet.resources.export_data.reportPanel);

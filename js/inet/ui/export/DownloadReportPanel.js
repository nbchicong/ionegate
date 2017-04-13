// #PACKAGE: download-report-panel
// #MODULE: DownloadReportPanel
/**
 *
 */
iNet.ns(
  "iNet.ui",
  "iNet.ui.report",
  "iNet.ui.report.DownloadReportPanel"
);
$.fn.modalmanager.defaults.resize = true;
iNet.ui.report.DownloadReportPanel = function(config){

  var __config = config || {};
  this.params = {};
  this.url = {
    docx : iNet.getXUrl("htttcn/report/document"),
    generator : iNet.getXUrl("htttcn/report/export"),
    list : iNet.getXUrl("htttcn/list/export"),
    status : iNet.getUrl("report/file/chkstatus"),
    download : iNet.getUrl("report/file/download")
  };
  this.download = true; //default
  this.urlGenerator = "";
  this.timeTry = 0;
  iNet.apply(this, __config);

    this.txtDownloading = this.txtDownloading || (this.download) ? "Đang tải bảo cáo ...." : 'Đang lưu báo cáo';
    this.txtWaiting = this.txtWaiting || (this.download) ? "Báo cáo đang được tải, xin vui lòng đợi ..." : "Báo cáo đang lưu, xin vui lòng đợi...";
    this.txtDownloadError =  this.txtDownloadError || (this.download) ? "Có lỗi trong khi tải !" : "Có lỗi trong khi lưu!";
    this.txtDownloadSuccess = this.txtDownloadSuccess || (this.download) ? "Tải thành công !" : "Lưu thành công";

    if(!iNet.isEmpty(this.urlGenerator)) {
      this.url.generator = this.urlGenerator;
    }
  this.secrd = "";
  this.notifyBox = null;
  this.idValue = iNet.generateId();
  this.idBar = iNet.generateId();
  this.idText = iNet.generateId();
  this.idIcon = iNet.generateId();
  this.timer = null;
  this.count = 0;
  this.moduleInfo = ReportCommonService.getModuleInfo(this.params.module);
  this.start(this.params);
};

iNet.extend(iNet.ui.report.DownloadReportPanel, iNet.Component, {
  createNotify : function() {
    var __html = '<div class="space-6"></div>' +
    '<ul class="list-unstyled">'+
    String.format('<li><span class="ace-icon icon-spinner icon-spin ace-icon icon-1x green" id="{0}"></span> <span id={1}>{2}</span> <span class="pull-right strong value" id= "{3}">0%</span>',this.idIcon, this.idText, this.txtDownloading, this.idValue )+
    '<div class="progress progress-important">' +
    String.format('<div class="progress-bar" style="width: 0%;" id="{0}"></div>', this.idBar) +
    '</div>' +
    '</li>' +
    '</ul>';

    this.notifyBox = new iNet.ui.form.Notify({
      icon: 'icon ace-icon icon-cog icon-spin',
      text: __html,
      hide: false,
      autoHide: false,
      buttons: {
        closer: false,
        sticker: false
      },
      history: false,
      before_open: function(pnotify) {
      }
    });
    this.notifyBox.setContent(__html);
    this.notifyBox.setType("success");
    this.notifyBox.show();
    this.notifyBox.get().find('.ui-pnotify-title').remove();
    this.notifyBox.get().find('.ui-pnotify-icon').remove();
  },
  setValueProcess : function(value){
    var __value = !iNet.isEmpty(value) ? String.format("{0}%", value) : "0%";
    $.getCmp(this.idValue).html(__value);
    $.getCmp(this.idBar).css('width',__value);
  },
  generator : function(params) {
    var __me = this;
    if(!$.isEmptyObject(params)) {
     var __url = !!this.moduleInfo.url ? iNet.getXUrl(this.moduleInfo.url) :  this.url.generator;
     var __params = $.extend(params, {ajax:'callback'});
      $.postJSON(__url, __params, function(result){
        if("ERROR" != result.type){
          if (!iNet.isEmpty(result) && !iNet.isEmpty(result.uuid)) {
            __me.secrd = result.uuid.slice(result.uuid.indexOf("?"));
            __me.uuid = result.uuid || "";
            __me.checkStatus(params.reportId);
          }else{
            __me.processError();
          }
        } else {
          __me.processError();
        }
      });
    }
  },
  checkStatus : function(reportID){

    this.setValueProcess(this.count);
    // Pretend to do something.
      var __url = this.url.status + this.secrd;
      $.postJSON(__url , {uuid: this.uuid}, function(result){
        if(result == 0) {
          if(this.count >= 90) {
              this.count = 90;
            $.getCmp(this.idText).html(this.txtWaiting)
          }
          this.setValueProcess(this.count);
            this.count += 10;
            this.checkStatus(reportID);
        } else if(result == 1) { // ERROR
           // this.processError();
          if(this.timeTry == 3) {

            this.processError();
          } else{

            this.checkStatus(reportID);
            this.timeTry +=1;
          }
        } else {
            this.processSuccess(reportID)
        }
      }.createDelegate(this));

    //}, 300);
  },
  processError : function(){
    var __me = this;
    //window.clearInterval(this.timer);
    this.notifyBox.setType("error");
    this.notifyBox.get().find('.ui-pnotify-title').remove();
    this.notifyBox.get().find('.ui-pnotify-icon').remove();
    $.getCmp(this.idText).html(__me.txtDownloadError);
    $.getCmp(this.idIcon).removeClass("ace-icon icon-spinner icon-spin");
    $.getCmp(this.idIcon).addClass("ace-icon icon-frown");
    this.notifyBox.get().remove();
    //this.notifyBox.pnotify_remove();
    /*window.setTimeout(function(){
      __me.destroy();
    }, 2000);*/
  },
  processSuccess : function(reportId){
    var __me = this;
    //window.clearInterval(this.timer);
    __me.setValueProcess(100);

    this.notifyBox.get().find('.ui-pnotify-title').remove();
    this.notifyBox.get().find('.ui-pnotify-icon').remove();
    $.getCmp(this.idText).html(__me.txtDownloadSuccess);
    $.getCmp(this.idIcon).removeClass("ace-icon icon-spinner icon-spin");
    $.getCmp(this.idIcon).addClass("ace-icon icon-ok");

    __me.fireEvent("success", reportId, this.getUrlDownloadXls(reportId));
    this.notifyBox.get().remove();
     //this.notifyBox.pnotify_remove();
    this.timeTry = 0;
    if(!this.download) {
        return;
    };
    window.location.href =  this.getUrlDownloadXls(reportId);
  },
  start: function(params) {
    // submit ajax
    this.timeTry = 0;
    var __me = this;
    if((!iNet.isEmpty(this.moduleInfo["fileType"])) && "docx" == this.moduleInfo["fileType"]) {
      window.location.href =  __me.getUrlDownloadDocx();
      return;
    };
    this.createNotify();
    this.generator(params);
    /*$.postJSON(this.url, params, function(result){
       if(iNet.isSuccess(result)) {
         __me.setValueProcess(100);
         window.clearInterval(this.timer);
         __me.notifyBox.pnotify({
           type : "success"
         });
         __me.notifyBox.find('.ui-pnotify-title').remove();
         __me.notifyBox.find('.ui-pnotify-icon').remove();
         $.getCmp(__me.idText).html("Đã tải thành công");
         $.getCmp(__me.idIcon).removeClass("icon-spinner icon-spin");
         $.getCmp(__me.idIcon).addClass("icon-ok");
         window.setTimeout(__me.destroy, 200);
       } else {
          __me.fireEvent("error", result);
          __me.destroy();
       }
    });*/
  },
  destroy : function(){
    if(this.notifyBox != null) {
      //TODO destroy =================
      window.clearInterval(this.timer);
      this.timeTry = 0;
      this.notifyBox.get().remove();
    }
  },
  getUrlDownloadDocx: function(){
    var  __url = this.url.docx;
      if(!iNet.isEmpty(this.params.url)) {
          __url = this.params.url;
      } else if(!iNet.isEmpty(this.moduleInfo.url)) {
        __url = iNet.getXUrl(this.moduleInfo.url);
      };
      delete this.params.module;
    var __dataParams = jQuery.param(this.params);

    return __url + '?' +__dataParams;
  },
  getUrlDownloadXls : function(reportID){
    return this.url.download + this.secrd;
  }
});

/**
 * apply resource
 * */
iNet.apply(iNet.ui.report.DownloadReportPanel.prototype, iNet.resources.export_data.downloadReportPanel);

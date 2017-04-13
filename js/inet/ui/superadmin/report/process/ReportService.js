// #PACKAGE: onegate-superadmin-report-process-report-service
// #MODULE: ProcessReportService
/**
 * Created by huyendv on 23/05/2015.
 */
$(function () {

  var searchWidget = new iNet.ui.superadmin.report.process.SearchWidget({
    module: "REPORT_PROCESS"
  });

  searchWidget.on("create", function(){
    getContentWidget().show();
    getContentWidget().create();
  });

  searchWidget.on("view", function(data){
    getContentWidget().show();
    getContentWidget().setData(data);
  });

  var contentWidget = null;
  var getContentWidget = function(){
    if(contentWidget == null) {
      contentWidget = new iNet.ui.superadmin.report.process.ContentWidget({
        module: "REPORT_PROCESS"
      });
      contentWidget.on("back", function(){
        searchWidget.show();
      });

      contentWidget.on("saved", function(){
        searchWidget.search();
      });
    }
    return contentWidget;
  }
});

/**
 * Created by thoangtd on 12/5/13.
 */
// #PACKAGE: onegate-superadmin-report-province-report-service
// #MODULE: UnitReportService
$(function () {

  var searchWidget = new iNet.ui.superadmin.report.province.SearchWidget({
    module: "REPORT_RESOLVE_PROVINCE"
  });

  searchWidget.on("create", function(){
    getContentWidget().show();
    getContentWidget().create();
  });

  searchWidget.on("view", function(data){
    getContentWidget().show();
    getContentWidget().setData(data);
    /*getContentWidget().create();*/
    console.log("view report >>>>>>>>>>>>>>>");
  });

  var contentWidget = null;
  var getContentWidget = function(){
    if(contentWidget == null) {
      contentWidget = new iNet.ui.superadmin.report.province.ContentWidget({
        module: "REPORT_RESOLVE_PROVINCE"
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

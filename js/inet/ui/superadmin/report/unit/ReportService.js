/**
 * #PACKAGE: report-unit-service
 * #MODULE: ReportService
 */
/**
 * Copyright (c) 2017 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 5:30 PM 10/02/2017.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file ReportService.js
 */
$(function () {
  var searchWidget = new iNet.ui.superadmin.report.unit.UnitSearchReport({
    module: "REPORT_UNIT"
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
      contentWidget = new iNet.ui.superadmin.report.unit.UnitContentReport({
        module: "REPORT_UNIT"
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

// #PACKAGE: onegate-superadmin-report-usage-service
// #MODULE: ReportService
/**
 * Copyright (c) 2015 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 06/05/2015.
 * -------------------------------------------
 * @project ionegate-ui
 * @file ReportService
 * @author nbchicong
 */
$(function () {
  var contentWg = null;
  var searchWg = new iNet.ui.superadmin.report.usage.SearchWidget({
    module: "REPORT_USAGE"
  });
  var history = new iNet.ui.form.History({
    id: 'report-history',
    root: searchWg
  });
  var onBack = function () {
    history.back();
  };
  var getContentWidget = function(parent){
    if (!contentWg) {
      contentWg = new iNet.ui.superadmin.report.usage.ContentWidget({
        module: "REPORT_USAGE"
      });
      contentWg.on("back", function(){
        onBack();
      });
      contentWg.on('saved', function (resultReport) {
        searchWg.search();
        //searchWg.getGrid().commit();
      });
    }
    if(parent){
      contentWg.setParent(parent);
      parent.hide();
    }
    history.push(contentWg);
    contentWg.show();
    return contentWg;
  };
  history.on('back', function(widget){
    widget.show();
  });
  searchWg.on("create", function(){
    var __contentWg = getContentWidget(searchWg);
    __contentWg.create();
  });
  searchWg.on("view", function(data){
    var __contentWg = getContentWidget(searchWg);
    __contentWg.setData(data);
  });
});

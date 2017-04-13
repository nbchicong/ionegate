// #PACKAGE: onegate-superadmin-process-state-report-mng-service
// #MODULE: ProcessStateReportMngService
/**
 * Copyright (c) 2015 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 08/05/2015.
 * -------------------------------------------
 * @project ionegate-ui
 * @file ProcessStateReportMngService
 * @author nbchicong
 */

$(function () {
  var mngWidget = new iNet.ui.onegate.superadmin.ProcessStateReportMngWidget();
  var viewContent = {};
  var history = new iNet.ui.form.History({
    id: 'process-state-report-history',
    root: mngWidget
  });
  var onBack = function () {
    history.back();
  };
  var getViewContent = function (module, parent) {
    var __package = ReportCommonService.modules[module].packg;
    if (!viewContent[module]) {
      viewContent[module] = new iNet.ui.superadmin.report[__package].ContentWidget({
        module: module
      });
      viewContent[module].on('back', function () {
        onBack();
      });
    }
    if(parent){
      viewContent[module].setParent(parent);
      parent.hide();
    }
    history.push(viewContent[module]);
    viewContent[module].setToolBarMode("view");
    viewContent[module].show();
    return viewContent[module];
  };
  history.on('back', function (widget) {
    widget.show();
  });
  mngWidget.on('view', function (record) {
    var __contentWg = getViewContent(record.group, mngWidget);
    __contentWg.setData(record);
  });
});
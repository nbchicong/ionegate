// #PACKAGE: ionegate-superadmin-wf-design
// #MODULE: SuperadminWorkflowDesignService
$(function () {
  var wfSearch = new iNet.ui.onegate.superadmin.WorkflowDesignSearchService({
    display: true
  });
  var virtualForm = null, detailForm = null;
  var createWorkflowDesignDetail = function () {
    if (!detailForm) {
      detailForm = new iNet.ui.onegate.superadmin.WorkflowDesignDetailService();
      detailForm.on("created", function (data) {
        wfSearch.reload();
        //virtualForm.view(data);
      });

      detailForm.on("back", function () {
        detailForm.hide();
        wfSearch.show();
      });
    }
    return detailForm;
  };
  var createWorkflowDesignVirtual = function () {
    if (!virtualForm) {
      virtualForm = new iNet.ui.onegate.superadmin.WorkflowDesignVirtualService();
      virtualForm.on("back", function () {
        virtualForm.hide();
        wfSearch.show();
      });
    }
    
    return virtualForm;
  };

  wfSearch.on("update", function (data) {
    wfSearch.hide();
    var widget = createWorkflowDesignDetail();
    widget.show();
    widget.view(data);
  });

  wfSearch.on("design", function (data) {
    wfSearch.hide();
    if (detailForm) {
      detailForm.hide();
    }
    
    var widgetDesign = createWorkflowDesignVirtual();
    widgetDesign.view(data);
    widgetDesign.show();
  });
}); 
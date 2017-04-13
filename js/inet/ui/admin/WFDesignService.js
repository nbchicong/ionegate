// #PACKAGE: ionegate-admin-wf-design
// #MODULE: AdminWorkflowDesignService
$(function () {
  var wfSearch = new iNet.ui.onegate.admin.WorkflowDesignSearchService({
    display: true
  });
  var virtualForm = null;

  var createWorkflowDesignVirtual = function () {
    if (!virtualForm) {
      virtualForm = new iNet.ui.onegate.admin.WorkflowDesignVirtualService();
      virtualForm.on("back", function () {
        virtualForm.hide();
        wfSearch.show();
      });
    }
    return virtualForm;
  };

  wfSearch.on("design", function (data) {
    if (wfSearch) {
      wfSearch.hide();
    }
    var wg = createWorkflowDesignVirtual();
    wg.show();
    wg.view(data);
  });

}); 
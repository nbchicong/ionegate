// #PACKAGE: ionegate-superadmin-wf-actor
// #MODULE: SuperadminWorkflowActorService
$(function () {
  var wfSearch = new iNet.ui.onegate.superadmin.WorkflowActorSearchService({
    display: true
  });
  var detailForm = null;
  var createWorkflowActorDetailService = function () {
    if (!detailForm) {
      detailForm = new iNet.ui.onegate.superadmin.WorkflowActorDetailService();
      detailForm.on("created", function (data) {
        wfSearch.reload();
      });
      detailForm.on("back", function () {
        detailForm.hide();
        wfSearch.show();
      });
    }
    return detailForm;
  };

  wfSearch.on("create", function () {
    wfSearch.hide();
    var widget= createWorkflowActorDetailService();
    widget.show();
    widget.reset();
  });
  wfSearch.on("edit", function (record) {
    wfSearch.hide();
    var widget= createWorkflowActorDetailService();
    widget.show();
    widget.loadData(record);
  });
}); 
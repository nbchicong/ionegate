// #PACKAGE: ionegate-admin-wf-actor
// #MODULE: WorkflowActorService
$(function () {
  var wfSearch = new iNet.ui.admin.WorkflowActorSearchService({
    display: true
  });
  var detailForm = null;
  var createWorkflowMapActor = function () {
    if (!detailForm) {
      detailForm = new iNet.ui.admin.WorkflowMapActorService();
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
    var wg = createWorkflowMapActor();
    wfSearch.hide();
    wg.show();
    wg.reset();
  });
  wfSearch.on("edit", function (record) {
    wfSearch.hide();
    var wg = createWorkflowMapActor();
    wg.show();
    wg.loadData(record);
  });

}); 
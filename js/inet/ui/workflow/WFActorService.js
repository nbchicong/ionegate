// #PACKAGE: admin-wf-actor
// #MODULE: WorkflowActorService
$(function() {
  var wfSearch = new iNet.ui.admin.WorkflowActorSearchService({
    display: true
  });
  
  wfSearch.on("create", function(){
	wfSearch.hide();
    detailForm.show();
    detailForm.reset();
  });
  wfSearch.on("edit", function(record){
	  wfSearch.hide();
	  detailForm.show();
	  detailForm.loadData(record);
  });
  // detail procedure form ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  var detailForm = new iNet.ui.admin.WorkflowMapActorService();

  detailForm.on("created", function(data){
	  wfSearch.reload();
  });

  detailForm.on("back", function(){
    detailForm.hide();
    wfSearch.show();
  });
}); 
// #PACKAGE: admin-wf
// #MODULE: WorkflowService
$(function() {
  var wfSearch = new iNet.ui.admin.WorkflowSearchService({
    display: true
  });
  
  wfSearch.on("create", function(){
    detailForm.setData({});
	wfSearch.hide();
    detailForm.show();
  });
  wfSearch.on("edit", function(record){
	  wfSearch.hide();
	  detailForm.show();
	  detailForm.loadData(record.uuid);
  });
  // detail procedure form ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  var detailForm = new iNet.ui.admin.WorkflowDetailService();

  detailForm.on("save", function(data){
    var __data = data || {};
    // save success
    detailForm.setData(__data);
    wfSearch.addRow(__data);

  });

  detailForm.on("updated", function(data){
    var __data = data || {};
    wfSearch.updateRow(__data);
  });

  detailForm.on("back", function(){
    detailForm.hide();
    wfSearch.show();
  });
}); 
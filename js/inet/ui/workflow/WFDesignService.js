// #PACKAGE: admin-wf-design
// #MODULE: WorkflowServiceDesign
$(function() {
  var wfSearch = new iNet.ui.admin.WorkflowSearchService({
    display: true
  });
  
  wfSearch.on("create", function(){
	wfSearch.hide();
    detailForm.show();
  });
  wfSearch.on("edit", function(record){
	  wfSearch.hide();
	  detailForm.show();
	  detailForm.setTitle(record.brief);
	  detailForm.reset();
	  detailForm.loadData(record.uuid);
  });
  // detail procedure form ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  var detailForm = new iNet.ui.admin.WorkflowDesignVirtualService();

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
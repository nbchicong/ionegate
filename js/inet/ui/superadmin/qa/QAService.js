/**
 * Created by thoangtd on 12/5/13.
 */
// #PACKAGE: onegate-superadmin-support-qa-service
// #MODULE: SearchWidget

$(function () {
  var searchWidget = new iNet.ui.superadmin.support.qa.SearchWidget({
    id: 'qa-search-qa-widget'
  });
  searchWidget.on("view", function(data){
    getContentWidget().setData(data);
    getContentWidget().show();
  });

  var contentWidget = null;
  var getContentWidget = function(){
    if(contentWidget == null) {
      contentWidget = new iNet.ui.superadmin.support.qa.ContentWidget();
      contentWidget.on("back", function(){
        searchWidget.show();
      });
      contentWidget.on("change", function(){
        searchWidget.search();
      })
    }
    return contentWidget;
  }
});

// #PACKAGE: officer-report-office-situation-main
// #MODULE: OfficeSituationMain
/**
 * BAO CAO TINH HINH TIEP NHAN HO SO MOT CUA
 * Created by VanHuyen on 21/05/2015.
 */
$(function() {
  var $window = $(window);
  var reportList = new iNet.ui.onegate.officer.OfficeSituationList({
    allowCreate: true
  });
  var reportView = new iNet.ui.onegate.officer.OfficeSituation({
    allowCreate: true,
    allowMatcher: true
  });

  var module = 'REPORT_OFFICER_SITUATION';

  var onResize = function(){
    var winHeight = $window.height();
    reportList.setHeight(winHeight);
    reportView.setHeight(winHeight-3);
    var $divView = $('.dp-container,.dp-content');
    $divView.height(winHeight-44);
    $('.dp-content').slimscroll({
      height: 'auto'
    });

  };
  $window.resize(onResize);

  reportList.on('open', function(id, data, node) {
    var __id = id || '';
    var __data = data || {};
    if (!iNet.isEmpty(__id)) {
      var __params = {
        reportId: __id,
        firm: iNet.pattern,
        startDate: new Date(__data.startDate).format(iNet.dateFormat),
        endDate: new Date(__data.endDate).format(iNet.dateFormat)
      };
      reportView.load(__params, data, node);
    }
  });

  reportList.on('create', function() {
    reportView.create();
  });

  reportList.on('deleted', function(ids) {
    var __ids = ids || [];
    if(reportView) {
      if (__ids.indexOf(reportView.getUuid()) >= 0){
        reportView.clear();
      }
    }
  });

  var iHistory = new iNet.ui.form.History();
  iHistory.setRoot(reportView);
  iHistory.on('back', function(widget){
    if(widget) {
      widget.show();
    }
  });
  var historyBack = function(){
    iHistory.back();
  };

  reportView.on('delete', function(id){
    var __id = id || '';
    if (!iNet.isEmpty(__id)) {
      reportList.deleteReport(__id);
    }
  });

  reportView.on('saved', function (isSave, data) {
    if (isSave) {
      reportList.search();
    }
  });

  reportView.on('beforeresize', function(){
    if(reportView){
      if(!reportView.isFullScreen()){
        reportList.hide();
      } else {
        reportList.show();
      }
    }
  });

  reportView.on('move', function(action, node, allowLoad, data){
    var __paging = reportList.getPaging();
    var __idProperty = __paging.getIdProperty();
    if(!!allowLoad) {

      if(action=='next') {
        __paging.next(function(){
          var __store = __paging.getStore();
          node= __store[0] || {};
          reportList.open(node[__idProperty]);
        });
      } else if(action=='prev'){
        __paging.prev(function(){
          var __store = __paging.getStore();
          node= __store[__store.length-1] || {};
          reportList.open(node[__idProperty]);
        });
      }
    } else {
      reportList.open(node[__idProperty]);
    }
  });

  onResize();
}); 
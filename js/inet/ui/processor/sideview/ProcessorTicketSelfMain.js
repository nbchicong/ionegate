// #PACKAGE: processor-ticket-self-main
// #MODULE: ProcessorTicketSelfMainService
$(function() {
  var $window = $(window);
  var ticketList = new iNet.ui.onegate.processor.TicketList();
  var ticketView = new iNet.ui.onegate.processor.TicketView();
  var viewFileWidget= null;

  var onResize = function(){
    var winHeight = $window.height();
    ticketList.setHeight(winHeight);
    ticketView.setHeight(winHeight);
    var $divView = $('.dp-container,.dp-content');
    $divView.height(winHeight-45);
    $('.dp-content').slimscroll({
      height: 'auto'
    });

  };
  $window.resize(onResize);

  var iHistory = new iNet.ui.form.History();
  iHistory.setRoot(ticketView);
  iHistory.on('back', function(widget){
    if(widget) {
      widget.show();
    }
  });
  var historyBack = function(){
    iHistory.back();
  };

  var createViewFileWidget = function(parent) {
    if (!viewFileWidget) {
      viewFileWidget = new iNet.ui.onegate.ViewFileWidget({});
      viewFileWidget.on('back', historyBack);
    }
    if (parent) {
      viewFileWidget.setParent(parent);
      parent.hide();
    }
    iHistory.push(viewFileWidget);//history keep
    viewFileWidget.show();
    return viewFileWidget;
  };

  ticketList.on('edit', function(widget, data, node){
    var __data = data || {};
    if(ticketView.isHidden()) {
      if(viewFileWidget)
        viewFileWidget.hide();
      ticketView.show();
    }
    if (!iNet.isEmpty(__data.recordID) && !iNet.isEmpty(__data.procedureID)) {
      ticketView.setProcedureName(__data.subject);
      ticketView.setTaskId(__data.taskID);
      ticketView.setNode(node);
      ticketView.load({
        ticket: __data.recordID,
        procedure: __data.procedureID
      });

    }
  });

  ticketView.on('back', historyBack);
  ticketView.on('openfile', function(params,files) {
    var __viewerDoc = createViewFileWidget(ticketView);
    __viewerDoc.setParams(params);
    __viewerDoc.setFiles(files);
    __viewerDoc.load();
  });

  ticketView.on('beforeresize', function(){
    if(ticketView){
      if(!ticketView.isFullScreen()){
        ticketList.hide();
      } else {
        ticketList.show();
      }
    }
  });

  ticketView.on('execute', function(){
    ticketView.clear();
    ticketList.search();
  });

  ticketView.on('move', function(action, node, allowLoad, data){
    var __paging = ticketList.getPaging();
    var __idProperty = __paging.getIdProperty();
    if(!!allowLoad) {
      if(action=='next') {
        __paging.next(function(){
          var __store = __paging.getStore();
          node= __store[0] || {};
          ticketList.open(node[__idProperty]);
        });
      } else if(action=='prev'){
        __paging.prev(function(){
          var __store = __paging.getStore();
          node= __store[__store.length-1] || {};
          ticketList.open(node[__idProperty]);
        });
      }
    } else {
      ticketList.open(node[__idProperty]);
    }
  });

  onResize();
}); 
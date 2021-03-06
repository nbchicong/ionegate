// #PACKAGE: receiver-ticket-self-main
// #MODULE: ReceiverTicketSelfMainService
$(function() {
  var $window = $(window);
  var ticketList = new iNet.ui.onegate.receiver.TicketList({
    allowCreate: true,
    print: true
  });
  var ticketView = new iNet.ui.onegate.receiver.TicketView({
    allowCreate: true,
    allowMatcher: true
  });
  var ticketReturnWidget= null, viewFileWidget= null,ticketSubmitWidget = null, ticketPaymentWidget = null;
  var procedureDialog= null, notify=null;
  var createNotify = function () {
    if (!notify) {
      notify = new iNet.ui.form.Notify();
    }
    return notify;
  };

  var createProcedureDialog = function () {
    if (!procedureDialog) {
      procedureDialog = new iNet.ui.dialog.ProcedureDialog();
      procedureDialog.on('select', function(records, control){
        var __records = records || [];
        if(__records.length>0) {
          var __record = __records[0];
          procedureDialog.hide();
          ticketView.setProcedureName(__record.subject);
          ticketView.setProfileId(null);
          ticketView.load({
            ticket: null,
            procedure: __record.procedureID
          });

        } else {
          var __notify= createNotify();
          __notify.setTitle(iNet.resources.onegate.ticket.dlg_select_procedure);
          __notify.setType('error');
          __notify.setContent(iNet.resources.onegate.ticket.dlg_select_procedure_error);
          __notify.show();
        }
      });
    }
    return procedureDialog;
  };

  var onResize = function(){
    var winHeight = $window.height();
    ticketList.setHeight(winHeight);
    ticketView.setHeight(winHeight-3);
    var $divView = $('.dp-container,.dp-content');
    $divView.height(winHeight-44);
    $('.dp-content').slimscroll({
      height: 'auto'
    });

  };
  $window.resize(onResize);

  ticketList.on('edit', function(widget, data, node){
    var __data = data || {};
    if(ticketView.isHidden()) {
      if(ticketReturnWidget)
        ticketReturnWidget.hide();
      if(viewFileWidget)
        viewFileWidget.hide();
      if (ticketSubmitWidget)
        ticketSubmitWidget.hide();
      if (ticketPaymentWidget)
        ticketPaymentWidget.hide();
      ticketView.show();
    }
    if (!iNet.isEmpty(__data.recordID) && !iNet.isEmpty(__data.procedureID)) {
      ticketView.setProcedureName(__data.subject);
      ticketView.setGraphId(__data.graphID);
      ticketView.setUUID(__data.uuid);
      ticketView.setProfileId(__data.profileID);
      ticketView.setTicket(__data);
      ticketView.setNode(node);
      ticketView.load({
        ticket: __data.recordID,
        procedure: __data.procedureID
      });
    }
  });

  ticketList.on('create', function(wg, industry) {
    var dialog = createProcedureDialog();
    dialog.show();
  });

  ticketList.on('deleted', function(wg, result) {
    if(ticketView) {
      ticketView.clear();
    }
  });

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


  var createTicketPaymentWidget = function (parent) {
    if (!ticketPaymentWidget) {
      ticketPaymentWidget = new iNet.ui.onegate.receiver.TicketPaymentWidget();
      ticketPaymentWidget.on('back', historyBack);
      ticketPaymentWidget.on('paid', function(){
      });
    }
    if(parent) {
      ticketPaymentWidget.setParent(parent);
      parent.hide();
    }
    if(iHistory && ticketPaymentWidget) {
      iHistory.push(ticketPaymentWidget);
    }
    ticketPaymentWidget.show();
    return ticketPaymentWidget;
  };

  var createTicketReturnWidget = function (parent) {
    if (!ticketReturnWidget) {
      ticketReturnWidget = new iNet.ui.onegate.receiver.TicketReturnWidget();
      ticketReturnWidget.on('back', historyBack);
      ticketReturnWidget.on('returned', function(){
        if(ticketList) {
          ticketList.search();
        }
        if(ticketView) {
          ticketView.clear();
        }
      });
      ticketReturnWidget.on('saved', function(result){
        var __result = result || {};
        if(ticketView) {
          ticketView.fillResult(__result.items || []);
        }
      });
    }
    if(parent) {
      ticketReturnWidget.setParent(parent);
      parent.hide();
    }
    if(iHistory && ticketReturnWidget) {
      iHistory.push(ticketReturnWidget);
    }
    ticketReturnWidget.show();
    return ticketReturnWidget;
  };

  var createTicketSubmitWidget = function (parent) {
    if (!ticketSubmitWidget) {
      ticketSubmitWidget = new iNet.ui.onegate.receiver.TicketSubmitWidget();
      ticketSubmitWidget.on('back', historyBack);
      ticketSubmitWidget.on('success', function(result,wg){
        ticketSubmitWidget.hide();
        ticketView.show();
        ticketView.clear();
        ticketList.search();
      });
    }
    if(parent) {
      ticketSubmitWidget.setParent(parent);
      parent.hide();
    }
    if(iHistory && ticketSubmitWidget) {
      iHistory.push(ticketSubmitWidget);
    }
    ticketSubmitWidget.show();
    return ticketSubmitWidget;
  };

  ticketView.on('back', historyBack);
  ticketView.on('openfile', function(params,files) {
    var __viewerDoc = createViewFileWidget(ticketView);
    __viewerDoc.setParams(params);
    __viewerDoc.setFiles(files);
    __viewerDoc.load();
  });

  ticketView.on('changedstatus', function(wg, data){
  });

  ticketView.on('reject_record', function (data) {
    ticketList.search();
  });

  ticketView.on('selectprocedure', function(){
    var dialog= createProcedureDialog();
    dialog.show();
  });

  ticketView.on('paid', function (wg, data) {
    var __data = data || {};
    var __widget = createTicketPaymentWidget(wg);
    __widget.setData(__data);
  });

  ticketView.on('return', function (wg, data) {
    var __data = data || {};
    var __widget = createTicketReturnWidget(wg);
    __widget.setRecord(__data);
  });

  ticketView.on('submit', function (wg, data) {
    var __data = data || {};
    var __widget = createTicketSubmitWidget(wg);
    __widget.setData(__data);
  });

  ticketView.on('saved', function (isSave, data) {
    if(isSave) {
      ticketList.search();
    }
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
// #PACKAGE: processor-ticket-self
// #MODULE: ProcesserTicketSelfService
$(function () {
  //~========================EXECUTE SERVICE========================
  var notify = null;
  var mainWidget= null, ticketWidget = null,viewFileWidget= null;
  var iHistory = new iNet.ui.form.History();
  iHistory.on('back', function(widget){
    if(widget) {
      widget.show();
    }
  });
  var historyBack = function(){
    iHistory.back();
  };

  var createNotify = function () {
    if (!notify) {
      notify = new iNet.ui.form.Notify();
    }
    return notify;
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

  var createRecordWidget = function (parent) {
    if (!ticketWidget) {
      ticketWidget = new iNet.ui.onegate.processor.ProcessorTicketWidget({
        allowCreate: false,
        allowMatcher: false
      });

      ticketWidget.on('back', historyBack);

      ticketWidget.on('saved', function(isSaved, data){
        var __data= data || {};
        if(mainWidget) {
          var grid= mainWidget.getGrid();
          if(!grid){
            return;
          }
          if(isSaved) {
            grid.insert(__data);
          }else {
            grid.update(__data);
            grid.commit();
          }
        }
      });

      ticketWidget.on('execute', function(){
        iHistory.back();
        if(mainWidget) {
          mainWidget.show();
          var grid= mainWidget.getGrid();
          grid.load();
        }
      });

      ticketWidget.on('openfile', function(params,files) {
        var __viewerDoc = createViewFileWidget(ticketWidget);
        __viewerDoc.setParams(params);
        __viewerDoc.setFiles(files);
        __viewerDoc.load();
      });
    }
    if(parent) {
      ticketWidget.setParent(parent);
      parent.hide();
    }
    if(iHistory && ticketWidget.isHidden()) {
      iHistory.push(ticketWidget);
    }
    ticketWidget.show();
    return ticketWidget;
  };


  var createMainWidget = function() {
    if(!mainWidget) {
      mainWidget = new iNet.ui.onegate.processor.ProcessorTicketSearchWidget();
      mainWidget.on('edit', function (wg, data) {
        var __data = data || {};
        var __widget = createRecordWidget(wg);
        if (!iNet.isEmpty(__data.recordID) && !iNet.isEmpty(__data.procedureID)) {
          __widget.setProcedureName(__data.subject);
          __widget.setTaskId(__data.taskID);
          __widget.load({
            ticket: __data.recordID,
            procedure: __data.procedureID
          });
        }
      });
      mainWidget.on('changedstatus', function(wg, data){
        var __data= data || {};
        if(mainWidget) {
          var grid = mainWidget.getGrid();
          if (!grid) {
            return;
          }
          grid.update(__data);
          grid.commit();
          var __notify= createNotify();
          __notify.setTitle(iNet.resources.onegate.ticket.title);
          __notify.setType('success');
          __notify.setContent(iNet.resources.onegate.ticket.return_success);
          __notify.show();
        }
      });
      mainWidget.load();
    }
    return mainWidget;
  };

  var main = createMainWidget();
  iHistory.setRoot(main);
});
// #PACKAGE: receiver-ticket-processing
// #MODULE: TicketProcessedService
$(function () {
  //~========================EXECUTE SERVICE========================
  var notify = null;
  var mainWidget= null, recordWidget = null, procedureDialog= null;
  var viewFileWidget= null;
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

  var createProcedureDialog = function () {
    if (!procedureDialog) {
      procedureDialog = new iNet.ui.dialog.ProcedureDialog();
      procedureDialog.on('select', function(records, control){
        var __records = records || [];
        if(__records.length>0) {
          var __record = __records[0];
          procedureDialog.hide();
          var __widget = createRecordWidget(mainWidget);
          __widget.setProcedureName(__record.subject);
          __widget.load({
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

  var createRecordWidget = function (parent) {
    if (!recordWidget) {
      recordWidget = new iNet.ui.onegate.receiver.TicketWidget({
        allowMatcher: true,
        processingUI: true
      });
      recordWidget.on('back', historyBack);
      recordWidget.on('selectprocedure', function(){
        var dialog= createProcedureDialog();
        dialog.show();
      });
      recordWidget.on('saved', function(isSaved, data){
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

      recordWidget.on('openfile', function(params,files) {
        var __viewerDoc = createViewFileWidget(recordWidget);
        __viewerDoc.setParams(params);
        __viewerDoc.setFiles(files);
        __viewerDoc.load();
      });
    }
    if(parent) {
      recordWidget.setParent(parent);
      parent.hide();
    }
    if(iHistory && recordWidget.isHidden()) {
      iHistory.push(recordWidget);
    }
    recordWidget.show();
    return recordWidget;
  };


  var createMainWidget = function() {
    if(!mainWidget) {
      mainWidget = new iNet.ui.onegate.receiver.TicketSearchWidget({
        url: iNet.getXUrl('onegate/dept/inprocessreceiver'),
        processingUI: true
      });
      mainWidget.on('create', function(wg, industry) {
        var dialog = createProcedureDialog();
        dialog.show();
      });
      mainWidget.on('edit', function (wg, data) {
        var __data = data || {};
        var __widget = createRecordWidget(wg);
        if (!iNet.isEmpty(__data.recordID) && !iNet.isEmpty(__data.procedureID)) {
          __widget.setProcedureName(__data.subject);
          __widget.setUUID(__data.uuid);
          __widget.setGraphId(__data.graphID);
          __widget.setProfileId(__data.profileID);
          __widget.setTicket(__data);
          __widget.load({
            ticket: __data.recordID,
            procedure: __data.procedureID
          });
        }
      });
      mainWidget.on('changedstatus', function(wg, data){
        //var __data= data || {};
        if(mainWidget) {
          var __notify= createNotify();
          __notify.setTitle(iNet.resources.onegate.ticket.title);
          __notify.setType('success');
          __notify.setContent(iNet.resources.onegate.ticket.verified_success);
          __notify.show();
          var grid = mainWidget.getGrid();
          if (grid) {
            grid.load();
          }
        }
      });
      mainWidget.load();
    }
    return mainWidget;
  };

  var main = createMainWidget();
  iHistory.setRoot(main);
});
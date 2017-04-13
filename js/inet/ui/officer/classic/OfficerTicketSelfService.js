// #PACKAGE: officer-ticket-self
// #MODULE: OfficerTicketSelfService
$(function () {
  //~========================EXECUTE SERVICE========================
  var notify = null;
  var mainWidget= null, ticketWidget = null, procedureDialog= null;
  var viewFileWidget= null,ticketReturnWidget=null;
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

  var createTicketReturnWidget = function (parent) {
    if (!ticketReturnWidget) {
      ticketReturnWidget = new iNet.ui.onegate.receiver.TicketReturnWidget({
        allowSave: false,
        url: iNet.getXUrl('onegate/office/ticketstatus')
      });
      ticketReturnWidget.on('back', historyBack);
      ticketReturnWidget.on('return', function(){
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


  var createOfficerProcedureDialog = function () {
    if (!procedureDialog) {
      procedureDialog = new iNet.ui.dialog.OfficerProcedureDialog();
      procedureDialog.on('select', function(records, control){
        var __records = records || [];
        if(__records.length>0) {
          var __record = __records[0];
          procedureDialog.hide();
          var __widget = createRecordWidget(mainWidget);
          __widget.setProcedureName(__record.subject);
          __widget.setProfileId(null);
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
    if (!ticketWidget) {
      ticketWidget = new iNet.ui.onegate.receiver.TicketWidget({
        allowCreate: true,
        allowMatcher: false,
        officer: true
      });
      ticketWidget.setUrl({
        load: iNet.getXUrl('onegate/office/svcl3request'),
        submit:  iNet.getXUrl('onegate/office/ticketsubmit')
      });
      ticketWidget.on('back', historyBack);
      ticketWidget.on('selectprocedure', function(){
        var dialog= createOfficerProcedureDialog();
        dialog.show();
      });
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
      ticketWidget.on('openfile', function(params,files) {
        var __viewerDoc = createViewFileWidget(ticketWidget);
        __viewerDoc.setParams(params);
        __viewerDoc.setFiles(files);
        __viewerDoc.load();
      });

      ticketWidget.on('return', function (wg, data) {
        var __data = data || {};
        var __widget = createTicketReturnWidget(wg);
        __widget.setRecord(__data);
      });

      ticketWidget.on('submit', function (wg, uuid) {
        if(iNet.isEmpty(uuid)) {
          return;
        }
        $.postJSON(iNet.getXUrl('onegate/office/ticketesb'), {
          tickets: uuid
        }, function (result) {
          var __result = result || {};
          var __notify= createNotify();
          __notify.setTitle(iNet.resources.onegate.ticket.title);
          if(__result.type == 'ERROR') {
            __notify.setType('error');
            __notify.setContent('Có lỗi xảy ra khi chuyển phòng chức năng xử lý');
          }
          else {
            ticketWidget.hide();
            mainWidget.show();
            var grid = mainWidget.getGrid();
            if(grid) {
              grid.load();
            }
            __notify.setType('success');
            __notify.setContent('Hồ sơ đã được chuyển phòng chức năng xử lý');
          }
          __notify.show();
        }, {mask: wg.getMask(), msg: iNet.resources.ajaxLoading.acting});
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
      mainWidget = new iNet.ui.onegate.officer.OfficerTicketSearchWidget();

      mainWidget.on('create', function(wg, industry) {
        var dialog = createOfficerProcedureDialog();
        dialog.show();
      });
      mainWidget.on('edit', function (wg, data) {
        var __data = data || {};
        var __widget = createRecordWidget(wg);
        if (!iNet.isEmpty(__data.recordID) && !iNet.isEmpty(__data.procedureID)) {
          __widget.setProcedureName(__data.subject);
          __widget.setGraphId(__data.graphID);
          __widget.setUUID(__data.uuid);
          __widget.setProfileId(__data.profileID);
          __widget.setTicket(__data);
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

      mainWidget.on('transferesb', function(wg, ids, data){
        var __data= data || {};
        if(mainWidget) {
          var __notify= createNotify();
          __notify.setTitle(iNet.resources.onegate.ticket.title);
          if(__data.type == 'ERROR') {
            __notify.setType('error');
            __notify.setContent('Có lỗi xảy ra khi chuyển phòng chức năng xử lý');
          }
          else {
            var grid = mainWidget.getGrid();
            if(grid) {
              grid.remove(ids.join(';'));
              grid.commit();
            }
            __notify.setType('success');
            __notify.setContent('Hồ sơ đã được huyển phòng chức năng xử lý');
          }
          __notify.show();
        }
      });

      mainWidget.on('return', function (wg, data) {
        var __data = data || {};
        var __widget = createTicketReturnWidget(wg);
        __widget.setRecord(__data);
      });

      mainWidget.load();
    }
    return mainWidget;
  };

  var main = createMainWidget();
  iHistory.setRoot(main);
});
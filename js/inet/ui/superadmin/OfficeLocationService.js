// #PACKAGE: superadmin-office-service-102320150521
// #MODULE: OfficeLocationService
// 
/**
 * Copyright (c) 2015 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 21/05/2015.
 * -------------------------------------------
 * @project ionegate
 * @file OfficeLocationService
 * @author nbchicong
 */
$(function () {
  //~========================EXECUTE SERVICE========================
  var notify = null;
  var mainWidget= null, officeWidget = null, officeProcedureWidget= null;
  var listPaytransWg = null;
  var payTransDetailWg = null;
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
  var createOfficerWidget = function (parent) {
    if (!officeWidget) {
      officeWidget = new iNet.ui.onegate.superadmin.OfficeLocationWidget();
      officeWidget.on('back', historyBack);
      officeWidget.on('saved', function (isSave, data) {
        var __data = data || {};
        var __notify = createNotify();
        __notify.setTitle('Dịch vụ tại nhà');
        if (__data.type == "ERROR") {
          __notify.setType('error');
          __notify.setContent('Có lỗi xảy ra khi lưu dữ liệu !');
          __notify.show();
        } else {
          __notify.setType('success');
          var main = createMainWidget();
          var grid= main.getGrid();
          if (isSave) {
            grid.insert(__data);
            __notify.setContent('Thông tin đơn vị đã được lưu !');
          } else {
            grid.update(__data);
            grid.commit();
            __notify.setContent('Thông tin đơn vị đã được cập nhật !');
          }
          __notify.show();
        }
      });
    }
    if(parent) {
      officeWidget.setParent(parent);
      parent.hide();
    }
    if(iHistory) {
      iHistory.push(officeWidget);
    }
    officeWidget.show();
    return officeWidget;
  };
  var createOfficeProcedureWidget = function (parent) {
    if (!officeProcedureWidget) {
      officeProcedureWidget = new iNet.ui.onegate.superadmin.OfficeProcedureWidget();
      officeProcedureWidget.on('back', historyBack);
    }
    if(parent) {
      officeProcedureWidget.setParent(parent);
      parent.hide();
    }
    if(iHistory) {
      iHistory.push(officeProcedureWidget);
    }
    officeProcedureWidget.show();
    return officeProcedureWidget;
  };
  var loadViewDetailPayTransWg = function (parent) {
    if (!payTransDetailWg) {
      payTransDetailWg = new iNet.ui.onegate.superadmin.OnlinePaymentDetailWidget();
      payTransDetailWg.on('back', historyBack);
    }
    if (parent) {
      payTransDetailWg.setParent(parent);
      parent.hide();
    }
    if (iHistory) {
      iHistory.push(payTransDetailWg);
    }
    payTransDetailWg.show();
    return payTransDetailWg;
  };
  var loadPayTransWg = function (parent) {
    if (!listPaytransWg) {
      listPaytransWg = new iNet.ui.onegate.superadmin.OfficeListPayTransWidget();
      listPaytransWg.on('back', historyBack);
      listPaytransWg.on('view', function (wg, record) {
        var __record = record || {};
        var __wg = loadViewDetailPayTransWg(wg);
        $.postJSON(iNet.getUrl('onegate/office/transaction/detail'), __record || {}, function (result) {
          __record.detail[0].paidNo = iNet.isEmpty(result.expenseLX)?0:result.expenseLX;
          __wg.setData(__record);
        });
      });
    }
    if (parent) {
      listPaytransWg.setParent(parent);
      parent.hide();
    }
    if (iHistory) {
      iHistory.push(listPaytransWg);
    }
    listPaytransWg.show();
    return listPaytransWg;
  };
  var createMainWidget = function() {
    if(!mainWidget) {
      mainWidget = new iNet.ui.onegate.superadmin.OfficeLocationSearchWidget();
      mainWidget.on('create', function(wg) {
        var __widget = createOfficerWidget(wg);
        __widget.resetData();
      });
      mainWidget.on('edit', function (wg, data) {
        var __data = data || {};
        var __widget = createOfficerWidget(wg);
        __widget.setData(__data);
      });

      mainWidget.on('prosignedlist', function(wg, record) {
        var __record = record || {};
        var __widget = createOfficeProcedureWidget(wg);
        __widget.setUnitName(__record.name);
        __widget.loadProcedureByOfficeId(__record.uuid);
      });

      mainWidget.on('list_paytrans', function (wg, record) {
        var __wg = loadPayTransWg(wg);
        __wg.setParams({firm: record.prefix});
        __wg.load();
      });

    }
    return mainWidget;
  };
  var main = createMainWidget();
  iHistory.setRoot(main);
});
/**
 * #PACKAGE: onegate-unit-main
 * #MODULE: UnitMain
 */
/**
 * Copyright (c) 2017 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 10:12 AM 07/10/2017.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file UnitMain.js
 */
$(function () {
  //~========================EXECUTE SERVICE========================
  var mainWidget= null, departmentWidget = null,procedureSignedWidget = null;
  var iHistory = new iNet.ui.form.History();

  iHistory.on('back', function(widget){
    if(widget) {
      widget.show();
    }
  });
  var historyBack = function(){
    iHistory.back();
  };

  var createDepartmentWidget = function (parent) {
    if (!departmentWidget) {
      departmentWidget = new iNet.ui.onegate.superadmin.DepartmentWidget();
      departmentWidget.on('back', historyBack);
      departmentWidget.on('saved', function (isSave, data) {
        var __node = data || {};
        mainWidget = createMainWidget();
        if (isSave) {
          mainWidget.getTree().addNode(__node);
        } else {
          mainWidget.getTree().updateNode(__node);
        }
      });
    }
    if(parent) {
      departmentWidget.setParent(parent);
      parent.hide();
    }
    if(iHistory) {
      iHistory.push(departmentWidget);
    }
    departmentWidget.show();
    return departmentWidget;
  };

  var createProcedureSignedWidget = function (parent) {
    if (!procedureSignedWidget) {
      procedureSignedWidget = new iNet.ui.onegate.superadmin.ProcedureSignedWidget();
      procedureSignedWidget.on('back', historyBack);
    }
    if(parent) {
      procedureSignedWidget.setParent(parent);
      parent.hide();
    }
    if(iHistory) {
      iHistory.push(procedureSignedWidget);
    }
    procedureSignedWidget.show();
    return procedureSignedWidget;
  };

  var createMainWidget = function() {
    if(!mainWidget) {
      mainWidget = new iNet.ui.onegate.superadmin.OrganizeUsersWidget();
      mainWidget.on('create', function(wg, node) {
        var __node = node;
        departmentWidget = createDepartmentWidget(wg);
        departmentWidget.setParentNode(__node);
        departmentWidget.resetData();
      });
      mainWidget.on('edit', function (wg, node) {
        var __node = node || {};
        var __widget = createDepartmentWidget(wg);
        __widget.setData(__node);
      });

      mainWidget.on('prosignedlist', function(wg, node) {
        var __node = node || {};
        procedureSignedWidget = createProcedureSignedWidget(wg);
        procedureSignedWidget.setUnitName(__node.name);
        procedureSignedWidget.loadProcedureByOrgCode(__node.orgcode);
      });
    }
    return mainWidget;
  };

  var main = createMainWidget();
  iHistory.setRoot(main);
});

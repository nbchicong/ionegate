// #PACKAGE: onegate-superadmin-process-state-report-mng-widget
// #MODULE: ProcessStateReportMngWidget
/**
 * Copyright (c) 2015 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 08/05/2015.
 * -------------------------------------------
 * @project ionegate-ui
 * @file ProcessStateReportMngWidget
 * @author nbchicong
 */

$(function () {
  iNet.ns('iNet.ui.onegate.superadmin.ProcessStateReportMngWidget');
  iNet.ui.onegate.superadmin.ProcessStateReportMngWidget = function (config) {
    var that = this, __cog = config || {};
    iNet.apply(this, __cog);
    this.id = this.id || 'process-state-report';
    this.$grid = $('#process-state-report-list');
    this.$toolbar = {
      DEL: $('#btn-del-list')
    };
    this.url = {
      list: iNet.getUrl('onegate/report/list'),
      del: iNet.getUrl('onegate/report/delete')
    };
    var confirmDlg = function (deleteId) {
      var __deleteId = deleteId || '';
      that.confirmDialog(iNet.resources.message.dialog_del_confirm_title, iNet.resources.message.dialog_del_confirm_content, function() {
        if (!iNet.isEmpty(__deleteId)) {
          confirm.hide();
          $.postJSON(that.url.del, {reportID: __deleteId}, function() {
            that.grid.remove(__deleteId);
          }, {
            mask: this.getMask(),
            msg: iNet.resources.ajaxLoading.deleting
          });
        }
      }).show();
    };
    var dataSource = new iNet.ui.grid.DataSource({
      columns: [{
      //  type: 'selection',
      //  align: 'center',
      //  width: 30
      //}, {
        label: "STT",
        type: 'rownumber',
        sortable: true,
        width: 60
      }, {
        property: 'name',
        label: "Tên báo cáo",
        sortable: true,
        type: 'label'
      }, {
        property: 'creatorName',
        label: 'Người tạo',
        sortable: true,
        type: 'label',
        width: 180
      }, {
        property: 'created',
        label: "Ngày tạo",
        sortable: true,
        type: 'label',
        renderer: function(item) {
          return new Date(item).format(iNet.dateFormat);
        },
        width: 85
      }, {
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [{
          text: iNet.resources.message.button.del,
          icon: 'ace-icon icon-trash',
          labelCls: 'label label-danger',
          fn: function(record) {
            confirmDlg(record.uuid || '');
          }
        }]
      }]
    });
    this.grid = new iNet.ui.grid.Grid({
      id: this.$grid.prop('id'),
      url: this.url.list,
      dataSource: dataSource,
      idProperty: 'uuid',
      firstLoad: false
    });
    this.grid.on('click', function (record) {
      that.fireEvent('view', record || {});
    });
    //this.grid.on('selectionchange', function (sm, data) {
    //  var records = sm.getSelection();
    //  FormUtils.showButton(that.$toolbar.DEL, records.length > 0);
    //});
    this.$toolbar.DEL.on("click", function() {
      var items = that.grid.getSelectionModel().getSelection();
      var ids = [];
      for (var i = 0; i < items.length; i ++) {
        ids.push(items[i][that.grid.getIdProperty()]);
      }
      confirmDlg(ids.join(','));
    });
    this.loadData();
    iNet.ui.onegate.superadmin.ProcessStateReportMngWidget.superclass.constructor.call(this);
  };
  iNet.extend(iNet.ui.onegate.superadmin.ProcessStateReportMngWidget, iNet.ui.onegate.OnegateWidget, {
    getGrid: function () {
      return this.grid;
    },
    setData: function (data) {
      this.__data = data;
    },
    getData: function () {
      return this.__data;
    },
    _loadProcedures: function () {
      return $.postJSON(this.url.list, {group: 'REPORT_PROCEDURES'}, function (result) {
        return result;
      });
    },
    _loadProvince: function () {
      return $.postJSON(this.url.list, {group: 'REPORT_RESOLVE_PROVINCE'}, function (result) {
        return result;
      });
    },
    _loadResolveUnit: function () {
      return $.postJSON(this.url.list, {group: 'REPORT_RESOLVE_UNIT'}, function (result) {
        return result;
      });
    },
    _loadUsage: function () {
      return $.postJSON(this.url.list, {group: 'REPORT_USAGE'}, function (result) {
        return result;
      });
    },
    loadData: function () {
      var that = this, __data = [];
      $.when(
          this._loadProcedures(),
          this._loadProvince(),
          this._loadResolveUnit(),
          this._loadUsage())
          .done(function (proceduresData, provinceData, unitData, usageData) {
            __data = proceduresData[0].items;
            __data = __data.concat(provinceData[0].items, unitData[0].items, usageData[0].items);
            that.setData(__data);
            that.loadGrid();
          });
    },
    loadGrid: function () {
      this.getGrid().loadData(this.getData());
    }
  });
});
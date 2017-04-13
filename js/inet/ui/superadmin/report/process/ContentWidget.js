// #PACKAGE: onegate-superadmin-report-process-content-widget
// #MODULE: ContentWidget
/**
 * Copyright (c) 2015 iNet Solutions Corp.,
 * Created by Doan Van Huyen <huyendv@inetcloud.vn>
 *         on 23/05/2015.
 * -------------------------------------------
 * @project ionegate-ui
 * @file ContentWidget
 * @author huyendv
 */

$(function () {
  iNet.ns("iNet.ui",
    "iNet.ui.superadmin",
    "iNet.ui.superadmin.report",
    "iNet.ui.superadmin.report.process",
    "iNet.ui.superadmin.report.process.ContentWidget");
  iNet.ui.superadmin.report.process.ContentWidget = function (config) {
    this.id = "report-widget-content";
    var __config = config || {};
    this.module = "";
    iNet.apply(this, __config);

    var that = this;

    this.$input = {
      unit: $('#report-widget-content-unit'),
      industry: $('#report-widget-content-industry'),
      status: $('#report-widget-content-status'),
      fromdate: $("#report-widget-content-fromdate"),
      todate : $("#report-widget-content-todate")
    };
    this.$dialog = $.getCmp("widget-report-modal");
    // validation data save
    this.validation = new iNet.ui.form.Validate({
      id: this.id,
      rules: [{
        id: this.$input.unit.prop("id"),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return that.getText("unit_not_empty");
        }
      },{
        id: this.$input.fromdate.prop("id"),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return that.getText("fromdate_not_empty");
        }
      },{
        id: this.$input.todate.prop("id"),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return that.getText("todate_not_empty");
        }
      }]
    });

    this.fromDate = this.$input.fromdate.datepicker({
    }).on('changeDate', function(ev) {
      that.fromDate.hide();
      that.$input.todate[0].focus();
    }).data('datepicker');

    this.toDate = this.$input.todate.datepicker({
      onRender: function(date) {
        return date.valueOf() <= that.fromDate.date.valueOf() ? 'disabled' : '';
      }
    }).on('changeDate', function(ev) {
      that.toDate.hide();
    }).data('datepicker');

    this.initDepartment();
    this.on ('change_dept', function(e){
      that.loadIndustry(e, function(result){
        that.$input.industry.html(that.renderIndustry(result));
      },{
        msg: iNet.resources.ajaxLoading.loading,
        mask: that.$input.industry.parent()
      });
    });

    iNet.ui.superadmin.report.process.ContentWidget.superclass.constructor.call(this);
    $(window).resize();
  };
  iNet.extend(iNet.ui.superadmin.report.process.ContentWidget, iNet.ui.superadmin.report.ContentWidgetAbstract, {
    getNameReport: function () {
      var __firm = this.getDeptSelection();
      var __firmName = __firm.getData().text;
      return String.format("Báo cáo chi tiết tình hình xử lý hồ sơ một cửa tại {0} từ {1} đến {2}", __firmName, this.getData().startDate, this.getData().endDate);
    },
    getData: function () {
      return {
        firm: this.getDepartment(),
        industry: this.$input.industry.val(),
        status: this.$input.status.val(),
        startDate: this.$input.fromdate.val(),
        endDate: this.$input.todate.val(),
        group: "REPORT_PROCESS"
      }
    },
    renderIndustry: function (industries) {
      var __html = "<option value=''>--------</option>";

      for (var i = 0; i < industries.length; i++) {
        __html += String.format("<option value='{0}'>{1}</option>", industries[i].code, industries[i].name)
      }
      return __html;
    },
    getUrl: function () {
      return iNet.getUrl("xgate/firmreceiver/save")
    },
    setData: function(data){
      var __data = data || {};
      this.setDepartment(__data.firm);
      this.$input.industry.val(__data.industry);
      this.$input.status.val(__data.status);
      this.$input.fromdate.val(new Date(__data.startDate).format("d/m/Y"));
      this.$input.todate.val(new Date(__data.endDate).format("d/m/Y"));
      this.setToolBarMode("view");
      this.setReportID(data.reportID);
      this.loadWidget(data.uuid)
    }
  });
});
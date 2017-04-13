/**
 * #PACKAGE: unit-content-report
 * #MODULE: UnitContentReport
 */
/**
 * Copyright (c) 2017 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 2:40 PM 09/02/2017.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file UnitContentReport.js
 */
$(function () {
  /**
   * @class iNet.ui.superadmin.report.unit.UnitContentReport
   * @extends iNet.ui.superadmin.report.ContentWidgetAbstract
   */
  iNet.ns('iNet.ui.superadmin.report.unit.UnitContentReport');
  iNet.ui.superadmin.report.unit.UnitContentReport = function (options) {
    var _this = this;
    iNet.apply(this, options || {});
    this.id = 'report-widget-content';
    this.$input = {
      unit: $.getCmp("report-widget-content-unit"),
      industry: $.getCmp("report-widget-content-industry"),
      fromdate: $.getCmp("report-widget-content-fromdate"),
      todate : $.getCmp("report-widget-content-todate")
    };
    this.validation = new iNet.ui.form.Validate({
      id: this.id,
      rules: [{
        id: this.$input.fromdate.prop("id"),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return self.getText("fromdate_not_empty");
        }
      }, {
        id: this.$input.todate.prop("id"),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return self.getText("todate_not_empty");
        }
      }]
    });

    this.fromDate = this.$input.fromdate.datepicker({}).on('changeDate', function(ev) {
      _this.fromDate.hide();
      _this.$input.todate[0].focus();
    }).data('datepicker');

    this.toDate = this.$input.todate.datepicker({
      onRender: function(date) {
        return date.valueOf() <= _this.fromDate.date.valueOf() ? 'disabled' : '';
      }
    }).on('changeDate', function(ev) {
      _this.toDate.hide();
    }).data('datepicker');

    iNet.ui.superadmin.report.unit.UnitContentReport.superclass.constructor.call(this);
  };
  iNet.extend(iNet.ui.superadmin.report.unit.UnitContentReport, iNet.ui.superadmin.report.ContentWidgetAbstract, {
    getNameReport: function () {
      return String.format('Báo cáo thống kê số lượng hồ sơ của các đơn vị từ {0} đến {1}', this.getData().startDate, this.getData().endDate);
    },
    getData: function () {
      return {
        startDate: this.$input.fromdate.val(),
        endDate: this.$input.todate.val(),
        group: 'REPORT_UNIT'
      };
    },
    getUrl: function () {
      return iNet.getUrl('xgate/hcmreport/save')
    },
    setData: function(data) {
      var __data = data || {};
      this.$input.fromdate.val(new Date(__data.startDate).format('d/m/Y'));
      this.$input.todate.val(new Date(__data.endDate).format('d/m/Y'));
      this.setReportID(__data.reportID);
      this.setToolBarMode('view');
      this.loadWidget(__data.uuid);
    }
  });
});

/**
 * #PACKAGE: unit-search-report
 * #MODULE: UnitSearchReport
 */
/**
 * Copyright (c) 2017 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 2:08 PM 09/02/2017.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file UnitSearchReport.js
 */
$(function () {
  /**
   * @class iNet.ui.superadmin.report.unit.UnitSearchReport
   * @extends iNet.ui.superadmin.report.SearchWidgetAbstract
   */
  iNet.ns('iNet.ui.superadmin.report.unit.UnitSearchReport');
  iNet.ui.superadmin.report.unit.UnitSearchReport = function (options) {
    var _this = this;
    iNet.apply(this, options || {});
    this.id = 'report-search-unit';
    this.module = '';
    this.$grid = $.getCmp('report-search-grid');

    /**
     * @class BasicSearch
     * @extends iNet.ui.grid.AbstractSearchForm
     */
    var BasicSearch = function () {
      this.id = 'report-basic-search';
    };

    iNet.extend(BasicSearch, iNet.ui.grid.AbstractSearchForm, {
      intComponent: function () {
        var __me = this;
        this.$timeFrom = $.getCmp(this.getId()).find('#time-report-from');
        this.$timeTo = $.getCmp(this.getId()).find('#time-report-to');

        this.fromDate = this.$timeFrom.datepicker({
        }).on('changeDate', function(ev) {
          __me.fromDate.hide();
          __me.$timeTo[0].focus();
        }).data('datepicker');

        this.toDate = this.$timeTo.datepicker({
          onRender: function(date) {
            return date.valueOf() <= __me.fromDate.date.valueOf() ? 'disabled' : '';
          }
        }).on('changeDate', function(ev) {
          __me.toDate.hide();
        }).data('datepicker');
      },
      getUrl: function () {
        return iNet.getUrl('onegate/report/list');
      },
      getData: function () {
        return {
          fromDate: !iNet.isEmpty(this.$timeFrom.val()) ? this.$timeFrom.val() : '',
          toDate: !iNet.isEmpty(this.$timeTo.val()) ? this.$timeTo.val() : '',
          group: 'REPORT_UNIT'
        };
      }
    });
    this.BasicSearch = BasicSearch;
    iNet.ui.superadmin.report.unit.UnitSearchReport.superclass.constructor.call(this);
  };
  iNet.extend(
      iNet.ui.superadmin.report.unit.UnitSearchReport,
      iNet.ui.superadmin.report.SearchWidgetAbstract, {});
});

// #PACKAGE: onegate-superadmin-report-usage-search-widget
// #MODULE: SearchWidget
/**
 * Copyright (c) 2015 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 06/05/2015.
 * -------------------------------------------
 * @project ionegate-ui
 * @file SearchWidget
 * @author nbchicong
 */

$(function () {
  iNet.ns('iNet.ui.superadmin.report.usage.SearchWidget');
  iNet.ui.superadmin.report.usage.SearchWidget = function (config) {
    var that = this, __cog = config || {};
    iNet.apply(this, __cog);
    this.id = this.id || 'search-report-widget';
    this.$grid = $.getCmp('search-report-grid');
    this.BasicSearch = function () {
      this.id = "report-basicsearch";
      this.url = iNet.getUrl("onegate/report/list");
    };
    iNet.extend(this.BasicSearch, iNet.Component, {
      constructor: this.BasicSearch,
      intComponent: function () {
        var me = this;
        this.$inputSearch = $.getCmp(this.id).find('.grid-search-input');
        this.$timeFrom = $.getCmp(this.getId()).find("#time-report-from");
        this.$timeTo = $.getCmp(this.getId()).find("#time-report-to");
        this.fromDate = this.$timeFrom.datepicker().on('changeDate', function(ev) {
          me.fromDate.hide();
          me.$timeTo[0].focus();
        }).data('datepicker');
        this.toDate = this.$timeTo.datepicker({
          onRender: function(date) {
            return date.valueOf() <= me.fromDate.date.valueOf() ? 'disabled' : '';
          }
        }).on('changeDate', function(ev) {
          me.toDate.hide();
        }).data('datepicker');
      },
      getUrl: function () {
        return this.url;
      },
      getId: function () {
        return this.id;
      },
      getData: function () {
        return {
          keyword: this.$inputSearch.val(),
          fromDate: !iNet.isEmpty(this.$timeFrom.val()) ? this.$timeFrom.val() : '',
          toDate: !iNet.isEmpty(this.$timeTo.val()) ? this.$timeTo.val() : '',
          group: 'REPORT_USAGE'
        };
      }
    });
    iNet.ui.superadmin.report.usage.SearchWidget.superclass.constructor.call(this);
  };
  iNet.extend(iNet.ui.superadmin.report.usage.SearchWidget, iNet.ui.superadmin.report.SearchWidgetAbstract, {});
});
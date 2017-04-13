/**
 * Created by thoangtd on 12/5/13.
 */
// #PACKAGE: onegate-superadmin-report-province-search-widget
// #MODULE: SearchWidget

$(function () {

  iNet.ns("iNet.ui",
    "iNet.ui.superadmin",
    "iNet.ui.superadmin.report",
    "iNet.ui.superadmin.report.province",
    "iNet.ui.superadmin.report.province.SearchWidget");
  iNet.ui.superadmin.report.province.SearchWidget = function (config) {
    this.id = "report-search-report-widget";
    var __config = config || {};
    //this.dataField = {};
    this.id = "report-search-report-widget";
    this.module = "";
    iNet.apply(this, __config);
    var self = this;
    this.$grid = $.getCmp("report-search-grid");
    this.BasicSearch = function () {
      this.id = "report-basic-search";
      this.url = iNet.getUrl("onegate/report/list");
    };

    iNet.extend(this.BasicSearch, iNet.Component, {
      constructor: this.BasicSearch,
      intComponent: function (grid) {
        var __me = this;
        this.$timeFrom = $.getCmp(this.getId()).find("#time-report-from");
        this.$timeTo = $.getCmp(this.getId()).find("#time-report-to");
       /* this.$unit = $.getCmp(this.getId()).find("#report-unit");
        this.$unit.select2();*/
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
      intEvent: function(){

      },
      getUrl: function () {
        return this.url;
      },
      getId: function () {
        return this.id;
      },
      getData: function () {
        var __timeFrom = !iNet.isEmpty(this.$timeFrom.val()) ? this.$timeFrom.val() : "";
        var __timeTo = !iNet.isEmpty(this.$timeTo.val()) ? this.$timeTo.val() : "";
       // var __unit = this.$unit.val();
        var __data = {
          fromDate: __timeFrom,
          toDate: __timeTo,
          group:'REPORT_RESOLVE_PROVINCE'
        };
        return __data;
      }
    });
    iNet.ui.superadmin.report.province.SearchWidget.superclass.constructor.call(this);
    // after apply ========================================================

  };

  iNet.extend(iNet.ui.superadmin.report.province.SearchWidget, iNet.ui.superadmin.report.SearchWidgetAbstract, {
  });

});

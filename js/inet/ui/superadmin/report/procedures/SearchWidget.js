// #PACKAGE: onegate-superadmin-report-procedures-search-widget
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
  iNet.ns('iNet.ui.superadmin.report.procedures.SearchWidget');
  iNet.ui.superadmin.report.procedures.SearchWidget = function (config) {
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
        this.$inputSearch = $.getCmp(this.id).find('.grid-search-input');
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
          group: "REPORT_PROCEDURES"
        };
      }
    });
    iNet.ui.superadmin.report.procedures.SearchWidget.superclass.constructor.call(this);
  };
  iNet.extend(iNet.ui.superadmin.report.procedures.SearchWidget, iNet.ui.superadmin.report.SearchWidgetAbstract, {});
});
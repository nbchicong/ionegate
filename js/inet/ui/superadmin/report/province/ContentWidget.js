/**
 * Created by thoangtd on 12/5/13.
 */
// #PACKAGE: onegate-superadmin-report-province-content-widget
// #MODULE: SearchWidget

$(function () {

  iNet.ns("iNet.ui",
    "iNet.ui.superadmin",
    "iNet.ui.superadmin.report",
    "iNet.ui.superadmin.report.province",
    "iNet.ui.superadmin.report.province.ContentWidget");
  iNet.ui.superadmin.report.province.ContentWidget = function (config) {
    this.id = "report-widget-content";
    var __config = config || {};
    //this.dataField = {};
    this.module = "";
    iNet.apply(this, __config);

    // define properties before apply abstract class ==================================
    var self = this;
    this.$input = {
     /* unit: $.getCmp("report-widget-content-unit"),
      industry: $.getCmp("report-widget-content-industry"),*/
      fromdate: $.getCmp("report-widget-content-fromdate"),
      todate : $.getCmp("report-widget-content-todate")
    };
    this.$dialog = $.getCmp("widget-report-modal");
    // validation data save
    this.validation = new iNet.ui.form.Validate({
      id: this.id,
      rules: [/*{
        id: this.$input.unit.prop("id"),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return self.getText("unit_not_empty");
        }
      },*/{
        id: this.$input.fromdate.prop("id"),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return self.getText("fromdate_not_empty");
        }
      },{
        id: this.$input.todate.prop("id"),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return self.getText("todate_not_empty");
        }
      }]
    });

    // init event
    /*this.slUnit = new iNet.ui.form.select.Select({
      id: this.$input.unit.prop("id")
    }).change(function(e){
      console.log("change unit")
      self.loadIndustry(e, function(result){
        console.log("load industry: ", e);
        self.$input.industry.html(self.renderIndustry(result));
      },{
        msg: iNet.resources.ajaxLoading.loading,
        mask: self.$input.industry.parent()
      });
    });*/

    this.fromDate = this.$input.fromdate.datepicker({
    }).on('changeDate', function(ev) {
      self.fromDate.hide();
      self.$input.todate[0].focus();
    }).data('datepicker');

    this.toDate = this.$input.todate.datepicker({
      onRender: function(date) {
        return date.valueOf() <= self.fromDate.date.valueOf() ? 'disabled' : '';
      }
    }).on('changeDate', function(ev) {
      self.toDate.hide();
    }).data('datepicker');

    iNet.ui.superadmin.report.province.ContentWidget.superclass.constructor.call(this);
    // after apply ========================================================
  };

  iNet.extend(iNet.ui.superadmin.report.province.ContentWidget, iNet.ui.superadmin.report.ContentWidgetAbstract, {
    getNameReport: function () {
      return String.format("Báo cáo tóm tắt tình hình sử lý hồ sơ một cửa từ {1} đến {2}", this.getData().firmCode, this.getData().startDate, this.getData().endDate);
    },
    getData: function () {
      return {
       /* firmCode: this.$input.unit.val(),
        industryCode: this.$input.industry.val(),*/
        startDate: this.$input.fromdate.val(),
        endDate: this.$input.todate.val(),
        group: "REPORT_RESOLVE_PROVINCE"
      }
    },
    renderIndustry: function (industries) {
      var __html = "<option>--------</option>";

      for (var i = 0; i < industries.length; i++) {
        __html += String.format("<option value='{0}'>{1}</option>", industries[i].code, industries[i].name)
      }
      return __html;
    },
    getUrl: function () {
      return iNet.getUrl("xgate/reportprovince/save")
    },
    setData: function(data){
      var __data = data || {};
      this.$input.fromdate.val(new Date(__data.startDate).format("d/m/Y"));
      this.$input.todate.val(new Date(__data.endDate).format("d/m/Y"));
      this.setToolBarMode("view");
      this.loadWidget(data.uuid)
    }

  });

});

// #PACKAGE: onegate-superadmin-report-usage-content-widget
// #MODULE: ContentWidget
/**
 * Copyright (c) 2015 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 06/05/2015.
 * -------------------------------------------
 * @project ionegate-ui
 * @file ContentWidget
 * @author nbchicong
 */

$(function () {
  iNet.ns('iNet.ui.superadmin.report.usage.ContentWidget');
  iNet.ui.superadmin.report.usage.ContentWidget = function (config) {
    var that = this, __cog = config || {};
    iNet.apply(this, __cog);
    this.id = this.id || 'usage-report-content';
    this.$input = {
      service: $('#usage-report-service'),
      industry: $('#usage-report-industry'),
      fromdate: $("#report-widget-content-fromdate"),
      todate : $("#report-widget-content-todate")
    };
    this.validation = new iNet.ui.form.Validate({
      id: this.id,
      rules: [{
        id: this.$input.fromdate.prop("id"),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return that.getText("fromdate_not_empty");
        }
      }, {
        id: this.$input.todate.prop("id"),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return that.getText("todate_not_empty");
        }
      }]
    });
    this.fromDate = this.$input.fromdate.datepicker().on('changeDate', function(ev) {
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
    this.on('set_data_completed', function (data) {
      this.setToolBarMode("view");
      this.loadWidget(data.uuid);
    });
    this.industrySelection = new iNet.ui.form.select.Select({
      id: this.$input.industry.prop('id'),
      formatResult: function (item) {
        var __item = item || {};
        var __children = __item.children || [];
        var $option = $(__item.element);
        var __pattern = $option.data('pattern') || '__:__';
        if (__children.length > 0) {
          return String.format('<span class="badge badge-warning"><i class="icon-book"></i></span> {0}', __item.text)
        }
        return String.format('<span class="label label-info">{0}</span> {1}', __pattern, __item.text);
      },
      formatSelection: function (item) {
        var __item = item || {};
        var $option = $(__item.element);
        var __pattern = $option.data('pattern') || '__:__';
        return String.format('<span class="label label-info" style="height: auto !important;">{0}</span> {1}', __pattern, __item.text);
      }
    });
    iNet.ui.superadmin.report.usage.ContentWidget.superclass.constructor.call(this);
    $(window).resize();
  };
  iNet.extend(iNet.ui.superadmin.report.usage.ContentWidget, iNet.ui.superadmin.report.ContentWidgetAbstract, {
    __getServiceData: function (service) {
      switch (service) {
        case 'L3': return 'Dịch vụ công cấp độ 3'; break;
        case 'L4': return 'Dịch vụ công cấp độ 4'; break;
        case 'LX': return 'Dịch vụ công tại nhà'; break;
        default : return 'Dịch vụ công cấp độ 1 và 2';
      }
    },
    getNameReport: function () {
      return String.format("Báo cáo tóm tắt tình hình công dân/tổ chức sử dụng {0} từ {1} đến {2}{3}",
          this.__getServiceData(this.getData().service),
          this.getData().startDate,
          this.getData().endDate,
          iNet.isEmpty(this.getData().industry) ? '' : ' của lĩnh vực ' + this.getData().industry);
    },
    setData: function (data) {
      var __data = data || {};
      this.$input.service.val(__data.service);
      this.industrySelection.setValue(__data.industry);
      this.$input.fromdate.val(new Date(__data.startDate).format("d/m/Y"));
      this.$input.todate.val(new Date(__data.endDate).format("d/m/Y"));
      this.setReportID(__data.reportID);
      this.fireEvent('set_data_completed', __data);
    },
    getData: function () {
      return {
        service: this.$input.service.val(),
        industry: this.industrySelection.getValue(),
        startDate: this.$input.fromdate.val(),
        endDate: this.$input.todate.val(),
        group: 'REPORT_USAGE'
      };
    },
    getUrl: function () {
      return iNet.getUrl('xgate/servicesearch/save');
    }
  });
});
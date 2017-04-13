// #PACKAGE: onegate-superadmin-report-procedures-content-widget
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
  iNet.ns('iNet.ui.superadmin.report.procedures.ContentWidget');
  iNet.ui.superadmin.report.procedures.ContentWidget = function (config) {
    var that = this, __cog = config || {};
    iNet.apply(this, __cog);
    this.id = this.id || 'procedures-report-content';
    this.$input = {
      service: $('#procedures-report-service'),
      industry: $('#procedures-report-industry')
    };
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
    iNet.ui.superadmin.report.procedures.ContentWidget.superclass.constructor.call(this);
  };
  iNet.extend(iNet.ui.superadmin.report.procedures.ContentWidget, iNet.ui.superadmin.report.ContentWidgetAbstract, {
    __getServiceData: function (service) {
      switch (service) {
        case 'L3': return 'Dịch vụ công cấp độ 3'; break;
        case 'L4': return 'Dịch vụ công cấp độ 4'; break;
        case 'LX': return 'Dịch vụ công tại nhà'; break;
        default : return 'Dịch vụ công cấp độ 1 và 2';
      }
    },
    getNameReport: function () {
      return String.format("Báo cáo danh mục thủ tục hành chính {0}{1}",
          this.__getServiceData(this.getData().service),
          iNet.isEmpty(this.getData().industry) ? '' : ' của lĩnh vực ' + this.getData().industry);
    },
    setData: function (data) {
      var __data = data || {};
      this.$input.service.val(__data.service);
      this.industrySelection.setValue(__data.industry);
      this.setReportID(__data.reportID);
      this.fireEvent('set_data_completed', __data);
    },
    getData: function () {
      return {
        service: this.$input.service.val(),
        industry: this.industrySelection.getValue(),
        group: 'REPORT_PROCEDURES'
      };
    },
    getUrl: function () {
      return iNet.getUrl('xgate/reportprocedure/save');
    }
  });
});
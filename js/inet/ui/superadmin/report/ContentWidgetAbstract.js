/**
 * Created by thoangtd on 1/8/14.
 */

// #PACKAGE: onegate-superadmin-report-content-widget-abstract
// #MODULE: ContentWidgetAbstract
$(function () {
  iNet.ns("iNet.ui",
    "iNet.ui.superadmin",
    "iNet.ui.superadmin.report",
    "iNet.ui.superadmin.report.ContentWidgetAbstract");
  iNet.ui.superadmin.report.ContentWidgetAbstract = function () {
    this.url = {
      SAVE: iNet.getXUrl("htttcn/report/create"),
      status: iNet.getXUrl("htttcn/reports/chgstatus"),
      export_docx: iNet.getXUrl("htttcn/report/docx"),
      transfer: iNet.getXUrl("htttcn/reports/transfer"),
      urlDef: iNet.getUrl("onegate/page/superadmin/report/report-default-view")
    };
    this.idTemplate = "";
    // this.updateReport = false;
    var self = this;
    this.$element = $(String.format("#{0}", this.id));
    this.$dialog = $("#widget-report-modal");
    this.$toolbar = {
      BACK: this.$element.find("[name = report-create-btn-back]"),
      CREATE: this.$element.find("[name = report-create-btn-create]"),
      DOWNLOAD: this.$element.find('[name = report-create-btn-download]'),
      VIEW_RESULT: this.$element.find('[name = report-create-btn-view-result]'),
      SAVE: this.$element.find("[name = report-create-btn-save]"),
      OK: $("#widget-report-modal-ok")
    };

    this.$resultWg = this.$element.find('[name="report-result-wg"]');
    this.$departmentCtrl = this.$element.find('[name="cbx-report-department"]');

    this.$iframe = this.$element.find('[name=report-iframe-content]');
    this.$frameLoading = this.$element.find('[name=report-loading-msg]');
    this.$reportName = $("#widget-report-modal-txt-name");
    this.reportPanel = null;
    this.$formCriteria = $.getCmp("report-widget-content-form");
    this.makeNewReportPanel = function () { // select file to download
      if (this.reportPanel == null) {
        this.reportPanel = new iNet.ui.report.ReportPanel();
        this.reportPanel.on("download", function (data) {
          var __data = data || {};
          // TODO SHOW DIALOG
          if (!$.isEmptyObject(__data)) {
            this.idTemplate = __data.templateID || "";
            this.reportPanel.hide();
            //TODO  generate report
            this.showDialogCreate();
          }
        }.createDelegate(this));
      }

    }.createDelegate(this);

    this.validationName = new iNet.ui.form.Validate({
      id: this.$dialog.prop("id"),
      rules: [{
        id: this.$reportName.prop("id"),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return self.getText("name_not_empty");
        }
      }]
    });

    this.$toolbar.BACK.on("click", function () {
      self.hide();
      self.fireEvent("back");
    });


    this.$toolbar.OK.on("click", function () {
      if (!this.validationName.check())
        return;
      var __params = {
        name: this.$reportName.val(),
        group: this.getModule(),
        templateID: this.idTemplate
      };
      var __data = __params;
      if (iNet.isFunction(this.getData)) {
        __data = $.extend(__params, this.getData());
      }
      self.$dialog.modal("hide");
      this.save(__data);
    }.createDelegate(this));

    this.$formCriteria.ajaxForm({
      target: this.$iframe,
      beforeSubmit: function(){
        //console.log(self.validation.check());
        return self.validation.check();
      },
      success: function(result){
        //console.log(console.log(result))
      },
      url: iNet.getUrl(this.getDataType().view),
      type: "GET"
    });

    this.$toolbar.VIEW_RESULT.on("click", function(){
      if(this.validation && !this.validation.check()) return;
      //this.loadIframe();
      this.loadWidget();
    }.createDelegate(this));

    this.$toolbar.SAVE.on("click", function(){
      if(this.validation && !this.validation.check()) return;
      // SAVE DATA REPORT
      this.showPanel();
    }.createDelegate(this));

    $(window).on("resize", function () {
      self.$resultWg.css("height", $(window).height() - 200);
    });

    this.$toolbar.DOWNLOAD.on('click', function () {
      var __urlDownload = this.getUrlDownload() || "";
      var __fileType = this.getDataType().fileType || 'xlsx';
      if (iNet.isEmpty(__urlDownload) && !iNet.isEmpty(this.getReportID())) {
        __urlDownload = iNet.getUrl("report/file/download") + "?reportID=" + this.getReportID();
      }
      if (!iNet.isEmpty(__urlDownload)) {
        window.location.href = __urlDownload;
      }
      else {
        this.showMessage("error", iNet.resources.notify.title, this.getText("down_error"));
      }

    }.createDelegate(this));

    this.$toolbar.CREATE.on("click", function () {
      this.$element.find("#report-widget-content-form").get(0).reset();
      //this.$iframe.attr('src', this.url.urlDef);
      self.$resultWg.html(self.loadDefWg());
      this.setToolBarMode("create");

    }.createDelegate(this));

    //default
    //this.$iframe.attr('src', this.url.urlDef);

    //this.$iframe.load(function () {
    //  this.$frameLoading.hide();
    //  this.$iframe.show();
    //  this.onResize();
    //
    //}.createDelegate(this));

    iNet.ui.superadmin.report.ContentWidgetAbstract.superclass.constructor.call(this);
  };

  iNet.extend(iNet.ui.superadmin.report.ContentWidgetAbstract, iNet.ui.onegate.OnegateWidget, {
    setToolBarMode: function (state) { // reportID : uuid of report
      FormUtils.showButton(this.$toolbar.CREATE, true);
      FormUtils.showButton(this.$toolbar.DOWNLOAD, state == "view");
      FormUtils.showButton(this.$toolbar.VIEW_RESULT, state == "create");
      FormUtils.showButton(this.$toolbar.SAVE, state == "create");
    },
    getText: function (text) {
      //return iNet.resources.htttcn.report.SearchWidget[text] || text;
      return text;
    },
    create: function(){
      this.$toolbar.CREATE.trigger("click");
    },
    showDialogCreate: function () {
      this.$dialog.modal("show");
      if (iNet.isFunction(this.getNameReport)) {
        this.$reportName.val(this.getNameReport());
      }
    },
    showPanel: function () {
      this.makeNewReportPanel();
      this.reportPanel.setModule(this.getDataType().module, true);
     // this.reportPanel.show();
    },
    onResize: function () {
      this.$resultWg.height($(document).height() - 400);
    },
    loadDefWg: function () {
      return '<div class="alert alert-info" style="padding: 8px; margin-bottom: 3px;">Không có dữ liệu để hiển thị</div>';
    },
    loadWidget: function(reportId){
      var that = this;
      var __params  = '', obj = {};
      if(!iNet.isEmpty(reportId)){
        __params = {reportId: reportId};
      } else if(iNet.isFunction(this.getData)) {
        __params = this.getData();
      } else {
        __params = this.$formCriteria.serialize();
      }
      if (!iNet.isObject(__params)) {
        $.each(__params, function(i, arr) {
          var __arr = arr.split('=');
          obj[__arr[0]] = __arr[1];
        });
        __params = obj;
      }
      __params.widget = '/' + this.getDataType().view;
      $.postJSON(iNet.getUrl('page/defzonewidget'), __params , function (result) {
        that.$resultWg.html(result);
      });
    },

    loadIframe: function (reportId) {
      var __params  = "";
      if(!iNet.isEmpty(reportId)){
        __params = "reportId="+reportId
      } else if(iNet.isFunction(this.getData)) {
        __params = $.param(this.getData())
      } else {
        __params = this.$formCriteria.serialize();
      }
      //console.log(this.getDataType().view);
      var __url = iNet.getUrl(this.getDataType().view) + '?' + __params;

      this.$iframe.attr('src', decodeURIComponent(__url));
      this.displayLoading();

    },
    displayLoading: function (update) {
      var __text = this.getText("downloading");
      if (update) {
        __text = this.getText("updating");
      }
      this.$frameLoading.find(".progress").attr("percent", __text);
      this.$frameLoading.show();
      this.$iframe.hide();
      this.onResize();
    },
    setDataType: function (dataType) {
      this.dataType = dataType || {};
      //this.loadIframe();
    },
    getDataType: function () {
      //console.log(this.module)
      return ReportCommonService.getModuleInfo(this.module);
    },
    setModule: function(module){
      var __dataType = ReportCommonService.getModuleInfo(module);
      this.module = module;
      this.setDataType(__dataType);
    },
    getModule: function(){
      return this.module
    },
    save: function (__data) {
      var __me = this;
      $.postJSON(this.getUrl(), __data, function(result){
        //console.log("result: ", result)
        var __result = result || {};
        if("ERROR" != __result.type) {
          var __dataType = __me.getDataType() || {};

          __me.setUuid(__result.uuid);
          var __data = {
            reportId: __result.uuid || "",
            templateID: __result.templateID || "",
            module: __dataType.module
          };
          __me.generate(__data,result,function() {
            if (!iNet.isEmpty(__dataType.view)) {
              //__me.$iframe.get(0).contentWindow.location.replace(String.format(iNet.getUrl(__me.convertUrlView()) + "?reportId={0}", __me.getUuid()));
              __me.loadWidget(__me.getUuid());
            }

          })
        } else {
          __me.showMessage("error", iNet.resources.notify.title, iNet.resources.message.save_error);
        }
        __me.$dialog.hide();
      });
    },
    generate: function (data, resultReport, callback) {
      var __me = this;
      var __fn = callback || iNet.emptyFn;
      var __data = data || {};
      var __url = (iNet.isFunction(__me.getUrlGenerator) && !iNet.isEmpty(__me.getUrlGenerator())) ? __me.getUrlGenerator() : iNet.getUrl("xgate/reports/generate");
      //console.log("__data: ", __data);
      new iNet.ui.report.DownloadReportPanel({
        params: __data,
        urlGenerator: __url,
        download: false
      }).on("success", function (reportID, urlDownload) {
          //console.log(reportID, urlDownload)
          this.setUrlDownload(urlDownload);
          if (resultReport) {
            this.fireEvent('saved', resultReport, reportID);
          }
          this.reportID = reportID;
          this.setToolBarMode("view");
          __fn();
        }.createDelegate(this));
    },
    getUuid: function () {
      return this.uuid;
    },
    setUuid: function (uuid) {
      this.uuid = uuid;
    },
    getUrlDownload: function () {
      return this.urlDownload
    },
    setUrlDownload: function (urlDownload) {
      this.urlDownload = urlDownload
    },
    getReportID: function () {
      return this.reportID;
    },
    setReportID: function (reportID) {
      this.reportID = reportID;
    },
    renderIndustry: function (industries) {
      var __html = '<option value="">--- Tất cả ---</option>';
      for (var i = 0; i < industries.length; i ++) {
        __html += String.format('<option value="{0}">{1}</option>', industries[i].industry, industries[i].industry);
      }
      return __html;
    },
    loadIndustry: function(firmcode, fn, mark){
      $.postJSON(iNet.getUrl("xgate/industryhcm/list"),{"firmCode":firmcode},function(result){
        fn(result.elements || []);
      },mark);
    },
    getDeptSelection: function () {
      return this.departmentSelection;
    },
    getDepartment: function () {
      if (this.departmentSelection) {
        return this.departmentSelection.getValue();
      } else {
        return this.$departmentCtrl.val();
      }
    },
    setDepartment: function (value) {
      if (this.departmentSelection) {
        this.departmentSelection.setValue(value);
      } else {
        this.$departmentCtrl.val(value);
      }
    },
    __initDeptSelection: function () {
      var that = this;
      this.departmentSelection = new iNet.ui.form.select.Select({
        id: this.$departmentCtrl.prop('id')
      });
      this.departmentSelection.change(function (value) {
        that.fireEvent('change_dept', value);
      });
    },
    __renderDepartment: function (departments) {
      var __htmlTpl = '<option data-id="{0}" value="{1}">{2}</option>';
      var __html = '';
      for (var i = 0; i < iNet.getSize(departments); i ++) {
        var __dept = departments[i];
        __html += String.format(__htmlTpl, __dept.uuid, __dept.prefix, __dept.name);
      }
      this.$departmentCtrl.html(__html);
      this.__initDeptSelection();
    },
    _loadDepartment: function () {
      var that = this;
      $.postJSON(iNet.getUrl('onegate/department/list'), {}, function (result) {
        that.__renderDepartment(result.items);
      });
    },
    initDepartment: function () {
      this._loadDepartment();
    },
    convertUrlView: function(){
      var __url = this.getDataType().view || "";
      return __url;
    },
    getUrl: function () {}
  });
});
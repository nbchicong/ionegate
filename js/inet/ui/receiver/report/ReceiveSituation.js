// #PACKAGE: receiver-report-receive-situation
// #MODULE: ReceiveSituation
/**
 * BAO CAO TINH HINH TIEP NHAN HO SO MOT CUA
 * Created by VanHuyen on 21/05/2015.
 */
$(function () {
  iNet.ns('iNet.ui.onegate.receiver');
  iNet.ui.onegate.receiver.ReceiveSituation = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);
    this.id = this.id || 'receiver-report-situation-view';

    iNet.ui.onegate.receiver.ReceiveSituation.superclass.constructor.call(this);
    var me = this;

    this.$noselected = $('#message-view-no-selected');
    this.$content = $('#div-message-view-dp');
    this.$loading = $('#message-view-loading-text');
    this.$btnFullScreen = $('#message-view-full');
    this.$actionToolbar = $('#receiver-report-situation-action-toolbar');
    this.$resultWg = $('#report-result-wg');

    this.$btnFullScreen.on('click', function(){
      if(this.isFullScreen()) {
        this.viewNormal();
      } else {
        this.viewFull();
      }
    }.createDelegate(this));

    this.url = {
      view: iNet.getUrl('xgate/firmreceiver/review'),
      save: iNet.getUrl('xgate/firmreceiver/save')
    };

    this.$toolbar = {
      CREATE: $('#receiver-report-situation-create-btn'),
      DELETE: $('#receiver-report-situation-delete-btn'),
      DOWNLOAD: $('#receiver-report-situation-download-btn'),
      PREV: $('#receiver-report-situation-btn-previous'),
      NEXT: $('#receiver-report-situation-btn-next'),
      VIEW: $('#receiver-report-situation-view-btn'),
      SAVE: $('#receiver-report-situation-save-btn'),
      SAVE_OK: $('#widget-report-modal-ok')
    };

    this.$input = {
      fromdate: $('#receiver-report-situation-from-dtp'),
      todate: $('#receiver-report-situation-to-dtp'),
      name: $('#widget-report-modal-txt-name')
    };

    this.$modal = $('#widget-report-modal');

    this.validation = new iNet.ui.form.Validate({
      id: this.id,
      rules: [{
        id: this.$input.fromdate.prop("id"),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return iNet.resources.onegate.receiver.report.fromdate_not_empty;
        }
      },{
        id: this.$input.todate.prop("id"),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return iNet.resources.onegate.receiver.report.todate_not_empty;
        }
      }]
    });

    this.fromDate = this.$input.fromdate.datepicker({
    }).on('changeDate', function(ev) {
      me.fromDate.hide();
      me.$input.todate[0].focus();
    }).data('datepicker');

    this.toDate = this.$input.todate.datepicker({
      onRender: function(date) {
        return date.valueOf() <= me.fromDate.date.valueOf() ? 'disabled' : '';
      }
    }).on('changeDate', function(ev) {
      me.toDate.hide();
    }).data('datepicker');

    this.$toolbar.CREATE.on('click', function () {
        this.fireEvent('create', this);
    }.createDelegate(this));

    this.$toolbar.DOWNLOAD.on('click', function () {

    }.createDelegate(this));

    this.$toolbar.PREV.on('click', function () {
      var __node = this.getNode();
      me.fireEvent('move', 'prev', __node.prev || {}, this.allowPrevPage, __node);
    }.createDelegate(this));

    this.$toolbar.NEXT.on('click', function () {
      var __node = this.getNode();
      me.fireEvent('move', 'next', __node.next || {}, this.allowNextPage, __node);
    }.createDelegate(this));

    this.$toolbar.VIEW.on('click', function () {
      var __params = {
        firm: iNet.pattern,
        startDate: this.$input.fromdate.val(),
        endDate: this.$input.todate.val()
      };
      this.view(__params);
    }.createDelegate(this));

    this.$toolbar.SAVE.on('click', function () {
      if (this.validation.check()) {
        this.$input.name.val(this.getNameReport());
        this.$modal.modal('show');
      }
    }.createDelegate(this));

    this.$toolbar.SAVE_OK.on("click", function () {
      if (!this.validation.check())
        return;
      var __params = {
        firm: iNet.pattern,
        startDate: this.$input.fromdate.val(),
        endDate: this.$input.todate.val(),
        name: this.$input.name.val(),
        group: this.getModule()
      };
      this.save(__params);
    }.createDelegate(this));
  };

  iNet.extend(iNet.ui.onegate.receiver.ReceiveSituation, iNet.ui.onegate.OnegateWidget, {
    getNameReport: function () {
      return String.format("Báo cáo tình hình tiếp nhận hồ sơ một cửa từ {0} đến {1}", this.$input.fromdate.val(), this.$input.todate.val());
    },
    getMask: function(){
      return this.getEl();
    },
    create: function () {
      this.$noselected.hide();
      this.$content.show();
      this.$loading.show();
      this.$actionToolbar.hide();

      this.$toolbar.VIEW.show();
      this.$toolbar.SAVE.show();

      this.$resultWg.html("");

      this.$loading.hide();
    },
    load: function (params, data, node) {
      var __params = params || {};
      var __data = data || {};
      var __node = node || {};
      this.$noselected.hide();
      this.$content.show();
      this.$loading.show();
      this.$actionToolbar.hide();
      this.setNode(__node);
      this.setUuid(__data.uuid);
      this.$input.fromdate.val(__params.startDate);
      this.$input.todate.val(__params.endDate);

      this.loadWidget(__params);

      //================================
      var __prevNode = __node.prev || {};
      var __nextNode = __node.next || {};
      this.$toolbar.PREV.prop('disabled', iNet.isEmpty(__prevNode.uuid)  && __node.page == 1);
      this.$toolbar.NEXT.prop('disabled', iNet.isEmpty(__nextNode.uuid) && __node.page == __node.pages);

      this.allowNextPage= iNet.isEmpty(__nextNode.uuid) && __node.page < __node.pages;
      this.allowPrevPage= iNet.isEmpty(__prevNode.uuid) && __node.page > 1;

      this.$toolbar.VIEW.hide();
      this.$toolbar.SAVE.hide();

      this.$loading.hide();
    },
    view: function (params) {
      var me = this;
      var __params = params || {};
      me.$content.show();
      me.$actionToolbar.hide();

      me.loadWidget(__params);

      //================================
      this.$toolbar.PREV.prop('disabled', true);
      this.$toolbar.NEXT.prop('disabled', true);
    },
    setVisibleCreate: function (v) {
      this.allowCreate = v;
    },
    getVisibleCreate: function () {
      return this.allowCreate;
    },
    checkCreatePermisson: function () {
      FormUtils.showButton(this.$toolbar.CREATE, this.getVisibleCreate());
    },
    loadWidget: function(params){
      var that = this;
      var __params = params || {
        reportId: that.getUuid(),
        firm: iNet.pattern,
        startDate: that.$input.fromdate.val(),
        endDate: that.$input.todate.val()
      };
      __params.group = that.getModule();
      __params.widget= '/' + that.getDataType().view,
      $.postJSON(iNet.getUrl('page/defzonewidget'), __params , function (result) {
        that.$resultWg.html(result);
      });
    },
    setHeight: function(h){
      this.getEl().height(h);
    },
    clear: function(){
      this.$actionToolbar.find('button').hide();
      this.$content.hide();
      this.$noselected.show();
    },
    viewFull: function () {
      this.fireEvent('beforeresize', this);
      var $el = this.getEl();
      var __normalCls = $el.attr('data-normal');
      var __fullCls = $el.attr('data-full');

      $('div.messageView').removeClass(__normalCls).addClass(__fullCls);
      this.fullScreen= true;
      var $button = this.$btnFullScreen;
      var $icon = $($button.find('i').get(0));
      $icon.removeClass('icon-fullscreen');
      $icon.addClass('icon-resize-small');
      $button.attr('data-status', 'full');
    },
    viewNormal: function () {
      this.fireEvent('beforeresize', this);
      var $el = this.getEl();
      var __normalCls = $el.attr('data-normal');
      var __fullCls = $el.attr('data-full');
      $('div.messageView').removeClass(__fullCls).addClass(__normalCls);
      this.fullScreen= false;
      var $button = this.$btnFullScreen;
      var $icon = $($button.find('i').get(0));
      var status = $button.attr('data-status');
      $icon.removeClass('icon-resize-small');
      $icon.addClass('icon-fullscreen');
      $button.attr('data-status', 'normal');
    },
    save: function (params) {
      var __params = params || {};
      var __me = this;
      $.postJSON(__me.url.save, __params, function(result){
        var __result = result || {};
        if(__result.type != 'ERROR') {
          __me.setUuid(__result.uuid);
          __me.loadWidget();
          __me.$toolbar.VIEW.hide();
          __me.$toolbar.SAVE.hide();
          __me.fireEvent('saved', true, __result)
        } else {
          __me.showMessage("error", iNet.resources.notify.title, iNet.resources.message.save_error);
        }
        __me.$modal.modal('hide');
      });
    },
    isFullScreen: function(){
      return this.fullScreen;
    },
    setNode: function(node){
      this.node = node;
    },
    getNode: function(){
      return this.node || {};
    },
    setModule: function (module) {
      this.module = module;
    },
    getModule: function () {
      return this.module || 'REPORT_RECEIVER_SITUATION';
    },
    getUuid: function () {
      return this.uuid;
    },
    setUuid: function (uuid) {
      this.uuid = uuid;
    },
    setDataType: function (dataType) {
      this.dataType = dataType || {};
    },
    getDataType: function () {
      return ReportCommonService.getModuleInfo(this.getModule());
    }
  });
});
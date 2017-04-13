// #PACKAGE: receiver-ticket-submit
// #MODULE: TicketSubmitWidget
$(function () {
  iNet.ns('iNet.ui.onegate.receiver');
//==========================
  iNet.ui.onegate.receiver.TicketSubmitWidget = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);// apply configuration
    this.id = this.id || 'ticket-submit-widget';
    iNet.ui.onegate.receiver.TicketSubmitWidget.superclass.constructor.call(this);

    this.$appointmentDate = $('#ticket-submit-record-txt-appointment');
    this.$processDate = $('#ticket-submit-record-txt-process-date');
    this.$recordNo = $('#ticket-submit-record-txt-no');
    this.$procedure = $('#ticket-submit-record-select-procedure');

    this.$appointmentDate.mask('99/99/9999');
    this.$processDate.mask('99/99/9999');

    var me = this;
    this.$toolbar = {
      BACK: $('#ticket-submit-btn-back'),
      SUBMIT: $('#ticket-submit-btn-ok')
    };

    var appointmentDate = this.$appointmentDate.datepicker({
      format: 'dd/mm/yyyy'
    }).on('changeDate', function (ev) {
      appointmentDate.hide();
      me.$processDate.focus();
    }).data('datepicker');

    this.$appointmentDate.next().on('click', function () {
      $(this).prev().focus();
    });

    var processDate = this.$processDate.datepicker({
      format: 'dd/mm/yyyy'
    }).on('changeDate', function (ev) {
      processDate.hide();
    }).data('datepicker');

    this.$processDate.next().on('click', function () {
      $(this).prev().focus();
    });

    this.procedureSelect = new iNet.ui.form.select.Select({
      id: this.$procedure.prop('id'),
      formatResult: function (item) {
        var __item = item || {};
        return String.format('<span><i class="icon-book"></i> {0}</span>', __item.text);
      },
      formatSelection: function (item) {
        var __item = item || {};
        return String.format('<span><i class="icon-book"></i> {0}</span>', __item.text);
      }
    });

    this.validate = new iNet.ui.form.Validate({
      id: this.id,
      rules: [
        {
          id: this.$recordNo.prop('id'),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return 'Phiếu biên nhận không được để rỗng';
          }},
        {
          id: this.$processDate.prop('id'),
          validate: function (v, $control) {
            if (iNet.isEmpty(v))
              return 'Ngày xử lý hồ sơ không được để rỗng';
          }},
        {
          id: this.$appointmentDate.prop('id'),
          validate: function (v, $control) {
            if (iNet.isEmpty(v))
              return 'Ngày hẹn trả hồ sơ không được để rỗng';
          }},
        {
          id: this.$procedure.prop('id'),
          validate: function (v, $control) {
            if (iNet.isEmpty(v))
              return 'Quy trình xử lý không được để rỗng';
          }}
      ]
    });

    this.$toolbar.BACK.on('click', function () {
      this.hide();
      this.fireEvent('back', this);
    }.createDelegate(this));

    this.$toolbar.SUBMIT.on('click', function () {
      var me= this;
      if(this.check()) {
        $.postJSON(this.getUrl(), this.getData(), function (result) {
          var __result = result || {};
          if (!iNet.isEmpty(__result.uuid)) {
            me.showMessage('success', 'Hồ sơ', 'Hồ sơ đã được chuyển xử lý');
            me.fireEvent('success', __result, me);
          } else {
            me.showMessage('error', 'Hồ sơ', 'Có lỗi xảy ra khi chuyển xử lý');
            me.fireEvent('error', __result, me);
          }
        }, {mask: me.getMask(), msg: iNet.resources.ajaxLoading.acting});
      }
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.onegate.receiver.TicketSubmitWidget, iNet.ui.onegate.OnegateWidget, {
    getMask: function () {
      return this.getEl();
    },
    check: function () {
      return this.validate.check();
    },
    setData: function (data) {
      var __data = data || {};
      this.ownerData= __data;
      this.$recordNo.val(__data.recordNo || '');
      var __appointment = __data.appointment > 0 ? new Date(__data.appointment).format('d/m/Y') : '';
      this.$appointmentDate.val(__appointment);
      var __processDate = __data.processDate > 0 ? new Date(__data.processDate).format('d/m/Y') : '';
      this.$processDate.val(__processDate);
      var $option = this.$procedure.find(String.format('option[value="{0}"]', __data.procedureID));
      this.procedureSelect.setData({id: __data.procedureID, text: $option.text(), element: $option});
    },
    getData: function () {
      var __procedure = {};
      if (this.procedureSelect) {
        __procedure = this.procedureSelect.getData() || {};
      }
      return {
        recordNo: this.$recordNo.val(),
        appointment: this.$appointmentDate.data('datepicker').date.valueOf(),
        processDate: this.$processDate.data('datepicker').date.valueOf(),
        procedure: __procedure.id, //procedureID
        ticket: this.ownerData.recordID
      };
    },
    setUrl: function(url) {
      this.url = url;
    },
    getUrl: function(){
      return this.url || iNet.getXUrl('onegate/dept/ticketsubmit');
    }

  });
});
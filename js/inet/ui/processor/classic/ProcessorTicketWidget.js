// #PACKAGE: processor-ticket-view
// #MODULE: ProcessorTicketWidget
$(function () {
  iNet.ns('iNet.ui.onegate.processor');
  //==========================
  iNet.ui.onegate.processor.ProcessorTicketWidget = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);// apply configuration
    this.id = this.id || 'create-record-widget';
    this.procedureId = this.procedureId || '';
    iNet.ui.onegate.processor.ProcessorTicketWidget.superclass.constructor.call(this);

    var me = this;
    this.$toolbar= $('#ticket-action-toolbar');

    this.$lblProcedure = $('#record-procedure-lbl-name');
    this.$lblProcedureContainer = $('#record-procedure-lbl-container');

    this.xForm = new iNet.ui.onegate.XForm({
      allowMatcher: this.allowMatcher
    });

    this.xForm.on('openfile', function(params,files){
      me.fireEvent('openfile',params, files);
    });

    this.$toolbar.on('click','button',function(){
      var $button = $(this);
      var __data = $button.data('data') || {};
      var __action = $button.attr('data-action');
      switch (__action) {
        case 'back':
          me.hide();
          me.fireEvent('back', this);
          return;
        case 'reject':
          $.postJSON(iNet.getXUrl('onegate/dept/ticketreject'), {
            procedure: me.getProcedureId(),
            ticket: me.getTicketId(),
            task: me.getTaskId()
          }, function(result) {
            var __result = result || {};
            if(!iNet.isEmpty(__result.uuid)) {
              me.showMessage('success', 'Hồ sơ', 'Hồ sơ đã được trả lại');
            } else {
              me.showMessage('error', 'Hồ sơ', 'Có lỗi xảy ra khi thực hiện tác vụ');
            }
            me.fireEvent('execute', __result);
          },{mask: me.getMask(), msg: iNet.resources.ajaxLoading.acting});
          return;
        case 'completed':
          $.postJSON(iNet.getXUrl('onegate/dept/ticketcomplete'), {
            procedure: me.getProcedureId(),
            ticket: me.getTicketId(),
            task: me.getTaskId()
          }, function(result) {
            var __result = result || {};
            if(!iNet.isEmpty(__result.uuid)) {
              me.showMessage('success', 'Hồ sơ', 'Hồ sơ đã được hoàn thành');
            } else {
              me.showMessage('error', 'Hồ sơ', 'Có lỗi xảy ra khi thực hiện tác vụ');
            }
            me.fireEvent('execute', __result);
          },{mask: me.getMask(), msg: iNet.resources.ajaxLoading.acting});
          return;
        case 'process':
          $.postJSON(iNet.getXUrl('onegate/dept/ticketprocess'), {
            procedure: me.getProcedureId(),
            ticket: me.getTicketId(),
            task: me.getTaskId(),
            direction:__data.arcName
          }, function(result) {
            var __result = result || {};
            if(!iNet.isEmpty(__result.uuid)) {
              me.showMessage('success', 'Hồ sơ', String.format('Hồ sơ đã được {0}', __data.arcName));
            } else {
              me.showMessage('error', 'Hồ sơ', 'Có lỗi xảy ra khi thực hiện tác vụ');
            }
            me.fireEvent('execute', __result);
          },{mask: me.getMask(), msg: iNet.resources.ajaxLoading.acting});
          return;
      }
    });
  };
  iNet.extend(iNet.ui.onegate.processor.ProcessorTicketWidget, iNet.ui.onegate.OnegateWidget, {
    setTaskId: function (taskId) {
      this.taskId = taskId;
    },
    getTaskId: function () {
      return this.taskId;
    },
    setTicketId: function (ticketId) {
      this.ticketId = ticketId;
    },
    getTicketId: function () {
      return this.ticketId;
    },
    getProcedureId: function () {
      return this.procedureId;
    },
    setProcedureId: function (procedureId) {
      this.procedureId = procedureId;
    },
    setProcedureName: function (name) {
      this.$lblProcedure.text(name || 'Chưa chọn thủ tục hành chính');
    },
    load: function (params, allowClear) {
      var me= this;
      $.postJSON(iNet.getUrl('cloud/workflow/task/instance'),{task: me.getTaskId()}, function(result){
        var __result = result || {};
        var __buttons = __result.items || [];
        var __button = {};
        me.$toolbar.find('button:gt(0),span').remove();
        var $button = $('<button class="btn btn-primary" data-action="reject"><i class="icon-reply"></i> Trả lại</button>');
        me.$toolbar.append($button);
        me.$toolbar.append('<span>&nbsp</span>');

        for(var i=0;i<__buttons.length;i++) {
          __button = __buttons[i];
          var $button = $(String.format('<button data-action="process" class="btn btn-primary"><i class="icon-share-alt"></i> {0}</button>', __button.arcName));
          $button.data('data', __button);
          me.$toolbar.append($button);
          me.$toolbar.append('<span>&nbsp</span>');
        }
        $button = $('<button class="btn btn-success"  data-action="completed"><i class="icon-ok"></i> Hoàn thành</button>');
        me.$toolbar.append($button);
        me.$toolbar.append('<span>&nbsp</span>');
      },{mask: this.getMask(), msg: iNet.resources.ajaxLoading.loading});
      var __params = params || {};
      var __allowClear = !iNet.isEmpty(allowClear) ? allowClear : true;
      if (__allowClear) {
        me.$lblProcedureContainer.hide();
        me.xForm.clear();
      }
      var __url = iNet.getXUrl('onegate/dept/ticketview');
      if (iNet.isEmpty(__params.ticket)) {
        delete __params.ticket;
      }
      $.getJSON(__url, __params, function (result) {
        var __result = result || {};
        var __isExist = me.xForm.create(__result);
        me.setTicketId(!iNet.isEmpty(__params.ticket) ? __params.ticket : null);
        me.setProcedureId(__params.procedure);
        me.$lblProcedureContainer.show();
        me.xForm.setUUID(me.getTicketId());
        me.xForm.setFolder(__result.folder);
        if (__isExist && !iNet.isEmpty(__params.ticket) && me.allowMatcher) {
          me.xForm.matchedAttachment({procedure: me.getProcedureId(), ticket: me.getTicketId()});
        }
        me.getEl().find('input,select').prop('disabled', true);
        me.xForm.focus();
      }, {mask: this.getMask(), msg: iNet.resources.ajaxLoading.loading});
    }
  });
});
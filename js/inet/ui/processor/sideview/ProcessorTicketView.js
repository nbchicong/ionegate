// #PACKAGE: processor-ticket-view
// #MODULE: ProcessorTicketView
$(function () {
  iNet.ns('iNet.ui.onegate.processor');
  iNet.ui.onegate.processor.TicketView = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);
    this.id = this.id || 'ticket-view';
    this.procedureId = this.procedureId || '';
    this.processingUI = !iNet.isEmpty(this.processingUI) ? this.processingUI : false;

    iNet.ui.onegate.processor.TicketView.superclass.constructor.call(this);
    var me = this;

    this.$noselected = $('#message-view-no-selected');
    this.$content = $('#div-message-view-dp');
    this.$iframe = $('#message-view-frame-body');
    this.$loading = $('#message-view-loading-text');
    this.$xformBody = $('#record-xform-body');
    this.$btnFullScreen = $('#message-view-full');

    this.$moveToolbar = {
      PREV: $('#record-view-btn-previous'),
      NEXT: $('#record-view-btn-next')
    };

    this.$toolbar= $('#ticket-action-toolbar');
    this.$lblProcedure = $('#record-procedure-lbl-name');
    this.$lblProcedureContainer = $('#record-procedure-lbl-container');

    this.xForm = new iNet.ui.onegate.XForm({
      allowMatcher: this.allowMatcher
    });
    this.xForm.on('openfile', function(params,files){
      me.fireEvent('openfile',params, files);
    });

    this.$moveToolbar.PREV.on('click', function () {
      var __node = this.getNode();
      me.fireEvent('move', 'prev', __node.prev || {}, this.allowPrevPage, __node);
    }.createDelegate(this));

    this.$moveToolbar.NEXT.on('click', function () {
      var __node = this.getNode();
      me.fireEvent('move', 'next', __node.next || {}, this.allowNextPage, __node);
    }.createDelegate(this));

    this.$btnFullScreen.on('click', function(){
      if(this.isFullScreen()) {
        this.viewNormal();
      } else {
        this.viewFull();
      }
    }.createDelegate(this));


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
          },{mask: me.getMask(), msg: '&nbsp;'});
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
          },{mask: me.getMask(), msg: '&nbsp;'});
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
          },{mask: me.getMask(), msg: '&nbsp;'});
          return;
        case 'openplugin':
          iNet.getLayout().activePlugin(iNet.urlAppend(iNet.getXUrl('onegate/page/processor/sideview/plugin'),String.format('task={0}', me.getTaskId())));
          break;
      }
    });

  };

  iNet.extend(iNet.ui.onegate.processor.TicketView, iNet.ui.onegate.OnegateWidget, {
    setTaskId: function (taskId) {
      this.taskId = taskId;
    },
    getTaskId: function () {
      return this.taskId;
    },
    getMask: function(){
      return this.getEl();
    },
    setTicket: function (ticket) {
      this.ticket = ticket;
    },
    getTicket: function () {
      return this.ticket || {};
    },
    setUrl: function (url) {
      this.url = url;
    },
    getUrl: function () {
      return this.url || {};
    },
    setTicketId: function (ticketId) {
      this.ticketId = ticketId;
    },
    getTicketId: function () {
      return this.ticketId;
    },
    setUUID: function (uuid) {
      this.uuid = uuid;
    },
    getUUID: function () {
      return this.uuid;
    },
    getProcedureId: function () {
      return this.procedureId;
    },
    setProcedureId: function (procedureId) {
      this.procedureId = procedureId;
    },
    setProcedureName: function (name) {
      this.$lblProcedure.text(name || '');
    },
    load: function (params, allowClear) {
      this.$noselected.hide();
      this.$xformBody.hide();
      this.$content.show();
      this.$loading.show();
      this.$toolbar.empty();

      var me = this;
      $.postJSON(iNet.getUrl('cloud/workflow/task/instance'),{task: me.getTaskId()}, function(result){
        var __result = result || {};
        var __buttons = __result.items || [];
        var __button = {};
        var $button = $('<button class="btn btn-primary" data-action="reject"><i class="icon-reply"></i> Trả lại</button>');
        me.$toolbar.append($button);
        me.$toolbar.append('<span>&nbsp</span>');

        for(var i=0;i<__buttons.length;i++) {
          __button = __buttons[i];
          var $button = $(String.format('<button data-action="process" class="btn btn-primary"><i class="icon-cog"></i> {0}</button>', __button.arcName));
          $button.data('data', __button);
          me.$toolbar.append($button);
          me.$toolbar.append('<span>&nbsp</span>');
        }
        $button = $('<button class="btn btn-success"  data-action="completed"><i class="icon-ok"></i> Hoàn thành</button>');
        me.$toolbar.append($button);
        me.$toolbar.append('<span>&nbsp</span>');

        me.checkPlugin();

      },{mask: me.getMask(), msg: '&nbsp;'});
      var __params = params || {};
      var __allowClear = !iNet.isEmpty(allowClear) ? allowClear : true;
      if (__allowClear) {
        me.$lblProcedureContainer.hide();
        me.xForm.clear();
      }
      if (iNet.isEmpty(__params.ticket)) {
        delete __params.ticket;
      }
      $.getJSON(iNet.getXUrl('onegate/dept/ticketview'), __params, function (result) {
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
        me.xForm.disable();
        me.xForm.focus();
        me.$loading.hide();
        me.$xformBody.show();
      },{mask: me.getMask(), msg: '&nbsp;'});

      //================================
      var __node = me.getNode();
      console.log(__node);
      var __prevNode = __node.prev || {};
      var __nextNode = __node.next || {};
      me.$moveToolbar.PREV.prop('disabled', iNet.isEmpty(__prevNode.taskID)  && __node.page==1);
      me.$moveToolbar.NEXT.prop('disabled', iNet.isEmpty(__nextNode.taskID) && __node.page==__node.pages);

      me.allowNextPage= iNet.isEmpty(__prevNode.taskID) && __node.page<__node.pages;
      me.allowPrevPage= iNet.isEmpty(__nextNode.taskID) && __node.page>1;

    },
    setHeight: function(h){
      this.getEl().height(h);
    },
    clear: function(){
      this.setData({});
      this.$toolbar.find('button').hide();
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
    isFullScreen: function(){
      return this.fullScreen;
    },
    checkPlugin: function(){
      var me= this;
      $.getJSON(iNet.getXUrl('onegate/plugindata/search'),{task: this.getTaskId()}, function(result){
        var __result = result || {};
        if(!iNet.isEmpty(__result.modelName)) {
          var $button = $(String.format('<button class="btn btn-warning" data-action="openplugin"><i class="icon-puzzle-piece"></i> {0}</button>', __result.brief));
          $button.data('data', __result);
          me.$toolbar.append($button);
        }
      },{mask: me.getMask(), msg: '&nbsp;'});
    },
    clear: function(){
      this.$toolbar.find('button').hide();
      this.$content.hide();
      this.$noselected.show();
    },
    setNode: function(node){
      this.node = node;
    },
    getNode: function(){
      return this.node || {};
    }
  });
});
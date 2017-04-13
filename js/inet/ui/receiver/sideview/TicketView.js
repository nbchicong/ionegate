// #PACKAGE: ticket-view
// #MODULE: TicketView
$(function () {
  iNet.ns('iNet.ui.onegate.receiver');
  iNet.ui.onegate.receiver.TicketView = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);
    this.id = this.id || 'ticket-view';
    this.procedureId = this.procedureId || '';
    this.processingUI = !iNet.isEmpty(this.processingUI) ? this.processingUI : false;
    var confirmUpdateStatusDialog= null;
    var confirmReject = null;

    iNet.ui.onegate.receiver.TicketView.superclass.constructor.call(this);
    var me = this;
    this.$noselected = $('#message-view-no-selected');
    this.$content = $('#div-message-view-dp');
    this.$iframe = $('#message-view-frame-body');
    this.$loading = $('#message-view-loading-text');
    this.$xformBody = $('#record-xform-body');
    this.$btnFullScreen = $('#message-view-full');
    this.$actionToolbar = $('#ticket-action-toolbar');

    this.$btnFullScreen.on('click', function(){
      if(this.isFullScreen()) {
        this.viewNormal();
      } else {
        this.viewFull();
      }
    }.createDelegate(this));

    this.$toolbar = {
      CREATE: $('#record-btn-create'),
      PROCEDURE: $('#record-btn-procedure'),
      SAVE: $('#record-btn-save'),
      DELETE: $('#record-btn-delete'),
      PRINT_RECEIPT: $('#record-btn-print-receipt'),
      SUBMIT: $('#record-btn-submit'),
      PAID: $('#record-btn-paid'),
      VERIFY: $('#record-btn-verify'),
      RETURN: $('#record-btn-return'),
      REJECT: $('#record-btn-reject'),
      NOTIFY_PAYMENT: $('#record-btn-notify-payment'),
      PREV: $('#record-view-btn-previous'),
      NEXT: $('#record-view-btn-next')
    };
    this.$profile = {
      main : $('#record-xform-profile-id'),
      identity: $('#record-profile-txt-identity'),
      fullname: $('#record-profile-txt-fullname'),
      birthday: $('#record-profile-txt-birthday'),
      address: $('#record-profile-txt-address'),
      mobile: $('#record-profile-txt-mobile'),
      email: $('#record-profile-txt-email')
    };

    this.$resultContainer = $('#ticket-result-container');
    this.$resultContent = $('#ticket-result-content');

    this.$lblProcedure = $('#record-procedure-lbl-name');
    this.$lblProcedureContainer = $('#record-procedure-lbl-container');

    this.$profile.birthday.mask('99/99/9999');

    var component = this.$profile.birthday.datepicker({
      format: 'dd/mm/yyyy'
    }).on('changeDate', function (ev) {
      me.$profile.birthday.focus();
      component.hide();
    }).data('datepicker');

    this.$profile.birthday.next().on('click', function () {
      $(this).prev().focus();
    });

    this.$profile.identity.on('change', function () {
      var v= $(this).val();
      if(!iNet.isEmpty(v)) {
        me.searchProfile({identity: v});
      }
    });

    var createConfirmUpdateStatusDialog = function () {
      if (!confirmUpdateStatusDialog) {
        confirmUpdateStatusDialog = new iNet.ui.dialog.ModalDialog({
          id: 'ticket-modal-create-confirm-update-status',
          title: iNet.resources.onegate.ticket.title,
          buttons: [
            {
              text: iNet.resources.message.button.ok,
              cls: 'btn-primary',
              icon: 'icon-ok icon-white',
              fn: function () {
                var __data = this.getData() || {};
                var dialog = this;
                if (!iNet.isEmpty(__data.ticket)) {
                  var __url = me.isOfficer() ? iNet.getXUrl('onegate/office/ticketstatus') : iNet.getXUrl('onegate/dept/ticketstatus');
                  $.postJSON(__url, __data, function (result) {
                    var __result = result || {};
                    me.showMessage('success', 'Hồ sơ', 'Hồ sơ đã được tiếp nhận');
                    me.fireEvent("changedstatus", me, __result);
                    me.setTicket(__result);
                    me.load({procedure:me.getProcedureId(), ticket: me.getTicketId()}, false);
                    dialog.hide();
                  }, {mask: this.getMask(), msg: iNet.resources.ajaxLoading.acting});
                }
              }
            },
            {
              text: iNet.resources.message.button.cancel,
              icon: 'icon-remove',
              fn: function () {
                this.hide();
              }
            }
          ]
        });
      }
      return confirmUpdateStatusDialog;
    };

    var confirmRejectDlg = function () {
      if (!confirmReject) {
        confirmReject = new iNet.ui.dialog.ModalDialog({
          id: 'ticket-modal-reject',
          title: 'Từ chối',
          content: 'Bạn có đồng ý từ chối hồ sơ {0} không?',
          buttons: [{
            text: iNet.resources.message.button.ok,
            cls: 'btn btn-primary',
            icon: 'icon-ok icon-white',
            fn: function () {
              var dlg = this;
              var __options = this.getOptions();
              __options.brief = $('#txt-reject-brief').val();
              var __url = me.isOfficer() ? iNet.getXUrl('onegate/office/ticketrejectrecord') : iNet.getXUrl('onegate/dept/ticketrejectrecord');
              $.postJSON(__url, __options, function (result) {
                if (result.uuid != undefined || result.toLowerCase() == 'success') {
                  me.showMessage('success', 'Hồ sơ', 'Hồ sơ đã được trả lại!');
                  dlg.hide();
                  var __node = me.getNode();
                  me.fireEvent('move', 'next', __node.next || {}, this.allowNextPage, __node);
                  me.fireEvent('reject_record', __options);
                } else {
                  me.showMessage('error', 'Hồ sơ', 'Quá trình xử lý xảy ra lỗi!');
                }
              }, {mask: this.getMask(), msg: iNet.resources.ajaxLoading.acting});
            }
          }, {
            text: iNet.resources.message.button.cancel,
            icon: 'icon-remove',
            fn: function () {
              this.hide();
            }
          }]
        });
      }
      return confirmReject;
    };

    this.$nofityDlg = $('#ticket-modal-notify-payment');
    this.$appointmentDate = $('#ticket-modal-notify-payment-date');
    this.$ticketPrice = $('#ticket-modal-notify-payment-price');
    this.$submitAppointment = $('#ticket-modal-notify-payment-2704650ba2e8bd34c73b6952');
    var submitAppointment = function () {
      var __date = me.$appointmentDate.val();
      $.postJSON(iNet.getUrl('onegate/office/ticket/appointment'), {
        ticket: me.getUUID(),
        cost: me.$ticketPrice.val(),
        appointment: __date
      }, function (result) {
        if (iNet.isDefined(result.uuid)) {
          me.$nofityDlg.modal('hide');
          me.showMessage('success', 'Đã gửi thông báo', 'Đã thông báo thời gian trả kết quả vào ngày <b>' + __date + '</b>');
        } else {
          me.showMessage('error', 'Chưa gửi thông báo', 'Quá trình gửi thông báo xảy ra lỗi!');
        }
      });
    };

    var appointmentDate = this.$appointmentDate.datepicker().on('changeDate', function (ev) {
      appointmentDate.hide();
    }).data('datepicker');

    this.$submitAppointment.on('click', function () {
      submitAppointment();
    });

    this.xForm = new iNet.ui.onegate.XForm({
      allowMatcher: this.allowMatcher
    });
    this.xForm.on('openfile', function(params,files){
      me.fireEvent('openfile',params, files);
    });

    this.xForm.on('submit', function (data, control) {
      var __data = data || {};
      if(iNet.isEmpty(__data.uuid)) {
        return ;
      }
      var __isSave = iNet.isEmpty(me.getTicketId());
      var __msg = __isSave ? iNet.resources.onegate.ticket.save_success : iNet.resources.onegate.ticket.update_success;
      me.showMessage('success', 'Hồ sơ', __msg);
      me.setUUID(__data.uuid);
      me.setGraphId(__data.graphID);
      me.setProfileId(__data.profileID);
      me.setTicket(__data);
      me.load({procedure: __data.procedureID, ticket: __data.recordID}, false);
      me.fireEvent('saved', __isSave, __data);
    }, {mask: this.getMask(), msg: iNet.resources.ajaxLoading.saving});


    this.profileValidate = new iNet.ui.form.Validate({
      id: 'record-xform-profile-id',
      rules: [
        {
          id: this.$profile.identity.prop('id'),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return 'Số CMND không được để rỗng';
          }},
        {
          id: this.$profile.fullname.prop('id'),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return 'Họ và tên không được để rỗng';
          }},
        {
          id: this.$profile.address.prop('id'),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return 'Địa chỉ không được để rỗng';
          }},
        {
          id: this.$profile.birthday.prop('id'),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return 'Ngày sinh không được để rỗng';
          }}
      ]
    });
    this.$toolbar.PROCEDURE.on('click', function () {
      this.fireEvent('selectprocedure', this);
    }.createDelegate(this));

    this.$toolbar.CREATE.on('click', function () {
      if(!iNet.isEmpty(this.getProcedureId())) {
        this.setProfileId(null);
        this.setTicket(null);
        this.load({procedure: this.getProcedureId(), ticket: null}, false);
      } else {
        this.fireEvent('selectprocedure', this);
      }
    }.createDelegate(this));


    this.$toolbar.SAVE.on('click', function () {
      var me = this;
      this.saveProfile(function (result) {
        var __profile = result || {};
        me.setProfile(__profile);
        var __data = {
          procedure: me.getProcedureId()
        };
        if (!iNet.isEmpty(me.getTicketId())) {
          __data.ticket = me.getTicketId();
        }
        var __profileId = __profile.uuid;
        if(!iNet.isEmpty(__profileId)) {
          me.xForm.getEl().find('#profileID').val(__profileId);
        }
        me.xForm.submit(__data);//save ticket
      });
    }.createDelegate(this));


    this.$toolbar.PRINT_RECEIPT.on('click', function () {
      me.printReceipt();
    });

    this.$toolbar.SUBMIT.on('click', function () {
      var me = this;
      if(this.isOfficer()) {
        this.fireEvent('submit', this, this.getUUID());
      } else {
        if (iNet.isEmpty(this.getGraphID())) {
          this.showMessage('error', 'Hồ sơ', 'Quy trình xử lý không tồn tại');
          return;
        }
        var __ticket = this.getTicket();
        $.postJSON(iNet.getXUrl('onegate/dept/ticketestimate'), {ticket: __ticket.recordID, procedure: this.getProcedureId()}, function (result) {
          me.fireEvent('submit', me, result || {});
        }, {mask: this.getMask(), msg: iNet.resources.ajaxLoading.loading});
      }
    }.createDelegate(this));

    this.$toolbar.VERIFY.on('click',function(){
      var __ticket = this.getTicket();
      var dialog = createConfirmUpdateStatusDialog();
      dialog.setContent(iNet.resources.onegate.ticket.verified_content);
      dialog.setData({
        ticket: __ticket.uuid,
        status: 'VERIFIED'
      });
      dialog.show();
    }.createDelegate(this));

    this.$toolbar.PAID.on('click', function () {
      this.fireEvent('paid', this, this.getTicket());
    }.createDelegate(this));

    this.$toolbar.RETURN.on('click', function () {
      var __ticket = this.getTicket();
      me.fireEvent('return', this, __ticket);
    }.createDelegate(this));

    this.$toolbar.REJECT.on('click', function () {
      var rejectDlg = confirmRejectDlg();
      rejectDlg.setOptions({
        procedure: me.getProcedureId(),
        ticket: me.getTicketId()
      });
      rejectDlg.setContent('<div class="container-fluid form-horizontal">' +
      '<div class="form-group" style="margin-bottom: 0px;">' +
      '<label class="ilabel col-sm-3">Lý do từ chối: </label>' +
      '<div class="col-sm-9">' +
      '<textarea class="form-control" id="txt-reject-brief"></textarea>' +
      '</div></div></div>');
      rejectDlg.show();
    });

    this.$toolbar.NOTIFY_PAYMENT.on('click', function () {
      //$.postJSON(iNet.getUrl('onegate/office/ticket/fee'), {ticket: me.getUUID()}, function (result) {
      //  me.$ticketPrice.val(!iNet.isDefined(result.expenseLX)||iNet.isEmpty(result.expenseLX)?50000:result.expenseLX);
        me.$ticketPrice.val(50000);
        me.$nofityDlg.modal('show');
      //});
    });

    this.$toolbar.PREV.on('click', function () {
      var __node = this.getNode();
      me.fireEvent('move', 'prev', __node.prev || {}, this.allowPrevPage, __node);
    }.createDelegate(this));

    this.$toolbar.NEXT.on('click', function () {
      var __node = this.getNode();
      me.fireEvent('move', 'next', __node.next || {}, this.allowNextPage, __node);
    }.createDelegate(this));

  };

  iNet.extend(iNet.ui.onegate.receiver.TicketView, iNet.ui.onegate.OnegateWidget, {
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
      this.$lblProcedure.text(name || 'Chưa chọn thủ tục hành chính');
    },
    setGraphId: function (v) {
      this.graphId = v;
    },
    getGraphID: function () {
      return this.graphId;
    },
    load: function (params, allowClear) {
      this.$noselected.hide();
      this.$xformBody.hide();
      this.$content.show();
      this.$loading.show();
      this.$actionToolbar.hide();

      if (!iNet.isEmpty(this.getProfileId())) {
        this.searchProfile({profileID: this.getProfileId()}); //load profile
      } else {
        this.clearProfile();
      }
      var __params = params || {};
      var __allowClear = !iNet.isEmpty(allowClear) ? allowClear : true;
      var me = this;
      if (__allowClear) {
        me.$lblProcedureContainer.hide();
        me.xForm.clear();
      }
      var __obj = this.getUrl();
      var __url = !iNet.isEmpty(__obj.load) ? __obj.load : iNet.getXUrl('onegate/dept/svcl3request');
      if (iNet.isEmpty(__params.ticket)) {
        delete __params.ticket;
      }
      $.getJSON(__url, __params, function (result) {
        var __result = result || {};
        me.xForm.setAllowDeleteFile(!me.isProcessingUI());

        var __isExist = me.xForm.create(__result);
        me.setTicketId(!iNet.isEmpty(__params.ticket) ? __params.ticket : null);
        me.setProcedureId(__params.procedure);
        me.$lblProcedureContainer.show();
        var __ticket = me.getTicket();
        var __isTicket = !iNet.isEmpty(__ticket.uuid);
        var __isSave = __isExist  && (__ticket.status!='COMPLETED') && (__ticket.status!='PUBLISHED') && !me.isProcessingUI();
        var __isReceiver =  !me.isOfficer() &&  !me.isProcessingUI();
        FormUtils.showButton(me.$toolbar.SAVE, __isSave);
        FormUtils.showButton(me.$toolbar.PRINT_RECEIPT, __isExist && __isTicket && me.isOfficer() && !me.isProcessingUI() && (__ticket.status!='CREATED'));
        FormUtils.showButton(me.$toolbar.SUBMIT, __isSave && __isTicket && !iNet.isEmpty(me.getGraphID()) && (__ticket.status!='CREATED') &&  !me.isProcessingUI());
        FormUtils.showButton(me.$toolbar.VERIFY, __isExist && __isTicket && (__ticket.status=='CREATED') && !me.isProcessingUI());
        FormUtils.showButton(me.$toolbar.PAID, __isSave && __isTicket && __isReceiver);
        FormUtils.showButton(me.$toolbar.RETURN, __isExist && __isTicket && __isReceiver);
        FormUtils.showButton(me.$toolbar.REJECT, __isExist && __isTicket && (__ticket.status=='CREATED' || __ticket.status=='VERIFIED'));
        FormUtils.showButton(me.$toolbar.NOTIFY_PAYMENT, __isExist && __isTicket && __isReceiver);
        me.checkCreatePermisson();
        me.xForm.setUUID(me.getTicketId());
        me.xForm.setFolder(__result.folder);
        if (__isExist && !iNet.isEmpty(__params.ticket) && me.allowMatcher) {
          me.xForm.matchedAttachment({procedure: me.getProcedureId(), ticket: me.getTicketId()});
        }
        me.$profile.main.find('input,select,textarea').prop('disabled', !__isSave);
        me.xForm.setDisabled(!__isSave || me.isProcessingUI());
        me.xForm.focus();
        if (__isExist && !iNet.isEmpty(__params.ticket)) {
          me.loadResult();
        }
        me.$loading.hide();
        me.$xformBody.show();
        me.$actionToolbar.show();

      },{mask: me.getMask(), msg: '&nbsp;'});
      //================================
      var __node = me.getNode();
      var __prevNode = __node.prev || {};
      var __nextNode = __node.next || {};
      me.$toolbar.PREV.prop('disabled', iNet.isEmpty(__prevNode.uuid)  && __node.page==1);
      me.$toolbar.NEXT.prop('disabled', iNet.isEmpty(__nextNode.uuid) && __node.page==__node.pages);

      me.allowNextPage= iNet.isEmpty(__nextNode.uuid) && __node.page<__node.pages;
      me.allowPrevPage= iNet.isEmpty(__prevNode.uuid) && __node.page>1;

    },
    getProfileId: function () {
      return this.profileId;
    },
    setProfileId: function (v) {
      this.profileId = v;
    },
    clearProfile: function(){
      this.$profile.fullname.val( '');
      this.$profile.identity.val('').focus();
      this.$profile.birthday.val('');
      this.$profile.address.val('');
      this.$profile.mobile.val('');
      this.$profile.email.val('');
    },
    setProfile: function (data) {
      var __data = data || {};
      this.$profile.fullname.val(__data.fullname || '').focus();
      this.$profile.identity.val(__data.identity || '');
      this.$profile.birthday.val(__data.birthday || '');
      this.$profile.address.val(__data.address1 || '');
      this.$profile.mobile.val(__data.mobile || '');
      this.$profile.email.val(__data.email || '');
      this.setProfileId(__data.uuid || '');
      this.profileValidate.check()
    },
    getProfile: function () {
      var __data = {
        fullname: this.$profile.fullname.val(),
        identity: this.$profile.identity.val(),
        birthday: this.$profile.birthday.val(),
        address1: this.$profile.address.val(),
        mobile: this.$profile.mobile.val(),
        email: this.$profile.email.val()
      };
      if (!iNet.isEmpty(this.getProfileId())) {
        __data.uuid= this.getProfileId()
      }
      return __data;
    },
    saveProfile: function (callback) {
      var __callback = callback || iNet.emptyFn;
      if (this.profileValidate.check()) {
        $.postJSON(iNet.getUrl('onegate/dept/userprofile/submit'), this.getProfile(), function (result) {
          __callback(result || {});
        },{mask: this.getMask(),msg: '&nbsp;'});
      }
    },
    searchProfile: function (params) {
      var me = this;
      var __params = params || {};
      $.postJSON(iNet.getUrl('onegate/dept/userprofile/search'), __params, function (result) {
        var __result = result || {};
        if(!iNet.isEmpty(__result.uuid)) {
          me.setProfile(__result);
        }
      },{mask: me.getMask(), msg: '&nbsp;'});
    },
    setVisibleCreate: function (v) {
      this.allowCreate = v;
    },
    getVisibleCreate: function () {
      return this.allowCreate;
    },
    checkCreatePermisson: function () {
      FormUtils.showButton(this.$toolbar.CREATE, this.getVisibleCreate() && !this.isProcessingUI());
      FormUtils.showButton(this.$toolbar.PROCEDURE, this.getVisibleCreate() && !this.isProcessingUI());
    },
    printReceipt: function () {
      var url = iNet.getXUrl('onegate/page/receiver/receipt');
      var printWindow = window.open(iNet.urlAppend(url, 'ticket=' + this.getUUID()), '_blank');
      printWindow.onload = function () {
        printWindow.print();
      }
    },
    printOfficer: function () {

    },
    setOfficer: function(v){
      this.officer = v;
    },
    isOfficer: function(){
      return this.officer;
    },
    setProcessingUI: function(v){
      this.processingUI = v;
    },
    isProcessingUI: function(){
      return this.processingUI;
    },
    loadResult: function(){
      var me= this;
      $.getJSON(iNet.getUrl('xgate/userticket/result'),{ticket: this.getUUID()}, function(result){
        var __result = result || {};
        me.fillResult(__result.items);
      },{mask: me.getMask(), msg: '&nbsp;'});
    },
    fillResult: function(items) {
      var __items = items || [];
      this.$resultContent.empty();
      var __html= '';
      for(var i=0;i<__items.length;i++){
        var __item= __items[i] || {};
        var __files = __item.resultAttachments || [];
        __html+= '<div class="row" style="margin: 0px;margin-left: 15px;">';
        //__html+=String.format('<div><b>{0}</b></div>', __item.subject);
        __html+=String.format('<div><i class="icon-quote-left"></i> {0} <i class="icon-quote-right"></i></div>', __item.notes);
        if(__files.length>0) {
          __html += '<ul class="list-unstyled">';
          __html += this.fillResultFiles(__files);
          __html += '</ul>';
        }
        __html+='<hr /></div>';
      }
      this.$resultContent.append(__html);
      if(!iNet.isEmpty(__html)) {
        this.$resultContainer.show();
      } else {
        this.$resultContainer.hide();
      }
    },
    fillResultFiles: function(files){
      var __files = files || [];
      var __html= '';
      for (var i = 0; i < __files.length; i++) {
        var __file = __files[i] || {};
        var __url = iNet.urlAppend(iNet.getUrl('xgate/userticket/download'), String.format('ticket={0}&contentID={1}', __file.folder, __file.gridfsUUID));
        __html+=String.format('<li><a href="{2}"><i class="{0}"></i>{1}</a></li>',iNet.FileFormat.getFileIcon(__file.file), __file.file, __url);
      }
      return __html;
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
    isFullScreen: function(){
      return this.fullScreen;
    },
    setNode: function(node){
      this.node = node;
    },
    getNode: function(){
      return this.node || {};
    }
  });
});
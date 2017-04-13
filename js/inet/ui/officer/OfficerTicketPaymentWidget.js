// #PACKAGE: officer-ticket-payment
// #MODULE: TicketPaymentWidget
$(function () {
  iNet.ns('iNet.ui.onegate.officer');
  //==========================
  iNet.ui.onegate.officer.PaidDialog = function(config) {
    var __config = config || {};
    iNet.apply(this, __config);// apply configuration
    this.id = this.id || 'payment-paid-modal';
    this.$element = $.getCmp(this.id);

    this.$serial = $('#payment-paid-txt-serial');

    var $btnOk = $('#payment-paid-modal-btn-ok');
    var $btnCancel = $('#payment-paid-modal-btn-cancel');
    var me = this;
    $.fn.modalmanager.defaults.resize = true;

    this.validate = new iNet.ui.form.Validate({
      id: this.id,
      rules: [
        {
          id: this.$serial.prop('id'),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return iNet.resources.onegate.ticket.paid_serial_number_required;
          }}
      ]
    });

    $btnOk.on('click', function() {
      var __data= this.getData();
      if(this.check()) {
        $.postJSON(iNet.getXUrl('onegate/dept/paymentsubmit'), __data, function (result) {
          var __result = result || {};
          me.fireEvent('submit', __result, me);
        },{mask: this.getMask(), msg: iNet.resources.ajaxLoading.acting});
      }
    }.createDelegate(this));

    $btnCancel.on('click', function() {
      this.hide();
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.onegate.officer.PaidDialog, iNet.Component, {
    getEl: function(){
      return this.$element;
    },
    show : function() {
      this.getEl().modal('show');
    },
    hide : function() {
      this.getEl().modal('hide');
    },
    getMask: function(){
      return this.getEl();
    },
    setTicketId: function(ticketId){
      this.ticketId = ticketId;
      this.$serial.val('');
    },
    getTicketId: function(){
      return this.ticketId;
    },
    getData: function(){
      return {
        serial: this.$serial.val(),
        ticket: this.getTicketId()
      };
    },
    check: function(){
      return this.validate.check();
    },
    focus: function(){
      this.$serial.focus();
    }
  });

  iNet.ui.onegate.officer.TicketPaymentWidget = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);// apply configuration
    this.id = this.id || 'ticket-payment-widget';
    iNet.ui.onegate.officer.TicketPaymentWidget.superclass.constructor.call(this) ;

    this.$toolbar = {
      BACK: $('#ticket-payment-btn-back'),
      CREATE: $('#ticket-payment-btn-create'),
      PAID: $('#ticket-payment-btn-paid')
    };
    var me = this;
    var confirmDeleteDialog = null, paidDialog = null;
    var createPaidDialog = function(){
      if(!paidDialog) {
        paidDialog = new iNet.ui.onegate.receiver.PaidDialog();
        paidDialog.on('submit', function(data, dialog){
          var __data = data || {};
          if(__data.type!=='ERROR'){
            dialog.hide();
            me.hide();
            me.fireEvent('back', this);
            me.showMessage('success', iNet.resources.onegate.ticket.title, iNet.resources.onegate.ticket.paid_success);
          } else {
            me.showMessage('error', iNet.resources.onegate.ticket.title, iNet.resources.onegate.ticket.paid_error);
            dialog.focus();
          }
        })
      }
      return paidDialog;
    };

    var createConfirmDeleteDialog = function(){
      if(!confirmDeleteDialog) {
        confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id : 'payment-modal-confirm-delete',
          title : iNet.resources.dialog.delete_title,
          content : iNet.resources.dialog.delete_content,
          buttons : [{
            text : iNet.resources.message.button.ok,
            cls : 'btn-danger',
            icon : 'icon-ok icon-white',
            fn : function() {
              var __data= this.getData();
              var __uuid = __data.uuid;
              if (!iNet.isEmpty(__uuid)) {
                this.hide();
                $.postJSON(iNet.getXUrl('onegate/dept/paymentdelete'), {
                  payment: __uuid,
                  ticket: me.getTicketId()
                }, function() {
                  me.grid.reload();
                },{mask: this.getMask() , msg: iNet.resources.ajaxLoading.deleting});
              }
            }
          }, {
            text : iNet.resources.message.button.cancel,
            icon : 'icon-remove',
            fn : function() {
              this.hide();
            }
          }]
        });
      }
      return confirmDeleteDialog;
    };

    var __columns = [{
      label :iNet.resources.onegate.ticket.order,
      type : 'rownumber',
      align: 'center',
      width : 50
    },{
      property : 'brief',
      label : iNet.resources.onegate.ticket.paid_brief,
      sortable : true,
      type : 'text',
      validate : function(v) {
        if (iNet.isEmpty(v))
          return iNet.resources.onegate.ticket.paid_brief_required;
      }
    },{
      property : 'amount',
      label :iNet.resources.onegate.ticket.paid_amount,
      sortable : true,
      align: 'right',
      type : 'text',
      editor: iNet.ui.grid.column.Number,
      width: 300,
      validate : function(v) {
        if (iNet.isEmpty(v))
          return iNet.resources.onegate.ticket.paid_amount;
      }
    },{
      label : '',
      type : 'action',
      separate: '&nbsp;',
      align: 'center',
      buttons : [{
        text : iNet.resources.message.button.edit,
        icon : 'icon-pencil',
        labelCls: 'label label-info',
        visibled: function(data){
          var __data = data || {};
          return (__data.paidDate<1);
        },
        fn : function(record) {
          me.grid.edit(record.uuid);
        }
      },{
        text : iNet.resources.message.button.del,
        icon : 'icon-trash',
        labelCls: 'label label-important',
        fn : function(record) {
          var dialog =  createConfirmDeleteDialog();
          dialog.setData(record);
          dialog.show();
          dialog.focus();
        },
        visibled: function(data){
          var __data = data || {};
          return (__data.paidDate<1);
        }
      }]
    }];

    var dataSource = new DataSource({
      columns : __columns
    });

    this.grid = new iNet.ui.grid.Grid({
      id: 'ticket-payment-grid-id',
      url:iNet.getXUrl('onegate/dept/paymentlist'),
      dataSource: dataSource,
      idProperty: 'uuid',
      pageSize: 9999,
      hideSearch: true,
      hideHeader: true,
      firstLoad: false,
      convertData: function (data) {
        var __data = data || {};
        var __items = __data.items || [];
        var subtotal= 0;
        var paidDate = 0;
        for(var i =0; i<__items.length;i++) {
          var __item =  __items[i] || {};
          subtotal+= __item.amount;
          paidDate =__item.paidDate;
        }
        $('#ticket-total,#payment-paid-total').text($.formatNumber(subtotal, {format: "#,###.00", locale: "vn"}) + ' (đồng)');
        $('#ticket-date,#payment-paid-date').text((paidDate>0) ? new Date(paidDate).format('d/m/Y H:i:s') : new Date().format('d/m/Y'));
        FormUtils.showButton(me.$toolbar.PAID, (__items.length > 0 && paidDate==0));
        FormUtils.showButton(me.$toolbar.CREATE, (paidDate==0));
        if(paidDate>0) {
          $('#ticket-status').attr('class','label label-success arrowed-in arrowed-in-right').text('Đã thanh toán');
        } else {
          $('#ticket-status').attr('class','label label-danger arrowed').text('Chưa thanh toán');
        }
        return __items;
      }
    });

    this.grid.on('save', function(data) {
      var __data = data || {};
      var grid= me.getGrid();
      $.postJSON(iNet.getXUrl('onegate/dept/paymentcreate'), {
        ticket:me.getTicketId(),
        brief: __data.brief,
        amount: __data.amount
      }, function(result) {
         grid.reload();
      },{mask: grid.getMask() , msg: iNet.resources.ajaxLoading.saving});
    });

    this.grid.on('update', function(data, odata) {
      var __data = data || {};
      var grid= me.getGrid();
      $.postJSON(iNet.getXUrl('onegate/dept/paymentupdate'), {
        ticket:me.getTicketId(),
        brief: __data.brief,
        amount: __data.amount,
        payment: __data.uuid
      }, function(result) {
        grid.reload();
      },{mask: grid.getMask() , msg: iNet.resources.ajaxLoading.saving});
    });

    this.$toolbar.CREATE.on('click', function(){
      this.grid.newRecord();
    }.createDelegate(this));

    this.$toolbar.BACK.on('click', function () {
      this.hide();
      this.fireEvent('back', this);
    }.createDelegate(this));

    this.$toolbar.PAID.on('click', function () {
      var dialog = createPaidDialog();
      dialog.setTicketId(this.getTicketId());
      dialog.show();
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.onegate.officer.TicketPaymentWidget, iNet.ui.onegate.OnegateWidget, {
    getTicketId: function(){
      return this.ticketId;
    },
    getGrid: function(){
      return this.grid;
    },
    setData: function(data){
     var __data= data || {};
      $('#ticket-name').text(__data.subject || '');
      $('#ticket-sender,#payment-paid-sender').text(__data.sender || 'Chưa xác định');
      $('#ticket-status').attr('class','').empty();
      this.ticketId = __data.uuid;
      this.grid.setParams({
        ticket: this.ticketId
      });
      this.grid.load();
    }
  });
});
// #PACKAGE: officer-ticket-view-dialog
// #MODULE: OfficerTicketViewDialog
$(function() {
  iNet.ui.onegate.officer.OfficerTicketViewDialog = function(config) {
    var __config = config || {};
    iNet.apply(this, __config);// apply configuration
    this.id = this.id || 'officer-ticket-view-modal';
    this.$element = $('#' + this.id);
    var $btnCancel = $('#officer-ticket-view-modal-btn-cancel');
    var me = this;
    $.fn.modalmanager.defaults.resize = true;

    $btnCancel.on('click', function() {
      this.hide();
    }.createDelegate(this));

  };
  iNet.extend( iNet.ui.onegate.officer.OfficerTicketViewDialog, iNet.Component, {
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
    setData: function(data){
      var __data= data || {};
      var __empty = iNet.resources.onegate.ticket.na;
      $('#ticket-view-sender').text(__data.sender || __empty);
      var __received = __data.received > 0 ? new Date( __data.received).format('d/m/Y H:i:s'): __empty;
      $('#ticket-view-received').text(__received);
      $('#ticket-view-subject').text(__data.subject ||__empty);
      $('#ticket-view-creatorName').text(__data.creatorName || __empty);
      $('#ticket-view-ownName').text(__data.ownName || __empty);
      var __status = '';
      if(!iNet.isEmpty(__data.status)) {
        __status=iNet.resources.onegate.receiver.status[__data.status.toLowerCase()];
      }
      $('#ticket-view-status').text(__status);
      var __lastupdated = __data.lastupdated > 0 ? new Date( __data.lastupdated).format('d/m/Y H:i:s'): __empty;
      $('#ticket-view-lastupdated').text(__lastupdated);
    }
  });
});

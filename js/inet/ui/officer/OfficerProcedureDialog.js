// #PACKAGE: officer-procedure-dialog
// #MODULE: ProcedureDialog
$(function() {
  iNet.ui.dialog.OfficerProcedureDialog = function(config) {
    var __config = config || {};
    iNet.apply(this, __config);// apply configuration
    this.id = this.id || 'officer-procedure-modal';
    this.$dialog = $('#' + this.id);
    var $btnOk = $('#officer-procedure-modal-btn-ok');
    var $btnCancel = $('#officer-procedure-modal-btn-cancel');
    var me = this;
    $.fn.modalmanager.defaults.resize = true;

    var dataSource = new DataSource({
      columns: [{
        label: iNet.resources.onegate.ticket.order,
        type : 'rownumber',
        align: 'center',
        width : 50
      },
        {
          property: 'subject',
          label: iNet.resources.onegate.ticket.procedure_name,
          sortable: true,
          type: 'label'
        },
        {
          property: 'industry',
          label: iNet.resources.onegate.ticket.industry,
          sortable: true,
          width: 300,
          type: 'label'
        }
      ]
    });

    this.grid = new iNet.ui.grid.Grid({
      id: 'officer-procedure-modal-grid-id',
      url:  iNet.getXUrl('onegate/office/prodservice'),
      dataSource: dataSource,
      idProperty: 'procedureID',
      convertData: function (data) {
        var __data = data || {};
        me.grid.setTotal(__data.total);
        return __data.items
      }
    });

    this.grid.on('click',function(record) {
      this.fireEvent('select', [record], this);
    }.createDelegate(this));

    $btnOk.on('click', function() {
      var sm = this.grid.getSelectionModel();
      var __records = sm.getSelection();
      me.fireEvent('select', __records, this);
    }.createDelegate(this));

    $btnCancel.on('click', function() {
      this.hide();
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.dialog.OfficerProcedureDialog, iNet.Component, {
    getEl: function(){
      return this.$dialog;
    },
    show : function() {
      this.getEl().modal('show');
    },
    hide : function() {
      this.getEl().modal('hide');
    },
    getMask: function(){
      return this.getEl();
    }
  });
});

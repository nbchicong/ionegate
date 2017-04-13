// #PACKAGE: admin-wf-workstation-search
// #MODULE: WorkflowWorkstationSearchService
$(function() {
  iNet.ui.admin.WorkflowWorkstationSearchService = function(config){
    this.url = {
      list: iNet.getUrl('onegate/unitwork/list'),
      del:  iNet.getUrl('onegate/unitwork/delete')
    };
    this.$id = $("#div-wf-search");
    this.display = true;
    var __config = config || {};

    iNet.apply(this, __config);
    var self = this;
    var deleteIds = "";
    this.$element = this.$id;
    this.$toolbar = {
      CREATE : $('#btn-wf-actor-create')
    };
    var confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
      id : 'modal-confirm-delete',
      title : iNet.resources.message.dialog_confirm_title,
      content : iNet.resources.message.dialog_confirm_content,
      buttons : [{
        text : iNet.resources.message.button.ok,
        cls : 'btn-danger',
        icon : 'icon-ok icon-white',
        fn : function() {
          if (!iNet.isEmpty(deleteIds)) {
            this.hide();
            $.postJSON(self.url.del, {
              uuid : deleteIds
            }, function() {
                self.grid.remove(deleteIds);
              deleteIds = null;
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
    // GRID ======================================================
    var fnDelete = function(record){
      deleteIds = record.uuid;
      confirmDeleteDialog.show();
    };

    var dataSource = new DataSource({
      columns : [{
        property : 'name',
        label : /*getText("code_field")*/'Đơn vị xử lý',
        sortable : true,
        //width : 150,
        type : 'label'
      },{
        property : 'actor',
        label : /*getText("subject_field")*/'Đại diện',
        sortable : true,
        type : 'label'
      },{
        label : '',
        type : 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons : [{
          text : iNet.resources.message.button.edit,
          icon : 'icon-pencil',
          fn : function(record) {
            self.fireEvent("edit", record);
          }
        },{
          text : iNet.resources.message.button.del,
          icon : 'icon-trash',
          fn : function(record) {
            fnDelete(record);
          }
        }]
      }]
    });

    this.grid = new iNet.ui.grid.Grid({
      id : 'wf-grid-id',
      url : self.url.list,
      dataSource : dataSource,
      idProperty : 'uuid',
      firstLoad: true,
      convertData : function(data) {
        var __items = data.items || [];
        var __temp;
        for(var i = 0; i< __items.length; i++){
          __temp = __items[i].representative || {}; 
          __items[i].actor = __temp.actor;
        }
        return __items;
      }
    });
    
    this.grid.on('click', function(record) {
      self.fireEvent("edit", record);
    });
    // action -----------------------------------------------
    this.$toolbar.CREATE.click(function() {
      self.fireEvent("create");
    });

    // init widget
    (function(){
      (self.display) ? self.show() : self.hide();
    }());
  };

  iNet.extend(iNet.ui.admin.WorkflowWorkstationSearchService, iNet.ui.onegate.OnegateWidget, {
    addRow : function(data){
       this.grid.insert(data);
    },
    updateRow : function(data){
      this.grid.update(data)
    },
    reload : function(){
      this.grid.reload();
    }
    
  });
});
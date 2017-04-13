// #PACKAGE: admin-wf-search
// #MODULE: WorkflowSearchService
$(function() {
  iNet.ui.admin.WorkflowSearchService = function(config){
    this.url = {
      list : iNet.getUrl('cloud/workflow/defproc/list'),
      del: iNet.getUrl('cloud/workflow/defproc/delete'),
      update: iNet.getUrl('cloud/workflow/defproc/update')
    };
    this.$id = $("#div-wf-search");
    this.display = true;
    var __config = config || {};

    iNet.apply(this, __config);
    var self = this;
    var deleteIds = "";
    this.$element = this.$id;
    this.$toolbar = {
      CREATE : $('#btn-wf-create')
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
              procedure : deleteIds
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
        label : /*getText("code_field")*/'Tên quy trình',
        sortable : true,
        width : 150,
        type : 'label'
      },{
        property : 'brief',
        label : /*getText("subject_field")*/'Mô tả',
        sortable : true,
        type : 'label'
      },{
        property : 'version',
        label : /*getText("subject_field")*/'Trạng thái',
        sortable : true,
        width : 100,
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
            text : 'Phát hành',
            icon : 'icon-play',
            fn : function(record) {
            	var __data = {
    		      uuid: record.uuid,
    		      version: 'PRODUCTION'
    		    };
    		    $.postJSON(self.url.update, __data, function(result) {
    		      self.grid.reload();
    		    });
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
      params: {apply: "ONEGATE"},
      idProperty : 'uuid',
      firstLoad: true,
      convertData : function(data) {
        return data.items
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

  iNet.extend(iNet.ui.admin.WorkflowSearchService, iNet.ui.onegate.OnegateWidget, {
    addRow : function(data){
       this.grid.insert(data);
    },
    updateRow : function(data){
      this.grid.update(data)
    }
  });
});
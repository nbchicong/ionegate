// #PACKAGE: ionegate-admin-wf-design-search
// #MODULE: AdminWorkflowDesignSearchService
$(function() {
  iNet.ns('iNet.ui.onegate.admin');
  iNet.ui.onegate.admin.WorkflowCopyDialog = function(config) {
    var __config = config || {};
    iNet.apply(this, __config);// apply configuration
    this.id = this.id || 'workflow-copy-modal';
    this.$element = $('#' + this.id);
    var $btnCancel = $('#workflow-copy-btn-cancel');
    var $btnOk = $('#workflow-copy-btn-ok');
    $.fn.modalmanager.defaults.resize = true;
    
    this.$txtName = $('#workflow-copy-txt-name');w
    this.procedure = '';
    $btnCancel.on('click', function() {
      this.hide();
    }.createDelegate(this));

    $btnOk.on('click', function() {
      this.fireEvent('copy', this.getData());
      this.hide();
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.onegate.admin.WorkflowCopyDialog, iNet.Component, {
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
      this.$txtName.val(data.name);
      this.procedure = data.procedure;
    },
    getData: function(){
      return {
        name: this.$txtName.val(),
        procedure: this.procedure
      };
    }
  });
  //==================================================================
	iNet.ui.onegate.admin.WorkflowDesignSearchService = function(config){
    this.url = {
      list : iNet.getXUrl('onegate/dept/prodservice'),
      copy : iNet.getXUrl('onegate/dept/wflcopy'),
      del : iNet.getXUrl('onegate/dept/wflcopy')
    };
    this.$id = $("#div-wf-search");
    this.display = true;
    var __config = config || {};

    iNet.apply(this, __config);
    var self = this;
    var deleteIds = "";
    this.$element = this.$id;
    this.$toolbar = {
      UPDATE : $('#btn-wf-update')
    };

    var getText = function(text) {
      if (!iNet.isEmpty(text)) {
        return iNet.resources.onegate.admin.procedure[text] || text;
      } else {
        return "";
      }
    };

    var wfCopyDialog= null;
    var createWFCopyDialog = function(){
      if(!wfCopyDialog) {
        wfCopyDialog = new iNet.ui.onegate.admin.WorkflowCopyDialog();
        wfCopyDialog.on('copy', function(data){
          $.postJSON(self.url.copy, data, function (result) {
		        var __result = result || {};
		        if (!iNet.isEmpty(__result.uuid)) {
		          self.showMessage('success', iNet.resources.message["note"], getText("Quy trình đã được sao chép thành công."));
		        } else {
		          // save error
		          self.showMessage('error', iNet.resources.message["note"], getText("Quá trình sao chép không thành công."));
		        }
		      }, {
		        mask: self.getMask(),
		        msg: iNet.resources.ajaxLoading.saving
		      });
         
        });
      }
      return wfCopyDialog;
    };
    // GRID ======================================================
    // SEARCH SIMPLE
	  var BasicSearch = function() {
	    this.id =  'basic-search';
	    this.url = self.url.list;
      BasicSearch.superclass.constructor.call(this);
	  };
	
	  iNet.extend(BasicSearch, iNet.ui.grid.AbstractSearchForm, {
	    intComponent: function() {
	      this.$keyword = $("#txt-bs-keyword");
	      this.$industry = $('#cbb-bs-industry');
	      //apply UI
        var me = this;

        this.industrySelect = new iNet.ui.form.select.Select({
          id: me.$industry.prop('id'),
          formatResult: function (item) {
            var __item = item || {};
            var __children = __item.children || [];
            var $option = $(__item.element);
            var __pattern = $option.data('pattern') || '__:__';
            if (__children.length > 0) {
              return String.format('<span class="badge badge-warning"><i class="icon-book"></i></span> {0}', __item.text)
            }
            return String.format('<span class="label label-info">{0}</span> {1}', __pattern, __item.text);
          },
          formatSelection: function (item) {
            var __item = item || {};
            var $option = $(__item.element);
            var __pattern = $option.data('pattern') || '__:__';
            return String.format('<span class="label label-info" style="height: auto !important;">{0}</span> {1}', __pattern, __item.text);
          }
        });
        this.industrySelect.on('change',function(){
	        me.search();
	      });
	    },
      getUrl: function() {
        return this.url;
      },
	    getId: function() {
	      return this.id;
	    },
	    getData: function() {
	      var __data = {
	        pageSize: 10,
	        pageNumber: 0,
	        keyword: this.$keyword.val().trim(),
	        industry: this.$industry.val()
	      };
	      return __data;
	    }
	  });
    var dataSource = new DataSource({
      columns : [{
        property : 'subject',
        label : 'Tên thủ tục',
        sortable : true,
        type : 'label'
      },{
        label : '',
        type : 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons : [{
          text : 'Thiết kế quy trình',
          icon : 'icon-random',
          labelCls: 'label label-success',
          fn : function(record) {
            if(iNet.isEmpty(record.graphID)){
              alert('Thủ tục chưa có thông tin quy trình. Bạn hãy cập nhật thông tin quy trình trước khi thiết kế quy trình.');
            }else{
              self.fireEvent("design", record);
            }
          }
        },{
          text : 'Sao chép',
          icon : 'icon-copy',
          labelCls: 'label label-success',
          fn : function(record) {
              var dialog = createWFCopyDialog();
              dialog.setData({name: record.subject});
              dialog.show();
          },
          visibled: function(record){
            if(record.editable){
              return false;
            }
            return true;
          }
        }]
      }]
    });

    this.grid = new iNet.ui.grid.Grid({
      id : 'wf-grid-id',
      url : self.url.list,
      dataSource : dataSource,
      basicSearch: BasicSearch,
      idProperty : 'uuid',
      remotePaging: true,
      firstLoad: true,
      convertData : function(data) {
        var __data = data || {};
        self.grid.setTotal(__data.total || 0);
        return __data.items;
      }
    });
    
    this.grid.on('click', function(record) {
      self.fireEvent("update", record);
    });
    // action -----------------------------------------------
    this.$toolbar.UPDATE.click(function() {
      self.fireEvent("update");
    });

    // init widget
    (function(){
      (self.display) ? self.show() : self.hide();
    }());
  };

  iNet.extend(iNet.ui.onegate.admin.WorkflowDesignSearchService, iNet.ui.onegate.OnegateWidget, {
    addRow : function(data){
       this.grid.insert(data);
    },
    updateRow : function(data){
      this.grid.update(data)
    },
    reload: function(){
      this.grid.load();
    }
  });
});
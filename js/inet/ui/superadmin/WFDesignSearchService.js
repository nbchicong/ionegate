// #PACKAGE: ionegate-superadmin-wf-design-search
// #MODULE: SuperadminWorkflowDesignSearchService
$(function() {
  iNet.ns('iNet.ui.onegate.superadmin');
	iNet.ui.onegate.superadmin.WorkflowDesignSearchService = function(config){
    this.url = {
      list : iNet.getUrl('onegate/procedure/material')
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
        label : 'Tên quy trình',
        sortable : true,
        type : 'label'
      },{
        label : '',
        type : 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons : [{
          text : 'Cập nhật thông tin quy trình',
          icon : 'icon-pencil',
          fn : function(record) {
            self.fireEvent("update", record);
          }
        },{
          text : 'Thiết kế quy trình',
          icon : 'icon-random',
          labelCls: 'label label-success',
          fn : function(record) {
              self.fireEvent("design", record);
          },
          visibled: function(record){
              if(iNet.isEmpty(record.graphID)){
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

  iNet.extend(iNet.ui.onegate.superadmin.WorkflowDesignSearchService, iNet.ui.onegate.OnegateWidget, {
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
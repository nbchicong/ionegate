// #PACKAGE: superadmin-office-procedure
// #MODULE: OfficeProcedureWidget
$(function () {
  iNet.ns('iNet.ui.onegate.superadmin');
  iNet.ui.onegate.superadmin.OfficeProcedureWidget = function (config) {
    this.id = 'office-procedure-widget';
    var __config = config || {};
    iNet.apply(this, __config);

    iNet.ui.onegate.superadmin.OfficeProcedureWidget.superclass.constructor.call(this) ;
    var me= this;
    this.$unitLabel = $('#office-procedure-lbl-unit-name');

    this.$toolbar = {
      ADD: $('#office-procedure-btn-add'),
      DELETE: $('#office-procedure-btn-delete'),
      BACK: $('#office-procedure-btn-back'),
      EDIT: $('#office-procedure-btn-edit')
    };
    this.officeId= null;
    var confirmDeleteDialog= null, officeProcedureAddDialog = null;

    iNet.ui.dialog.OfficeProcedureAddDialog = function(config) {
      var __config = config || {};
      iNet.apply(this, __config);// apply configuration
      this.id = this.id || 'office-procedure-add-modal';
      this.$dialog = $('#' + this.id);

      var $btnOk = $('#office-procedure-add-btn-ok');
      var $btnCancel = $('#office-procedure-add-btn-cancel');
      var me = this;

      //~~============BASIC SEARCH ====================
      iNet.ui.onegate.superadmin.OfficeProcedureModalBasicSearch = function() {
        this.id = 'office-procedure-modal-basic-search';
        this.url =  iNet.getUrl('onegate/department/prodsigned');
        iNet.ui.onegate.superadmin.OfficeProcedureModalBasicSearch.superclass.constructor.call(this);
        this.officeId = null;
      };
      iNet.extend(iNet.ui.onegate.superadmin.OfficeProcedureModalBasicSearch, iNet.ui.grid.AbstractSearchForm, {
        intComponent : function() {
          this.$industry = $('#office-procedure-modal-basic-search-select-industry');
          this.$dept = $('#office-procedure-modal-basic-search-select-dept');
          this.$keyword = $('#office-procedure-modal-basic-search-txt-keyword');
          var me = this;
          me.industrySelect = new iNet.ui.form.select.Select({
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

          me.deptSelect = new iNet.ui.form.select.Select({
            id: me.$dept.prop('id'),
            formatResult: function (item) {
              var __item = item || {};
              return String.format('<i class="icon-building"></i> {0}',__item.text);
            },
            formatSelection: function (item) {
              var __item = item || {};
              return String.format('<i class="icon-building"></i> {0}',__item.text);
            }
          });

          me.industrySelect.on('change',function(){
            me.search();
          });

          me.deptSelect.on('change',function(){
            me.search();
          });

        },
        getIndustry: function(){
          return (this.industrySelect) ? this.industrySelect.getData() || {}: {};
        },
        setIndustry: function(industry) {
          var __industry= industry || {};
          var $optionIndustry = this.$industry.find(String.format('option[value="{0}"]', __industry.id));
          this.industrySelect.setData({id: __industry.id, text: __industry.text, element: $optionIndustry});
          //!iNet.isEmpty(__industry.id) ? this.industrySelect.disable() : this.industrySelect.enable();
        },
        setOrg: function(org) {
          var __org= org || {};
          var $optionOrg = this.$dept.find(String.format('option[value="{0}"]', __org.id));
          this.deptSelect.setData({id: __org.id, text: __org.text, element: $optionOrg});
          //!iNet.isEmpty(__org.id) ? this.deptSelect.disable() : this.deptSelect.enable();
        },
        getOrg: function(){
          return (this.deptSelect) ? this.deptSelect.getData() || {}: {};
        },
        setOfficeId: function(officeId){
          this.officeId = officeId;
        },
        getOfficeId: function(){
          return this.officeId;
        },
        getData : function() {
          var __industry = this.getIndustry();
          var __org = this.getOrg();
          var __data = {
            orgcode: __org.id || '',
            industry: __industry.id || '',
            keyword: this.$keyword.val() || '',
            pageSize: 10,
            pageNumber: 0
          };
          return __data;
        }
      });

      var dataSource = new DataSource({
        columns: [
          {
            type: 'selection',
            align: 'center',
            width: 30
          },
          {
            property: 'subject',
            label: 'Tên thủ tục',
            sortable: true,
            type: 'label'
          },
          {
            property: 'industry',
            label: 'Lĩnh vực',
            sortable: true,
            width: 250,
            type: 'label'
          }
        ]
      });

      this.grid = new iNet.ui.grid.Grid({
        id: 'office-procedure-modal-grid-id',
        url:  iNet.getUrl('onegate/department/prodsigned'),
        dataSource: dataSource,
        idProperty: 'uuid',
        remotePaging: true,
        firstLoad: false,
        basicSearch: iNet.ui.onegate.superadmin.OfficeProcedureModalBasicSearch,
        convertData: function (data) {
          var __data = data || {};
          me.grid.setTotal(__data.total);
          return __data.items
        }
      });

      $btnOk.on('click', function() {
        var sm = this.grid.getSelectionModel();
        var __records = sm.getSelection();
        var __ids = [];

        if(__records.length<1){
          me.fireEvent('error', me, 'not_exits');
          return;
        }
        for(var i=0;i<__records.length;i++){
          __ids.push(__records[i].procedureID);
        }
        var __org = me.grid.getQuickSearch().getOrg();
        $.postJSON(iNet.getUrl('onegate/office/prodadd'),{
          office: this.getOfficeId(),
          orgcode:  __org.id || '',
          prods: __ids.join(',')
        },function(result) {
          var __result= result || {};
          me.hide();
          me.fireEvent('prodadd', me, __ids, __result);
        },{mask: me.getMask(), msg: iNet.resources.ajaxLoading.saving});

      }.createDelegate(this));

      $btnCancel.on('click', function() {
        this.hide();
      }.createDelegate(this));

    };
    iNet.extend(iNet.ui.dialog.OfficeProcedureAddDialog, iNet.Component, {
      show : function() {
        this.$dialog.modal('show');
      },
      hide : function() {
        this.$dialog.modal('hide');
      },
      getMask: function(){
        return this.$dialog;
      },
      load: function(){
        var grid= this.grid;
        if(grid) {
          grid.getQuickSearch().search();
        }
      },
      setIndustry: function(industry){
        var grid= this.grid;
        if(grid) {
          grid.getQuickSearch().setIndustry(industry);
        }
      },
      setOrg: function(org){
        var grid= this.grid;
        if(grid) {
          grid.getQuickSearch().setOrg(org);
        }
      },
      setOfficeId: function(officeId){
        this.officeId = officeId;
      },
      getOfficeId: function(){
        return this.officeId;
      }
    });
  //~=============================END DIALOG=======================================

    var createOfficeProcedureAddDialog = function(){
      if(!officeProcedureAddDialog) {
        officeProcedureAddDialog =  new iNet.ui.dialog.OfficeProcedureAddDialog();
        officeProcedureAddDialog.on('prodadd', function(wg,ids,result) {
          me.getGrid().reload();
        });
        officeProcedureAddDialog.on('error', function(wg,errorCode) {
          switch (errorCode){
            case 'not_exits':
              me.showMessage('error', 'Thêm thủ tục', 'Chưa chọn thủ tục để thêm vào danh sách');
              break;
          }
        });
      }
      return officeProcedureAddDialog;
    };

    var createConfirmDeleteDialog = function() {
      if(!confirmDeleteDialog) {
        confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'office-procedure-modal-confirm-delete',
          title: iNet.resources.dialog.delete_title,
          content: iNet.resources.dialog.delete_content,
          buttons: [
            {
              text: iNet.resources.message.button.ok,
              cls: 'btn-danger',
              icon: 'icon-ok icon-white',
              fn: function () {
                var __items = this.getData();
                var __ids= [],__removeIds=[];
                for(var i=0;i<__items.length;i++) {
                  var __item = __items[i] || {};
                  __ids.push(__item.procedureID);
                  __removeIds.push(__item.procedureID);
                }
                if (__ids.length>0) {
                  this.hide();
                  var search = me.getGrid().getQuickSearch();
                  $.postJSON(iNet.getUrl('onegate/office/proddelete'), {
                    office: search.getOfficeId(),
                    prods: __ids.join(',')
                  }, function () {
                    me.getGrid().remove(__removeIds.join(';'));
                  }, {mask: this.getMask(), msg: iNet.resources.ajaxLoading.deleting});
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
      return confirmDeleteDialog;
    };

    var dataSource = new DataSource({
      columns: [
        {
          type: 'selection',
          align: 'center',
          width: 30
        },
        {
          property: 'subject',
          label: 'Tên thủ tục',
          sortable: true,
          type: 'label'
        },{
          property: 'industry',
          label: 'Lĩnh vực',
          sortable: true,
          width: 250,
          type: 'label'
        },{
          property: 'name',
          label: 'Đơn vị',
          sortable: true,
          width: 200,
          type: 'label'
        },{
          label: '',
          type: 'action',
          separate: '&nbsp;',
          align: 'center',
          buttons: [
            {
              text: iNet.resources.message.button.del,
              icon: 'icon-trash',
              labelCls: 'label label-important',
              fn: function (record) {
                var dialog = createConfirmDeleteDialog();
                dialog.setData([record]);
                dialog.show();
              }
            }
          ]
        }
      ]
    });

    //~~============BASIC SEARCH ====================
    iNet.ui.onegate.superadmin.OfficeProcedureBasicSearch = function() {
      this.id = 'office-procedure-basic-search';
      this.url =  iNet.getUrl('onegate/office/prodlist');
      this.officeId= null;
      iNet.ui.onegate.superadmin.OfficeProcedureBasicSearch.superclass.constructor.call(this);
    };
    iNet.extend(iNet.ui.onegate.superadmin.OfficeProcedureBasicSearch, iNet.ui.grid.AbstractSearchForm, {
      intComponent : function() {
        this.$industry = $('#office-procedure-basic-search-select-industry');
        this.$dept = $('#office-procedure-basic-search-select-dept');
        this.$keyword = $('#office-procedure-basic-search-txt-keyword');
        var me = this;
        me.industrySelect = new iNet.ui.form.select.Select({
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

        me.deptSelect = new iNet.ui.form.select.Select({
          id: me.$dept.prop('id'),
          formatResult: function (item) {
            var __item = item || {};
            return String.format('<i class="icon-building"></i> {0}',__item.text);
          },
          formatSelection: function (item) {
            var __item = item || {};
            return String.format('<i class="icon-building"></i> {0}',__item.text);
          }
        });

        me.industrySelect.on('change',function(){
          me.search();
        });

        me.deptSelect.on('change',function(){
          me.search();
        });

      },
      getIndustry: function(){
        return (this.industrySelect) ? this.industrySelect.getData() || {}: {};
      },
      getOrg: function(){
        return (this.deptSelect) ? this.deptSelect.getData() || {}: {};
      },
      getData : function() {
        var __industry = this.getIndustry();
        var __org = this.getOrg();
        var __data = {
          office: this.getOfficeId(),
          orgcode: __org.id || '',
          industry: __industry.id || '',
          keyword: this.$keyword.val() || '',
          pageSize: 10,
          pageNumber: 0
        };
        return __data;
      },
      setOfficeId: function(officeId){
        this.officeId = officeId;
      },
      getOfficeId: function(){
        return this.officeId;
      }
    });

    this.grid = new iNet.ui.grid.Grid({
      id: 'office-procedure-grid-id',
      url: iNet.getUrl('onegate/office/prodlist'),
      dataSource: dataSource,
      idProperty: 'procedureID',
      remotePaging: true,
      firstLoad: false,
      basicSearch: iNet.ui.onegate.superadmin.OfficeProcedureBasicSearch,
      convertData: function (data) {
        var __data = data || {};
        me.getGrid().setTotal(__data.total);
        return __data.items
      }
    });

    this.grid.on('selectionchange', function(sm) {
      var __records = sm.getSelection();
      var __isExist  = (__records.length>0);
      FormUtils.showButton(me.$toolbar.DELETE, __isExist);
      if(me.hasPattern()) {
        FormUtils.showButton(me.$toolbar.EDIT, __records.length == 1);
      }
    });

    this.$toolbar.DELETE.on('click', function () {
      var grid= this.getGrid();
      var sm = grid.getSelectionModel();
      var __records = sm.getSelection();
      var dialog = createConfirmDeleteDialog();
      dialog.setData(__records || []);
      dialog.show();
    }.createDelegate(this));

    this.$toolbar.BACK.on('click', function () {
      this.hide();
      this.fireEvent('back', this);
    }.createDelegate(this));

    this.$toolbar.ADD.click(function () {
      var dialog =  createOfficeProcedureAddDialog();
      dialog.show();
      var search = me.getGrid().getQuickSearch();
      if(search) {
        var __org = search.getOrg();
        if(!iNet.isEmpty(__org.id)){
          dialog.setOrg(search.getOrg());
        }
        dialog.setOfficeId(search.getOfficeId());
        dialog.setIndustry(search.getIndustry());
      }
      dialog.load();
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.onegate.superadmin.OfficeProcedureWidget, iNet.ui.onegate.OnegateWidget, {
    getGrid: function(){
      return this.grid;
    },
    loadProcedureByOfficeId: function(officeId){
      var grid= this.getGrid();
      if(grid) {
        grid.getQuickSearch().setOfficeId(officeId);
        grid.getQuickSearch().search();
      }
    },
    setUnitName: function(title){
      this.$unitLabel.html(title);
    }
  });
});
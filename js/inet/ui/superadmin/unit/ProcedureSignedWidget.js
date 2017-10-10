// #PACKAGE: superadmin-procedure-signed
// #MODULE: ProcedureSignedWidget
$(function () {
  iNet.ns('iNet.ui.onegate.superadmin');
  iNet.ui.onegate.superadmin.ProcedureSignedWidget = function (config) {
    this.id = 'procedure-signed-widget';
    var __config = config || {};
    iNet.apply(this, __config);

    iNet.ui.onegate.superadmin.ProcedureSignedWidget.superclass.constructor.call(this) ;
    var me= this;
    this.$unitLabel = $('#procedure-signed-lbl-unit-name');
    this.orgCode = '';

    this.$toolbar = {
      ADD: $('#procedure-signed-btn-add'),
      DELETE: $('#procedure-signed-btn-delete'),
      BACK: $('#procedure-signed-btn-back'),
      EDIT: $('#procedure-signed-btn-edit')
    };

    this.url = {
      procedureList: iNet.getUrl('onegate/department/prodlist'),
      serviceList: iNet.getXUrl('onegate/dept/servicelist')
    };

    var confirmDeleteDialog= null, procedureSignedAddDialog = null,procedureSignedUpdateDialog = null,procedureUpdateDialog = null;

    iNet.ui.dialog.ProcedureSignedAddDialog = function(config) {
      var __config = config || {};
      iNet.apply(this, __config);// apply configuration
      this.id = this.id || 'procedure-signed-add-modal';
      this.$dialog = $.getCmp(this.id);
      var $btnOk = $('#procedure-signed-add-btn-ok');
      var $btnCancel = $('#procedure-signed-add-btn-cancel');
      var me = this;

      //~~============BASIC SEARCH ====================
      iNet.ui.onegate.superadmin.ProcedureSignedModalBasicSearch = function() {
        this.id = 'procedure-signed-modal-basic-search';
        this.url =  iNet.isEmpty(iNet.pattern) ? iNet.getUrl('onegate/department/prodlist'): iNet.getXUrl('onegate/dept/servicelist');
        iNet.ui.onegate.superadmin.ProcedureSignedModalBasicSearch.superclass.constructor.call(this);
      };
      iNet.extend(iNet.ui.onegate.superadmin.ProcedureSignedModalBasicSearch, iNet.ui.grid.AbstractSearchForm, {
        intComponent : function() {
          this.$industry = $('#procedure-signed-modal-basic-search-select-industry');
          this.$keyword = $('#procedure-signed-modal-basic-search-txt-keyword');
          this.orgCode = null;
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

          me.industrySelect.on('change',function(){
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
          !iNet.isEmpty(__industry.id) ? this.industrySelect.disable() : this.industrySelect.enable();
        },
        getData : function() {
          var __item = this.getIndustry();
          var __data = {
            orgcode: this.getOrgCode(),
            industry: __item.id || '',
            keyword: this.$keyword.val() || '',
            pageSize: 10,
            pageNumber: 0
          };
          return __data;
        },
        setOrgCode: function(code){
          this.orgCode = code;
        },
        getOrgCode: function(){
          return this.orgCode;
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
        id: 'procedure-signed-modal-grid-id',
        url:  iNet.isEmpty(iNet.pattern) ? iNet.getUrl('onegate/department/prodlist'): iNet.getXUrl('onegate/dept/servicelist'),
        dataSource: dataSource,
        idProperty: 'uuid',
        remotePaging: true,
        firstLoad: false,
        basicSearch: iNet.ui.onegate.superadmin.ProcedureSignedModalBasicSearch,
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
          __ids.push(__records[i].uuid);
        }
        var __url = iNet.isEmpty(iNet.pattern) ? iNet.getUrl('onegate/department/prodadd') : iNet.getXUrl('onegate/dept/prodadd');
        $.postJSON(__url,{
          orgcode:  me.grid.getQuickSearch().getOrgCode(),
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
    iNet.extend(iNet.ui.dialog.ProcedureSignedAddDialog, iNet.Component, {
      show : function() {
        this.$dialog.modal('show');
      },
      hide : function() {
        this.$dialog.modal('hide');
      },
      getMask: function(){
        return this.$dialog;
      },
      loadByCode: function(code){
        var grid= this.grid;
        if(grid) {
          grid.getQuickSearch().setOrgCode(code);
          grid.getQuickSearch().search();
        }
      },
      setIndustry: function(industry){
        var grid= this.grid;
        if(grid) {
          grid.getQuickSearch().setIndustry(industry);
        }
      }
    });

    //=============================Start ProcedureSignedUpdateDialog=====
    iNet.ui.dialog.ProcedureSignedUpdateDialog = function(config) {
      var __config = config || {};
      iNet.apply(this, __config);// apply configuration
      this.id = this.id || 'procedure-signed-update-modal';
      this.$element = $('#' + this.id);
      var $btnOk = $('#procedure-signed-update-modal-btn-ok');
      var $btnCancel = $('#procedure-signed-update-modal-btn-cancel');

      this.$lblName = $('#procedure-signed-update-modal-lbl-name');
      this.$txtHour = $('#procedure-signed-update-modal-txt-hour');
      this.$txtSubview = $('#procedure-signed-update-modal-txt-subview');
      this.$selectActor= $('#procedure-signed-update-modal-select-actor');
      this.$serviceLevel4Chk = $('#procedure-signed-update-chk-servicel4');
      this.$txtExpenseL2 = $('#procedure-signed-update-txt-expenseL2');
      this.$txtExpenseL3 = $('#procedure-signed-update-txt-expenseL3');
      this.$txtExpenseLX = $('#procedure-signed-update-txt-expenseLX');
      var me= this;

      $btnOk.on('click', function() {
        if(!this.check()) {
          return;
        }
        var __data=  this.getData();
        var me = this;
        $.postJSON(iNet.getXUrl('onegate/dept/produpdate'), __data, function(result){
          var __result = result || {};
          me.hide();
        },{mask: this.getMask(), msg: iNet.resources.ajaxLoading.saving});

      }.createDelegate(this));

      $btnCancel.on('click', function() {
        this.hide();
      }.createDelegate(this));

      this.validate = new iNet.ui.form.Validate({
        id: this.id,
        rules: [{
            id: this.$txtHour.prop('id'),
            validate: function (v, $control) {
              if (iNet.isEmpty(v)) {
                return 'Thời gian không được để rỗng';
              } else if(!iNet.isNumber(Number(v))){
                return 'Thời gian có kiểu dữ liệu phải là số nguyên';
              }
            }}
        ]
      });
    };
    iNet.extend(iNet.ui.dialog.ProcedureSignedUpdateDialog, iNet.Component, {
      getEl: function(){
        return this.$element;
      },
      show : function() {
        this.getEl().modal('show');
      },
      hide : function() {
        this.getEl().modal('hide');
      },
      check: function(){
        return this.validate.check();
      },
      getMask: function(){
        return this.getEl();
      },
      getData: function(){
        var __ownerData = this._ownerData || {};
        var __data = {
          firmprod:__ownerData.uuid,
          hours: this.$txtHour.val(),
          serviceL4: this.$serviceLevel4Chk.prop('checked'),
          subview: this.$txtSubview.val(),
          actor: this.$selectActor.val(),
          expenseL2: this.$txtExpenseL2.val(),
          expenseL3: this.$txtExpenseL3.val(),
          expenseLX: this.$txtExpenseLX.val()
        };
        return __data;
      },
      setName: function(name) {
        this.$lblName.text(name);
      },
      setData: function(data){
        var __data = data || {};
        this._ownerData = __data;
        this.$txtHour.val(__data.hours).focus();
        this.$serviceLevel4Chk.prop('checked', __data.serviceL4);
        this.$txtExpenseL2.val(__data.expenseL2 || '');
        this.$txtExpenseL3.val(__data.expenseL3 || '');
        this.$txtExpenseLX.val(__data.expenseLX || '');

        this.$txtSubview.val(__data.subview || '');
        var __actors = (__data.actor || '').split(',');
        var __datas = [];
        this.$selectActor.select2("val", []);
        if(__actors.length>0) {
          for (var i = 0; i < __actors.length; i++) {
            if(!iNet.isEmpty(__actors[i])) {
              var __obj = {
                id: __actors[i],
                text: __actors[i]
              };
              __datas.push(__obj);
            }
          }
          this.$selectActor.select2("data", __datas);
        }
        this.check();
      },
      loadById: function(firmprod) {
        var me= this;
        this.loadActor(function(){
          $.getJSON(iNet.getXUrl('onegate/dept/serviceload'), {'firmprod': firmprod}, function(result){
            var __result = result || {};
            me.setData(__result);
          },{mask: me.getMask(), msg: iNet.resources.ajaxLoading.loading});
        });
      },
      loadActor: function(fn){
        var __fn = fn || iNet.emptyFn;
        var me= this;
        $.getJSON(iNet.getXUrl('onegate/dept/actorlist'),function(result) {
          var __result = result || {};
          var __items = __result.items || [];
          var users = [];
          for (var i = 0; i < __items.length; i++) {
            var __user = __items[i] || {};
            users.push({id: __user.code, text: __user.code});
          }
          var format = function format(item) {
            var __item = item || {};
            return String.format('<span><i class="icon-group"></i> <b>{0}</b></span>', __item.text, __item.id);
          };

          me.$selectActor.select2({
            tags: users,
            tokenSeparators: [","],
            formatInputTooShort: function (term, length) {
              return "";
            },
            formatResult: format
          });
          __fn(__result);
        },{mask: this.getMask(), msg: iNet.resources.ajaxLoading.loading})
      }
    });
    
  //=============================End ProcedureSignedUpdateDialog=====
    
  //=============================Start ProcedureFirmUpdateDialog=====
    iNet.ui.dialog.ProcedureFirmUpdateDialog = function(config) {
      var __config = config || {};
      iNet.apply(this, __config);// apply configuration
      this.id = this.id || 'procedure-firm-update-modal';
      this.$element = $('#' + this.id);
      var $btnOk = $('#procedure-firm-update-modal-btn-ok');
      var $btnCancel = $('#procedure-firm-update-modal-btn-cancel');

      this.$lblName = $('#procedure-firm-update-modal-lbl-name');
      this.$txtSubview = $('#procedure-firm-update-modal-txt-subview');
      this.$serviceLevel3Chk = $('#procedure-firm-update-chk-servicel3');
      this.$serviceLevel4Chk = $('#procedure-firm-update-chk-servicel4');
      this.$chkExServiceLink = $('#procedure-firm-update-chk-ex-service-link');
      this.$txtExServiceLink = $('#procedure-firm-update-txt-ex-service-link');
      this.$txtIndustry = $('#procedure-firm-update-txt-industry');
      this.$txtProcedure = $('#procedure-firm-update-txt-procedure');
      this.$cbbGateway = $('#procedure-firm-update-cbb-gateway');
      this.$serviceFeeContainer = $('#procedure-service-fee-container');
      this.$serviceFee = $('#procedure-firm-txt-service-fee');

      var me= this;

      $btnOk.on('click', function() {
        var __data = me.getData();
        $.postJSON(iNet.getUrl('onegate/department/produpdate'), __data, function (result) {
          me.hide()
        }, {mask: me.getMask(), msg: iNet.resources.ajaxLoading.saving});
      });

      $btnCancel.on('click', function() {
        me.hide();
      });
      
//      this.$chkExServiceLink.on('change', function () {
//        if(this.checked) {
//          me.$txtExServiceLink.show().focus().parent().show();
//        } else {
//          me.$txtExServiceLink.hide().parent().hide();
//        }
//      });

      this.$serviceLevel4Chk.on('change', function () {
        if (this.checked) {
          me.$serviceFeeContainer.show();
          me.$serviceFee.focus();
        }
        else
          me.$serviceFeeContainer.hide();
      });
    };
    iNet.extend(iNet.ui.dialog.ProcedureFirmUpdateDialog, iNet.Component, {
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
      getData: function(){
        var __ownerData = this._ownerData || {};
        var __data = {
          uuid:__ownerData.uuid,
          serviceL4: this.$serviceLevel4Chk.prop('checked'),
          serviceL3: this.$serviceLevel3Chk.prop('checked'),
          industryCode: this.$txtIndustry.val(),
          procedureCode: this.$txtProcedure.val(),
          gateway: this.$cbbGateway.val()
        };
        if (this.$chkExServiceLink[0].checked) {
          __data.exUrl = this.$txtExServiceLink.val();
          __data.exService = true;
        }
        __data.serviceFee = __data.serviceL4 ? this.$serviceFee.val() : 0;

        return __data;
      },
      setName: function(name) {
        this.$lblName.text(name);
      },
      setData: function(data){
        var __data = data || {};
        this._ownerData = __data;
        this.$serviceLevel4Chk.prop('checked', __data.serviceL4);
        this.$serviceLevel3Chk.prop('checked', __data.serviceL3);

        this.$txtProcedure.val(__data.procedureCode || '');
        this.$txtIndustry.val(__data.industryCode || '');

        this.$txtExServiceLink.val(__data.exUrl || '');
        this.$chkExServiceLink[0].checked = __data.exService;

        if (__data.serviceL4) {
          this.$serviceFeeContainer.show();
          this.$serviceFee.val(__data.serviceFee);
        }
        else
          this.$serviceFeeContainer.hide();
        
        this.$cbbGateway.val(__data.gateway);
      },
      loadById: function(uuid, orgCode) {
        var me= this;
        $.postJSON(iNet.getUrl('onegate/department/prodload'), {
          'uuid': uuid,
          'orgcode': orgCode
        }, function (result) {
          var __result = result || {};
          me.setData(__result);
        }, {mask: me.getMask(), msg: iNet.resources.ajaxLoading.loading});
      },
      loadGateway: function(uuid) {
        var me= this;
        this.loadActor(function(){
          $.getJSON(iNet.getXUrl('onegate/dept/serviceload'), {'firmprod': firmprod}, function(result){
            var __result = result || {};
            //me.setData(__result);
          },{mask: me.getMask(), msg: iNet.resources.ajaxLoading.loading});
        });
      }
    });
    
  //=============================End ProcedureUpdateDialog=====  
    var createProcedureSignedUpdateDialog = function(){
      if(!procedureSignedUpdateDialog) {
        procedureSignedUpdateDialog =  new iNet.ui.dialog.ProcedureSignedUpdateDialog();
      }
      return procedureSignedUpdateDialog;
    };
    
    var createProcedureFirmUpdateDialog = function(){
      if(!procedureUpdateDialog) {
          procedureUpdateDialog =  new iNet.ui.dialog.ProcedureFirmUpdateDialog();
      }
      return procedureUpdateDialog;
    };

    var createProcedureSignedAddDialog = function(){
      if(!procedureSignedAddDialog) {
        procedureSignedAddDialog =  new iNet.ui.dialog.ProcedureSignedAddDialog();
        procedureSignedAddDialog.on('prodadd', function(wg,ids,result) {
          me.getGrid().reload();
        });
        procedureSignedAddDialog.on('error', function(wg,errorCode) {
          switch (errorCode){
            case 'not_exits':
              me.showMessage('error', 'Thêm thủ tục', 'Chưa chọn thủ tục để thêm vào danh sách');
              break;
          }
        });
      }
      return procedureSignedAddDialog;
    };

    var createConfirmDeleteDialog = function() {
        if(!confirmDeleteDialog) {
          confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
            id: 'procedure-modal-confirm-delete',
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
                    __ids.push(__item.uuid);
                    __removeIds.push(__item.uuid);
                  }
                  if (__ids.length>0) {
                    this.hide();
                    var __url = !me.hasPattern() ? iNet.getUrl('onegate/department/proddelete'):iNet.getXUrl('onegate/dept/proddelete');
                    $.postJSON(__url, {
                      prods: __ids.join(','),
                      orgcode: me.getGrid().getQuickSearch().getOrgCode()
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
      columns: [{
        type: 'selection',
        align: 'center',
        width: 30
      }, {
        property: 'procedureCode',
        label: 'Mã thủ tục',
        sortable: true,
        width: 100,
        type: 'label'
      },{
        property: 'serviceL3',
        label: 'Dịch vụ',
        sortable: false,
        width: 100,
        type: 'label',
        renderer: function(value, data){
        	var s = '';
        	if(!!value){
        		s = '<label class="label label-success">L3</label> &nbsp;';
        	}
        	
        	if(!!data.serviceL4){
        		s += '<label class="label label-warning">L4</label> &nbsp;';
        	}
        	
        	if(!!data.exService){
        		s += '<label class="label label-info">URL</label>';
        	}
        	return s;
        }  
      },{
        property: 'subject',
        label: 'Tên thủ tục',
        sortable: true,
        type: 'label'
      }, {
        property: 'industryCode',
        label: 'Mã lĩnh vực',
        sortable: true,
        width: 100,
        type: 'label'
      }, {
        property: 'industry',
        label: 'Lĩnh vực',
        sortable: true,
        width: 250,
        type: 'label'
      }, {
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [{
          text: iNet.resources.message.button.edit,
          icon: 'icon-pencil',
          labelCls: 'label label-info',
          fn: function (record) {
            var __record = record || {};
            var dialog = null;
            if (me.hasPattern()) {
              dialog = createProcedureSignedUpdateDialog();
              dialog.setName(__record.subject);
              dialog.loadById(__record.uuid);
              dialog.show();
            } else {
              dialog = createProcedureFirmUpdateDialog();
              dialog.setName(__record.subject);
              dialog.loadById(__record.uuid, me.orgCode);
              dialog.show();
            }
          }
        }, {
          text: iNet.resources.message.button.del,
          icon: 'icon-trash',
          labelCls: 'label label-important',
          fn: function (record) {
            var dialog = createConfirmDeleteDialog();
            dialog.setData([record]);
            dialog.show();
          }
        }]
      }]
    });

    //~~============BASIC SEARCH ====================
    iNet.ui.onegate.superadmin.ProcedureSignedBasicSearch = function() {
      this.id = 'procedure-signed-basic-search';
      this.url =  iNet.isEmpty(iNet.pattern) ? iNet.getUrl('onegate/department/prodsigned'): iNet.getXUrl('onegate/dept/prodservice');
      this.orgCode = null;
      iNet.ui.onegate.superadmin.ProcedureSignedBasicSearch.superclass.constructor.call(this);
    };
    
    iNet.extend(iNet.ui.onegate.superadmin.ProcedureSignedBasicSearch, iNet.ui.grid.AbstractSearchForm, {
      intComponent : function() {
        this.$industry = $('#procedure-signed-basic-search-select-industry');
        this.$keyword = $('#procedure-signed-basic-search-txt-keyword');
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

        me.industrySelect.on('change',function(){
          me.search();
        });

      },
      getIndustry: function(){
        return (this.industrySelect) ? this.industrySelect.getData() || {}: {};
      },
      getData : function() {
        var __item = this.getIndustry();
        var __data = {
          orgcode: this.getOrgCode(),
          industry: __item.id || '',
          keyword: this.$keyword.val() || '',
          pageSize: 10,
          pageNumber: 0
        };
        return __data;
      },
      setOrgCode: function(code){
        this.orgCode = code;
      },
      getOrgCode: function(){
        return this.orgCode;
      }
    });

    this.grid = new iNet.ui.grid.Grid({
      id: 'procedure-signed-grid-id',
      url: this.hasPattern() ? iNet.getUrl('onegate/department/prodsigned'): iNet.getXUrl('onegate/dept/prodservice'),
      dataSource: dataSource,
      idProperty: 'uuid',
      remotePaging: true,
      firstLoad: false,
      basicSearch: iNet.ui.onegate.superadmin.ProcedureSignedBasicSearch,
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

    if(this.hasPattern()){
      this.grid.on('click', function(record) {
        var __record = record || {};
        var dialog = createProcedureSignedUpdateDialog();
        dialog.setName(__record.subject);
        dialog.loadById(__record.uuid);
        dialog.show();
      });
    }else{
      this.grid.on('click', function(record) {
        var __record = record || {};
        var dialog = createProcedureFirmUpdateDialog();
        dialog.setName(__record.subject);
        dialog.loadById(__record.uuid, me.orgCode);
        dialog.show();
      });
    }

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
      var dialog =  createProcedureSignedAddDialog();
      dialog.show();
      dialog.setIndustry(me.getGrid().getQuickSearch().getIndustry());
      dialog.loadByCode(me.getGrid().getQuickSearch().getOrgCode());
    }.createDelegate(this));

    this.$toolbar.EDIT.on('click', function(){
      var grid= me.getGrid();
      var sm = grid.getSelectionModel();
      var dialog = createProcedureSignedUpdateDialog();
      var __records = sm.getSelection();
      var __data = __records[0] || {};
      dialog.setName(__data.subject);
      dialog.loadById(__data.uuid);
      dialog.show();
    });

  };
  iNet.extend(iNet.ui.onegate.superadmin.ProcedureSignedWidget, iNet.ui.onegate.OnegateWidget, {
    getGrid: function(){
      return this.grid;
    },
    loadProcedureByOrgCode: function(code){
      var grid= this.getGrid();
      this.orgCode = code;
      if(grid) {
        grid.getQuickSearch().setOrgCode(code);
        grid.getQuickSearch().search();
      }
    },
    setUnitName: function(title){
      this.$unitLabel.html(title);
    }
  });
});
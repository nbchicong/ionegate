// #PACKAGE: superadmin-holiday
// #MODULE: HolidayService
$(function() {
  iNet.ui.admin.HolidayWidget = function(config){
    var __config = config || {};
    iNet.apply(this, __config);
    this.id = 'holiday-widget';
    this._resource = iNet.resources.onegate.admin.holiday || {};

    iNet.ui.admin.HolidayWidget.superclass.constructor.call(this) ;
    var me = this;
    var confirmDeleteDialog = null;

    this.$toolbar = {
      CREATE : $('#holiday-btn-create'),
      SAVE : $('#holiday-btn-save'),
      AUTO_CREATE: $('#holiday-btn-auto-create')
    };

    var createConfirmDeleteDialog = function(){
      if(!confirmDeleteDialog) {
        confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id : 'holiday-modal-confirm-delete',
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
                $.postJSON(iNet.getUrl('onegate/specialday/delete'), {
                  uuid: __uuid
                }, function() {
                  me.grid.remove(__uuid);
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
      property : 'date',
      label : this._resource["date_field"],
      sortable : true,
      type : 'datetime',
      width: 200,
      validate : function(v) {
        if (iNet.isEmpty(v))
          return 'Date must not be empty';
      }
    },{
      property : 'description',
      label : this._resource["description_field"],
      sortable : true,
      type : 'text',
      validate : function(v) {
        if (iNet.isEmpty(v))
          return 'Description must not be empty';
      }
    },{
      width : 100,
      property : 'workforced',
      label : 'Làm thêm',
      align: 'center',
      type: 'checkbox'
    },{
      width : 100,
      property : 'halfofday',
      label : 'Làm 1/2 ngày',
      align: 'center',
      type: 'checkbox'
    }];
    if(!this.hasPattern()) {
      __columns.push({
        label : '',
        type : 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons : [{
          text : iNet.resources.message.button.edit,
          icon : 'icon-pencil',
          labelCls: 'label label-info',
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
          }
        }]
      });
    }

    var dataSource = new DataSource({
      columns : __columns
    });
    //~~============BASIC SEARCH ====================
    var HolidayBasicSearch = function() {
      this.id = 'holiday-basic-search';
      this.url = iNet.getUrl('onegate/specialday/list');
      HolidayBasicSearch.superclass.constructor.call(this);
    };
    iNet.extend(HolidayBasicSearch, iNet.ui.grid.AbstractSearchForm, {
      intComponent : function() {
        this.$year = $('#holiday-search-basic-select-year');
        var me = this;
        var year = (new Date()).getFullYear();
        this.$year.empty();
        for (var i = year-5; i < year + 5; i++) {
          this.$year.append(String.format('<option value="{0}" {1}>{0}</option>', i, (i==year)? 'selected="selected"': ''));
        }

        this.yearSelect = new iNet.ui.form.select.Select({
          id: this.$year.prop('id'),
          formatResult: function (v) {
            var __object = v || {};
            return String.format('<i class="icon-calendar"></i> năm {0}',__object.text);
          },
          formatSelection: function (v) {
            var __object = v || {};
            return String.format('<i class="icon-calendar"></i> năm {0}',__object.text);
          }
        });
        this.yearSelect.on('change',function(){
           me.search();
        });
      },
      getData : function() {
        var __item = this.yearSelect.getData();
        var __data = {
          year: __item.id
        };
        return __data;
      }
    });

    this.grid = new iNet.ui.grid.Grid({
      id : 'holiday-grid-id',
      url : iNet.getUrl('onegate/specialday/list'),
      dataSource : dataSource,
      basicSearch: HolidayBasicSearch,
      idProperty : 'uuid',
      convertData : function(data) {
        return data.items
      }
    });

    this.grid.on('save', function(data) {
      var __data = data || {};
      __data.date =  __data.date.toDate().getTime();
      var grid= me.getGrid();
      $.postJSON(iNet.getUrl('onegate/specialday/create'), __data, function(result) {
        var __result = result || {};
        if(!iNet.isEmpty(__result.uuid)) {
          grid.insert(__result);
          grid.newRecord();
        }
      },{mask: grid.getMask() , msg: iNet.resources.ajaxLoading.saving});
    });

    this.grid.on('update', function(data, odata) {
      var __data = data || {};
      __data.date =  __data.date.toDate().getTime();
      var grid= me.getGrid();
      $.postJSON(iNet.getUrl('onegate/specialday/update'), __data, function(result) {
        var __result = result || {};
        if(!iNet.isEmpty(__result.uuid)) {
          grid.update(__result);
          grid.commit();
        }
      },{mask: grid.getMask() , msg: iNet.resources.ajaxLoading.saving});
    });


    this.$toolbar.CREATE.on('click', function(){
      this.grid.newRecord();
    }.createDelegate(this));

    this.$toolbar.AUTO_CREATE.on('click', function(){
      var grid= this.getGrid();
      var __params = grid.getParams();
      $.postJSON(iNet.getUrl('onegate/specialday/holiday'), {year: __params.year}, function(result) {
        var __result = result || {};
        if(!iNet.isEmpty(__result.total)) {
          grid.load();//refresh
        }
      },{mask: grid.getMask() , msg: iNet.resources.ajaxLoading.saving});
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.admin.HolidayWidget, iNet.ui.onegate.OnegateWidget, {
    getGrid: function(){
      return this.grid;
    }
  });

  //~========================EXECUTE SERVICE========================
  var holiday=new iNet.ui.admin.HolidayWidget();
  holiday.show();
});

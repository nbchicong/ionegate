// #PACKAGE: admin-procedure-search
// #MODULE: ProcedureSearchService
$(function () {
  iNet.ns('iNet.ui.onegate.admin');
  iNet.ui.onegate.admin.ProcedureSearchWidget = function (config) {
    this.id = 'procedure-search-widget';
    var __config = config || {};
    iNet.apply(this, __config);

    iNet.ui.onegate.admin.ProcedureSearchWidget.superclass.constructor.call(this) ;
    var me= this;
    this.$toolbar = {
      CREATE: $('#procedure-search-btn-create'),
      DELETE: $('#procedure-search-btn-delete')
    };

    this.url = {
      search: iNet.getUrl('onegate/procedure/material/search'),
      remove: iNet.getUrl('onegate/prodmaterial/delete')
    };

    var confirmDeleteDialog= null;

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
                var __data = this.getData();
                if (!iNet.isEmpty(__data.uuid)) {
                  this.hide();
                  $.postJSON(me.url.remove, {
                    procedure: __data.uuid
                  }, function () {
                    me.getGrid().remove(__data.uuid);
                  }, {mask: this.getMask(), msg: iNet.resources.ajaxLoading.deleting});
                }
              }
            }, {
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

    var __actionButtons = [{
      text: iNet.resources.message.button.edit,
      icon: 'icon-pencil',
      fn: function (record) {
        me.fireEvent("edit", me, record);
      }
    }];
    if(!this.hasPattern()) {
      __actionButtons.push({
        text: iNet.resources.message.button.del,
        icon: 'icon-trash',
        labelCls: 'label label-important',
        fn: function (record) {
          var dialog = createConfirmDeleteDialog();
          dialog.setData(record);
          dialog.show();
        }
      });
    }

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
          label: '',
          type: 'action',
          separate: '&nbsp;',
          align: 'center',
          buttons: __actionButtons
        }
      ]
    });

    //~~============BASIC SEARCH ====================
    var ProcedureBasicSearch = function() {
      this.id = 'procedure-basic-search';
      this.url = me.url.search;
      ProcedureBasicSearch.superclass.constructor.call(this);
    };
    iNet.extend(ProcedureBasicSearch, iNet.ui.grid.AbstractSearchForm, {
      intComponent : function() {
        this.$industry = $('#procedure-basic-search-select-industry');
        this.$firm = $('#procedure-basic-search-select-firm');
        this.$keyword = $('#procedure-basic-search-txt-keyword');
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
        me.firmSelect = new iNet.ui.form.select.Select({
          id: me.$firm.prop('id'),
          formatResult: function (item) {
            return item.text;
          },
          formatSelection: function (item) {
            return item.text;
          }
        });
        me.industrySelect.on('change',function(){
          me.search();
        });
        me.firmSelect.on('change',function(){
          me.search();
        });
      },
      getIndustry: function(){
        return (this.industrySelect) ? this.industrySelect.getData() || {}: {};
      },
      getFirm: function(){
        return (this.firmSelect) ? this.firmSelect.getData() || {}: {};
      },
      getData : function() {
        var __industry = this.getIndustry();
        var __firm = this.getFirm();
        return {
          industry: __industry.id == '' ? '' : __industry.text, // search by industry name
          orgcode: __firm.id || '', // search by firm orgcode
          keyword: this.$keyword.val() || '',
          pageSize: 10,
          pageNumber: 0
        };
      }
    });

    this.grid = new iNet.ui.grid.Grid({
      id: 'procedure-grid-id',
      url: me.url.search,
      dataSource: dataSource,
      idProperty: 'uuid',
      remotePaging: true,
      basicSearch: ProcedureBasicSearch,
      convertData: function (data) {
        var __data = data || {};
        me.getGrid().setTotal(__data.total);
        return __data.items;
      }
    });

    this.grid.on('click', function (record) {
      me.fireEvent("edit", me, record);
    });

    this.$toolbar.CREATE.click(function () {
      this.fireEvent('create', this, this.getGrid().getQuickSearch().getIndustry());
    }.createDelegate(this));
  };
  iNet.extend(iNet.ui.onegate.admin.ProcedureSearchWidget, iNet.ui.onegate.OnegateWidget, {
    getGrid: function(){
      return this.grid;
    }
  });

  //~========================EXECUTE SERVICE========================
  var notify = null;
  var mainWidget= null, procedureWidget = null;
  var iHistory = new iNet.ui.form.History();

  iHistory.on('back', function(widget){
    if(widget) {
      widget.show();
    }
  });
  var historyBack = function(){
    iHistory.back();
  };

  var createNotify = function () {
    if (!notify) {
      notify = new iNet.ui.form.Notify();
    }
    return notify;
  };

  var createProcedureWidget = function (parent) {
    if (!procedureWidget) {
      procedureWidget = new iNet.ui.onegate.admin.ProcedureDetailWidget();
      procedureWidget.on('back', historyBack);
      procedureWidget.on('saved', function (isSave, data) {
        var __data = data || {};
        var __notify = createNotify();
        __notify.setTitle('Thủ tục hành chính');
        if (__data.type == "ERROR") {
          __notify.setType('error');
          __notify.setContent('Có lỗi xảy ra khi lưu dữ liệu !');
          __notify.show();
        } else {
          __notify.setType('success');
          var main = createMainWidget();
          var grid= main.getGrid();
          if (isSave) {
            grid.insert(__data);
            __notify.setContent('Thủ tục hành chính đã được lưu !');
          } else {
            grid.update(__data);
            grid.commit();
            __notify.setContent('Thủ tục hành chính đã được cập nhật !');
          }
          __notify.show();
        }
      });
    }
    if(parent) {
      procedureWidget.setParent(parent);
      parent.hide();
    }
    if(iHistory) {
      iHistory.push(procedureWidget);
    }
    procedureWidget.show();
    return procedureWidget;
  };

  var createMainWidget = function() {
    if(!mainWidget) {
      mainWidget = new iNet.ui.onegate.admin.ProcedureSearchWidget();
      mainWidget.on('create', function(wg, industry) {
        var __widget = createProcedureWidget(wg);
        __widget.resetData();
        __widget.setIndustry(industry);
      });
      mainWidget.on('edit', function (wg, data) {
        var __data = data || {};
        var __widget = createProcedureWidget(wg);
        __widget.loadById(__data.uuid);
      });
    }
    return mainWidget;
  };

  var main = createMainWidget();
  iHistory.setRoot(main);
});
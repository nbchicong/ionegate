/**
 * Created by thoangtd on 12/5/13.
 */
// #PACKAGE: onegate-superadmin-support-qa-search-widget
// #MODULE: SearchWidget

$(function () {

  iNet.ns("iNet.ui",
    "iNet.ui.superadmin",
    "iNet.ui.superadmin.support",
    "iNet.ui.superadmin.support.qa");
  iNet.ui.superadmin.support.qa.SearchWidget = function (config) {
    var __config = config || {};
    this.url = {
      // TODO set url
      search: iNet.getUrl('onegate/faq/search'),
      del: iNet.getUrl('onegate/faq/delete')
    };
    //this.dataField = {};
    this.uuidDeletes = "";
    iNet.apply(this, __config);
    iNet.ui.superadmin.support.qa.SearchWidget.superclass.constructor.call(this);
    this.$toolbar = {
      DELETE: $("#qa-search-qa-btn-remove")
    };
    this.$grid = $("#qa-search-grid");
    var self = this;
    this.dataField = (this.dataField) ? this.dataField : {};
    var dataSource = new DataSource({
      columns: [{
        type: 'selection',
        align: 'center',
        width: 30
      },{
        type: 'rownumber',
        align: 'center',
        width: 30
      },{
        property: "subject",
        label: "Chủ đề",
        sortable: true
      },{
        property: 'fullname',
        label: "Họ và tên",
        sortable: true,
        type: 'label'
      }, {
        property: 'created',
        label: "Ngày gởi",
        sortable: true,
        type: 'label',
        renderer: function(item) {
          return new Date(item).format(iNet.dateFormat);
        },
        width: 85
      }, {
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [{
          text: iNet.resources.message.button.del,
          icon: 'ace-icon icon-trash',
          labelCls: 'label label-danger',
          fn: function(record) {
            var __deleteId = (record.uuid || '').toString();
            console.log("__deleteId: ", __deleteId);
            self.setUuidDelete(__deleteId);
            self.getDialogDelete(__deleteId).show();
          }
        }]
      }]
    });

    this.BasicSearch = function () {
      this.id = "qa-basic-search-basic-search";
      this.url = iNet.getUrl("onegate/faq/search");
    };

    iNet.extend(this.BasicSearch, iNet.Component, {
      constructor: this.BasicSearch,
      intComponent: function (grid) {
        this.$keyword = $.getCmp("qa-basic-search-simple-key-work");
        this.$type = $.getCmp("qa-basic-search-select-type");
        $.getCmp("qa-basic-search-select-type").on("change", function(){
          var __keyword = this.$keyword.val().trim();
          var __type = this.$type.val();
          var __data = {
            keywords: __keyword,
            status: __type
          };
          self.grid.setParams(__data);
          self.grid.load();
        }.createDelegate(this));
      },
      intEvent: function(){

      },
      getUrl: function () {
        return this.url;
      },
      getId: function () {
        return this.id;
      },
      getData: function () {
        var __keyword = this.$keyword.val().trim();
        var __type = this.$type.val();
        var __data = {
          keywords: __keyword,
          status: __type
        };
        return __data;
      }
    });

    this.grid = new iNet.ui.grid.Grid({
      id: this.$grid.prop("id"),
      url: self.url.search,
      basicSearch: this.BasicSearch,
      dataSource: dataSource,
      remotePaging: true,
      idProperty: 'uuid',
      pageSize: 20,
      firstLoad: true,
      convertData: function(data) {
        self.grid.setTotal(data.total);
        var __items = data.items || [];
        return __items || [];
      }
    });

    this.grid.on("click", function(data) {
      var __data = data || {};
      self.hide();
      self.fireEvent("view", __data);
    });

    this.grid.on('selectionchange', function(sm, data){
      var records = sm.getSelection();
      var count =  records.length;
      FormUtils.disableButton(self.$toolbar.DELETE, !(count>0));
    });

    this.$toolbar.DELETE.on("click", function(){
      var items = this.grid.getSelectionModel().getSelection();
      var ids= [];
      for(var i=0;i<items.length;i++) {
        ids.push(items[i][this.grid.getIdProperty()]);
      }
      this.setUuidDelete(ids.join(","));
      this.getDialogDelete().show();
    }.createDelegate(this));
  };

  iNet.extend(iNet.ui.superadmin.support.qa.SearchWidget, iNet.ui.onegate.OnegateWidget, {
    getText: function (text) {
      return text;
    },
    search: function (params) {
      this.grid.setParams(params);
      this.grid.reload();
    },
    getGrid: function () {
      return this.grid;
    },
    getModule: function(){
      return this.module;
    },
    setUuidDelete: function(uuidDeletes){
      this.uuidDeletes = uuidDeletes;
    },
    getUuidDelete: function(){
      return this.uuidDeletes;
    },
    getDialogDelete: function(){
      var __me = this;
      var confirm = this.confirmDialog(iNet.resources.message.dialog_del_confirm_title, iNet.resources.message.dialog_del_confirm_content, function() {

          confirm.hide();
          $.postJSON(__me.url.del, {
            uuids: this.getUuidDelete()
          }, function() {
            __me.search();
          }, {
            mask: __me.getMask(),
            msg: iNet.resources.ajaxLoading.deleting
          });
      });
      return confirm;
    }
  });
});

/**
 * Created by thoangtd on 12/5/13.
 */
// #PACKAGE: onegate-superadmin-report-search-widget-abstract
// #MODULE: SearchWidget

$(function () {

  iNet.ns("iNet.ui",
    "iNet.ui.superadmin",
    "iNet.ui.superadmin.report",
    "iNet.ui.superadmin.report.SearchWidgetAbstract");
  iNet.ui.superadmin.report.SearchWidgetAbstract = function (config) {
    var __config = config || {};
    this.url = {
      // TODO set url
      search: iNet.getUrl('onegate/report/list'),
      del: iNet.getUrl('onegate/report/delete')
    };
    //this.dataField = {};
    this.idDelete="";
    iNet.apply(this, __config);
    iNet.ui.superadmin.report.SearchWidgetAbstract.superclass.constructor.call(this);
    this.$toolbar = {
      CREATE: this.$element.find("[name=report-search-report-btn-create]")
    };

    var self = this;
    this.dataField = (this.dataField) ? this.dataField : {};
    var dataSource = new DataSource({
      columns: [{
        type: 'selection',
        align: 'center',
        width: 30
      },{
        label: "#",
        type: 'rownumber',
        sortable: true
      },{
        property: 'name',
        label: "Tên báo cáo",
        sortable: true,
        type: 'label'
      }, {
        property: 'creatorName',
        label: 'Người tạo',
        sortable: true,
        type: 'label',
        width: 180
      }, {
        property: 'created',
        label: "Ngày tạo",
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
          text: iNet.resources.message.button.download,
          icon: 'ace-icon icon-download-alt icon-white',
          labelCls: 'label label-success',
          fn: function(record) {
            var __record = record || {};
            if (!iNet.isEmpty(__record.reportID)) {
              $.download(iNet.getUrl("report/file/download"), {
                reportID: record.reportID
              });
            }
            else {
              self.showMessage("error", iNet.resources.notify.title, self.getText("down_error"));
            }
          }
        },{
          text: iNet.resources.message.button.del,
          icon: 'ace-icon icon-trash',
          labelCls: 'label label-danger',
          fn: function(record) {
            var __deleteId = (record.uuid || '').toString();
            self._setIdDelete(__deleteId);
            var confirm = self.confirmDialog(iNet.resources.message.dialog_del_confirm_title, iNet.resources.message.dialog_del_confirm_content, function() {
              if (!iNet.isEmpty(__deleteId)) {
                  confirm.hide();
                $.postJSON(self.url.del, {
                  reportID: self._getIdDelete()
                }, function() {

                  self.grid.remove(self._getIdDelete());

                }, {
                  mask: this.getMask(),
                  msg: iNet.resources.ajaxLoading.deleting
                });
              }
            }).show();
          }
        }]
      }]
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
      rowClass: function(record) {
        var __record = record || {};
        var __status = __record.status || "";
        switch (__status) {
          case 'sent':
            return ''; //status-sent
          case 'reject':
            return 'status-reject';
          default:
            return '';
        }
      },
      convertData: function(data) {
        self.grid.setTotal(data.total || 0);
        var __items = data.items || [];
        return __items || [];
      }
    });

    this.grid.on("click", function(data) {
      var __data = data || {};
      self.hide();
      self.fireEvent("view", __data);
    });

    this.$toolbar.CREATE.on("click", function(){
      this.hide();
      this.fireEvent("create");

    }.createDelegate(this));
  };

  iNet.extend(iNet.ui.superadmin.report.SearchWidgetAbstract, iNet.ui.onegate.OnegateWidget, {
    getText: function (text) {
      return iNet.resources.onegate.superadmin.report.SearchWidget[text] || text;
    },
    search: function () {
    /*  if(!iNet.isEmpty(params)){
        this.grid.setParams(params);
      }*/
      this.grid.reload();
    },
    getGrid: function () {
      return this.grid;
    },
    getModule: function(){
      return this.module;
    },
    _setIdDelete: function(id){
      this.idDelete = id;
    },
    _getIdDelete : function(){
      return this.idDelete;
    }
  });
});

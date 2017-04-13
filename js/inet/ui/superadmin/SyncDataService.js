// #PACKAGE: superadmin-sync-data
// #MODULE: SyncDataService

/*----------------------------------------------
 |               S T R I N G                   |
 ==============================================*/
iNet.applyIf(String.prototype, {
  dateToLong: function (format) {
    var formats = 'd/m/Y';
    format = format || 'dd/MM/yyyy';

    if (format == 'dd/MM/yyyy') formats = 'd/m/Y';
    if (format == 'dd/MM/yyyy HH:mm:ss') formats = 'd/m/Y H:i:s';
    if (format == 'MM/dd/yyyy') formats = 'm/d/Y';
    if (format == 'MM/dd/yyyy HH:mm:ss') formats = 'm/d/Y H:i:s';

    var __format = formats;
    if (__format.length >= 5) {
      __format = __format.substring(0, 5);
    }
    var date = null;
    if (iNet.isEmpty(this)) {
      return null;
    }
    try {
      var split = '/';
      var day = this.substring(0, 2);
      var month = this.substring(3, 5);
      var year = this.substring(6, 10);
      switch (__format) {
        case 'm/d/Y':
          month = this.substring(0, 2);
          day = this.substring(3, 5);
          break;
      }
      var temp = month + split + day + split + year;
      date = new Date(Date.parse(temp)).getTime();
    }
    catch (e) {
      return null;
    }
    return (!isNaN(parseFloat(date)) && isFinite(date)) ? date : null;
  },
  longToDate: function (format) {
    var formats = 'd/m/Y';
    format = format || 'dd/MM/yyyy';

    if (format == 'dd/MM/yyyy') formats = 'd/m/Y';
    if (format == 'dd/MM/yyyy HH:mm:ss') formats = 'd/m/Y H:i:s';
    if (format == 'MM/dd/yyyy') formats = 'm/d/Y';
    if (format == 'MM/dd/yyyy HH:mm:ss') formats = 'm/d/Y H:i:s';

    var date = '';
    if (!(!isNaN(parseFloat(this)) && isFinite(this))) {
      return '';
    }
    try {
      date = new Date(parseFloat(this)).format(formats);
    }
    catch (e) {
    }
    return date;
  }
});

$(function() {
  iNet.ns('iNet.ui.superadmin');

  iNet.ui.superadmin.SyncDataCondition = function () {
    this.id = iNet.generateId();
    var $dialog =  $('#sync-data-modal');
    var self = this;

    var getCurrentDate = function(format){
      var __format = format || "d/m/Y";
      return new Date().format(__format);
    };
    var getFirstDate = function(format){
      var __currentDate = new Date();
      var __format = format || "d/m/Y";
      return new Date(__currentDate.getFullYear(), __currentDate.getMonth(), 1).format(__format);
    };

    var $form = {
      title: $('#sync-data-modal-title'),
      from: $('#sync-data-modal-from'),
      to: $('#sync-data-modal-to')
    };

    var __from = $form.from.datepicker({
      format: 'dd/mm/yyyy'
    }).on('changeDate', function (ev) {
      __from.hide();
    }).data('datepicker');

    $form.from.next().on('click', function () {
      $(this).prev().focus();
    });
    $form.from.val(getFirstDate());

    var __to = $form.to.datepicker({
      format: 'dd/mm/yyyy'
    }).on('changeDate', function (ev) {
      __to.hide();
    }).data('datepicker');

    $form.to.next().on('click', function () {
      $(this).prev().focus();
    });
    $form.to.val(getCurrentDate());

    var $button = {
      submit: $('#sync-data-modal-ok'),
      close: $('#sync-data-modal-cancel')
    };
    this.setTitle = function(title){
      $form.title.text(title || "");
    };
    this.setTop = function(percent){
      $dialog.css("top", percent + '%');
    };
    this.show = function () {
      $dialog.modal('show');
    };
    this.hide = function () {
      $dialog.modal('hide');
    };

    var onSubmit = function(){
      var __data = {
        from: $form.from.val().dateToLong(),
        to: $form.to.val().dateToLong()
      };

      if (__data.from > __data.to){
        console.log("From > To", __data.from, __data.to);
        return;
      }

      self.hide();
      self.fireEvent('ok', __data);
    }.createDelegate(this);
    var onClose = function(){
      self.hide();
    };

    $button.submit.on('click', onSubmit);
    $button.close.on('click', onClose);
  };

  iNet.extend(iNet.ui.superadmin.SyncDataCondition, iNet.Component);
  
  iNet.ui.superadmin.SyncDataWidget = function(config) {
    var __config = config || {};
    iNet.apply(this, __config);
    this.id = 'sync-data-widget';

    iNet.ui.superadmin.SyncDataWidget.superclass.constructor.call(this);
    var me = this;
    var $dialog = null;

    var $toolbar = {
      sync: $('#btn-sync-data'),
      calc: $('#btn-calc-data')
    };

    var url = {
      sync: iNet.getUrl("xgate/tkthhcm/sync"),
      calc: iNet.getUrl("xgate/tkthhcm/report")
    };

    var dataSource = new DataSource({
      columns : [{
        label :'STT',
        type : 'rownumber',
        align: 'center',
        width : 50
      },{
        property : 'enable',
        label : 'Kích hoạt',
        sortable : true,
        type : 'checkbox'
      },{
        property : 'code',
        label : 'Mã đồng bộ',
        sortable : true,
        type : 'label'
      },{
        property : 'esbCode',
        label : 'Mã đơn vị',
        sortable : true,
        type : 'label'
      },{
          property : 'name',
          label : 'Tên đơn vị',
          sortable : true,
          type : 'label'
      },{
	      property : 'firmPrefix',
	      label : 'Prefix',
	      type : 'select',
        sortable : true,
	      editData: prefixData,
	      valueField: 'value',
	      displayField: 'text',
	      value: '',
	      width: 150
      },{
        property : 'active',
        label : 'Trạng thái',
        type : 'label',
        width: 100
      },{
        property : 'sLastUpdate',
        label : 'Thời gian cập nhật',
        sortable : true,
        type : 'text',
        width: 150,
        validate : function(v) {
          if (iNet.isEmpty(v))
            return 'Thời gian cập nhật không được để trống';
        }
      },{
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
        }/*,{
          text : 'Map tình trạng',
          icon : 'icon-sort',
          labelCls: 'label label-success',
          fn : function(record) {
            me.fireEvent('mapstatus', me, record);
          }
        },{
          text : 'Đồng bộ hồ sơ',
          icon : 'icon-arrow-down',
          labelCls: 'label label-success',
          fn : function(record) {
            $.postJSON(iNet.getUrl('xgate/recordhcm/sync'), {
              firmPrefix: record.firmPrefix
            }, function (data) {
              me.showMessage('success', 'Thông báo', 'Hệ thống đang đồng bộ dữ liệu');
            }, {mask: me.grid.getMask(), msg: "Đang đồng bộ dữ liệu hồ sơ..."});
          }
        },{
          text : 'Đồng bộ tình trạng hồ sơ',
          icon : 'icon-download-alt',
          labelCls: 'label label-warning',
          fn : function(record) {
            $.postJSON(iNet.getUrl('xgate/recordprocessinghcm/sync'), {
              firmPrefix: record.firmPrefix
            }, function (data) {
              me.showMessage('success', 'Thông báo', 'Hệ thống đang đồng bộ dữ liệu');
            }, {mask: me.grid.getMask(), msg: "Đang đồng bộ dữ liệu tình trạng hồ sơ..."});
          }
        }*/]
      }]
    });

    this.grid = new iNet.ui.grid.Grid({
      id : 'sync-data-grid-id',
      url : iNet.getUrl('xgate/firmhcm/list'),
      dataSource : dataSource,
      idProperty : 'uuid',
      convertData : function(data) {
        return data.elements;
      }
    });

    this.grid.on('update', function(data, odata) {
      var __data = data || {};
      var __odata = odata || {};
      var __params = {
        sLastUpdate: __data.sLastUpdate,
        firmPrefix: __data.firmPrefix,
        enable: __data.enable,
        uuid: __data.uuid
      };

      console.log(">>__params>>", __params);
      if (iNet.isEmpty(__params.uuid)){
        return;
      }

      $.postJSON(iNet.getUrl('xgate/firmhcm/update'), __params, function (result) {
        var __result = result || {};
        if (!iNet.isEmpty(__result.uuid)) {
          me.grid.update(__result);
          me.grid.commit();
        }
      }, {mask: me.getMask(), msg: iNet.resources.ajaxLoading.saving});
    });

    var showDialog = function (pathUrl, title) {
      if ($dialog == null)
        $dialog = new iNet.ui.superadmin.SyncDataCondition();

      $dialog.setTitle(title || "");
      $dialog.on('ok', function (data) {
        var __data = data || {};
        var __params = {
          startDate: __data.from || 0,
          endDate: __data.to || 0
        };
        if (pathUrl == url.calc){
          __params.firm="all";
        }
        console.log(">>>>", pathUrl, __params, data);
        if (!iNet.isEmpty(__params) && !iNet.isEmpty(pathUrl)) {
          $.postJSON(pathUrl, __params, function (result) {
            var __result = result || {};
            me.grid.load();
          }, {
            mask: me.getMask(),
            msg: iNet.resources.ajaxLoading.saving
          });
        }
      });

      $dialog.show();
    };

    $toolbar.calc.on('click', function(){
      showDialog(url.calc, $toolbar.calc.attr("title"));
    });

    $toolbar.sync.on('click', function(){
      showDialog(url.sync, $toolbar.sync.attr("title"));
    });
  };

  iNet.extend(iNet.ui.superadmin.SyncDataWidget, iNet.ui.onegate.OnegateWidget, {
    getGrid: function(){
      return this.grid;
    }
  });

  //~========================EXECUTE SERVICE========================
  var widgetSearch = new iNet.ui.superadmin.SyncDataWidget();
  widgetSearch.show();
  
  var widgetMap = null;
  
  widgetSearch.on('mapstatus', function(wg, record){
	if(widgetMap == null){
		createWidgetMap();
	}
	widgetMap.load(record);
	widgetMap.show();
	widgetSearch.hide();
  });
  
  var createWidgetMap = function(){
    widgetMap = new iNet.ui.superadmin.SyncDataMapStatusWidget();
    widgetMap.on('back', function(wg){
    	widgetMap.hide();
    	widgetSearch.show();
    });
  };
});
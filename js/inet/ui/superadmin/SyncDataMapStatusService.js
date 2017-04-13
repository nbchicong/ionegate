// #PACKAGE: superadmin-sync-data-map-status
// #MODULE: SyncDataMapStatusService
$(function() {
  iNet.ns('iNet.ui.superadmin');
  iNet.ui.superadmin.SyncDataMapStatusWidget = function(config) {
    var __config = config || {};
    iNet.apply(this, __config);
    this.id = 'sync-data-map-status-widget';

    iNet.ui.superadmin.SyncDataMapStatusWidget.superclass.constructor.call(this);
    var me = this;
    this.$toolbar = {
      BACK: $('#btn-sync-data-status-back'),
      SYNC: $('#btn-sync-data-status-sync')
    };
    
    this.firm = null;
    var dataSource = new DataSource({
      columns : [{
        label :'STT',
        type : 'rownumber',
        align: 'center',
        width : 50
      },{
        property : 'status',
        label : 'Tên trạng thái',
        type : 'label',
        sortable : true,
        width : 250
      },{
	    property : 'statusCode',
	    label : 'Mã trạng thái',
	    type : 'text',
	    sortable : true,
	    width: 100
      },{
	    property : 'industryCode',
	    label : 'Mã lĩnh vực',
	    type : 'text',
	    sortable : true,
	    width: 100
      },{
	    property : 'mapStatus',
	    label : 'Map trạng thái',
	    type : 'select',
	    editData: statusData,
	    valueField: 'value',
	    displayField: 'text',
	    value: '',
	    sortable : true,
	    width: 150
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
        }]
      }]
    });

    this.grid = new iNet.ui.grid.Grid({
      id : 'sync-data-map-status-grid-id',
      url : iNet.getUrl('xgate/recordstatushcm/list'),
      dataSource : dataSource,
      firstLoad: false,
      idProperty : 'uuid',
      convertData : function(data) {
        return data.items;
      }
    });

    this.grid.on('update', function(data, odata) {
      var __data = data || {};
      var __odata = odata || {};
      var grid= me.getGrid();
      $.postJSON(iNet.getUrl('xgate/recordstatushcm/update'), {
    	mapStatus: __data.mapStatus,
    	uuid: __data.uuid
      }, function(result) {
        var __result = result || {};
        if(!iNet.isEmpty(__result.uuid)) {
          grid.update(__result);
          grid.commit();
        }
      },{mask: grid.getMask() , msg: iNet.resources.ajaxLoading.saving});
    });
    
    this.$toolbar.BACK.on('click', function () {
      this.hide();
      this.fireEvent('back', this);
    }.createDelegate(this));


    this.$toolbar.SYNC.on('click', function() {
      $.postJSON(iNet.getUrl('xgate/recordstatushcm/sync'), {
          firmPrefix: this.firm.firmPrefix
      }, function (data) {
    	  me.showMessage('success', 'Thông báo', 'Đồng bộ thành công');
      }, {mask: me.grid.getMask(), msg: "Đang đồng bộ tình trạng hồ sơ..."});
    }.createDelegate(this));
  };

  iNet.extend(iNet.ui.superadmin.SyncDataMapStatusWidget, iNet.ui.onegate.OnegateWidget, {
    getGrid: function(){
      return this.grid;
    },
    
    load: function(firm){
      this.grid.setParams({firmPrefix: firm.firmPrefix});
      this.grid.load();
      this.firm = firm;
    }
  });
});
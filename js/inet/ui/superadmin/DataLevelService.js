// #PACKAGE: superadmin-datalevel
// #MODULE: DataLevelService
$(function() {
  iNet.ns('iNet.ui.superadmin');
  iNet.ui.superadmin.DataLevelWidget = function(config) {
    var __config = config || {};
    iNet.apply(this, __config);
    this.id = 'data-level-widget';
    //this._resource = iNet.resources.onegate.admin.holiday || {};

    iNet.ui.superadmin.DataLevelWidget.superclass.constructor.call(this);
    var me = this;

    var dataSource = new DataSource({
      columns : [{
        label :'STT',
        type : 'rownumber',
        align: 'center',
        width : 50
      },{
        property : 'level',
        label : 'Mã phạm vi',
        sortable : true,
        type : 'label',
        width: 150
      },{
        property : 'name',
        label : 'Tên phạm vi',
        sortable : true,
        type : 'text',
        validate : function(v) {
          if (iNet.isEmpty(v))
            return 'Tên không được để rỗng';
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
        }]
      }]
    });

    this.grid = new iNet.ui.grid.Grid({
      id : 'datalevel-grid-id',
      url : iNet.getUrl('onegate/datalevel/list'),
      dataSource : dataSource,
      idProperty : 'uuid',
      convertData : function(data) {
        return data.items
      }
    });

    this.grid.on('update', function(data, odata) {
      var __data = data || {};
      var __odata = odata || {};
      var grid= me.getGrid();
      $.postJSON(iNet.getUrl('onegate/datalevel/update'), {
        level: __odata.level,
        name: __data.name
      }, function(result) {
        var __result = result || {};
        if(!iNet.isEmpty(__result.uuid)) {
          grid.update(__result);
          grid.commit();
        }
      },{mask: grid.getMask() , msg: iNet.resources.ajaxLoading.saving});
    });
  };

  iNet.extend(iNet.ui.superadmin.DataLevelWidget, iNet.ui.Widget, {
    getGrid: function(){
      return this.grid;
    }
  });

  //~========================EXECUTE SERVICE========================
  var widget=new iNet.ui.superadmin.DataLevelWidget();
  widget.show();
});
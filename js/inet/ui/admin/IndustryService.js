// #PACKAGE: admin-industry
// #MODULE: Industry
$(function() {

  iNet.ui.form.Breadcrumb = function(config) {
    var __config = config || {};
    iNet.apply(this, __config);// apply configuration
    this.id = this.id || 'industry-breadcrumb';
    this.$element = (this.$element && this.$element.length >0 ) ?  this.$element : $(String.format('#{0}', this.id));
    if(this.$element.length<1) {
      throw new Error("Breadcrumb $element must not be null");
    }
    var me= this;
    this.getEl().on('click', 'li:not(.active)',function(){
      var $item = $(this);
      me.active($item);
      me.fireEvent("change" , $item.index(), $item.data('data'), $item);
    })
  };
  iNet.extend(iNet.ui.form.Breadcrumb, iNet.Component, {
    getEl: function(){
      return this.$element;
    },
    active: function(item){
      var $item = $(item);
      var $itemActive = this.getEl().find('li.active');
      $itemActive.removeClass('active');
      this.disabledItem($itemActive, false);

      $item.addClass('active');
      this.disabledItem($item,true);
      this.removeAt($item.index()+1);
      this.fireEvent('activate', $item);
    },
    getItemByIndex: function(index){
      return this.getEl().find(String.format('li:eq({0})', index));
    },
    getIndex: function(){
      var $item = this.getEl().find('li.active');
      return $item.index();
    },
    addItem: function(text, data){
      var __data = data || {};
      var $item = $(String.format('<li>{0}</li>', text));
      $item.data('data', __data);
      this.getEl().append($item);
      this.active($item);
    },
    disabledItem: function($item, disabled) {
      var __text = $item.text().trim();
      if(iNet.isEmpty(__text)){
        return $item;
      }
      if(disabled) {
        if($item.index()==0) {
          return $item.html(String.format('<i class="icon-folder-open-alt"></i> {0}', __text));
        }
        return $item.html(__text);
      } else {
        if($item.index()==0) {
          return $item.html(String.format('<i class="icon-folder-open-alt"></i> <a href="javascript:;">{0}</a>', __text));
        }
        return $item.html(String.format('<a href="javascript:;">{0}</a>', __text));
      }
    },
    back: function(){
      var $latest = this.getEl().find('li:last');
      var $item = this.disabledItem($latest.prev(), true);
      this.active($item);
      this.fireEvent("change" , $item.index(), $item.data('data'), $item);
    },
    count: function(){
      return this.getEl().find('li').length;
    },
    removeAt: function(index){
     for(index;index< this.count();index++){
      this.getItemByIndex(index).remove();
     }
    }
  });

  /**
   * @class iNet.ui.admin.IndustryService
   * @extends iNet.ui.onegate.OnegateWidget
   */

  var url = {
    list: iNet.getUrl('glbgate/industrystruct/list'),
    save: iNet.getUrl('glbgate/industrystruct/create'),
    update: iNet.getUrl('glbgate/industrystruct/update'),
    del: iNet.getUrl('glbgate/industrystruct/delete')
  };

  var $toolbar = {
    CREATE: $('#industry-btn-create'),
    DELETE: $('#industry-btn-delete'),
    BACK: $('#industry-btn-back')
  };

  iNet.ns('iNet.ui.admin.IndustryService');
  iNet.ui.admin.IndustryService = function (config) {
    var _this = this;
    this.id = 'industry-wg';
    var dataSource = new DataSource({
      columns: [{
        label: 'STT',
        type: 'rownumber',
        align: 'center',
        width: 50
      }, {
        property: 'industry',
        label: 'Tên lĩnh vực',
        sortable: true,
        type: 'text',
        validate: function (v) {
          if (iNet.isEmpty(v))
            return "Tên lĩnh vực không được để rỗng";
        }
      }, {
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [{
          text: iNet.resources.message.button.edit,
          icon: 'icon-pencil',
          fn: function (record) {
            grid.edit(record.uuid);
          }
        }, {
          text: iNet.resources.message.button.del,
          icon: 'icon-trash',
          labelCls: 'label label-important',
          fn: function (record) {
            _this.confirmDialog(
                iNet.resources.dialog.delete_title,
                iNet.resources.dialog.delete_content,
                function () {
                  var __data = _this.dialog.getOptions();
                  if (!iNet.isEmpty(__data.uuid)) {
                    _this.dialog.hide();
                    $.postJSON(url.del, {
                      industry: __data.uuid
                    }, function (result) {
                      _this.responseHandler(result, function () {
                        grid.remove(__data.uuid);
                      });
                    }, {
                      mask: this.getMask(),
                      msg: iNet.resources.ajaxLoading.deleting
                    });
                  }
                }
            );
            _this.dialog.setOptions(record);
            _this.dialog.show();
          }
        }]
      }]
    });

    var breadcrumb = new iNet.ui.form.Breadcrumb();

    var grid = new iNet.ui.grid.Grid({
      id: 'industry-grid-id',
      url: url.list,
      dataSource: dataSource,
      idProperty: 'uuid',
      convertData: function (data) {
        return data.items;
      }
    });

    iNet.apply(this, config || {});
    iNet.ui.admin.IndustryService.superclass.constructor.call(this);

    grid.on('save', function (data) {
      var __data = data || {};
      var __number = breadcrumb.getIndex();
      if (__number != 0) {
        if (breadcrumb.getItemByIndex(__number).data('data').industry != "") {
          __data.parent = breadcrumb.getItemByIndex(__number).data('data').industry;
        }
      }

      $.postJSON(url.save, __data, function (result) {
        _this.responseHandler(result, function (data) {
          var __result = data || {};
          grid.insert(__result);
          grid.newRecord();
        });
      }, {
        mask: grid.getMask(),
        msg: iNet.resources.ajaxLoading.saving
      });
    });

    grid.on('update', function (data, odata) {
      var __data = data || {};
      $.postJSON(url.update, __data, function (result) {
        _this.responseHandler(result, function (data) {
          var __result = data || {};
          grid.update(__result);
          grid.commit();
        });
      }, {
        mask: grid.getMask(),
        msg: iNet.resources.ajaxLoading.saving
      });
    });

    grid.on('click', function (record) {
      if (grid.hasEdit()) {
        return;
      }
      var __record = record || {};
      var __params = {industry: __record.uuid};
      grid.setParams(__params);
      grid.reload();
      breadcrumb.addItem(__record.industry, __params);
      FormUtils.showButton($toolbar.BACK, true);
    });

    breadcrumb.on('change', function (index, data, $control) {
      grid.setParams(data || {});
      grid.load();
      FormUtils.showButton($toolbar.BACK, breadcrumb.count() > 1);
    });

    $toolbar.CREATE.click(function () {
      grid.newRecord();
    });

    $toolbar.BACK.click(function () {
      breadcrumb.back();
    });
  };
  iNet.extend(iNet.ui.admin.IndustryService, iNet.ui.onegate.OnegateWidget, {});
  new iNet.ui.admin.IndustryService();
});
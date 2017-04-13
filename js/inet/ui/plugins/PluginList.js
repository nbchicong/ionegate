// #PACKAGE: onegate-plugin
// #MODULE: PluginList
$(function () {
  iNet.ns('iNet.ui.onegate.plugin');
  iNet.ui.onegate.plugin.PluginList = function (config) {
    this.id = 'plugin-list';
    var __config = config || {};
    iNet.apply(this, __config);
    iNet.ui.onegate.plugin.PluginList.superclass.constructor.call(this);
    this.allowCreate = !iNet.isEmpty(this.allowCreate) ? this.allowCreate : false;
    var confirmDeleteDialog = null;

    this.$toolbar = {
      CREATE: $('#plugin-list-btn-create'),
      DELETE: $('#plugin-list-btn-delete'),
      PREV: $('#plugin-list-btn-previous'),
      NEXT: $('#plugin-list-btn-next'),
      CLOSE: $('#plugin-list-btn-close')
    };
    var me = this;
    this._ids = [];
    this.store = new Hashtable();
    this.checkboxManagement = null;
    this.$gridBody = $('#plugin-grid');
    this.$nodata = $('#plugin-list-no-data');
    this.$listDp = $('#plugin-list-dp');
    this.$listContent = $('#plugin-list-dp-content');
    this.$topbar = $('#plugin-list-top-toolbar');
    this.$keyword = $('#plugin-basic-search-txt-keyword');

    this.$keyword.on('keydown', function (e) {
      var code = e.keyCode ? e.keyCode : e.which;
      if (code == 13) {
        me.search();
      }
    });
    var createConfirmDeleteDialog = function () {
      if (!confirmDeleteDialog) {
        confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'plugin-modal-confirm-delete',
          title: iNet.resources.dialog.delete_title,
          content: iNet.resources.dialog.delete_content,
          buttons: [
            {
              text: iNet.resources.message.button.ok,
              cls: 'btn-danger',
              icon: 'icon-ok icon-white',
              fn: function () {
                var __data = this.getData() || {};
                var __ids = __data.ids || [];
                var __taskId = __data.taskId;
                var dialog = this;
                if (!iNet.isEmpty(__ids) && !iNet.isEmpty(__taskId)) {
                  $.postJSON(iNet.getXUrl('onegate/plugindata/delete'),  {task: __taskId,pluginDataID: __ids.join(',')}, function (result) {
                    var __result = result || {};
                    dialog.hide();
                    if (__result.type !== 'ERROR') {
                      me.search();
                      me.showMessage('success', iNet.resources.onegate.ticket.delete_dlg_title, iNet.resources.onegate.ticket.delete_success);
                      me.fireEvent('deleted', me, __result, __ids);
                    } else {
                      me.showMessage('error', iNet.resources.onegate.ticket.delete_dlg_title, iNet.resources.onegate.ticket.delete_error);
                    }
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


    this.$gridBody.on('click', 'div.messageListItem .hit', function () {
      var $item = $($(this).parent().parent());
      var __id = $item.attr('data-id');
      me.open(__id);
    });

    var onCheckChange = function () {
      me._ids = me.checkboxManagement.getSelected();
      FormUtils.showButton(me.$toolbar.DELETE, me._ids.length>0);
    };

    var onReset = function () {
      if (!!me.checkboxManagement) {
        me.checkboxManagement.update();
      }
      me._ids = [];
      FormUtils.showButton(me.$toolbar.DELETE, false);
    };

    var insertToList = function (item) {
      var __item = item || {};
      me.store.put(__item.id, __item);
      $('#plugin-template').tmpl(__item).appendTo(me.$gridBody);
    };

    var refreshTime = function(){
      var $list = $('.timeago');
      for(var i=0;i<$list.length;i++) {
        var $timeago = $($list[i]);
        $timeago.text($.timeago(Number($timeago.attr('data-time'))));
      }
    };

    this.paging = new iNet.ui.common.PagingToolbar({
      id: 'paging',
      limit: 10,
      page: 0,
      type: 'POST',
      url: this.url || iNet.getXUrl('onegate/plugindata/searchlist'),
      mask: this.$gridBody,
      convertData: function (result) {
        var __result = result || {};
        return __result.result || {};
      }
    });
    this.paging.on('load', function (result) {
      var __result = result || {};
      var __items = __result.items || [];
      onReset();
      me.store.clear();
      me.$gridBody.empty();
      if (__items.length > 0) {
        me.$nodata.hide();
      } else {
        me.$nodata.show();
      }
      for (var i = 0; i < __items.length; i++) {
        insertToList(__items[i], false);
      }
      me.checkboxManagement = new iNet.ui.common.CheckboxManagement({
        rowSelector: me.getEl().find('.messageListItem'),
        checkSelector: me.getEl().find('.checkedParent label input[type=checkbox]'),
        checkAllSelector: $('#plugin-list-check-all'),
        columnCheck: me.getEl().find('.checkedParent'),
        onChange: onCheckChange
      });
      //active item when reload
      var __node = me._currentNode || {};
      if(!iNet.isEmpty(__node.id)) {
        me.activeItem(__node.id);
      }
      refreshTime();
    });

    this.$toolbar.DELETE.on('click', function () {
      var dialog= createConfirmDeleteDialog();
      dialog.setData({taskId: this.getTaskId(), ids: this._ids});
      dialog.show();
    }.createDelegate(this));

    this.$toolbar.CREATE.on('click', function () {
      me.fireEvent('create', me);
    }.createDelegate(this));

    this.$toolbar.CLOSE.on('click', function () {
      iNet.getLayout().closePlugin();
    }.createDelegate(this));

    this.$toolbar.PREV.on('click', function () {
      if(!!this.allowPrevPage) {
        this.paging.prev(function(){
          var __store = me.paging.getStore();
          me._prevNode= __store[__store.length-1] || {};
          me.open(me._prevNode.id);
        });
      } else {
        this.open(this._prevNode.id);
      }
    }.createDelegate(this));

    this.$toolbar.NEXT.on('click', function () {
      if(!!this.allowNextPage) {
        this.paging.next(function(){
          me._nextNode= me.paging.getStore()[0] || {};
          me.open(me._nextNode.id);
        });
      } else {
        this.open(this._nextNode.id);
      }

    }.createDelegate(this));
    this.search(); //first load

  };
  iNet.extend(iNet.ui.onegate.plugin.PluginList, iNet.ui.onegate.OnegateWidget, {
    getStore: function () {
      return this.store;
    },
    getTaskId: function () {
      return this.taskId;
    },
    setHeight: function (h) {
      this.getEl().height(h);
      this.$listDp.height(h - 135);
      this.$listContent.height(h - 135);
      this.$listContent.slimscroll({
        height: 'auto'
      });
      $(this.$keyword.parent()).width(this.$topbar.width() - 23);
    },
    search: function () {
      var __params = [
        {
          name: 'task',
          value: this.getTaskId()
        },
        {
          name: this.$keyword.prop('name'),
          value: this.$keyword.val() || ''
        }
      ];
      this.paging.setParams(__params);
      this.paging.reload();
    },
    open: function(id) {
      var __id = id;
      if (iNet.isEmpty(__id)) {
        return;
      }
      var __data = this.getStore().get(__id);
      this.activeItem(__id);
      this.fireEvent('view', this, __data);
      //=========check navigator===============
      var __node = this.paging.getNodeById(__id);
      this._currentNode = __node.node  || {};
      this._prevNode = __node.prev || {};
      this._nextNode = __node.next || {};
      this.allowNextPage= iNet.isEmpty(this._nextNode.id) && __node.page<__node.pages;
      this.allowPrevPage= iNet.isEmpty(this._prevNode.id) && __node.page>1;

      this.$toolbar.PREV.prop('disabled', iNet.isEmpty(this._prevNode.id)  && __node.page==1);
      this.$toolbar.NEXT.prop('disabled', iNet.isEmpty(this._nextNode.id) && __node.page==__node.pages);


    },
    activeItem: function(id) {
      var $item= this.$gridBody.find(String.format('.messageListItem[data-id="{0}"]', id));
      this.$gridBody.find('.messageListItem.selected').removeClass('selected focused');
      $item.addClass('selected focused');
    }
  });
});
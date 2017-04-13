// #PACKAGE: officer-ticket-list
// #MODULE: TicketList
$(function () {
  iNet.ns('iNet.ui.onegate.officer');
  iNet.ui.onegate.officer.TicketList = function (config) {
    this.id = 'ticket-list';
    var __config = config || {};
    iNet.apply(this, __config);
    this.mode = this.mode || 'receiver';
    this.print = this.print || false;
    iNet.ui.onegate.officer.TicketList.superclass.constructor.call(this);
    this.allowCreate = !iNet.isEmpty(this.allowCreate) ? this.allowCreate : false;
    this.$toolbar = {
      CREATE: $('#ticket-list-btn-create'),
      PRINT: $('#ticket-list-btn-print'),
      DELETE: $('#ticket-list-btn-delete')
    };
    FormUtils.showButton(this.$toolbar.CREATE, this.allowCreate);
    FormUtils.showButton(this.$toolbar.PRINT, this.print);
    var me = this;
    this._ids = [];
    this.total = 0;
    this.store = new Hashtable();
    this.checkboxManagement = null;
    this.$gridBody = $('#ticket-grid');
    this.$btnExpand = $('#ticket-basic-search-btn-expand');
    this.$btnSearch = $('[data-action-search="search"]');
    this.$advSearch = $('#ticket-advance-search');
    this.$nodata = $('#message-list-no-data');

    this.$listContent = $('#div-message-list-dp-content');
    this.$keyword = $('#ticket-basic-search-txt-keyword');
    this.$status = $('#ticket-advance-search-select-status');
    this.$startDate = $('#ticket-advance-search-start-date');
    this.$endDate = $('#ticket-advance-search-end-date');

    this.$btnExpand.on('click', function () {
      if (me.$advSearch.is(':hidden')) {
        me.$advSearch.show();
      } else {
        me.$advSearch.hide();
      }
    });

    this.$keyword.on('keydown', function (e) {
      var code = e.keyCode ? e.keyCode : e.which;
      if (code == 13) {
        me.search();
      }
    });

    this.$status.on('change', function () {
      me.search();
    });

    this.fromDate = this.$startDate.datepicker().on('changeDate', function(ev) {
      me.fromDate.hide();
      me.$endDate[0].focus();
    }).data('datepicker');

    this.toDate = this.$endDate.datepicker({
      onRender: function(date) {
        return date.valueOf() < me.fromDate.date.valueOf() ? 'disabled' : '';
      }
    }).on('changeDate', function(ev) {
      me.toDate.hide();
      me.$advSearch.hide();
      me.search();
    }).data('datepicker');

    this.$btnSearch.click(function () {
      me.search();
    });

    var confirmDeleteDialog = null;

    var createConfirmDeleteDialog = function () {
      if (!confirmDeleteDialog) {
        confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'record-modal-confirm-delete',
          title: iNet.resources.dialog.delete_title,
          content: iNet.resources.dialog.delete_content,
          buttons: [
            {
              text: iNet.resources.message.button.ok,
              cls: 'btn-danger',
              icon: 'icon-ok icon-white',
              fn: function () {
                var __data = this.getData() || {};
                var dialog = this;
                if (!iNet.isEmpty(__data.recordID)) {
                  $.postJSON(iNet.getXUrl('onegate/dept/ticketdelete'), {
                    ticket: __data.recordID,
                    procedure: __data.procedureID
                  }, function (result) {
                    var __result = result || {};
                    dialog.hide();
                    if (__result.type !== 'ERROR') {
                      me.search();
                      me.showMessage('success', iNet.resources.onegate.ticket.delete_dlg_title, iNet.resources.onegate.ticket.delete_success);
                      me.fireEvent('deleted', me, __result);
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
      if (iNet.isEmpty(__id)) {
        return;
      }
      me.open(__id);
    });

    var onCheckChange = function () {
      me._ids = me.checkboxManagement.getSelected();
      FormUtils.showButton(me.$toolbar.DELETE, me._ids.length==1);
    };

    var onReset = function () {
      if (!!me.checkboxManagement) {
        me.checkboxManagement.update();
      }
      me._ids = [];
      FormUtils.showButton(me.$toolbar.DELETE,false);

    };
    // Function ==============================================
    var getIcon= function (v) {
      switch (v) {
        case 'CREATED':
          return '<i class="icon-globe" title="Nhận qua mạng"></i>';
        case 'SUBMITED':
          return '<i class="icon-share-alt" title="Đã chuyển phòng chức năng"></i>';
        case 'VERIFIED':
          return '<i class="icon-arrow-down" title="Đã tiếp nhận"></i>';
        case 'PUBLISHED':
          return '<i class="icon-reply" title="Đã trả cho công dân"></i>';
        case 'COMPLETED':
          return '<i class="icon-eye-open" title="Đã hoàn thành"></i>';
        default: return '';
      }
    };
    var insertTicketToList = function (item, prepend) {
      var __item = item || {};
      me.store.put(__item.uuid, __item);
      var __prepend = (prepend) ? prepend : false;
      var __read = Boolean(__item.read) ? 'read' : 'unread';
      var __attached = (__item.attached) ? 'icon-paper-clip' : '';

      var __html = String.format('<div data-id="{0}" class="messageListItem {1}">', __item.uuid, __read);
      __html += '<div class="sidebarParent">&nbsp;</div>';
      __html += '<div class="delimiter"></div>';

      __html += '<div class="wrapper">';
      __html += String.format('<div class="flagParent"><span>{0}</span></div>', getIcon(__item.status));
      __html += '<div class="dateParent actionHandle dragHandle">';
      __html += String.format('<span class="date" data-time="{0}" title="{1}">{1}</span>', __item.received, new Date(__item.received).format('H:i:s d/m/Y'));
      __html += '</div><div class="checkedParent">';
      __html += '<label>';
      __html += String.format('<input type="checkbox" class="ace" value="{0}">', __item.uuid);
      __html += '<span class="lbl"></span>';
      __html += '</label>';
      __html += '</div>';

      __html += '<div class="senderParent hit">';
      __html += '<span class="threadsCountParent fullThreadHandle lastSelected" style="display: none;">';
      __html += '<span class="threadsCount"></span>';
      __html += '<i class="icon-spinner animated" style="display: none;"></i>';
      __html += '</span>';
      __html += '<span class="replyFlag"><i class="icon-reply"></i>&nbsp;</span>';
      __html += '<span class="forwardFlag"><i class="icon-forward"></i>&nbsp;</span>';
      __html += String.format('<span class="sender">{0}</span>&nbsp;', __item.sender);
      __html += '</div>';

      __html += '<div class="attachmentParent actionHandle dragHandle">';
      __html += '<span class="attachment">';
      __html += String.format('<i class="{0}" style="font-size: 16px;"></i>', __attached);
      __html += '</span>';
      __html += '</div>';

      __html += '<div class="subjectParent actionHandle dragHandle hit">';
      __html += String.format('<span class="subject">{0}</span>', __item.subject);
      __html += '</div>';
      __html += '</div>';
      __html += '</div>';
      if (__prepend) {
        me.$gridBody.prepend(__html);
      } else {
        me.$gridBody.append(__html);
      }
    };

    this.paging = new iNet.ui.common.PagingToolbar({
      id: 'paging',
      limit: 10,
      page: 0,
      type: 'POST',
      url: this.url || iNet.getXUrl('onegate/dept/ticketreceiver'),
      mask: this.$gridBody,
      idProperty: 'uuid'
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
        insertTicketToList(__items[i], false);
      }
      me.checkboxManagement = new iNet.ui.common.CheckboxManagement({
        rowSelector: me.getEl().find('.messageListItem'),
        checkSelector: me.getEl().find('.checkedParent label input[type=checkbox]'),
        checkAllSelector: $('#check-all'),
        columnCheck: me.getEl().find('.checkedParent'),
        onChange: onCheckChange
      });
      //active item when reload
      var __node = me._currentNode || {};
      if(!iNet.isEmpty(__node.uuid)) {
        me.activeItem(__node.uuid);
      }
      FormUtils.showButton(me.$toolbar.PRINT, me.print&&!iNet.isEmpty(__result.items));
    });

    this.search(); //first load

    this.$toolbar.DELETE.on('click', function () {
      var __id = this._ids[0];
      var dialog = createConfirmDeleteDialog();
      var __data = me.getStore().get(__id);
      dialog.setData(__data);
      dialog.show();
    }.createDelegate(this));

    this.$toolbar.CREATE.on('click', function () {
      me.fireEvent('create', me);
    }.createDelegate(this));

    this.$toolbar.PRINT.on('click', function () {
      me.printList();
    });

  };

  iNet.extend(iNet.ui.onegate.officer.TicketList, iNet.ui.onegate.OnegateWidget, {
    getStore: function () {
      return this.store;
    },
    setHeight: function (h) {
      this.getEl().height(h);
      var $divMsg = $('#div-message-list-dp,#div-message-list-dp-content');
      $divMsg.height(h - 135);
      this.$listContent.slimscroll({
        height: 'auto'
      });
      $(this.$keyword.parent()).width($('#message-list-top-toolbar').width()- 23);
    },
    search: function () {
      var __params = [{
        name: 'status',
        value:  this.$status.val()
      }, {
        name: 'keyword',
        value:  this.$keyword.val()
      }, {
        name: 'inprocess',
        value:  true
      }, {
        name: 'startDate',
        value: this.$startDate.val()
      }, {
        name: 'endDate',
        value: this.$endDate.val()
      }];

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
      var __node = this.paging.getNodeById(__id);
      this.fireEvent('edit', this, __data, __node);
      this._currentNode = __node.node  || {};
    },
    activeItem: function(id) {
      var $item= this.$gridBody.find(String.format('.messageListItem[data-id="{0}"]', id));
      this.$gridBody.find('.messageListItem.selected').removeClass('selected focused');
      $item.addClass('selected focused');
    },
    getPaging: function(){
      return this.paging;
    },
    printList: function () {
      var url = iNet.getXUrl(String.format('onegate/page/{0}/print/list', this.mode));
      var params = 'startDate=' + this.$startDate.val() + '&endDate=' + this.$endDate.val() +
              '&status=' + this.$status.val() + '&keyword=' + this.$keyword.val() +
              '&inprocess=true';
      var printWindow = window.open(iNet.urlAppend(url, params), '_blank');
      printWindow.onload = function () {
        printWindow.print();
      }
    }
  });
});
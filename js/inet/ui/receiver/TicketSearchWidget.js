// #PACKAGE: receiver-ticket-search
// #MODULE: TicketSearchWidget
$(function () {
  iNet.ns('iNet.ui.onegate.receiver');
  iNet.ui.onegate.receiver.TicketSearchWidget = function (config) {
    this.id = 'record-search-widget';
    var __config = config || {};
    iNet.apply(this, __config);
    this.sentType = this.sentType || 'SELF';
    this.status = this.status || 'VERIFIED';
    this.processingUI = !iNet.isEmpty(this.processingUI) ? this.processingUI : false;

    iNet.ui.onegate.receiver.TicketSearchWidget.superclass.constructor.call(this);
    var me = this;
    this.$toolbar = {
      CREATE: $('#record-search-btn-create'),
      DELETE: $('#record-search-btn-delete'),
      PRINT_RECEIPT: $('#record-search-btn-print-receipt')
    };

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
                      me.getGrid().remove(__data.uuid);
                      me.showMessage('success', iNet.resources.onegate.ticket.delete_dlg_title, iNet.resources.onegate.ticket.delete_success);
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

    var __actionButtons = [];
    if (!this.isProcessingUI()) {
      __actionButtons.push({
        text: iNet.resources.onegate.ticket.publish_title,
        icon: 'icon-reply',
        fn: function (record) {
          var __record = record || {};
          me.fireEvent('return', me, __record);
        }
      });
    }
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

    var __columns = [
      {
        type: 'selection',
        align: 'center',
        width: 30
      },
      {
        property: 'status',
        label: '',
        width: 20,
        renderer: function (v) {
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
          }
        }
      },
      {
        property: 'received',
        width: 165,
        label: iNet.resources.onegate.ticket.received,
        sortable: true,
        type: 'label',
        renderer: function (v) {
          return new Date(v).format('d/m/Y H:i:s');
        }
      },
      {
        property: 'sender',
        width: 200,
        label: iNet.resources.onegate.ticket.sender,
        sortable: true,
        type: 'label'
      },
      {
        property: 'subject',
        label: iNet.resources.onegate.ticket.procedure_name,
        sortable: true,
        type: 'label'
      }
    ];
    if (!this.isProcessingUI()) {
      __columns.push({
        width: 150,
        property: 'status',
        label: iNet.resources.onegate.ticket.status,
        sortable: true,
        type: 'label',
        renderer: function (v, record) {
          var __record = record || {};
          if (!iNet.isEmpty(v)) {
            if ('published' == v.toLowerCase() && __record.completedDate < 1) {
              return 'Đã hoàn thành';
            }
            return  iNet.resources.onegate.receiver.status[v.toLowerCase()] || v;
          }
          return v;
        }
      });
    }
    __columns.push({
      label: '',
      type: 'action',
      separate: '&nbsp;',
      align: 'center',
      buttons: __actionButtons
    });

    var dataSource = new DataSource({
      columns: __columns
    });

    //~~============BASIC SEARCH ====================
    iNet.ui.onegate.receiver.TicketBasicSearch = function () {
      this.id = 'record-basic-search';
      this.url = me.url || iNet.getXUrl('onegate/dept/ticketreceiver');
      iNet.ui.onegate.receiver.TicketBasicSearch.superclass.constructor.call(this);
    };
    iNet.extend(iNet.ui.onegate.receiver.TicketBasicSearch, iNet.ui.grid.AbstractSearchForm, {
      intComponent: function () {
        this.$status = $('#record-basic-search-select-status');
        this.$keyword = $('#record-basic-search-txt-keyword');
        this.$status.on('change', function () {
          this.search();
        }.createDelegate(this));
      },
      getData: function () {
        var __data = {
          inprocess: true,
          status: this.$status.val(),
          keyword: this.$keyword.val() || '',
          pageSize: 20,
          pageNumber: 0
        };
        return __data;
      },
      setUrl: function (url) {
        this.url = url;
      },
      setSentType: function (type) {
        this.sentType = type;
      },
      getSentType: function () {
        return this.sentType || 'SELF';
      }
    });

    this.grid = new iNet.ui.grid.Grid({
      id: 'record-grid-id',
      url: this.url || iNet.getXUrl('onegate/dept/ticketreceiver'),
      dataSource: dataSource,
      idProperty: 'uuid',
      remotePaging: true,
      firstLoad: false,
      basicSearch: iNet.ui.onegate.receiver.TicketBasicSearch,
      convertData: function (data) {
        var __data = data || {};
        me.getGrid().setTotal(__data.total);
        return __data.items;
      }
    });
    this.grid.on('selectionchange', function (sm) {
      var __records = sm.getSelection();
      var __exits = __records.length > 0;
      var __record = {};
      if (__exits) {
        __record = __records[0] || {};
      }
      FormUtils.showButton(me.$toolbar.PRINT_RECEIPT, __exits && (__records.length == 1) && __record.status != "CREATED");
    });

    this.grid.on('click', function (record) {
      me.fireEvent('edit', me, record);
    });

    this.$toolbar.CREATE.on('click', function () {
      this.fireEvent('create', this);
    }.createDelegate(this));

    this.$toolbar.PRINT_RECEIPT.on('click', function () {
      var sm = this.grid.getSelectionModel();
      var __records = sm.getSelection();
      if (__records.length == 1) {
        var __record = __records[0] || {};
        this.printReceipt(__record.uuid);
      }
    }.createDelegate(this));
  };
  iNet.extend(iNet.ui.onegate.receiver.TicketSearchWidget, iNet.ui.onegate.OnegateWidget, {
    getGrid: function () {
      return this.grid;
    },
    setSentType: function (type) {
      this.sentType = type;
    },
    getSentType: function () {
      return this.sentType;
    },
    load: function () {
      var basicSearch = this.getGrid().getQuickSearch();
      if (basicSearch) {
        basicSearch.setSentType(this.getSentType());
        basicSearch.search();
      }
    },
    printReceipt: function (uuid) {
      var url = iNet.getXUrl('onegate/page/receiver/receipt');
      var printWindow = window.open(iNet.urlAppend(url, 'ticket=' + uuid), '_blank');
      printWindow.print();
    },
    setProcessingUI: function (v) {
      this.processingUI = v;
    },
    isProcessingUI: function () {
      return this.processingUI;
    }

  });

});
// #PACKAGE: processor-ticket-search
// #MODULE: ProcessorTicketSearchWidget
$(function () {
  iNet.ns('iNet.ui.onegate.processor');
  iNet.ui.onegate.processor.ProcessorTicketSearchWidget = function (config) {
    this.id = 'record-search-widget';
    var __config = config || {};
    iNet.apply(this, __config);
    this.sentType = this.sentType || 'LX';
    this.status = this.status || 'VERIFIED';

    iNet.ui.onegate.processor.ProcessorTicketSearchWidget.superclass.constructor.call(this);
    var me = this;
    this.$toolbar = {
      CREATE: $('#record-search-btn-create'),
      DELETE: $('#record-search-btn-delete')
    };

    var dataSource = new DataSource({
      columns: [{
          width: 175,
          property: 'taskName',
          label: 'Công việc',
          sortable: true,
          type: 'label'
        },
        {
          property: 'processDate',
          width: 150,
          label: 'Thời gian xử lý',
          sortable: true,
          type: 'label',
          renderer: function (v) {
            return new Date(v).format('d/m/Y');
          }
        },
        {
          property: 'appointment',
          width: 150,
          label: 'Ngày hẹn trả',
          sortable: true,
          type: 'label',
          renderer: function (v) {
            return new Date(v).format('d/m/Y');
          }
        },
        {
          property: 'subject',
          label: iNet.resources.onegate.ticket.procedure_name,
          sortable: true,
          type: 'label'
        }
      ]
    });

    //~~============BASIC SEARCH ====================
    iNet.ui.onegate.processor.TicketBasicSearch = function () {
      this.id = 'record-basic-search';
      this.url = iNet.getXUrl('onegate/dept/ticketprocessor');
      iNet.ui.onegate.processor.TicketBasicSearch.superclass.constructor.call(this);
    };
    iNet.extend(iNet.ui.onegate.processor.TicketBasicSearch, iNet.ui.grid.AbstractSearchForm, {
      intComponent: function () {
        this.$keyword = $('#record-basic-search-txt-keyword');
      },
      getData: function () {
        var __data = {
          status: '',
          keyword: this.$keyword.val() || '',
          pageSize: 10,
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
      url: iNet.getXUrl('onegate/dept/ticketprocessor'),
      dataSource: dataSource,
      idProperty: 'uuid',
      remotePaging: true,
      firstLoad: false,
      basicSearch: iNet.ui.onegate.processor.TicketBasicSearch,
      convertData: function (data) {
        var __data = data || {};
        me.getGrid().setTotal(__data.total);
        return __data.items
      },
      rowClass: function(record) {
        var __appointment = record.appointment;
        if(__appointment<iNet.today.getTime())
        return 'red';
      }
    });

    this.grid.on('click', function (record) {
      me.fireEvent("edit", me, record);
    });

  };
  iNet.extend(iNet.ui.onegate.processor.ProcessorTicketSearchWidget, iNet.ui.onegate.OnegateWidget, {
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
    }
  });

});
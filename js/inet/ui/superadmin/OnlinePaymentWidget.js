// #PACKAGE: onegate-superadmin-online-payment-widget
// #MODULE: OnlinePaymentWidget
/**
 * Copyright (c) 2015 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 07/05/2015.
 * -------------------------------------------
 * @project ionegate-ui
 * @file OnlinePaymentWidget
 * @author nbchicong
 */
$(function () {
  iNet.ns('iNet.ui.onegate.superadmin.OnlinePaymentWidget');
  iNet.ui.onegate.superadmin.OnlinePaymentWidget = function (config) {
    var that = this, __cog = config || {};
    iNet.apply(this, __cog);
    this.id = this.id || 'online-payment-widget';
    this.$grid = $('#online-payment-list');
    var url = {
      list: iNet.getUrl("onegate/paytrans/list")
    };
    this.$toolbar = {
      PRINT: $('#btn-print-list')
    };
    var dataSource = new iNet.ui.grid.DataSource({
      columns: [{
        property: 'orderID',
        label: "Mã giao dịch",
        type: 'label',
        sortable: true,
        align: 'center',
        width: 120
      }, {
        property: 'subject',
        label: "Tên hồ sơ",
        sortable: true,
        type: 'label'
      }, {
        property: 'fullname',
        label: "Người nộp hồ sơ",
        sortable: true,
        type: 'label',
        width: 180
      }, {
        property: 'created',
        label: "Ngày thanh toán",
        sortable: true,
        type: 'label',
        align: 'center',
        width: 120,
        renderer: function(v) {
          return new Date(v).format(iNet.dateFormat);
        }
      }, {
        property: 'status',
        label: 'Trạng thái',
        sortable: true,
        type: 'label',
        align: 'center',
        width: 120,
        renderer: function(v) {
          return that.__convertStatus(v);
        }
      }, {
        property: 'amount',
        label: 'Chi phí',
        sortable: true,
        type: 'label',
        align: 'center',
        width: 100,
        renderer: function(v) {
          return iNet.getCurrency(v);
        }
      }]
    });
    var BasicSearch = function () {
      this.id = 'onl-payment-basicsearch';
      this.url = url.list;
    };
    iNet.extend(BasicSearch, iNet.Component, {
      constructor: BasicSearch,
      intComponent: function () {
        var thatBS = this;
        this.$elBS = $.getCmp(this.id);
        this.$inputSearch = this.$elBS.find('.grid-search-input');
        this.$fromDate = $('#txt-from-date');
        this.$toDate = $('#txt-to-date');
        this.fromDate = this.$fromDate.datepicker().on('changeDate', function(ev) {
          thatBS.fromDate.hide();
          thatBS.$toDate[0].focus();
        }).data('datepicker');
        this.toDate = this.$toDate.datepicker({
          onRender: function(date) {
            return date.valueOf() <= thatBS.fromDate.date.valueOf() ? 'disabled' : '';
          }
        }).on('changeDate', function(ev) {
          thatBS.toDate.hide();
        }).data('datepicker');
      },
      getUrl: function () {
        return this.url;
      },
      getId: function () {
        return this.id;
      },
      getData: function () {
        return {
          keyword: this.$inputSearch.val(),
          startDate: this.$fromDate.val(),
          endDate: this.$toDate.val(),
          pageSize: 20,
          pageNumber: 0
        };
      }
    });
    this.grid = new iNet.ui.grid.Grid({
      id: this.$grid.prop('id'),
      url: url.list,
      basicSearch: BasicSearch,
      remotePaging: true,
      dataSource: dataSource,
      idProperty: 'uuid',
      firstLoad: true,
      convertData: function(data) {
        that.grid.setTotal(data.total || 0);
        var __datas = [];
        for (var i = 0; i < data.items.length; i ++) {
          var __item = data.items[i];
          __item.detail = [{
            content: String.format('Thanh toán dịch vụ {0}', __item.subject),
            paidNo: parseInt(__item.amount)
          }];
          __datas.push(__item);
        }
        return __datas;
      }
    });
    this.grid.on('click', function (record) {
      that.fireEvent('view', record || {});
    });
    this.$toolbar.PRINT.click(function () {
      that.printList();
    });
    iNet.ui.onegate.superadmin.OnlinePaymentWidget.superclass.constructor.call(this);
  };
  iNet.extend(iNet.ui.onegate.superadmin.OnlinePaymentWidget, iNet.ui.onegate.OnegateWidget, {
    __convertStatus: function (status) {
      switch (status) {
        case 'APPROVED': return 'Chấp nhận'; break;
        default: return 'Đang chờ tiếp nhận';
      }
    },
    printList: function () {
      var __startDate = $('#txt-from-date').val(),
          __endDate = $('#txt-to-date').val();
      window.open(iNet.getUrl('/onegate/page/superadmin/print/online-payment') + String.format('?startDate={0}&endDate={1}', __startDate, __endDate),
          '_blank', 'toolbar=no, scrollbars=yes, resizable=yes, top=50, left=50, width=1000, height=600');
    }
  });
});
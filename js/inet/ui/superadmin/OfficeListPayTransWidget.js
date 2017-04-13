// #PACKAGE: superadmin-office-list-paytrans-095020150521
// #MODULE: OfficeListPayTransWidget
// 
/**
 * Copyright (c) 2015 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 21/05/2015.
 * -------------------------------------------
 * @project ionegate
 * @file OfficeListPayTransWidget
 * @author nbchicong
 */
$(function () {
  iNet.ns('iNet.ui.onegate.superadmin.OfficeListPayTransWidget');
  iNet.ui.onegate.superadmin.OfficeListPayTransWidget = function (config) {
    var that = this, __cog = config || {};
    iNet.apply(this, __cog);
    this.id = this.id || 'list-payment-trans';
    this.$grid = $('#list-pay-trans');
    this.$toolbar = {
      BACK: $('#btn-paytrans-back'),
      PRINT: $('#btn-paytrans-print')
    };
    var url = {
      list: iNet.getUrl('onegate/office/transaction')
    };
    var dataSrc = new iNet.ui.grid.DataSource({
      columns: [{
        property: 'serialNo',
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
        property: 'sender',
        label: "Người nộp hồ sơ",
        sortable: true,
        type: 'label',
        width: 180
      }, {
        property: 'received',
        label: "Ngày nhận",
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
        width: 150,
        renderer: function(v) {
          switch (v) {
            case 'VERIFIED': return 'Đã tiếp nhận'; break;
            case 'SUBMITED': return 'Đang xử lý'; break;
            case 'REJECTED': return 'Từ chối'; break;
            case 'PUBLISHED': return 'Đã trả cho công dân'; break;
            case 'COMPLETED': return 'Đã có kết quả'; break;
            case 'PAYMENT': return 'Đang chờ thành toán'; break;
            case 'APPROVED': return 'Chấp nhận'; break;
            default: return 'Đang chờ tiếp nhận';
          }
        }
      }]
    });
    var BasicSearch = function () {
      this.id = 'paytrans-basicsearch';
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
        return $.extend({
          keyword: this.$inputSearch.val(),
          startDate: this.$fromDate.val(),
          endDate: this.$toDate.val(),
          pageSize: 20,
          pageNumber: 0
        }, that.getParams());
      }
    });
    this.grid = new iNet.ui.grid.Grid({
      id: this.$grid.prop('id'),
      url: url.list,
      basicSearch: BasicSearch,
      remotePaging: true,
      dataSource: dataSrc,
      idProperty: 'uuid',
      firstLoad: false,
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
      that.fireEvent('view', that, record || {});
    });
    this.$toolbar.BACK.click(function () {
      that.hide();
      that.fireEvent('back');
    });
    this.$toolbar.PRINT.click(function () {
      that.printList();
    });
    iNet.ui.onegate.superadmin.OfficeListPayTransWidget.superclass.constructor.call(this);
  };
  iNet.extend(iNet.ui.onegate.superadmin.OfficeListPayTransWidget, iNet.ui.onegate.OnegateWidget, {
    setParams: function (params) {
      this.params = params;
    },
    getParams: function () {
      return this.params;
    },
    load: function () {
      this.grid.setParams(this.getParams());
      this.grid.load();
    },
    printList: function () {
      var __startDate = $('#txt-from-date').val(),
          __endDate = $('#txt-to-date').val();
      window.open(iNet.getUrl('/onegate/page/superadmin/print/office-paytrans') + String.format('?startDate={0}&endDate={1}&firm={2}', __startDate, __endDate, this.getParams().firm),
          '_blank', 'toolbar=no, scrollbars=yes, resizable=yes, top=50, left=50, width=1000, height=600');
    }
  });
});
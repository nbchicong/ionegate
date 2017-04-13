// #PACKAGE: onegate-superadmin-online-payment-detail-widget
// #MODULE: OnlinePaymentDetailWidget
/**
 * Copyright (c) 2015 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 07/05/2015.
 * -------------------------------------------
 * @project ionegate-ui
 * @file OnlinePaymentDetailWidget
 * @author nbchicong
 */

$(function () {
  iNet.ns('iNet.ui.onegate.superadmin.OnlinePaymentDetailWidget');
  iNet.ui.onegate.superadmin.OnlinePaymentDetailWidget = function (config) {
    var that = this, __cog = config || {};
    iNet.apply(this, __cog);
    this.id = this.id || 'online-payment-detail-widget';
    this.defCost = 1000;
    this.$toolbar = {
      BACK: $('#tbr-btn-back')
    };
    this.$input = {
      _prod_name: $('#txt-procedure-name'),
      _prod_code: $('#txt-procedure-code'),
      _seri_code: $('#txt-serial-code'),
      _recv_code: $('#txt-received-code'),
      _prod_stus: $('#txt-procedure-status'),
      _recv_time: $('#txt-received-time'),
      _retr_time: $('#txt-return-time'),
      _bill_name: $('#txt-name-bill')
    };
    this.$tableCost = $('#table-list-cost');
    this.$toolbar.BACK.click(function () {
      that.hide();
      that.fireEvent('back');
    });
    iNet.ui.onegate.superadmin.OnlinePaymentDetailWidget.superclass.constructor.call(this);
  };
  iNet.extend(iNet.ui.onegate.superadmin.OnlinePaymentDetailWidget, iNet.ui.onegate.OnegateWidget, {
    __convertStatus: function (status) {
      switch (status) {
        case 'VERIFIED': return 'Đã tiếp nhận'; break;
        case 'SUBMITED': return 'Đang xử lý'; break;
        case 'REJECTED': return 'Từ chối'; break;
        case 'PUBLISHED': return 'Đã trả cho công dân'; break;
        case 'COMPLETED': return 'Đã có kết quả'; break;
        case 'PAYMENT': return 'Đang chờ thành toán'; break;
        case 'APPROVED': return 'Chấp nhận'; break;
        default: return 'Đang chờ tiếp nhận';
      }
    },
    _appendTableData: function (data) {
      var __data = data || [];
      if (__data.length > 0) {
        var __html = '', __totalCost = 0;
        var __itemHtml = '<tr><td class="text-center">{0}</td><td>{1}</td><td class="text-right"><span data-type="costNo">{2}</span></td></tr>';
        for (var i = 0; i < __data.length; i ++) {
          __html += String.format(__itemHtml, i+1, __data[i].content, iNet.getCurrency(__data[i].paidNo));
          __totalCost += __data[i].paidNo;
        }
        __html += String.format(
            '<tr><th colspan="3" class="text-right red"><i>Số tiền thanh toán cho nhà cung cấp dịch vụ: <span data-type="costNo">{0}</span> + (<span data-type="costNo">{1}</span> x 1%) = <span data-type="costNo">{2}</span></i></th></tr>',
            iNet.getCurrency(this.defCost),
            iNet.getCurrency(__totalCost),
            iNet.getCurrency(this.defCost + __totalCost / 100)
        );
        this.$tableCost.find('tbody').html(__html);
      } else {
        this.$tableCost.find('tbody').html(String.format('<tr><td colspan="3"><i>{0}</i></td></tr>', 'Không có dữ liệu để hiển thị'));
      }
    },
    changeShow: function (status) {
      if (status) {
        this.$input._seri_code.parent().show();
        $('[for="' + this.$input._seri_code.prop('id') + '"]').show();
        this.$input._recv_code.parent().hide();
        $('[for="' + this.$input._recv_code.prop('id') + '"]').hide();
      } else {
        this.$input._seri_code.parent().hide();
        $('[for="' + this.$input._seri_code.prop('id') + '"]').hide();
        this.$input._recv_code.parent().show();
        $('[for="' + this.$input._recv_code.prop('id') + '"]').show();
      }
    },
    setData: function (data) {
      var __recordNo = !iNet.isDefined(data.recordNo)||iNet.isEmpty(data.recordNo)?'':data.recordNo;
      var __serialNo = !iNet.isDefined(data.serialNo)||iNet.isEmpty(data.serialNo)?'':data.serialNo;
      this.$input._bill_name.text(data.subject);
      this.$input._prod_name.html(data.subject);
      this.$input._recv_code.html(__recordNo);
      this.$input._seri_code.html(__serialNo);
      this.$input._prod_stus.html(this.__convertStatus(data.status));
      this.$input._recv_time.html(new Date(data.received).format('d/m/Y'));
      if (iNet.isDefined(data.appoinment)) {
        this.$input._retr_time.html(iNet.isEmpty(data.appoinment) ? new Date(data.appoinment).format('d/m/Y') : '');
      } else {
        this.$input._retr_time.parent().hide();
        $('[for="' + this.$input._retr_time.prop('id') + '"]').hide();
      }
      this.changeShow(iNet.isEmpty(__recordNo));
      this._appendTableData(data.detail);
    }
  });
});
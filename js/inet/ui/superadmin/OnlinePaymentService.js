// #PACKAGE: onegate-superadmin-online-payment-service
// #MODULE: OnlinePaymentService
/**
 * Copyright (c) 2015 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 07/05/2015.
 * -------------------------------------------
 * @project ionegate-ui
 * @file OnlinePaymentService
 * @author nbchicong
 */

$(function () {
  var onlPayment = new iNet.ui.onegate.superadmin.OnlinePaymentWidget();
  var onlPaymentDetail = null;
  var history = new iNet.ui.form.History({
    id: 'online-payment-history',
    root: onlPayment
  });
  var onBack = function () {
    history.back();
  };
  var getDetailWg = function (parent) {
    if (!onlPaymentDetail) {
      onlPaymentDetail = new iNet.ui.onegate.superadmin.OnlinePaymentDetailWidget();
      onlPaymentDetail.on('back', onBack);
    }
    if (parent) {
      onlPaymentDetail.setParent(parent);
      parent.hide();
    }
    history.push(onlPaymentDetail);
    onlPaymentDetail.show();
    return onlPaymentDetail;
  };
  history.on('back', function (widget) {
    widget.show();
  });
  onlPayment.on('view', function (record) {
    var __contentWg = getDetailWg(onlPayment);
    __contentWg.setData(record);
  });
});
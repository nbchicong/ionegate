/**
 * #PACKAGE: log-esb-transfer-content
 * #MODULE: LogESBTransferContent
 */
/**
 * Copyright (c) 2016 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 10:07 AM 10/11/2016.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file LogESBTransferContent.js
 */
$(function () {
  /**
   * @class iNet.ui.logs.LogESBTransferContent
   * @extends iNet.ui.onegate.OnegateWidget
   */
  var itemId = null;
  var url = {
    load: iNet.getUrl('onegate/log/transfer/load'),
    trash: iNet.getUrl('onegate/log/transfer/trash'),
    remove: iNet.getUrl('onegate/log/transfer/remove')
  };
  var toolbar = {
    BACK: $('#tb-btn-back'),
    TRASH: $('#tb-btn-trash'),
    REMOVE: $('#tb-btn-remove')
  };
  var form = {
    title: $('#lbl-log-title'),
    service: $('#lbl-log-service'),
    time: $('#lbl-log-time'),
    status: $('#lbl-log-status'),
    json: $('#lbl-log-json'),
    message: $('#lbl-log-message')
  };
  function load() {
    if (!itemId) {
      this.showMessage('error', 'ITEM_ID', 'ITEM_ID_NOT_FOUND');
      this.hide();
      this.fireEvent('back', this);
      return;
    }
    var _this = this;
    $.getJSON(url.load, {uuid: itemId}, function (result) {
      _this.responseHandler(result, function (data) {
        form.title.text(data.title);
        form.service.text(data.serviceName);
        form.time.text(new Date(data.exTime).format('d/m/Y H:i'));
        form.status.text(data.status);
        form.json.text(data.dataJson);
        form.message.text(data.exMessage);
      });
    });
  }
  /**
   * @param {String} uuids
   * @param {Function} callback
   * @private
   */
  function trash(uuids, callback) {
    if (!uuids) return;
    var _this = this;
    this.confirmDialog('','', function () {
          $.postJSON(url.trash, _this.dialog.getOptions(), function (result) {
            if (!iNet.isEmpty(result))
              callback && callback(result);
            _this.dialog.hide().destroy();
          }, {
            msg: iNet.resources.ajaxLoading.deleting,
            mask: _this.getMask()
          });
        });
    this.dialog.setTitle('Bỏ thùng rác!');
    this.dialog.setContent('Bạn có chắc chắn đồng ý bỏ vào thùng rác? <br/> ' +
        '<i class="orange"><b>Lưu ý:</b> Dữ liệu đã bỏ vào thùng rác sẽ tự động xóa sau 5 ngày</i>');
    this.dialog.setOptions({uuids: uuids});
    this.dialog.show();
  }

  /**
   * @param {String} uuids
   * @param {Function} callback
   * @private
   */
  function remove(uuids, callback) {
    if (!uuids) return;
    var _this = this;
    this.confirmDialog('', '', function () {
      $.postJSON(url.remove, _this.dialog.getOptions(), function (result) {
        if (!iNet.isEmpty(result))
          callback && callback(result);
        _this.dialog.hide().destroy();
      }, {
        msg: iNet.resources.ajaxLoading.deleting,
        mask: _this.getMask()
      });
    });
    this.dialog.setTitle('Xóa Log!');
    this.dialog.setContent('Bạn có chắc chắn đồng ý xóa vĩnh viễn?');
    this.dialog.setOptions({uuids: uuids});
    this.dialog.show();
  }
  iNet.ns('iNet.ui.logs.LogESBTransferContent');
  iNet.ui.logs.LogESBTransferContent = function (options) {
    var _this = this;
    iNet.apply(this, options || {});
    this.id = this.id || 'log-esb-transfer-content-wg';
    iNet.ui.logs.LogESBTransferContent.superclass.constructor.call(this);
    toolbar.BACK.on('click', function () {
      _this.hide();
      _this.fireEvent('back', _this);
    });
    toolbar.TRASH.on('click', function () {
      if (itemId)
        trash.call(_this, itemId, function (data) {
          _this.hide();
          _this.fireEvent('removed', data, _this);
        });
    });
    toolbar.REMOVE.on('click', function () {
      if (itemId)
        remove.call(_this, itemId, function (data) {
          _this.hide();
          _this.fireEvent('removed', data, _this);
        });
    });
  };
  iNet.extend(iNet.ui.logs.LogESBTransferContent, iNet.ui.onegate.OnegateWidget, {
    setRecordId: function (recordId) {
      itemId = recordId;
      load.call(this);
    }
  });
});

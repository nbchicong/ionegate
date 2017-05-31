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
    load: iNet.getUrl('xgate/log/system/load'),
    trash: iNet.getUrl('xgate/log/system/trash'),
    remove: iNet.getUrl('xgate/log/system/remove')
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
    warnings: $('#lbl-log-warnings'),
    errors: $('#lbl-log-errors'),
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
    $.getJSON(url.load, {id: itemId}, function (result) {
      _this.responseHandler(result, function (data) {
        var warnings = data.warnings || [];
        var errors = data.errors || [];
        form.title.text(data.title);
        form.service.text(data.service);
        form.time.text(new Date(data.created).format('d/m/Y H:i'));
        form.message.text(data.message);

        if (warnings.length > 0) {
          var warnHtml = '<ul class="no-margin-bottom">';
          warnings.forEach(function (warn) {
            warnHtml += '<li class="text-warning">' + warn + '</li>';
          });
          warnHtml += '</ul>';
          form.warnings.html(warnHtml);
        }

        if (errors.length > 0) {
          var errorHtml = '<ul class="no-margin-bottom">';
          errors.forEach(function (error) {
            errorHtml += '<li class="text-danger">' + error + '</li>';
          });
          errorHtml += '</ul>';
          form.errors.html(errorHtml);
        }
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

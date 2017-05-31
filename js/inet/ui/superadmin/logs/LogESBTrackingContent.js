/**
 * Created by anttt on 14/04/2017.
 */
//#PACKAGE: log-esb-tracking-content
//#MODULE: LogESBTrackingContent
$(function () {
    /**
     * @class iNet.ui.logs.LogESBTrackingContent
     * @extends iNet.ui.onegate.OnegateWidget
     */
    var itemId = null;
    var url = {
        load: iNet.getUrl('xgate/ad/track/esb/one/get'),
        trash: iNet.getUrl('xgate/ad/track/esb/trash'),
        del: iNet.getUrl('xgate/ad/track/esb/del')
    };
    var toolbar = {
        BACK: $('#log-btn-back'),
        TRASH: $('#log-btn-trash'),
        REMOVE: $('#log-btn-remove')
    };
    var form = {
        name: $('#lbl-log-name'),
        orgFrom: $('#lbl-log-orgFrom'),
        orgTo: $('#lbl-log-orgTo'),
        receiptCode: $('#lbl-log-receiptCode'),
        recordCode: $('#lbl-log-recordCode'),
        ticket: $('#lbl-log-ticket'),
        result: $('#lbl-log-result'),
        errors: $('#lbl-log-errors'),
        header: $('#lbl-log-header'),
        data: $('#lbl-log-data')
    };
    function clear() {
      form.name.text('');
      form.orgFrom.text('');
      form.orgTo.text('');
      form.receiptCode.text('');
      form.recordCode.text('');
      form.ticket.text('');
      form.result.text('');
      form.header.text('');
      form.data.text('');
      form.errors.html('');
    }
    function load() {
      clear();
        if (!itemId) {
            this.showMessage('error', 'ITEM_ID', 'ITEM_ID_NOT_FOUND');
            this.hide();
            this.fireEvent('back', this);
            return;
        }
        var _this = this;
        $.getJSON(url.load, {id: itemId}, function (result) {
            _this.responseHandler(result, function (data) {
                var orgFrom = data.orgFrom || {};
                var orgTo = data.orgTo || {};
                var errors = data.errors || [];
                form.name.text(data.name);
                form.orgFrom.text(orgFrom);
                form.orgTo.text(orgTo);
                form.receiptCode.text(data.receiptCode);
                form.recordCode.text(data.recordCode);
                form.ticket.text(data.ticket);
                form.result.text(data.result);
                form.header.text(data.header);
                form.data.text(data.data);
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
        this.dialog.setOptions({ids: uuids});
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
            $.postJSON(url.del, _this.dialog.getOptions(), function (result) {
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
        this.dialog.setOptions({ids: uuids});
        this.dialog.show();
    }
    iNet.ns('iNet.ui.logs.LogESBTrackingContent');
    iNet.ui.logs.LogESBTrackingContent = function (options) {
        var _this = this;
        iNet.apply(this, options || {});
        this.id = this.id || 'log-esb-tracking-content-wg';
        iNet.ui.logs.LogESBTrackingContent.superclass.constructor.call(this);
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
    iNet.extend(iNet.ui.logs.LogESBTrackingContent, iNet.ui.onegate.OnegateWidget, {
        setRecordId: function (recordId) {
            itemId = recordId;
            load.call(this);
        }
    });
});
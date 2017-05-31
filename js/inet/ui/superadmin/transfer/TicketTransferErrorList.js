/**
 * #PACKAGE: inet-ui
 * #MODULE: TicketTransferErrorList
 */
/**
 * Copyright (c) 2017 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 4:10 PM 23/05/2017.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file TicketTransferErrorList.js
 */
$(function () {
  /**
   * @class iNet.ui.superadmin.transfer.TicketTransferErrorList
   * @extends iNet.ui.onegate.OnegateWidget
   */
  var url = {
    list: iNet.getUrl('onegate/transfer/error/list'),
    transfer: iNet.getUrl('onegate/ticket/send/esb')
  };
  iNet.ns('iNet.ui.superadmin.transfer.TicketTransferErrorList');
  iNet.ui.superadmin.transfer.TicketTransferErrorList = function (options) {
    var _this = this;
    iNet.apply(this, options || {});
    this.id = this.id || 'log-esb-tracking-wg';
    this.gridId = this.gridId || 'log-esb-tracking-list';
    var dataSource = new iNet.ui.grid.DataSource({
      columns: [{
        property: 'subject',
        label: 'Tên hồ sơ',
        type: 'label',
        sortable: true
      }, {
        property: 'recordNo',
        label: 'Mã hồ sơ',
        type: 'label',
        sortable: true,
        width: 100
      }, {
        property: 'sender',
        label: 'Nơi gửi',
        sortable: true,
        type: 'label',
        width: 150,
        renderer: function (v) {
          return v.name || '';
        }
      }, {
        property: 'receivers',
        label: 'Nơi nhận',
        sortable: true,
        type: 'label',
        width: 150,
        renderer: function (v) {
          if (v && v.length > 0)
            return v[0].name || '';
          return '';
        }
      }, {
        property: 'errorTimes',
        label: 'Trạng thái',
        sortable: true,
        type: 'label',
        width: 100,
        renderer: function (v) {
          var lblCls = 'label-info';
          if (v > 10)
            lblCls = 'label-danger';
          return '<span class="label ' + lblCls + '">Đã gửi ' + v + ' lần</span>';
        }
      }, {
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [{
          text: 'Gửi lại',
          icon: 'fa fa-share',
          labelCls: 'label label-success',
          fn: function (record) {
            _this.send(record.uuid);
          }
        }]
      }]
    });
    this.grid = new iNet.ui.grid.Grid({
      id: this.gridId,
      url: url.list,
      remotePaging: true,
      dataSource: dataSource,
      idProperty: 'uuid',
      firstLoad: true,
      convertData: function(data) {
        _this.getGrid().setTotal(data.total || 0);
        return data.items || [];
      }
    });
  };
  iNet.extend(iNet.ui.superadmin.transfer.TicketTransferErrorList, iNet.ui.onegate.OnegateWidget, {
    /**
     * @returns {iNet.ui.grid.Grid}
     */
    getGrid: function () {
      return this.grid;
    },
    send: function (ticketId) {
      $.postJSON(url.transfer, {ticket: ticketId}, function (result) {
        if (result.type === 'ERROR') {
          var errors = result.errors;
          if (errors[0].message === 'TICKET_ID_REQUIRED')
            this.showMessage('error', 'Gửi hồ sơ', 'Id hồ sơ rỗng');

          if (errors[0].message === 'EXCHANGE_PACKAGE_NOT_FOUND')
            this.showMessage('error', 'Gửi hồ sơ', 'Không tìm thấy gói tin gửi đi');

          if (errors[0].message === 'TICKET_DATA_NOT_FOUND')
            this.showMessage('error', 'Gửi hồ sơ', 'Không tìm thấy hồ sơ');
        }
        if (result.success)
          this.showMessage('success', 'Gửi hồ sơ', 'Đã gửi lại hồ sơ thành công');
        else
          this.showMessage('error', 'Gửi hồ sơ', 'Quá trình gửi hồ sơ xảy ra lỗi');
      });
    }
  });
});

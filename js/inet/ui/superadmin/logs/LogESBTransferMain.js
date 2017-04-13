/**
 * #PACKAGE: log-esb-transfer-main
 * #MODULE: LogESBTransferMain
 */
/**
 * Copyright (c) 2016 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 11:00 AM 10/11/2016.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file LogESBTransferMain.js
 */
$(function () {
  /**
   * @type {iNet.ui.logs.LogESBTransferList}
   */
  var list = new iNet.ui.logs.LogESBTransferList();
  /**
   * @type {iNet.ui.logs.LogESBTransferContent}
   */
  var content = null;
  /**
   * @type {iNet.ui.form.History}
   */
  var localHistory = new iNet.ui.form.History({id: 'log-transfer-history'});
  /**
   * @param {iNet.ui.logs.LogESBTransferList} parent
   * @returns {iNet.ui.logs.LogESBTransferContent}
   */
  var loadContent = function (parent) {
    if (!content) {
      content = new iNet.ui.logs.LogESBTransferContent();
      content.on('back', function () {
        localHistory.back();
      });
      content.on('removed', function (uuid) {
        if (uuid)
          parent.getGrid().remove(uuid);
        localHistory.back();
      });
    }
    if (parent) {
      content.setParent(parent);
      parent.hide();
    }
    localHistory.push(content);
    content.show();
    return content;
  };
  localHistory.setRoot(list);
  localHistory.on('back', function(widget){
    widget.show();
  });
  list.on('open', function (record, parent) {
    content = loadContent(parent);
    content.setRecordId(record.uuid);
  });
});

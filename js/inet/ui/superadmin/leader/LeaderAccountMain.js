/**
 * #PACKAGE: leader-account-main
 * #MODULE: LeaderAccountMain
 */
/**
 * Copyright (c) 2017 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 5:47 PM 22/09/2017.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file LeaderAccountMain.js
 */
$(function () {
  /**
   * @type {iNet.ui.leader.LeaderAccountList}
   */
  var list = new iNet.ui.leader.LeaderAccountList();

  /**
   * @type {iNet.ui.leader.LeaderAccountContent}
   */
  var content = null;
  /**
   * @type {iNet.ui.form.History}
   */
  var localHistory = new iNet.ui.form.History({id: 'leader-account-history'});
  /**
   * @param {iNet.ui.leader.LeaderAccountList} parent
   * @returns {iNet.ui.leader.LeaderAccountContent}
   */
  var loadContent = function (parent) {
    if (!content) {
      content = new iNet.ui.leader.LeaderAccountContent();
      content.on('back', function () {
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
  localHistory.on('back', function (widget) {
    widget.show();
  });
  list.on('open', function (record, parent) {
    content = loadContent(parent);
    content.load(record);
  });
  list.on('create', function (parent) {
    content = loadContent(parent);
  });
});

/**
 * #PACKAGE: template-notify-main
 * #MODULE: TemplateNotifyMain
 */
/**
 * Copyright (c) 2016 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 6:16 PM 20/09/2016.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file TemplateNotifyMain.js
 */
$(function () {
  /**
   * @type {iNet.ui.template.TemplateNotifyList}
   */
  var list = new iNet.ui.template.TemplateNotifyList();
  /**
   * @type {iNet.ui.template.TemplateNotifyContent}
   */
  var content = null;
  /**
   * @type {iNet.ui.form.History}
   */
  var localHistory = new iNet.ui.form.History({id: 'template-notify-history'});
  /**
   * @param {iNet.ui.template.TemplateNotifyList} parent
   * @returns {iNet.ui.template.TemplateNotifyContent}
   */
  var loadContent = function (parent) {
    if (!content) {
      content = new iNet.ui.template.TemplateNotifyContent();
      content.on('back', function (uuid) {
        if (uuid)
          parent.getGrid().remove(uuid);
        localHistory.back();
      });
      content.on('created', function (record) {
        if (record) {
          parent.getGrid().insert(record);
          parent.getGrid().commit();
        }
      });
      content.on('updated', function (record) {
        if (record) {
          parent.getGrid().update(record);
          parent.getGrid().commit();
        }
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
  list.on('new', function (parent) {
    content = loadContent(parent);
    content.clear();
  });
  list.on('open', function (record, parent) {
    content = loadContent(parent);
    content.clear();
    content.setForm(record);
  });
});

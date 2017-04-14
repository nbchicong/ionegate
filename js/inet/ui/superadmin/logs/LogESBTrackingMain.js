/**
 * Created by anttt on 14/04/2017.
 */
//#PACKAGE: log-esb-tracking-main
//#MODULE: LogESBTracking
$(function () {
    /**
     * @type {iNet.ui.logs.LogESBTracking}
     */
    var list = new iNet.ui.logs.LogESBTracking();
    /**
     * @type {iNet.ui.logs.LogESBTrackingContent}
     */
    var content = null;
    /**
     * @type {iNet.ui.form.History}
     */
    var localHistory = new iNet.ui.form.History({id: 'log-tracking-history'});
    /**
     * @param {iNet.ui.logs.LogESBTracking} parent
     * @returns {iNet.ui.logs.LogESBTrackingContent}
     */
    var loadContent = function (parent) {
        if (!content) {
            content = new iNet.ui.logs.LogESBTrackingContent();
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
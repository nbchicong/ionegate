// #PACKAGE: onegate-plugin
// #MODULE: ViewMainService
$(function() {
  var $window = $(window);
  var __taskId = iNet.getParam('task');
  var pluginList = new iNet.ui.onegate.plugin.PluginList({
    taskId: __taskId
  });
  var pluginView = new iNet.ui.onegate.plugin.PluginView({
    taskId: __taskId
  });

  pluginList.on('create', function(){
    if(pluginView){
      pluginView.newRecord();
    }
  });
  pluginList.on('view', function(wg, record){
    var __record = record || {};
    if(pluginView){
      pluginView.load(__record.id);
    }
  });

  pluginList.on('deleted', function(wg, result, ids){
    var __ids = ids || [];
    if(pluginView){
      if(__ids.indexOf(pluginView.getPluginId())>-1) {
        pluginView.clear();
      }
    }
  });

  pluginView.on('saved', function(wg, data){
    if(pluginList){
      var __data = data || {};
      var __plugin = __data.plugin || {};
      if(!iNet.isEmpty(__plugin.id)){
        pluginList.search();
      }
    }
  });


  pluginView.on('beforeresize', function(){
    if(pluginView){
      if(!pluginView.isFullScreen()){
        pluginList.hide();
      } else {
        pluginList.show();
      }
    }
  });


  var onResize = function(){
    var winHeight = $window.height();
    pluginList.setHeight(winHeight-45);
    pluginView.setHeight(winHeight-45);
    var $divView = $('.dp-container,.dp-content');
    $divView.height(winHeight-85);
    $('.dp-content').slimscroll({
      height: 'auto'
    });

  };
  $window.resize(onResize);


  setInterval(function () {
    var $list = $('.timeago');
    for(var i=0;i<$list.length;i++) {
      var $timeago = $($list[i]);
      $timeago.text($.timeago(Number($timeago.attr('data-time'))));
    }
  }, 60000);

  onResize();
}); 
// #PACKAGE: onegate-processor-main
// #MODULE: ProcessorMainService
$(function() {
  iNet.ns("iNet.ui.onegate");

  iNet.ui.onegate.Menu = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);
    this.$sideBar = $('#sidebar');
    var me= this;
    this.$sideBar.on('click', 'ul.nav-list li', function() {
      var $el = $(this);
      var $subMenu = $el.find('.submenu');
      var cls = 'open';
      if($el.hasClass(cls)) {
        $el.removeClass(cls);
        $subMenu.hide();
        return;
      }
      me.$sideBar.find('.open').removeClass('open').find('.submenu').hide();
      if(me.$sideBar.find('.submenu').length>0){
        $el.addClass(cls);
      }
      $subMenu.show();
    });

    this.$sideBar.on('click', 'a[data-url]', function(){
      var $link = $(this);
      var __menuId = $link.parent().attr('id');
      var __url = me.selectMenuId('#'+__menuId);
      me.fireEvent("change", __url || '');
    });

  };

  iNet.extend(iNet.ui.onegate.Menu, iNet.Component, {
    getEl: function(){
      return this.$sideBar;
    },
    selectMenuId: function (id, notLoad) {
      if (!!id) {
        if(!notLoad) {
          window.location.hash = id;
        }
        var $item = $(id);
        var $parent = $item.parent();
        this.$sideBar.find('ul.active,li.active').removeClass('active');
        if ($parent.hasClass('submenu')) {
          $parent.parent().addClass('active');
          if ($parent.parent().find('.submenu').length > 0) {
            $parent.parent().addClass('open');
          }
        }
        $item.addClass('active');
        var $link = $item.find('a[data-url]:first');
        var __url = $link.attr('data-url');
        return __url;
      }
    },
    firstId: function(){
      return this.$sideBar.find('a[data-url]:first').parent().prop('id');
    },
    hide: function(){
      this.getEl().attr('style', 'display: none !important;');
    },
    show: function(){
      this.getEl().removeAttr('style');
    }
  });

  if (!iNet.isSupport) {
    window.location.href = iNet.getUrl('page/not-support');
  }

  window.$onegateFrame = $('#onegate-iframe-content');
  window.$pluginFrame = $('#onegate-iframe-plugin');

  var $frameLoading = $('#loading-msg');
  var $nav = $('#nav-list');
  var $window = $(window);
  var loading_msg = $frameLoading.html();
  var menu = new iNet.ui.onegate.Menu();

  window.onerror=function(errorMsg, url, lineNumber, column, errorObj){
    $frameLoading.html(String.format('<div style="color:red"><b>{0} :</b><br /> {1}</div>',iNet.resources.onegate.load_error, errorMsg));
  };

  var onResize = function(){
    $onegateFrame.height($window.height()-$nav.height()-11);
    $pluginFrame.height($window.height()-11);
  };
  var displayLoading= function(){
    $frameLoading.html(loading_msg);
    $frameLoading.show();
    $onegateFrame.hide();
  };

  window.$pluginFrame.load(function () {
    $onegateFrame.hide();
    $frameLoading.hide();
    $pluginFrame.show();
    onResize();
  });

  window.$onegateFrame.load(function () {
    var __path = $onegateFrame.get(0).contentWindow.location.pathname || '';
    var __loginUrl = 'cas/login';
    var __isLogin = (__loginUrl.match(__path) || []).length > 0;
    if (__isLogin) {
      return;
    }
    $frameLoading.hide();
    $onegateFrame.show();
    $pluginFrame.hide();
    menu.show();
    onResize();
  });

  window.activePlugin = function(url) {
    $onegateFrame.hide();
    $pluginFrame.hide();
    menu.hide();
    $frameLoading.show();
    window.$pluginFrame.attr("src", url);
  };

  window.closePlugin = function(){
    $pluginFrame.hide();
    $onegateFrame.show();
    menu.show();
    onResize();
  };

  $window.resize(onResize);

  menu.on('change', function(url) {
    if(iNet.isEmpty(url)){
      return;
    }
    $onegateFrame.get(0).contentWindow.location.replace(url);
    displayLoading();
  });
  $window.hashchange( function(){
    var __menuId = location.hash || ('#'+ menu.firstId());
    var __url = menu.selectMenuId(__menuId);
    if(iNet.isEmpty(__url)){
      return ;
    }
    $onegateFrame.get(0).contentWindow.location.replace(__url);
    displayLoading();
  });
});
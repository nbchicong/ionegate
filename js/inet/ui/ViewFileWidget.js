// #PACKAGE: view-file-widget
// #MODULE: ViewFileWidget
$(function() {
  iNet.ns("iNet.ui.onegate");
  iNet.ui.onegate.ViewFileWidget= function(config) {
    var __config = config || {};
    iNet.apply(this, __config);
    this.id = this.id || 'viewer-file-widget';
    this.$element = $('#' + this.id);
    this.$iframe = this.$element.find('#viewer-iframe-file-content');
    this.$selectFile = $('#viewer-file-select-file');
    var me= this;
    var $win = $(window);
    this.$toolbar = {
      BACK : $('#viewer-file-btn-back'),
      DOWNLOAD : $('#viewer-file-btn-download')
    };
    
    FormUtils.showButton(this.$toolbar.BACK, (!iNet.isEmpty(this.hideBack)) ? !this.hideBack : true);

    this.$toolbar.BACK.click( function() {
      this.hide();
      this.fireEvent('back', this);
    }.createDelegate(this));
    
    this.$toolbar.DOWNLOAD.click( function() {
      var __data= this.getData();
      if(!iNet.isEmpty(__data.uuid)) {
        window.location.href = iNet.urlAppend(iNet.getXUrl('onegate/dept/download'), String.format('folder={0}&uuid={1}&file={2}', __data.folder, __data.uuid, __data.file));
      }
    }.createDelegate(this));

    this.$selectFile.on('change', function () {
      var __file = $(this).find('option:selected').data('file');
      var __data = me.getData();
      __data.file = __file.file;
      __data.docId = __file.uuid;
      __data.mimetype = __file.mimetype;
      me.setParams(iNet.Base64.encodeObject(__data));
      me.load();
    });
    var onResize = function() {
      this.$iframe.height($win.height() - 50);
    }.createDelegate(this);

    $win.resize(onResize);

    this.$iframe.load(onResize);

    iNet.ui.onegate.ViewFileWidget.superclass.constructor.call(this);
  };
  iNet.extend(iNet.ui.onegate.ViewFileWidget, iNet.ui.Widget, {
    setFiles : function(files) {
      this.files = files || [];
      this.$selectFile.empty();
      var __data = this.getData();
      for (var i = 0; i < this.files.length; i++) {
        var __file = this.files[i] || {};
        var $option = $(String.format('<option value="{0}" {2}>{1}</option>', __file.uuid, __file.fieldname || __file.file, (__data.uuid=__file.uuid) ? 'selected' : ''));
        $option.data('file', __file);
        this.$selectFile.append($option);
      }

      var $container = $('#viewer-file-container-files');
      if(this.files.length >0) {
        $container.show();
      } else {
        $container.hide();
      }
    },
    getFiles : function() {
      return this.files || [];
    },
    load : function() {
      var __url = iNet.urlAppend(iNet.getXUrl('onegate/page/view-file'), String.format('data={0}', this.getParams()));
      this.$iframe.attr('src', __url);
    },
    setParams: function(v) {
      this.params = v;
    },
    getParams: function(){
      return this.params || {};
    },
    getData: function(){
      return iNet.Base64.decodeObject(this.getParams());
    }
  });
}); 
// #PACKAGE: xform
// #MODULE: FileUpload
/**
 * Created by ntvy on 6/3/14.
 */
$(function () {
  iNet.ns("iNet.ui.form.FileUpload");
  iNet.ui.form.FileUpload = function (config) {
    config = config || {};
    iNet.apply(this, config);//apply configuration
    this.$element = (this.$element && this.$element.length >0 ) ?  this.$element : $(String.format('#{0}', this.id));
    if(this.$element.length<1) {
      throw new Error("FileUpload $element must not be null");
    }
    this._resource = iNet.resources.onegate.xform || {};
    this._initComponent();
    var me = this;

    this.$fileLabel =  this.getEl().find('.file-label');
    this.$fileInput =  this.getEl().find('input[type="file"]');
    this.$fileRemoveLink = this.getEl().find('a.file-remove');

    var readURL = function (input) {
      var files = input.files || [];
      me.setFiles(files);
    };

    this.$fileLabel.click(function () {
      this.$fileInput.trigger('click');
    }.createDelegate(this));

    this.$fileInput.change(function () {
      readURL(this);
    });

    this.$fileRemoveLink.click(function () {
      this.clearFile();
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.form.FileUpload, iNet.Component, {
    _initComponent: function () {
      var $oldEl = this.getEl();
      var __html = '<div class="ace-file-input" style="height: auto;">';
      __html += $oldEl.get(0).outerHTML;
      __html += String.format('<label class="file-label" data-title="{0}">', this._resource.select_file);
      __html += String.format('<span class="file-name" data-title="{0}"><i class="icon-upload-alt"></i></span>',  this._resource.select_file_empty);
      __html += '</label><a class="file-remove remove" style="right: -5px !important;" href="javascript:;">';
      __html += '<i class="icon-remove"></i></a></div>';
      var $el  = $(__html);
      $oldEl.replaceWith($el);
      this.setEl($el);
    },
    setEl: function($el){
      this.$element= $el;
    },
    getEl: function () {
      return this.$element;
    },
    getMask: function () {
      return this.getEl();
    },

    setData: function (data) {
      this.data = data;
    },
    getData: function () {
      return this.data;
    },
    destroy: function () {
      this.getEl().remove();
      delete this;
    },
    clearFile: function () {
      this.$fileLabel.removeClass('selected').data('title', this._resource.select_file);
      this.$fileLabel.find('span.file-name').attr('data-title', this._resource.select_file_empty);
      this.$fileInput.val('');
    },
    setFiles: function (files) {
      var __files = files || [];
      if (__files.length < 1) {
        return;
      }
      var __fileNames = [];
      for (var i = 0; i < __files.length; i++) {
        var __file = __files[i] || {};
        __fileNames.push(__file.name);
      }
      this.$fileLabel.addClass('selected').attr('data-title', this._resource.change_file);
      if (__files.length == 1) {
        this.$fileLabel.find('span.file-name').attr('data-title', __fileNames[0]);
      } else {
        this.$fileLabel.find('span.file-name').attr('data-title', String.format(this._resource.mutil_file_text + ' ', __fileNames.length, __fileNames.join(', ')));
      }
    }
  });
});
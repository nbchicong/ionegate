// #PACKAGE: xform
// #MODULE: DatePicker

$(function () {
  iNet.ns("iNet.ui.form.DatePicker");
  iNet.ui.form.DatePicker = function (config) {
    config = config || {};
    iNet.apply(this, config);//apply configuration
    this.$element = (this.$element && this.$element.length >0 ) ?  this.$element : $(String.format('#{0}', this.id));
    this.format  = this.format || 'dd/mm/yyyy';
    if(this.$element.length<1) {
      throw new Error("DatePicker $element must not be null");
    }
    this._initComponent();
    try {
      var $input =  this.getEl().find('input');
      $input.mask('99/99/9999');
      var component = $input.datepicker({
        format: this.format
      }).on('changeDate', function (ev) {
        $input.focus();
        component.hide();
      }).data('datepicker');

      $input.next().on('click', function () {
        $(this).prev().focus();
      });
    } catch (err) {
      throw new Error(err.message);
    }
  };
  iNet.extend(iNet.ui.form.DatePicker, iNet.Component, {
    _initComponent: function () {
      var $oldEl = this.getEl();
      $oldEl.addClass('date-picker');
      var __html = '<div class="ace-icon input-icon input-icon-right date">';
      __html += $oldEl.get(0).outerHTML;
      __html += '<i class="ace-icon icon-calendar"></i></div>';
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
    setValue: function (data) {
      this.data = data;
    },
    getValue: function () {
      return this.data;
    },
    destroy: function () {
      this.getEl().remove();
      delete this;
    }
  });
});
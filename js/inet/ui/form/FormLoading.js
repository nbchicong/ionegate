// #PACKAGE: form-loading
// #MODULE: FormLoading
iNet.ui.form.FormLoading = function(config) {
  config = config || {};
  iNet.apply(this, config);//apply configuration
  this.msg = this.msg || iNet.resources.ajaxLoading.saving;
  this.id = this.id || iNet.generateId();
  var $mask = $(this.maskBody) || $('body');
  var $doc = $(document);
  var me= this;
  this.start = function(mark){
    if(!$.isEmptyObject(mark)) {
      $mask = mark.mark;
      me.msg = mark.msg;
    }
    var __el = '<div id="{0}" class="widget-box-layer"><span><i class="ace-icon icon-spinner icon-spin icon-2x white"></i> {1}</span></div>';
    $mask.append(String.format(__el,me.id, me.msg));
  };
  
  this.stop = function(){
    var timeout = null;
    timeout = setTimeout(function() {
      $('#'+ me.id).remove();
      clearTimeout(timeout);
    }, 500); 
  };
  return this;
};

iNet.extend(iNet.ui.form.FormLoading, iNet.Component,{
  getId: function(){
    return this.id;
  },
  setMessage:function(v){
    this.msg = v;
  }
});

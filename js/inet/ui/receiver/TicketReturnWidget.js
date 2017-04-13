// #PACKAGE: receiver-ticket-return
// #MODULE: TicketReturnWidget
$(function () {
  iNet.ns('iNet.ui.onegate.receiver');
  //==========================
  iNet.ui.onegate.receiver.TicketReturnWidget = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);// apply configuration
    this.id = this.id || 'ticket-return-citizen-widget';
    this.$file = $('#ticket-return-files');
    this.$fileLabel = $('#ticket-return-files-label');
    this.$fileRemove = $('#ticket-return-files-remove');
    this.$note = $('#ticket-return-txt-note');
    this.$form = $('#ticket-return-form');
    this.$resultHeader = $('#ticket-return-result-header');
    this.$resultContent = $('#ticket-return-result-content');
    this.$resultNote = $('#ticket-return-result-note');

    this.allowSave = !iNet.isEmpty(this.allowSave) ? this.allowSave: true;
    this.url = this.url ||  iNet.getXUrl('onegate/dept/ticketcitizen');

    iNet.ui.onegate.receiver.TicketReturnWidget.superclass.constructor.call(this) ;
    var me = this;
    var readURL = function (input) {
      var files = input.files || [];
      me.setFiles(files);
    };

    this.$fileLabel.click(function () {
      this.$file.trigger('click');
    }.createDelegate(this));

    this.$file.change(function () {
      readURL(this);
    });

    this.$fileRemove.click(function () {
      this.clearFile();
    }.createDelegate(this));

    this.$toolbar = {
      BACK: $('#ticket-return-citizen-btn-back'),
      SAVE: $('#ticket-return-citizen-btn-save'),
      RETURN: $('#ticket-return-citizen-btn-return')
    };

    this.$toolbar.BACK.on('click', function () {
      this.hide();
      this.fireEvent('back', this);
    }.createDelegate(this));

    this.$toolbar.SAVE.on('click', function () {
      var loading;
      var me= this;
      this.$form.ajaxSubmit({
        url: iNet.getXUrl('onegate/dept/ticketuplresult'),
        data: this.getData(),
        beforeSubmit: function (arr, $form, options) {
          loading = new iNet.ui.form.LoadingItem({
            maskBody: me.$form,
            msg: iNet.resources.ajaxLoading.saving
          });
        },
        success: function (result) {
          if(loading){
            loading.destroy();
          }

          me.load(function(result){
            me.fireEvent('saved', result);
          });
        }
      });
    }.createDelegate(this));

    this.$toolbar.RETURN.on('click', function () {
      var __record= this.getRecord();
      var me= this;
      if (!iNet.isEmpty(__record.uuid)) {
        $.postJSON(me.url,{
          ticket: __record.recordID,
          procedure: __record.procedureID
        }, function (result) {
          var __result = result || {};
          if(!iNet.isEmpty(__result.uuid)) {
            me.hide();
            me.fireEvent('back', me);
            me.fireEvent("returned", me, __result);
          } else {
            me.fireEvent('paid', me, __record);
            me.showMessage('warning', 'Hồ sơ', 'Bạn phải thực hiện thanh toán hồ sơ trước khi trả cho công dân.');
          }
        }, {mask: this.getMask(), msg: iNet.resources.ajaxLoading.acting});

      }
    }.createDelegate(this));

    if(this.allowSave) {
      this.$resultNote.show();
    } else {
      this.$resultNote.hide();
    }
    FormUtils.showButton(me.$toolbar.SAVE, this.allowSave);


  };
  iNet.extend(iNet.ui.onegate.receiver.TicketReturnWidget, iNet.ui.onegate.OnegateWidget, {
    setRecord: function(record) {
      this.ownerData = record;
      this.load();
    },
    getRecord: function(){
      return this.ownerData || {};
    },
    clearData: function(){
      this.$note.val('').focus();
      this.clearFile();
    },
    setData: function(data) {
      var __data= data || {};
      this.$note.val(__data.notes);
      this.clearFile();
    },
    getData: function(){
      var __record= this.getRecord();
      return {
        ticket: __record.recordID,
        procedure: __record.procedureID,
        notes: this.$note.val()
      };
    },

    clearFile: function () {
      this.$fileLabel.removeClass('selected').data('title', 'Chọn tệp');
      this.$fileLabel.find('span.file-name').attr('data-title', 'Chưa chọn tệp ...');
      this.$file.val('');
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
      this.$fileLabel.addClass('selected').attr('data-title', 'Thay đổi');
      if (__files.length == 1) {
        this.$fileLabel.find('span.file-name').attr('data-title', __fileNames[0]);
      } else {
        this.$fileLabel.find('span.file-name').attr('data-title', String.format('{0} tệp tin: {1} ', __fileNames.length, __fileNames.join(', ')));
      }
    },
    fillFiles: function(files){
      var __files = files || [];
      var __html= '';
      for (var i = 0; i < __files.length; i++) {
        var __file = __files[i] || {};
        var __url = iNet.urlAppend(iNet.getUrl('xgate/userticket/download'), String.format('ticket={0}&contentID={1}', __file.folder, __file.gridfsUUID));
        __html+=String.format('<li><a data-file-action="download" href="{2}"><i class="{0}"></i>{1}</a></li>',iNet.FileFormat.getFileIcon(__file.file), __file.file, __url);
      }
      return __html;
    },
    load: function(fn){
      this.clearData();
      var __fn = fn || iNet.emptyFn;
      var __record = this.getRecord();
      var me= this;
      $.getJSON(iNet.getUrl('xgate/userticket/result'),{ticket: __record.uuid}, function(result){
         var __result = result || {};
        me.fillResult(__result.items);
        __fn(__result);
      });
    },
    fillResult: function(items) {
      var __items = items || [];
      this.$resultContent.empty();
      var __html= '';
      for(var i=0;i<__items.length;i++){
        var __item= __items[i] || {resultAttachments: []};
        var __files = __item.resultAttachments || [];
        __html+= '<div class="row" style="margin: 0px;margin-left: 15px;">';
        //__html+=String.format('<div><b>{0}</b></div>', __item.subject);
        __html+=String.format('<div><i class="icon-quote-left"></i> {0} <i class="icon-quote-right"></i></div>', __item.notes);
        if(__files.length>0) {
          __html += '<ul class="list-unstyled">';
          __html += this.fillFiles(__files);
          __html += '</ul>';
        }
        __html+='<hr /></div>';
      }
      this.$resultContent.append(__html);
      if(!iNet.isEmpty(__html)) {
        this.$resultHeader.show();
      } else {
        this.$resultHeader.hide();
      }
    }
  });
});
// #PACKAGE: admin-procedure-detail
// #MODULE: ProcedureDetailWidget
$(function () {
  var slash = ';';
  iNet.ns('iNet.ui.onegate.admin');
  iNet.ui.onegate.admin.ProcedureDetailWidget = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);// apply configuration
    this.id = this.id || 'procedure-detail-widget';

    iNet.ui.onegate.admin.ProcedureDetailWidget.superclass.constructor.call(this) ;
    var me= this;
    this.$toolbar = {
      CREATE: $('#procedure-btn-create'),
      SAVE: $('#procedure-btn-save'),
      BACK: $('#procedure-btn-back')
    };

    this.url = {
      create: iNet.getUrl('onegate/prodmaterial/create'),
      update: iNet.getUrl('onegate/prodmaterial/update'),
      fileRemove: iNet.getUrl('onegate/prodmaterial/filedelete'),
      fileDownload: iNet.getUrl('onegate/prodmaterial/download'),
      exportUsed: iNet.getUrl('onegate/prodmaterial/exportused'),
      view: iNet.getUrl('/onegate/procedure/view'),
      listFirm: iNet.getUrl('onegate/department/level')
    };

    var confirmFileDeleteDialog= null;

    this.$filesContainer= $('#procedure-files-container');
    this.$infoContainer = $('#procedure-info-container');
    this.$form = $('#procedure-frm-detail');
    this.$file = $('#procedure-files');
    this.$fileLabel = $('#procedure-files-label');
    this.$fileRemove = $('#procedure-files-remove');
    this.$btnCollapse = $('#procedure-info-collapse');
    this.$listFirm = $('#procedure-list-firm');

    this.$input = {
      industry: $('#procedure-select-industry'),
      level: $('#procedure-select-level'),
      firm: $('#procedure-select-firm'),
      subject: $('#procedure-txt-subject'),
      code: $('#procedure-txt-code'),
      content: $('#procedure-txt-content')
      // serviceLevel3: $('#procedure-chk-servicel3'),
      // serviceLevel4: $('#procedure-chk-servicel4')
    };



    var listFirmDS = new iNet.ui.grid.DataSource({
      columns: [{
        type: 'selection',
        align: 'center',
        width: 30
      }, {
        property: 'name',
        label: 'Tên đơn vị',
        sortable: true,
        width: 300,
        type: 'label'
      }, {
        property: 'address',
        label: 'Địa chỉ',
        sortable: true,
        type: 'label'
      }]
    });

    this.listFirm = new iNet.ui.grid.Grid({
      id: me.$listFirm.prop('id'),
      url: me.url.listFirm,
      dataSource: listFirmDS,
      idProperty: 'orgcode',
      remotePaging: true,
      firstLoad: false,
      convertData: function (data) {
        var __data = data || {};
        me.listFirm.setTotal(__data.total || 0);
        return __data.items || [];
      }
    });

    this.industrySelect = new iNet.ui.form.select.Select({
      id: this.$input.industry.prop('id'),
      formatResult: function (item) {
        var __item = item || {};
        var __children = __item.children || [];
        var $option = $(__item.element);
        var __pattern = $option.data('pattern') || '__:__';
        if (__children.length > 0) {
          return String.format('<span class="badge badge-warning"><i class="icon-book"></i></span> {0}', __item.text)
        }
        return String.format('<span class="label label-info">{0}</span> {1}', __pattern, __item.text);
      },
      formatSelection: function (item) {
        var __item = item || {};
        var $option = $(__item.element);
        var __pattern = $option.data('pattern') || '__:__';
        return String.format('<span class="label label-info" style="height: auto !important;">{0}</span> {1}', __pattern, __item.text);
      }

    });
    this.industrySelect.on('change', function(){
      var __industry= me.industrySelect.getData();
      var $option = $(__industry.element);
      me.$input.code.val($option.data('pattern'));
    });

    this.levelSelect = new iNet.ui.form.select.Select({
      id: this.$input.level.prop('id'),
      formatResult: function (item) {
        var __item = item || {};
        return String.format('<span><i class="icon-building"></i> {0}</span>', __item.text);
      },
      formatSelection: function (item) {
        var __item = item || {};
        return String.format('<span><i class="icon-building"></i> {0}</span>', __item.text);
      }
    });

    this.levelSelect.on('change', function(){
      var __level = me.levelSelect.getData();
      me.listFirm.setParams({level: __level.id});
      me.listFirm.reload();
    });

    this.$redactorContent = this.$input.content.redactor({
      autoresize: false,
      mobile:true,
      lang: 'vi',
      source: true
    });

    var createFileDeleteDialog = function () {
      if (!confirmFileDeleteDialog) {
        confirmFileDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'procedure-modal-confirm-file-delete',
          title: iNet.resources.dialog.delete_title,
          content: iNet.resources.dialog.delete_content,
          buttons: [{
            text: iNet.resources.message.button.ok,
            cls: 'btn-danger',
            icon: 'icon-ok icon-white',
            fn: function () {
              var __data = this.getData();
              var __dialog = this;
              var $li = __data.element;
              var __uuid = $li.attr('data-id');
              if (!iNet.isEmpty(__uuid)) {
                $.postJSON(me.url.fileRemove, {
                  procedure: __data.procedure,
                  files: __uuid
                }, function () {
                  $li.remove();
                  __dialog.hide();
                  me.resize();
                });
              }
            }
          }, {
            text: iNet.resources.message.button.cancel,
            icon: 'icon-remove',
            fn: function () {
              this.hide();
            }
          }]
        });
      }
      confirmFileDeleteDialog.show();
      return confirmFileDeleteDialog;
    };

    this.$filesContainer.on('click', '[data-action]', function() {
      var $el = $(this);
      var __action = $el.attr('data-action');
      var $li = $($el.parents('.attachment-file'));
      var __ownerData = me.ownerData;
      switch (__action) {
        case 'delete':
          var __dialog = createFileDeleteDialog();
          __dialog.setData({element: $li , procedure: __ownerData.uuid});
          __dialog.show();
          break;
        case 'download':
          $.download(me.url.fileDownload, {
            procedure: __ownerData.uuid,
            contentID: $li.prop('id')
          });
          break;
        case 'used':
          var __dialog = me.createConfirmExportUsed();
          __dialog.setData({procedure: __ownerData.uuid, contentID: $li.prop('id'), exportUsed:true,fn: function(result) {
            var __result = result || [];
            me.fillAttachments(__result.attachments || []);
          }});
          __dialog.setContent('Bạn có chắc là đồng ý chọn tệp làm biểu mẫu khi kết xuất không ?');
          __dialog.show();
          break;
        case 'notused':
          var __dialog = me.createConfirmExportUsed();
          __dialog.setData({procedure: __ownerData.uuid, contentID: $li.prop('id'), exportUsed:false,fn: function(result) {
            var __result = result || [];
            me.fillAttachments(__result.attachments || []);
          }});
          __dialog.setContent('Bạn có chắc là đồng ý hủy bỏ tệp làm biểu mẫu kết xuất không ?');
          __dialog.show();
          break;
      }
    });

    var readURL = function (input) {
      var files = input.files || [];
      me.setFiles(files);
    };

    // this.$fileLabel.click(function () {
    //   me.$file.trigger('click');
    // });

    this.$file.change(function () {
      readURL(this);
    });

    this.$fileRemove.click(function () {
      this.clearFile();
    }.createDelegate(this));


    this.validate = new iNet.ui.form.Validate({
      id: this.id,
      rules: [
        {
          id: this.$input.subject.prop('id'),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return 'Tên thủ tục không được để rỗng';
          }},{
          id: this.$input.code.prop('id'),
          validate: function (v, $control) {
            if (iNet.isEmpty(v))
              return 'Mã thủ tục không được để rỗng';
          }},{
          id: 'procedure-select-industry-container',
          validate: function () {
            if(me.industrySelect) {
              var __item = me.industrySelect.getData() || {};
              if (iNet.isEmpty(__item.id)) {
                return 'Lĩnh vực không được để rỗng';
              }
            }
          }
        },{
          id: 'procedure-select-level-container',
          validate: function () {
            if(me.levelSelect) {
              var __item = me.levelSelect.getData() || {};
              if (iNet.isEmpty(__item.id)) {
                return 'Phạm vi không được để rỗng';
              }
            }
          }
        }
      ]
    });

    this.$toolbar.BACK.on('click', function () {
      this.hide();
      this.fireEvent('back', this);
    }.createDelegate(this));

    this.$toolbar.CREATE.on('click', function () {
      this.resetData();
    }.createDelegate(this));

    this.$toolbar.SAVE.on('click', function () {
      if (me.check()) {
        var __data = me.getData();
        var loading;
        if (iNet.isEmpty(__data.procedure)) { //create\
          me.$form.ajaxSubmit({
            url: me.url.create,
            data: __data,
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
              var __result = result || {};
              me.setData(__result);
              me.fireEvent('saved', true, __result);
            }
          });
        } else {
          me.$form.ajaxSubmit({
            url: me.url.update,
            data: __data,
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
              var __result = result || {};
              me.setData(__result);
              me.fireEvent('saved', false, __result);

            }
          });
        }
      }
    });

    this.$btnCollapse.on('click', function(){
      var $icon= $(this).find('i');
      if(me.$infoContainer.is(':hidden')) {
        $icon.attr('class', 'icon-chevron-up');
        me.$infoContainer.show();
      } else {
        me.$infoContainer.hide();
        $icon.attr('class', 'icon-chevron-down');
      }
      me.resize();
    });

    $(window).on('resize', function(){
      me.resize();
    });
    me.resize();
  };
  iNet.extend(iNet.ui.onegate.admin.ProcedureDetailWidget, iNet.ui.onegate.OnegateWidget, {
    resize: function(){
      var h = $(window).height() - 116;
      this.$input.content.prev().height(h-79);
      this.$form.find('.tab-content').height(h);
    },
    check: function(){
      return this.validate.check();
    },
    setIndustry: function(industry){
      this.industrySelect.setData(industry);
      var $option = $(industry.element);
      this.$input.code.val($option.data('pattern'));
    },
    /**
     * Get list firm of a procedure by firm orgcode
     * @returns {string} List firm orgcode
     */
    getFirmList: function () {
      var __firmSelected = this.listFirm.getSelectionModel().getSelection();
      var __firmList = '';
      for (var i = 0; i < __firmSelected.length; i++) {
        __firmList += __firmSelected[i].orgcode + ((i<__firmSelected.length-1)?slash:'');
      }
      return __firmList;
    },
    resetData: function(){
      var _this = this;
      this.ownerData={};
      // this.$input.serviceLevel3.prop('checked', false);
      // this.$input.serviceLevel4.prop('checked', false);
      this.$redactorContent.setCode('');
      var __industry = this.industrySelect.getData();
      var $option = $(__industry.element);
      this.$input.code.val($option.data('pattern'));
      if(this.hasPattern()){
        this.industrySelect.disable();
        this.levelSelect.disable();
      } else {
        this.industrySelect.enable();
        this.levelSelect.enable();
      }
      if (this.listFirm) {
        this.listFirm.setParams({});
        this.listFirm.reload();
        this.listFirm.on('loaded', function () {
          _this.listFirm.getSelectionModel().clearSelected();
        });
      }
      this.$input.subject.val('').focus();
      this.fillAttachments([]);
      this.clearFile();
    },
    setData: function(data) {
      var _this = this;
      var __data= data || {serviceL3: false, serviceL4: false, attachments: []};
      this.ownerData = __data;
      this.$input.subject.val(__data.subject);
      this.$input.code.val(__data.code);
      var $optionIndustry = this.$input.industry.find(String.format('option[value="{0}"]', __data.industry));
      this.industrySelect.setData({id: __data.industry, text: __data.industry, element: $optionIndustry});
      var $optionLevel = this.$input.level.find(String.format('option[value="{0}"]', __data.level));
      this.levelSelect.setData({id: __data.level, text: $optionLevel.text(), element: $optionLevel});
      if(this.hasPattern()){
        this.industrySelect.disable();
        this.levelSelect.disable();
        this.$input.subject.prop('disabled', true);
      } else {
        this.levelSelect.enable();
        this.industrySelect.enable();
        this.$input.subject.prop('disabled', false);
      }
      // this.$input.serviceLevel3.prop('checked', __data.serviceL3);
      // this.$input.serviceLevel4.prop('checked', __data.serviceL4);
      if (this.listFirm) {
        this.listFirm.setParams({level: __data.level});
        this.listFirm.reload();
        this.listFirm.on('loaded', function () {
          _this.listFirm.getSelectionModel().clearSelected();
          if (!iNet.isEmpty(__data.firms)) {
            _this.listFirm.selectById(__data.firms, false);
          }
        });
      }
      this.$redactorContent.setCode(__data.html || '');
      this.clearFile();
      this.fillAttachments(__data.attachments || []);
      this.check();
    },
    getData: function(){
      var __industry = this.industrySelect.getData();
      var __level = this.levelSelect.getData();
      var __data = {
        code: this.$input.code.val(),
        level: __level.id,
        industry: __industry.id,
        //serviceL3: this.$input.serviceLevel3.prop('checked'),
        // serviceL4: this.$input.serviceLevel4.prop('checked'),
        html: this.$redactorContent.getCode()
      };
      var __ownerData = this.ownerData || {};
      if(!iNet.isEmpty(__ownerData.uuid)) {
        __data.procedure= __ownerData.uuid;
      }
      if (!iNet.isEmpty(this.getFirmList())) {
        __data.firms = this.getFirmList();
      }
      return __data;
    },
    loadById: function(uuid) {
      var me= this;
      $.getJSON(me.url.view, {'procedure': uuid}, function(result){
        var __result = result || {};
        me.setData(__result);
      },{mask: this.getMask(), msg: iNet.resources.ajaxLoading.loading});
    },
    clearFile: function () {
      this.$fileLabel.removeClass('selected').attr('data-title', 'Chọn tệp');
      this.$fileLabel.find('span.ace-file-name').attr('data-title', 'Chưa chọn tệp ...');
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
        this.$fileLabel.find('span.ace-file-name').attr('data-title', __fileNames[0]);
      } else {
        this.$fileLabel.find('span.ace-file-name').attr('data-title', String.format('{0} tệp tin: {1} ', __fileNames.length, __fileNames.join(', '))).attr('title', String.format('{0} tệp tin: {1} ', __fileNames.length, __fileNames.join(', ')));
      }
    },
    fillAttachments: function (files) {
      var __files = files || [];
      var __html = '';
      var __itemHtml = ' <div class="attachment-file" id="{0}" data-id="{4}"><div class="file-wrap"><div class="file-action">{3}</div><div class="file-label"><p class="text-overflow blue" data-toggle="tooltip" title="{2}"><i class="{1} fa-lg"></i> {2}</p></div></div></div>';
      for (var i = 0; i < __files.length; i++) {
        var __file = __files[i] || {};
        var __action = '<a data-action="download" data-toggle="tooltip" title="Tải về tập tin" href="javascript:;"><i class="fa fa-download fa-lg blue"></i></a><span class="split"></span>' +
            '<a data-action="delete" data-toggle="tooltip" title="Xóa tập tin" class="remove" href="javascript:;"><i class="fa fa-trash fa-lg red"></i></a><span class="split"></span>';
        if (!!__file.exportUsed) {
          __action += '<a data-action="notused" data-toggle="tooltip" title="Không làm mẫu kết xuất" href="javascript:;"><span class="fa-stack"><i class="fa fa-file-text fa-stack-1x"></i><i class="fa fa-times fa-stack-1x fa-lg red"></i></span></a>';
        } else {
          __action += '<a data-action="used" data-toggle="tooltip" title="Sử dụng làm mẫu kết xuất" href="javascript:;"><i class="fa fa-file-text fa-lg blue"></i></a>';
        }
        __html += String.format(__itemHtml, __file.contentID, 
        		iNet.FileFormat.getFAFileIcon(__file.filename), 
        		__file.filename, __action, __file.contentID);
      }
      this.$filesContainer.html(__html);
      if (__files.length > 0 && this.$filesContainer.is(':hidden')) {
        this.$filesContainer.show();
      }
      this.$filesContainer.find('[data-toggle="tooltip"]').tooltip({container:'body'});
      this.resize();
    },
    fillFiles: function(files){
      this.$filesContainer.empty();
      var __files = files || [];
      var __html= '';
      for (var i = 0; i < __files.length; i++) {
        var __file = __files[i] || {};
        var __action = '[ <a data-file-action="delete" title="Xóa" class="remove" href="javascript:;"><i class="icon-trash red"></i></a> | ';
        if (!!__file.exportUsed) {
          __action += '<a data-file-action="notused" title="Không làm mẫu kết xuất" href="javascript:;"> Không làm biểu mẫu in</a> ]';
        } else {
          __action += '<a data-file-action="used" title="Sử dụng làm mẫu kết xuất" href="javascript:;"> Làm biểu mẫu in</a> ]';
        }
        __html += String.format('<li data-id="{0}"><a data-file-action="download" href="javascript:;"><i class="{1}"></i>{2}</a> {3}</li>', __file.contentID, iNet.FileFormat.getFileIcon(__file.filename), __file.filename, __action);
      }
      this.$filesContainer.append(__html);
      if (__files.length > 0 && this.$filesContainer.is(':hidden')) {
        this.$filesContainer.show();
      }
      this.resize();
    },
    createConfirmExportUsed: function () {
      var me = this;
      if (!this.confirmExportUsed) {
        this.confirmExportUsed = new iNet.ui.dialog.ModalDialog({
          id: 'modal-procedure-confirm-export-used',
          title: 'Biểu mẫu kết xuất ?',
          buttons: [{
              text: 'Đồng ý',
              cls: 'btn-primary',
              icon: 'icon-ok icon-white',
              fn: function () {
                var __dialog = this;
                var __data = __dialog.getData();
                var __procedure = __data.procedure;
                var __contentID = __data.contentID;
                var __exportUsed = __data.exportUsed;
                var __fn = __data.fn || iNet.emptyFn;
                if (!iNet.isEmpty(__contentID)) {
                  $.postJSON(me.url.exportUsed, {
                    procedure: __procedure,
                    contentID: __contentID,
                    exportUsed: __exportUsed
                  }, function (result) {
                    var __result = result || {};
                    if (__result.uuid != 'FAIL') {
                      __fn(__result);
                      __dialog.hide();

                    }
                  }, {mask: this.getMask(), msg: '&nbsp;'});
                }
              }
            }, {
              text: 'Đóng',
              icon: 'icon-remove',
              fn: function () {
                this.hide();
              }
            }
          ]
        });

      }
      return this.confirmExportUsed;
    }
  });
});
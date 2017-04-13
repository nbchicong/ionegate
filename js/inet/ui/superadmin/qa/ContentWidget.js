// #PACKAGE: onegate-superadmin-support-qa-content-widget
// #MODULE: ProcedureDetailWidget
$(function () {
  iNet.ns("iNet.ui",
    "iNet.ui.superadmin",
    "iNet.ui.superadmin.support",
    "iNet.ui.superadmin.support.qa");
  iNet.ui.superadmin.support.qa.ContentWidget = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);// apply configuration
    this.id = this.id || 'qa-content-widget';
    this.url = {
      modify : iNet.getUrl("onegate/faq/modify")
    };
    iNet.ui.superadmin.support.qa.ContentWidget.superclass.constructor.call(this);
    var me= this;
    this.$toolbar = {
      ACCEPT: $("#qa-content-widget-btn-accept"),
      TRANSFER: $("#qa-content-widget-btn-transfer"),
      REPLY: $('#qa-content-widget-btn-reply'),
      UPDATE: $('#qa-content-widget-btn-update'),
      BACK: $('#qa-content-widget-btn-back')
    };
    this.$action = {
      updateanswer: $("[data-action=update-answer]"),
      updatefirm: $("[data-action=update-firm]")
    };

    this.$input = {
      fullname: $("#qa-content-widget-txt-fullname"),
      email:  $("#qa-content-widget-txt-email"),
      address:$("#qa-content-widget-txt-address"),
      created: $("#qa-content-widget-lb-created"),
      received:$("#qa-content-widget-lb-received"),
      published:$("#qa-content-widget-lb-published"),
      phone: $("#qa-content-widget-txt-phone"),
      subject: $('#qa-content-widget-txt-subject'),
      question: $('#qa-content-widget-txt-question'),
      answer: $('#qa-content-widget-lb-answer'),
      firm: $("#qa-content-widget-lb-firm") // span
    };

    this.$dialogFirm = $("#qa-content-widget-firm-modal");
    this.$dialogAnswer = $("#qa-content-widget-answer-modal");
    this.$redactorAnswer = $("#qa-content-widget-answer-modal-answer").redactor({
      autoresize: false,
      minHeight: 300, // pixels
      mobile:true,
      lang: 'vi',
      source: true
    });

    this.validate = new iNet.ui.form.Validate({
      id: this.id,
      rules: [
        {
          id: this.$input.fullname.prop('id'),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return 'Họ và tên không được để rỗng';
          }
        },{
          id: this.$input.phone.prop('id'),
          validate: function (v, $control) {
            if (iNet.isEmpty(v))
              return 'Số điện thoại không được để rỗng';
          }
        },{
          id: this.$input.subject.prop('id'),
          validate: function (v) {
           if (iNet.isEmpty(v))
              return 'Chủ đề câu hỏi không được để rỗng';
          }
        },{
          id: this.$input.address.prop('id'),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return 'Địa chỉ không được để rỗng';
          }
        },{
          id: this.$input.question.prop('id'),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return 'Nội dung câu hỏi không được để rỗng';
          }
        }
      ]
    });

    this.$toolbar.BACK.on('click', function () {
      this.hide();
      this.fireEvent('back', this);
    }.createDelegate(this));


    this.$toolbar.UPDATE.on('click', function () {
      if(this.check()) {
        var __data = this.getData();
        this.modify(__data)
      }
    }.createDelegate(this));

    this.$toolbar.ACCEPT.on("click", function(){
      if(this.check()) {
        var __data = this.getData();
        __data["status"] = 'RECEIVED';
        this.modify(__data)
      }
    }.createDelegate(this));

    this.$toolbar.TRANSFER.on("click", function(){
      if(this.check()) {
        this.$dialogFirm.modal("show");
        this.setDataModalFirm();
      }
    }.createDelegate(this));

    this.$toolbar.REPLY.on("click", function(){
      if(this.check()) {
        this.$dialogAnswer.modal("show");
        this.setDataModalAnswer();
      }
    }.createDelegate(this));

    this.$action.updateanswer.on("click", function(){
      if(this.check()) {
        this.$dialogAnswer.modal("show");
        this.setDataModalAnswer();
      }
    }.createDelegate(this));

    this.$action.updatefirm.on("click", function(){
      if(this.check()) {
        this.$dialogFirm.modal("show");
        this.setDataModalFirm();
      }
    }.createDelegate(this));
    $("#qa-content-widget-firm-modal-bnt-ok").on("click", function(){
        if(iNet.isEmpty($("#qa-content-widget-firm-modal-firm").val())) {
          this.showMessage("error","Thông báo", "Bạn phải nhập tên đơn vị sử lý");
          return;
        }
        this.data["firm"] = $("#qa-content-widget-firm-modal-firm").val();
        if(this.data.status == "CREATE" || this.data.status == 'RECEIVED'){
          var __data = this.getData();
          __data["status"] = 'PROCESS';
          this.modify(__data);
        } else {
          this.$input.firm.html(this.data.firm);

        }
        this.$dialogFirm.modal("hide");
    }.createDelegate(this));

    $("#qa-content-widget-answer-modal-btn-ok").on("click", function(){
      if(iNet.isEmpty($("#qa-content-widget-answer-modal-firm").val())) {
        this.showMessage("error","Thông báo", "Bạn phải nhập tên đơn vị sử lý");
        return;
      }
      if(iNet.isEmpty(this.$redactorAnswer.getCode())) {
        this.showMessage("error","Thông báo", "Bạn phải nhập nội dung trả lời");
        return;
      }

      this.data["firm"] = $("#qa-content-widget-answer-modal-firm").val();
      this.data["answer"] = $("#qa-content-widget-answer-modal-answer").val();
      if(this.data.status != 'PUBLISHED'){
        var __data = this.getData();
        __data["status"] = 'PUBLISHED';
        this.modify(__data);
      } else {
        this.$input.firm.html(this.data.firm);
        this.$input.answer.html(this.data.answer);
      }
      this.$dialogAnswer.modal("hide");
    }.createDelegate(this));


    /*$(window).on('resize', function(){
      me.resize();
    });*/

  };
  iNet.extend(iNet.ui.superadmin.support.qa.ContentWidget, iNet.ui.onegate.OnegateWidget, {
   setTitle : function(status){
     var __cls = "";
     var __icon= "";
     var __title = "";

     switch (status){
       case "RECEIVED" :
         __cls = "alert-info";
         __icon  = "fa fa-check bigger-110";
         __title = "Đã tiếp nhận";
         break;
       case "PROCESS" :
         __cls = "alert-info";
         __icon  = "fa fa-share bigger-110";
         __title = "Đã chuyển sử lý";
         break;
       case "PUBLISHED" :
         __cls = "alert-success";
         __icon  = "fa fa-reply bigger-110";
         __title = "Đã trả lời";
         break;
       default :
         __cls = "alert-warning ";
         __icon  = "fa fa-clock-o bigger-110";
         __title = "Chưa tiếp nhận"
     }
     var __html = '<div class="col-xs-12 col-sm-12 no-padding">'
       + String.format('<div class="alert {0} col-xs-12 col-sm-12 " style="margin-bottom: 2px;">', __cls)
       + String.format('<strong><i class="{0}"></i> {1}</strong>', __icon, __title)
       + '</div></div>';
     $("#qa-content-widget-title").html(__html)
   },
   checkState : function(status){
     FormUtils.showButton(this.$toolbar.REPLY, status != 'PUBLISHED');
     FormUtils.showButton(this.$toolbar.UPDATE, status == 'PUBLISHED');
     FormUtils.showButton(this.$toolbar.ACCEPT, status == 'CREATED');
     FormUtils.showButton(this.$toolbar.TRANSFER, status != 'PUBLISHED' &&  status != 'PROCESS');
     FormUtils.showButton(this.$toolbar.updateanswer, status != 'PUBLISHED');
     FormUtils.showButton(this.$toolbar.updatefirm, status == 'PUBLISHED' || status == 'PROCESS');
      if("PUBLISHED" == status) {
        $("#qa-content-widget-answer").show();
      } else {
        $("#qa-content-widget-answer").hide();
      }
   },
    check: function(){
      return this.validate.check();
    },
    setData: function(data) {
      this.data = data || {};
      this.$input.fullname.val(this.data.fullname || "");
      this.$input.email.val(this.data.email || "");
      this.$input.address.val(this.data.address || "");
      this.$input.phone.val(this.data.phone || "");
      this.$input.subject.val(this.data.subject || "");
      this.$input.question.val(this.data.question || "");
      this.$input.answer.html(this.data.answer || "");
      this.$input.firm.html(this.data.firm || "");
      if(!iNet.isEmpty(this.data.created)) {
        this.$input.created.html(new Date(this.data.created).format("d/m/Y"));
      } else
        this.$input.created.html("_________");

      if(!iNet.isEmpty(this.data.received)) {
        this.$input.received.html(new Date(this.data.received).format("d/m/Y"));
      } else
        this.$input.received.html("_________");
      if(!iNet.isEmpty(this.data.published)) {
        this.$input.published.html(new Date(this.data.published).format("d/m/Y"));
      } else
        this.$input.published.html("_________");

      this.setTitle(data.status);
      this.checkState(data.status);
    },
    getData: function(){
      var __data = this.data;
      __data.fullname = this.$input.fullname.val();
      __data.email = this.$input.email.val();
      __data.address = this.$input.address.val();
      __data.phone = this.$input.phone.val();
      __data.subject = this.$input.subject.val();
      __data.question = this.$input.question.val();
      return __data;
    },
    modify: function(data){
      var __data = data || {};
      var __me = this;
      $.postJSON(this.url.modify, __data, function(result){
        if(result) {
          __me.showMessage("success", "Cập nhật", "Cập nhật thông tin thành công");
          __me.setData(__data);
          __me.fireEvent("change")
        }
      },{
        msg: iNet.resources.ajaxLoading.processing,
        mask:__me.$element
      });
    },
    setDataModalFirm: function(){
      var __data = this.data;
      $("#qa-content-widget-firm-modal-firm").val(__data["firm"]);
    },
    getDataModalFirm: function(){
      return {"firm": $("#qa-content-widget-firm-modal-firm").val()}
    },
    setDataModalAnswer: function(){
      var __data = this.data;
      $("#qa-content-widget-answer-modal-firm").val(__data["firm"]);
      this.$redactorAnswer.setCode(__data["answer"] || "");
    },
    getDataModalAnswer: function(){
      return {
        firm: $("#qa-content-widget-answer-modal-firm").val(),
        answer: this.$redactorAnswer.getCode()
      }
    }
  });
});
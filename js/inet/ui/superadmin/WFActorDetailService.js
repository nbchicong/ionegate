// #PACKAGE: ionegate-superadmin-wf-actor-detail
// #MODULE: SuperadminWorkflowActorDetailService
$(function () {
  iNet.ns('iNet.ui.onegate.superadmin');
  iNet.ui.onegate.superadmin.WorkflowActorDetailService = function (config) {
    this.url = {
      update: iNet.getUrl('cloud/workflow/alias/create'),
      save: iNet.getUrl('cloud/workflow/alias/create')
    };
    this.$id = $("#div-wf-detail");
    this.owner = {actor: {}, member: []};
    this.display = false;
    var __config = config || {};
    iNet.apply(this, __config);

    var self = this;
    this.$element = this.$id;
    this.$toolbar = {
      SAVE: $('#btn-wf-actor-save'),
      ADD: $('#btn-wf-actor-add'),
      BACK: $('#btn-wf-actor-back')
    };
    this.$form = $("#frm-wf-actor-detail");

    var $input = {
      code: $('#txt-code'),
      defactor: $('#txt-defactor'),
      name: $('#txt-name'),
      position: $('#txt-position'),
      brief: $('#txt-brief')
    };
    var getText = function (text) {
      return text;
    };

    // validate ==================================
    var validation = new iNet.ui.form.Validate({
      id: self.$form.prop("id"),
      rules: [
        {
          id: $input.code.prop("id"),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return getText("Mã đại diện không được để trống");
          }
        },
        {
          id: $input.defactor.prop("id"),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return getText("Default actor không được để trống");
          }
        }
      ]
    });

    this.validate = function () {
      return validation.check();
    };

    // set Data =================================
    this.setData = function (data) {
      $input.code.val(data.code);
      $input.defactor.val(data.defactor);
      $input.name.val(data.name);
      $input.position.val(data.position);
      $input.brief.val(data.brief);

      $input.code.prop('readonly', true);
      $input.defactor.prop('readonly', true);
      $input.name.prop('readonly', true);
      $input.position.prop('readonly', true);
      $input.brief.prop('readonly', true);
    };

    // get data =====================================
    this.getData = function () {
      return {
        uuid: self.owner.actor.uuid || "",
        code: $input.code.val(),
        name: $input.name.val(),
        position: $input.position.val(),
        defactor: $input.defactor.val(),
        brief: $input.brief.val()
      }
    };

    this.reset = function () {
      this.owner.actor = {};
      this.owner.member = [];

      $input.defactor.val('');
      $input.name.val('');
      $input.position.val('');
      $input.brief.val('');

      $input.code.prop('readonly', false);
      $input.defactor.prop('readonly', false);
      $input.name.prop('readonly', false);
      $input.position.prop('readonly', false);
      $input.brief.prop('readonly', false);

      $input.code.val('').focus();
    };
    this.loadData = function (data) {
      self.setData(data);
      self.owner.actor = data;
    };

    // update =======================================
    this.save = function (data) {
      var __data = data || {};
      if (iNet.isEmpty(__data.uuid)) {
        $.postJSON(self.url.save, __data, function (result) {
          var __result = result || {};
          if (!iNet.isEmpty(__result.uuid)) {
            self.data = __result;
            self.fireEvent("created", __result);
            __result.name = __result.attribute.name;
            __result.position = __result.attribute.position;
            __result.brief = __result.attribute.brief;
            self.showMessage('success', 'Đại diện xử lý', getText("Đại diện xử lý đã được tạo"));
            self.owner.actor = __result;
            self.setData(__result);
          } else {
            self.showMessage('error', 'Đại diện xử lý', 'Có lỗi khi lưu dữ liệu !');
          }
        }, {
          mask: self.getMask(),
          msg: iNet.resources.ajaxLoading.saving
        });
      }
    };

    // action -----------------------------------------------
    this.$toolbar.SAVE.click(function () {
      if (this.validate()) {
        this.save(this.getData());
      }
    }.createDelegate(this));

    this.$toolbar.BACK.click(function () {
      this.fireEvent("back");
    }.createDelegate(this));

    this.$toolbar.ADD.click(function () {
      this.reset();
    }.createDelegate(this));

    // event -------------------------------------------------

    // init data----------------------------------------------
    (function () {
      (self.display) ? self.show() : self.hide();
    }());
  };

  iNet.extend(iNet.ui.onegate.superadmin.WorkflowActorDetailService, iNet.ui.onegate.OnegateWidget, {
    addRow: function (data) {
      this.grid.insert(data);
    },
    updateRow: function (data) {
      this.grid.update(data)
    }
  });
});
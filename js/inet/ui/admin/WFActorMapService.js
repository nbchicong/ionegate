// #PACKAGE: ionegate-admin-wf-actor-map
// #MODULE: WorkflowMapActorService
$(function () {
  iNet.ui.admin.WorkflowMapActorService = function (config) {
    this.url = {
      update: iNet.getUrl('cloud/workflow/alias/create'),
      save: iNet.getUrl('cloud/workflow/alias/create'),
      loadMember: iNet.getUrl('cloud/workflow/actormap/code'),
      saveMember: iNet.getUrl('cloud/workflow/actormap/create'),
      delMember: iNet.getUrl('cloud/workflow/actormap/delete')
    };
    this.$id = $("#div-wf-detail");
    this.owner = {actor: {}, member: [], data: {}};
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
      brief: $('#txt-brief'),
      member: $('#txt-member')
    };
    var getText = function (text) {
      return text;
      /*
      if (!iNet.isEmpty(text)) {
        return iNet.resources.onegate.admin.procedure[text] || text;
      } else {
        return "";
      }
      */
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
    this.reset = function () {
      this.owner.actor = {};
      this.owner.member = [];
      $input.code.val('');
      $input.defactor.val('');
      $input.name.val('');
      $input.position.val('');
      $input.brief.val('');

      $input.code.prop('readonly', false);
      $input.defactor.prop('readonly', false);
      $input.name.prop('readonly', false);
      $input.position.prop('readonly', false);
      $input.brief.prop('readonly', false);
      this.cbbMember.clear();
    };
    this.loadData = function (data) {
      self.setData(data);
      self.owner.actor = data;
      self.loadMember(data.code);
    };

    this.loadMember = function (actor) {
      $.postJSON(self.url.loadMember, {actor: actor,
        zone: self.owner.data.datazone,
        context: self.owner.data.orgcode
      }, function (result) {
        var __data = result || {};
        var __items = __data.items || [];
        var __users = [];
        for (var i = 0; i < __items.length; i++) {
          var __item = __items[i];
          __users.push(__item.username);
        }
        self.cbbMember.setValue(__users);
        self.owner.member = __items;
      }, {
        mask: self.$element,
        msg: iNet.resources.ajaxLoading.loading
      });
    };

    // update =======================================
    this.save = function (data) {
      self.saveMember(self.owner.actor.code);
    };

    this.saveMember = function (actor) {
      var __member = self.owner.member;
      var __memberData = self.cbbMember.getValue() || [];
      var member, temp, flag, memberAdd = [];
      for (var i = 0; i < __memberData.length; i++) {
        member = __memberData[i];
        flag = true;
        for (var j = 0; j < __member.length; j++) {
          temp = __member[j];
          if (member === temp.username) {
            flag = false;
            break;
          }
        }

        if (flag) {
          memberAdd.push(member);
        }
      }
      self.createMember(actor, memberAdd);
    };

    this.createMember = function (actor, members) {
      var memberAdd = members || [];
      if (memberAdd.length > 0) {
        var member = memberAdd.pop();
        $.postJSON(self.url.saveMember, {
          actor: actor,
          username: member,
          zone: self.owner.data.zone,
          context: self.owner.data.orgcode
        }, function (result) {
          self.createMember(actor, memberAdd);
        }, {
          mask: self.$element,
          msg: iNet.resources.ajaxLoading.loading
        });
      } else {
        self.deleteMember();
      }
    };

    this.deleteMember = function () {
      var __member = self.owner.member;
      var __memberData = self.cbbMember.getValue() || [];
      var member, temp, flag, memberRemove = [];
      for (var i = 0; i < __member.length; i++) {
        member = __member[i];
        flag = true;
        for (var j = 0; j < __memberData.length; j++) {
          temp = __memberData[j];
          if (member.username === temp) {
            flag = false;
            break;
          }
        }

        if (flag) {
          memberRemove.push(member);
        }
      }

      self.removeMember(memberRemove);
    };

    this.removeMember = function (members) {
      var memberRemove = members || [];
      if (memberRemove.length > 0) {
        var member = memberRemove.pop();
        $.postJSON(self.url.delMember, {mapid: member.uuid,
          username: member.name,
          zone: member.zone,
          context: member.context
        }, function (result) {
          self.removeMember(memberRemove);
        }, {
          mask: self.$element,
          msg: iNet.resources.ajaxLoading.loading
        });
      } else {
        self.showMessage('success', 'Đại diện xử lý', getText("Đại diện xử lý đã được lưu thành công"));
        self.loadMember(self.owner.actor.code);
      }
    };

    // action -----------------------------------------------
    this.$toolbar.SAVE.click(function () {
      if (self.validate()) {
        self.save();
      }
    });

    this.$toolbar.BACK.click(function () {
      self.fireEvent("back");
    });

    this.$toolbar.ADD.click(function () {
    });

    // event -------------------------------------------------

    // init data----------------------------------------------
    $.postJSON(iNet.getXUrl("onegate/dept/member"), {}, function (result) {
      if (!!result && !!result.members) {
        self.owner.data = result;
        var datazone = result.datazone || '';
        var zone = datazone.split(',')[0];
        self.owner.data.zone = zone;
        self.owner.user = result.members;
        self.cbbMember = new iNet.ui.form.select.Select({
          id: $input.member.prop("id"),
          idValue: function (item) {
            return item.name;
          },
          multiple: true,
          allowClear: true,
          data: function () {
            return {
              results: result.members,
              text: function (item) {
                return item.value + "&lt;" + item.name + "&gt;";
              }};
          },
          initSelection: function (element, callback) {
            var __value = element.val() || "";
            __value = __value.split(',');
            var elements = [];
            var users = self.owner.user;
            var username, temp;
            for (var i = 0; i < __value.length; i++) {
              username = __value[i];
              for (var j = 0; j < users.length; j++) {
                if (username == users[j].name) {
                  elements.push(users[j]);
                  break;
                }
              }
            }

            callback(elements);
          },
          formatSelection: function (object) {
            var __object = object || {};
            return String.format('<span>{0} &lt;{1}&gt;</span>', __object.value, __object.name);
          },
          formatResult: function (object) {
            var __object = object || {};
            return String.format('<span><i class="icon-user"></i> {0} &lt;{1}&gt;</span>', __object.value, __object.name);
          }
        });
      }
    });

    (function () {
      (self.display) ? self.show() : self.hide();
    }());
  };

  iNet.extend(iNet.ui.admin.WorkflowMapActorService, iNet.ui.onegate.OnegateWidget, {
    addRow: function (data) {
      this.grid.insert(data);
    },
    updateRow: function (data) {
      this.grid.update(data)
    }
  });
});
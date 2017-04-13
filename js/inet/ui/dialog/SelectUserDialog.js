// #PACKAGE: ionegate-ui
// #MODULE: SelectUserDialog
$(function () {
  iNet.ui.form.SelectUser = function (config) {
    config = config || {};
    this.prefix = (config.prefix) ? config.prefix : config.id;
    this.id = 'select-user-component';
    this.hideResp = false;
    this.singleSelect = false;
    iNet.apply(this, config);//apply configuration
    this.prefix = (this.prefix) ? (this.prefix + '-') : '';
    this.componentId = String.format('#{0}', this.id);
    var userStore = new Hashtable();
    var that = this;
    var responsibility = 2; // [0:Dong Xu ly, 1:Theo doi, 2:Xu ly chinh,3:Xu ly chinh can theo doi]
    var filterMode = -1; // [-2:Da chon ; -1:Tat ca, 0:Dong Xu ly, 1:Theo doi, 2:Xu ly chinh,3:Xu ly chinh can theo doi]
    var userList = null;
    var afterLoadUser = function (items) {
      var __items = items || [];
      var addItem = function (item) {
        var __item = item || {departments: []};
        userStore.put(__item.uuid, __item);
        var __itemText = '<li onclick="javascript:;" data-action="select" class="select-user-item" data-id="{0}"  title="{2}">' +
          '<div class="select-user-avatar"></div> <div class="select-user-name fullname">{2}</div><p class="id hide">{0}</p>' +
          '<p class="dept hide">{3}</p><p class="resp hide">-1</p><p class="hide username">{1}</p></li>';
        var __depts = __item.departments || [];
        return String.format(__itemText, __item.uuid, __item.username, __item.fullname || __item.username, __depts.join(';'));
      };
      var __html = '';
      for (var i = 0; i < __items.length; i++) {
        __html += addItem(__items[i]);
      }
      var selectDeptId = that.id + '-select-user-dept-id';
      var contentId = that.id + '-body-id';
      var btnSelectAllId = that.id + '-btn-select-all-id';
      var btnUnSelectAllId = that.id + '-btn-unselect-all-id';
      var __content = String.format('<div id="{0}" onclick="javascript:;">', contentId) +
        '<div class="select-user-status" onclick="javascript:;">' +
        '<span>' +
        String.format('<span data-action="filter" data-mode="-1" class="select-label select-label-active" onclick="javascript:;">{0} <span data-number="seleted"></span></span>', that.allText) +
        String.format('<span data-action="filter" data-mode="-2" class="select-label hide" onclick="javascript:;">{0} <span data-number="seleted"></span></span>', that.selectedText) +
        '</span>' +
        '</div>' +
        '<div class="select-user-toolbar">' +
        '<span class="select-user-search">' +
        String.format('<select id="{0}" class="select-user-select-dept"></select> <input class="search select-user-input-search" placeholder="{1}" type="text">', selectDeptId, that.search_placeholder) +
        '</span>';
      if (!that.singleSelect) {
        __content += '<span class="select-user-action-toolbar">' +
          String.format('<button id="{0}" type="button" class="btn btn-small">{2}</button> <button id="{1}" type="button" class="btn btn-small">{3}</button>', btnSelectAllId, btnUnSelectAllId, that.select_all, that.un_selected) +
          '</span>';
      }
      __content += '</div>' +
        '<div class="select-user-content" onclick="javascript:;"><ul onclick="javascript:;" class="list select-user-ul">' +
        __html +
        '</ul></div>' +
        '</div>';
      $(that.componentId).html(__content);
      var $component = $(that.componentId);
      var $deptSelect = $('#' + selectDeptId);
      var $btnSelectAll = $('#' + btnSelectAllId);
      var $btnUnSelectAll = $('#' + btnUnSelectAllId);
      userList = new List(contentId, {
        valueNames: ['id', 'fullname', 'dept', 'resp', 'username']
      });
      /**
       * Select Item
       */
      $component.off('click').on('click', 'li[data-action="select"]', function () {
        var item = userList.get('id', $(this).attr('data-id'));
        var itemValues = item.values();
        if (that.singleSelect) {
          if ($(this).hasClass('select-user-item')) { //Chua duoc chon
            //remove all item selected
            var $items = $component.find('[data-action=select].select-user-item-selected');
            for (var i = 0; i < $items.length; i++) {
              var $element = $($items[i]);
              var itemRemove = userList.get('id', $element.attr('data-id'));
              var itemValuesRemove = itemRemove.values();
              $element.removeAttr('class').attr('class', 'select-user-item');
              itemRemove.values({
                resp: -1,
                oresp: itemValuesRemove.resp
              });
            }
            if (((filterMode == -2) || (filterMode > -1)) && !iNet.isEmpty(itemValues.oresp)) {
              $(this).removeClass('select-user-item').addClass(String.format('select-user-item-selected item-resp-{0}', itemValues.oresp));
              item.values({
                resp: itemValues.oresp
              });
            }
            else {
              $(this).removeClass('select-user-item').addClass(String.format('select-user-item-selected item-resp-{0}', responsibility));
              item.values({
                resp: responsibility,
                oresp: responsibility
              });
            }
          } else {
            $(this).removeAttr('class').attr('class', 'select-user-item');
            item.values({
              resp: -1,
              oresp: itemValues.resp
            });
          }

        } else {
          if ($(this).hasClass('select-user-item')) { //Chua duoc chon
            if (((filterMode == -2) || (filterMode > -1)) && !iNet.isEmpty(itemValues.oresp)) {
              $(this).removeClass('select-user-item').addClass(String.format('select-user-item-selected item-resp-{0}', itemValues.oresp));
              item.values({
                resp: itemValues.oresp
              });
            }
            else {
              $(this).removeClass('select-user-item').addClass(String.format('select-user-item-selected item-resp-{0}', responsibility));
              item.values({
                resp: responsibility,
                oresp: responsibility
              });
            }
          }
          else {
            $(this).removeAttr('class').attr('class', 'select-user-item');
            item.values({
              resp: -1,
              oresp: itemValues.resp
            });
          }
        }

        //$(this).find('div.select-user-name').data('jqae', null).ellipsis();
        checkNumberText();
      });
      var getColor = function (mode) {
        switch (mode) {
          case 0:
            return 'badge-warning';
          case 1:
            return 'badge-important';
          case 2:
            return 'badge-info';
          case 3:
            return 'badge-success';
        }
      };
      var updateText = function ($label, number, mode) {
        var __mode = !iNet.isEmpty(mode) ? mode : -1;
        if (number > 0) {
          if (__mode > -1) { //mode text
            $label.html(String.format('{0}', number)).removeAttr('class').attr('class', String.format('badge {0}', getColor(__mode)));
          }
          else { // all text and selected text
            $label.html(String.format('({0})', number));
          }
          $label.parent().show();
        }
        else {
          if (filterMode == mode) {
            if (__mode > -1) {
              $label.html(String.format('{0}', number));
            }
            else {
              $label.html(String.format('({0})', number));
            }
          }
          else {
            $label.empty();
            $label.parent().hide();
          }
        }
      };
      var checkNumberText = function () {
        var $allText = $component.find('span[data-action="filter"][data-mode="-1"] span[data-number="seleted"]');
        var $selectedText = $component.find('span[data-action="filter"][data-mode="-2"] span[data-number="seleted"]');
        var $normalSelectedText = $component.find('span[data-action="filter"][data-mode="0"] span[data-number="seleted"]');
        var $watchSelectedText = $component.find('span[data-action="filter"][data-mode="1"] span[data-number="seleted"]');
        var $processSelectedText = $component.find('span[data-action="filter"][data-mode="2"] span[data-number="seleted"]');
        var $pwatchSelectedText = $component.find('span[data-action="filter"][data-mode="3"] span[data-number="seleted"]');
        var items = userList.items;
        var __selectedNumber = 0, __processSelectedNumber = 0, __normalSelectedNumber = 0, __watchSelectedNumber = 0, __pwatchSelectedNumber = 0;
        for (var i = 0, il = items.length; i < il; i++) {
          var item = items[i];
          var values = item.values();
          if (!iNet.isEmpty(values.resp) && Number(values.resp) > -1) {
            __selectedNumber++;
          }
          if (!that.hideResp) {
            if (values.resp == 0) {
              __normalSelectedNumber++;
            }
            if (values.resp == 1) {
              __watchSelectedNumber++;
            }
            if (values.resp == 2) {
              __processSelectedNumber++;
            }
            if (values.resp == 3) {
              __pwatchSelectedNumber++;
            }
          }
        }
        updateText($allText, userList.size(), -1);
        if (__selectedNumber > 0) {
          $btnUnSelectAll.show();
        }
        else {
          $btnUnSelectAll.hide();
        }
        updateText($selectedText, __selectedNumber, -2);
        if (!that.hideResp) {
          updateText($normalSelectedText, __normalSelectedNumber, 0);
          updateText($processSelectedText, __processSelectedNumber, 2);
          updateText($watchSelectedText, __watchSelectedNumber, 1);
          updateText($pwatchSelectedText, __pwatchSelectedNumber, 3);
        }
      };
      $.getJSON(iNet.getUrl('system/department/list'), function (result) {
        var __result = result || {};
        var __items = __result.items || [];
        $deptSelect.empty();
        var __options = String.format('<option value="">{0}</option>', that.dept_all_text);
        for (var i = 0; i < __items.length; i++) {
          var __item = __items[i];
          __options = __options + String.format('<option value="{0}">{1}</option>', __item.uuid, __item.description);
        }
        $deptSelect.html(__options);
      });

      $deptSelect.unbind('change').change(function () {
        var v = $(this).val();
        if (iNet.isEmpty(v)) {
          userList.filter();
        } else {
          userList.filter(function (item) {
            var __depts = item.values().dept || [];
            if (__depts.indexOf(v) > -1) {
              return true;
            }
            else {
              return false;
            }
          });
          return false;
        }
      });
      /**
       * Select Filter
       */
      $component.on('click', 'span[data-action="filter"]', function () {
        $component.find('span[data-action="filter"].select-label-active').removeClass('select-label-active');
        $(this).addClass('select-label-active');
        var mode = Number($(this).attr('data-mode'));
        if (mode == filterMode) {
          return;
        }
        filterMode = mode;
        checkNumberText();

        if (mode == -1) { //show all
          that.setVisibleMode(true);
          $deptSelect.val('').trigger('change');
          return false;
        }
        that.setVisibleMode(false); //hide mode toolbar
        if (mode == -2) { //show selected
          userList.filter(function (item) {
            var values = item.values();
            if (!iNet.isEmpty(values.resp) && Number(values.resp) > -1) {
              return true;
            }
            else {
              return false;
            }
          });
          return false;
        }
        userList.filter(function (item) {
          if (item.values().resp == mode) {
            return true;
          }
          else {
            return false;
          }
        });
        return false;
      });
      /*==================Select mode===============*/
      $component.on('click', 'button[data-action="mode"]', function () {
        var mode = Number($(this).attr('data-mode')) || 0;
        $component.find('button[data-action="mode"].btn-info').removeClass('btn-info');
        $(this).addClass('btn-info');
        responsibility = mode;
      });

      if (!that.singleSelect) {
        $btnSelectAll.click(function () {
          var $items = $component.find('[data-action=select].select-user-item:visible');
          for (var i = 0; i < $items.length; i++) {
            var $element = $($items[i]);
            var item = userList.get('id', $element.attr('data-id'));
            var itemValues = item.values();
            if (((filterMode == -2) || (filterMode > -1)) && !iNet.isEmpty(itemValues.oresp)) {
              $element.removeClass('select-user-item').addClass(String.format('select-user-item-selected item-resp-{0}', itemValues.oresp));
              item.values({
                resp: itemValues.oresp
              });
            }
            else {
              $element.removeClass('select-user-item').addClass(String.format('select-user-item-selected item-resp-{0}', responsibility));
              item.values({
                resp: responsibility,
                oresp: responsibility
              });
            }
          }

          //$items.find('div.select-user-name').data('jqae', null).ellipsis();
          checkNumberText();
        });
        $btnUnSelectAll.click(function () {
          var $items = $component.find('[data-action=select].select-user-item-selected:visible');
          for (var i = 0; i < $items.length; i++) {
            var $element = $($items[i]);
            var item = userList.get('id', $element.attr('data-id'));
            var itemValues = item.values();
            $element.removeAttr('class').attr('class', 'select-user-item');
            item.values({
              resp: -1,
              oresp: itemValues.resp
            });
          }

          //$items.find('div.select-user-name').data('jqae', null).ellipsis();
          checkNumberText();
        });
      }

      //$component.find('div.select-user-name').ellipsis();
      checkNumberText();
    };
    var loadUsers = function () {
      $.getJSON(iNet.getUrl('system/account/role'), function (result) {
        var __result = result || {};
        var __items = __result.items || [];
        afterLoadUser(__items);
      }, {mask: $(that.componentId), msg: iNet.resources.ajaxLoading.loading});
    };
    this.setMode = function (mode) {
      var __mode = mode || 0;
      responsibility = __mode;
      $(that.componentId).find('button[data-action="mode"].btn-info').removeClass('btn-info');
      $(that.componentId).find(String.format('button[data-mode="{0}"]', __mode)).addClass('btn-info');
    };
    this.setVisibleMode = function (show) {
      var $toolbar = $(that.componentId).find('.mode-toolbar');
      if (show && !that.hideResp) {
        $toolbar.show();
      }
      else {
        $toolbar.hide();
      }
    };
    this.getData = function () {
      var items = userList.items;
      var __users = [];
      for (var i = 0, il = items.length; i < il; i++) {
        var item = items[i];
        var values = item.values();
        var __responsibility = values.resp;
        if (!iNet.isEmpty(__responsibility) && Number(__responsibility) > -1) {
          var __user = userStore.get(values.id);
          __users.push(__user.username);
        }
      }
      return __users;
    };
    loadUsers();
  };
  // APPLY RESOURCES
  iNet.apply(iNet.ui.form.SelectUser.prototype, iNet.resources.form.selectUser);

  iNet.ui.dialog.SelectUserDialog = function (config) {
    config = config || {};
    this.prefix = (config.prefix) ? config.prefix : config.id;
    this.id = 'modal-dialog-' + iNet.generateId();
    iNet.apply(this, config);//apply configuration
    this.prefix = (this.prefix) ? (this.prefix + '-') : '';
    this.dialogId = String.format('#{0}', this.id);
    this.buttons = this.buttons ? this.buttons : [];
    this.title = this.title || 'Select User on Cloud';
    this.content = this.content || '';
    var that = this;
    var selectUID = 'select-user-component-' + iNet.generateId();
    $('body').append(String.format('<div id="{0}" class="modal container fade" style="display: none;" data-height="350"></div>', that.id));
    var generateButtons = function () {
      var __html = '';
      if (iNet.isArray(that.buttons)) {
        for (var i = 0; i < that.buttons.length; i++) {
          var __button = that.buttons[i];
          __button.id = (__button.id) ? __button.id : that.prefix + iNet.generateId();
          __html += String.format('<button id="{0}" class="btn btn-small {1}"><span class="{2}"></span> {3}</button>', __button.id, __button.cls || '', __button.icon, __button.text);
          $(that.dialogId).off('click', '#' + __button.id).on('click', '#' + __button.id, __button.fn.createDelegate(that));
        }
      }
      return __html;
    };
    var initComponent = function () {
      var __html = '<div class="modal-header">' +
        '<a class="close" data-dismiss="modal">&times;</a>' +
        String.format('<h4><i class="icon-cloud"></i> {0}</h4>', that.title) +
        String.format('</div><div class="modal-body" style="overflow: hidden !important;"><div id="{0}"></div></div>', selectUID) +
        '<div class="modal-footer">' +
        generateButtons() +
        '</div>';

      $(that.dialogId).html(__html);
    };
    initComponent();

    this.selectUser = new iNet.ui.form.SelectUser({
      id: selectUID,
      singleSelect: false
    });

    this.show = function () {
      if ($(this.dialogId).length < 1) {
        return;
      }
      $(this.dialogId).modal('show');
      var __butons = this.getButtons();
      if (__butons.length > 0) {
        $(__butons[0]).focus();
      }
      return this;
    };
    this.hide = function () {
      $(this.dialogId).modal('hide');
      return this;
    };
  };
  iNet.extend(iNet.ui.dialog.SelectUserDialog, iNet.Component, {
    getContent: function () {
      return this.content;
    },
    setContent: function (content) {
      this.content = content;
      $(this.dialogId).find('.modal-body').html(this.content);
    },
    setTitle: function (title) {
      this.title = title;
      $(this.dialogId).find('.modal-header h4').html('<i class="icon-cloud"></i> ' + this.title);
    },
    getMask: function () {
      return $(this.dialogId);
    },
    getButtons: function () {
      return $(this.dialogId).find('.modal-footer button');
    },
    getData: function () {
      return this.selectUser.getData();
    }
  });
  // APPLY RESOURCES
  iNet.apply(iNet.ui.dialog.SelectUserDialog.prototype, iNet.resources.dialog.selectUserDialog);
});

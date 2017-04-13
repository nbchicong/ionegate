// #PACKAGE: ionegate-superadmin-organize-users
// #MODULE: OrganizeUsers
$(function() {
  iNet.ns('iNet.ui.onegate.superadmin');
  iNet.ui.onegate.superadmin.OrganizeUsersWidget = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);// apply configuration
    this.id = this.id || 'organize-search-widget';
    iNet.ui.onegate.superadmin.OrganizeUsersWidget.superclass.constructor.call(this) ;
    var me = this;
    var confirmDeleteDialog = null, selectAccountCloudDlg = null;

    this.url = {
      list: !this.hasPattern() ? iNet.getUrl('onegate/department/list'):  iNet.getXUrl('onegate/dept/member'),
      update: !this.hasPattern() ? iNet.getUrl('onegate/department/update'): iNet.getXUrl('onegate/dept/update'),
      del: iNet.getUrl('onegate/department/delete')
    };

    var $toolbar = {
      RELOAD: $('#node-btn-reload'),
      CREATE: $('#node-btn-create'),
      EDIT: $('#node-btn-edit'),
      DELETE: $('#node-btn-delete'),
      ADD_USER: $('#node-btn-add-user'),
      PROSIGNED: $('#node-btn-procedure-signed-list'),
      ESB_REGISTER: $('#node-btn-esb-register')
    };

    this.tree = new iNet.ui.superadmin.OrganizationTree({
      id: 'node-user-list',
      url: this.url.list,
      idProperty: 'uuid',
      parentProperty: 'parentcode',
      childrenProperty: 'members'
    });

    $(window).resize(function () {
      var h = $(this).height() - 95;
      me.getTree().setHeight(h);
    });

    this.tree.on('selectionchange', function (data, isSelect) {
      var __data = data || {};
      var __isExist = !iNet.isEmpty(__data.uuid);
      var __isUser = !iNet.isEmpty(__data.user) ? __data.user : false;

      FormUtils.showButton($toolbar.CREATE, (isSelect && !__isUser) || !isSelect);
      FormUtils.showButton($toolbar.DELETE, __isExist && isSelect && !me.hasPattern());
      FormUtils.showButton($toolbar.EDIT, __isExist && isSelect && !__isUser);
      FormUtils.showButton($toolbar.ADD_USER, __isExist && isSelect && !__isUser && !me.hasPattern());
      FormUtils.showButton($toolbar.PROSIGNED, (isSelect && __isExist && !__isUser));
      me.nodeSelected= isSelect? __data: null;
    });

    this.tree.on('move', function (sourceId, targetId) {
      me.getTree().moveNode(sourceId, targetId);
    });

    var createConfirmDeleteDialog = function () {
      if (!confirmDeleteDialog) {
        confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'modal-confirm-department-delete',
          title: iNet.resources.dialog.delete_title,
          content: iNet.resources.dialog.delete_content,
          buttons: [
            {
              text: iNet.resources.message.button.ok,
              cls: 'btn-danger',
              icon: 'icon-ok icon-white',
              fn: function () {
                var __data = this.getData();
                if (!iNet.isEmpty(__data.uuid)) {
                  this.hide();
                  var __isUser = !iNet.isEmpty(__data.user) ? __data.user : false;
                  if (__isUser) {
                    var __parentcode = __data.parentcode;
                    var __parent = me.getTree().getById(__parentcode);
                    if (!iNet.isEmpty(__parentcode) && __parent) { //update node
                      var __members = __parent['members'] || [];
                      var __users = [];
                      for (var i = 0; i < __members.length; i++) { //remove member and update data
                        var __member = __members[i] || {};
                        if (__users.indexOf(__member.value) < 0 && __member.value != __data.value) {
                          __users.push(__member.value);
                        }
                      }
                      delete __parent['members'];
                      delete __parent['appointments'];
                      delete __parent['worktime'];
                      delete __parent['evaluation'];
                      if(__users.length>0) {
                        __parent['users'] = __users.join(',');
                      } else {
                        __parent['users'] = '---';
                      }
                      $.postJSON(me.url.update, __parent, function (result) {
                        me.getTree().removeNode(__data.uuid);
                      },{mask: me.getMask(), msg: iNet.resources.ajaxLoading.saving});
                    }
                  } else {
                    $.postJSON(me.url.del, {uuid: __data.uuid}, function () {
                      me.getTree().removeNode(__data.uuid);
                    }, {mask: this.getMask(), msg: iNet.resources.ajaxLoading.deleting});
                  }
                }
              }
            },
            {
              text: iNet.resources.message.button.cancel,
              icon: 'icon-remove',
              fn: function () {
                this.hide();
              }
            }
          ]
        });
      }
      return confirmDeleteDialog;
    };

    $toolbar.CREATE.click(function () {
      this.fireEvent('create', this, me.nodeSelected);
    }.createDelegate(this));

    $toolbar.EDIT.click(function () {
      var __node = this.getTree().getSelected();
      if (!iNet.isEmpty(__node.uuid)) {
        this.fireEvent('edit', this,__node);
      }
    }.createDelegate(this));

    $toolbar.DELETE.click(function () {
      var __node = this.getTree().getSelected();
      if (!iNet.isEmpty(__node.uuid)) {
        var __dialog = createConfirmDeleteDialog();
        __dialog.setContent(String.format('Bạn có chắc chắn là đồng ý muốn xóa <b>{0}</b> ?', __node.name));
        __dialog.setData(__node);
        __dialog.show();
      }
    }.createDelegate(this));

    $toolbar.RELOAD.on('click', function () {
      this.getTree().load();
    }.createDelegate(this));


    $toolbar.ADD_USER.on('click', function () {
      if (!selectAccountCloudDlg) {
        selectAccountCloudDlg = new iNet.ui.dialog.SelectUserDialog({
          buttons: [
            {
              text: iNet.resources.message.button.ok,
              cls: 'btn-primary',
              icon: 'icon-ok icon-white',
              fn: function () {
                var __node = me.getTree().getSelected();
                var __members = __node.members || [];
                var __users = this.getData();
                for (var i = 0; i < __members.length; i++) { //keep old members
                  var __member = __members[i] || {};
                  if (__users.indexOf(__member.value) < 0) {
                    __users.push(__member.value);
                  }
                }
                delete __node['members'];
                delete __node['appointments'];
                delete __node['worktime'];
                delete __node['evaluation'];
                if (__users.length > 0) {
                  __node['users'] = __users.join(',');
                  $.postJSON(me.url.update, __node, function (result) {
                    me.getTree().load();
                    /*var __newnode = result || {};
                    var __childs = __newnode.members || [];
                    for (var j = 0; j < __childs.length; j++) {
                      var __child = __childs[j];
                      me.getTree().addNode({
                        uuid: MD5(__child.name + __newnode.uuid),
                        value: __child.name,
                        name: __child.value,
                        parentcode: __newnode.uuid,
                        user: true
                      });
                    }
                    */
                  });

                  this.hide();
                }
              }
            },
            {
              text: iNet.resources.message.button.cancel,
              icon: 'icon-remove',
              fn: function () {
                this.hide();
              }
            }
          ]
        });
      }
      selectAccountCloudDlg.show();
    }.createDelegate(this));


    $toolbar.PROSIGNED.on('click', function () {
      var __node = this.getTree().getSelected();
      this.fireEvent('prosignedlist', this,__node);
    }.createDelegate(this));

    $toolbar.ESB_REGISTER.on('click', function () {
      var me = this;
      var __html = '<div class="inline"><div class="pull-left"><i class="icon-exchange blue bigger-300"></i></div>';
      __html += '<div style="padding-left: 50px;"><span>Nếu kích hoạt liên thông thì ứng dụng sẽ cho phép gửi/nhận hồ sơ liên thông về đơn vị của bạn.<br></span> <b>Bạn có chắc chắn là đồng ý kích hoạt không </b> ?</div></div>'
      var dialog = this.confirmDialog("Kích hoạt liên thông", __html, function () {
        $.getJSON(iNet.getXUrl('onegate/dept/esbregister'), function (result) {
          var __result = result || {};
          dialog.hide();
          if (__result.type == 'ERROR') {
            me.showMessage('error', 'Kích hoạt liên thông', 'Có lỗi khi kích hoạt liên thông');
          } else {
            me.showMessage('success', 'Kích hoạt liên thông', 'Chế độ liên thông đã được kích hoạt thành công trong đơn vị của bạn !');
          }
        }, {mask: this.getMask(), msg: iNet.resources.ajaxLoading.acting});
      });
      dialog.show();
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.onegate.superadmin.OrganizeUsersWidget, iNet.ui.onegate.OnegateWidget, {
    getTree: function(){
      return this.tree;
    }
  });

  //~========================EXECUTE SERVICE========================
  var mainWidget= null, nodeNotify = null, departmentWidget = null,procedureSignedWidget = null;
  var iHistory = new iNet.ui.form.History();

  iHistory.on('back', function(widget){
   if(widget) {
     widget.show();
   }
  });
  var historyBack = function(){
    iHistory.back();
  };

  var createDepartmentWidget = function (parent) {
    if (!departmentWidget) {
      departmentWidget = new iNet.ui.onegate.superadmin.DepartmentWidget();
      departmentWidget.on('back', historyBack);
      departmentWidget.on('saved', function (isSave, data) {
        var __node = data || {};
        mainWidget = createMainWidget();
        if (isSave) {
          mainWidget.getTree().addNode(__node);
        } else {
          mainWidget.getTree().updateNode(__node);
        }
      });
    }
    if(parent) {
      departmentWidget.setParent(parent);
      parent.hide();
    }
    if(iHistory) {
      iHistory.push(departmentWidget);
    }
    departmentWidget.show();
    return departmentWidget;
  };

  var createProcedureSignedWidget = function (parent) {
    if (!procedureSignedWidget) {
      procedureSignedWidget = new iNet.ui.onegate.superadmin.ProcedureSignedWidget();
      procedureSignedWidget.on('back', historyBack);
    }
    if(parent) {
      procedureSignedWidget.setParent(parent);
      parent.hide();
    }
    if(iHistory) {
      iHistory.push(procedureSignedWidget);
    }
    procedureSignedWidget.show();
    return procedureSignedWidget;
  };

  var createMainWidget = function() {
    if(!mainWidget) {
      mainWidget = new iNet.ui.onegate.superadmin.OrganizeUsersWidget();
      mainWidget.on('create', function(wg, node) {
        var __node = node;
        departmentWidget = createDepartmentWidget(wg);
        departmentWidget.setParentNode(__node);
        departmentWidget.resetData();
      });
      mainWidget.on('edit', function (wg, node) {
        var __node = node || {};
        var __widget = createDepartmentWidget(wg);
        __widget.setData(__node);
      });

      mainWidget.on('prosignedlist', function(wg, node) {
        var __node = node || {};
        procedureSignedWidget = createProcedureSignedWidget(wg);
        procedureSignedWidget.setUnitName(__node.name);
        procedureSignedWidget.loadProcedureByOrgCode(__node.orgcode);
      });
    }
    return mainWidget;
  };

  var main = createMainWidget();
  iHistory.setRoot(main);

});

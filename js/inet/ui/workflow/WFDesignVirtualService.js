// #PACKAGE: admin-wf-design-virtual
// #MODULE: WorkflowDesignVirtualService
$(function () {
  iNet.ui.admin.WorkflowDesignVirtualService = function (config) {
    this.url = {
      updatePosition: iNet.getUrl('cloud/workflow/actor/update'),
      loadGraph: iNet.getUrl('cloud/workflow/visualdesign'),
      loadNode: iNet.getUrl('cloud/workflow/member/view'),
      updateNode: iNet.getUrl('cloud/workflow/member/update'),
      createNode: iNet.getUrl('cloud/workflow/member/create'),

      deleteMember: iNet.getUrl('cloud/workflow/member/delete'),
      arcCreate: iNet.getUrl('cloud/workflow/arc/create'),
      loadBusiness: iNet.getUrl('cloud/workflow/business'),
      arcDelete: iNet.getUrl('cloud/workflow/arc/delete'),

      assignActor: iNet.getUrl('cloud/workflow/actor/assign'),

      nodeInfoLoad: iNet.getUrl('onegate/wkfnode/view'),
      nodeInfoCreate: iNet.getUrl('onegate/wkfnode/create'),
      nodeInfoUpdate: iNet.getUrl('onegate/wkfnode/update'),
      nodeInfoDelete: iNet.getUrl('onegate/wkfnode/delete')
    };
    this.$id = $("#div-wf-detail");
    this.owner = {nodes: {},
      node: {},
      nodeInfo: {},
      nodeUI: {},
      arcs: {},
      conn: {},
      uuid: null,
      xform: {}};
    this.display = false;
    var __config = config || {};

    iNet.apply(this, __config);
    var self = this;
    var deleteIds = "";
    this.$element = this.$id;
    this.$elementNode = $("#wf-node-detail");
    this.$elementConn = $("#wf-connect-detail");
    this.$toolbar = {
      ADD: $('#btn-wf-detail-add'),
      BACK: $('#btn-wf-detail-back')
    };

    this.$action = {
      NODESAVE: $('#btn-wf-node-save'),
      NODEDEL: $('#btn-wf-node-del'),
      CONNSAVE: $('#btn-wf-connection-save'),
      CONNDEL: $('#btn-wf-connection-del')
    };

    this.$form = $("#frm-wf-detail");
    this.$title = $('#wf-detail-brief');
    var $input = {
      brief: $('#wf-detail-brief'),
      // form Node
      nodeName: $('#txt-node-name'),
      nodeType: $('#cbb-node-type'),
      nodeActor: $('#txt-node-task-actor'),
      nodeDate: $('#txt-node-time-date'),
      nodeHour: $('#cbb-node-time-hour'),
      nodeRecordResult: $('#txt-node-record-result'),
      nodeRecordInherited: 'rdo-inherited',
      nodeRecordType: 'rdo-record-type',
      nodeWorkstation: $('#cbb-node-workstation'),
      nodeInFolder: $('#cbb-node-infolder'),
      nodeInXform: $('#cbb-node-inxform'),
      nodeInQuery: $('#cbb-node-inquery'),
      nodeOutFolder: $('#cbb-node-outfolder'),

      // form Connection
      conName: $('#txt-connect-name')
    }

    $(".number").filter_input({
      regex: '[0-9]',
      events: 'keypress paste'
    });

    // validate ==================================
//    var vldNode = new iNet.ui.form.Validate({
//      id :  'frm-node-detail',
//      rules : [{
//        id : $input.nodeName.prop("id"),
//        validate : function(v) {
//          if (iNet.isEmpty(v))
//            return "Tên node xử lý không được để trống.";
//        }
//      }, /*{
//        id : $input.nodeActor.prop("id"),
//        validate : function(v) {
//          if (iNet.isEmpty(v))
//            return getText("Người xử lý không được để trống.");
//        }
//      },*/ {
//        id : $input.nodeDate.prop("id"),
//        validate : function(v) {
//          if (iNet.isEmpty(v))
//            return "Thời gian xử lý không được để trống.";
//        }
//      }]
//    });
    var getText = function (text) {
      if (!iNet.isEmpty(text)) {
        return iNet.resources.onegate.admin.procedure[text] || text;
      } else {
        return "";
      }
    };

    var initSelection = function (data, element, callback) {
      var __value = element.val() || "";
      var __data = {};
      if (!iNet.isEmpty(__value)) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].modelName == __value) {
            __data = data[i];
            break;
          }
        }
      }
      callback(__data);
    };

    this.virtual = new iNet.ui.admin.WorkflowVirtual({
      element: "statemachine-design",
      selector: ".statemachine-design .w"});
    // validate ==================================
    var validation = new iNet.ui.form.Validate({
      id: self.$form.prop("id"),
      rules: [
        {
          id: $input.brief.prop("id"),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return getText("procedure_code_not_empty");
          }
        }
      ]
    });

    this.validate = function () {
      return validation.check();
    };

    this.getNodeId = function (nodeName) {
      for (var key in self.owner.nodes) {
        var node = self.owner.nodes[key];
        if (node.nodeName == nodeName) {
          return key;
        }
      }
      return "";
    };
    // set Data =================================
    this.setData = function (data) {
      // build node
      self.owner.nodes = {};
      var __nodes = data.nodes || [];
      for (var i = 0; i < __nodes.length; i++) {
        var node = __nodes[i];
        self.virtual.addNode({id: node.uuid,
          name: node.nodeName,
          start: node.start,
          endway: node.endway,
          x: node.x,
          y: node.y
        });
        self.owner.nodes[node.uuid] = node;
      }

      if (__nodes.length > 0) {
        for (var i = 0; i < __nodes.length; i++) {
          var node = __nodes[i];
          self.virtual.moveNode(node.uuid, node.x, node.y);
        }
      }
      // build connection
      self.owner.arcs = {};
      var __arcs = data.arcs || [];
      for (var i = 0; i < __arcs.length; i++) {
        var arc = __arcs[i];
        var targetId = self.getNodeId(arc.arcTo);
        if (!iNet.isEmpty(targetId)) {
          self.virtual.connect(arc.taskActorUUID, self.getNodeId(arc.arcTo), arc.arcName, arc.uuid);
          self.owner.arcs[arc.uuid] = arc;
        }
      }
    };

    this.setNodeData = function (node) {
      $input.nodeName.val(node.nodeName);
      self.owner.node = node;
      if (node.start === true) {
        $input.nodeType.val("start");
      } else if (node.endway === true) {
        $input.nodeType.val("end");
      } else if (node.endway === false && node.start === false) {
        $input.nodeType.val("work");
      }

    };

    this.setNodeInfo = function (data) {
      self.owner.nodeInfo = data;
      var recordType = data.status || 'Y';
      $('input[name="' + $input.nodeRecordType + '"][value="' + recordType + '"]').prop('checked', true);

      var recordInherited = data.inherited || 'N';
      $('input[name="' + $input.nodeRecordInherited + '"][value="' + recordInherited + '"]').prop('checked', true);

      $input.nodeRecordResult.val(data.resolution || '');
      $input.nodeWorkstation.val(data.workstationID);
      $input.nodeInFolder.val(data.inFolder || '');
      $input.nodeInXform.val(data.inXform || '');
      $input.nodeInQuery.val(data.inQuery || '');
      $input.nodeOutFolder.val(data.outFolder || '');
      fnLoadXform(data.inFolder || "");
      if (!!data.time && data.time > 0) {
        var date = Math.floor(data.time / 8);
        var hour = data.time - (date * 8);
        $input.nodeDate.val(date);
        $input.nodeHour.val(hour);
      } else if (!data.time || data.time == 0) {
        $input.nodeDate.val(0);
        $input.nodeHour.val(0);
      }

      // set actor
      var actors = data.representatives || [];
      var arrActor = [];
      for (var i = 0; i < actors.length; i++) {
        arrActor.push({code: actors[i].actor});
      }

      self.cbbActor.setData(arrActor);
    };
    // load graph
    this.loadData = function (uuid) {
      $.postJSON(self.url.loadGraph, {graph: uuid}, function (result) {
        var __data = result || {};
        if (!iNet.isEmpty(__data.nodes)) {
          self.setData(__data);
          self.owner.uuid = uuid;
        } else {
          // load error
          self.showMessage('error', iNet.resources.message["note"], iNet.resources.message["save_error"]);
        }
      }, {
        mask: self.$element,
        msg: iNet.resources.ajaxLoading.saving
      });
    };

    this.reset = function () {
      this.owner = {nodes: {}, node: {}, nodeInfo: {}, arcs: {}, uuid: null};
      this.virtual.reset();

    };

    this.reload = function (uuid) {
      this.reset();
      this.loadData(uuid);
      this.$elementConn.hide();
      this.$elementNode.hide();
    }

    this.createNode = function () {
      var __dataNode = {
        graph: self.owner.uuid,
        name: $input.nodeName.val(),
        type: 'onegateprocess',
        joinParam: '',
        guard: '',

        workstationID: $input.nodeWorkstation.val(),
        status: $('input[name=' + $input.nodeRecordType + ']:checked').val() || 'Y',
        inherited: $('input[name=' + $input.nodeRecordInherited + ']:checked').val() || 'N',
        actors: $input.nodeActor.val(),
        resolution: $input.nodeRecordResult.val(),
        inFolder: $input.nodeInFolder.val(),
        inXform: $input.nodeInXform.val(),
        inQuery: $input.nodeInQuery.val(),
        outFolder: $input.nodeOutFolder.val()
      };

      var ui = self.owner.nodeUI;
      if (!!ui.task && ui.task == 'temp') {
        __dataNode.x = ui.x;
        __dataNode.y = ui.y;
      } else {
        __dataNode.x = 100;
        __dataNode.y = 100;
      }

      var time = $input.nodeDate.val();
      time = parseInt(time) * 8 + parseInt($input.nodeHour.val());
      __dataNode.time = time;

      var type = $input.nodeType.val();
      if (type == 'start') {
        __dataNode.start = true;
        __dataNode.endway = false;
      } else if (type == 'work') {
        __dataNode.start = false;
        __dataNode.endway = true;
      } else {
        __dataNode.start = false;
        __dataNode.endway = false;
      }

      $.postJSON(self.url.nodeInfoCreate, __dataNode, function (result) {
        var __result = result || {};
        if (!iNet.isEmpty(__result.graph)) {
          self.showMessage('success', iNet.resources.message["note"], getText("Node đã được tạo thành công"));
          self.reload(self.owner.uuid);
        } else {
          // save error
          self.showMessage('error', iNet.resources.message["note"], iNet.resources.message["save_error"]);
        }

      }, {
        mask: self.$element,
        msg: iNet.resources.ajaxLoading.saving
      });
    };

    this.updateNode = function () {
      var __dataAssign = {
        task: self.owner.node.uuid,
        actor: $input.nodeActor.val()
      };

      var __dataNode = {
        uuid: self.owner.nodeInfo.uuid,
        graph: self.owner.uuid,
        task: self.owner.node.uuid,
        taskID: self.owner.node.uuid,

        name: $input.nodeName.val(),
        workstationID: $input.nodeWorkstation.val(),
        status: $('input[name=' + $input.nodeRecordType + ']:checked').val() || 'Y',
        inherited: $('input[name=' + $input.nodeRecordInherited + ']:checked').val() || 'N',
        actors: $input.nodeActor.val(),
        resolution: $input.nodeRecordResult.val(),
        inFolder: $input.nodeInFolder.val(),
        inXform: $input.nodeInXform.val(),
        inQuery: $input.nodeInQuery.val(),
        outFolder: $input.nodeOutFolder.val()
      };

      var time = $input.nodeDate.val();
      time = parseInt(time) * 8 + parseInt($input.nodeHour.val());
      __dataNode.time = time;

      var type = $input.nodeType.val();
      if (type == 'start') {
        __dataNode.start = true;
        __dataNode.endway = false;
      } else if (type == 'work') {
        __dataNode.start = false;
        __dataNode.endway = true;
      } else {
        __dataNode.start = false;
        __dataNode.endway = false;
      }

      $.postJSON(self.url.nodeInfoUpdate, __dataNode, function (result) {
        var __result = result || {};
        if (!iNet.isEmpty(__result.graph)) {
          self.reload(self.owner.uuid);
          self.showMessage('success', iNet.resources.message["note"], getText("Node đã được cập nhật"));
        } else {
          // save error
          self.showMessage('error', iNet.resources.message["note"], iNet.resources.message["save_error"]);
        }
      }, {
        mask: self.$element,
        msg: iNet.resources.ajaxLoading.saving
      });

      $.postJSON(self.url.assignActor, __dataAssign, function (result) {
        var __result = result || {};
        if (!iNet.isEmpty(__result.uuid)) {
          self.showMessage('success', iNet.resources.message["note"], getText("Node đã được cập nhật"));
        } else {
          // save error
          self.showMessage('error', iNet.resources.message["note"], iNet.resources.message["save_error"]);
        }

      }, {
        mask: self.$element,
        msg: iNet.resources.ajaxLoading.saving
      });
    };
    // ACTION -----------------------------------------------
    this.$toolbar.BACK.click(function () {
      self.fireEvent("back");
    });

    this.$toolbar.ADD.click(function () {
      self.virtual.addNode({id: 'temp', name: "Node xử lý"});
    });

    this.$action.NODESAVE.click(function () {
      if (iNet.isEmpty($input.nodeName.val())) {
        $input.nodeName.focus();
        self.showMessage('error', iNet.resources.message["note"], 'Node xử lý không được để trống.');
        return;
      }

      if (iNet.isEmpty($input.nodeActor.val())) {
        $input.nodeActor.focus();
        self.showMessage('error', iNet.resources.message["note"], 'Người xử lý không được để trống.');
        return;
      }
      if (iNet.isEmpty($input.nodeDate.val())) {
        $input.nodeDate.focus();
        self.showMessage('error', iNet.resources.message["note"], 'Thời gian xử lý không được để trống.');
        return;
      }

      if (self.owner.node.uuid == 'temp') {
        self.createNode();
      } else {
        self.updateNode();
      }
    });

    this.$action.NODEDEL.click(function () {
      //TODO ask user before delete
      var __data = {
        task: self.owner.node.uuid,
        graph: self.owner.uuid
      };

      $.postJSON(self.url.nodeInfoDelete, __data, function (result) {
        var __result = result || {};
        if (!iNet.isEmpty(__result.uuid)) {
          self.virtual.removeNode(self.owner.node.uuid);
          self.reload(self.owner.uuid);
          self.showMessage('success', iNet.resources.message["note"], getText("Node đã được xóa"));
        } else {
          // save error
          self.showMessage('error', iNet.resources.message["note"], iNet.resources.message["del_error"]);
        }
      }, {
        mask: self.$element,
        msg: iNet.resources.ajaxLoading.deleting
      });
    });
    this.$action.CONNSAVE.click(function () {
      var label = $input.conName.val();
      if (iNet.isEmpty(label)) {
        $input.conName.focus();
        self.showMessage('error', iNet.resources.message["note"], 'Tên liên kết không được để trống.');
        return;
      }

      var conn = self.owner.conn;
      var __data = {
        from: conn.sourceId,
        to: conn.targetId,
        label: label,
        graph: self.owner.uuid
      };

      $.postJSON(self.url.arcCreate, __data, function (result) {
        var __result = result || {};
        if (!iNet.isEmpty(__result.uuid)) {
          self.reload(self.owner.uuid);
          self.showMessage('success', iNet.resources.message["note"], getText("Liên kết đã được tạo thành công"));
        } else {
          // save error
          self.showMessage('error', iNet.resources.message["note"], iNet.resources.message["save_error"]);
        }

      }, {
        mask: self.$element,
        msg: iNet.resources.ajaxLoading.saving
      });
    });
    this.$action.CONNDEL.click(function () {
      //TODO ask user before delete
      var __data = {
        from: self.owner.conn.sourceId,
        to: self.owner.conn.targetId,
        graph: self.owner.uuid
      };
      $.postJSON(self.url.arcDelete, __data, function (result) {
        var __result = result || {};
        if (!iNet.isEmpty(__result.uuid)) {
          self.virtual.detach(self.owner.conn);
          self.reload(self.owner.uuid);
          self.showMessage('success', iNet.resources.message["note"], getText("Liên kết đã được xóa"));
        } else {
          // save error
          self.showMessage('error', iNet.resources.message["note"], iNet.resources.message["del_error"]);
        }
      }, {
        mask: self.$element,
        msg: iNet.resources.ajaxLoading.deleting
      });
    });
    // EVENT -------------------------------------------------
    this.virtual.on('dragstop', function (ui) {
      var uuid = ui.helper.attr("id");
      var x = ui.position.left;
      var y = ui.position.top;
      var __data = {
        task: uuid,
        x: parseInt(x),
        y: parseInt(y)
      };
      self.owner.nodeUI = __data;
      if (uuid == 'temp') {
        return;
      }

      $.ajax({
        url: self.url.updatePosition,
        data: __data,
        type: "POST"
      });
    });

    this.virtual.on('connectionclick', function (connection) {
      var arc = self.owner.arcs[connection.uuid] || {};
      self.owner.conn = connection;
      $input.conName.val(arc.arcName);
      self.$elementNode.hide();
      self.$elementConn.show();
      if (iNet.isEmpty(wrc.uuid)) {
        FormUtils.disableButton(self.$action.CONNSAVE, false);
        $input.conName.prop("disabled", false);
      } else {
        FormUtils.disableButton(self.$action.CONNSAVE, true);
        $input.conName.prop("disabled", true);
      }
    });

    this.virtual.on('nodeclick', function (event, node) {
      var id = $(node).prop('id');
      self.$elementConn.hide();
      if (id === 'temp') {
        var temp = {
          uuid: 'temp',
          nodeName: "Node xử lý",
          start: false,
          endway: false
        };

        self.setNodeData(temp);
        self.$elementNode.show();
        return;
      }
      node = self.owner.nodes[id];

      if (!!node) {
        self.setNodeData(node);
        self.$elementNode.show();
      } else {
        self.showMessage('error', iNet.resources.message["note"], iNet.resources.message["save_error"]);
      }

      $.postJSON(self.url.nodeInfoLoad, {graph: self.owner.uuid, taskName: node.nodeName}, function (result) {
        var __data = result || {};
        if (!iNet.isEmpty(__data.uuid)) {
          self.setNodeInfo(__data);
        }
      }, {
        mask: self.$element,
        msg: iNet.resources.ajaxLoading.saving
      });
    });
    // init data--------------------------------------------------------------
    $.postJSON(iNet.getUrl("cloud/workflow/alias/list"), {}, function (result) {
      if (!!result && !!result.items) {
        self.cbbActor = new iNet.ui.form.select.Select({
          id: $input.nodeActor.prop("id"),
          idValue: function (item) {
            return item.code;
          },
          multiple: true,
          allowClear: true,
          data: function () {
            return {
              results: result.items,
              text: function (item) {
                return item.code;
              }};
          },
          formatSelection: function (object) {
            var __object = object || {};
            return String.format('<span>{0}</span>', __object.code);
          },
          initSelection: function (element, callback) {
            callback(element);
          },
          formatResult: function (object) {
            var __object = object || {};
            return String.format('<span><i class="icon-user"></i> {0}</span>', __object.code);
          }
        });
      }
    });
    $.postJSON(iNet.getUrl("onegate/unitwork/list"), {}, function (result) {
      if (!!result && !!result.items) {
        var __items = result.items , __item;
        for (var i = 0; i < __items.length; i++) {
          __item = __items[i];
          $input.nodeWorkstation.append(String.format('<option value="{0}">{1}</option>', __item.uuid, __item.name));
        }
      }
    });

    $.postJSON(iNet.getUrl("bucket/model/list"), {}, function (result) {
      if (!!result && !!result.items) {
        var __items = result.items , __item;
        for (var i = 0; i < __items.length; i++) {
          __item = __items[i];
          $input.nodeInFolder.append(String.format('<option value="{0}">{1}-{2}</option>', __item.uuid, __item.name, __item.brief));
          $input.nodeOutFolder.append(String.format('<option value="{0}">{1}-{2}</option>', __item.uuid, __item.name, __item.brief));
        }

        $input.nodeInFolder.change(function () {
          fnLoadXform($(this).val())
        });
      }
    });

    var fnLoadXform = function (folder) {
      $input.nodeInXform.empty();
      self.owner.xform = {};
      if (iNet.isEmpty(folder)) {
        return;
      }
      $.postJSON(iNet.getUrl("bucket/xform/list"), {folder: folder}, function (result) {
        if (!!result && !!result.items) {
          var __items = result.items , __item;
          for (var i = 0; i < __items.length; i++) {
            __item = __items[i];
            self.owner.xform[__item.uuid] = __item.subview;
            $input.nodeInXform.append(String.format('<option value="{0}">{1}</option>', __item.uuid, __item.subview));
          }
        }
      });
    };
    // init widget -------------------------------------------
    (function () {
      (self.display) ? self.show() : self.hide();
    }());
  };

  iNet.extend(iNet.ui.admin.WorkflowDesignVirtualService, iNet.ui.onegate.OnegateWidget, {
    addRow: function (data) {
      this.grid.insert(data);
    },
    updateRow: function (data) {
      this.grid.update(data)
    },
    setTitle: function (title) {
      this.$title.html(title);
    }
  });
});
// #PACKAGE: ionegate-admin-wf-design-virtual
// #MODULE: AdminWorkflowDesignVirtualService
$(function () {
  iNet.ns('iNet.ui.onegate.admin');
  iNet.ui.onegate.admin.WorkflowDesignVirtualService = function (config) {
    this.url = {
      updatePosition: iNet.getUrl('cloud/workflow/actor/update'),
      loadGraph: iNet.getXUrl('onegate/dept/wflvisualdesign'),
      loadNode: iNet.getXUrl('onegate/deptworkflow/nodeload'),
      updateNode: iNet.getXUrl('onegate/deptworkflow/nodeupdate'),
      createNode: iNet.getXUrl('onegate/deptworkflow/nodecreate'),
      deleteNode: iNet.getXUrl('onegate/deptworkflow/nodedelete'),

      arcCreate: iNet.getXUrl('onegate/deptworkflow/arccreate'),
      arcDelete: iNet.getXUrl('onegate/deptworkflow/arcdelete'),
      
      loadInfo: iNet.getUrl('onegate/wflprocedure/load')
    };
    this.$id = $("#div-wf-virtual");
    this.$divDesign = $("#statemachine-design");
    this.$divDetail = $("#statemachine-detail");
    this.owner = {nodes: {},
      node: {},
      nodeId: '',
      nodeInfo: {},
      nodeUI: {},
      arcs: {},
      conn: {},
      uuid: null,
      xform: {},
      procedure: {},
      hidden: [],
      tempBtn: false};
    this.display = false;
    var __config = config || {};

    iNet.apply(this, __config);
    var self = this;
    this.$element = this.$id;
    this.$elementNode = $("#wf-node-detail");
    this.$elementConn = $("#wf-connect-detail");
    this.$divNodeDetail = $("#div-node-detail");
    this.$infoContainer = $("#workflow-procedure-info-container")
    this.$btnResize = $('#workflow-design-resize');
    this.$btnCollapse = $('#workflow-design-collapse');
    this.$toolbar = {
      ADD: $('#btn-wf-virtual-add'),
      BACK: $('#btn-wf-virtual-back')
    };

    this.$action = {
      NODESAVE: $('#btn-wf-node-save'),
      NODEDEL: $('#btn-wf-node-del'),
      CONNSAVE: $('#btn-wf-connection-save'),
      CONNDEL: $('#btn-wf-connection-del')
    };

    this.$form = $("#frm-wf-virtual");
    var $input = {
      // form info
      subject: $('#txt-procedure-subject'),
      industry: $('#txt-procedure-industry'),
      hourDate: $('#txt-procedure-date'),
      hourMinute: $('#cbb-procedure-minute'),
      
      
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
      nodeInXform: $('#cbb-node-inxform'),
      // form Connection
      conName: $('#txt-connect-name')
    };

    $(".number").filter_input({
      regex: '[0-9]',
      events: 'keypress paste'
    });
    
    this.$btnResize.on('click', function(){
      var $icon= $(this).find('i');
      if(self.$infoContainer.is(':hidden')) {
        $icon.attr('class', 'icon-resize-full');
        self.$infoContainer.show();
      } else {
        self.$infoContainer.hide();
        $icon.attr('class', 'icon-resize-small');
      }
    });
    
    this.$btnCollapse.on('click', function(){
      var $icon= $(this).find('i');
      if(self.$divDetail.is(':hidden')) {
        self.$divDesign.removeClass('col-sm-12');
        self.$divDesign.addClass('col-sm-9');
        
        self.$divDetail.show();
      } else {
        self.$divDetail.hide();
        self.$divDesign.removeClass('col-sm-9');
        self.$divDesign.addClass('col-sm-12');
        
        self.$divDetail.hide();
      }
    });

    var getText = function (text) {
      if (!iNet.isEmpty(text)) {
        return iNet.resources.onegate.admin.procedure[text] || text;
      } else {
        return "";
      }
    };

    this.virtual = new iNet.ui.admin.WorkflowVirtual({
      element: "statemachine-design",
      selector: ".statemachine-design .w"
    });

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
      $input.nodeName.prop("readonly", false);
      $input.nodeName.val(node.nodeName);
      self.owner.node = node;
      if (!!node.start) {
        $input.nodeType.val("start");
      }else {
        $input.nodeType.val("work");
      }

      self.cbbActor.setData([]);
      $input.nodeHour.val(0);
      $input.nodeDate.val(0);

      for (var i = 0; i < this.owner.hidden.length; i++) {
        item = this.owner.hidden[i];
        $('#txt-custom-' + item.variable).val("");
      }
    };

    this.setNodeInfo = function (data) {
      self.owner.nodeInfo = data;
      $input.nodeName.prop("readonly", false);
      $input.nodeName.val(data.nodeName);
      var recordType = data.status || 'Y';
      $('input[name="' + $input.nodeRecordType + '"][value="' + recordType + '"]').prop('checked', true);

      var recordInherited = data.inherited || 'N';
      $('input[name="' + $input.nodeRecordInherited + '"][value="' + recordInherited + '"]').prop('checked', true);

      // set actor
      var actors = data.actors || [];
      var arrActor = [];
      for (var i = 0; i < actors.length; i++) {
        arrActor.push({code: actors[i]});
      }

      self.cbbActor.setData(arrActor);
      
      if (!!data.start) {
        $input.nodeType.val("start");
      } else {
        $input.nodeType.val("work");
      }
      
      var item = "", value = "";
      var attributes = data.attributes || {};
      for (var i = 0; i < this.owner.hidden.length; i++) {
        item = this.owner.hidden[i];
        if (item.type == 'TEXTFIELD') {
          $('#txt-custom-' + item.variable).val(attributes[item.variable] || "");
        } else if (item.type == 'CHECKBOX') {
          value = attributes[item.variable] || "N";
          $('input[name="rdo-custom-' + item.variable + '"][value="' + value + '"]').prop('checked', true);
        } else if (item.type == 'DATETIME') {
          value = attributes[item.variable] || new Date().getTime();
          var date = new Date(parseInt(value));
          $('#txt-custom-' + item.variable).data("DateTimePicker").setDate(date.format('d/m/Y H:s'));
        }
      }

      var time = attributes.hour || 0;

      if (time > 0) {
        var date = Math.floor(time / 8);
        var hour = time - (date * 8);
        $input.nodeDate.val(date);
        $input.nodeHour.val(hour);
      } else {
        $input.nodeDate.val(0);
        $input.nodeHour.val(0);
      }

      var xform = attributes.xform || "";
      $input.nodeInXform.val(xform);
    };
    // load graph
    this.loadGraph = function (uuid) {
      $.postJSON(self.url.loadGraph, {procedure: uuid}, function (result) {
        var __data = result || {};
        if (!iNet.isEmpty(__data.graph)) {
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
    
    this.loadInfo = function(procedureID){
      $.getJSON(this.url.loadInfo, {procedure: procedureID}, function(result){
        var __result = result || {};
        if(!iNet.isEmpty(__result.uuid)) {
          $input.subject.val(__result.subject);
          $input.industry.val(__result.industry);

          if(__result.hours > 0){
            var date = Math.floor(__result.hours / 8 );
            var hour = __result.hours - (date * 8);
            $input.hourDate.val(date);
            $input.hourMinute.val(hour);
          }else if(!__result.hours || __result.hours == 0){
            $input.hourDate.val(0);
            $input.hourMinute.val(0);
          }
        }
      },{
        mask : this.$elementNode,
        msg : iNet.resources.ajaxLoading.loading
      });
    }
    
    this.visibleButton = function(){
      if(this.isEditable()){
        this.$toolbar.ADD.show();
        this.$action.NODESAVE.show();
        this.$action.NODEDEL.show();
        this.$action.CONNDEL.show();
        this.$action.CONNSAVE.show();
      }else{
        this.$toolbar.ADD.hide();
        this.$action.NODESAVE.hide();
        this.$action.NODEDEL.hide();
        this.$action.CONNDEL.hide();
        this.$action.CONNSAVE.hide();
      }
    }

    this.resetDataDesign = function () {
      this.owner = iNet.apply(this.owner, {nodes: {}, node: {}, nodeInfo: {}, arcs: {}, uuid: null, nodeId: ''});
      this.virtual.reset();
      this.$elementConn.hide();
      this.$elementNode.hide();
    };
    
    this.resetDataInfo = function () {
      $input.subject.val('');
      $input.industry.val('');
      $input.hourDate.val('0');
      $input.hourMinute.val('0');
    };

    this.reload = function (uuid) {
      this.resetDataDesign();
      this.loadGraph(uuid);
    }

    this.createNode = function () {
      var __dataNode = {
        procedure: this.owner.procedure.procedureID,
        zone: this.owner.procedure.code,

        graph: self.owner.uuid,
        name: $input.nodeName.val(),
        joinParam: '',
        guard: '',
        type: 'onegateprocess',
        actor: $input.nodeActor.val()
      };

      var ui = self.owner.nodeUI;
      if (!!ui.task && ui.task == 'temp') {
        __dataNode.x = ui.x;
        __dataNode.y = ui.y;
      } else {
        __dataNode.x = 100;
        __dataNode.y = 100;
      }

      var type = $input.nodeType.val();
      if (type == 'start') {
        __dataNode.start = true;
        __dataNode.endway = false;
      } else if (type == 'work') {
        __dataNode.start = false;
        __dataNode.endway = false;
      }

      var time = $input.nodeDate.val();
      time = parseInt(time) * 8 + parseInt($input.nodeHour.val());
      __dataNode._hour = time;

      __dataNode._xform = $input.nodeInXform.val();
      var item = "";
      for (var i = 0; i < this.owner.hidden.length; i++) {
        item = this.owner.hidden[i];
        if (item.type == 'TEXTFIELD') {
          __dataNode["_" + item.variable] = $('#txt-custom-' + item.variable).val();
        } else if (item.type == 'CHECKBOX') {
          __dataNode["_" + item.variable] = $('input[name=rdo-custom-' + item.variable + ']:checked').val() || 'Y';
        } else if (item.type == 'DATETIME') {
          var date = $('#txt-custom-' + item.variable).data("DateTimePicker").getDate();
          __dataNode["_" + item.variable] = date.toDate().getTime();
        }
      }

      $.postJSON(self.url.createNode, __dataNode, function (result) {
        var __result = result || {};
        if (!iNet.isEmpty(__result.uuid)) {
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
    }

    this.updateNode = function () {
      var __dataNode = {
        procedure: this.owner.procedure.procedureID,
        zone: this.owner.procedure.code,

        task: self.owner.nodeInfo.uuid,

        graph: self.owner.uuid,
        graphID: self.owner.uuid,
        type: 'onegateprocess',
        joinParam: '',
        guard: '',

        actor: $input.nodeActor.val()
      };

      var time = $input.nodeDate.val();
      time = parseInt(time) * 8 + parseInt($input.nodeHour.val());
      __dataNode._hour = time;

      __dataNode._xform = $input.nodeInXform.val();

      var type = $input.nodeType.val();
      if (type == 'start') {
        __dataNode.start = true;
        __dataNode.endway = false;
      } else if (type == 'work') {
        __dataNode.start = false;
        __dataNode.endway = false;
      }

      var item = "";
      for (var i = 0; i < this.owner.hidden.length; i++) {
        item = this.owner.hidden[i];
        if (item.type == 'TEXTFIELD') {
          __dataNode["_" + item.variable] = $('#txt-custom-' + item.variable).val();
        } else if (item.type == 'CHECKBOX') {
          __dataNode["_" + item.variable] = $('input[name=rdo-custom-' + item.variable + ']:checked').val() || 'Y';
        } else if (item.type == 'DATETIME') {
          var date = $('#txt-custom-' + item.variable).data("DateTimePicker").getDate();
          __dataNode["_" + item.variable] = date.toDate().getTime();
        }
      }

      $.postJSON(self.url.updateNode, __dataNode, function (result) {
        var __result = result || {};
        if (!iNet.isEmpty(__result.uuid)) {
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
    }
    // ACTION -----------------------------------------------
    this.$toolbar.BACK.click(function () {
      self.fireEvent("back");
    });

    this.$toolbar.ADD.click(function () {
      if(!this.owner.tempBtn){
        self.virtual.addNode({id: 'temp', name: "Node xử lý"});
      }
      this.owner.tempBtn = true;
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

      if (self.owner.node.uuid == 'temp') {
        // TODO: check node duplicate
        //alert('Tên công việc đã tồn tại');
        self.createNode();
      } else {
        self.updateNode();
      }
    });

    this.$action.NODEDEL.click(function () {
      if (self.owner.node.uuid == 'temp') {
        self.virtual.removeNode(self.owner.node.uuid);
        self.$elementNode.hide();
        return;
      }
      //TODO ask user before delete
      var __data = {
        task: self.owner.nodeInfo.uuid,
        graph: self.owner.uuid,
        procedure: self.owner.procedure.procedureID,
        zone: self.owner.procedure.code
      };

      $.postJSON(self.url.delNode, __data, function (result) {
        var __result = result || {};
        if (!iNet.isEmpty(__result.uuid)) {
          self.virtual.removeNode(self.owner.nodeInfo.uuid);
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
        graph: self.owner.uuid,
        zone: self.owner.procedure.code,
        procedure: self.owner.procedure.procedureID
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
      if (iNet.isEmpty(self.owner.conn.uuid)) {
        self.virtual.detach(self.owner.conn);
        return;
      }
      var __data = {
        from: self.owner.conn.sourceId,
        to: self.owner.conn.targetId,
        graph: self.owner.uuid,
        zone: self.owner.procedure.code,
        procedure: self.owner.procedure.procedureID
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
    
    this.loadNode = function(graphID,procedureID, zone, task ){
      $.postJSON(self.url.loadNode, {graph: graphID,
        procedure: procedureID,
        zone: zone,
        task: task
      }, function (result) {
        var __data = result || {};
        if (!iNet.isEmpty(__data.uuid)) {
          self.setNodeInfo(__data);
        }
      }, {
        mask: self.$element,
        msg: iNet.resources.ajaxLoading.saving
      });
    };
    // EVENT -------------------------------------------------
    this.virtual.on('dragstop', function (ui) {
      if(!self.isEditable()){
        return;
      }
      
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
      self.owner.nodeId = '';
      var arc = self.owner.arcs[connection.uuid] || {};
      self.owner.conn = connection;
      $input.conName.val(arc.arcName);
      self.$elementNode.hide();
      self.$elementConn.show();

      if (iNet.isEmpty(connection.uuid)) {
        FormUtils.disableButton(self.$action.CONNSAVE, false);
        $input.conName.prop("readonly", false);
      } else {
        FormUtils.disableButton(self.$action.CONNSAVE, true);
        $input.conName.prop("readonly", true);
      }
    });
    this.virtual.on('nodeclick', function (event, node) {
      var id = $(node).prop('id');
      if (self.owner.nodeId == id) {
        return;
      }

      self.owner.nodeId = id;
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

      var node = self.owner.nodes[id];

      if (!!node) {
        //self.setNodeData(node);
        self.$elementNode.show();
      } else {
        self.showMessage('error', iNet.resources.message["note"], iNet.resources.message["save_error"]);
      }
      
      self.loadNode(self.owner.uuid, self.owner.procedure.procedureID, 
                    self.owner.procedure.code, node.uuid);
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
    $.postJSON(iNet.getUrl("onegate/nodeattr/list"), {}, function (result) {
      var tplTextfield = '<div class="form-group">' +
        '<label for="txt-custom-{0}" class="control-label">{1}: </label>' +
        '<input type="text" class="form-control" id="txt-custom-{2}"></div>';
      var tplDatetime = '<div class="form-group">' +
        '<label for="txt-custom-{0}" class="control-label">{1}: </label>' +
        '<div class="input-group date" id="txt-custom-{2}" data-date-format="DD/MM/YYYY HH:mm">' +
        '<input type="text" class="form-control" style="margin-bottom: 0 !important;" />' +
        '<span class="input-group-addon"><span class="icon-calendar"></span>' +
        '</span>' +
        '</div>' +
        '</div>';

      var tplCheckbox = '<div class="form-group">' +
        '<label for="rdo-custom-{0}" class="control-label">{1}: </label>' +
        '<div class="">' +
        '<label class="radio-inline">' +
        '<input type="radio" value="Y" name="rdo-custom-{2}"> Có' +
        '</label>' +
        '<label class="radio-inline">' +
        '<input type="radio" value="N" name="rdo-custom-{3}"> Không' +
        '</label>' +
        '</div>' +
        '</div>';
      if (!!result && !!result.items) {
        var __items = result.items || [] , __item;
        self.owner.hidden = __items;
        for (var i = 0; i < __items.length; i++) {
          __item = __items[i];
          if (__item.type == 'TEXTFIELD') {
            self.$divNodeDetail.append(String.format(tplTextfield, __item.variable, __item.name, __item.variable));
          } else if (__item.type == 'CHECKBOX') {
            self.$divNodeDetail.append(String.format(tplCheckbox, __item.variable, __item.name, __item.variable, __item.variable));
          } else if (__item.type == 'DATETIME') {
            self.$divNodeDetail.append(String.format(tplDatetime, __item.variable, __item.name, __item.variable));
            $('#txt-custom-' + __item.variable).datetimepicker({
              icons: {
                time: 'icon-time',
                date: 'icon-calendar',
                up: 'icon-chevron-up',
                down: 'icon-chevron-down'
              }
            });
          }
        }
      }
    });
    $.postJSON(iNet.getUrl("bucket/xform/list"), {}, function (result) {
      if (!!result && !!result.items) {
        var __items = result.items , __item;
        for (var i = 0; i < __items.length; i++) {
          __item = __items[i];
          self.owner.xform[__item.uuid] = __item.subview;
          $input.nodeInXform.append(String.format('<option value="{0}">{1}-{2}</option>', __item.uuid, __item.modelName, __item.subview));
        }
      }
    });
    // init widget -------------------------------------------
    (function () {
      (self.display) ? self.show() : self.hide();
    }());
  };

  iNet.extend(iNet.ui.onegate.admin.WorkflowDesignVirtualService, iNet.ui.onegate.OnegateWidget, {
    view: function (data) {
      this.owner.procedure = data;
      this.resetDataDesign();
      this.resetDataInfo();
      this.visibleButton();
      this.loadGraph(data.procedureID);
      this.loadInfo(data.procedureID);
    },
    
    isEditable: function(){
      return this.owner.procedure.editable;
    }
  });
});
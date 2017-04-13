// #PACKAGE: admin-wf-virtual
// #MODULE: WorkflowVirtual
$(function () {
  iNet.ui.admin.WorkflowVirtual = function (config) {
    var __defConfig = {
      element: "statemachine-design",
      selector: ".statemachine-design .w"
    };
    var __config = config || __defConfig;

    iNet.apply(this, __config);
    var self = this;
    this.$element = $("#" + this.element);
    this.label = '';
    this.data = {connections: []};
    this.template = {
      node: '<div class="w" id="{0}" style="left: {2}px; top: {3}px;">{1}<div class="ep"></div></div>',
      end: '<div class="w" id="{0}" style="left: 482px; top: 229px;">{1}</div>',
      begin: '<div class="w" id="{0}" style="left: 482px; top: 229px;">{1}<div class="ep"></div></div>'
    };
    // setup some defaults for jsPlumb. 
    this.instance = jsPlumb.getInstance({
      Endpoint: ["Dot", {radius: 2}],
      HoverPaintStyle: {strokeStyle: "#1e8151", lineWidth: 2 },
      ConnectionOverlays: [
        [ "Arrow",
          {
            location: 1,
            id: "arrow",
            length: 14,
            foldback: 0.8
          }],
        [ "Label", { label: "Connections", id: "label", cssClass: "aLabel" }]
      ],
      Container: this.element
    });

    this.windows = jsPlumb.getSelector(this.selector);

    // initialise draggable elements.  
    this.instance.draggable(this.windows);

    // bind a click listener to each connection; the connection is deleted. you could of course
    // just do this: jsPlumb.bind("click", jsPlumb.detach), but I wanted to make it clear what was
    // happening.
    // Event -------------------------------------------------------------------------------------
    this.instance.bind("click", function (c) {
      var source = c.sourceId, target = c.targetId;
      var conns = self.data.connections;
      for (var i = 0; i < conns.length; i++) {
        if (source == conns[i].source && target == conns[i].target) {
          c.uuid = conns[i].uuid;
          break;
        }
      }
      self.fireEvent('connectionclick', c);
    });

    this.instance.bind("endpointClick", function (endpoint, originalEvent) {
      self.fireEvent('endpointclick', endpoint, originalEvent);
    });
    // bind a connection listener. note that the parameter passed to this function contains more than
    // just the new connection - see the documentation for a full list of what is included in 'info'.
    // this listener sets the connection's internal
    // id as the label overlay's text.
    this.instance.bind("connection", function (info) {
      //info.connection.getOverlay("label").setLabel(self.label);
    });

    this.$element.on('click', 'div.w', function (event) {
      self.fireEvent('nodeclick', event, this);
    });
    this.draggable = function (selector) {
      self.instance.draggable(selector);
      selector.on('dragstop', function (event, ui) {
        self.fireEvent('dragstop', ui);
      });
    };

    this.makeSource = function (selector) {
      self.instance.makeSource(selector, {
        filter: ".ep",// only supported by jquery
        anchor: "Continuous",
        connector: ["Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }],
        connectorStyle: { strokeStyle: "#5c96bc",
          lineWidth: 3,
          outlineColor: "transparent",
          outlineWidth: 4 },
        maxConnections: 10,
        onMaxConnections: function (info, e) {
          alert("Maximum connections (" + info.maxConnections + ") reached");
        }
      });
    };

    this.makeTarget = function (selector) {
      self.instance.makeTarget(selector, {
        dropOptions: { hoverClass: "dragHover" },
        anchor: "Continuous"
      });
    };
  };

  iNet.extend(iNet.ui.admin.WorkflowVirtual, iNet.Component, {
    /**
     *  String id
     *  boolean start
     *  boolean endway
     *  String name
     */
    addNode: function (data) {
      var __template = this.template.node;
      if (data.start == true) {
        __template = this.template.begin;
      }
      /*else if(data.endway == true){
       __template = this.template.end;
       }*/
      this.$element.append(String.format(__template,
        data.id,
        data.name,
        data.x,
        data.y));
      var $selector = $("#" + data.id);
      this.draggable($selector);

      if (data.start == true) { // start node
        this.makeSource($selector);
//      }else if(data.endway == true){//end node
//        this.makeTarget($selector);
      } else {
        this.makeSource($selector);
        this.makeTarget($selector);
      }
    },
    removeNode: function (id) {
      var $selector = $("#" + id);
      this.instance.detachAllConnections($selector);
      this.instance.unmakeSource($selector);
      $selector.remove();
    },

    moveNode: function (id, x, y) {
      $.getCmp(id).css({left: x, top: y});
    },
    connect: function (idSource, idTarget, label, uuid) {
      //this.label = label;
      var connect = this.instance.connect({ source: idSource, target: idTarget});
      connect.getOverlay("label").setLabel(label);
      this.data.connections.push({uuid: uuid,
        source: idSource,
        target: idTarget});
    },
    detach: function (connection) {
      this.instance.detach(connection);
    },
    reset: function () {
      this.data.connections = [];
      jsPlumb.reset();
      this.$element.empty();
    }
  });
});
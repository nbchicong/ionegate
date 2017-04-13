// #PACKAGE: ionegate-superadmin-organize-users
// #MODULE: OrganizeTree
$(function () {
  iNet.ns("iNet.ui.tree","iNet.ui.superadmin.OrganizationTree");
  iNet.ui.tree.DataSourceTree = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);
    this.idProperty = !iNet.isEmpty(this.idProperty) ? this.idProperty : 'id';
    this.childrenProperty = !iNet.isEmpty(this.childrenProperty) ? this.childrenProperty : 'members';

    var root = [];
    for (var i = 0; i < this.data.length; i++) {
      var __node = this.data[i] || {};
      var __id = __node[this.idProperty];
      if (!iNet.isEmpty(__id)) {
        var __childs = __node[this.childrenProperty] || [];
        var __childrens = [];
        for(var j=0;j<__childs.length;j++) {
          var __child = __childs[j];
          __childrens.push({
            uuid: MD5(__child.name + __node.uuid),
            value: __child.name,
            name: __child.value,
            parentcode: __node.uuid,
            user: true
          });
        }
        __node[this.childrenProperty]= __childrens;
        root.push(__node);
      }
    }
    /*
    root.sort(function (a, b) {
      var orgCode = a.orgcode, parentCode = a.parentcode;
      return (orgCode != parentCode) ? 1 : ((orgCode==parentCode) ? -1 : 0);
    });
    */
    return root;
  };

  iNet.ui.superadmin.OrganizationTree = function (config) {
    config = config || {};
    this.prefix = (config.prefix) ? config.prefix : config.id;
    iNet.apply(this, config);
    this.prefix = (this.prefix) ? (this.prefix + '-') : '';
    this.$id = $(String.format("#{0}", this.id));
    this.treeId = iNet.generateId();
    this.$id.html(String.format('<table id="{0}" class="table table-bordered" style="margin-top:0"><tbody></tbody></table>', this.treeId));
    this.$element = $(String.format("#{0}", this.treeId));
    this.firstLoad = iNet.isEmpty(this.firstLoad) ? true : this.firstLoad;
    this.idProperty = !iNet.isEmpty(this.idProperty) ? this.idProperty : 'id';
    this.parentProperty = !iNet.isEmpty(this.parentProperty) ? this.parentProperty : 'parent';
    this.childrenProperty = !iNet.isEmpty(this.childrenProperty) ? this.childrenProperty : 'members';

    var that = this;

    this.load = function () {
      $.getJSON(this.url, function (result) {
        var __result = result || {};
        that.setDataSource(new iNet.ui.tree.DataSourceTree({
          data: !iNet.isEmpty(__result.items) ? __result.items || [] : [__result],
          idProperty: that.getIdProperty(),
          childrenProperty: that.getChildrenProperty()
        }));
        that.store = that.getDataSource();
        that.initComponent(that.getDataSource());
      }, {mask: that.getBody(), msg: iNet.resources.ajaxLoading.loading});
    }.createDelegate(this);

    //~~============EVENTS ====================
    this.getBody().on('click', 'tr', function () {
      var $row = $.getCmp($(this).prop('id'));
      var selected = $row.hasClass('selected');
      var __id = $row.prop('id');
      var __data = that.getById(__id);
      if (selected) {
        that.getBody().find('tr.selected').removeClass('selected');
        that.fireEvent('selectionchange', __data, false);
      } else {
        that.getBody().find('tr.selected').removeClass('selected');
        $row.addClass('selected');
        that.fireEvent('selectionchange', __data, true);
      }
    });

    if (this.firstLoad) {
      this.load();//first load
    }
  };

  iNet.extend(iNet.ui.superadmin.OrganizationTree, iNet.Component, {
    startDragDrop: function () { //Drag & Drop
      var me = this;
      this.getEl().find('.alias,.group,.dept').draggable({
        helper: "clone",
        opacity: .75,
        refreshPositions: true,
        revert: "invalid",
        revertDuration: 300,
        scroll: true
      });

      this.getBody().find('.dept,.unit').each(function () {
        $(this).parents("tr").droppable({
          accept: ".alias,.group,.dept",
          drop: function (e, ui) {
            var droppedEl = ui.draggable.parents("tr");
            me.fireEvent('move', droppedEl.data("ttId"), $(this).data("ttId"));
            //me.getEl().treetable("move", droppedEl.data("ttId"), $(this).data("ttId"));
          },
          hoverClass: "accept",
          over: function (e, ui) {
            var droppedEl = ui.draggable.parents("tr");
            if (this != droppedEl[0] && !$(this).is(".expanded")) {
              me.getEl().treetable("expandNode", $(this).data("ttId"));
            }
          }
        });
      });
    },
    getMask: function () {
      return this.getBody();
    },
    getStore: function(){
      return this.store || [];
    },
    getEl: function () {
      return this.$element;
    },
    setDataSource: function (datasource) {
      this.dataSource = datasource;
    },
    getDataSource: function () {
      return this.dataSource;
    },
    getSelected: function () {
      var me = this;
      var __data = {};
      this.getBody().find('tr.selected').each(function () {
        var __id = $($(this).get(0)).prop('id');
        if ($(this).hasClass("selected")) {
          __data = me.getById(__id);
        }
      });
      return __data;
    },
    createRowElement: function (arr, items, nodes, prev) {
      for (var i = 0; i < items.length; i++) {
        var __data = items[i];
        if (prev > -1) {
          if (prev == __data.level) {
            arr[__data.level] = arr[__data.level] + 1;
          } else {
            arr[__data.level] = 1;
          }
        }
        prev = __data.level;
        nodes.push(this.createHTMLNode(__data));
        var __childs = __data[this.getChildrenProperty()] || [];
        if (__childs.length > 0) {
          this.createRowElement(arr, __childs, nodes, prev);
        }
      }
      return nodes;
    },
    initComponent: function (nodes) {
      var __nodes = nodes || [];
      var __rows = [];
      var __prev = -1;
      var __arr = [];
      this.getEl().treetable('destroy');
      this.getBody().empty();
      if (__nodes.length > 0) {
        __arr[0] = 1;
        __rows = this.createRowElement(__arr, __nodes, __rows, __prev);
      }

      this.getBody().html(__rows.join(''));
      this.getEl().treetable({
        expandable: true
      });
      this.fillNodes(this.getDataSource());
      this.fireEvent('selectionchange', {}, false);
      //this.startDragDrop();
    },
    updateIcon: function (id, force) {
      var $row = this.getBody().find(String.format('#{0}', id));
      var isChild = (this.getBody().find(String.format('[data-tt-parent-id="{0}"]', id)).length > 0) || force;
      if ($row.length > 0) {
        if (isChild) {
          $row.find('td').find('span.indenter').html('<a href="javascript:;" title="Collapse">&nbsp;</a>');
        } else {
          $row.find('td').find('span.indenter').find('a').remove();
        }
        this.revealNode(id);
      }
    },
    getIcon: function(data) {
      var __data = data || {};
      if(__data[this.getParentProperty()]==__data.orgcode) {
        return 'unit';
      } else if(__data.user){
        return 'alias';
      }
      return 'dept';
    },
    createHTMLNode: function (data) {
      var __data = data || {};
      var __parent = !iNet.isEmpty(__data[this.getParentProperty()]) ? String.format("data-tt-parent-id= '{0}'", __data[this.getParentProperty()]) : "";
      var __html = String.format("<tr data-tt-id='{0}' id='{0}' {1} title='{2}'>", __data[this.getIdProperty()], __parent, __data.name);
      __html += String.format("<td><span class='{0}'>{1}</span></td>", this.getIcon(__data), __data.name);
      __html += String.format("<td style='width:20px'>{0}</td>", __data.order || '');
      __html += String.format("<td style='width:16px'><i class='{0}' title='Cho phép liên thông'></i></td>", !iNet.isEmpty(__data.restAPIkey) ? 'icon-exchange': '');
      __html += "</tr>";
      return __html;
    },
    updateHtmlNode: function (data) {
      var __data = data || {};
      var $row = this.getBody().find(String.format('#{0}', __data[this.getIdProperty()]));
      $row.attr('title', __data.name);
      $row.find('td:eq(0)').find('span:last').text(__data.name);
      return $row;
    },
    updateNodeData: function (data) {
      var __data = data || {};
      this.getBody().find(String.format('#{0}', __data[this.getIdProperty()])).data('dataNode', __data);
    },
    addNode: function (data) {
      if (this.getBody().find('tr[data-display="empty"]').length > 0) { //not exist row
        this.getBody().empty();
      }
      var __data = data || {};
      var __node = this.getNodeById(__data[this.getIdProperty()]) || {};
      if(!iNet.isEmpty(__node.id)) {
        return;
      }
      var $el = this.getEl();
      var __parentId = __data[this.getParentProperty()];
      var __parentNode = this.getNodeById(__parentId);
      $el.treetable('loadBranch', __parentNode, this.createHTMLNode(__data));
      this.updateNodeData(__data);
      this.store.push(__data);

      if (!iNet.isEmpty(__parentId) && __parentNode) {
        this.updateIcon(__parentId);
        __parentNode.render();
        $el.treetable('expandNode', __parentId);
      }
    },
    getNodeById: function (id) {
      return this.getEl().treetable('node', id);
    },
    getIdProperty: function(){
      return this.idProperty;
    },
    getParentProperty: function(){
      return this.parentProperty;
    },
    getChildrenProperty: function(){
      return this.childrenProperty;
    },
    updateNode: function (data) {
      var __data = data || {};
      var __parentId = !iNet.isEmpty(__data[this.getParentProperty()]) ? __data[this.getParentProperty()] : null;
      var __oldNode = this.getById(__data[this.getIdProperty()]);
      if (__oldNode[this.getParentProperty()] != __parentId) {
        this.moveNode(__data[this.getIdProperty()], __parentId);
        if (!iNet.isEmpty(__parentId)) {
          this.revealNode(__parentId);
          this.updateIcon(__parentId, true);
        }
      }
      this.updateHtmlNode(__data);
      this.updateNodeData(__data);
    },
    revealNode: function (nodeId) {
      if (!iNet.isEmpty(nodeId)) {
        this.getEl().treetable('reveal', nodeId);
      }
    },
    moveNode: function (nodeId, parentId) {
      if (!iNet.isEmpty(nodeId) && !iNet.isEmpty(parentId)) {
        this.getEl().treetable('move', nodeId, parentId);
      }
    },
    removeNode: function (id) {
      this.getEl().treetable('removeNode', id);
      this.fireEvent('selectionchange', {}, false);
      this.checkEmpty();
    },
    fillNodes: function (nodes) {
      var __nodes = nodes || [];
      for (var i = 0; i < __nodes.length; i++) {
        var __item = __nodes[i];
        this.updateNodeData(__item);
        var __childs = __item[this.getChildrenProperty()] || [];
        if (__childs.length > 0) {
          this.fillNodes(__childs);
        }
      }
      this.checkEmpty();
      this.expandAll();
    },
    expandAll: function () {
      this.getEl().treetable('expandAll');
    },
    collapseAll: function () {
      this.getEl().treetable('collapseAll');
    },
    getBody: function () {
      return this.getEl().find('tbody');
    },
    getById: function (id) {
      try {
       var $node = this.getBody().find(String.format('#{0}', id));
       return (!iNet.isEmpty($node.data('dataNode'))) ? $node.data('dataNode') : {};
      } catch(ex){
        return {};
      }
    },
    checkEmpty: function () {
      var $tbody = this.getBody();
      var __columnNumber = $tbody.parent().find('thead').find('th').length || 1;
      if ($tbody.find('tr').length < 1) {
        $tbody.html(String.format('<tr data-display="empty"><td colspan="{0}"><i>{1}</i></td></tr>', __columnNumber, iNet.resources.grid.emptyMsg));
      }
    },
    setHeight: function(v){
      this.$id.height(v);
    }
  });
});
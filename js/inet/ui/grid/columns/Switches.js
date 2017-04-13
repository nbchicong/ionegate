// #PACKAGE: grid-columns-switches
// #MODULE: Switches
// 
/**
 * Copyright (c) 2015 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 20/05/2015.
 * -------------------------------------------
 * @project ionegate
 * @file Switches
 * @author nbchicong
 */
$(function () {
  iNet.ns('iNet.ui.grid.column.Switches');
  iNet.ui.grid.column.Switches = function (config) {
    var __cog = config || {};
    iNet.apply(this, __cog);
    iNet.ui.grid.column.Switches.superclass.constructor.call(this) ;
  };
  iNet.extend(iNet.ui.grid.column.Switches, iNet.ui.grid.Editor, {
    getTypeCls: function () {
      return this.getColumn().typeCls || 'switch-6';
    },
    render: function(v){
      if (iNet.isDefined(v)) {
        var that = this;
        var grid = this.getGrid();
        var column = this.getColumn();
        var onChangeFn = column.onChange || iNet.emptyFn;
        var $sw = $(String.format('<label style="height: 20px;"><input name="switch-status" class="ace ace-switch ace-{0} {0} btn-empty" type="checkbox"><span class="lbl"></span></label>', this.getTypeCls()));
        var $input = $sw.find('input[name="switch-status"]');
        $input[0].checked = iNet.isBoolean(v) && v || iNet.isString(v) && v.toString()=='true';
        $input.on('change', function () {
          onChangeFn(that.getRecord(), this.checked);
          grid.clickCell(that);
        });
        $sw.on('click', function (e) {
          e.stopPropagation();
        });
        this.setEl($sw);
      }
      return this.getEl();
    },
    edit: function(v){
      return this.render(v);
    },
    focus: function(){
      this.getRow().find('input:first').focus();
    }
  });
  iNet.ui.grid.ColumnManager.registerType('switches', iNet.ui.grid.column.Switches);
});
// #PACKAGE: ionegate-superadmin-department
// #MODULE: DepartmentWidget
$(function () {
  iNet.ns('iNet.ui.onegate.superadmin');
  iNet.ui.onegate.superadmin.DepartmentWidget = function (config) {
    var __config = config || {};
    var _this = this;
    iNet.apply(this, __config);// apply configuration
    this.id = this.id || 'department-new-widget';

    iNet.ui.onegate.superadmin.DepartmentWidget.superclass.constructor.call(this) ;

    this.url = {
      update: !this.hasPattern() ? iNet.getUrl('onegate/department/update'): iNet.getXUrl('onegate/dept/update'),
      create: iNet.getUrl('onegate/department/create')
    };

    var confirmDeleteDialog = null;
    var createConfirmDeleteDialog = function () {
      if (!confirmDeleteDialog) {
        confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'modal-confirm-schedule-delete',
          title: iNet.resources.dialog.delete_title,
          content: iNet.resources.dialog.delete_content,
          buttons: [{
              text: iNet.resources.message.button.ok,
              cls: 'btn-danger',
              icon: 'icon-ok icon-white',
              fn: function () {
                var __data = this.getData();
                var __fn = __data.fn || iNet.emptyFn;
                this.hide();
                __fn();
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

    this.$input = {
      $bucket: $('#dept-select-bucket-data'),
      $bucketPrefix: $('#dept-txt-bucket-prefix'),
      $level: $('#dept-select-level'),
      $name: $('#dept-txt-name'),
      $brief: $('#dept-txt-brief'),
      $address: $('#dept-txt-address'),
      $number: $('#dept-txt-max-number'),
      $workTimeContainer: $('#dept-worktime-container'),
      $scheduleTable: $('#dept-schedule-tbl'),
      $email: $('#dept-txt-email'),
      $website: $('#dept-txt-website'),
      $fax: $('#dept-txt-fax'),
      $phone: $('#dept-txt-phone'),
      $order: $('#dept-txt-order'),
      $pspVersion: $('#dept-txt-psp-version'),
      $group: $('#dept-select-departmentGroup')
    };

    this.$toolbar = {
      CREATE: $('#dept-btn-create'),
      DELETE: $('#dept-btn-delete'),
      SAVE: $('#dept-btn-save'),
      BACK: $('#dept-btn-back')
    };

    this.$addScheduleLink = $('#addschedule');

//    this.$input.$bucketPrefix.filter_input({regex: '[a-z0-9]', events: 'keypress paste'});

    this._applyUI();

    this.levelSelect = new iNet.ui.form.select.Select({
      id: this.$input.$level.prop('id'),
      formatResult: function (item) {
        var __item = item || {};
        return String.format('<span><i class="icon-building"></i> {0}</span>', __item.text);
      },
      formatSelection: function (item) {
        var __item = item || {};
        return String.format('<span><i class="icon-building"></i> {0}</span>', __item.text);
      }
    });

    this.validate = new iNet.ui.form.Validate({
      id: this.id,
      rules: [
        {
          id: this.$input.$name.prop('id'),
          validate: function (v) {
            if (iNet.isEmpty(v))
              return 'Tên đơn vị không được để rỗng';
          }},{
          id: this.$input.$address.prop('id'),
          validate: function (v, $control) {
            if (iNet.isEmpty(v))
              return 'Địa chỉ không được để rỗng';
          }},{
          id: this.$input.$email.prop('id'),
          validate: function (v, $control) {
            if (!iNet.isEmpty(v) && !iNet.isEmail(v))
              return 'Địa chỉ thư điện tử không hợp lệ';
          }},{
          id: this.$input.$bucket.prop('id'),
          validate: function (v, $control) {
            if (iNet.isEmpty(v))
              return 'Bucket Data không được để rỗng';
          }},{
          id: this.$input.$level.prop('id'),
          validate: function (v, $control) {
            if (iNet.isEmpty(v))
              return 'Phạm vi không được để rỗng';
          }},{
          id: this.$input.$bucketPrefix.prop('id'),
          validate: function (v, $control) {
            if (iNet.isEmpty(v))
              return 'Prefix không được để rỗng';
          }},{
          id: this.$input.$number.prop('id'),
          validate: function (v, $control) {
            if (iNet.isEmpty(v)) {
              return 'Số hồ sơ giải quyết trong ngày không được để rỗng';
            } else if(!iNet.isNumber(Number(v))){
              return 'Số hồ sơ giải quyết có kiểu dữ liệu phải là số nguyên';
            }
          }},{
          id: 'dept-txt-worktime-morning-stime',
          validate: function (v, $control) {
            if (iNet.isEmpty(v))
              return 'Thời gian không được để rỗng';
          }},{
          id: 'dept-txt-worktime-morning-etime',
          validate: function (v, $control) {
            if (iNet.isEmpty(v))
              return 'Thời gian không được để rỗng';
          }},{
          id: 'dept-txt-worktime-afternoon-stime',
          validate: function (v, $control) {
            if (iNet.isEmpty(v))
              return 'Thời gian không được để rỗng';
          }},{
          id: 'dept-txt-worktime-afternoon-etime',
          validate: function (v, $control) {
            if (iNet.isEmpty(v))
              return 'Thời gian không được để rỗng';
          }}
      ]
    });

    this.$toolbar.SAVE.on('click', function () {
      if (_this.check()) {
        var __data = _this.getData();
        if (iNet.isEmpty(__data.uuid)) {
          var __parentNode = _this.getParentNode();
          if (!iNet.isEmpty(__parentNode.uuid)) {
            __data.parentcode = __parentNode.uuid;
          } else {
            __data.parentcode = '';
          }
          $.postJSON(_this.url.create, __data, function (result) {
            _this.responseHandler(result, function (data) {
              var __result = data || {};
              _this.setData(__result);
              _this.showMessage('success', 'Tạo mới', 'Đơn vị đã được tạo');
              _this.fireEvent('saved', true, __result);
            });
          },{mask: _this.getMask(), msg: iNet.resources.ajaxLoading.saving});
        } else {
          $.postJSON(_this.url.update, __data, function (result) {
            _this.responseHandler(result, function (data) {
              var __result = data || {};
              _this.setData(__result);
              _this.showMessage('success', 'Cập nhật', 'Đơn vị đã được cập nhật');
              _this.fireEvent('saved', false, __result);
            });
          },{mask: _this.getMask(), msg: iNet.resources.ajaxLoading.saving});
        }
      }
    });

    this.$toolbar.BACK.on('click', function () {
      _this.hide();
      _this.fireEvent('back', _this);
    });


    this.$toolbar.CREATE.on('click', function() {
      _this.resetData();
    });

    this.$addScheduleLink.on('click', function(){
      _this._addScheduleItem();
    });

    this.getEl().on('click', '[data-action]', function () {
      var action = $(this).attr('data-action');
      var $tr = $(this).parent().parent();
      switch (action) {
        case 'delete': //delete field
          var dialog = createConfirmDeleteDialog();
          dialog.setData({fn: function () {
            $tr.remove();
          }});
          dialog.show();
          break;
      }
    });

    window.DeptWG = this;
  };
  iNet.extend(iNet.ui.onegate.superadmin.DepartmentWidget, iNet.ui.onegate.OnegateWidget, {
    getWorkingTimes: function(){
      var $workTimes = this.$input.$workTimeContainer.find('input.time-picker');
      var __workTimes = [];
      for(var i=0;i<$workTimes.length;i++) {
        __workTimes.push($($workTimes[i]).val());
      }
      return __workTimes;
    },
    setWorkingTime: function(times){
      var __times = times || [];
      var $controls = this.$input.$workTimeContainer.find('input.time-picker');
      for(var i=0;i<__times.length;i++) {
        var v = this.convertLongToTimeStr(__times[i]);
        var $control = $($controls[i]);
        if($control && $control.length>0) {
          $control.val(v);//.timepicker('setTime', v);
        }
      }
    },
    getData: function () {
      var __ownerData = this.ownerData || {};
      var __data = iNet.clone(__ownerData);

      var __bucket = {};
      if(this.bucketSelect) {
        __bucket = this.bucketSelect.getData() || {};
      }
      __data.bucketData = __bucket.bucketPrefix;
      __data.prefix =  this.$input.$bucketPrefix.val();
      var __level = {};
      if(this.levelSelect) {
        __level = this.levelSelect.getData() || {};
      }
      __data.level = __level.id;
      __data.order = this.$input.$order.val();
      __data.departmentGroup = this.$input.$group.val();
      __data.name = this.$input.$name.val();
      __data.brief = this.$input.$brief.val();
      __data.address = this.$input.$address.val();
      __data.email = this.$input.$email.val();
      __data.website = this.$input.$website.val();
      __data.phone = this.$input.$phone.val();
      __data.fax = this.$input.$fax.val();
      __data.pspOldVersion = this.$input.$pspVersion[0].checked;
      __data.worktime = this.getWorkingTimes().join(',');
      __data.saturdayState = Number(this.getEl().find('input[name=saturdayState]:checked').val());
      __data.maxAppt = Number(this.$input.$number.val() || 0);
      iNet.apply(__data,this.getSchedule());
      delete __data['members'];
      delete __data['appointments'];
      delete __data['evaluation'];
      delete __data['notify'];
      return __data;
    },
    setData: function (data) {
      var me = this;
      var __data = data || {};
      this.ownerData = __data;
      var $scheduleBody = this.$input.$scheduleTable.find('tbody:first');
      $scheduleBody.find('tr:gt(0)').remove();
      this.loadBucket(function(){
        var __bucket = __data.bucketData;
        return {bucketPrefix: __bucket};
      });

      var $optionLevel = this.$input.$level.find(String.format('option[value="{0}"]', __data.level));
      this.levelSelect.setData({id: __data.level, text: $optionLevel.text(), element: $optionLevel});
      this.levelSelect.disable();

      this.$input.$brief.val(__data.brief);
      this.$input.$address.val(__data.address);
      this.$input.$email.val(__data.email);
      this.$input.$website.val(__data.website);
      this.$input.$phone.val(__data.phone);
      this.$input.$fax.val(__data.fax);
      this.$input.$order.val(__data.order);
      this.$input.$group.val(__data.departmentGroup);

      this.$input.$number.val(__data.maxAppt);
      this.$input.$bucketPrefix.val(__data.prefix);
      this.$input.$pspVersion[0].checked = __data.pspOldVersion;
      this.getEl().find(String.format('input[name=saturdayState][value="{0}"]', __data.saturdayState)).prop('checked',true);
      this.setWorkingTime(__data['worktime']);
      this.setSchedule(__data['appointments']);
      this.$input.$name.val(__data.name).focus();
      FormUtils.showButton(this.$toolbar.SAVE, true);
      this.check();
    },
    resetData: function () {
      var me = this;
      this.ownerData = {};
      var $scheduleBody = this.$input.$scheduleTable.find('tbody:first');
      $scheduleBody.find('tr:gt(0)').remove();
      this.$input.$brief.val('');
      this.$input.$address.val('');
      this.$input.$number.val(480);
      this.$input.$bucketPrefix.val('');
      this.$input.$pspVersion[0].checked = false;
      if(this.bucketSelect) {
        this.bucketSelect.clear();
        this.bucketSelect.enable();
      }
      this.loadBucket(function(){
        var parent = me.getParentNode();
        if(parent) {
          var __bucket = parent.bucketData;
          return {bucketPrefix: __bucket};
        }
        return null;
      });

      var parent = me.getParentNode();
      if(!iNet.isEmpty(parent.level)) {
        var __level = parent.level;
        var $optionLevel = this.$input.$level.find(String.format('option[value="{0}"]', __level));
        this.levelSelect.setData({id: __level, text: $optionLevel.text(), element: $optionLevel});
      }
      this.levelSelect.enable();

      this.$input.$name.val('').focus();
      this.$input.$order.val(1);
      FormUtils.showButton(this.$toolbar.SAVE, true);
    },
    check: function(){
      return this.validate.check();
    },
    setParentNode: function (parentNode) {
      this.parentNode = parentNode;
    },
    getParentNode: function () {
      return this.parentNode || {};
    },
    loadBucket: function (fn) {
      var me = this;
      var __fn = fn || iNet.emptyFn;
      var createSelect = function(){
        var __selected = __fn() || {};
        me.bucketSelect = new iNet.ui.form.select.Select({
          id: me.$input.$bucket.prop("id"),
          multiple: false,
          allowClear: true,
          query: function (query) {
            var data = {results: []};
            $.each(me.getBuckets(), function () {
              if (query.term.length == 0 || (this.bucketPrefix || '').toUpperCase().indexOf(query.term.toUpperCase()) >= 0) {
                data.results.push(this);
              }
            });
            query.callback(data);
          },
          idValue: function (item) {
            var __item = item || {};
            return __item.bucketPrefix;
          },
          initSelection: function (array) {
            return array;
          },
          formatSelection: function (item) {
            var __item = item || {};
            return String.format('<span style="font-weight:bold"><i class="icon-bitbucket orange"></i> {0}</span>', __item.bucketPrefix);
          },
          formatResult: function (item) {
            var __item = item || {};
            return String.format('<span style="font-weight:bold"><i class="icon-bitbucket orange"></i> {0}</span>', __item.bucketPrefix);
          }
        });
        if (!iNet.isEmpty(__selected.bucketPrefix)) {
          me.bucketSelect.setData(__selected);
          if (!iNet.isEmpty(this.ownerData)) {
            me.bucketSelect.disable();
            me.check();
          }
        }
      };
      if(!this.hasPattern()) {
        $.getJSON(iNet.getUrl('bucket/profile/list'), function (result) {
          var __result = result || {};
          me.buckets = __result.items || [];
          createSelect();
        }, {mask: me.getMask(), msg: iNet.resources.ajaxLoading.loading});
      } else {
        me.buckets = [];
        createSelect();
      }
    },
    addBucket: function(bucket){
      this.getBuckets().push(bucket);
    },
    getBuckets: function(){
      return this.buckets || [];
    },
    getSchedule:function(){
      var $scheduleBody = this.$input.$scheduleTable.find('tbody:first');
      var $rows= $scheduleBody.find('tr');
      var scheduledows = [];
      var schedules = [];
      for(var i =0;i<$rows.length;i++){
        var $row = $($rows.get(i));
        var $select = $row.find('select:first');
        var $inputs = $row.find('input.time-picker');
        if($select && $select.length>0) {
          scheduledows.push($select.val());
        }
        var __scheduleTimes = [];
        for(var j=0;j<$inputs.length;j++) {
          __scheduleTimes.push($($inputs[j]).val() || '00:00');
        }
        if($inputs && $inputs.length>0) {
          schedules.push(__scheduleTimes.join(','));
        }
      }
      return {scheduledow: scheduledows.join('/'), schedule: schedules.join('/')};
    },
    setSchedule: function(appointments) {
      var $scheduleBody = this.$input.$scheduleTable.find('tbody:first');
      $scheduleBody.empty();
      var __appointments = appointments || [];

      for(var i=0;i<__appointments.length;i++){
        var __appointment = __appointments[i] || {};
        var dayofweek  = __appointment['dayofweek'] || [];
        var schedule  = __appointment['schedule'] || [];
        var $row = null;
        $row = this._addScheduleItem();//add row schedule
        var $select = $row.find('select:first');
        if($select && $select.length>0) {
          for (var k = 0; k < dayofweek.length; k++) {
            $select.multiselect('select', dayofweek[k]);
          }
        }
        var $inputs = $row.find('input.time-picker');
        if($inputs && $inputs.length>0) {
          for (var j = 0; j < schedule.length; j++) {
            var v = this.convertLongToTimeStr(schedule[j]);
            var $input = $($inputs[j]);
            if ($input && $input.length > 0) {
              $input.val(v);//.timepicker('setTime', v);
            }
          }
        }
      }
    },
    convertLongToTimeStr: function(v){
      var t = v / 60;
      var minute = parseInt(t);
      var second = Math.round((t - minute) * 60);
      v = String.format('{0}:{1}', (minute<10) ? '0'+ minute : minute, (second<10) ? '0'+ second : second);
      return (v=='00:00' ? '' : v);
    },
    _addScheduleItem: function() {
      var __html = '<tr><td>';
      __html+='<select class="multiselect" multiple="multiple">';
      __html+='<option value="2">Thứ 2</option>';
      __html+='<option value="3">Thứ 3</option>';
      __html+='<option value="4">Thứ 4</option>';
      __html+='<option value="5">Thứ 5</option>';
      __html+='<option value="6">Thứ 6</option>';
      __html+='<option value="7">Thứ 7</option>';
      __html+='<option value="8">Chủ nhật</option>';
      __html+='</select>';
      __html+='</td>';
      __html+='<td>';
      __html+='<div class="ace-icon input-icon input-icon-right date bootstrap-timepicker" style="width: 100px;">';
      __html+='<input type="text" value="08:00" class="col-xs-12 col-sm-12 time-picker">';
      __html+='<i class="ace-icon  add-on icon-time"></i>';
      __html+='</div></td>';
      __html+='<td>';
      __html+='<div class="ace-icon input-icon input-icon-right date bootstrap-timepicker" style="width: 100px;">';
      __html+='<input type="text" value="11:30" class="col-xs-12 col-sm-12 time-picker">';
      __html+='<i class="ace-icon add-on icon-time"></i>';
      __html+='</div></td>';
      __html+='<td>';
      __html+='<div class="ace-icon input-icon input-icon-right date bootstrap-timepicker" style="width: 100px;">';
      __html+='<input type="text" value="13:30" class="col-xs-12 col-sm-12 time-picker">';
      __html+='<i class="ace-icon add-on icon-time"></i>';
      __html+='</div></td>';
      __html+='<td>';
      __html+='<div class="ace-icon input-icon input-icon-right date bootstrap-timepicker" style="width: 100px;">';
      __html+='<input type="text" value="17:30" class="col-xs-12 col-sm-12 time-picker">';
      __html+='<i class="ace-icon add-on icon-time"></i>';
      __html+='</div></td>';
      __html+='<td><span data-action="delete" style="cursor: pointer" title="Delete" class="label label-important"><i class="icon-trash icon-white"></i></span></td>';
      __html+='</tr>';
      var $scheduleBody = this.$input.$scheduleTable.find('tbody:first');
      var $row = $(__html);
      this._applyUI($row);
      $scheduleBody.append($row);
      return $row;
    },
    _applyUI: function($container){
      var $container = $container || this.getEl();

      var $inputs = $container.find('input.time-picker');
      if ($inputs && $inputs.length > 0) {
        $inputs.mask('99:99');
        /*
        $inputs.timepicker({
          minuteStep: 1,
          showSeconds: false,
          showMeridian: false,
          defaultTime: false
        });
        $inputs.next().on('click', function () {
          $(this).prev().focus();
        });
        */
      }

      var $selects = $container.find('select.multiselect');
      if($selects && $selects.length>0) {
        $selects.multiselect({
          buttonClass: 'btn',
          buttonWidth: 'auto',
          buttonText: function (options) {
            if (options.length == 0) {
              return 'Chưa chọn... <b class="caret"></b>';
            }
            else {
              var selected = '';
              options.each(function () {
                selected += $(this).text() + ', ';
              });
              return selected.substr(0, selected.length - 2) + ' <b class="caret"></b>';
            }
          }
        });
      }

    }
  });
});
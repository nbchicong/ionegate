/**
 * #PACKAGE: leader-account-content
 * #MODULE: LeaderAccountContent
 */
/**
 * Copyright (c) 2017 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 5:35 PM 22/09/2017.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file LeaderAccountContent.js
 */
$(function () {
  var url = {
    industry: iNet.getUrl('glbgate/industrystruct/list'),
    create  : iNet.getUrl('igate/leader/create'),
    update  : iNet.getUrl('igate/leader/update'),
    del     : iNet.getUrl('igate/leader/delete')
  };
  /**
   * @class iNet.ui.leader.LeaderAccountContent
   * @extends iNet.ui.onegate.OnegateWidget
   */
  iNet.ns('iNet.ui.leader.LeaderAccountContent');
  iNet.ui.leader.LeaderAccountContent = function (options) {
    var _this = this;
    iNet.apply(this, options || {});
    this.id = 'leader-content-wg';
    var toolbar = {
      BACK: $('#content-btn-back'),
      SAVE: $('#content-btn-save'),
      DEL : $('#content-btn-remove')
    };
    this.$form = $('#account-container');
    this.$cbbOrgan = $('#cbb-leader-org-prefix');
    this.$indContainer = $('#industry-list');

    iNet.ui.leader.LeaderAccountContent.superclass.constructor.call(this);
    toolbar.BACK.click(function () {
      _this.hide();
      _this.fireEvent('back', _this);
    });

    toolbar.SAVE.click(function () {
      save();
    });

    this.$cbbOrgan.on('change', function () {
      var option = $(this).find('option:selected');
      loadIndustry(option.attr('data-code'));
    });

    function save() {
      var serializeData = _this.$form.serializeArray();
      var params = {};
      serializeData.forEach(function (item) {
        if (params[item.name])
          params[item.name] = params[item.name] + ';' + getValue(item.value);
        else
          params[item.name] = getValue(item.value);
      });

      if (params.uuid)
        $.postJSON(url.update, params, function (results) {
          if (results.success) {
            _this.load(results.data);
            _this.showMessage('success', 'Cập nhật', 'Cập nhật thành công!');
          }
          else
            _this.showMessage('error', 'Cập nhật', 'Cập nhật xảy ra lỗi!');
        });
      else
        $.postJSON(url.create, params, function (results) {
          if (results.success) {
            _this.load(results.data);
            _this.showMessage('success', 'Tạo mới', 'Tạo mới thành công!');
          }
          else
            _this.showMessage('error', 'Tạo mới', 'Tạo mới xảy ra lỗi!');
        });
    }

    function loadIndustry(orgCode) {
      $.getJSON(url.industry, {orgcode: orgCode}, function (results) {
        var items = results.items || [];
        var col1 = '';
        var col2 = '';
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var input = '<div>' +
              '<label class="middle">' +
              '<input name="industries" type="checkbox" class="ace" value="' + item.uuid + '">' +
              '<span class="lbl"> ' + item.industry + '</span>' +
              '</label>' +
              '</div>';
          if (i <= items.length/2)
            col1 += input;
          else
            col2 += input;

        }
        _this.$indContainer.find('.left').html(col1);
        _this.$indContainer.find('.right').html(col2);
      });
    }
  };
  iNet.extend(iNet.ui.leader.LeaderAccountContent, iNet.ui.onegate.OnegateWidget, {
    load: function (record) {
      var _this = this;
      var listKey = ['smsTplId', 'emailTplId', 'industries', 'isSMS', 'isEmail'];
      for (var key in record) {
        if (listKey.indexOf(key) === -1)
          this.$form.find('input[name="' + key + '"]').val(record[key]);
        else {
          if (key === 'industries') {
            var industries = record[key];
            industries.forEach(function (item) {
              _this.$form.find('input[value="' + item + '"]')[0].checked = true;
            });
          }
          else
            this.$form.find('input[value="' + record[key] + '"]')[0].checked = true;
        }
      }
    },
    newRecord: function () {
      this.$form.reset();
    }
  });

  function getValue(value, convert) {
    if (convert) {
      if (value === true)
        return 'on';

      if (value === false)
        return 'off';

      return value;
    }

    if (value === 'on')
      return true;

    if (value === 'off')
      return false;

    return value;
  }
});

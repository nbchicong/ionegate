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
    this.$checkSms = $('#chk-send-sms');
    this.$checkEmail = $('#chk-send-email');
    this.$template = $('[name="template-radio"]');
    this.$industry = $('[name="industry-checkbox"]');

    iNet.ui.leader.LeaderAccountContent.superclass.constructor.call(this);
    toolbar.BACK.click(function () {
      _this.hide();
      _this.fireEvent('back', _this);
    });

    toolbar.SAVE.click(function () {
      save();
    });

    function save() {

    }

    function loadIndustry(orgCode) {
      $.getJSON();
    }
  };
  iNet.extend(iNet.ui.leader.LeaderAccountContent, iNet.ui.onegate.OnegateWidget, {

  });
});

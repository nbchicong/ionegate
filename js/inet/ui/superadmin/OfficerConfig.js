/**
 * #PACKAGE: sup-officer-config
 * #MODULE: OfficerConfig
 */
/**
 * Copyright (c) 2016 iNet Solutions Corp.,
 * Created by Nguyen Ba Chi Cong<nbccong@inetcloud.vn>
 *         on 3:24 PM 27/10/2016.
 * -------------------------------------------
 * @project ionegate
 * @author nbccong
 * @file OfficerConfig.js
 */
$(function () {
  /**
   * @class iNet.ui.superadmin.OfficerConfig
   * @extends iNet.Component
   */

  var url = {
    save: iNet.getUrl('onegate/organ/create')
  };

  var toolbar = {
    SAVE: $('#officer-btn-save')
  };

  var $formModel = $('#officer-config-form');

  var formValidate = new iNet.ui.form.Validate({
    id: 'officer-config-form',
    rules: [{
      id: 'txt-officer-name',
      validate: function (v) {
        if (iNet.isEmpty(v))
          return iNet.resources.onegate.superadmin.office.name_not_empty;
      }
    }, {
      id: 'txt-officer-id',
      validate: function (v) {
        if (iNet.isEmpty(v))
          return iNet.resources.onegate.superadmin.office.org_id_not_empty;
      }
    }]
  });

  function validate() {
    return formValidate.check();
  }

  function getFormData() {
    var formData = {};
    $formModel.serializeArray().forEach(function (item) {
      formData[item.name] = item.value;
    });
    return formData;
  }

  function save() {
    if (validate()) {
      var _this = this;
      $.postJSON(url.save, getFormData(), function (result) {
        var $txtUuid = $('#txt-officer-uuid');
        if (result && result.uuid) {
          _this.showMessage(
              'success',
              iNet.resources.onegate.superadmin.office.save_title,
              iNet.resources.onegate.superadmin.office.saved
          );
          if ($txtUuid.length <= 0)
            $formModel.append('<input id="txt-officer-uuid" type="hidden" name="organ" value="' + result.uuid + '">');
        } else
          _this.showMessage(
              'error',
              iNet.resources.onegate.superadmin.office.save_title,
              iNet.resources.onegate.superadmin.office.save_failed
          );
      }, {});
    }
  }

  iNet.ns('iNet.ui.superadmin.OfficerConfig');
  iNet.ui.superadmin.OfficerConfig = function (options) {
    var _this = this;
    iNet.apply(this, options || {});
    this.id = 'officer-config-wg';
    iNet.ui.superadmin.OfficerConfig.superclass.constructor.call(this);
    toolbar.SAVE.on('click', function () {
      save.call(_this);
    });
  };
  iNet.extend(iNet.ui.superadmin.OfficerConfig, iNet.ui.onegate.OnegateWidget);
  new iNet.ui.superadmin.OfficerConfig();
});

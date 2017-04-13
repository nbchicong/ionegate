// #PACKAGE: superadmin-office-location
// #MODULE: OfficeLocationWidget
$(function () {
  iNet.ns('iNet.ui.onegate.superadmin');
  iNet.ui.onegate.superadmin.OfficeLocationWidget = function (config) {
    var __config = config || {};
    iNet.apply(this, __config);// apply configuration
    this.id = this.id || 'office-form-widget';

    iNet.ui.onegate.superadmin.OfficeLocationWidget.superclass.constructor.call(this) ;

    this.url = {
      update: iNet.getUrl('onegate/office/update'),
      create: iNet.getUrl('onegate/office/create')
    };

    this.$input = {
      $bucket: $('#office-select-bucket-data'),
      $bucketPrefix: $('#office-txt-bucket-prefix'),
      $name: $('#office-txt-name'),
      $brief: $('#office-txt-brief'),
      $address: $('#office-txt-address'),
      $address2: $('#office-txt-address2'),
      $ward: $('#office-txt-ward'),
      $district: $('#office-txt-district'),
      $city: $('#office-txt-city'),
      $country: $('#office-txt-country'),
      $phone: $('#office-txt-phone'),
      $fax: $('#office-txt-fax'),
      $email: $('#office-txt-email'),
      $website: $('#office-txt-website'),
      $member: $('#office-select-member')
    };

    this.$toolbar = {
      CREATE: $('#office-location-btn-create'),
      SAVE: $('#office-location-btn-save'),
      BACK: $('#office-location-btn-back')
    };

    this.$input.$bucketPrefix.filter_input({regex: '[a-z0-9]', events: 'keypress paste'});

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
          id: this.$input.$bucket.prop('id'),
          validate: function (v, $control) {
            if (iNet.isEmpty(v))
              return 'Bucket không được để rỗng';
          }},{
          id: this.$input.$bucketPrefix.prop('id'),
          validate: function (v, $control) {
            if (iNet.isEmpty(v))
              return 'Prefix không được để rỗng';
          }}
      ]
    });

    this.$toolbar.SAVE.on('click', function () {
      if (this.validate.check()) {
        var me = this;
        var __data = this.getData();
        if (iNet.isEmpty(__data.uuid)) {
          $.postJSON(me.url.create, __data, function (result) {
            var __result = result || {};
            me.setData(__result);
            me.fireEvent('saved', true, __result);
          },{mask: me.getMask(), msg: iNet.resources.ajaxLoading.saving});
        } else {
          $.postJSON(me.url.update, __data, function (result) {
            var __result = result || {};
            me.setData(__result);
            me.fireEvent('saved', false, __result);
          },{mask: me.getMask(), msg: iNet.resources.ajaxLoading.saving});
        }
      }
    }.createDelegate(this));

    this.$toolbar.BACK.on('click', function () {
      this.hide();
      this.fireEvent('back', this);
    }.createDelegate(this));


    this.$toolbar.CREATE.on('click', function() {
      this.resetData();
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.onegate.superadmin.OfficeLocationWidget, iNet.ui.onegate.OnegateWidget, {
    getData: function () {
      var __ownerData = this.ownerData || {};
      var __data = {};
      var __bucket = {};
      if(this.bucketSelect) {
        __bucket = this.bucketSelect.getData() || {};
      }
      __data.bucketData = __bucket.bucketPrefix;
      __data.prefix =  this.$input.$bucketPrefix.val();
      __data.name = this.$input.$name.val();
      __data.brief = this.$input.$brief.val();
      __data.address1 = this.$input.$address.val();
      __data.address2 = this.$input.$address2.val();
      __data.ward = this.$input.$ward.val();
      __data.district = this.$input.$district.val();
      __data.city = this.$input.$city.val();
      __data.country = this.$input.$country.val();
      __data.phone = this.$input.$phone.val();
      __data.fax = this.$input.$fax.val();
      __data.email = this.$input.$email.val();
      __data.website = this.$input.$website.val();
      var __members = [];
      if(this.memberSelect) {
        var __users= this.memberSelect.getValue() || [];
        for(var i=0;i<__users.length;i++){
          var __user = __users[i] || {};
          __members.push(__user);
        }
      }
      __data['users'] = __members.join(',');
      if(!iNet.isEmpty(__ownerData.uuid)){
        __data.uuid = __ownerData.uuid;
      }
      return __data;
    },
    setData: function (data) {
      var me = this;
      var __data = data || {};
      this.ownerData = __data;
      this.loadBucket(function(){
        var __bucket = __data.bucketData;
        var __selected = {bucketPrefix: __bucket};
        me.addBucket(__selected);
        return __selected;
      });
      this.loadMember(function(){
        return __data.members || [];
      });
      this.$input.$bucketPrefix.val(__data.prefix);
      this.$input.$brief.val(__data.brief);
      this.$input.$address.val(__data.address1);
      this.$input.$address2.val(__data.address2);
      this.$input.$ward.val(__data.ward);
      this.$input.$district.val(__data.district);
      this.$input.$city.val(__data.city);
      this.$input.$country.val(__data.country|| 'Việt Nam');
      this.$input.$phone.val(__data.phone);
      this.$input.$fax.val(__data.fax);
      this.$input.$email.val(__data.email);
      this.$input.$website.val(__data.website);
      this.$input.$name.val(__data.name).focus();
      FormUtils.showButton(this.$toolbar.SAVE, true);
      this.check();
    },
    resetData: function () {
      var me = this;
      this.ownerData = {};
      if(this.bucketSelect) {
        this.bucketSelect.clear();
        this.bucketSelect.enable();
      }
      this.loadMember();
      this.loadBucket();
      this.getEl().find('input').val('');
      this.$input.$name.focus();
      FormUtils.showButton(this.$toolbar.SAVE, true);
    },
    check: function(){
      return this.validate.check();
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
          minimumInputLength: 1,
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
            return __item.bucketPrefix;
          },
          formatResult: function (item) {
            var __item = item || {};
            return String.format('<span style="font-weight: bold;"><span class="package"></span> {0}</span>', __item.bucketPrefix);
          }
        });
        if (!iNet.isEmpty(__selected.bucketPrefix)) {
          me.bucketSelect.setData(__selected);
          me.check();
        }
      };

      $.getJSON(iNet.getUrl('bucket/profile/list'), function (result) {
        var __result = result || {};
        me.buckets = __result.items || [];
        createSelect();
      }, {mask: me.getMask(), msg: iNet.resources.ajaxLoading.loading});
    },
    addBucket: function(bucket){
      this.getBuckets().push(bucket);
    },
    getBuckets: function(){
      return this.buckets || [];
    },
    loadMember: function (fn) {
      var me = this;
      var __fn = fn || iNet.emptyFn;
      var createSelect = function(items){
        var __users = __fn() || [];
        var __members= items || [];
        me.memberSelect = new iNet.ui.form.select.Select({
          id: me.$input.$member.prop("id"),
          multiple: true,
          allowClear: true,
          data: function () {
            return {
              results: __members,
              text: function (item) {
                return item.fullname + "&lt;" + item.username + "&gt;";
              }};
          },
          idValue: function (item) {
            var __item = item || {};
            return __item.username;
          },
          initSelection: function (element, callback) {
            var __value = element.val() || "";
            __value = __value.split(',');
            var elements = [];
            for(var i=0;i<__value.length;i++){
              var username = __value[i];
              for(var j=0;j<__members.length;j++){
                if(username == __members[j].username){
                  elements.push(__members[j]);
                  break;
                }
              }
            }

            callback(elements);
          },
          formatSelection: function (item) {
            var __item = item || {};
            return String.format('<span><span class="icon-user"></span> {0} &lt;{1}&gt;</span>', __item.fullname, __item.username);
          },
          formatResult: function (item) {
            var __item = item || {};
            return String.format('<span><span class="icon-user"></span> {0} &lt;{1}&gt;</span>', __item.fullname, __item.username);
          }
        });

        if (!iNet.isEmpty(__users)) {
          var __selections= []
          for(var i=0;i<__users.length; i ++) {
            __selections.push(__users[i].name);
          }
          me.memberSelect.setValue(__selections);
          me.check();
        }

      };

      $.getJSON(iNet.getUrl('system/account/role'), function (result) {
        var __result = result || {};
        createSelect(__result.items || []);
      }, {mask: me.getMask(), msg: iNet.resources.ajaxLoading.loading});
    }
  });
});
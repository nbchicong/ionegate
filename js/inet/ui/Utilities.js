// #PACKAGE: ionegate-utils
// #MODULE: Utilities
iNet.applyIf(iNet, {
  dateFormat: 'd/m/Y',
  fullDateFormat: 'd/m/Y H:i:s',
  today: new Date(),
  dateFormats: function () {
    var formats = new Hashtable();
    formats.put('dd/MM/yyyy', 'd/m/Y');
    formats.put('dd/MM/yyyy HH:mm:ss', 'd/m/Y H:i:s');
    formats.put('MM/dd/yyyy', 'm/d/Y');
    formats.put('MM/dd/yyyy HH:mm:ss', 'm/d/Y H:i:s');
    formats.put('yyyy/MM/dd', 'Y/m/d');
    formats.put('yyyy/MM/dd HH:mm:ss', 'Y/m/d H:i:s');
    return formats;
  }
});
iNet.applyIf(String.prototype, {
  /**
   * Convert String to Date (Only Support format dd/MM/yyyy & MM/dd/yyyy)
   */
  toDate: function (format) {
    var formats = iNet.dateFormats();
    var __format = formats.get(format || 'dd/MM/yyyy');
    if (__format.length >= 5) {
      __format = __format.substring(0, 5);
    }
    var date = new Date();
    if (iNet.isEmpty(this)) {
      return date;
    }
    try {
      var split = '/';
      var day = this.substring(0, 2);
      var month = this.substring(3, 5);
      var year = this.substring(6, 10);

      switch (__format) {
        case 'm/d/Y':
          month = this.substring(0, 2);
          day = this.substring(3, 5);
          break;
        case 'Y/m/d':
          year = this.substring(0, 4);
          month = this.substring(5, 7);
          day = this.substring(8, 10);
          break;
        case 'Y/m/d H:s:i':
          year = this.substring(0, 4);
          month = this.substring(5, 7);
          day = this.substring(8, 10);
          break;

      }
      var temp = month + split + day + split + year;
      date = new Date(Date.parse(temp));
    }
    catch (e) {
    }
    return date;
  },
  toFullDate: function (format) {
    var formats = iNet.dateFormats();
    var __format = formats.get(format || 'dd/MM/yyyy HH:mm:ss');
    if (__format.length >= 5) {
      __format = __format.substring(0, 5);
    }
    var date = new Date();
    if (iNet.isEmpty(this)) {
      return date;
    }
    try {
      var split = '/';
      var day = this.substring(0, 2);
      var month = this.substring(3, 5);
      var year = this.substring(6, 10);
      var time = this.substring(11, this.length);
      var temp = month + split + day + split + year + ' ' + time;
      date = new Date(Date.parse(temp));
    }
    catch (e) {
    }
    return date;
  }
});


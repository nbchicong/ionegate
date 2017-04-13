// #PACKAGE: ionegate-utils
// #MODULE: FileFormat
/**
 * @class FileFormat
 * @extends Object.
 *
 * support control document format.
 */
iNet.FileFormat = {
  /**
   * distance of openoffice and msoffice.
   */
  NEXT_FORMAT: 6,
  /**
   * OpenOffice Word
   */
  OO_WORD: 0,
  /**
   * OpenOffice Excel.
   */
  OO_EXCEL: 1,
  /**
   * OpenOffice Power Point.
   */
  OO_POWERPOINT: 2,
  /**
   * OpenOffice Graph.
   */
  OO_GRAPH: 3,
  /**
   * OpenOffice Math.
   */
  OO_MATH: 4,
  /**
   * OpenOffice Database.
   */
  OO_DATABASE: 5,
  /**
   * Microsoft Word.
   */
  MS_WORD: 6,
  /**
   * Microsoft Excel.
   */
  MS_EXCEL: 7,
  /**
   * Microsoft Power Point.
   */
  MS_POWERPOINT: 8,
  /**
   * Microsoft Access.
   */
  MS_ACCESS: 9,
  /**
   * Microsoft Project.
   */
  MS_PROJECT: 10,
  /**
   * Microsoft Visio.
   */
  MS_VISIO: 11,
  /**
   * Text document.
   */
  DOC_TEXT: 12,
  /**
   * HTML document.
   */
  DOC_HTML: 13,
  /**
   * XML document.
   */
  DOC_XML: 14,
  /**
   * PDF document.
   */
  DOC_PDF: 15,
  /**
   * Image document.
   */
  DOC_IMG: 16,
  /**
   * iNet document.
   */
  DOC_INET: 17,
  /**
   * Other document
   */
  DOC_OTHER: 18,
  /**
   * Microsoft Word 2007
   */
  MS_WORD_2007: 19,
  /**
   * Microsoft Excel 2007.
   */
  MS_EXCEL_2007: 20,
  /**
   * Microsoft PowerPoint 2007.
   */
  MS_POWERPOINT_2007: 21,
  /**
   * Document format
   */
  FORMAT: ['oo-word', 'oo-excel', 'oo-powerpoint', 'oo-graph', 'oo-math', 'oo-database', 'ms-word', 'ms-excel',
    'ms-powerpoint', 'ms-access', 'ms-project', 'ms-visio', 'doc-text', 'doc-html', 'doc-xml', 'doc-pdf',
    'doc-img', 'doc-inet', 'doc-other', 'ms-word7', 'ms-excel7', 'ms-powerpoint7'],
  /**
   * Document extension format.
   */
  EXT_FORMAT: ['odt', 'ods', 'odp', 'odg', 'odf', 'odb', 'doc', 'xls', 'ppt', 'mdb', 'mpp',
    'vsd', 'txt', 'html', 'xml', 'pdf', 'jpg', 'dtt', 'oth', 'docx', 'xlsx', 'pptx'],
  /**
   * Document format name.
   */
  FORMAT_NAME: [
    'Open Office Word',
    'Open Office Excel',
    'Open Office Powerpoint',
    'Open Office Graph',
    'Open Office Math',
    'Open Office Database',
    'Microsoft Word',
    'Microsoft Excel',
    'Microsoft Powerpoint',
    'Microsoft Access',
    'Microsoft Project',
    'Microsoft Visio',
    'Text Document',
    'HTML Document',
    'XML Document',
    'PDF Document',
    'Image Document',
    'iNet Document',
    'Others',
    'Microsoft Word 2007',
    'Microsoft Excel 2007',
    'Microsoft PowerPoint 2007'
  ],
  EXT_IMAGE: ['JPG', 'JPEG', 'PNG', 'GIF', 'TIF', 'TIFF', 'BMP'],
  EXT_WORD: ['DOC', 'DOCX'],
  EXT_EXCEL: ['XLS', 'XLSX', 'XLR'],
  EXT_POWERPOINT: ['PPT', 'PPTX', 'PPS'],
  EXT_ARCHIVE: ['RAR', 'ZIP', '7Z', 'S7Z', 'TAR', 'GZ', 'WAR', 'GZIP', 'BZIP2', 'LZIP'],
  EXT_AUDIO: ['MP3', 'WAV', 'AAC', 'AU', 'WMA', 'WV', 'RAW'],
  EXT_VIDEO: ['MKV', 'FLV', 'VOB', 'AVI', 'MOV', 'WMV', 'RM', 'MP4', 'MPG', 'MP2', 'MPEG', '3GP', 'M4V', 'M4P', 'M2V'],
  EXT_PDF: ['PDF'],
  EXT_CODE: ['ASPX', 'JSON', 'JSP', 'PHP', 'HTM', 'HTML', 'XHTML', 'XML', 'SQL', 'LIB', 'CS', 'ASP', 'JS', 'BAT', 'SRC', 'JAVA', 'CSHTML', 'CSS', 'CPP', 'SH', 'DB', 'MDB'],
  EXT_TEXT: ['TXT', 'RT', 'CSV'],
  /**
   * @return the file extension.
   */
  getExtension: function (file) {
    if (file == undefined || file == '')
      return '';
    var position = file.lastIndexOf('.');
    if (position == -1)
      return '';

    // get file extension.
    return file.substr(position + 1, file.length);
  },

  /**
   * @return the format value.
   */
  getFormat: function (extension) {
    for (var index = 0; index < this.EXT_FORMAT.length; index++) {
      if (extension == this.EXT_FORMAT[index])
        return index;
    }

    // return document other.
    return this.DOC_OTHER;
  },
  getIcon: function (extension) {
    var iconCls = 'file-icon xicon-' + extension || 'oth';
    //'icon-paper-clip'
    return iconCls;
  },
  checkFileExt: function (file, listExt) {
    //return: true (ext in listExt) / false (huyendv)
    var ext = iNet.FileFormat.getExtension(file).toString().toUpperCase();
    for (var index = 0; index < listExt.length; index++) {
      if (ext == listExt[index]) {
        return true;
      }
    }
    return false;
  },
  getFAFileIcon: function (file) {
    if (this.checkFileExt(file, this.EXT_ARCHIVE)) {
      return "fa fa-file-archive-o";
    } else if (this.checkFileExt(file, this.EXT_AUDIO)) {
      return "fa fa-file-audio-o red";
    } else if (this.checkFileExt(file, this.EXT_CODE)) {
      return "fa fa-file-code-o";
    } else if (this.checkFileExt(file, this.EXT_EXCEL)) {
      return "fa fa-file-excel-o green";
    } else if (this.checkFileExt(file, this.EXT_IMAGE)) {
      return "fa fa-file-image-o blue";
    } else if (this.checkFileExt(file, this.EXT_PDF)) {
      return "fa fa-file-pdf-o purple";
    } else if (this.checkFileExt(file, this.EXT_POWERPOINT)) {
      return "fa fa-file-powerpoint-o red";
    } else if (this.checkFileExt(file, this.EXT_TEXT)) {
      return "fa fa-file-text-o";
    } else if (this.checkFileExt(file, this.EXT_VIDEO)) {
      return "fa fa-file-video-o text-danger";
    } else if (this.checkFileExt(file, this.EXT_WORD)) {
      return "fa fa-file-word-o blue";
    } else {
      return "fa fa-file-o";
    }
  },
  getSmallFileIcon: function (file) {
    //return FA icon (bootstrap 3) by extension of file (huyendv)
    if (this.checkFileExt(file, this.EXT_ARCHIVE)) {
      return "file-icon-16 archive-16";
    } else if (this.checkFileExt(file, this.EXT_AUDIO)) {
      return "file-icon-16 audio-16";
    } else if (this.checkFileExt(file, this.EXT_EXCEL)) {
      return "file-icon-16 excel-16";
    } else if (this.checkFileExt(file, this.EXT_IMAGE)) {
      return "file-icon-16 image-16";
    } else if (this.checkFileExt(file, this.EXT_PDF)) {
      return "file-icon-16 pdf-16";
    } else if (this.checkFileExt(file, this.EXT_POWERPOINT)) {
      return "file-icon-16 powerpoint-16";
    } else if (this.checkFileExt(file, this.EXT_TEXT)) {
      return "file-icon-16 text-16";
    } else if (this.checkFileExt(file, this.EXT_VIDEO)) {
      return "file-icon-16 video-16";
    } else if (this.checkFileExt(file, this.EXT_WORD)) {
      return "file-icon-16 word-16";
    } else {
      return "file-icon-16 generic-16";
    }
  },
  getLargeFileIcon: function (file) {
    //return FA icon (bootstrap 3) by extension of file (huyendv)
    if (this.checkFileExt(file, this.EXT_ARCHIVE)) {
      return "file-icon-16 archive-16";
    } else if (this.checkFileExt(file, this.EXT_AUDIO)) {
      return "file-icon-16 audio-16";
    } else if (this.checkFileExt(file, this.EXT_EXCEL)) {
      return "file-icon-16 excel-16";
    } else if (this.checkFileExt(file, this.EXT_IMAGE)) {
      return "file-icon-16 image-16";
    } else if (this.checkFileExt(file, this.EXT_PDF)) {
      return "file-icon-16 pdf-16";
    } else if (this.checkFileExt(file, this.EXT_POWERPOINT)) {
      return "file-icon-16 powerpoint-16";
    } else if (this.checkFileExt(file, this.EXT_TEXT)) {
      return "file-icon-16 text-16";
    } else if (this.checkFileExt(file, this.EXT_VIDEO)) {
      return "file-icon-16 video-16";
    } else if (this.checkFileExt(file, this.EXT_WORD)) {
      return "file-icon-16 word-16";
    } else {
      return "file-icon-16 generic-16";
    }
  },
  getFileIcon: function (file) {
    var ext = iNet.FileFormat.getExtension(file);
    return iNet.FileFormat.getIcon(ext);
  },
  /**
   * change format to ms office
   * @param {int} format- the given document format
   * @return {int}
   */
  changeFormatToMSOffice: function (format) {
    return format + this.NEXT_FORMAT;
  },

  /**
   * change format to openoffice
   * @param {int} format - the given document format
   * @return {int}
   */
  changeFormatToOO: function (format) {
    return format - this.NEXT_FORMAT;
  },
  getSize: function (size) {
    var __size = size || 0;
    var __rageToFix = 2;
    if (__size < 1024) {
      return String.format('{0} B', __size.toFixed(__rageToFix))
    }
    __size = __size / 1024;
    if (__size < 1024) {
      return String.format('{0} KB', __size.toFixed(__rageToFix))
    }
    __size = __size / 1024;
    if (__size < 1024) {
      return String.format('{0} MB', __size.toFixed(__rageToFix))
    }
    __size = __size / 1024;
    if (__size < 1024) {
      return String.format('{0} GB', __size.toFixed(__rageToFix))
    }
  }
};

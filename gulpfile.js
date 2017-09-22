(function () {
  var gulp = require('gulp');
  var zip = require('gulp-zip');
  var UglifyJS = require("uglify-js");
  var CleanCSS = require('clean-css');
  var DateFormat = require('dateformat');

  var fs = require('fs-extra');
  var pathApp = __dirname + '/';
  var pathBuild = getPath('build/');
  var deployPath = '/home/programs/wildfly-10.0.0-final/standalone/module/marketplace/';

  var buildTime;
  var buildName = 'onegate';

  gulp.task('minify-css', function () {
    getFiles(getPath('css'), function (path) {
      var data = readFile(path);
      var minified = new CleanCSS().minify(data).styles;
      path = path.replace('/css/', '/build/css/');
      fs.ensureFileSync(path);
      writeFile(path, minified);
    });
  });

  gulp.task('inet-lib.compile', function () {
    var target = getPathBuild('js/inet/lib'),
        source = getPath('js/inet');
    buildTime = DateFormat(new Date(), 'yymmdd.HHMM');
    compileSource(source, target);
  });

  gulp.task('jquery-plugins.compile', function () {
    var target = getPathBuild('js/jquery/plugins'),
        source = getPath('js/jquery/plugins');
    compileSource(source, target, '#MODULE');
  });

  gulp.task('bootstrap-plugins.compile', function () {
    var target = getPathBuild('js/bootstrap/plugins'),
        source = getPath('js/bootstrap/plugins');
    compileSource(source, target, '#MODULE');
  });

  gulp.task('deploy', ['clean', 'inet-lib.compile', 'jquery-plugins.compile', 'bootstrap-plugins.compile', 'zip'], function () {
    // copy(pathBuild + buildName + '.zip', deployPath + buildName + '.zip');
  });
  // gulp.task('deploy-theme', ['clean', 'inet-lib.compile']);


  gulp.task('zip', function () {
    return gulp.src([
      '{css/**,font/**,images/**,message/**,page/**,widget/**,*.profile,js/jquery/**/*.min.js,js/storage/*.min.js,js/inet/lib/*.min.js,js/ide/**/*.js}',
      'build/**'])
        .pipe(zip(buildName + '.zip'))
        .pipe(gulp.dest('build'));
  });

  gulp.task('clean', function () {
    fs.removeSync('build');
  });

  /**
   * Copy file or folder without error
   * @param from
   * @param to
   */
  function copy(from, to) {
    fs.copy(from, to, function (err) {
      console.log("Copy: " + from + '\nTo:   ' + to);
      if (err) return console.error(err);
      console.log('==== SUCCESS ====');
    });
  }

  /**
   *
   * @param {String} path
   * Path sources folder
   * @param {String} target
   * Path target after compile
   * @param {String} pattern
   * Pattern to get file name. Ex: #PACKAGE|#MODULE|pattern:<file_name_build>
   */
  function compileSource(path, target, pattern) {
    var code = {};
    fs.mkdirsSync(target);
    pattern = pattern || '#PACKAGE';
    pattern += ':\\s*[^\\n\\s]+';
    pattern = new RegExp(pattern);
    getFiles(path, function (path) {
      if (!/.js$/i.test(path))
        return;
      var data = readFile(path),
          name = getFileNameBuild(data, pattern);
      if (name) {
        if (code[name] === undefined)
          code[name] = '';
        code[name] += data;
      }
    });
    for (var name in code) {
      try {
        var content = UglifyJS.minify(code[name], {fromString: true}).code;
        if (name === 'config.min.js')
          content = 'var buildTime="' + buildTime + '";' + content;
        writeFile(target + '/' + name, content);
      } catch (e) {
        console.log('Minify error: ', target + '/' + name);
        console.log('With error: ', e);
        writeFile(target + '/' + name, code[name]);
      }
    }
    code = null;
  }

  function getFiles(path, callback) {
    var files = fs.readdirSync(path);
    files.forEach(function (file) {
      var __path = path + '/' + file;
      if (isPathFile(__path)) {
        callback && callback(__path);
      } else if (isPathDirectory(__path)) {
        getFiles(__path, callback);
      }
    });
  }

  function getFileNameBuild(data, pattern) {
    if (!data)
      return;
    var __ = data.match(pattern);
    if (!__)
      return;
    var name = __ [0].split(':')[1].trim();
    if (name) {
      name += '.min.js';
      return name;
    }
  }

  function isPathFile(path) {
    return fs.lstatSync(path).isFile();
  }

  function isPathDirectory(path) {
    return fs.lstatSync(path).isDirectory();
  }

  function readFile(path) {
    return fs.readFileSync(path, 'utf8');
  }

  function writeFile(file, data) {
    fs.writeFile(file, data);
  }

  function getPath(path) {
    return pathApp + path;
  }

  function getPathBuild(path) {
    return pathBuild + path;
  }
})();
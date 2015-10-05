/*
 * grunt-manifest-concat
 * https://github.com/mcavallo
 *
 * Copyright (c) 2015 Mariano Cavallo
 * Licensed under the MIT license.
 */

'use strict';

exports.init = function(grunt) {
  var exports = {};

  var fs = require('fs'),
      util = require('util'),
      path = require('path'),
      chalk = require('chalk');

  exports.new = function(filePath, dest, options) {
    return new ManifestFile(filePath, dest, options);
  }

  function ManifestFile(filePath, dest, options) {
    this.options = options;
    this.contents = [];
    this._init(filePath, dest);
  }

  ManifestFile.prototype.isValid = function() {
    // Must have files
    if (!this.contents.length)
      return false;

    // Must have a target (dest)
    if (!this.file.target)
      return false;

    return true;
  }

  ManifestFile.prototype.taskName = function() {
    return this.file.taskName;
  }

  ManifestFile.prototype.taskSettings = function() {
    var options = {};

    if (this.options.banner)
      options.banner = '// Manifest: ' + this.file.path + '\n\n';

    if (this.options.sourceMap)
      options.sourceMap = true;

    return ({
      options: options,
      src: this.contents,
      dest: this.file.target
    });
  }

  ManifestFile.prototype._init = function(filePath, dest) {
    grunt.log.writeln('\nProccessing ' + chalk.cyan(filePath));
    var json = grunt.file.readJSON(filePath);
    var pathObject = path.parse(filePath);

    this.file = {
      target: null,
      path: filePath,
      base: pathObject.base,
      dir: pathObject.dir,
      name: pathObject.name,
      taskName: 'manifest_' + pathObject.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')
    };

    // Generate target based on the gruntfile config dest
    this.file.target = this._generateTarget(dest);

    this._readOptions(json.options);
    this._readContents(json.contents);
  };

  ManifestFile.prototype._addFile = function(filePath, skipDuplicated) {
    if (typeof skipDuplicated === 'undefined')
      skipDuplicated = true;

    if (skipDuplicated && this.contents.indexOf(filePath) != -1)
      return;

    this.contents.push(filePath);
    grunt.log.writeln(chalk.green('Added') + ' ' + filePath);
  }

  ManifestFile.prototype._addDirectory = function(dirPath) {
    var self = this;
    if (!grunt.file.isDir(dirPath))
      return false;

    grunt.file.expand(path.join(dirPath, '*.' + self.options.extension)).forEach(function(filePath) {
      self._addFile(filePath);
    });
  }

  ManifestFile.prototype._processDirective = function(type, value) {
    var self = this;
    switch(type) {
      case 'require':
        var subject = path.join(self.file.dir, self.options.cwd, value);
        self._addFile(subject);
      break;
      case 'require_directory':
        var subject = path.join(self.file.dir, value);
        grunt.file.expand(subject).forEach(function(dir) {
          self._addDirectory(dir);
        });
      break;
      default:
        grunt.verbose.error('Directive `' + type + '` unhandled.');
      break;
    }
  }

  ManifestFile.prototype._readContents = function(contents) {
    if (!contents || !(contents instanceof Array))
      return false;

    for (var i = 0, t = contents.length; i < t; i++) {
      // Strings are considered a plain require
      if (typeof contents[i] === 'string') {
        this._processDirective('require', contents[i]);
        continue;
      }

      // If key/value pair is found proceed using the keys as type
      if (contents[i] instanceof Object) {
        for (var key in contents[i]) {
          this._processDirective(key.toLowerCase(), contents[i][key]);
        }
      }
    }
  };

  ManifestFile.prototype._readOptions = function(options) {
    // Options in manifest file take precedence
    // over any previously set options

    if (options) {
      if (typeof options.sourceMap != 'undefined')
        this.options.sourceMap = options.sourceMap ? true : false;

      if (typeof options.banner != 'undefined')
        this.options.banner = options.banner ? true : false;

      if (typeof options.cwd != 'undefined')
        this.options.cwd = options.cwd;
    }

    this._printOptions();
  };

  ManifestFile.prototype._generateTarget = function(value) {
    if (!value)
      return null;

    // If has a point assume It's a file already
    if (value.indexOf('.') > -1)
      return value;

    // Otherwise consider it a directory
    return path.join(value, this.file.name + '.' + this.options.extension);
  }

  ManifestFile.prototype._printOptions = function() {
    if (!grunt.option('verbose'))
      return;

    var values = [];

    for (var key in this.options) {
      values.push(chalk.cyan(
        key + '=' + util.inspect(this.options[key])
      ));
    }

    grunt.verbose.writeln('Options: ' + values.join(', '));
  }

  return exports;
}

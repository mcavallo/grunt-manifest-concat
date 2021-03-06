/*
 * grunt-manifest-concat
 * https://github.com/mcavallo/grunt-manifest-concat
 *
 * Copyright (c) 2015 Mariano Cavallo
 * Licensed under the MIT license.
 */

'use strict';

exports.init = function(grunt) {
  var exports = {};

  var path = require('path'),
      util = require('util'),
      crypto = require('crypto');

  var extend = require('node.extend'),
      chalk = require('chalk');

  exports.new = function(params) {
    return new ManifestFile(params);
  }

  function ManifestFile(params) {
    grunt.log.writeln('\nProccessing ' + chalk.cyan(params.filePath));

    // Cloning with extend to keep the options local this manifest only
    this.options = extend(true, {}, params.options);
    this.contents = [];

    var pathObject = path.parse(params.filePath);

    this.file = {
      target: null,
      taskName: null,
      path: params.filePath,
      base: pathObject.base,
      dir: pathObject.dir,
      name: pathObject.name
    };

    // Reading config from grunt, so expecting only directories
    this.file.target = this._generateTarget(params.dest, false);

    // Unique to this task
    this.file.taskName = this._generateTaskName();

    this._readManifest(params.filePath);
  }

  ManifestFile.prototype.isValid = function() {
    // Must have files and a valid target
    if (!this.contents.length || !this.file.target)
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

  ManifestFile.prototype._addFile = function(filePath) {
    if (!grunt.file.isFile(filePath)) {
      grunt.verbose.error('`' + filePath + '` is not a file.');
      return;
    }

    // Skip duplicated files
    if (this.contents.indexOf(filePath) != -1)
      return;

    this.contents.push(filePath);
    grunt.log.writeln(chalk.green('Added') + ' ' + filePath);
  }

  ManifestFile.prototype._addFilesAtDirByPattern = function(dirPath, pattern) {
    if (!grunt.file.isDir(dirPath)) {
      grunt.verbose.error('`' + dirPath + '` is not a directory.');
      return;
    }

    var self = this;
    grunt.file.expand(path.join(dirPath, pattern)).forEach(function(filePath) {
      self._addFile(filePath);
    });
  }

  ManifestFile.prototype._addDirectory = function(dirPath) {
    this._addFilesAtDirByPattern(dirPath, '*.' + this.options.extension);
  }

  ManifestFile.prototype._addTree = function(dirPath) {
    this._addFilesAtDirByPattern(dirPath, '**/*.' + this.options.extension);
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
      case 'require_tree':
        var subject = path.join(self.file.dir, value);
        grunt.file.expand(subject).forEach(function(dir) {
          self._addTree(dir);
        });
      break;
      default:
        grunt.verbose.error('Directive `' + type + '` unhandled.');
      break;
    }
  }

  ManifestFile.prototype._readManifest = function(filePath) {
    try {
      var json = grunt.file.readJSON(filePath);
      this._readOptions(json.options);
      this._readContents(json.contents);
    } catch (err) {
      grunt.log.warn(err);
    }
  }

  ManifestFile.prototype._readContents = function(contents) {
    if (!contents || !(contents instanceof Array))
      return false;

    for (var i = 0, t = contents.length; i < t; i++) {
      // Strings are considered a plain require
      if (typeof contents[i] === 'string') {
        this._processDirective('require', contents[i]);
      }

      // If key/value pair is found proceed using the keys as type
      else if (contents[i] instanceof Object) {
        for (var key in contents[i])
          this._processDirective(key.toLowerCase(), contents[i][key]);
      }
    }
  };

  ManifestFile.prototype._readOptions = function(options) {
    // Options in manifest file take precedence
    // over any previously set options

    if (options) {
      if (typeof options.sourceMap !== 'undefined')
        this.options.sourceMap = options.sourceMap ? true : false;

      if (typeof options.banner !== 'undefined')
        this.options.banner = options.banner ? true : false;

      if (typeof options.cwd !== 'undefined')
        this.options.cwd = options.cwd;

      if (typeof options.dest !== 'undefined')
        this.file.target = this._generateTarget(options.dest, true);
    }

    this._printOptions();
  };

  ManifestFile.prototype._generateTarget = function(value, filesAllowed) {
    if (!value)
      return null;

    // Attempt to match files
    if (filesAllowed) {
      var ext = '.' + this.options.extension;
      if (value.substr(-ext.length) == ext)
        return value;
    }

    // Otherwise consider it a directory
    return path.join(value, this.file.name + '.' + this.options.extension);
  }

  ManifestFile.prototype._generateTaskName = function() {
    // Use a hash based on the path to prevent taskname collisions
    return (
      'manifest_'
      + this.file.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')
      + '_'
      + crypto.createHash('md5').update(this.file.path).digest('hex').substr(0, 8)
    );
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

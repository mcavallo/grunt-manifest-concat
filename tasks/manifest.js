/*
 * grunt-manifest-concat
 * https://github.com/mcavallo/grunt-manifest-concat
 *
 * Copyright (c) 2015 Mariano Cavallo
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs'),
    path = require('path');

var chalk = require('chalk');

module.exports = function(grunt) {

  var options,
      baseCwd = process.cwd(),
      manifestFile = require('./lib/manifestFile').init(grunt);

  // Solves dependencies not loading if the base was changed on runtime
  var fromBaseCwd = function(callback) {
    var cwd = process.cwd();
    process.chdir(baseCwd);
    callback.call(this);
    process.chdir(cwd);
  }

  var eachSourceDir = function(files, callback) {
    files.forEach(function(f) {
      f.orig.src.forEach(function(src) {
        // Only proceed if the src is a directory
        if (grunt.file.isDir(src))
          callback.call(this, src, f.orig.dest);
        else
          printWarning('Specified source is not a directory.');
      });
    });
  }

  var eachManifest = function(src, dest, options, callback) {
    grunt.file.expand(path.join(src, '*.json')).forEach(function(manifestPath) {
      var manifest = manifestFile.new({
        filePath: manifestPath,
        dest: dest,
        options: options
      });

      if (manifest.isValid())
        callback.call(this, manifest);
    });
  }

  var printWarning = function(msg) {
    grunt.log.writeln(chalk.yellow('SKIPPED ') + ' ' + msg);
  }

  grunt.registerMultiTask('manifest', 'Turn manifest files into concatenated files.', function () {
    var concat = grunt.config.get('concat') || {},
        tasks = [];

    fromBaseCwd(function() {
      // Load dependent tasks
      grunt.loadNpmTasks('grunt-contrib-concat');
    });

    options = this.options({
      sourceMap: false,
      banner: false,
      extension: 'js',
      cwd: ''
    });

    eachSourceDir(this.files, function(src, dest) {
      // Create the concat subtask for each manifest file
      eachManifest(src, dest, options, function(manifest) {
        concat[manifest.taskName()] = manifest.taskSettings();
        tasks.push(manifest.taskName());
      });
    });

    // Only proceed if any tasks were added
    if (!tasks.length)
      return;

    // Add module subtasks to the concat task in initConfig
    grunt.config.set('concat', concat);

    // Run all the defined tasks
    for (var i = 0, t = tasks.length; i < t; i++)
      grunt.task.run('concat:' + tasks[i]);
  });
};

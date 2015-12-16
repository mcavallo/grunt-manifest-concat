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

  var findManifests = function(source) {
    var manifests = [];
    source.forEach(function(f) {
      if (grunt.file.isFile(f) && f.substr(-4) === 'json' && manifests.indexOf(f) === -1) {
        manifests.push(f);
      } else if (grunt.file.isDir(f)) {
        manifests = manifests.concat(findManifests(grunt.file.expand(path.join(f, '*.json'))));
      }
    });
    return manifests;
  }

  var printWarning = function(msg) {
    grunt.log.writeln(chalk.yellow('SKIPPED ') + ' ' + msg);
  }

  grunt.registerMultiTask('manifest', 'Turn manifest files into concatenated files.', function () {
    var concat = grunt.config.get('concat') || {},
        tasks = [];

    grunt.task.loadTasks('grunt-contrib-concat');

    options = this.options({
      sourceMap: false,
      banner: false,
      extension: 'js',
      cwd: ''
    });

    var dest = this.files[0].dest;
    findManifests(this.files[0].src).forEach(function(manifestPath) {
      var manifest = manifestFile.new({
        filePath: manifestPath,
        dest: dest,
        options: options
      });

      if (manifest.isValid()) {
        // Create the concat subtask for each manifest file
        concat[manifest.taskName()] = manifest.taskSettings();
        tasks.push(manifest.taskName());
      }
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

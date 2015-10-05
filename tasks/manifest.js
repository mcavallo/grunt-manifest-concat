/*
 * grunt-manifest-concat
 * https://github.com/mcavallo
 *
 * Copyright (c) 2015 Mariano Cavallo
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs'),
    path = require('path'),
    chalk = require('chalk');

module.exports = function(grunt) {

  var options,
      manifestFile = require('./lib/manifestFile').init(grunt);

  grunt.registerMultiTask('manifest', 'Turn manifest files into concatenated files.', function () {

    var concat = grunt.config.get('concat') || {},
        tasks = [];

    // Load dependent tasks
    grunt.loadNpmTasks('grunt-contrib-concat');

    options = this.options({
      sourceMap: false,
      banner: false,
      extension: 'js',
      cwd: ''
    });

    this.files.forEach(function(f) {
      f.orig.src.forEach(function(src) {
        // Only proceed if the src is a directory
        if (!grunt.file.isDir(src))
          return grunt.log.writeln(chalk.yellow('SKIPPED ') + ' Specified source is not a directory.');

        // If dest is set, It should be a directory
        if (!grunt.file.isDir(f.orig.dest))
          return grunt.log.writeln(chalk.yellow('SKIPPED ') + ' Specified destination is not a directory.');

        // Scan the directory for manifest files
        grunt.file.expand(path.join(src, '*.json')).forEach(function(manifestPath) {
          var manifest = manifestFile.new(manifestPath, f.orig.dest, options);

          // Skip manifest if It's invalid
          if (!manifest.isValid())
            return;

          // Create the concat subtask for each manifest file
          concat[manifest.taskName()] = manifest.taskSettings();
          tasks.push(manifest.taskName());
        });
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

/*
 * grunt-manifest-concat
 * https://github.com/mcavallo/grunt-manifest-concat
 *
 * Copyright (c) 2015 Mariano Cavallo
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var path = require('path');

  grunt.initConfig({
    clean: {
      tests: ['tmp']
    },

    manifest: {
      directives: {
        src: 'test/fixtures/directives',
        dest: 'tmp/directives'
      },
      options_set_1: {
        options: {
          sourceMap: true,
          banner: true
        },
        src: 'test/fixtures/options_set_1',
        dest: 'tmp/options_set_1'
      },
      options_set_2: {
        options: {
          sourceMap: false,
          banner: false
        },
        src: 'test/fixtures/options_set_2',
        dest: 'tmp/options_set_2'
      },
      options_set_3: {
        options: {
          extension: 'asdf'
        },
        src: 'test/fixtures/options_set_3',
        dest: 'tmp/options_set_3'
      },
      without_dest: {
        src: 'test/fixtures/without_dest'
      }
    },

    nodeunit: {
      tests: ['test/*_test.js'],
      options: {
        reporter: 'nested'
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  grunt.registerTask('test', ['clean', 'manifest', 'nodeunit']);
  grunt.registerTask('default', ['test']);

};

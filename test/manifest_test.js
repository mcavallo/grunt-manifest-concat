'use strict';

var grunt = require('grunt'),
    testCase = require('nodeunit').testCase,
    helpers = require('./helpers.js');

// TODO: generated name = manifest name + extension

module.exports = testCase({
  "directives": testCase({
    "require": testCase({
      "files in the right order": function(test) {
        test.equal(
          helpers.normalizedFile('tmp/directives/require.js'),
          helpers.normalizedFile('test/expected/directives/require.js')
        );
        test.done();
      },
      "short version by passing a string": function(test) {
        test.equal(
          helpers.normalizedFile('tmp/directives/require_short.js'),
          helpers.normalizedFile('test/expected/directives/require_short.js')
        );
        test.done();
      },
      "skips invalid files": function(test) {
        test.equal(
          helpers.normalizedFile('tmp/directives/require_fail.js'),
          helpers.normalizedFile('test/expected/directives/require_fail.js')
        );
        test.done();
      }
    }),
    "require_directory": testCase({
      "files in the right order": function(test) {
        test.equal(
          helpers.normalizedFile('tmp/directives/require_directory.js'),
          helpers.normalizedFile('test/expected/directives/require_directory.js')
        );
        test.done();
      },
      "require before require_directory": function(test) {
        test.equal(
          helpers.normalizedFile('tmp/directives/require_directory_require.js'),
          helpers.normalizedFile('test/expected/directives/require_directory_require.js')
        );
        test.done();
      }
    }),
    "require_tree": testCase({
      "files in the right order": function(test) {
        test.equal(
          helpers.normalizedFile('tmp/directives/require_tree.js'),
          helpers.normalizedFile('test/expected/directives/require_tree.js')
        );
        test.done();
      },
      "require before require_tree": function(test) {
        test.equal(
          helpers.normalizedFile('tmp/directives/require_tree_require.js'),
          helpers.normalizedFile('test/expected/directives/require_tree_require.js')
        );
        test.done();
      },
      "require_directory before require_tree": function(test) {
        test.equal(
          helpers.normalizedFile('tmp/directives/require_tree_directory.js'),
          helpers.normalizedFile('test/expected/directives/require_tree_directory.js')
        );
        test.done();
      }
    })
  }),
  "options": testCase({
    "sourceMap": testCase({
      "generated when `true`": function(test) {
        test.equal(grunt.file.exists('tmp/options_set_1/manifest.js.map'), true);
        test.done();
      },
      "skipped when `false`": function(test) {
        test.equal(grunt.file.exists('tmp/options_set_2/manifest.js.map'), false);
        test.done();
      }
    }),
    "banner": testCase({
      "included when `true`": function(test) {
        var contents = helpers.normalizedFile('tmp/options_set_1/manifest.js');
        test.equal(contents.indexOf('// Manifest:'), 0);
        test.done();
      },
      "skipped when `false`": function(test) {
        var contents = helpers.normalizedFile('tmp/options_set_2/manifest.js');
        test.equal(contents.indexOf('// Manifest:'), -1);
        test.done();
      },
      "includes manifest name": function(test) {
        var contents = helpers.normalizedFile('tmp/options_set_1/manifest.js');
        test.equal(contents.indexOf('// Manifest: test/fixtures/options_set_1/manifest.json'), 0);
        test.done();
      }
    }),
    "extension": testCase({
      "defaults to `js`": function(test) {
        test.equal(grunt.file.exists('tmp/options_set_1/manifest.js'), true);
        test.done();
      },
      "is used to generate the `dest` filename": function(test) {
        test.equal(grunt.file.exists('tmp/options_set_3/manifest.asdf'), true);
        test.done();
      }
    })
  }),
  "without `dest` in grunt config": testCase({
    "read `dest` from manifest": testCase({
      "`directory` is provided then generate filename": function(test) {
        test.equal(grunt.file.exists('tmp/without_dest/name_generated.js'), true);
        test.done();
      },
      "`full path` is provided then use it": function(test) {
        test.equal(grunt.file.exists('tmp/without_dest/some_other_name.js'), true);
        test.done();
      }
    })
  })
});

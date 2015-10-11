var grunt = require('grunt');

module.exports = {
  normalizedFile: function (filepath) {
    return grunt.util.normalizelf(grunt.file.read(filepath));
  }
};

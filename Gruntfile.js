module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var argv = require('yargs').argv,
    reporter = argv.reporter? argv.reporter : 'spec';
  grunt.initConfig({
    jshint: {
      files: ['*.js', 'lib/**/*.js', 'tests/**/*.js'],
      options: {
        curly: true,
        forin: true,
        latedef: true,
        noarg: true,
        // our coding style standard is 80 but be nice here
        maxlen: 120,
        quotmark: 'single',
        undef: true,

        // environment options to help determine what 'undef' should warn on
        devel: true,
        node: true,
        nonstandard: true,
        predef: [
          'callback', // Used by mocha
          'describe', // Used by mocha
          'it', // Used by mocha
          'before', // Used by mocha
          'beforeEach', // Used by mocha
          'after', // Used by mocha
          'afterEach' // Used by mocha
        ]
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['tests/**/*.js']
      }
    }
  });

  grunt.registerTask('test', 'mochaTest');
  grunt.registerTask('default', ['jshint', 'test']);
};

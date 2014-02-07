module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'), // the package file to use

    nodeunit: {
      all: ['test/*.test.js']
    },

    watch: {
      lib: {
        files: ['lib/*.js'],
        tasks: ['nodeunit']
      },
      reports: {
        files: ['out/*.prg'],
        options: {
          livereload: 1337
        }
      },
      test: {
        files: ['test/*.js', 'test/*.html', '*.js'],
        tasks: ['nodeunit']
      }
    },

    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        options: {
          paths: '.',
          outdir: 'docs/'
        }
      }
    }

  });

  // load up your plugins
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');

  // register one or more task lists (you should ALWAYS have a "default" task list)
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('build', ['yuidoc']);

};
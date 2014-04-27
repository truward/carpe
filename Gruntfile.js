module.exports = function(grunt) {

  var sources = ['js/module.js', 'js/domain-object.js', 'js/view.js'];

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: sources,
        dest: 'target/<%= pkg.name %>.min.js'
      }
    },

    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: ''
      },
      dist: {
        src: sources,
        dest: 'target/<%= pkg.name %>.js'
      }
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default tasks
  grunt.registerTask('default', ['uglify', 'concat']);
};


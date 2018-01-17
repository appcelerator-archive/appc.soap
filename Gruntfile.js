module.exports = function (grunt) {
	// Project configuration.
  grunt.initConfig({
    mocha_istanbul: {
      coverage: {
        src: 'test',
        options: {
          timeout: 30000,
          ignoreLeaks: false
        }
      }
    },
    clean: ['tmp']
  })

	// Load grunt plugins for modules.
  grunt.loadNpmTasks('grunt-mocha-istanbul')
  grunt.loadNpmTasks('grunt-contrib-clean')

	// Register tasks.
  grunt.registerTask('default', ['mocha_istanbul:coverage', 'clean'])
}

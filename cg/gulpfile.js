var gulp = require('gulp');
var electron = require('gulp-electron');
var packageJSON = require('./package.json');

gulp.task('build', function build() {
  gulp.src("")
  .pipe(electron({
      src: './src',
      packageJson: packageJSON,
      release: './release',
      cache: './cache',
      version: 'v1.3.4',
      packaging: true,
      // token: 'abc123...',
      platforms: ['win32-ia32'],
      platformResources: {
          win: {
              "version-string": packageJSON.version,
              "file-version": packageJSON.version,
              "product-version": packageJSON.version
              // "icon": 'gulp-electron.ico'
          }
      }
  }))
  .pipe(gulp.dest(""));
});

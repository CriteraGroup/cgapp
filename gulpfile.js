var gulp = require('gulp');
var scss = require('gulp-sass');

gulp.task('styles', function styles() {
  gulp.src('./src/**/*.scss')
  .pipe(scss({
    outputStyle: 'compress'
  }))
  .pipe(gulp.dest('src/styles'));
})

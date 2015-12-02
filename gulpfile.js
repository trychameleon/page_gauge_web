var gulp         = require('gulp')
var less         = require('gulp-less')
var minifyCSS    = require('gulp-minify-css')
var autoprefixer = require('gulp-autoprefixer')
var rename       = require('gulp-rename')
var sourcemaps   = require('gulp-sourcemaps')
var connect      = require('gulp-connect')
var open         = require('gulp-open')

gulp.task('default', ['server', 'less', 'watch'])

gulp.task('watch', function () {
  gulp.watch('./src/**/*.less', ['less']);
})

gulp.task('server', function () {
  connect.server({
    port: 9001,
    livereload: true
  })
})

// Compile Less and Run UnCSS
gulp.task('less', function () {
  return gulp.src('./src/pagegauge.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(minifyCSS())
    .pipe(autoprefixer())
    .pipe(rename({
      suffix: '.min'
    }))
    //.pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./css'))
})


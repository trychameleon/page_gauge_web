var gulp         = require('gulp')
var path         = require('path')
var less         = require('gulp-less')
var autoprefixer = require('gulp-autoprefixer')
var sourcemaps   = require('gulp-sourcemaps')
var minifyCSS    = require('gulp-minify-css')
var rename       = require('gulp-rename')
var concat       = require('gulp-concat')
var uglify       = require('gulp-uglify')
var connect      = require('gulp-connect')
var open         = require('gulp-open')
var uncss        = require('gulp-uncss')

var Paths = {
  HERE                 : './',
  DIST                 : 'dist',
  DIST_TOOLKIT_JS      : 'dist/toolkit-pagegauge.js',
  LESS_TOOLKIT_SOURCES : './less/pagegauge.less',
  LESS                 : './less/**/**',
  JS                   : [
      './js/bootstrap/transition.js',
      './js/bootstrap/alert.js',
      './js/bootstrap/affix.js',
      './js/bootstrap/button.js',
      './js/bootstrap/collapse.js',
      './js/bootstrap/dropdown.js',
      './js/bootstrap/modal.js',
      './js/bootstrap/tooltip.js',
      './js/bootstrap/popover.js',
      './js/bootstrap/scrollspy.js',
      './js/bootstrap/tab.js',
      './js/custom/*'
    ]
}

gulp.task('default', ['less', 'js-min'])

gulp.task('watch', function () {
  gulp.watch(Paths.LESS, ['less']);
  gulp.watch(Paths.JS,   ['js-min']);
})

gulp.task('server', function () {
  connect.server({
    port: 9001,
    livereload: true
  })
})

gulp.task('less', function () {
  return gulp.src(Paths.LESS_TOOLKIT_SOURCES)
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(uncss({
      html: ['index.html', 'http://localhost:9001']
    }))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write(Paths.HERE))
    .pipe(gulp.dest('dist'))
})

gulp.task('js', function () {
  return gulp.src(Paths.JS)
    .pipe(concat('toolkit-pagegauge.js'))
    .pipe(gulp.dest(Paths.DIST))
})

gulp.task('js-min', ['js'], function () {
  return gulp.src(Paths.DIST_TOOLKIT_JS)
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(Paths.DIST))
})

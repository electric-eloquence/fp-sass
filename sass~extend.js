'use strict';

var conf = global.conf;
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var utilsGulp = require('../../../gulp/utils');

gulp.task('sass', function () {
  return gulp.src('./' + conf.src + '/css-processors/scss/*.scss')
    .pipe(plugins.sass({
      outputStyle: 'expanded',
      sourceComments: true
    }))
    .on('error', plugins.sass.logError)
    .pipe(gulp.dest('./' + conf.src + '/_styles'));
});

// This runs the CSS processor without outputting line comments.
// You probably want this to process CSS destined for production.
gulp.task('sass:no-comments', function () {
  return gulp.src('./' + conf.src + '/css-processors/scss/*.scss')
    .pipe(plugins.sass({
      outputStyle: 'expanded',
      sourceComments: false
    }))
    .on('error', plugins.sass.logError)
    .pipe(gulp.dest('./' + conf.src + '/_styles'));
});

gulp.task('sass:frontend-copy', function (cb) {
  runSequence(
    'sass:compile-no-comments',
    'patternlab:copy-styles',
    cb
  );
});

gulp.task('sass:watch', function () {
  gulp.watch('./' + conf.src + '/css-processors/scss/**/*.scss', ['sass']);
});

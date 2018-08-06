'use strict';

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const runSequence = require('run-sequence');

const appDir = global.appDir;
const conf = global.conf;

const cssBldDir = conf.ui.paths.source.cssBld;
const cssSrcDir = conf.ui.paths.source.cssSrc;

gulp.task('sass', function () {
  return gulp.src(cssSrcDir + '/sass/*@(.sass|.scss)')
    .pipe(plugins.sass({
      outputStyle: 'expanded',
      sourceComments: true
    }))
    .on('error', plugins.sass.logError)
    .pipe(gulp.dest(cssBldDir));
});

gulp.task('sass:once', ['sass']);

// This runs the CSS processor without outputting line comments.
// You probably want this to process CSS destined for production.
gulp.task('sass:no-comment', function () {
  return gulp.src(cssSrcDir + '/sass/*@(.sass|.scss)')
    .pipe(plugins.sass({
      outputStyle: 'expanded',
      sourceComments: false
    }))
    .on('error', plugins.sass.logError)
    .pipe(gulp.dest(cssBldDir));
});

gulp.task('sass:frontend-copy', function (cb) {
  runSequence(
    'sass:no-comment',
    'ui:copy-styles',
    cb
  );
});

gulp.task('sass:watch', function () {
  gulp.watch('sass/**', {cwd: cssSrcDir}, ['sass']);
});

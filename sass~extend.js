'use strict';

const conf = global.conf;
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const runSequence = require('run-sequence');

const appDir = global.appDir;
const utilsCore = require(`${appDir}/core/lib/utils`);
const utilsTask = require(`${appDir}/tasker/utils`);

const cssBldDir = utilsCore.pathResolve(conf.ui.paths.source.cssBld);
const cssSrcDir = utilsCore.pathResolve(conf.ui.paths.source.cssSrc);

gulp.task('sass', function () {
  return gulp.src(cssSrcDir + '/sass/*.s(a|c)ss')
    .pipe(plugins.sass({
      outputStyle: 'expanded',
      sourceComments: true
    }))
    .on('error', plugins.sass.logError)
    .pipe(gulp.dest(cssBldDir));
});

// This runs the CSS processor without outputting line comments.
// You probably want this to process CSS destined for production.
gulp.task('sass:no-comments', function () {
  return gulp.src(cssSrcDir + '/sass/*.s(a|c)ss')
    .pipe(plugins.sass({
      outputStyle: 'expanded',
      sourceComments: false
    }))
    .on('error', plugins.sass.logError)
    .pipe(gulp.dest(cssBldDir));
});

gulp.task('sass:frontend-copy', function (cb) {
  runSequence(
    'sass:compile-no-comments',
    'patternlab:copy-styles',
    cb
  );
});

gulp.task('sass:watch', function () {
  gulp.watch('sass/**', {cwd: cssSrcDir}, ['sass']);
});

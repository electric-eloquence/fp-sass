'use strict';

const {Transform} = require('stream');

const gulp = global.gulp || require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const utils = require('fepper-utils');

const conf = global.conf;
const pref = global.pref;

// Set up pref.sass.
pref.sass = pref.sass || {};

// Opt for expanded output and line comments by default.
if (typeof pref.sass.outputStyle === 'undefined') {
  pref.sass.outputStyle = 'expanded';
}
if (pref.sass.sourceComments !== false) {
  pref.sass.sourceComments = true;
}

const cssBldDir = conf.ui.paths.source.cssBld;
const cssSrcDir = conf.ui.paths.source.cssSrc;

const streamUntouched = () => new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  transform(file, enc, cb) {
    this.push(file);
    cb();
  }
});

function getSourcemapDest() {
  if (
    pref.sass.sourceComments === false &&
    pref.sass.sourceMap &&
    (!pref.sass.sourceMapContents || !pref.sass.sourceMapEmbed)
  ) {
    return '.';
  }

  return;
}

function getSourceRoot() {
  if (
    pref.sass.sourceComments === false &&
    pref.sass.sourceMap
  ) {
    let sourceRoot;

    if (pref.sass.sourceMapRoot) {
      sourceRoot = pref.sass.sourceMapRoot;
    }
    else {
      const uiSourceDirRel = conf.ui.pathsRelative.source.root;
      const cssSrcDirRel = conf.ui.pathsRelative.source.cssSrc;

      if (cssSrcDirRel.indexOf(uiSourceDirRel) === 0) {
        const nestedDirs = cssSrcDirRel.slice(uiSourceDirRel.length);
        let i = nestedDirs.split('/').length;
        sourceRoot = '';

        while (i--) {
          sourceRoot += '../';
        }

        sourceRoot += `${cssSrcDirRel}/sass`;
      }
    }

    return {sourceRoot};
  }

  return;
}

// Declare gulp tasks.

gulp.task('sass', function () {
  let sourcemapsInit = sourcemaps.init;
  let sourcemapsWrite = sourcemaps.write;

  // Do not write sourcemaps if pref.sass.sourceMap is falsey.
  // Do not write sourcemaps if sourceComments === true, as the sourcemaps may be inaccurate and the line comments
  // redundant.
  if (!pref.sass.sourceMap || pref.sass.sourceComments) {
    sourcemapsInit = () => {
      return streamUntouched();
    };
    sourcemapsWrite = () => {
      return streamUntouched();
    };
  }

  return gulp.src(cssSrcDir + '/sass/*@(.sass|.scss)')
    .pipe(sourcemapsInit())
    .pipe(sass(pref.sass))
    .on('error', sass.logError)
    .pipe(sourcemapsWrite(getSourcemapDest(), getSourceRoot()))
    .pipe(gulp.dest(cssBldDir));
});

gulp.task('sass:frontend-copy', function (cb) {
  gulp.runSequence(
    'sass:no-comment',
    cb
  );
});

// This runs the CSS processor without outputting line comments.
// You probably want this to preprocess CSS destined for production.
gulp.task('sass:no-comment', function () {
  const prefSassClone = Object.assign({}, pref.sass, {sourceComments: false});

  return gulp.src(cssSrcDir + '/sass/*@(.sass|.scss)')
    .pipe(sass(prefSassClone))
    .on('error', sass.logError)
    .pipe(gulp.dest(cssBldDir));
});

gulp.task('sass:once', ['sass']);

gulp.task('sass:watch', function () {
  // Return the watcher so it can be closed after testing.
  return gulp.watch('sass/**/*', {cwd: cssSrcDir}, ['sass']);
});

gulp.task('sass:watch-no-comment', function () {
  // Return the watcher so it can be closed after testing.
  return gulp.watch('sass/**/*', {cwd: cssSrcDir}, ['sass:no-comment']);
});

gulp.task('sass:help', function (cb) {
  let out = `
Fepper Sass Extension

Use:
    <task> [<additional args>...]

Tasks:
    fp sass                     Build Fepper's Sass files into frontend CSS.
    fp sass:frontend-copy       Copy Sass-built frontend CSS to backend.
    fp sass:no-comment          Like 'fp sass' but without line comments.
    fp sass:once                Same as 'fp sass'.
    fp sass:watch               Watch for modifications to Sass files and build when modified.
    fp sass:watch-no-comment    Like 'fp sass:watch' but without line comments.
    fp sass:help                Print fp-sass tasks and descriptions.
`;

  utils.info(out);
  cb();
});

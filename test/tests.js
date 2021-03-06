'use strict';

const fs = require('fs-extra');
const {dirname, extname} = require('path');

const {expect} = require('chai');

// Instantiate gulp and assign it to the fp const.
process.env.ROOT_DIR = __dirname;
const fp = require('fepper/tasker');
require('../sass~extend');

const conf = global.conf;
const pref = global.pref;

const pubCssBldDir = conf.ui.paths.public.cssBld;
const srcCssBldDir = conf.ui.paths.source.cssBld;
const srcCssSrcDir = conf.ui.paths.source.cssSrc;

const cssHtml = 'html {\n  font-size: 62.5%;\n}';
const cssBody = `body {
  background: white;
  font: 1.6em/1.5 Helvetica, "Nimbus Sans L", "Liberation Sans", Roboto, sans-serif;
  color: #333333;
  min-height: 100vh;
  padding-bottom: 5rem;
  position: relative;
}
`;
const cssA = `a {
  color: #333333;
}
`;
const cssPseudoClass = `a:hover, a:focus {
  color: gray;
}`;
const enc = 'utf8';
const styleBack = `${__dirname}/backend/${pref.backend.synced_dirs.styles_dir}/bld/style.css`;
const styleBld = `${srcCssBldDir}/style.css`;
const styleLocalPref = `${srcCssBldDir}/local-pref.css`;
const styleSass = `${srcCssSrcDir}/sass/style.sass`;
const styleScss = `${srcCssSrcDir}/sass/local-pref.scss`;
const styleWatchCss = `${srcCssBldDir}/watch-fixture.css`;
const styleWatchSass = `${srcCssSrcDir}/sass/watch-fixture.sass`;
const sourcemap = `${styleBld}.map`;
const sassHtml = 'html\n  font-size: 62.5%\n';

function rmSrcCssBldFiles(files) {
  for (const file of files) {
    if (extname(file) === '.css') {
      fs.unlinkSync(`${srcCssBldDir}/${file}`);
    }
  }
}

function rmSrcCssMapFiles(files) {
  for (const file of files) {
    if (extname(file) === '.map') {
      fs.unlinkSync(`${srcCssBldDir}/${file}`);
    }
  }
}

describe('fp-sass', function () {
  describe('fp sass', function () {
    let styleBldExistsBefore;
    let styleLocalPrefExistsBefore;

    before(function (done) {
      fs.readdir(srcCssBldDir, (err, files) => {
        rmSrcCssBldFiles(files);

        styleBldExistsBefore = fs.existsSync(styleBld);
        styleLocalPrefExistsBefore = fs.existsSync(styleLocalPref);

        fp.runSeq(
          'sass',
          done
        );
      });
    });

    it('renders SASS syntax into CSS', function () {
      const styleBldCss = fs.readFileSync(styleBld, enc);
      const styleSassSass = fs.readFileSync(styleSass, enc);

      expect(styleBldExistsBefore).to.be.false;

      expect(styleBldCss).to.have.string(cssBody);
      expect(styleBldCss).to.have.string(cssA);
      expect(styleBldCss).to.have.string(cssPseudoClass);

      expect(styleSassSass).to.not.have.string('{');
      expect(styleSassSass).to.not.have.string(';');
      expect(styleSassSass).to.not.have.string('}');
    });

    it('renders SCSS syntax into CSS', function () {
      const styleLocalPrefCss = fs.readFileSync(styleLocalPref, enc);
      const styleScssScss = fs.readFileSync(styleScss, enc);

      expect(styleLocalPrefExistsBefore).to.be.false;

      expect(styleLocalPrefCss).to.have.string(cssBody);
      expect(styleLocalPrefCss).to.have.string(cssA);
      expect(styleLocalPrefCss).to.have.string(cssPseudoClass);

      expect(styleScssScss).to.have.string('{');
      expect(styleScssScss).to.have.string(';');
      expect(styleScssScss).to.have.string('}');
    });

    it('accepts custom options', function (done) {
      pref.sass.outputStyle = 'compressed';

      fp.runSeq(
        'sass',
        () => {
          const styleBldCss = fs.readFileSync(styleBld, enc);

          expect(styleBldCss).to.have.string('body{background:#fff;font:1.6em/1.5 Helvetica,"Nimbus Sans L","Liberation Sans",Roboto,sans-serif;color:#333;min-height:100vh;padding-bottom:5rem;position:relative}a{color:#333}a:hover,a:focus{color:gray}');

          pref.sass.outputStyle = 'expanded';

          done();
        }
      );
    });

    describe('sourcemapping', function () {
      let sourcemapExistsBefore;

      before(function (done) {
        fs.readdir(srcCssBldDir, (err, files) => {
          rmSrcCssMapFiles(files);

          pref.sass.sourceMap = true;

          done();
        });
      });

      beforeEach(function (done) {
        fs.readdir(srcCssBldDir, (err, files) => {
          rmSrcCssMapFiles(files);

          sourcemapExistsBefore = fs.existsSync(sourcemap);

          done();
        });
      });

      it('writes a sourcemap inline if configured to so', function (done) {
        pref.sass.sourceMapContents = true;
        pref.sass.sourceMapEmbed = true;

        fp.runSeq(
          'sass',
          () => {
            const sourcemapExistsAfter = fs.existsSync(sourcemap);
            const styleBldCss = fs.readFileSync(styleBld, enc);

            expect(sourcemapExistsBefore).to.be.false;
            expect(sourcemapExistsAfter).to.be.false;
            expect(styleBldCss).to.have.string('/*# sourceMappingURL=data:application/json;');

            fs.copyFileSync(styleBld, `${pubCssBldDir}/sourcemap-inline.css`);
            delete pref.sass.sourceMapContents;
            delete pref.sass.sourceMapEmbed;

            done();
          }
        );
      });

      it('writes a sourcemap file if configured to do so', function (done) {
        fp.runSeq(
          'sass',
          () => {
            const sourcemapExistsAfter = fs.existsSync(sourcemap);
            const sourcemapJson = fs.readJsonSync(sourcemap);
            const styleBldCss = fs.readFileSync(styleBld, enc);

            expect(sourcemapExistsBefore).to.be.false;
            expect(sourcemapExistsAfter).to.be.true;
            expect(sourcemapJson).to.have.property('version');
            expect(sourcemapJson).to.have.property('sources');
            expect(sourcemapJson).to.have.property('names');
            expect(sourcemapJson).to.have.property('mappings');
            expect(sourcemapJson).to.have.property('file');
            expect(styleBldCss).to.have.string('/*# sourceMappingURL=');

            done();
          }
        );
      });

      it('writes a sourcemap file with a custom sourceRoot if configured to so', function (done) {
        pref.sass.sourceMapRoot = '/foo/bar';

        fp.runSeq(
          'sass',
          () => {
            const sourcemapExistsAfter = fs.existsSync(sourcemap);
            const sourcemapJson = fs.readJsonSync(sourcemap);
            const styleBldCss = fs.readFileSync(styleBld, enc);

            expect(sourcemapExistsBefore).to.be.false;
            expect(sourcemapExistsAfter).to.be.true;
            expect(sourcemapJson.sourceRoot).to.equal(pref.sass.sourceMapRoot);
            expect(styleBldCss).to.have.string('/*# sourceMappingURL=');

            fs.copyFileSync(styleBld, styleBld.replace(srcCssBldDir, pubCssBldDir));
            fs.copyFileSync(sourcemap, sourcemap.replace(srcCssBldDir, pubCssBldDir));
            delete pref.sass.sourceMapRoot;

            done();
          }
        );
      });
    });
  });

  describe('fp sass:frontend-copy', function () {
    const styleBackAlt = `${__dirname}/backend/docroot/local-pref/local-pref.css`;
    let styleBackExistsBefore;
    let styleBackAltExistsBefore;
    let styleBldExistsBefore;
    let styleLocalPrefExistsBefore;

    before(function (done) {
      fs.readdir(srcCssBldDir, (err, files) => {
        rmSrcCssBldFiles(files);

        if (fs.existsSync(styleBack)) {
          fs.emptyDirSync(dirname(styleBack));
        }
        if (fs.existsSync(styleBackAlt)) {
          fs.emptyDirSync(dirname(styleBackAlt));
        }

        styleBackExistsBefore = fs.existsSync(styleBack);
        styleBackAltExistsBefore = fs.existsSync(styleBackAlt);
        styleBldExistsBefore = fs.existsSync(styleBld);
        styleLocalPrefExistsBefore = fs.existsSync(styleLocalPref);

        fp.runSeq(
          'sass:frontend-copy',
          'frontend-copy',
          done
        );
      });
    });

    it('compiles Sass and copy it to the backend', function () {
      const styleBackCss = fs.readFileSync(styleBack, enc);
      const styleBackAltCss = fs.readFileSync(styleBackAlt, enc);
      const styleBldCss = fs.readFileSync(styleBld, enc);
      const styleLocalPrefCss = fs.readFileSync(styleLocalPref, enc);

      expect(styleBackExistsBefore).to.be.false;
      expect(styleBackAltExistsBefore).to.be.false;

      expect(styleBldExistsBefore).to.be.false;
      expect(styleLocalPrefExistsBefore).to.be.false;

      expect(styleBldCss).to.not.have.string('/* line ');
      expect(styleLocalPrefCss).to.not.have.string('/* line ');

      expect(styleBldCss).to.equal(styleBackCss);
      expect(styleLocalPrefCss).to.equal(styleBackAltCss);
    });
  });

  describe('fp sass:once', function () {
    let styleBldExistsBefore;
    let styleLocalPrefExistsBefore;

    before(function (done) {
      fs.readdir(srcCssBldDir, (err, files) => {
        rmSrcCssBldFiles(files);

        styleBldExistsBefore = fs.existsSync(styleBld);
        styleLocalPrefExistsBefore = fs.existsSync(styleLocalPref);

        fp.runSeq(
          'sass:once',
          done
        );
      });
    });

    it('is an alias for `fp sass`', function () {
      const styleBldCss = fs.readFileSync(styleBld, enc);
      const styleLocalPrefCss = fs.readFileSync(styleLocalPref, enc);

      expect(styleBldExistsBefore).to.be.false;
      expect(styleLocalPrefExistsBefore).to.be.false;

      expect(styleBldCss).to.have.string(cssBody);
      expect(styleBldCss).to.have.string(cssA);
      expect(styleBldCss).to.have.string(cssPseudoClass);
      expect(styleLocalPrefCss).to.have.string(cssBody);
      expect(styleLocalPrefCss).to.have.string(cssA);
      expect(styleLocalPrefCss).to.have.string(cssPseudoClass);
    });
  });

  describe('fp sass:watch', function () {
    before(function (done) {
      fs.readdir(srcCssBldDir, (err, files) => {
        rmSrcCssBldFiles(files);

        if (fs.existsSync(styleWatchSass)) {
          fs.unlinkSync(styleWatchSass);
        }

        done();
      });
    });

    after(function (done) {
      fs.readdir(srcCssBldDir, (err, files) => {
        rmSrcCssBldFiles(files);

        if (fs.existsSync(styleWatchSass)) {
          fs.unlinkSync(styleWatchSass);
        }

        done();
      });
    });

    it('compiles SASS into bld CSS when a SASS partial is modified', function (done) {
      const sass = fs.readFileSync(styleSass, enc);
      const watcher = fp.tasks['sass:watch'].fn();

      setTimeout(() => {
        fs.writeFileSync(styleWatchSass, sass + sassHtml);
        setTimeout(() => {
          const css = fs.readFileSync(styleWatchCss, enc);

          expect(css).to.have.string(cssHtml);
          expect(css).to.have.string(cssBody);
          expect(css).to.have.string(cssA);
          expect(css).to.have.string(cssPseudoClass);

          watcher.close();
          done();
        }, 500);
      }, 100);
    });
  });

  describe('fp sass:help', function () {
    it('prints help text', function (done) {
      fp.runSeq(
        'sass:help',
        done
      );
    });
  });
});

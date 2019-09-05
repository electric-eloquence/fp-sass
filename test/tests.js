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

const cssHtml = 'html {\n  font-size: 62.5%;\n}\n';
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
}
`;
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
  for (let file of files) {
    if (extname(file) === '.css') {
      fs.unlinkSync(`${srcCssBldDir}/${file}`);
    }
  }
}

function rmSrcCssMapFiles(files) {
  for (let file of files) {
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

      expect(styleBldCss).to.contain(cssBody);
      expect(styleBldCss).to.contain(cssA);
      expect(styleBldCss).to.contain(cssPseudoClass);

      expect(styleSassSass).to.not.contain('{');
      expect(styleSassSass).to.not.contain(';');
      expect(styleSassSass).to.not.contain('}');
    });

    it('renders SCSS syntax into CSS', function () {
      const styleLocalPrefCss = fs.readFileSync(styleLocalPref, enc);
      const styleScssScss = fs.readFileSync(styleScss, enc);

      expect(styleLocalPrefExistsBefore).to.be.false;

      expect(styleLocalPrefCss).to.contain(cssBody);
      expect(styleLocalPrefCss).to.contain(cssA);
      expect(styleLocalPrefCss).to.contain(cssPseudoClass);

      expect(styleScssScss).to.contain('{');
      expect(styleScssScss).to.contain(';');
      expect(styleScssScss).to.contain('}');
    });

    it('prints line comments by default', function () {
      const styleBldCss = fs.readFileSync(styleBld, enc);
      const styleLocalPrefCss = fs.readFileSync(styleLocalPref, enc);

      expect(styleBldCss).to.contain('/* line 3');
      expect(styleBldCss).to.contain('/* line 10');
      expect(styleBldCss).to.contain('/* line 12');
      expect(styleLocalPrefCss).to.contain('/* line 3');
      expect(styleLocalPrefCss).to.contain('/* line 11');
      expect(styleLocalPrefCss).to.contain('/* line 13');
    });

    it('accepts custom options', function (done) {
      pref.sass.outputStyle = 'compressed';
      pref.sass.sourceComments = false;

      fp.runSeq(
        'sass',
        () => {
          const styleBldCss = fs.readFileSync(styleBld, enc);

          expect(styleBldCss).to.contain('body{background:#fff;font:1.6em/1.5 Helvetica,"Nimbus Sans L","Liberation Sans",Roboto,sans-serif;color:#333;min-height:100vh;padding-bottom:5rem;position:relative}a{color:#333}a:hover,a:focus{color:gray}');

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
        pref.sass.sourceComments = false;

        fs.readdir(srcCssBldDir, (err, files) => {
          rmSrcCssMapFiles(files);

          sourcemapExistsBefore = fs.existsSync(sourcemap);

          done();
        });
      });

      after(function () {
        pref.sass.sourceComments = true;
      });

      it('does not write a sourcemap if configured to print line comments', function (done) {
        pref.sass.sourceComments = true;

        fp.runSeq(
          'sass',
          () => {
            const sourcemapExistsAfter = fs.existsSync(sourcemap);
            const styleBldCss = fs.readFileSync(styleBld, enc);

            expect(sourcemapExistsBefore).to.be.false;
            expect(sourcemapExistsAfter).to.be.false;
            expect(styleBldCss).to.not.contain('/*# sourceMappingURL=');

            pref.sass.sourceComments = false;

            done();
          }
        );
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
            expect(styleBldCss).to.contain('/*# sourceMappingURL=data:application/json;');

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
            expect(styleBldCss).to.contain('/*# sourceMappingURL=');

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
            expect(styleBldCss).to.contain('/*# sourceMappingURL=');

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

    it('compiles Sass without line comments and copy it to the backend', function () {
      const styleBackCss = fs.readFileSync(styleBack, enc);
      const styleBackAltCss = fs.readFileSync(styleBackAlt, enc);
      const styleBldCss = fs.readFileSync(styleBld, enc);
      const styleLocalPrefCss = fs.readFileSync(styleLocalPref, enc);

      expect(styleBackExistsBefore).to.be.false;
      expect(styleBackAltExistsBefore).to.be.false;

      expect(styleBldExistsBefore).to.be.false;
      expect(styleLocalPrefExistsBefore).to.be.false;

      expect(styleBldCss).to.not.contain('/* line ');
      expect(styleLocalPrefCss).to.not.contain('/* line ');

      expect(styleBldCss).to.equal(styleBackCss);
      expect(styleLocalPrefCss).to.equal(styleBackAltCss);
    });

    it('copies CSS without sourcemapping to the backend', function () {
      const styleBackCss = fs.readFileSync(styleBack, enc);
      const styleBackAltCss = fs.readFileSync(styleBackAlt, enc);

      expect(styleBackCss).to.not.contain('/*# sourceMappingURL=');
      expect(styleBackAltCss).to.not.contain('/*# sourceMappingURL=');
    });
  });

  describe('fp sass:no-comment', function () {
    let styleBldExistsBefore;
    let styleLocalPrefExistsBefore;

    before(function (done) {
      fs.readdir(srcCssBldDir, (err, files) => {
        rmSrcCssBldFiles(files);

        styleBldExistsBefore = fs.existsSync(styleBld);
        styleLocalPrefExistsBefore = fs.existsSync(styleLocalPref);

        fp.runSeq(
          'sass:no-comment',
          done
        );
      });
    });

    it('does not print line comments', function () {
      const styleBldCss = fs.readFileSync(styleBld, enc);
      const styleLocalPrefCss = fs.readFileSync(styleLocalPref, enc);

      expect(styleBldExistsBefore).to.be.false;
      expect(styleLocalPrefExistsBefore).to.be.false;

      expect(styleBldCss).to.not.contain('/* line ');
      expect(styleLocalPrefCss).to.not.contain('/* line ');
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

      expect(styleBldCss).to.contain(cssBody);
      expect(styleBldCss).to.contain(cssA);
      expect(styleBldCss).to.contain(cssPseudoClass);
      expect(styleLocalPrefCss).to.contain(cssBody);
      expect(styleLocalPrefCss).to.contain(cssA);
      expect(styleLocalPrefCss).to.contain(cssPseudoClass);

      expect(styleBldCss).to.contain('/* line 3');
      expect(styleBldCss).to.contain('/* line 10');
      expect(styleBldCss).to.contain('/* line 12');
      expect(styleLocalPrefCss).to.contain('/* line 3');
      expect(styleLocalPrefCss).to.contain('/* line 11');
      expect(styleLocalPrefCss).to.contain('/* line 13');
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

    it('compiles SASS into bld CSS with line comments when a SASS partial is modified', function (done) {
      const sass = fs.readFileSync(styleSass, enc);
      const watcher = fp.tasks['sass:watch'].fn();

      setTimeout(() => {
        fs.writeFileSync(styleWatchSass, sass + sassHtml);
        setTimeout(() => {
          const css = fs.readFileSync(styleWatchCss, enc);

          expect(css).to.contain(cssHtml);
          expect(css).to.contain(cssBody);
          expect(css).to.contain(cssA);
          expect(css).to.contain(cssPseudoClass);
          expect(css).to.contain('/* line 3');
          expect(css).to.contain('/* line 10');
          expect(css).to.contain('/* line 12');

          watcher.close();
          done();
        }, 500);
      }, 100);
    });
  });

  describe('fp sass:watch-no-comment', function () {
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

    it('compiles SASS into bld CSS without line comments when a SASS partial is modified', function (done) {
      const sass = fs.readFileSync(styleSass, enc);
      const watcher = fp.tasks['sass:watch-no-comment'].fn();

      setTimeout(() => {
        fs.writeFileSync(styleWatchSass, sass + sassHtml);
        setTimeout(() => {
          const css = fs.readFileSync(styleWatchCss, enc);

          expect(css).to.contain(cssHtml);
          expect(css).to.contain(cssBody);
          expect(css).to.contain(cssA);
          expect(css).to.contain(cssPseudoClass);
          expect(css).to.not.contain('/* line ');

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

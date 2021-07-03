# Sass extension for Fepper

[![Known Vulnerabilities][snyk-image]][snyk-url]
[![Linux Build Status][linux-image]][linux-url]
[![Mac Build Status][mac-image]][mac-url]
[![Windows Build Status][windows-image]][windows-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![License][license-image]][license-url]

### Install

```shell
cd extend
npm install --save-dev fp-sass
```

### Use

Add these tasks to `extend/custom.js`:

* Under gulp task `'custom:frontend-copy'`
  * `'sass:frontend-copy'`
* Under gulp task `'custom:once'`
  * `'sass:once'`
* Under gulp task `'custom:watch'`
  * `'sass:watch'`

On the command line:

```shell
fp sass[:subtask]
```

Create a `source/_styles/src/sass` directory and put all Sass code there.

This extension will read one directory deep for files with a `.sass` or `.scss` 
extension. Partials must be nested deeper. Sass code will be preprocessed into 
CSS and built into the `paths.source.cssBld` directory as declared in 
`patternlab-config.json`.

Please use CSS sourcemaps for debugging purposes. Add the following to your 
`pref.yml` file:

```yaml
sass:
  sourceMap: true
```

To write sourcemaps inline, configure as follows:

```yaml
sass:
  sourceMap: true
  sourceMapContents: true
  sourceMapEmbed: true
```

Similarly, any 
<a href="https://www.npmjs.com/package/sass#api" target="_blank">
documented Sass option</a> can be configured in `pref.yml` under the `sass` 
setting.

Newer versions (>= v0.3.0) of `fp-sass` have replaced 
<a href="https://www.npmjs.com/package/node-sass" target="_blank">Node Sass</a>
with 
<a href="https://www.npmjs.com/package/sass" target="_blank">Dart Sass</a>. 
Source comment support has been replaced by sourcemaps.

### Tasks

#### `'sass'`
* Builds Sass into CSS.
* Overwrites CSS whether or not it has direct edits.

#### `'sass:frontend-copy'`
* Usually under gulp task `'custom:frontend-copy'`.
* The `frontend-copy` task then copies the CSS to the backend.

#### `'sass:once'`
* Usually under gulp task `'custom:once'`.
* Same as `'sass'`.

#### `'sass:watch'`
* Usually under gulp task `'custom:watch'`.
* Watches the `source/_styles/src/sass` directory for file modifications.
* Triggers `sass` and overwrites CSS whether or not it has direct edits.

[snyk-image]: https://snyk.io/test/github/electric-eloquence/fp-sass/master/badge.svg
[snyk-url]: https://snyk.io/test/github/electric-eloquence/fp-sass/master

[linux-image]: https://github.com/electric-eloquence/fp-sass/workflows/Linux%20build/badge.svg?branch=master
[linux-url]: https://github.com/electric-eloquence/fp-sass/actions?query=workflow%3A"Linux+build"

[mac-image]: https://github.com/electric-eloquence/fp-sass/workflows/Mac%20build/badge.svg?branch=master
[mac-url]: https://github.com/electric-eloquence/fp-sass/actions?query=workflow%3A"Mac+build"

[windows-image]: https://github.com/electric-eloquence/fp-sass/workflows/Windows%20build/badge.svg?branch=master
[windows-url]: https://github.com/electric-eloquence/fp-sass/actions?query=workflow%3A"Windows+build"

[coveralls-image]: https://img.shields.io/coveralls/electric-eloquence/fp-sass/master.svg
[coveralls-url]: https://coveralls.io/r/electric-eloquence/fp-sass

[license-image]: https://img.shields.io/github/license/electric-eloquence/fp-sass.svg
[license-url]: https://raw.githubusercontent.com/electric-eloquence/fp-sass/master/LICENSE

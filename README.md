# Sass extension for Fepper

[![Known Vulnerabilities][snyk-image]][snyk-url]
[![Mac/Linux Build Status][travis-image]][travis-url]
[![Windows Build Status][appveyor-image]][appveyor-url]
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

This extension defaults toward the printing of source comments for debugging 
purposes. Doing so provides an unambiguous indication that the CSS was 
preprocessed and that direct edits to the CSS should be avoided. If a project 
decision is made to style with Sass, it would be a good idea to have version 
control ignore CSS builds in the `source` directory. This would avoid committing 
source comments, which could otherwise lead to a morass of conflicts.

Another debugging alternative is writing CSS sourcemaps. (However, this will not 
work if source comments are enabled.) Add the following to your `pref.yml` file:

```yaml
sass:
  sourceComments: false
  sourceMap: true
```

To write sourcemaps inline, configure as follows:

```yaml
sass:
  sourceComments: false
  sourceMap: true
  sourceMapContents: true
  sourceMapEmbed: true
```

Furthermore, 
<a href="https://github.com/sass/node-sass#options" target="_blank">any documented Sass option</a> 
can be configured in `pref.yml` under the `sass` setting and submitted to Sass.

### Tasks

#### `'sass'`
* Builds Sass into CSS.
* Overwrites CSS whether or not it has direct edits.
* Respects the `sass.sourceComments` setting in `pref.yml`.
* If `sass.sourceComments` is not set, will default to printing source comments.

#### `'sass:frontend-copy'`
* Usually under gulp task `'custom:frontend-copy'`.
* Builds Sass without source comments
* The `frontend-copy` task then copies the CSS to the backend.
* Ignores any `sass.sourceComments` setting in `pref.yml`.

#### `'sass:no-comment'`
* Same as `'sass'` and `'sass:once'` but without source comments.
* Ignores any `sass.sourceComments` setting in `pref.yml`.

#### `'sass:once'`
* Usually under gulp task `'custom:once'`.
* Same as `'sass'`.

#### `'sass:watch'`
* Usually under gulp task `'custom:watch'`.
* Watches the `source/_styles/src/sass` directory for file modifications.
* Triggers `sass` and overwrites CSS whether or not it has direct edits.

#### `'sass:watch-no-comment'`
* Usually under gulp task `'custom:watch'`.
* Watches the `source/_styles/src/sass` directory for file modifications.
* Triggers `sass:no-comment` and overwrites CSS whether or not it has direct 
  edits.

[snyk-image]: https://snyk.io/test/github/electric-eloquence/fp-sass/master/badge.svg
[snyk-url]: https://snyk.io/test/github/electric-eloquence/fp-sass/master

[travis-image]: https://img.shields.io/travis/electric-eloquence/fp-sass.svg?label=mac%20%26%20linux
[travis-url]: https://travis-ci.org/electric-eloquence/fp-sass

[appveyor-image]: https://img.shields.io/appveyor/ci/e2tha-e/fp-sass.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/e2tha-e/fp-sass

[coveralls-image]: https://img.shields.io/coveralls/electric-eloquence/fp-sass/master.svg
[coveralls-url]: https://coveralls.io/r/electric-eloquence/fp-sass

[license-image]: https://img.shields.io/github/license/electric-eloquence/fp-sass.svg
[license-url]: https://raw.githubusercontent.com/electric-eloquence/fp-sass/master/LICENSE

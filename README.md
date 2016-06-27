# Sass extension for Fepper

### Install
Add these tasks to `excludes/extend/custom.js`:

* Under gulp task 'custom:frontend-copy'
  * 'sass:frontend-copy'
* Under gulp task 'custom:once'
  * 'sass'
* Under gulp task 'custom:watch'
  * 'sass:watch'

There is also a 'sass:no-comments' task, which will output CSS without line 
comments. You probably want this to process CSS destined for production.

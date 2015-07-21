/* eslint-env node */

"use strict";

/* *****************
     DEFINE-VARS
***************** */
var gulp = require("gulp"),
  browserify = require("browserify"),
  combineCoverage = require('istanbul-combine'),
  eslint = require("gulp-eslint"),
  fs = require("fs"),
  KarmaServer = require("karma").Server,
  mocha = require("gulp-mocha"),
  runSequence = require("run-sequence");


/* *****************
    CONCAT-TASKS
***************** */
gulp.task("default", function (cb) {
  runSequence("build", "test", cb);
});
gulp.task("test", function (cb) {
  runSequence("test-backbone", "test-own", "test-flat", cb);
});
gulp.task("build", ["lint", "compile"]);


/* **********
     TEST
********** */
gulp.task("test-flat", function () {
  return gulp.src("flat-test/test.js").pipe(mocha({
    reporter: "nyan",
    ui: "tdd"
  }));
});

gulp.task("test-backbone", function (cb) {
  new KarmaServer({
    browsers: ["Firefox"],
    coverageReporter: {
      dir: "coverage-backbone",
      subdir: ".",
      type: "json"
    },
    files: [
      "bower_components/underscore/underscore.js",
      "bower_components/jquery/dist/jquery.js",
      "bower_components/backbone/backbone.js",
      "dist/backbone.linear.js",
      "backbone-test/setup/dom-setup.js",
      "backbone-test/setup/environment.js",
      "backbone-test/noconflict.js",
      "backbone-test/events.js",
      "backbone-test/model.js",
      "backbone-test/collection.js",
      "backbone-test/router.js",
      "backbone-test/view.js",
      "backbone-test/sync.js"
    ],
    frameworks: ["qunit"],
    preprocessors: {
      "dist/backbone.linear.js": "coverage"
    },
    reporters: ["progress", "coverage"],
    singleRun: true
  }, cb).start();
});

gulp.task("test-own", ["compile"], function (cb) {
  new KarmaServer({
    browsers: ["Firefox"],
    coverageReporter: {
      dir: "coverage-own",
      subdir: ".",
      type: "json"
    },
    files: [
      "bower_components/underscore/underscore.js",
      "bower_components/jquery/dist/jquery.js",
      "bower_components/jquery.ajax.fake/jquery.ajax.fake.js",
      "bower_components/backbone/backbone.js",
      "dist/backbone.linear.js",
      "test/linear_model.js"
    ],
    frameworks: ["chai", "mocha"],
    preprocessors: {
      "dist/backbone.linear.js": "coverage"
    },
    reporters: ["progress", "coverage"],
    singleRun: true
  }, cb).start();
});

gulp.task("coverage", function () {
  combineCoverage({
    pattern: "coverage-*/coverage-final.json",
    reporters: {
      html: {
        dir: "coverage"
      }
    }
  });
});


/* ************
     BUILD
************ */
gulp.task("lint", function () {
  return gulp.src(["*.js", "src/*.js", "test/*.js"])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task("compile", function () {
  return browserify({detectGlobals: false, standalone: "Backbone.LinearModel"})
    .require("./src/backbone.linear.js", {entry: true})
    .exclude("backbone")
    .exclude("underscore")
    .bundle()
    .pipe(fs.createWriteStream("./dist/backbone.linear.js"));
});


/* *********
     DEV
********* */
gulp.task("dev", function () {
  gulp.watch(["src/*.js"], ["build"]);
});

/**
 * Created by meathill on 2017/1/2.
 */

const del = require('del');
const gulp = require('gulp');
const sequence = require('run-sequence');
const stylus = require('gulp-stylus');
const minifyCSS = require('gulp-minify-css');
const install = require('gulp-install');
const event = require('event-stream');
const DEST = 'dist/';

gulp.task('clear', () => {
  return del(DEST);
});

gulp.task('stylus', () => {
  return gulp.src('./styl/screen.styl')
    .pipe(stylus({
      compress: true
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest(DEST + 'css/'));
});

gulp.task('stylus-dark', () => {
  return gulp.src('./theme/dark/styl/screen.styl')
    .pipe(stylus({
      compress: true
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./theme/dark/css/'));
});

gulp.task('copy', () => {
  return event.merge(
    gulp.src('app/**').pipe(gulp.dest(DEST + 'app/')),
    gulp.src('electron/**').pipe(gulp.dest(DEST + 'electron/')),
    gulp.src('img/**').pipe(gulp.dest(DEST + 'img/')),
    gulp.src(['theme/**', '!theme/dark/.git/', '!theme/dark/styl/', '!theme/default/styl/'])
      .pipe(gulp.dest(DEST + 'theme/')),
    gulp.src(['index.html', 'index.js', 'app.js', 'package.json', 'config/default.json'])
      .pipe(gulp.dest(DEST))
  );
});

gulp.task('install', () => {
  return gulp.src(DEST + 'package.json')
    .pipe(install({
      production: true,
      noOptional: true
    }));
});

gulp.task('default', callback => {
  sequence('clear',
    ['stylus', 'stylus-dark'],
    'copy',
    'install',
    callback);
});
/**
 * Created by meathill on 2017/1/2.
 */

const fs = require('fs');
const del = require('del');
const gulp = require('gulp');
const sequence = require('run-sequence');
const stylus = require('gulp-stylus');
const cleanCSS = require('gulp-clean-css');
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
    .pipe(cleanCSS())
    .pipe(gulp.dest(DEST + 'css/'));
});

gulp.task('stylus-dark', () => {
  return gulp.src('./theme/dark/styl/screen.styl')
    .pipe(stylus({
      compress: true
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./theme/dark/css/'));
});

gulp.task('copy', () => {
  return event.merge(
    gulp.src('app/**').pipe(gulp.dest(DEST + 'app/')),
    gulp.src('electron/**').pipe(gulp.dest(DEST + 'electron/')),
    gulp.src('img/**').pipe(gulp.dest(DEST + 'img/')),
    gulp.src('docs/*.md').pipe(gulp.dest(DEST + 'docs/')),
    gulp.src(['theme/**', '!theme/dark/.git/', '!theme/dark/styl/', '!theme/default/styl/'])
      .pipe(gulp.dest(DEST + 'theme/')),
    gulp.src('config/default.json').pipe(gulp.dest(DEST + 'config/')),
    gulp.src(['index.html', 'index.js', 'app.js', 'package.json'])
      .pipe(gulp.dest(DEST))
  );
});

gulp.task('production', () => {
  let configPath = 'config/config.json';
  return new Promise( resolve => {
    fs.readFile(configPath, 'utf8', (err, content) => {
      if (err) {
        throw err;
      }
      resolve(JSON.parse(content));
    });
  })
    .then( config => {
      config.DEBUG = false;
      return new Promise( resolve => {
        fs.writeFile(DEST + configPath, JSON.stringify(config), 'utf8', err => {
          if (err) {
            throw err;
          }
          resolve();
        })
      });
    });
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
    ['production', 'install'],
    callback);
});

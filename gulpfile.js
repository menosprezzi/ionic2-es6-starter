var gulp = require('gulp');
var insert = require('gulp-insert');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var assign = require('object-assign');
var liveServer = require('live-server');
var colors = require('colors');
var del = require('del');

var fs = require('fs');



var DIST_PATH = './www';

gulp.task('sass', function () {
  return gulp.src('./src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./src/css'));
});

gulp.task('sass-deploy', function () {
  return gulp.src('./src/**/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest(DIST_PATH + '/css'));
});

gulp.task('src-copy', ['sass'], function () {
  return gulp.src(['src/**/*.*', '!src/**/*.es6', '!src/**/*.scss'])
    .pipe(gulp.dest(DIST_PATH));
});

gulp.task('build', ['src-copy'], function () {
  var b = browserify('src/app/main.es6', {
    debug: true, 
    extensions: [".es6"] 
  })
  .transform(babelify, {
    extensions: [".es6"] 
  });
  return bundle(b);
});

gulp.task('serve', ['src-copy'], function () {
  var b = browserify('src/app/main.es6', assign({
    debug: true,
    extensions: [".es6"]
  }, watchify.args))
  .transform(babelify, {
    extensions: [".es6"]
  });
  
  var w = watchify(b)
    .on('update', function () {
      console.log('\tSOURCE COMPILING\t'.bgBlue);
      bundle(b);
    })
    .on('log', console.log);
    
  gulp.watch('./src/**/*.scss', function () {
    console.log('\tSASS COMPILING\t'.bgBlue);
    return gulp.src('./src/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest(DIST_PATH + '/css'));
  });
  
  var fileWatcher = gulp.watch(['src/**/*.*', '!src/**/*.es6', '!src/**/*.scss'],
  function (event){
    var filePath = event.path.split('src')[1]
    var path = filePath.substring(0, filePath.lastIndexOf('/'));
    console.log(('\tApplying changes for\t' + filePath).bgBlue);
    if (event.type != 'deleted') {
      return gulp.src(event.path)
      .pipe(gulp.dest(DIST_PATH + path));
    } else {
      del(DIST_PATH + filePath);
    }
  });
  
  fs.readFile('node_modules/live-server/injected.html', function (err, data){
    if(err) console.log(err);
    else {
      gulp.src(DIST_PATH + '/index.html')
      .pipe(insert.transform(function(content, file){
        return content.replace('</body>', data);
      }))
      .pipe(gulp.dest(DIST_PATH));
    }
  });        
  liveServer.start({
    root: DIST_PATH
  })
  
  return bundle(w);
});

gulp.task('deploy', ['src-copy', 'build', 'sass-deploy'], function () {
  return gulp.src(DIST_PATH + '/**/*.js')
  .pipe(uglify({ preserveComments: 'license' }))
  .pipe(gulp.dest(DIST_PATH));
});

function bundle(b) {
  return b.bundle()
    .on('error', function(err) {
      console.log(err);
      this.emit('exit');
    })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(DIST_PATH));
}

var gulpParam = require('gulp-param')(require('gulp'), process.argv);
var gulp = require('gulp');

var insert = require('gulp-insert');
var concat = require('gulp-concat');
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
var fs = require('fs-path');


var DIST_PATH = './www';

gulp.task('sass', function () {
  return gulp.src('./src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(gulp.dest(DIST_PATH));
});

gulp.task('sass-deploy', function () {
  return gulp.src('./src/**/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(gulp.dest(DIST_PATH));
});


gulp.task('src-copy', function () {
  return gulp.src(['src/**/*.*', '!src/**/*.es6', '!src/**/*.scss'])
    .pipe(gulp.dest(DIST_PATH));
});

gulp.task('ionic-copy', ['assets-copy'], function(){
  return gulp.src('node_modules/ionic-angular/css/ionic.css')
    .pipe(gulp.dest(DIST_PATH));
});

gulp.task('assets-copy', function(){
  var ionicFonts = 'node_modules/ionic-angular/fonts/';
  return gulp.src([ionicFonts + '*.ttf', ionicFonts + '*.woff', ionicFonts + '*.woff2'])
    .pipe(gulp.dest(DIST_PATH + '/fonts'));
});

gulp.task('build', ['ionic-copy', 'src-copy', 'sass'], function () {
  var b = browserify('src/app/main.es6', {
    debug: true, 
    extensions: [".es6"] 
  })
  .transform(babelify, {extensions: [".es6"]})
  return bundle(b);
});

gulpParam.task('serve', ['ionic-copy', 'src-copy', 'sass'], function (noserve) {
  var b = browserify('src/app/main.es6', assign({
    debug: true,
    extensions: [".es6"]
  }, watchify.args))
  .transform(babelify, {extensions: [".es6"]});
  
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
      .pipe(concat('style.css'))
      .pipe(gulp.dest(DIST_PATH));
  });
  
  // MISC FILES WATCHER
  // var fileWatcher = gulp.watch(['src/**/*.*', '!src/**/*.es6', '!src/**/*.scss'],
  // function (event){
  //   var filePath = event.path.split('src')[1]
  //   var path = filePath.substring(0, filePath.lastIndexOf('/'));
  //   console.log(('\tApplying changes for\t' + filePath).bgBlue);
  //   if (event.type != 'deleted') {
  //     return gulp.src(event.path)
  //     .pipe(gulp.dest(DIST_PATH + path));
  //   } else {
  //     del(DIST_PATH + filePath);
  //   }
  // });
  
  // fs.readFile('node_modules/live-server/injected.html', function (err, data){
  //   if(err) console.log(err);
  //   else {
  //     gulp.src(DIST_PATH + '/index.html')
  //     .pipe(insert.transform(function(content, file){
  //       return content.replace('</body>', data);
  //     }))
  //     .pipe(gulp.dest(DIST_PATH));
  //   }
  // });

  if (!noserve) {
    liveServer.start({
      root: DIST_PATH
    });
  }
  
  return bundle(w);
});

gulp.task('deploy', ['ionic-copy', 'src-copy', 'build', 'sass-deploy'], function () {
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


String.prototype.camelToDash = function () {
  return this.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
} 

String.prototype.replaceAll = function(pattern, replace) {
  return this.replace(new RegExp(pattern, "g"), replace);
}

gulpParam.task('generate', function(provider, page){
  if(provider) {
    var fileName = provider;
    return fs.writeFile('src/providers/' + provider.camelToDash() + '.es6', 
      templateProviderEs.replaceAll('NAME_CAMEL', fileName), 
      function(err, data){
        console.log('provider created');
      });
  } else if(page) {
    var fileName = page;
    return fs.mkdir('./src/pages/'+ fileName.camelToDash(), function () {
      console.log('dir created');
      fs.writeFile('./src/pages/'+ fileName.camelToDash() + '/'+ fileName.camelToDash() +'.es6', 
        templatePageEs.replaceAll('NAME_CAMEL', fileName)
        .replaceAll('NAME_DASH', fileName.camelToDash()), 
        function(){
          console.log('es6 created');
          fs.writeFile('./src/pages/'+ fileName.camelToDash() + '/' + fileName.camelToDash() + '.scss', 
            templatePageScss.replaceAll('NAME_DASH', fileName.camelToDash()), 
            function(){
              console.log('scss created');
              fs.writeFile('./src/pages/'+ fileName.camelToDash() + '/' + fileName.camelToDash() + '.html', 
                templatePageHtml.replaceAll('NAME_CAMEL', fileName), 
                function(){
                  console.log('html created');
                });
            });
        });
    });
    return console.log('Give me a name!');
  }
});



var templatePageEs = "import {Component} from '@angular/core';\nimport {NavController, NavParams, ViewController} from 'ionic-angular';\n\n/* Generated class for the NAME_CAMEL page. */\n@Component({\n\tselector: 'page-NAME_DASH',\n\ttemplateUrl: 'pages/NAME_DASH/NAME_DASH.html'\n})\nexport class NAME_CAMEL {\n\tconstructor(navCtrl: NavController, navParams: NavParams, viewCtrl: ViewController) {\n\tthis.navCtrl = navCtrl;\n\t\tthis.navParams = navParams;\n\t\tthis.viewCtrl = viewCtrl;\n\t}\n\n\tionViewDidLoad() {\n\t\tconsole.log('ionViewDidLoad NAME_CAMEL');\n\t}\n\n\tionViewWillEnter() {\n\t\tconsole.log('ionViewWillEnter NAME_CAMEL');\n\t}\n\n}";
var templatePageScss = "page-NAME_DASH {\n}";
var templatePageHtml = "<ion-header>\n\n\t<ion-navbar color=primary>\n\t\t<ion-title>NAME_CAMEL</ion-title>\n\t</ion-navbar>\n\n</ion-header>\n\n\n<ion-content padding>\n\n</ion-content>";

var templateProviderEs = "import { Injectable } from '@angular/core';\nimport { Http } from '@angular/http';\nimport 'rxjs/add/operator/toPromise';\nimport 'rxjs/add/operator/map';\n\n/*\nGenerated class for the DemandProvider provider.\n*/\n@Injectable()\nexport class NAME_CAMEL {\n\tconstructor(http: Http) {\n\t\tthis.http = http;\n\t}\n\n}";

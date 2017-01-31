# ionic2-es6-starter
Ionic 2 ES6 starter: Babel + Gulp + Browserify + SASS + live-server

> Faster builds for the lovers of ES6. No more TypeScript!

## SETTING UP

``` shell
$ npm install # init the package;
$ npm run serve # use this for live-reload mode;
$ npm run build # for single build;
$ npm run deploy # for uglify + SASS compressed outputs in the www folder
```

## CORDOVA BUILDING

For building your app, run `$ npm run deploy` before `$ ionic build` to update the `www` folder.

> Sorry, it can't integrates with `ionic serve` and `ionic build`/`ionic run` :disappointed_relieved:
> See more info [GitHub](https://codepen.io/leob6/post/quick-tip-using-gulp-to-customize-the-serve-run-and-build-process-for-your-ionic-framework-apps)
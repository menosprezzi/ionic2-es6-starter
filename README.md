# ionic2-es6-starter
Ionic 2 ES6 starter: Babel + Gulp + Browserify + SASS + live-server

> Faster builds for the lovers of ES6. No more TypeScript!

## SETTING UP

``` shell
$ npm install # init the package;
$ ion serve # use this for live-reload mode;
$ ion build # for single build of the dist folder;
$ ion deploy # for uglify + SASS compressed outputs in the www folder;
$ ion run android # Live-reload for debug the app in a android device/emulator;
$ ion run ios # The same for ios;
```

## TOOLS

It comes with a generator tool too, similar to `ionic -g`!

``` shell
$ gulp generate --provider NameOfProvider # Generates a provider in 'src/providers' folder;
$ gulp generate --page NameOfPage # Generates a page in 'src/pages' folder;
```

## CORDOVA BUILDING

For building your app, run `$ npm run deploy` before `$ ionic build` to update the `www` folder.

> Sorry, it can't integrates with `ionic serve` and `ionic build`/`ionic run` :disappointed_relieved:
> See more info [GitHub](https://codepen.io/leob6/post/quick-tip-using-gulp-to-customize-the-serve-run-and-build-process-for-your-ionic-framework-apps)
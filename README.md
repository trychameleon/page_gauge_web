# PageGauge #

Assess the usability of any website using automated analysis.

```
pagegauge/
  ├── gulpfile.js
  ├── package.json
  ├── README.md
  ├── less/
  │   ├── bootstrap/
  │   ├── custom/
  │   ├── variables.less
  │   └── pagegauge.less
  ├── js/
  │   ├── bootstrap/
  │   └── custom/
  ├── fonts/
  │   ├── bootstrap-entypo.eot
  │   ├── bootstrap-entypo.svg
  │   ├── bootstrap-entypo.ttf
  │   ├── bootstrap-entypo.woff
  │   └── bootstrap-entypo.woff2
  └── dist/
      ├── application.js
      ├── jquery.min.js
      ├── likely.min.js
      ├── pagegauge.css
      ├── pagegauge.min.css
      ├── toolkit-pagegauge.js
      └── toolkit-pagegauge.min.js
```

#### Gulpfile.js

To install Node visit [https://nodejs.org/download](https://nodejs.org/download/).

To install gulp, run the following command:

```
$ npm install gulp -g
```

When you’re done, install the rest of the theme's dependencies:

```
$ npm install
```

From here on out, simply run `gulp` from your terminal and you're good to go!

+ `gulp` - recompiles and minifies your theme assets.

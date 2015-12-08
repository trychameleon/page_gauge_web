# PageGauge #

Quickly Assess Your Website's Usability: [pagegauge.io](http://www.pagegauge.io/)

#### Background
PageGauge is a simple web tool to assess the usability of any website using automated analysis. It programmatically assesses various usability criteria and provides a "Usability Score" as an output. It was built in a ~1 day distributed hackathon, and is free and open-source.


Read more in our [FAQs](https://medium.com/@trychameleon/489c4f320b05#.behit9cad) or learn how to run your own distributed hackathon in [this post](https://medium.com/@_pulkitagrawal/8bcb879fb10#.fcjikgqod).


You're welcome to suggest edits here or if you want to join our team for the next hackathon then sign-up [here](http://bit.ly/pagegauge-list)

#### Running PageGauge locally
##### Gulpfile.js

To install Node visit [https://nodejs.org/download](https://nodejs.org/download/).

To install gulp, and install the rest of the dependencies run the following commands:

```
$ npm install gulp -g
$ npm install
```

From here on out, simply run `gulp` from your terminal and you're good to go!
```
$ gulp
```

The `gulp` command compiles and serves the site from http://localhost:9001

# PageGauge API

The default configuration is for the local instance (running on `9001`) will contact the [PageGauge API](https://github.com/trychameleon/page_gauge) on [api.pagegauge.io](https://api.pagegauge.io). This can be changed to point to your local instance of the API if you're making changes there too.

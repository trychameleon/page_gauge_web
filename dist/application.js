
$(function () {
  // Autofocus website input
  //$('.input-website').focus();

  $('.email-signup-button').click(function() {
    $(this).addClass("active");
     $(this).attr('placeholder','Email Address...');
    $('.email-signup-submit').addClass("active");
  });
});

// Move arrow on Gauge
window.onload = function () {
  var s = Snap("#gauge"),
      score = $('#gauge-score').text();

  Snap.load("img/gauge.svg", function (f) {

    var g = f.select("g"),
        arrow = f.select("#arrow");
        s.append(g);

    function spinGauge(){
      r = (score / 10) * 180;
      arrow.animate( { transform: "r" + r + ", 287, 285" }, 2000 );
    };

    spinGauge();
  });


  // Increment score value from zero
  $({numberValue: 0}).animate({numberValue: score}, {
      duration: 2000,
      easing: 'linear',
      step: function() {
        $('#gauge-score').text(this.numberValue.toFixed(1));
      }
  });
};

window.pagegauge = function() {
  var states = {
    'analyze': '#analyze',
    'run-tests': '#run-test',
    'report': '#report'
  };
  return {
    uid: getUUID(),
    page: {
      url: '',
      requests: [],
      responses: [],
      content: ''
    },
    util: {
      uuid: getUUID,
      fetchAllStyles: function(site, done) {
        var matches = /<head>([\s\S]*)<\/head>/.exec(site.body);

        if(!matches.length)
          return resolve('No head content found');

        var allStyles = '', sheets = [];

        $.each($(matches[1]), function() {
          var $this = $(this);

          if(this.tagName === 'LINK' && $this.attr('rel') === 'stylesheet') {
            var url =  pagegauge.util.buildUrl(site, $this.attr('href'));

            sheets.push(pagegauge.createSite(url));
          }
        });

        Promise.all(sheets).then(function(datas) {
          for(var i=0; i< datas.length; i++) {
            allStyles += datas[i].site.body;
            allStyles += "\n\n";
          }

          done(allStyles);
        });
      },
      buildUrl: function(site, href) {
        var url = '';

        if(/^\/\//.test(href)) {
          url = 'https:';
        } else if(!/https?:\/\//.test(href)) {
          var a = document.createElement('a');
          a.href = site.url;

          url += a.hostname;

          if(!/^\//.test(href)) {
            url += '/';
          }
        }

        return url + href;
      },
      getTopMenu: function(body){
        var possibleNavSelectors = ['nav', 'menu'],
          possibleNavs = [],
          proudestParentMenu;

        $(body).find('*').filter(function(){
          var possibleNav = false;
          for(var i = 0; i < possibleNavSelectors.length; i++ ){
            if((this.id && this.className.match && this.id.match(possibleNavSelectors[i]))
              || (this.className && this.className.match &&this.className.match(possibleNavSelectors[i]))){
              possibleNav = true;
            }
          }
          if(possibleNav && possibleNavs.indexOf(this) < 0 && this.children.length > 1){
            possibleNavs.push(this);
            return true;
          }
        });

        //find shallowest descendant with most amount of children
        for(var i = 0; i < possibleNavs.length; i++ ){
          if(!proudestParentMenu || (possibleNavs[i].children.length > proudestParentMenu.children.length && $(proudestParentMenu).not(possibleNavs).length < 1)){
            proudestParentMenu = possibleNavs[i];
          }
        };

        return proudestParentMenu;
      },
      goToState: function(state){
        _.forEach(states, function(item, index){
          $(item).slideUp();
        });
        $(states[state]).slideDown(function(){
          $(this).css({'display':''});
        });
      }
    },
    gauges: [],
    init: function() {
      setTimeout(function() {
        $('#gauge_url_form').on('submit', function(e) {
          e.preventDefault();
          e.stopPropagation();

          var url = $('#gauge_url').val();

          window.pagegauge.fetch(url);
        });
      }, 1000);
    },
    createSite: function(url, success) {
      return $.ajax('http://api.pagegauge.io/sites.json', {
        data: { uid: pagegauge.uid, url: url },
        method: 'POST',
        success: success
      });
    },
    fetch: function(url) {
      pagegauge.createSite(url, function(data) {
        window.pagegauge.gauge(data.site).
          then(window.pagegauge.completed);
      });
    },
    gauge: function(site) {
      var started_gauges = [];
      pagegauge.util.goToState('analyze');

      for(var i = 0; i < this.gauges.length; i++){
        started_gauges.push(this.gauges[i](site));
      }

      return Promise.all(started_gauges);
    },
    addGauge: function(gaugefn) {
      this.gauges.push(gaugefn);
    },
    completed: function(results) {
      console.log(results);

      pagegauge.util.goToState('report');
      var categories = {}, score = 0,
        importance = {
          accessibility: 3,
          navigation: 3,
          design: 2,
          interactions: 1
        };

      _.each(results, function(value) {
        $('[name=' + value.name + ']').text(value.result.message);
        categories[value.category] || (categories[value.category] = []);
        categories[value.category].push(value.result.score);
      });

      _.each(categories, function(value, key) {
        var categoryScore = Math.round((_.reduce(value, function(memo, num){ return memo + num; }, 0)/value.length) * 100)/10;

        $('[name=' + key + ']').text(categoryScore);

        score = score + ((importance[key] || 0)*(categoryScore/10));
      });

      $('#gauge-score').text((Math.round(score*100)/100).toString().replace(/0+$/, ''));
    }
  };
}();

$(window.pagegauge.init);

function r() { return Math.random().toString(36).replace(/[^a-z0-9]+/g, ''); }
function getUUID() {
  return window.localStorage.getItem('uid') ||
    (window.localStorage.setItem('uid', r()+r()) || window.localStorage.getItem('uid'));
}

window.pagegauge.addGauge(function contentQuantity(site) {
  var bodyNoScript = /\<body([\s\S]*?)\<\/body\>/.exec(site.body)[0].replace(/\<script([\s\S]*?)\<\/script\>/g, '').replace(/\son(.*?)\"([\s\S]*?)\"/g, ''),
    wordcount = $(bodyNoScript).text().replace(/\s+/g, " ").split(' ').length,
    score = 1 - _.min([1, (_.max([0, wordcount - 500])/ 1000)]);
  return Promise.resolve({name: 'contentQuality', category: 'design', result: {score: score, message: score }});
});

window.pagegauge.addGauge(function (site) {
  var startScore = 0.2,
    ieTagsPresent = /[\s]*\[if[\s]*IE/g.exec(site.body);

  return new Promise(function browserCompatability(resolve) {
    pagegauge.util.fetchAllStyles(site, function(styles) {
      var prefixes = ["linear-gradient", "box-shadow", "border-radius"];
      prefixes = prefixes.map(function(value, index) {
        return {
          'webkit': new RegExp(value, "g").test(styles) == new RegExp('-webkit-' + value, "g").test(styles),
          'moz': new RegExp(value, "g").test(styles) == new RegExp('-webkit-' + value, "g").test(styles)
        };
      });

      var webKitStyles = _.every(prefixes, 'moz', true) ? 0.5 : 0,
        mozStyles = _.every(prefixes, 'moz', true) ? 0.13 : 0;
      numberscore = startScore + ieTagsPresent + webKitStyles + mozStyles;
      resolve({name: 'browserCompatability', category: 'accessibility', result: {score: numberscore, message: numberscore}});
    });
  });
});


window.pagegauge.addGauge(function baseMenuSize(site) {
  var bodyNoScript = /\<body([\s\S]*?)\<\/body\>/.exec(site.body)[0].replace(/\<script([\s\S]*?)\<\/script\>/g, '').replace(/\son(.*?)\"([\s\S]*?)\"/g, '');

  return Promise.resolve({name: 'baseMenuSize', category: 'navigation', result: $(window.pagegauge.util.getTopMenu($(bodyNoScript))).children().length > 7 ? {score: 0, message: 0} : {score: 1, message: 1}});
});

window.pagegauge.addGauge(function baseMenuDepth(site) {
  var bodyNoScript = /\<body([\s\S]*?)\<\/body\>/.exec(site.body)[0].replace(/\<script([\s\S]*?)\<\/script\>/g, '').replace(/\son(.*?)\"([\s\S]*?)\"/g, ''),
    proudestParentMenu = window.pagegauge.util.getTopMenu($(bodyNoScript)),
    depth;

  //from the proudestParent
  var testMenuChildrenDepth = function(menu, level){
    level = level || 1;
    var children = $(menu).children(),
      childDepth = [level];
    //for each of children
    for(var i = 0; i < children.length; i++){
      childDepth.push(testMenuChildrenDepth(children[i], level+1));
    }
    return _.max(childDepth);
  };
  depth = testMenuChildrenDepth(proudestParentMenu);

  var score = depth <= 3 ? {score: 1, message: 'good'} : depth < 6 ? {score: 0.5, message: 'okay'} : {score: 0, message: 'not great'};

  return Promise.resolve({name: 'baseMenuDepth', category: 'navigation', result: score});
});

//pagegauge.addGauge(function bodyLength(site) {
//  return Promise.resolve({name: 'bodyLength', category: 'none', result: site.body.length});
//});
//
pagegauge.addGauge(function isResponsive(site) {
  return new Promise(function(resolve) {
    pagegauge.util.fetchAllStyles(site, function(styles) {
      resolve({
        name: 'isResponsive',
        category: 'accessibility',
        result: /@media/.test(styles) ? { score: 1, message: 'Is Responsive' } : { score: 0, message: 'Is Not Responsive' }
      });
    });
  });
});

pagegauge.addGauge(function hasColorSimplicity(site) {
  return new Promise(function(resolve) {
    pagegauge.util.fetchAllStyles(site, function(styles) {
      var numberscore,
        colors = {},
        hexes = styles.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g) || [],
        rgbs = styles.match(/rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*\d+(?:\.\d+)?)?\)/g) || [];

      hexes = hexes.concat.apply(hexes, rgbs);

      for(var i=0; i<hexes.length; i++) {
        var key = hexes[i].toLowerCase();

        colors[key] || (colors[key] = 0);
        colors[key] += 1;
      }

      console.log('We have colors!', colors);
      numberscore = _.min([1, _.max([0, (colors - 50)])/150]);

      resolve({name: 'hasColorSimplicity', category: 'design', result: {score: numberscore, message: 'Has #'+Object.keys(colors).length+' colors'}});
    });
  });
});

pagegauge.addGauge(function has404Page(site) {
  return new Promise(function(resolve) {
    var url = pagegauge.util.buildUrl(site, site.uid);

    pagegauge.createSite(url, function(site404) {
      var has404Text = /sorry|error|404|mistake|not found|exist/i,
        has404 = false;

      if(site404.code === 404 && has404Text.test(site.body)) {
        has404 = true;
      }

      resolve({has404: 'has404', category: 'navigation', result: has404 ? {score: 1, message: 'Has a 404'} : {score: 0, message: 'No 404'}});
    });
  });
});

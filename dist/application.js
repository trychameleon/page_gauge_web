
$(function () {
  // Autofocus website input
  //$('.input-website').focus();

  $('.email-signup-button').click(function() {
    $(this).addClass("active");
     $(this).attr('placeholder','Email Address...');
    $('.email-signup-submit').addClass("active");
  });
});


window.pagegauge = function() {
  var states = {
    analyze: '#analyze',
    'run-tests': '#run-test',
    report: '#report'
  };
  var panelStates = {
    danger: {panel: 'panel-danger', text: 'text-danger'},
    info: {panel: 'panel-info', text: 'text-info'},
    warning: {panel: 'panel-warning', text: 'text-warning'},
    success: {panel: 'panel-success', text: 'text-success'}
  };
  return {
    uid: getUUID(),
    page: {
      url: '',
      requests: [],
      responses: [],
      content: ''
    },
    body: { },
    $body: { },
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
      sanitizedBody: function(site) {
        var body = pagegauge.body[site.id];

        if(!body) {
          body = /\<body([\s\S]*?)\<\/body\>/.exec(site.body)[0].
            replace(/\<script([\s\S]*?)\<\/script\>/g, '').
            replace(/\son(.*?)\"([\s\S]*?)\"/g, '');
        }

        return pagegauge.body[site.id] = body;
      },
      sanitizedAppendedBody: function(site) {
        var $body = pagegauge.$body[site.id];

        if(!$body) {
          var $div = $('<div style="display: none; visibility: hidden"></div>');

          $body = $(pagegauge.util.sanitizedBody(site));

          $div.append($body);
          $div.appendTo(document.body);
        }

        return pagegauge.$body[site.id] = $body;
      },
      getTopMenu: function(body) {
        var possibleNavSelectors = ['nav', 'menu'],
          possibleNavs = [],
          proudestParentMenu;

        $(body).find('*').filter(function() {
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
      },
      setElementScore: function(selector, score){
        var el = $(selector);
        el.text(score);
        el.removeClass([
          panelStates.danger.text, panelStates.info.text,
          panelStates.warning.text, panelStates.success.text].join(' '));
        if(score < 3){
          el.addClass(panelStates.danger.text);
        } else if(score < 5) {
          el.addClass(panelStates.info.text);
        } else if(score < 7.5){
          el.addClass(panelStates.warning.text);
        } else {
          el.addClass(panelStates.success.text);
        }
      },
      setGaugeScoreStyle: function(selector, score){
        var el = $(selector);
        el.removeClass([
          panelStates.danger.panel, panelStates.info.panel,
          panelStates.warning.panel, panelStates.success.panel].join(' '));

        if(score == 0){
          el.addClass(panelStates.danger.text);
        } else if(score < 0.6) {
          el.addClass(panelStates.info.text);
        }
      },
      // Move arrow on Gauge
      spinGauge: function(score) {
        var r,
          s = Snap("#gauge"),
          g = pagegauge.gaugeArrow.select("g"),
          arrow = pagegauge.gaugeArrow.select("#arrow") || s.select('#arrow');;

        arrow.transform('r', 0);
        g && s.append(g);

        // Increment score value from zero
        $({numberValue: 0}).animate({numberValue: score}, {
          duration: 2000,
          easing: 'linear',
          step: function() {
            pagegauge.util.setElementScore('#gauge-score', this.numberValue.toFixed(1));
          }
        });
        r = (score / 10) * 180;
        arrow.animate({transform: "r" + r + ", 287, 285"}, 2000);
      },
      setLoader: function(percentage){
        $('#analyze .progress-bar').css('width', percentage + '%');
        $('#analyze .progress-bar .sr-only').text(percentage+'% Complete');
      }
    },
    gaugeArrow: undefined,
    gauges: [],
    init: function() {
      $('.gauge_url_form:visible').on('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var url = $('.gauge_url:visible').val();
        $('.gauge_url').val(url);
        $('[name=page_name]').text(url.replace(/(http(s*)\:\/\/)|(\/$)/g, ''));
        window.pagegauge.fetch(url);
      });

      Snap.load("img/gauge.svg", function (f) {
        pagegauge.gaugeArrow = f;
      });
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
        pagegauge.util.goToState('analyze');
        setTimeout(function(){
          pagegauge.gauge(data.site).
            then(pagegauge.completed);
        }, 500);
      });
    },
    gauge: function(site) {
      var started_gauges = [],
        loaded = 0;

      for(var i = 0; i < this.gauges.length; i++){
        var promise = this.gauges[i](site);
        started_gauges.push(promise);
        promise.then(function(){
          loaded++;
          pagegauge.util.setLoader(Math.round((loaded/pagegauge.gauges.length)*100));
        });
      }

      return Promise.all(started_gauges);
    },
    addGauge: function(gaugefn) {
      this.gauges.push(gaugefn);
    },
    showReport: function(results){
      pagegauge.util.goToState('report');
      var categories = {}, score = 0,
        importance = {
          accessibility: 3,
          navigation: 3,
          design: 2,
          interactions: 1
        },
        overallScore;

      _.each(results, function(value) {
        $('[name=' + value.name + ']').text(value.result.message);
        pagegauge.util.setGaugeScoreStyle('[name=' + value.name + ']', value.result.score);
        categories[value.category] || (categories[value.category] = []);
        categories[value.category].push(value.result.score);
      });

      _.each(categories, function(value, key) {
        var categoryScore = Math.round((_.reduce(value, function(memo, num){ return memo + num; }, 0)/value.length) * 100)/10;

        score = score + ((importance[key] || 0)*(categoryScore/10));
      });

      overallScore = (Math.round(score*100)/100).toString().replace(/0+$/, '');

      pagegauge.util.setElementScore('#gauge-score', overallScore);
      window.pagegauge.util.spinGauge(overallScore);
    },
    completed: function(results) {
      $('.progress-wrapper').fadeOut();
      $('.success-wrapper').fadeIn();
      $('.contact_email_form').on('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if($('.contact_email:visible').val().length > 5){
          //submit e-mail
        }
        pagegauge.showReport(results);
      });
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
  var body = pagegauge.util.sanitizedBody(site),
    wordcount = $(body).text().replace(/\s+/g, " ").split(' ').length,
    score = 1 - _.min([1, (_.max([0, wordcount - 500])/ 1000)]),
    message = score == 0 ? 'Site has 2000 or more words' : score <= 0.5 ? 'Site has 1000 or more words' : 'Site has an appropriate amount of copy';

  return Promise.resolve({name: 'contentQuality', category: 'design', result: {score: score, message: message }});
});

window.pagegauge.addGauge(function browserCompatibility(site) {
  var startScore = 0.2,
    ieTagsPresent = /[\s]*\[if[\s]*IE/g.exec(site.body);

  return new Promise(function(resolve) {
    pagegauge.util.fetchAllStyles(site, function(styles) {
      var prefixes = ['linear-gradient', 'box-shadow', 'border-radius'];
      prefixes = prefixes.map(function(value, index) {
        return {
          webkit: new RegExp(value, 'g').test(styles) == /-webkit-/g.test(styles),
          moz: new RegExp(value, 'g').test(styles) == /-moz-/g.test(styles)
        };
      });

      var webKitStyles = _.every(prefixes, 'moz', true) ? 0.5 : 0,
        mozStyles = _.every(prefixes, 'moz', true) ? 0.13 : 0;

      var score = startScore + ieTagsPresent + webKitStyles + mozStyles,
        message = 'Site compatible with '+(score*100)+'% of common browsers';

      resolve({name: 'browserCompatibility', category: 'accessibility', result: {score: score, message: message}});
    });
  });
});

window.pagegauge.addGauge(function autoPlaySounds(site) {
  var $body = $(pagegauge.util.sanitizedBody(site)),
    score = 1, message = 'No automatically playing sounds',
    plays = false;

  if($body.find('audio[autoplay]').length) {
    score = 0;
    message = 'Found an audio file that plays automatically';
  }

  return Promise.resolve({name: 'autoPlaySounds', category: 'interactions', result: {score: score, message: message}});
});

window.pagegauge.addGauge(function baseMenuSize(site) {
  var body = pagegauge.util.sanitizedBody(site);

  return Promise.resolve({name: 'baseMenuSize', category: 'navigation', result: $(window.pagegauge.util.getTopMenu($(body))).children().length > 7 ? {score: 0, message: 'Number of site menu bar options too high'} : {score: 1, message: 'Number of site menu bar options acceptable'}});
});

window.pagegauge.addGauge(function baseMenuDepth(site) {
  var body = pagegauge.util.sanitizedBody(site),
    proudestParentMenu = window.pagegauge.util.getTopMenu($(body)),
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

  var score = depth <= 3 ? {score: 1, message: 'Site menu bar depth within optimal range'} : depth < 6 ? {score: 0.5, message: 'Site menu bar depth within acceptable range'} : {score: 0, message: 'Site menu bar depth outside ideal range'};

  return Promise.resolve({name: 'baseMenuDepth', category: 'navigation', result: score});
});

pagegauge.addGauge(function isResponsive(site) {
  return new Promise(function(resolve) {
    pagegauge.util.fetchAllStyles(site, function(styles) {
      resolve({
        name: 'isResponsive',
        category: 'accessibility',
        result: /@media/.test(styles) ? { score: 1, message: 'Site contains responsiveness tags' } : { score: 0, message: 'Site does not contains responsiveness tags' }
      });
    });
  });
});

pagegauge.addGauge(function hasColorSimplicity(site) {
  return new Promise(function(resolve) {
    var $body = pagegauge.util.sanitizedAppendedBody(site),
      score = 0, message = 'A very high number of colors',
      colors = {};

    $body.find('*').each(function() {
      var $this = $(this),
        color = $this.css('color'),
        background = $this.css('background-color');

      if(color) {
        colors[color] || (colors[color] = 0);
        colors[color] += 1
      }

      if(background) {
        colors[background] || (colors[background] = 0);
        colors[background] += 1
      }
    });

    var length = (Object.keys(colors));

    if(length < 8) { score = 1.0; message = 'Low number of colors'; }
    else if(score < 16) { score = 0.75; message = 'A suitable number of colors'; }
    else if(score < 24) { score = 0.50; message = 'A higher than normal number of colors'; }
    else if(score < 32) { score = 0.25; message = 'A high number of colors';}

    resolve({name: 'hasColorSimplicity', category: 'design', result: {score: score, message: message}});
  });
});

pagegauge.addGauge(function numberOfActions(site) {
  return new Promise(function(resolve) {
    var $body = $(pagegauge.util.sanitizedBody(site)),
      score = 0, message = 'A high number of actions',
      actions = {};

    $body.find('a').each(function() {
      var $this = $(this),
        href = $this.attr('href');

      if(href) {
        actions[href] || (actions[href] = 0);
        actions[href] += 1;
      }
    });

    var length = (Object.keys(actions));

    if(length < 12) { score = 1.0; message = 'Low number of actions'; }
    else if(score < 24) { score = 0.5; message = 'A suitable number of actions'; }

    resolve({name: 'numberOfActions', category: 'interactions', result: {score: score, message: message}});
  });
});

pagegauge.addGauge(function has404Page(site) {
  return new Promise(function(resolve) {
    var url = pagegauge.util.buildUrl(site, site.uid);

    pagegauge.createSite(url, function(data404) {
      var site404 = data404.site,
        has404Text = /sorry|error|404|mistake|not found|exist|oops/i,
        has404 = false;

      console.log(site404);

      if(site404.code == 404 && has404Text.test(site404.body)) {
        has404 = true;
      }

      resolve({name: 'has404', category: 'navigation', result: has404 ? {score: 1, message: 'Site contains clear 404 error page'} : {score: 0, message: 'Site does not contain clear 404 error page'}});
    });
  });
});

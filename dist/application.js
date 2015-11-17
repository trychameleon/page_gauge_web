
$(function () {
  // Autofocus website input
  //$('.input-website').focus();

  $('.email-signup-button').click(function() {
    $(this).addClass("active");
     $(this).attr('placeholder','Email Address...');
    $('.email-signup-submit').addClass("active");
  });
})

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
    }

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


$(function () {
  // Autofocus website input
  $('.input-website').focus();
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



  $({numberValue: 0}).animate({numberValue: score}, {
      duration: 2000,
      easing: 'linear',
      step: function() { 
        $('#gauge-score').text(this.numberValue.toFixed(1)); 
      }
  });

};

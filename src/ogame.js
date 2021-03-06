$(function() {

  // Production rate
  var production = {};
  production.metal       = get_production("metal");
  production.crystal     = get_production("crystal");
  production.deuterium   = get_production("deuterium");

  // HTML Elements
  var html = {};
  html.span_metal    = $("#resources_metal");
  html.span_crystal  = $("#resources_crystal");
  html.span_deuterium  = $("#resources_deuterium");

  // Costs
  var costs = {};



  fetch_data(function(data) {

    var update = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        display_time_to_build();
      });
    });

    // Observer that executes a function when the site updates the watched element.
    var resource_watcher = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        var el = $(mutation.target);
        var resource = el.attr('id').replace("resources_", "");
        var span = $("span.addon-" + resource + "-prod");
        if(!span.length) {
          span = $("<span class=\"addon-"+resource+"-prod addon-green\"></span>");
        }

        span.text(" (+" + Math.round(production[resource] * 3600) + ")");
        el.after(span);
      });
    });

    // configuration of the observer:
    var config = { attributes: true, childList: true, characterData: true };

    // pass in the target node, as well as the observer options
    resource_watcher.observe(html.span_metal.get(0), config);
    resource_watcher.observe(html.span_crystal.get(0), config);
    resource_watcher.observe(html.span_deuterium.get(0), config);

    update.observe( $(".OGameClock").get(0), config);

  });



  function display_time_to_build() {
    $("#buttonz li>div").each(function(index, el) {
      var elem = $(this);
      var type = parseInt(
          $(this).attr('class')
            .match(new RegExp("(?:supply|station|research)([0-9]+)"))[1]
      );
      if( isNaN(type) ) { return; }

      var time = calculate_time({
        'metal': costs[type].metal,
        'crystal': costs[type].crystal,
        'deuterium': costs[type].deuterium,
      });

      if (time > 0) {
        var countdown = elem.find(".addon-countdown");
        console.log(countdown);
        if ( !countdown.length ) {
          console.log("append countdown");
          elem.append( $("<div class=\"addon-countdown\"></div>").text(display_time(Math.round(time))) );
        }
        else {
          console.log("update countdown");
          countdown.text(display_time(Math.round(time)));
        }
      }

    });
  }

  function calculate_time(cost) {
    var time = {};

    time.metal = ( cost.metal - parseInt(html.span_metal.text().replace(".", "")) ) / production.metal;
    time.crystal = ( cost.crystal - parseInt(html.span_crystal.text().replace(".", "")) ) / production.crystal;
    time.deuterium = ( cost.deuterium - parseInt(html.span_deuterium.text().replace(".", "")) ) / production.deuterium;

    var max_time = Math.max(Math.max(time.metal, time.crystal), time.deuterium);

    if (max_time <= 0)
      return 0;

    return max_time;
  }


  function fetch_data(callback) {
    $("#buttonz li>div").each(function(index, el) {
      url = "http://s117-fr.ogame.gameforge.com/game/index.php?page=station&ajax=1";

      var type = parseInt($(this).attr('class').match(new RegExp("(?:supply|station|research)([0-9]+)"))[1]);
      if( isNaN(type) ) { return; }

      $.get(url, { type: type }, function(data) {
        // Metal
        var metal = data.match(/<li class="metal tooltip" title="([0-9\.]+) /);
        if(typeof metal === "undefined" || metal === null) { metal = 0; } else { metal = parseInt(metal[1].replace(".", "")); }

        // Crystal
        var crystal = data.match(/<li class="crystal tooltip" title="([0-9\.]+) /);
        if(typeof crystal === "undefined" || crystal === null) { crystal = 0; } else { crystal = parseInt(crystal[1].replace(".", "")); }

        // Deuterium
        var deuterium = data.match(/<li class="deuterium tooltip" title="([0-9\.]+) /);
        if(typeof deuterium === "undefined" || deuterium === null) { deuterium = 0; } else { deuterium = parseInt(deuterium[1].replace(".", "")); }

        costs[type] = {'metal': metal, 'crystal': crystal, 'deuterium': deuterium };
      });

    });

    callback();
  }

});



function page(key, fn) {
  if (window.location.href.indexOf("?page=" + key) > -1) {
    fn();
  }
}


function get_production(resource) {
  var raw = $("div#box script").text();
  var re = new RegExp(resource + ".+?\"production\":([0-9\.]+)");
  return parseFloat(raw.match(re)[1]);
}


function display_time(seconds) {
  if (seconds < 60) { return seconds + 's'; }

  var minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;

  if (minutes < 60) { return minutes + 'm ' + seconds + 's'; }

  var hours = Math.floor(minutes / 60);
  minutes = minutes % 60;

  if (hours < 24) { return hours + 'h ' + minutes + 'm ' + seconds + 's'; }

  var days = Math.floor(hours / 24);
  hours = hours % 24;

  return days + 'd ' + hours + 'h ' + minutes + 'm';
}

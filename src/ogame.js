$(function() {

  // Production rate
  var production = {};
  production['metal']       = get_production("metal");
  production['crystal']     = get_production("crystal");
  production['deuterium']   = get_production("deuterium");

  // HTML Elements
  var html = {}
  html['span_metal']    = $("#resources_metal");
  html['span_crystal']  = $("#resources_crystal");
  html['span_deuterium']  = $("#resources_deuterium");


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
  resource_watcher.observe(html['span_metal'].get(0), config);
  resource_watcher.observe(html['span_crystal'].get(0), config);
  resource_watcher.observe(html['span_deuterium'].get(0), config);

});

function get_production(resource) {
  var raw = $("div#box script").text();
  var re = new RegExp(resource + ".+?\"production\":([0-9\.]+)");
  console.log(raw);
  return raw.match(re)[1];
}

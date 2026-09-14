/**
 * Goat Bot Market History Loader
 * Loaded after app.js. Wraps the existing load() function so USDA history can feed market cards/projections.
 */
(function () {
  function applyWhenReady() {
    if (window.__goatBotMarketHistoryLoaderInstalled) return true;
    if (typeof window.load !== 'function') return false;
    if (typeof window.goatBotApplyMarketHistory !== 'function') return false;

    var originalLoad = window.load;

    window.load = function () {
      var db = originalLoad.apply(this, arguments);
      return window.goatBotApplyMarketHistory(db);
    };

    window.__goatBotMarketHistoryLoaderInstalled = true;

    try {
      if (typeof window.render === 'function') window.render();
    } catch (err) {
      console.warn('Goat Bot market history loader re-render skipped:', err);
    }

    return true;
  }

  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    if (applyWhenReady() || tries > 50) {
      clearInterval(timer);
    }
  }, 100);
})();

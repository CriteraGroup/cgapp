module.exports.CGApp = (function() {
  let App, BrowserWindow, shortcut, win;

  const ACTIVATE = 'activate',
        CLOSED = 'closed',
        HEIGHT = 1080,
        READY = 'ready',
        READY_TO_SHOW = 'ready-to-show',
        VIEW_PATH = `file://${__dirname}/index.html`,
        WIDTH = 1920;

  function CGApp() {
    App = arguments[0];
    BrowserWindow = arguments[1];
    shortcut = arguments[2];

    App.on(READY, _createWindow);
    App.on(ACTIVATE, _onActivate);

    function _createWindow() {
      win = new BrowserWindow({
        height: HEIGHT,
        show: false,
        // frame: false,
        width: WIDTH
      });

      win.once(READY_TO_SHOW, _onReadyToShow);

      win.loadURL(VIEW_PATH);

      win.on(CLOSED, _onClose);
    }

    function _onActivate() {
      if(win === null) {
        _createWindow();
      }
    }

    function _onClose() {
      win = null;
    }

    function _onReadyToShow() {
      win.show();
      // win.setFullScreen(true);
    }
  }

  return CGApp;
})();

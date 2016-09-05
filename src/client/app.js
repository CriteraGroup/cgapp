var ipcRenderer = require('electron').ipcRenderer;
var app = angular.module('cgapp', []);

app.value('ipc', ipcRenderer);
app.controller('mainController', createMainController);
app.factory('messenger', createMessenger);
app.factory('store', createStore);
app.run(run);

createMainController.$inject = ['ipc', 'store'];
function createMainController(ipc, store) {
  var main = this;

  main.exit = exit;
  main.save = save;

  store.load().then(function(data) {
    main.data = data;
  });

  function exit() {
    console.log('Sending exit event');
    ipc.send('exit');
  }

  function save() {
    console.log(main.data);
    ipc.send('save', main.data);
  }
}

createMessenger.$inject = [];
function createMessenger() {
  function Messenger() {}

  Messenger.prototype = Object.create(null);
  Messenger.prototype.success = success;
  Messenger.prototype.fail = fail;

  return new Messenger();

  function fail(msg) {
    _makeMessage(msg, false);
  }

  function success(msg) {
    _makeMessage(msg, true);
  }

  function _makeMessage(msg, isSuccess) {
    let msgContainer = document.createElement('div'),
        msgText = document.createTextNode(msg);

    msgContainer.className = isSuccess ? 'success-message' : 'fail-message';
    msgContainer.appendChild(msgText);

    document.body.appendChild(msgContainer);

    setTimeout(function() {
      msgContainer.className = msgContainer.className + ' active';
    }, 0);

    setTimeout(function() {
      document.body.removeChild(msgContainer);
    }, 1600);
  }
}

createStore.$inject = ['$q', 'ipc'];
function createStore($q, ipc) {
  var store = Object.create(null);

  store.load = load;

  return store;

  function load() {
    var defer = $q.defer();

    ipc.send('bodyLoaded');
    ipc.once('bodyLoadedReply', function(response, data) {
      store[0] = data;
      defer.resolve(store[0]);
    });

    return defer.promise;
  }
}

run.$inject = ['ipc', 'messenger'];
function run(ipc, messenger) {
  ipc.on('success-message', function showSuccessMessage(event, msg) {
    messenger.success(msg);
  });

  ipc.on('fail-message', function showFailMessage(event, msg) {
    messenger.fail(msg);
  });
}

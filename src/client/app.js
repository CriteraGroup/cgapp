var ipcRenderer = require('electron').ipcRenderer;
var app = angular.module('cgapp', []);

app.value('ipc', ipcRenderer);
app.controller('mainController', createMainController);
app.factory('messenger', createMessenger);
app.factory('store', createStore);
app.run(run);

createMainController.$inject = ['ipc', 'store'];
function createMainController(ipc, store) {
  var main = this,
    questions;

  main.canGoNext = canGoNext;
  main.canGoPrevious = canGoPrevious;
  main.exit = exit;
  main.getTrueQuestionNumber = getTrueQuestionNumber;
  main.next = next;
  main.previous = previous;
  main.questionIndex = 0;
  main.questionNumber = 1;
  main.save = save;
  main.updateQuestion = updateQuestion;

  store.load().then(function(data) {
      questions = data;
      main.current = questions[main.questionIndex];
      main.totalQuestions = questions.length;
  });

  function canGoNext() {
      return main.questionIndex < (main.totalQuestions - 1);
  }

  function canGoPrevious() {
      return main.questionIndex > 0;
  }

  function exit() {
    ipc.send('exit');
  }

  function getTrueQuestionNumber() {
      return main.questionIndex + 1;
  }

  function next() {
      if(canGoNext()) {
          main.questionIndex++;
          main.questionNumber++;
          main.current = questions[main.questionIndex];
      }
  }

  function previous() {
      if(canGoPrevious()) {
          main.questionIndex--;
          main.questionNumber--;
          main.current = questions[main.questionIndex];
      }
  }

  function save() {
    ipc.send('save', questions);
  }

  function updateQuestion() {
      if(main.questionNumber > 0 && main.questionNumber <= main.totalQuestions) {
          main.questionIndex = (parseInt(main.questionNumber) - 1);
          main.current = questions[main.questionIndex];
      }
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

var ipcRenderer = require('electron').ipcRenderer;
var app = angular.module('cgapp', []);

var automationStatusValues = require('../../resources/automation-status.json');
var implementationStatusValues = require('../../resources/implementation-status.json');
var policyDefinedValues = require('../../resources/policy-defined.json');
var reportingStatusValues = require('../../resources/reporting-status.json');
var statusOptions = require('../../resources/status-options.json');
var domains = require('../../resources/domain-list.json');
var answers = require('../../resources/answer-list.json');

app.value('ipc', ipcRenderer);
app.controller('mainController', createMainController);
app.factory('messenger', createMessenger);
app.factory('store', createStore);
app.run(run);

createMainController.$inject = ['ipc', 'store'];
function createMainController(ipc, store) {
  var indexTracker, 
    main,
    parsedData,
    previousQuestion,
    questions;

  indexTracker = Object.create(null);
  main = this;

  main.canGoNext = canGoNext;
  main.canGoPrevious = canGoPrevious;
  main.exit = exit;
  main.getTrueQuestionNumber = getTrueQuestionNumber;
  main.next = next;
  main.policyDefined = policyDefinedValues;
  main.previous = previous;
  main.questionIndex = 0;
  main.questionNumber = 1;
  main.save = save;
  main.statusOptions = statusOptions;
  
  main.domainIndex = 0;
  main.domainQuestionNumber = 1;
  
  main.totalIndex = 0;
  main.totalQuestionNumber = 1;
  
  main.updateQuestion = updateQuestion;

  store.load().then(function(data) {
    parsedData = parseDataIntoDomains(data);

    main.currentDomain = domains[0];
    questions = data;

    console.log('Data: ', parsedData);

    main.current = questions[main.questionIndex];
    main.totalQuestions = questions.length;
    main.domainIndex = indexTracker[main.currentDomain].index;
    main.domainTotal = indexTracker[main.currentDomain].total;
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
          previousQuestion = main.current;
          main.questionNumber++;
          updateQuestion(1);
      }
  }

  function parseDataIntoDomains(data) {
    var newDataset, domain, i, j, numberOfDomains, size;

    newDataset = Object.create(null);
    numberOfDomains = domains.length;
    size = data.length;

    for(i = 0; i < numberOfDomains; i++) {
      domain = domains[i];
      newDataset[domain] = [];

      for(j = 0; j < size; j++) {
        if(domain === data[j].domain) {
          newDataset[domain].push(data[j]);
        }
      }

      indexTracker[domain] = Object.create(null); // Create hash map.
      indexTracker[domain].index = 1; // Set index to 1 intially.
      indexTracker[domain].total = newDataset[domain].length; // Set threshold.
    }

    return newDataset;
  }

  function previous() {
      if(canGoPrevious()) {
          previousQuestion = main.current;
          main.questionNumber--;
          updateQuestion(-1);
      }
  }

  function save() {
    ipc.send('save', questions);
  }

  function updateQuestion(adjustment) {
      if(main.questionNumber > 0 && main.questionNumber <= main.totalQuestions) {
          main.questionIndex = (parseInt(main.questionNumber) - 1);
          main.totalIndex = (parseInt(main.questionNumber) - 1);
          main.current = questions[main.questionIndex];
          main.currentDomain = main.current.domain;

          setDomainIndex();

          main.domainIndex = indexTracker[main.current.domain].index; // Set domain index to the current domain index
          main.domainTotal = indexTracker[main.current.domain].total; // Set domain total to the current domain total

          save();

          function adjust() {
            return adjustment === 1 ? indexTracker[main.current.domain].index++ : indexTracker[main.current.domain].index--;
          }
      }
  }

  function setDomainIndex() {
    var currentDomain, domain, totalIndex;

    totalIndex = main.totalIndex + 1;

    for(domain in indexTracker) {
      currentDomain = indexTracker[domain];

      if(totalIndex > currentDomain.total) {
        currentDomain.index = currentDomain.total;
        totalIndex = totalIndex - currentDomain.total;
      } else {
        currentDomain.index = totalIndex;
        break;
      }
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

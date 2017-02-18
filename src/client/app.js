let ipcRenderer = require('electron').ipcRenderer;
let app = angular.module('cgapp', ['ngSanitize']);

let automationStatusValues = require('../../resources/automation-status.json');
let implementationStatusValues = require('../../resources/implementation-status.json');
let policyDefinedValues = require('../../resources/policy-defined.json');
let reportingStatusValues = require('../../resources/reporting-status.json');
let statusOptions = require('../../resources/status-options.json');
let domains = require('../../resources/domain-list.json');
let answers = require('../../resources/answer-list.json');
let control = require('../control');

const fields = require('../fields');

app.value('ipc', ipcRenderer);
app.controller('mainController', createMainController);
app.factory('messenger', createMessenger);
app.factory('store', createStore);
app.run(run);

createMainController.$inject = ['$scope', 'ipc', 'store'];
function createMainController($scope, ipc, store) {
  let main,
    parsedData,
    previousQuestion,
    questions;

  main = this;

  main.answers = answers; // TODO: Need dropdown
  main.automation = automationStatusValues; // TODO: Need dropdown
  main.canGoNext = canGoNext;
  main.canGoPrevious = canGoPrevious;
  main.isCompliant = isCompliant;
  main.domains = domains;
  main.exit = exit;
  main.exportFile = exportFile;
  main.getTrueQuestionNumber = getTrueQuestionNumber;
  main.goToDomain = goToDomain;
  main.implementation = implementationStatusValues; // Need dropdown
  main.indexTracker = Object.create(null);
  main.next = next;
  main.open = open;
  main.policyDefined = policyDefinedValues;
  main.previous = previous;
  main.questionIndex = 0;
  main.questionNumber = 1;
  main.reporting = reportingStatusValues; // TODO: Need dropdown
  main.save = save;
  main.statusOptions = statusOptions;
  main.calculateScore = control.calculateScore;
  
  main.domainIndex = 0;
  main.domainQuestionNumber = 1;
  
  main.totalIndex = 0;
  main.totalQuestionNumber = 1;
  
  main.updateQuestion = updateQuestion;

  store.load().then(function(data) {
    parsedData = parseDataIntoDomains(data);

    // console.log('parsedData: ', parsedData);

    main.currentDomain = domains[0];
    questions = data;

    main.current = questions[main.questionIndex];
    main.totalQuestions = questions.length;
    main.domainIndex = main.indexTracker[main.currentDomain].index;
    main.domainTotal = main.indexTracker[main.currentDomain].total;
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

  function exportFile(type) {
    switch(type) {
      case 'xlsx': {
        exportXLSX();
        break;
      }
      case 'xml': {
        exportXML();
        break;
      }
      default: 
        exportJSON();
    }
  }

  function exportJSON() {
    ipc.send('export-json', questions);
  }

  function exportXLSX() {
    ipc.send('export-xlsx', questions);
  }

  function exportXML() {
    ipc.send('export-xml', questions);
  }

  function getMatch(id, data) {
    let i, size;

    if(typeof id === 'undefined') { return; }

    size = data.length;

    for(i = 0; i < size; i++) {
      if(data[i].id == id) {
        return data[i];
      }
    }
  }

  function getTrueQuestionNumber() {
      return main.questionIndex + 1;
  }

  function goToDomain(domainName) {
    let prop;

    for(prop in main.indexTracker) {
      if(domainName === prop) {
        main.questionNumber = main.indexTracker[prop].startingIndex;
        updateQuestion();
      }
    }
  }

  function isCompliant() {
    if(typeof main.current !== 'undefined' && typeof main.current.answer !== 'undefined') {
      return main.current.answer.id === 0 || main.current.answer.id === 5;
    }

    return false;    
  }

  function next() {
      if(canGoNext()) {
          previousQuestion = main.current;
          main.questionNumber++;
          updateQuestion(1);
      }
  }

  function open() {
    ipc.send('open');
    ipc.once('done-opening', function(response, data, isXLSX) {
      parsedData = isXLSX ? parseXLSXIntoDomains(data) : parseDataIntoDomains(data);

      main.currentDomain = domains[0];
      questions = data;

      main.current = questions[main.questionIndex];
      main.totalQuestions = questions.length;
      main.domainIndex = main.indexTracker[main.currentDomain].index;
      main.domainTotal = main.indexTracker[main.currentDomain].total;

      setTimeout(function() {
        $scope.$digest();
      }, 0);
    });
  }

  function parseXLSXIntoDomains(data) {
    let newDataset, domain, i, j, numberOfDomains, size, startingIndex;

    newDataset = Object.create(null);
    numberOfDomains = domains.length;
    size = data.length;
    startingIndex = 1;

    debugger;

    for(j = 0; j < size; j++) {
      data[j][fields.answer] = getMatch(data[j][fields.answer], answers);
      data[j][fields.policyDefined] = getMatch(data[j][fields.policyDefined], policyDefinedValues);
      data[j][fields.controlImplemented] = getMatch(data[j][fields.controlImplemented], implementationStatusValues);
      data[j][fields.controlAutomated] = getMatch(data[j][fields.controlAutomated], automationStatusValues);
      data[j][fields.controlReported] = getMatch(data[j][fields.controlReported], reportingStatusValues);
      data[j][fields.status] = getMatch(data[j][fields.status], statusOptions);
    }

    for(i = 0; i < numberOfDomains; i++) {
      domain = domains[i];
      newDataset[domain] = [];

      for(j = 0; j < size; j++) {
        if(domain === data[j].domain) {
          newDataset[domain].push(data[j]);
        }
      }

      console.log('data::', data);

      main.indexTracker[domain] = Object.create(null); // Create hash map.
      main.indexTracker[domain].index = 1; // Set index to 1 intially.
      main.indexTracker[domain].total = newDataset[domain].length; // Set threshold.

      main.indexTracker[domain].startingIndex = startingIndex;
      startingIndex += main.indexTracker[domain].total;

      console.log('Index tracker: ', main.indexTracker);
    }

    return newDataset;
  }

  function parseDataIntoDomains(data) {
    let newDataset, domain, i, j, numberOfDomains, size, startingIndex;

    newDataset = Object.create(null);
    numberOfDomains = domains.length;
    size = data.length;
    startingIndex = 1;

    for(i = 0; i < numberOfDomains; i++) {
      domain = domains[i];
      newDataset[domain] = [];

      for(j = 0; j < size; j++) {
        if(domain === data[j].domain) {
          newDataset[domain].push(data[j]);
        }
      }

      main.indexTracker[domain] = Object.create(null); // Create hash map.
      main.indexTracker[domain].index = 1; // Set index to 1 intially.
      main.indexTracker[domain].total = newDataset[domain].length; // Set threshold.

      main.indexTracker[domain].startingIndex = startingIndex;
      startingIndex += main.indexTracker[domain].total;
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

          main.domainIndex = main.indexTracker[main.current.domain].index; // Set domain index to the current domain index
          main.domainTotal = main.indexTracker[main.current.domain].total; // Set domain total to the current domain total

          save();

          function adjust() {
            return adjustment === 1 ? main.indexTracker[main.current.domain].index++ : main.indexTracker[main.current.domain].index--;
          }
      }
  }

  function setDomainIndex() {
    let currentDomain, domain, totalIndex;

    totalIndex = main.totalIndex + 1;

    for(domain in main.indexTracker) {
      currentDomain = main.indexTracker[domain];

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
  let store = Object.create(null);

  store.load = load;

  return store;

  function load() {
    let defer = $q.defer();

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

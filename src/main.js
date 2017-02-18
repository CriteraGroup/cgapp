const {app, BrowserWindow, dialog} = require('electron');
const {CGApp} = require('./home');
const jsonfile = require('jsonfile');
const jsontoxml = require('jsontoxml');
const xlsx = require('xlsx');
const Excel = require('exceljs');
const fields = require('./fields');

let fs = require('fs');
let ipc = require('electron').ipcMain;

ipc.on('bodyLoaded', function(event) {
  let data = jsonfile.readFileSync('data.json');

  event.sender.send('bodyLoadedReply', data);
});

ipc.on('open', function(event) {
  let xlsxRegex, filename, jsonRegex;

  filename = dialog.showOpenDialog({
    title: 'Open file',
    properties: ['openFile']
  });

  if(!filename) { return; }

  jsonRegex = /\.json$/;
  xlsxRegex = /\.xlsx$/;

  if(jsonRegex.test(filename[0])) {
    _loadJSON(filename[0], _callback);
  } else if (xlsxRegex.test(filename[0])) {
    _loadXLSX(filename[0], _callback);
  } else {
    throw new Error('No parser for the selected file type.');
  }

  function _callback(data) {
    event.sender.send('done-opening', data, xlsxRegex.test(filename[0]));
  }

  function _loadJSON(filename, cb) {
    cb(jsonfile.readFileSync(filename));
  }

  function _loadXLSX(filename, cb) {
    var workbook = xlsx.readFile(filename);
    var firstSheetName = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[firstSheetName];

    if(worksheet) {
      cb(xlsx.utils.make_json(worksheet));
    } else {
      throw new Error('Unable to find matching worksheet name... exiting.');
    }
  }
});

ipc.on('export-json', function(event, data) {
  let allSaveData, d, filename, i, outputXML, s, size, xml;

  for(d = 0; d < data.length; d++) {
    getControlScore(data[d]);
  }

  filename = dialog.showSaveDialog({
    title: 'Export Report'
  });

  if(!filename) { return; }

  if(!/\.json$/.test(filename)) {
    filename += '.json';
  }

  jsonfile.writeFile(filename, data, function(err) {
    if(err === null) {
      event.sender.send('success-message', 'Successfully saved changes.');
    } else {
      event.sender.send('fail-message', 'Something went wrong trying to save the changes.');
    }
  });
});

ipc.on('export-xlsx', function(event, rows) {
  var filename, i, sheet,
  workbook = new Excel.Workbook();

  for(i = 0; i < rows.length; i++) {
    getControlScore(rows[i])
  }

  filename = dialog.showSaveDialog({
    title: 'Export Report'
  });

  if(!filename) { return; }

  if(!/\.xlsx$/.test(filename)) {
    filename += '.xlsx';
  }

  sheet = workbook.addWorksheet('Dataset');
  
  sheet.columns = [
    { header: fields.domain, key: fields.domain, width: 10 },
    { header: fields.objective, key: fields.objective, width: 10 },
    { header: fields.section, key: fields.section, width: 10 },
    { header: fields.source, key: fields.source, width: 10 },
    { header: fields.reason, key: fields.reason, width: 10 },
    { header: fields.question, key: fields.question, width: 10 },
    { header: fields.customerResponse, key: fields.customerResponse, width: 10 },
    { header: fields.auditorNotes, key: fields.auditorNotes, width: 10 },
    { header: fields.answer, key: fields.answer, width: 10 },
    { header: fields.policyDefined, key: fields.policyDefined, width: 10 },
    { header: fields.controlImplemented, key: fields.controlImplemented, width: 10 },
    { header: fields.controlAutomated, key: fields.controlAutomated, width: 10 },
    { header: fields.controlReported, key: fields.controlReported, width: 10 },
    { header: fields.status, key: fields.status, width: 10 }
  ];

  rows.forEach(function loopRows(row) {
      sheet.addRow({
        'domain': row[fields.domain],
        'objective': row[fields.objective],
        'section': row[fields.section],
        'source': row[fields.source],
        'reason': row[fields.reason],
        'question': row[fields.question],
        'customer_response': row[fields.customerResponse],
        'auditor_notes': row[fields.auditorNotes],
        'answer': typeof row[fields.answer] !== 'undefined' ? row[fields.answer].id : null,
        'policy_defined': typeof row[fields.policyDefined] !== 'undefined' ? row[fields.policyDefined].id : null,
        'control_implemented': typeof row[fields.controlImplemented] !== 'undefined' ? row[fields.controlImplemented].id : null,
        'control_automated_or_technically_enforced': typeof row[fields.controlAutomated] !== 'undefined' ? row[fields.controlAutomated].id : null,
        'control_reported_to_business': typeof row[fields.controlReported] !== 'undefined' ? row[fields.controlReported].id : null,
        'status': typeof row[fields.status] !== 'undefined' ? row[fields.status] : null 
      });
  });

  workbook.xlsx.writeFile(filename).then(function() {
    event.sender.send('success-message', 'Successfully saved changes.');
  });
});

ipc.on('export-xml', function(event, data) {
  let allSaveData, d, filename, i, outputXML, s, size, xml;

  for(d = 0; d < data.length; d++) {
    getControlScore(data[d]);
  }

  filename = dialog.showSaveDialog({
    title: 'Export XML'
  });

  if(!filename) { return; }

  allSaveData = [];
  size = data.length;

  for(i = 0; i < size; i++) {
    let s = {
      name: 'control',
      children: []
    };

    s.children.push(data[i]);
    allSaveData.push(s);
  }

  xml = {
    'data': allSaveData
  };

  outputXML = jsontoxml(xml, {
    escape: true
  });

  if(!/\.xml$/.test(filename)) {
    filename += '.xml';
  }

  fs.writeFile(filename, outputXML, function(err) {
    if(err === null) {
      event.sender.send('success-message', 'Successfully saved changes.');
    } else {
      event.sender.send('fail-message', 'Something went wrong trying to save the changes.');
    }
  });
});

ipc.on('save', function(event, rows) {
  jsonfile.writeFile('data.json', rows, function(err) {
    if(err === null) {
      event.sender.send('success-message', 'Successfully saved changes.');
    } else {
      event.sender.send('fail-message', 'Something went wrong trying to save the changes.');
    }
  });
});

ipc.on('exit', function() {
  app.quit();
});

new CGApp(app, BrowserWindow);

function getControlScore(c) {
  var totalPointValue = 4;

  if(_isNoAnswer()) {
    _setZeroPoints();
  } else if(_isYes()) {
    _setFullPoints();
  } else if(_isNo()) {
    _setZeroPoints();
  } else if(_isNotApplicable()) {
    _setNotApplicable();
  } else if(_isNotReviewed()) {
    _setNotReviewed();
  } else if(_isPartial()) {
    _getPartialControlScore();
  }

  function _getValue(property) {
    let value = 0;

    if(!c[property]) { return value; }

    if(c[property].id === 5) {
      totalPointValue--;
      return value;
    }

    return c[property].value;
  }

  function _getPartialControlScore() {
    let total = 0;

    total += _getValue(fields.controlAutomated);
    total += _getValue(fields.controlImplemented);
    total += _getValue(fields.controlReported);
    total += _getValue(fields.policyDefined);

    c[fields.status] = (totalPointValue === 0) ? 0 : ((total/totalPointValue) * 100);
  }

  function _isNoAnswer() {
    return !c[fields.answer];
  }

  function _isNo() {
    return c[fields.answer].id === 1;
  }

  function _isNotApplicable() {
    return c[fields.answer].id === 2;
  }

  function _isNotReviewed() {
    return c[fields.answer].id === 3;
  }

  function _isPartial() {
    return c[fields.answer].id === 5;
  }

  function _isYes() {
    return c[fields.answer].id === 0;
  }

  function _setFullPoints() {
    c[fields.status] = 100;
  }

  function _setNotApplicable() {
    c[fields.status] = -1;
  }

  function _setNotReviewed() {
    c[fields.status] = -2;
  }

  function _setZeroPoints() {
    c[fields.status] = 0;
  }
}
const {app, BrowserWindow} = require('electron');
const {CGApp} = require('./home');
const jsonfile = require('jsonfile');
const jsontoxml = require('jsontoxml');
const xlsx = require('xlsx');

const DOMAIN = 'domain';
const OBJECTIVE = 'objective';
const SECTION = 'section';
const SOURCE = 'source';
const REASON = 'reason';
const QUESTION = 'question';
const CUSTOMER_RESPONSE = 'customer_response';
const AUDITOR_NOTES = 'auditor_notes';
const ANSWER = 'answer';
const POLICY_DEFINED = 'policy_defined';
const CONTROL_IMPLEMENTED = 'control_implemented';
const CONTROL_AUTOMATED = 'control_automated_or_technically_enforced';
const CONTROL_REPORTED = 'control_reported_to_business';
const STATUS = 'status';

let fs = require('fs');
let ipc = require('electron').ipcMain;

ipc.on('bodyLoaded', function(event) {
  let data = jsonfile.readFileSync('data.json');

  event.sender.send('bodyLoadedReply', data);
});

ipc.on('export', function(event, data) {
  let allSaveData, i, outputXML, s, size, xml;

  allSaveData = [];
  size = data.length;

  for(i = 0; i < size; i++) {
    let s = {
      name: 'taco',
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

  fs.writeFile('text-xml-output.xml', outputXML, function(err) {
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

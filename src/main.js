const {app, BrowserWindow} = require('electron');
const {CGApp} = require('./home');
const {loadXLSX} = require('./home/load.js');
const Excel = require('exceljs');

const DOMAIN = 'domain';
const OBJECTIVE = 'objective';
const SECTION = 'section';
const SOURCE = 'source';
const REASON = 'reason';
const QUESTION = 'question';
const CUSTOMER_RESPONSE = 'customer response';
const AUDITOR_NOTES = 'auditor notes';
const ANSWER = 'answer';
const POLICY_DEFINED = 'policy defined';
const CONTROL_IMPLEMENTED = 'control implemented';
const CONTROL_AUTOMATED = 'control automated or technically enforced';
const CONTROL_REPORTED = 'control reported to business';
const STATUS = 'status';

let fs = require('fs');
let ipc = require('electron').ipcMain;

ipc.on('bodyLoaded', function(event) {
  loadXLSX('data.xlsx', function sendBackData(data) {
    event.sender.send('bodyLoadedReply', data);
  });
});

ipc.on('save', function(event, rows) {
  var sheet,
    workbook = new Excel.Workbook();

  sheet = workbook.addWorksheet('Dataset');
  
  sheet.columns = [
    { header: DOMAIN, key: DOMAIN, width: 10 },
    { header: OBJECTIVE, key: OBJECTIVE, width: 10 },
    { header: SECTION, key: SECTION, width: 10 },
    { header: SOURCE, key: SOURCE, width: 10 },
    { header: REASON, key: REASON, width: 10 },
    { header: QUESTION, key: QUESTION, width: 10 },
    { header: CUSTOMER_RESPONSE, key: CUSTOMER_RESPONSE, width: 10 },
    { header: AUDITOR_NOTES, key: AUDITOR_NOTES, width: 10 },
    { header: ANSWER, key: ANSWER, width: 10 },
    { header: POLICY_DEFINED, key: POLICY_DEFINED, width: 10 },
    { header: CONTROL_IMPLEMENTED, key: CONTROL_IMPLEMENTED, width: 10 },
    { header: CONTROL_AUTOMATED, key: CONTROL_AUTOMATED, width: 10 },
    { header: CONTROL_REPORTED, key: CONTROL_REPORTED, width: 10 },
    { header: STATUS, key: STATUS, width: 10 }
  ];

  rows.forEach(function loopRows(row) {
      sheet.addRow({
        'domain': row[DOMAIN],
        'objective': row[OBJECTIVE],
        'section': row[SECTION],
        'source': row[SOURCE],
        'reason': row[REASON],
        'question': row[QUESTION],
        'customer response': row[CUSTOMER_RESPONSE],
        'auditor notes': row[AUDITOR_NOTES],
        'answer': typeof row[ANSWER] !== 'undefined' ? row[ANSWER].id : null,
        'policy defined': typeof row[POLICY_DEFINED] !== 'undefined' ? row[POLICY_DEFINED].id : null,
        'control implemented': typeof row[CONTROL_IMPLEMENTED] !== 'undefined' ? row[CONTROL_IMPLEMENTED].id : null,
        'control automated or technically enforced': typeof row[CONTROL_AUTOMATED] !== 'undefined' ? row[CONTROL_AUTOMATED].id : null,
        'control reported to business': typeof row[CONTROL_REPORTED] !== 'undefined' ? row[CONTROL_REPORTED].id : null,
        'status': typeof row[STATUS] !== 'undefined' ? row[STATUS].id : null 
      });
  });

  workbook.xlsx.writeFile('data.xlsx').then(function() {
    event.sender.send('success-message', 'Successfully saved changes.');
  })
});

ipc.on('exit', function() {
  app.quit();
});

new CGApp(app, BrowserWindow);

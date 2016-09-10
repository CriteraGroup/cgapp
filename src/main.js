const {app, BrowserWindow} = require('electron');
const {CGApp} = require('./home');
const {loadXLSX} = require('./home/load.js');
const Excel = require('exceljs');

let fs = require('fs');

let ipc = require('electron').ipcMain;

ipc.on('bodyLoaded', function(event) {
  loadXLSX('data.xlsx', function sendBackData(data) {
    event.sender.send('bodyLoadedReply', data)
  });
});

ipc.on('save', function(event, rows) {
  var sheet,
    workbook = new Excel.Workbook();

  workbook.creator = 'KWarnock';
  workbook.lastModifiedBy = 'Them';
  workbook.created = new Date(1985, 8, 30);
  workbook.modified = new Date();

  sheet = workbook.addWorksheet('Dataset');
  
  sheet.columns = [
    { header: 'domain', key: 'domain', width: 10 },
    { header: 'objective', key: 'objective', width: 10 },
    { header: 'policy derived', key: 'policy derived', width: 10 },
    { header: 'reason', key: 'reason', width: 10 },
    { header: 'question', key: 'question', width: 10 },
    { header: 'customer response', key: 'customer response', width: 10 },
    { header: 'auditor notes', key: 'auditor notes', width: 10 },
    { header: 'policy defined', key: 'policy defined', width: 10 },
    { header: 'control implemented', key: 'control implemented', width: 10 },
    { header: 'control automated or technically enforced', key: 'control automated or technically enforced', width: 10 },
    { header: 'control reported to business', key: 'control reported to business', width: 10 },
    { header: 'status', key: 'status', width: 10 }
  ];

  rows.forEach(function loopRows(row) {
      sheet.addRow({
        'domain': row.domain,
        'objective': row.section,
        'question': row.question,
        'customer response': row['customer response'],
        'auditor notes': row['auditor notes'],
        'status': typeof row.status !== "undefined" ? row.status.text : null
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

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
  var workbook = new Excel.Workbook();
  var sheet = workbook.addWorksheet('Sheet 1');

  sheet.columns = [
    { header: 'section', key: 'section', width: 10 },
    { header: 'question', key: 'question', width: 32 },
    { header: 'answer', key: 'answer', width: 10 },
    { header: 'finding', key: 'finding', width: 10 },
    { header: 'status', key: 'status', width: 10 }
  ];

  for(var row in rows) {
    sheet.addRow({
      section: rows[row].section,
      question: rows[row].question,
      answer: rows[row].answer,
      finding: rows[row].finding,
      status: rows[row].status
    });
  };

  workbook.xlsx.writeFile('data.xlsx').then(function() {
    event.sender.send('success-message', 'Successfully saved changes.');
  })
});

ipc.on('exit', function() {
  app.quit();
});

new CGApp(app, BrowserWindow);
const {app, BrowserWindow} = require('electron');
const {CGApp} = require('./home');
const {Excel} = require('./workbook-manager')

let fs = require('fs');

// let xlsx = require('node-xlsx');
let ipc = require('electron').ipcMain;
let data = require('../../cgdata.json');

ipc.on('bodyLoaded', function(event) {
  // const workSheetsFromFile = xlsx.parse(`${__dirname}/data.xlsx`);
  // let data = workSheetsFromFile[0].data;

  // data.splice(0, 1);

  event.sender.send('bodyLoadedReply', data);
});

ipc.on('save', function(event, data) {
  fs.writeFile('../cgdata.json', JSON.stringify(data), 'utf-8', function() {
    if(arguments[0] === null) {
      event.sender.send('success-message', 'Successfully saved changes.');
    }
  });
});

ipc.on('exit', function() {
  app.quit();
});

new CGApp(app, BrowserWindow);

const {app, BrowserWindow} = require('electron');
const {CGApp} = require('./app');

let fs = require('fs');

// let xlsx = require('node-xlsx');
let ipc = require('electron').ipcMain;
let data = require('../cgdata.json');

ipc.on('bodyLoaded', function(event) {
  // const workSheetsFromFile = xlsx.parse(`${__dirname}/data.xlsx`);
  // let data = workSheetsFromFile[0].data;
  
  // data.splice(0, 1);

  event.sender.send('bodyLoadedReply', data);
});

ipc.on('save', function(event, data) {
  console.log(data);

  fs.writeFile('../cgdata.json', JSON.stringify(data), 'utf-8', function() {
    console.log('Should have written to file... these are the response arguments: ', arguments);
  });
});

new CGApp(app, BrowserWindow);


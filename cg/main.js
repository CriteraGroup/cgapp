const {app, BrowserWindow} = require('electron');
const {CGApp} = require('./app');

let xlsx = require('node-xlsx');
let ipc = require('electron').ipcMain;
// let data = require('../cgdata.json');

ipc.on('bodyLoaded', function(event) {
  console.log('Processing the bodyLoaded event');

  const workSheetsFromFile = xlsx.parse(`${__dirname}/data.xlsx`);
  let data = workSheetsFromFile[0].data;

  data.splice(0, 1);

  event.sender.send('bodyLoadedReply', data);
});

new CGApp(app, BrowserWindow);


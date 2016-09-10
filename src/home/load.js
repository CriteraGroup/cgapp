var xlsx = require('xlsx');
var Excel = require('exceljs');
var wb = new Excel.Workbook();

module.exports.loadXLSX = function loadXLSX(filename, cb) {
  var workbook = xlsx.readFile(filename);
  var firstSheetName = workbook.SheetNames[0];
  var worksheet = workbook.Sheets[firstSheetName];

  if(worksheet) {
    cb(xlsx.utils.make_json(worksheet));
  } else {
    throw new Error('Unable to find matching worksheet name... exiting.');
  }
};

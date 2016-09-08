var xlsx = require('xlsx');

module.exports.loadXLSX = function loadXLSX(filename, cb) {
  var workbook = xlsx.readFile(filename);
  var firstSheetName = workbook.SheetNames[0];
  var worksheet = workbook.Sheets[firstSheetName];

  if(worksheet && worksheet['!ref']) {
    if(cb && typeof cb === 'function') {
      cb(xlsx.utils.make_json(worksheet));
    }
  }
};

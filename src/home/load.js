var xlsx = require('xlsx');

module.exports.loadXLSX = function loadXLSX(filename, cb) {
  var workbook = xlsx.readFile(filename);
  var firstSheetName = workbook.SheetNames[0];
  var worksheet = workbook.Sheets[firstSheetName];

  if(worksheet && worksheet['!ref']) {
    if(cb && typeof cb === 'function') {
      cb(parseRef(worksheet['!ref']));
    }
  }

  function parseRef(ref) {
    var alphabet, columnNames, columns, end, i, j, numberOfColumns, regex, results, row, rows;

    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    regex = /^([a-zA-Z]+)([0-9]+):([a-zA-Z]+)([0-9]+)$/;

    results = regex.exec(ref);
    columns = alphabet.substr(alphabet.indexOf(results[1]), alphabet.indexOf(results[3]) + 1);

    numberOfColumns = columns.length;
    end = results[4];
    rows = Object.create(null);
    columnNames = Object.create(null);

    for(i = results[2]; i <= end; i++) {
      row = Object.create(null);

      for(j = 0; j < numberOfColumns; j++) {
        if(i == 1) {
          columnNames[columns.charAt(j)] = worksheet[columns.charAt(j) + i].w;
        } else {
          if(worksheet[columns.charAt(j) + i]) {
            row[columnNames[columns.charAt(j)]] = worksheet[columns.charAt(j) + i].w;
          } else {
            row[columnNames[columns.charAt(j)]] = null;
          }
        }
      }

      if(i != 1) {
        rows[i - 1] = row;
      }
    }

    return rows;
  }
};

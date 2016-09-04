var xlsx = require('xlsx');

module.exports.loadXLSX = function loadXLSX(filename) {
  var workbook = xlsx.readFile('output.xlsx');
  var firstSheetName = workbook.SheetNames[0];

  var worksheet = workbook.Sheets[firstSheetName];

  if(worksheet && worksheet['!ref']) {
    console.log('row 6: ', parseRef(worksheet['!ref'])[6]);
  }

  function parseRef(ref) {
    var alphabet, columns, end, i, j, numberOfColumns, regex, results, row, rows;

    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    regex = /^([a-zA-Z]+)([0-9]+):([a-zA-Z]+)([0-9]+)$/;

    results = regex.exec(ref);
    columns = alphabet.substr(alphabet.indexOf(results[1]), alphabet.indexOf(results[3]) + 1);

    numberOfColumns = columns.length;
    end = results[4];
    rows = Object.create(null);

    for(i = results[2]; i <= end; i++) {
      row = [];

      for(j = 0; j < numberOfColumns; j++) {
        row.push(worksheet[columns.charAt(j) + i].w || worksheet[columns.charAt(j) + i].v);
      }

      rows[i] = row;
    }

    return rows;
  }
};

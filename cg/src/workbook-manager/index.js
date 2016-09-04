var Excel = require('exceljs');

var columns = ['A', 'B', 'C', 'D', 'E'],
  data = 'Yo, dawgie. ',
  numberOfRows = 20,
  wb, ws;

wb = new Excel.Workbook();

wb.addWorksheet('dataSheet');

ws = wb.getWorksheet('dataSheet');

for(var i = 0; i < numberOfRows; i++) {
  for(var j = 0; j < columns.length; j++) {
    ws.getCell(columns[j] + i).value = data + ' ' + i;
  }
}

wb.xlsx.writeFile('./output.xlsx')
.then(function() {
  console.log('Arguments: ', arguments);
});

/*
  // write to a file

  workbook.xlsx.writeFile(filename)
  .then(function() {
      // done
  });

  // write to a stream

  workbook.xlsx.write(stream)
  .then(function() {
      // done
  });
*/

module.exports.Excel = Excel;

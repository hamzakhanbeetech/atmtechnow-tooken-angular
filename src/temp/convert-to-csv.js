const fs = require('fs');
const path = require('path');
const args = process.argv;
readJson(args[2]);

function readJson(inputJson) {
  fs.readFile(path.join(__dirname, '.', `tookan/${inputJson}.json`), (err, data) => {
    if (err) throw err;
    data = JSON.parse(data.toString());

    str = {};
    getTranslations(_data);

    const langCSV = toCSV(str, ';');

    fs.readFile(path.join(__dirname, '.', `tookan//csv/en.csv`), (err, data) => {
      if (err) throw err;
      data = data.toString();

      validateKeys(langCSV, ';', data);

      fs.writeFile(path.join(__dirname, '.', `tookan/csv/${inputJson}.csv`), langCSV, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
    });
  });
}

var str = {};
function getTranslations(obj) {
  const keys = Object.keys(obj);
  keys.forEach(key => {
    if (typeof obj[key] == "string" && key.trim() != "" && obj[key].trim() != '') {
      if (key != 'CLICK_TRACK\n' && key != 'create_your_first_task')
        str[key] = obj[key];
    }
    else {
      getTranslations(obj[key]);
    }
  });
}

function toCSV(obj, delimiter) {
  var x = [];
  x.push(`key${delimiter}value`)
  Object.keys(obj).forEach(key => {
    if (obj[key].indexOf(delimiter) > -1) throw new Error('delimiter present in string');
    if (key && key.trim() != '' && obj[key] && obj[key].trim() != '') {
      let value = obj[key];
      value = value.indexOf('"') > -1 ? JSON.stringify(value) : value;
      let str = key + delimiter + value;
      x.push(str);
    }
  });
  return x.join('\n');
}

function validateKeys(langCSV, delimiter, enCSV) {
  let en = {};
  enCSV.split('\n').forEach(row => {
    const key = row.split(',')[0];
    en[key] = 1;
  });
  let invalidKeys = [];
  langCSV.split('\n').forEach(row => {
    const key = row.split(delimiter || ',')[0];
    if (!en[key]) {
      invalidKeys.push(key);
    }
  });
  if (invalidKeys.length) {
    console.log('invalid keys: ');
    console.log(invalidKeys);
  }
  else {
    console.log('all ok!');
  }
}
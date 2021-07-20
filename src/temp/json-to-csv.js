const fs = require('fs');
const json2csv = require('json2csv').parse;
const path = require('path');


const fields = ['key', 'value'];
const opts = { fields };
const args = process.argv;
convertJson(args[2]);

function convertJson(inputJson) {
  fs.readFile(path.join(__dirname, '.', `tookan/${inputJson}.json`), (err, data) => {
    if (err) throw new Error(err);
    data = JSON.parse(data.toString());

    str={};
    getTranslations(data);
    let arr=[];
    //make unique
    Object.keys(str).forEach(key => {
      arr.push({ key: key, value: str[key] });
    });
    toCSV(arr, inputJson);
  });
}

var str = {};
function getTranslations(obj) {
  const keys = Object.keys(obj);
  keys.forEach(key => {
    if (typeof obj[key] == "string" && key.trim() != "" && obj[key].trim() != '') {
      if (key != 'CLICK_TRACK\n' && key != 'create_your_first_task')
        str[key] = obj[key];
      // arr.push({ key: key, value: obj[key] });
    }
    else {
      getTranslations(obj[key]);
    }
  });
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

function toCSV(myData, inputJson) {
  try {
    const csv = json2csv(myData, opts);
    fs.readFile(path.join(__dirname, '.', `tookan//csv/es.csv`), (err, data) => {
      if (err) throw err;
      data = data.toString();

      validateKeys(csv, ',', data);
      fs.writeFile(path.join(__dirname, '.', `tookan/csv/${inputJson}.csv`), csv, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
    });
  } catch (err) {
    console.error(err);
  }
}
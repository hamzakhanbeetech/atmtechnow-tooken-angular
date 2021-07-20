const args = process.argv;
const fs = require('fs');
const path = require('path');
for (let i = 2; i < args.length; i++) {
    const inputJson = args[i];
    convert(inputJson);
}

function convert(inputJson) {


    fs.readFile(path.join(__dirname, '..', `server/${inputJson}.json`), (err, data) => {
        const Xjson = JSON.parse(data.toString()); //{key:string} pairs
        fs.readFile(path.join(__dirname, 'Mapping-jsons.json'), (err, data) => {
            if (err) throw err;
            const Yjson = JSON.parse(data.toString());
            //Map and use values Y = ours
            fs.readFile(path.join(__dirname, '..', 'i18n/messages.xlf'), (err, data) => {
                if (err) throw err;

                let x = data.toString();
                let arr = [];
                let skipped_arr = [];
                x = x.split('\n');
                let jsonObj = {};
                let source = "";
                x.forEach(element => {
                    let el = element.trim();
                    if (el.startsWith('<source>')) {
                        source = el.replace('<source>', '').replace('</source>', '').trim();
                        let jsonKey = source;
                        let tempKey = Yjson[source] ;
                        let jsonValue = Xjson[tempKey] ;
                        jsonObj[jsonKey] = jsonValue ? jsonValue : "" ;

                    }
                });
                // console.log(jsonObj);
                //write to file
                jsonObj = JSON.stringify(jsonObj);
                fs.writeFile(path.join(__dirname, `${inputJson}.json`), jsonObj, function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                });
            });
        });
    });
}

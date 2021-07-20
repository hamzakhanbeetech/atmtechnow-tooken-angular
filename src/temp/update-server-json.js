const fs = require('fs');
const path = require('path');
const https = require('https');
const args = process.argv;
// var nrc = require('node-run-cmd');
const cmd = require('node-cmd');
const zlib = require('zlib');

getTranslations(args[2]);
function getTranslations(lang) {
  return new Promise((resolve, reject) => {
    var buffer = [];
    https.get(`https://multilingual-live-api.tookanapp.com/jungle/get_app_translations?app_type=3&offering=1&lang=${lang}`, function (res) {
      let rawData = '';
      var gunzip = zlib.createGunzip();
      res.pipe(gunzip);
      gunzip.on('data', function (data) {
        // decompression chunk ready, add it to the buffer
        buffer.push(data.toString())
      }).on('end', () => {
        try {
          rawData = buffer.join('');
          const parsedData = JSON.parse(rawData).data;          
          if(lang=='en'){parsedData.messages={}}
          fs.writeFile(path.join(__dirname, '..', `server/${lang}.json`), JSON.stringify(parsedData.messages), function (err) {
            if (err) throw err;
            cmd.get(`npm run create-lang-json ${lang}`, function (err, data, stderr) {
              if (!err) {
                cmd.get(`npm run create-xlf ${lang}`, function (err, data, stderr) {
                  if (!err) {
                    cmd.get(`langCode=${lang} npm run dyn-build-prod`, function (err, data, stderr) {
                      if (err) {
                        console.error(err);
                      }
                      else
                        console.log('success', data)
                    }
                    );
                  }
                  else
                    console.error(err, stderr);
                });
              }
              else
                console.error(err, stderr);
            });

            // nrc.run([`for lang in ${lang}; do ng build --output-path=dist/$lang --aot=true -oh=all -sm=false -ec=true -nc=false --build-optimizer=true --bh /v2/$lang/ --i18n-file=src/i18n/messages.$lang.xlf --i18n-format=xlf --locale=$lang; done;`])
            //   .then(exitCodes => { console.log('success', exitCodes); }
            //     , err => { console.log(err) })
          });
        } catch (e) {
          console.error(e.message);
        }
      });
    });
  });
}

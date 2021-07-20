const args = process.argv;
const fs = require('fs');
const path = require('path');
if (args.length == 2) throw new Error('3rd arg required');
for (let i = 2; i < args.length; i++) {
	const lang = args[i];
	convert(lang);
}
function convert(lang) {


	fs.readFile(path.join(__dirname, `${lang}.json`), (err, data) => {
		const json = JSON.parse(data.toString());
		fs.readFile(path.join(__dirname, '..', 'i18n/messages.xlf'), (err, data) => {
			if (err) throw err;

			let x = data.toString();
			let arr = [];
			let skipped_arr = [];
			x = x.split('\n');

			let source = "";
			x.forEach(element => {
				let el = element.trim();
				if (el.startsWith('<source>')) {
					source = el.replace('<source>', '').replace('</source>', '').trim();
				}
				else if (el.startsWith('</trans-unit>')) {
					let target = json[source];
					if (!target) {
						skipped_arr.push(source);
					}
					arr.push('\t\t\t\t<target>' + (target ? target : source) + '</target>');
				}
				//add to array
				arr.push(element);
			})

			//unresolved mappings
			if (skipped_arr.length)
				console.log('no mappings found for\n', skipped_arr.join('\n'));

			//write to file
			fs.writeFile(path.join(__dirname, '..', `i18n/messages.${lang}.xlf`), arr.join('\n'), function (err) {
				if (err) throw err;
				console.log('Saved!');
			});
		});
	});
}

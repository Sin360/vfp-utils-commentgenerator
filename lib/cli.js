(function () {

	var args = process.argv.splice(2);
	var fs = require('fs');
	var path = require('path');
	var Parser = require('./parser.js');
	var Doc = require('./doc.js');

	if (!args.length) {
		console.log("Usage: node cli.js <input path>");
		return
	}

	// start chrono
	var starttime = Date.now();

	console.log('Start comment generation...')

	// loop through files
	for (var i = args.length - 1; i >= 0; i--) {
		parseFile(args[i]);
	};

	// stop chrono
	console.log('Comment generation completed in ' + ((Date.now() - starttime) / 1000) + ' seconds');

	/**
	 * Generates a new file with yuidoc comments
	 *
	 * @method parseFile
	 * @param {string} file File
	 */
	function parseFile (file) {
		// read File content
		fs.readFile(file, function (err, data) {

			// catch error
			if (err) {
				throw err;
			}

			// convert stream to binary then to utf8
			var stream = data.toString("binary").toString("utf8");

			// instanciate parser
			var parser = new Parser();

			// set name of parsed file
			parser.fileName = path.basename(file);

			// parse file stream
			parser.parse(stream);

			// retrieve parsed data
			var json = parser.getJSON();

			// instanciate documentation generator
			var doc = new Doc(json, stream);

			// write generated file with documentation
			fs.writeFile('out/' + parser.fileName, doc.run(), function (err) {
				if (err) {
					throw err;
				}
			});

		});
	};

}());
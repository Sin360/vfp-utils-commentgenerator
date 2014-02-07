'use strict';

var fs = require('fs');
var path = require('path');
var Doc = require('../lib/doc.js');
var Parser = require('../lib/parser.js');

exports['doc'] = {
	"parse a classless file": function (test) {

		var result = parseFile('test/src/classless.prg');
		var lines = result.split('\n');
		var pattern;

		pattern = /^\*\s@method\s\w*/gi;
		test.ok(pattern.test(lines[3]), "should not be indented and it should be a method declaration");

		pattern = /undefined$/gi;
		test.ok(!pattern.test(lines[lines.length-1]), "should not add undefined at the end of the file");

		test.done();
	}
};

/**
 * Generates a new file with yuidoc comments
 *
 * @method parseFile
 * @param {string} file File
 */
function parseFile (file) {

	// read File content
	var stream = fs.readFileSync(file);

	// convert stream to binary then to utf8
	stream = stream.toString("binary").toString("utf8");

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

	// return file content
	return doc.run();

};
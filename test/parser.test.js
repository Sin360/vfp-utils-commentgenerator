'use strict';

var Parser = require('../lib/parser.js');

exports['parser'] = {
	setUp: function (callback) {
		// instantiate a new parser for each test
        this.parser = new Parser();
        callback();
    },
	instanciate: function (test) {
		test.equal(typeof this.parser, "object", "should instanciate parser object");
		test.done();
	},
	getActiveClass: function (test) {
		this.parser.getActiveClass();
		test.equal(this.parser.Classes.length, 1, "should add a class object to classes array");
		test.done();
	},
	getActiveMethod: function (test) {
		this.parser.parseLine("function mop");
		var meth = this.parser.getActiveMethod();
		test.ok(meth, "should return something");
		test.equal(typeof meth, "object", "should return an object");
		test.done();
	},
	parseLine: function (test) {
		test.ok(this.parser.parseLine("DEFINE CLASS Mop"), "should parse class declaration");
		test.equal(this.parser.Classes[0].name, "Mop", "should extract proper class name");
		test.ok(this.parser.parseLine("RETURN"), "should return true");
		test.ok(this.parser.parseLine("FUNCTION test"), "should return true");
		test.equal(this.parser.Classes[0].methods.length, 1, "should fetch methods array");
		test.equal(this.parser.Classes[0].methods[0].name, "test", "should return proper method name");
		test.done();
	},
	test: function (test) {
		var fs = require('fs');

		fs.readFile('test/src/parser.prg', "utf8", function (err, stream) {

			// Catch error
			if (err) {
				throw err;
			}

			// Instanciate parser
			var parser = new Parser();

			// Set name of parsed file
			parser.fileName = 'test.prg';

			// Parse file stream
			parser.parse(stream);

			test.equal(typeof parser, "object", "should be an object");
			test.equal(parser.fileName, "test.prg", "should return filename");
			test.equal(parser.Classes.length, 1, "should return number of classes");
			test.equal(parser.currentLine, 32, "should return number of lines");
			test.equal(parser.Classes[0].name, "Mop", "should return class name");
			test.equal(parser.Classes[0].properties.length, 2, "should return number of properties");

			// end of tests
			test.done();

		});
	}
};
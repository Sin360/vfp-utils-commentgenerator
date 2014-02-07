/**
 * Parse a file and retrieve informations about its classes and methods
 *
 * @module Parser
 * @class Parser
 * @constructor
 * @author s.leroux
 */
var Parser = function () {

	this.Classes = [];
	this.fileName = "";
	this.currentLine = 0;
	this.multilines = [];

	/**
	 * Parse a stream
	 *
	 * @method parse
	 * @param {string} stream File stream
	 */
	this.parse = function (stream) {
		// split strings to array
		var lines = stream.split("\n");

		// loop through each line
		for (var i = 0; i < lines.length; i++) {
			// set active line number
			this.currentLine = i + 1;

			// parse line
			this.parseLine(lines[i]);
		};
	};

	/**
	 * Parse a line
	 *
	 * @method parseLine
	 * @param {string} line Line stream
	 * @return {boolean} Returns true if a pattern was recognized
	 */
	this.parseLine = function (line) {

		line = this.cleanUpLine(line);

		if (this.isIgnoredPattern(line)) {
			return true;
		}

		var pattern;

		// check for multiline
		pattern = /;$/gi;
		if (line.contains(pattern)) {
			this.multilines.push(line.remove(pattern));
			return true;
		}

		if (this.multilines.length) {
			line = this.multilines.join(" ") + line;
			this.multilines = [];
		}

		// check for class declaration
		pattern = /(^define +class)/gi;
		if (line.contains(pattern)) {
			// create new class item
			var activeClass = new Class();
			var words = line.remove(pattern).split(" ");
			// set name
			activeClass.name = words[0];
			// set parent
			activeClass.parent = words[2];
			// set begin line number
			activeClass.beginLine = this.currentLine;
			// add class to classes array
			this.Classes.push(activeClass);
			return true;
		}

		// check for class closure
		pattern = /^enddefine$/gi;
		if (line.contains(pattern)) {
			// get active class object
			var activeClass = this.getActiveClass();
			// set end line number
			activeClass.endLine = this.currentLine;
			return true;
		}

		// check for function closure
		pattern = /^endfunc$/gi;
		if (line.contains(pattern)) {
			// get active function object
			var func = this.getActiveMethod();
			// set end line number
			func.endLine = this.currentLine;
			return true;
		}

		// check for function declaration
		pattern = /^(protected )?(hidden )?(func(?:tion)?)/gi;
		if (line.contains(pattern)) {
			// get active class object
			var activeClass = this.getActiveClass();
			// create new function item
			var func = new Func();
			// set visibility
			func.visibility = this.getMethodVisibility(line);
			// set name
			func.name = line.remove(pattern);
			// function name (parameters) declaration
			this.searchInlineParametersDeclaration(func);
			// set begin line number
			func.beginLine = this.currentLine;
			// add function object
			activeClass.methods.push(func);
			return true;
		}

		// check for procedure closure
		pattern = /^endproc$/gi;
		if (line.contains(pattern)) {
			// get active procedure object
			var proc = this.getActiveMethod();
			// set end line number
			proc.endLine = this.currentLine;
			return true;
		}

		// check for procedure declaration
		pattern = /^(protected )?(hidden )?(proc(?:edure)?)/gi;
		if (line.contains(pattern)) {
			// get active class object
			var activeClass = this.getActiveClass();
			// create new procedure item
			var proc = new Proc();
			// set visibility
			proc.visibility = this.getMethodVisibility(line);
			// set name
			proc.name = line.remove(pattern);
			// procedure name (parameters) declaration
			this.searchInlineParametersDeclaration(proc);
			// set begin line number
			proc.beginLine = this.currentLine;
			// add procedure object
			activeClass.methods.push(proc);
			return true;
		}

		// check for parameter declaration
		pattern = /^(?:l)?parameters/gi;
		if (line.contains(pattern)) {
			// get active method object
			var meth = this.getActiveMethod();
			// split params
			var params = line.remove(pattern).split(',');
			for (var i = 0; i < params.length; i++) {
				// add param
				meth.parameters.push(params[i].trim());
			}
			return true;
		}

		pattern = /^return/gi;
		if (line.contains(pattern)) {
			// get active class object
			var activeClass = this.getActiveClass();
			if (activeClass) {
				// get active method object
				var meth = activeClass.getActiveMethod();
				if (meth) {
					// increment return count
					meth.returnCount += 1;
				}
			}
			return true;
		}

		// dimension
		pattern = /^dimension /gi;
		if (line.contains(pattern)) {
			// get active method object
			var meth = this.getActiveMethod();
			if (!meth) {
				var assign = line.remove(pattern).remove(/(?:m\.)?/gi);
				pattern = /\([0-9](?:\,)?(?:\s)?(?:[0-9])?\)/gi;
				if (!line.contains(pattern)) {
					pattern = /\[[0-9](?:\,)?(?:\s)?(?:[0-9])?\]/gi;
				}
				// class property
				var activeClass = this.getActiveClass();
				activeClass.properties.push(assign.remove(pattern));
			}
			return true;
		}

		// check for assignment
		pattern = /^(?:m\.)?(\w+) *(\[.*?)?=/gi;
		if (line.contains(pattern)) {
			// retrieve everything before equal sign
			var variable = line.substr(0, line.indexOf("=")).trim();
			// get active class object
			var activeClass = this.getActiveClass();
			// get active method object
			var meth = activeClass.getActiveMethod();
			// if we are not in a method
			// this is a class property
			if (meth === undefined) {
				activeClass.properties.push(variable);
			}
			return true;
		}

		return false;
	}

	/**
	 * Get active class object
	 *
	 * @method getActiveClass
	 * @return {object} Active class object
	 */
	this.getActiveClass = function () {
		if (!this.Classes.length) {
			this.Classes.push(new Class());
		}
		return this.Classes[this.Classes.length - 1];
	};

	/**
	 * Get active method object
	 *
	 * @method getActiveMethod
	 * @return {object} Active method object
	 */
	this.getActiveMethod = function () {
		var activeClass = this.getActiveClass();
		return activeClass.getActiveMethod();
	};

	/**
	 * Get method visibility
	 *
	 * @method getMethodVisibility
	 * @param {string} line Method declaration
	 * @return {string} Visibility of the method
	 */
	this.getMethodVisibility = function (line) {
		var visibility = '';
		var pattern = /^(protected )/gi;
		if (line.contains(pattern)) {
			visibility = 'protected';
		} else {
			pattern = /^(hidden )/gi;
			if (line.contains(pattern)) {
				visibility = 'private';
			}
		}
		return visibility;
	};

	/**
	 * Search for inline parameters declaration in a method name
	 *
	 * @method searchInlineParametersDeclaration
	 * @param {string} meth Method declaration
	 */
	this.searchInlineParametersDeclaration = function (meth) {
		var pattern = /\(/gi;
		if (meth.name.contains(pattern)) {
			var names = meth.name.split("(");
			meth.name = names[0].trim();
			var parameters = names[1].remove(")").split(",");
			for (var i = 0; i < parameters.length; i++) {
				meth.parameters.push(parameters[i].trim());
			};
		}
	};

	/**
	 * Test if a line is empty
	 *
	 * @method isEmptyLine
	 * @param {string} line Line stream
	 * @return {boolean} Returns true if line is empty
	 */
	this.isEmptyLine = function (line) {
		return line.length === 0;
	}

	/**
	 * Test if the line contains a pattern to ignore
	 *
	 * @method isIgnoredPattern
	 * @param {string} line Line stream
	 * @return {boolean} Returns true if the line contains a pattern to ignore
	 */
	this.isIgnoredPattern = function (line) {

		var pattern;

		// check for empty line
		if (this.isEmptyLine(line)) {
			return true;
		}

		// check for comment line
		pattern = /(^\*)|(^&&)/gi;
		if (line.contains(pattern)) {
			return true;
		}

		// ignored pattern
		pattern = /(^endfor)|(^endtext)|(^endwith)|(^endcase)|(^endif)|(^enddo)|(^endscan)|(^otherwise)|(^do case)|(^else)|(^select)|(^nodefault)|(^dodefault)|(^#include)|(^scan$)/gi;
		if (line.contains(pattern)) {
			return true;
		}

	};

	/**
	 * Remove inline comments and trailing spaces
	 *
	 * @method cleanUpLine
	 * @param {string} line Line stream
	 * @return {string} Line cleaned up
	 */
	this.cleanUpLine = function (line) {
		var pattern = /&&/gi;
		if (line.contains(pattern)) {
			return line.substr(0, line.indexOf('&&')).trim();
		}
		return line.trim();
	};

	/**
	 * Get JSON data about parsed file
	 *
	 * @method  getJSON
	 * @return {object} JSON object
	 */
	this.getJSON = function () {
		return this;
	};

};

/**
 * Class object
 *
 * @class Class
 * @constructor
 */
var Class = function () {
	this.name = '';
	this.parent = '';
	this.beginLine = 0;
	this.endLine = 0;
	this.methods = [];
	this.properties = [];

	this.getActiveMethod = function () {
		return this.methods[this.methods.length - 1];
	}
}

/**
 * Method object
 *
 * @class Meth
 * @constructor
 */
var Meth = function () {
	this.name = '';
	this.beginLine = 0;
	this.endLine = 0;
	this.parameters = [];
	this.returnCount = 0;
	this.visibility = '';
}

/**
 * Procedure object
 *
 * @class Proc
 * @extends Meth
 * @constructor
 */
var Proc = function () {
	return new Meth();
}

/**
 * Function object
 *
 * @class Func
 * @extends Meth
 * @constructor
 */
var Func = function () {
	return new Meth();
}

String.prototype.contains = function (pattern) {
	return pattern.test(this);
}

String.prototype.remove = function (pattern) {
	return this.replace(pattern, '').trim();
}

// expose parser constructor
module.exports = Parser;
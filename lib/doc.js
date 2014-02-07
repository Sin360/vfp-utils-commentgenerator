/**
 * Generates a stream containing file content plus yuidoc comments in front of each class and their methods
 *
 * @module Doc
 * @class Doc
 * @constructor
 * @author s.leroux
 * @param {string} json JSON stream from the parser
 * @param {string} file File content
 */
var Doc = function (json, file) {

	/**
	 * Array of lines from our file
	 *
	 * @property {string} lines
	 */
	this.lines = file.split("\n");

	/**
	 * Line number
	 * @property {integer} lineNumber
	 */
	this.lineNumber = 0;

	/**
	 * Generates yui documentation for classes and methods
	 *
	 * @method run
	 * @return {string} Classes and methods documentation
	 */
	this.run = function () {

		var stream = '';
		var header = '*<\n';
		var desc = '* description\n';
		var footer = '*>\n';
		var validClass = false;
		var indent;

		// loop through classes
		for (var i = 0, classesLen = json.Classes.length, classObj; i < classesLen; i++) {

			// save instance of current class object
			classObj = json.Classes[i];

			validClass = classObj.name ? true : false;

			indent = validClass ? '\t' : '';

			// add file content from the beggining to the class declaration
			stream = stream + this._addFileContent(classObj.beginLine - 1);

			if (validClass) {
				// add class declaration
				stream = stream + header + desc + '*\n* @class ' + classObj.name + '\n* @extends ' + classObj.parent + '\n' + footer;
			}

			// loop through methods
			for (var j = 0, methodsLen = classObj.methods.length, methObj; j < methodsLen; j++) {

				// save instance of current method object
				methObj = classObj.methods[j];

				// add file content from where we left to method declaration
				stream = stream + this._addFileContent(methObj.beginLine - 1);

				// add method name declaration with a one tab indentation
				stream = stream + (validClass ? '\n' : '') + indent + header + indent + desc + indent +  '*\n' + indent + '* @method ' + methObj.name + '\n';

				// add visibility declaration
				if (methObj.visibility) {
					stream = stream + '\t* @' + methObj.visibility + '\n';
				}

				// add param declaration
				for (var k = 0, paramsLen = methObj.parameters.length; k < paramsLen; k++) {
					stream = stream + indent + '* @param {' + this._getVarType(methObj.parameters[k]) + '} ' + methObj.parameters[k] + ' description\n';
				}

				// add return declaration
				if (methObj.returnCount) {
					stream = stream + indent + '* @return {type} description\n';
				}

				// add footer
				stream = stream + indent + footer;

				// add file content from where we left to the end of the method
				stream = stream + this._addFileContent(methObj.endLine + 1);
			}

			// add file content from where we left to the end of the class
			stream = stream + this._addFileContent(classObj.endLine + 1);
		}

		// add file content from where we left to the end of the file
		stream = stream + this._addFileContent(this.lines.length);

		// returns file with comments
		return stream;
	};

	/**
	 * Returns file content from current line to asked line
	 *
	 * @method _addFileContent
	 * @private
	 * @param {integer} endLine Line number
	 */
	this._addFileContent = function (endLine) {
		var stream = '';
		for (this.lineNumber; this.lineNumber < this.lines.length && this.lineNumber < endLine; this.lineNumber++) {
			stream = stream + this.lines[this.lineNumber];
		}
		return stream;
	};

	/**
	 * Returns variable type based on prefix
	 *
	 * @method _getVarType
	 * @private
	 * @param {string} variable Name of the variable
	 * @return {string} Type of the variable
	 */
	this._getVarType = function (variable) {
		var type;
		switch (variable[0]) {
			case 'c': type = 'string'; break;
			case 'd': type = 'date'; break;
			case 'l': type = 'boolean'; break;
			case 'n': type = 'integer'; break;
			case 'o': type = 'object'; break;
			case 's': type = 'string'; break;
			case 't': type = 'datetime'; break;
			default: type = 'type';
		}
		return type;
	};
};

// expose report constructor
module.exports = Doc;
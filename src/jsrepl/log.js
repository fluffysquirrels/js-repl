// Required: ioc.js

var jsrepl = jsrepl || {};

jsrepl.log = function() {
	
	var pub = {};

	var outputMaxChars = 30000

	pub.addOutput = function(strOutput) {
		var newOutput = strOutput + "\n" + getOutput();
		setOutput(newOutput);
	}

	function getOutput() {
		var outDiv = document.getElementById("output");
		return outDiv.innerText;
	}

	function setOutput(strOutput) {
		var outDiv = document.getElementById("output");
		outDiv.innerText = strOutput.substring(0, outputMaxChars);
	}

	var Logger = function(componentName) {
		var _componentName = componentName;
		var _debugLogging = false;
		var _this = this;

		this.info = function(str) {
			writeMessage(" INFO", str);
		};
		
		this.debug = function(str) {
			if(_debugLogging) {
				writeMessage("DEBUG", str);
			}
		};

		this.withDebug = function(enabled) {
			_debugLogging = enabled;
			return _this;
		}
		
		function writeMessage(logLevelStr, msgContentStr) {
			var msg = getMessage(logLevelStr, msgContentStr);
			pub.addOutput(msg);
		}

		function getMessage(logLevelStr, msgContentStr) {
			return componentName + " " +
					logLevelStr + ": " +
					msgContentStr;
		}
	}

	ioc.createLogger = function(componentName) {
		return new Logger(componentName);
	}

	ioc.withErrorHandler = 
		function() {
			var errorHandler =
				new utils.err.ErrorHandler(pub.addOutput);
			return function(fn) {
				return errorHandler.withErrorHandler(fn);
			};
		}();

	return pub;
}();

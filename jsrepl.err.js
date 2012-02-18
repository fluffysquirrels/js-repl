// ** Error handling **

jsrepl = jsrepl || {};

jsrepl.err = function() {

	function ErrorHandler_withErrorHandler(fn) {
		assertParameterType("fn", fn, "function");
		
		try {
			var output = fn();
			return output;
		}
		catch(ex) {
			var errString = "An exception occurred. It has been saved in __err\n" + ex.toString()
			this._errorLogFn(errString);
			__err = ex;
	
			throw "Terminating the call stack."
		}
	}

	function ErrorHandler(errorLogFn) {
		assertParameterType("errorLogFn", errorLogFn, "function");

		this._errorLogFn = errorLogFn;
		this.withErrorHandler = ErrorHandler_withErrorHandler;
	}

	// If expectedType is given, compare it to
	// typeof(paramValue) and throw if different.
	// If expectedType is not given, just throw a nice error.
	function assertParameterType(paramName, paramValue, expectedType) {
		if(typeof(paramValue) !== expectedType) {
			var msg =
				paramName + " = '" + paramValue +
					"' is of unexpected type '" +
					typeof(paramValue) + "'.";
			if(expectedType === 'undefined') {
				msg += " Was expecting type '" + expectedType +
						"'";
			}
	
			throw msg;
		}
	}


	var pub = {
		assertParameterType:	assertParameterType,
		ErrorHandler:		 	ErrorHandler
	};

	return pub;
}();

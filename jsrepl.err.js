// ** Error handling **
jsrepl = jsrepl || {};

jsrepl.err = function() {

	function ErrorHandler(errorLogFn) {
		utils.assertType("errorLogFn", errorLogFn, "function");

		var _errorLogFn = errorLogFn;

		this.withErrorHandler =	function(fn) {
			utils.assertType("fn", fn, "function");
			
			try {
				var output = fn();
				return output;
			}
			catch(ex) {
				var errString = "An exception occurred. It has been saved in __err\n" + ex.toString()
				_errorLogFn(errString);
				__err = ex;
		
				throw "Terminating the call stack."
			}
		}
	}

	var pub = {
		ErrorHandler:		 	ErrorHandler
	};

	return pub;
}();

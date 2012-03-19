var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {};

jsrepl.lisp.LispException =
	function LispException(thread, innerException) {
		utils.assertType("thread", thread, "LispThread");

		this.thread = thread;
		this.innerException = innerException;
		this.stack = new Error().stack;
	};


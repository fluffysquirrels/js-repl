var jslisp = jslisp || {};

jslisp.LispException =
	function LispException(thread, innerException) {
		utils.assertType("thread", thread, "LispThread");

		this.thread = thread;
		this.innerException = innerException;
		this.stack = new Error().stack;
	};


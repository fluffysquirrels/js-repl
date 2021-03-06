var jslisp = jslisp || {};

jslisp.LispThread =
	function LispThread() {
		var _logger = ioc.createLogger("lisp.LispThread");

		var _stackFrames = [];
		var _this = this;

		this.getFrames = function() {
			return utils.cloneArray(_stackFrames);
		}

		this.pushFrame = function(stackFrame) {
			utils.assertType("stackFrame", stackFrame, "LispStackFrame");
			_stackFrames.push(stackFrame);
		}

		this.popFrame = function() {
			_stackFrames.pop();
		}

		this.toString = function() {
			var frames = _this.getFrames();

			var frameStrings =
				utils.map(frames, function(frame, ix) {
					return ix + ": evaluating " + frame.getExpr().toString();
				});

			return utils.join("\r\n", frameStrings);
		}
	};

jslisp.LispStackFrame =
	function LispStackFrame(scope, expr) {
		this.getScope = function() {
			return scope;
		};

		this.getExpr = function() {
			return expr;
		};

		this.toString = function() {
			return "Frame:  " + expr.toString();
		};
	};

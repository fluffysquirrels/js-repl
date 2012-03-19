
var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {};

jsrepl.lisp.LispThread =
	function LispThread(evaluator) {
		utils.assertType("evaluator", evaluator, "LispEvaluator");

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
			frames.reverse();

			var frameStrings =
				utils.map(frames, function(frame, ix) {
					return ix + ": evaluating " + frame.getExpr().toString();
				});

			return utils.join("\r\n", frameStrings);
		}
	};

jsrepl.lisp.LispStackFrame =
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

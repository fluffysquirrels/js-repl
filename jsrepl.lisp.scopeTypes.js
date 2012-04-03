var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {};

jsrepl.lisp.LispScope =
	function LispScope(evaluator) {
		utils.assertType("evaluator", evaluator, "LispEvaluator");

		var _evaluator = evaluator;
		var _frames = [];

		this.getEvaluator = function() {
			return _evaluator;
		}

		this.pushFrame = function(frame) {
			utils.assertType("frame", frame, "LispScopeFrame");

			_frames.push(frame);
		};

		this.copy = function() {
			var ret = new LispScope(_evaluator);

			utils.each(_frames, function(frame) {
				ret.pushFrame(frame);
			});

			return ret;
		};

		this.set = function(varName, varValue) {
			assertHasFrames();
			var topFrame = _frames[_frames.length - 1];
			topFrame.vars[varName] = varValue;
		};

		this.setGlobal = function(varName, varValue) {
			assertHasFrames();
			var bottomFrame = _frames[0];
			bottomFrame.vars[varName] = varValue;
		};

		function assertHasFrames() {
			if(_frames.length === 0) {
				throw "Cannot set variable in a scope with no frames.";
			}
		}

		this.lookUp = function(varName) {
			var ret;

			// Take the value from each frame, hence
			// finishing with the value from the top frame
			// that contains the variable.
			utils.each(_frames, function(frame) {
				var frameVar = frame.vars[varName];
				if(frameVar !== undefined) {
					ret = frameVar;
				}
			});

			if(ret === undefined) {
				throw "Couldn't find variable '" + varName + "'.";
			}

			return ret;
		};
	}

jsrepl.lisp.LispScopeFrame =
	function LispScopeFrame() {
		this.vars = {};
	}

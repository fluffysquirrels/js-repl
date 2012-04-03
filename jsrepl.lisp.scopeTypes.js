var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {};

jsrepl.lisp.LispScope =
	function LispScope(evaluator) {
		utils.assertType("evaluator", evaluator, "LispEvaluator");

		this._evaluator = evaluator;
		this._frames = [];
	};

jsrepl.lisp.LispScope.prototype.getEvaluator =
	function() {
		return this._evaluator;
	}
jsrepl.lisp.LispScope.prototype.pushFrame =
	function(frame) {
		utils.assertType("frame", frame, "LispScopeFrame");

		this._frames.push(frame);
	};
jsrepl.lisp.LispScope.prototype.popFrame =
	function() {
		this._frames.pop();
	};
jsrepl.lisp.LispScope.prototype.copy =
	function() {
		var ret = new jsrepl.lisp.LispScope(this._evaluator);

		ret._frames = this._frames.slice(0);

		return ret;
	};
jsrepl.lisp.LispScope.prototype.set =
	function(varName, varValue) {
		this.__assertHasFrames();
		var topFrame = this._frames[this._frames.length - 1];
		topFrame.vars[varName] = varValue;
	};
jsrepl.lisp.LispScope.prototype.setGlobal =
	function(varName, varValue) {
		this.__assertHasFrames();
		var bottomFrame = this._frames[0];
		bottomFrame.vars[varName] = varValue;
	};
jsrepl.lisp.LispScope.prototype.__assertHasFrames =
	function() {
		if(this._frames.length === 0) {
			throw "Cannot set variable in a scope with no frames.";
		}
	}

jsrepl.lisp.LispScope.prototype.lookUp =
	function(varName) {
		var ret;

		// Take the value from each frame, hence
		// finishing with the value from the top frame
		// that contains the variable.
		utils.each(this._frames, function(frame) {
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

jsrepl.lisp.LispScopeFrame =
	function LispScopeFrame() {
		this.vars = {};
	}

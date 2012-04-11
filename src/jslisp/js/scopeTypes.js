var jslisp = jslisp || {};

jslisp.LispScope =
	function LispScope(evaluator) {
		utils.assertType("evaluator", evaluator, "LispEvaluator");

		this._evaluator = evaluator;
		this._frames = [];
	};

jslisp.LispScope.prototype.getEvaluator =
	function() {
		return this._evaluator;
	}
jslisp.LispScope.prototype.pushFrame =
	function(frame) {
		utils.assertType("frame", frame, "LispScopeFrame");

		this._frames.push(frame);
	};
jslisp.LispScope.prototype.popFrame =
	function() {
		this._frames.pop();
	};
jslisp.LispScope.prototype.copy =
	function() {
		var ret = new jslisp.LispScope(this._evaluator);

		ret._frames = this._frames.slice(0);

		return ret;
	};
jslisp.LispScope.prototype.set =
	function(varName, varValue) {
		this.__assertHasFrames();
		var topFrame = this._frames[this._frames.length - 1];
		topFrame.vars[varName] = varValue;
	};
jslisp.LispScope.prototype.setGlobal =
	function(varName, varValue) {
		this.__assertHasFrames();
		var bottomFrame = this._frames[0];
		bottomFrame.vars[varName] = varValue;
	};
jslisp.LispScope.prototype.__assertHasFrames =
	function() {
		if(this._frames.length === 0) {
			throw "Cannot set variable in a scope with no frames.";
		}
	}

jslisp.LispScope.prototype.lookUp =
	function(varName) {
		for(var ix = this._frames.length-1;
			ix >= 0;
			ix--) {
			
			var frame = this._frames[ix];

			var frameVar = frame.vars[varName];
			if(frameVar !== undefined) {
				return frameVar;
			}
		}

		throw "Couldn't find variable '" + varName + "'.";
	};

jslisp.LispScopeFrame =
	function LispScopeFrame() {
		this.vars = {};
	}

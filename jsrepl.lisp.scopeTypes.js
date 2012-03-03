var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {};

jsrepl.lisp.LispScope =
	function LispScope() {
		var frames = [];

		this.pushFrame = function(frame) {
			utils.assertType("frame", frame, "LispScopeFrame");

			frames.push(frame);
		};

		this.copy = function() {
			var ret = new LispScope();

			utils.each(frames, function(frame) {
				ret.pushFrame(frame);
			});

			return ret;
		};

		this.set = function(varName, varValue) {
			assertHasFrames();
			var topFrame = frames[frames.length - 1];
			topFrame.vars[varName] = varValue;
		};

		this.setGlobal = function(varName, varValue) {
			assertHasFrames();
			var bottomFrame = frames[0];
			bottomFrame.vars[varName] = varValue;
		};

		function assertHasFrames() {
			if(frames.length === 0) {
				throw "Cannot set variable in a scope with no frames.";
			}
		}

		this.lookUp = function(varName) {
			var ret;

			// Take the value from each frame, hence
			// finishing with the value from the top frame
			// that contains the variable.
			utils.each(frames, function(frame) {
				var frameVar = frame.vars[varName];
				if(frameVar !== undefined) {
					ret = frameVar;
				}
			});

			if(ret === undefined) {
				throw {
					message: "Couldn't find variable '" + varName + "'.",
					frames: frames
				};
			}

			return ret;
		};
	}

jsrepl.lisp.LispScopeFrame =
	function LispScopeFrame() {
		this.vars = {};
	}

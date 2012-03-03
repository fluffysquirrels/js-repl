var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {};

jsrepl.lisp.LispSymbol =
	function LispSymbol(name) {
		this.name = name;
		this.toString = function() {
			return name;
		};
	}

jsrepl.lisp.LispExpression =
	function LispExpression(list) {
		this.list = list || [];
		this.toString = function() {
			return "(" +
				utils.join(" ", this.list) +
				")";
		}
	}

jsrepl.lisp.LispFunction =
	function LispFunction(func) {
		utils.assertType("func", func, "function");
		var _func = func;
		this.apply = function(scope, args) {
			return _func(scope, args);
		}
	}

jsrepl.lisp.LispMacro =
	function LispMacro(func) {
		utils.assertType("func", func, "function");
		var _func = func;
		this.apply = function(scope, args) {
			return _func(scope, args);
		}
	}

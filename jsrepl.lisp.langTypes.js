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

		this.evalWithArgDefns = function(scope, argDefns) {
			var evaluator = scope.getEvaluator();
			var funcArgs =
				utils.map(
					argDefns,
					function(exprDefn) {
						return evaluator.evalOneExpr(
										scope,
										exprDefn);
					});

			var result = _func(scope, funcArgs);

			return result;
		}
	}

jsrepl.lisp.LispKeyword =
	function LispKeyword(func) {
		utils.assertType("func", func, "function");
		var _func = func;

		this.evalWithArgDefns = function(scope, argDefns) {
			return _func(	scope,
							argDefns);
		}
	}

jsrepl.lisp.LispMacro =
	function LispMacro(func) {
		utils.assertType("func", func, "function");
		var _func = func;

		this.evalWithArgDefns = function(scope, argDefns) {
			var codeToEval = _func(	scope,
									argDefns);
			var exprsToEval = [codeToEval];

			return scope.getEvaluator().eval(
										scope,
										exprsToEval);
		}
	}

var jslisp = jslisp || {};
jslisp.lang = jslisp.lang || {};

jslisp.lang.LispSymbol =
	function LispSymbol(name) {
		this.name = name;
	}
jslisp.lang.LispSymbol.prototype.toString =
	function() {
		return this.name;
	};

jslisp.lang.LispExpression =
	function LispExpression(list) {
		this.list = list || [];
	}
jslisp.lang.LispExpression.prototype.toString =
	function toString() {
		return "(" +
			utils.join(" ", this.list) +
			")";
	}

jslisp.lang.LispFunction =
	function LispFunction(func) {
		utils.assertType("func", func, "function");
		var _func = func;

		this.evalWithArgDefns = function(scope, argDefns) {
			var evaluator = scope.getEvaluator();
			var funcArgs =
				argDefns.map(
					function(exprDefn) {
						return evaluator.evalOneExpr(
										scope,
										exprDefn);
					});

			var result = _func(scope, funcArgs);

			return result;
		}
	}

jslisp.lang.LispKeyword =
	function LispKeyword(func) {
		utils.assertType("func", func, "function");
		var _func = func;

		this.evalWithArgDefns = function(scope, argDefns) {
			return _func(	scope,
							argDefns);
		}
	}

jslisp.lang.LispMacro =
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

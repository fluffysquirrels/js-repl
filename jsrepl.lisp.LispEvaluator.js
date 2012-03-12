// Required : "utils.js"
// Required : "ioc.js"
// Required : "jsrepl.pp.js"
// Required : "jsrepl.lisp.langTypes.js"
// Required : "jsrepl.lisp.scopeTypes.js"
// Required : "jsrepl.lisp.parser.js"
// Required : "jsrepl.lisp.lib.js"

var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {}

jsrepl.lisp.logger = ioc.createLogger("lisp").withDebug(true);
jsrepl.lisp.initScripts = [];

jsrepl.lisp.LispEvaluator =
function LispEvaluator() {
	// << Vars
	
	var _globalScopeFrame = new jsrepl.lisp.LispScopeFrame(); 
	_globalScopeFrame.vars = jsrepl.lisp.getLib();
	var _this = this;
	var _logger =
		ioc.createLogger(
			"lisp.LispEvaluator").withDebug(false);
	this.logger = _logger;

	this.readEval = function(cmdString) {
		var exprs = jsrepl.lisp.parser.read(cmdString);
		return this.eval(exprs);
	}

	this.eval = function(exprs, scope) {
		if(exprs.length === 0) {
			throw "Empty expression.";
		}

		if(scope === undefined) {
			scope = createNewScope();
		}

		var result = undefined;
		// eval all expressions, keeping last result
		for(var ixExpr = 0; ixExpr < exprs.length; ixExpr++) {
			var currExpr = exprs[ixExpr];
			var currResult = _this.evalOneExpr(scope, currExpr);
			result = currResult;
		}

		return result;
	}
	
	this.evalOneExpr = function(scope, expr) {
		var exprType = utils.getTypeOf(expr);
		
		// _logger.debug("evalOneExpr called on '" + expr + "', of type " + exprType);

		if(exprType === "LispSymbol")
		{
			var symbolValue = scope.lookUp(expr.name);
			if(symbolValue === undefined) {
				throw "There is no variable to take the value of with name '" + expr.name + "'.";
			}

			return symbolValue;
		}
		else if(exprType === "number" ||
				exprType === "boolean") {
			return expr;
		}
		else if(exprType === "LispExpression") {
			var exprArray = expr.list;

			if(exprArray.length === 0) {
				throw "Cannot evaluate empty expression";
			}

			var firstValue =
				_this.evalOneExpr(scope, exprArray[0]);

			if(utils.getTypeOf(firstValue) === "LispKeyword") {
				return firstValue.apply(
							scope,
							exprArray.slice(1));
			}

			var exprValues =
				utils.map(
					exprArray,
					function(exprDefn) {
						return _this.evalOneExpr(
										scope,
										exprDefn);
					});

			var funcDefn = exprArray[0];
			var func = exprValues[0];
			var funcArgs = exprValues.slice(1);

			utils.assertType("func", func, "LispFunction");

			_logger.debug("Running " + funcDefn + " with args:\n" + jsrepl.pp.prettyPrint(funcArgs));

			var result = func.apply(scope, funcArgs);

			return result;
		}
		else {
			throw "Cannot eval object '" + expr + "' of unknown type " + utils.getTypeOf(expr);
		}
	}
	
	function createNewScope() {
		var scope = new jsrepl.lisp.LispScope(_this);
		scope.pushFrame(_globalScopeFrame);
		scope.pushFrame(new jsrepl.lisp.LispScopeFrame());
		return scope;
	}

	this.runScripts = function(scripts) {
		utils.each(
			scripts,
			function(script) {
				_this.readEval(script);
			});
	}
}

// Required : "utils.js"
// Required : "ioc.js"
// Required : "jsrepl.pp.js"
// Required : "jsrepl.lisp.langTypes.js"
// Required : "jsrepl.lisp.scopeTypes.js"
// Required : "jsrepl.lisp.parser.js"

var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {}

jsrepl.lisp.logger = ioc.createLogger("lisp").withDebug(true);

jsrepl.lisp.LispEvaluator =
function LispEvaluator() {
	// << Vars
	
	var _globalScopeFrame = new jsrepl.lisp.LispScopeFrame(); 
	var _this = this;
	var _logger = jsrepl.lisp.logger;

	// * Set initial global vars *
	_globalScopeFrame.vars = {
		"hello": 	"world!",
		"true":		true,
		"false":	false,

		"+": 		new jsrepl.lisp.LispFunction(Lib_plus),
		"-": 		new jsrepl.lisp.LispFunction(Lib_minus),
		"*": 		new jsrepl.lisp.LispFunction(Lib_multiply),
		"/": 		new jsrepl.lisp.LispFunction(Lib_divide),

		"=":		new jsrepl.lisp.LispFunction(Lib_eq),
		"<=":		new jsrepl.lisp.LispFunction(Lib_le),
		">=":		new jsrepl.lisp.LispFunction(Lib_ge),
		"<":		new jsrepl.lisp.LispFunction(Lib_lt),
		">":		new jsrepl.lisp.LispFunction(Lib_gt),

		// "idx":		new jsrepl.lisp.LispFunction(Lib_arrayIndex),
		// "list":		new jsrepl.lisp.LispFunction(Lib_newArray),
		// "car":		new jsrepl.lisp.LispFunction(Lib_arrayCar),
		// "cdr":		new jsrepl.lisp.LispFunction(Lib_arrayCdr),
		// "cons"

		"setg":		new jsrepl.lisp.LispMacro(Lib_setGlobal),
		"setl":		new jsrepl.lisp.LispMacro(Lib_setLocal),
		"quot":		new jsrepl.lisp.LispMacro(Lib_quot),
		"func":		new jsrepl.lisp.LispMacro(Lib_function),
		"if":		new jsrepl.lisp.LispMacro(Lib_if)
	};

	// Vars >>

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
			var currResult = evalOneExpr(scope, currExpr);
			result = currResult;
		}

		return result;
	}
	
	function evalOneExpr(scope, expr) {
		var exprType = utils.getTypeOf(expr);
		
		_logger.debug("evalOneExpr called on '" + expr + "', of type " + exprType);

		if(exprType === "LispSymbol")
		{
			var symbolValue = scope.lookUp(expr.name);
			if(symbolValue === undefined) {
				throw "There is no variable to take the value of with name '" + expr.name + "'.";
			}

			return symbolValue;
		}
		else if(exprType === "number") {
			return expr;
		}
		else if(exprType === "LispExpression") {
			var exprArray = expr.list;

			if(exprArray.length === 0) {
				throw "Cannot evaluate empty expression";
			}

			var firstEltType = utils.getTypeOf(exprArray[0]);
			
			var firstValue =
				evalOneExpr(scope, exprArray[0]);

			if(utils.getTypeOf(firstValue) === "LispMacro") {
				return firstValue.apply(
							scope,
							exprArray.slice(1));
			}

			var exprValues =
				utils.map(
					exprArray,
					function(exprDefn) {
						return evalOneExpr(scope, exprDefn);
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
		var scope = new jsrepl.lisp.LispScope();
		scope.pushFrame(_globalScopeFrame);
		scope.pushFrame(new jsrepl.lisp.LispScopeFrame());
		return scope;
	}

	
	
	// ** Library functions **

	function Lib_function(defnScope, args) {
		if(args.length < 2) {
			throw "Function definitions must have at least 2 arguments";
		}

		var argNames = args[0];
		var funcBody = args.slice(1);

		utils.assertType("argNames", argNames, "LispExpression");

		var numArgsRequired = argNames.list.length;

		var func = function(invocationScope, args) {
			utils.assertNumArgs(args, numArgsRequired);

			var execScope = defnScope.copy();

			// Push function evaluation scope frame.
			execScope.pushFrame(new jsrepl.lisp.LispScopeFrame());
			
			utils.each(argNames.list, function(argName, ix) {
				utils.assertType("argName", argName, "LispSymbol");

				var argValue = args[ix];

				execScope.set(argName.name, argValue);
			});
			
			return _this.eval(funcBody, execScope);
		};

		return new jsrepl.lisp.LispFunction(func);
	}

	function Lib_plus(scope, args) {
		var ret = 0;

		utils.each(args, function(elt) {
			utils.assertType("argument for +", elt, "number");
			ret += elt;
		});

		return ret;
	}

	function Lib_minus(scope, args) {
		assertTwoNumberArgs(args);
		
		return args[0] - args[1];
	}

	function Lib_multiply(scope, args) {
		var ret = 1;

		utils.each(args, function(elt) {
			utils.assertType("argument for *", elt, "number");
			ret *= elt;
		});

		return ret;
	}

	function Lib_divide(scope, args) {
		assertTwoNumberArgs(args);

		// NB: Let JavaScript runtime throw on divide by zero.
		return args[0] / args[1];
	}

	function Lib_eq(scope, args) {
		assertTwoNumberArgs(args);
		return args[0] === args[1];
	}

	function Lib_gt(scope, args) {
		assertTwoNumberArgs(args);
		return args[0] > args[1];
	}

	function Lib_lt(scope, args) {
		assertTwoNumberArgs(args);
		return args[0] < args[1];
	}

	function Lib_ge(scope, args) {
		assertTwoNumberArgs(args);
		return args[0] >= args[1];
	}

	function Lib_le(scope, args) {
		assertTwoNumberArgs(args);
		return args[0] <= args[1];
	}

	function assertTwoNumberArgs(args) {
		utils.assertNumArgs(args, 2);

		var first 	= args[0];
		var second 	= args[1];

		utils.assertType("first argument", first, "number");
		utils.assertType("second argument", second, "number");
	}

	function Lib_setGlobal(scope, args) {
		return Lib_setInternal(
				scope,
				args,
				scope.setGlobal);
	}

	function Lib_setLocal(scope, args) {
		return Lib_setInternal(
				scope,
				args,
				scope.set);
	}


	function Lib_setInternal(
				scope,
				args,
				setFn) {
		utils.assertNumArgs(args, 2);

		var varName 		= args[0];
		var varValueDefn	= args[1];
		
		utils.assertType("varName", varName, "LispSymbol");

		var varValue = evalOneExpr(scope, varValueDefn);

		setFn(varName.name, varValue);
		return varValue;
	}

	function Lib_quot(scope, args) {
		var ret = new jsrepl.lisp.LispExpression(args);
		return ret;
	}

	function Lib_if(scope, args) {
		var numArgs = args.length;

		if(numArgs !== 2 && numArgs !== 3) {
			throw "Invalid number of arguments for 'if'. Expected 2 or 3 but got " + numArgs + ".";
		}

		var condExpr = args[0];
		var thenExpr = args[1];
		var elseExpr = args[2];

		var condValue = evalOneExpr(scope, condExpr);

		utils.assertType("condValue", condValue, "boolean");

		if(condValue) {
			return evalOneExpr(scope, thenExpr);
		}
		else {
			if (elseExpr !== undefined) {
				return evalOneExpr(scope, elseExpr);
			}
		}
	}
}

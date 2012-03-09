var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {};

jsrepl.lisp.getLib = function() {

	var lib = {
		"hello": 	"world!",

		"true":		true,
		"false":	false,

		"null":		null,
		"undefined":undefined,

		"+": 		new jsrepl.lisp.LispFunction(Lib_plus),
		"-": 		new jsrepl.lisp.LispFunction(Lib_minus),
		"*": 		new jsrepl.lisp.LispFunction(Lib_multiply),
		"/": 		new jsrepl.lisp.LispFunction(Lib_divide),

		"=":		new jsrepl.lisp.LispFunction(Lib_eq),
		"<=":		new jsrepl.lisp.LispFunction(Lib_le),
		">=":		new jsrepl.lisp.LispFunction(Lib_ge),
		"<":		new jsrepl.lisp.LispFunction(Lib_lt),
		">":		new jsrepl.lisp.LispFunction(Lib_gt),

		"js=":		new jsrepl.lisp.LispFunction(Lib_jseq),

		"car":		new jsrepl.lisp.LispFunction(Lib_arrayCar),
		"cdr":		new jsrepl.lisp.LispFunction(Lib_arrayCdr),
		"cons":		new jsrepl.lisp.LispFunction(Lib_arrayCons),

		"setg":		new jsrepl.lisp.LispKeyword(Lib_setGlobal),
		"setl":		new jsrepl.lisp.LispKeyword(Lib_setLocal),
		"quot":		new jsrepl.lisp.LispKeyword(Lib_quot),
		"eval":		new jsrepl.lisp.LispFunction(Lib_eval),
		"func":		new jsrepl.lisp.LispKeyword(Lib_function),
		"if":		new jsrepl.lisp.LispKeyword(Lib_if)
	};

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
			
			return defnScope.getEvaluator().eval(funcBody, execScope);
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
	
	function Lib_jseq(scope, args) {
		utils.assertNumArgs(args, 2);

		return args[0] === args [1];
	}

	function Lib_arrayCar(scope, args) {
		utils.assertNumArgs(args, 1);

		var expr = args[0];

		utils.assertType("expr", expr, "LispExpression");

		var arr = expr.list;

		if(arr.length === 0) {
			return null;
		}

		return arr[0];
	}

	function Lib_arrayCdr(scope, args) {
		utils.assertNumArgs(args, 1);

		var expr = args[0];

		utils.assertType("expr", expr, "LispExpression");

		var arr = expr.list;

		if(arr.length <= 1) {
			return null;
		}

		return new jsrepl.lisp.LispExpression(arr.slice(1));
	}
	
	function Lib_arrayCons(scope, args) {
		if(args.length === 1) {
			return new jsrepl.lisp.LispExpression([args[0]]);
		}
		else if(args.length === 2) {
			var head = args[0];
			var tail = args[1];

			var tailType = utils.getTypeOf(tail);

			if(tailType !== "LispExpression") {
				throw new Error("Using cons with a tail that is not a LispExpression is not currently supported. cons received a tail of type " + tailType + ".");
			}

			var retArray = [head];

			utils.each(
				tail.list,
				function(tailElt) {
					retArray.push(tailElt);
				});

			var retExpr =
				new jsrepl.lisp.LispExpression(retArray);

			return retExpr;
		}
		else {
			utils.assertNumArgs(args, "1 or 2");
		}
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

		var varValue =
			scope.getEvaluator().evalOneExpr(
									scope,
									varValueDefn);

		setFn(varName.name, varValue);
		return varValue;
	}

	function Lib_quot(scope, args) {
		utils.assertNumArgs(args, 1);
		return args[0];
	}

	function Lib_eval(scope, args) {
		var res = scope.getEvaluator().eval(args, scope);
		return res;
	}

	function Lib_if(scope, args) {
		var numArgs = args.length;

		if(numArgs !== 2 && numArgs !== 3) {
			throw "Invalid number of arguments for 'if'. Expected 2 or 3 but got " + numArgs + ".";
		}

		var condExpr = args[0];
		var thenExpr = args[1];
		var elseExpr = args[2];

		var condValue =
			scope.getEvaluator().evalOneExpr(scope, condExpr);

		utils.assertType("condValue", condValue, "boolean");

		if(condValue) {
			return scope.getEvaluator().evalOneExpr(
											scope,
											thenExpr);
		}
		else {
			if (elseExpr !== undefined) {
				return scope.getEvaluator().evalOneExpr(
												scope,
												elseExpr);
			}
		}
	}

	return lib;
};

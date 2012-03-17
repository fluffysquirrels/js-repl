var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {};

jsrepl.lisp.getLib = function() {
	var lib;

	function createLib(){ return {
		"hello": 	"world!",

		"true":		true,
		"false":	false,

		"null":		null,
		"undefined":undefined,

		"+": 		new jsrepl.lisp.LispFunction(Lib_plus),
		"-": 		new jsrepl.lisp.LispFunction(Lib_minus),
		"*": 		new jsrepl.lisp.LispFunction(Lib_multiply),
		"/": 		new jsrepl.lisp.LispFunction(Lib_divide),

		"=":		new jsrepl.lisp.LispFunction(Lib_num_eq),
		"<=":		new jsrepl.lisp.LispFunction(Lib_num_le),
		">=":		new jsrepl.lisp.LispFunction(Lib_num_ge),
		"<":		new jsrepl.lisp.LispFunction(Lib_num_lt),
		">":		new jsrepl.lisp.LispFunction(Lib_num_gt),

		"js=":		new jsrepl.lisp.LispFunction(Lib_js_eq),
		"jstypeof":	new jsrepl.lisp.LispFunction(Lib_js_typeof),

		"sym=":		new jsrepl.lisp.LispFunction(Lib_sym_eq),

		"cons?":	new jsrepl.lisp.LispFunction(Lib_is_cons),
		"num?":		new jsrepl.lisp.LispFunction(Lib_is_num),
		"sym?":		new jsrepl.lisp.LispFunction(Lib_is_sym),
		"func?":	new jsrepl.lisp.LispFunction(Lib_is_func),
		"bool?":	new jsrepl.lisp.LispFunction(Lib_is_bool),
		"null?":	new jsrepl.lisp.LispFunction(Lib_is_null),

		"car":		new jsrepl.lisp.LispFunction(Lib_arrayCar),
		"cdr":		new jsrepl.lisp.LispFunction(Lib_arrayCdr),
		"cons":		new jsrepl.lisp.LispFunction(Lib_arrayCons),

		"setg":		new jsrepl.lisp.LispKeyword(Lib_setGlobal),
		"setl":		new jsrepl.lisp.LispKeyword(Lib_setLocal),
		"quot":		new jsrepl.lisp.LispKeyword(Lib_quot),
		"eval":		new jsrepl.lisp.LispFunction(Lib_eval),
		"func":		new jsrepl.lisp.LispKeyword(Lib_function),
		"macro":	new jsrepl.lisp.LispKeyword(Lib_macro),
		"if":		new jsrepl.lisp.LispKeyword(Lib_if)
	};};

	function Lib_function(defnScope, args) {
		var func = createFunctionBody(defnScope, args);

		return new jsrepl.lisp.LispFunction(func);
	}

	function Lib_macro(defnScope, args) {
		var func = createFunctionBody(defnScope, args);

		return new jsrepl.lisp.LispMacro(func);
	}

	function createFunctionBody(defnScope, args) {
		if(args.length < 2) {
			throw new Error("Function definitions must have at least 2 arguments");
		}

		var argDefns = args[0];
		var funcBody = args.slice(1);

		utils.assertType("argDefns", argDefns, "LispExpression");

		var argsSpec = parseArgDefns(argDefns.list);

		var func = function(invocationScope, args) {
			var execScope = defnScope.copy();

			// Push function evaluation scope frame.
			execScope.pushFrame(new jsrepl.lisp.LispScopeFrame());
			argsSpec.bindArgs(execScope, args);
			
			return execScope.getEvaluator().eval(funcBody, execScope);
		};

		return func;
	}

	var isValidArgRegex = /^\*?([a-z0-9_]+)$/;
	var isVarArgRegex =    /^\*([a-z0-9_]+)$/;

	function parseArgDefns(argDefnsArray) {
		var argsSpec = {};

		var positionalArgs = [];
		var varArgsSymbol = null;

		utils.each(argDefnsArray,
			function(argDefn, ix) {
				var argName = argDefn.name;
				
				if(!isVarArgDefn(argName)) {
					positionalArgs.push(argDefn);
				}
				else {
					// isVarArgDefn
					if(ix !== argDefnsArray.length - 1) {
						throw new Error("Varags symbols must come at the end of a function's arguments list. '" + argName + "' came at index " + ix + " of an arguments list of length " + argDefnsArray.length + ".");
					}

					varArgsSymbol = argDefn;
				}
			});

		function isVarArgDefn(argName) {
			var match = isValidArgRegex.exec(argName);

			if(match === null) {
				throw new Error("Not a valid argument name: '" + argName + "'.");
			}

			return isVarArgRegex.test(argName);
		}

		argsSpec.bindArgs = function(execScope, args) {
			var extraArgs = args.length > positionalArgs.length;
			
			if(extraArgs &&
				varArgsSymbol === null) {
				
				throw new Error("Too many arguments passed to non-variadic function. Expected " + positionalArgs.length + " positional arguments but got " + args.length + " arguments.");
			}

			utils.each(positionalArgs, function(argName, ix) {
				utils.assertType("argName", argName, "LispSymbol");

				var argValue = args[ix];

				if(argValue === undefined) {
					throw new Error("Not enough arguments. Expected " + positionalArgs.length + " positional arguments but only got " + args.length + " arguments.");
				}

				execScope.set(argName.name, argValue);
			}); // bind each positional argument.

			if(varArgsSymbol !== null) {
				var varArgsArray =
					args.slice(positionalArgs.length);
				var varArgsValue =
					new jsrepl.lisp.LispExpression(varArgsArray);
				execScope.set(
					varArgsSymbol.name,
					varArgsValue);
			}
		};

		return argsSpec;
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

	function Lib_num_eq(scope, args) {
		assertTwoNumberArgs(args);
		return args[0] === args[1];
	}

	function Lib_num_gt(scope, args) {
		assertTwoNumberArgs(args);
		return args[0] > args[1];
	}

	function Lib_num_lt(scope, args) {
		assertTwoNumberArgs(args);
		return args[0] < args[1];
	}

	function Lib_num_ge(scope, args) {
		assertTwoNumberArgs(args);
		return args[0] >= args[1];
	}

	function Lib_num_le(scope, args) {
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
	
	function Lib_js_eq(scope, args) {
		utils.assertNumArgs(args, 2);

		return args[0] === args [1];
	}

	function Lib_js_typeof(scope, args) {
		utils.assertNumArgs(args, 1);

		var typeString = utils.getTypeOf(args[0]);
		var typeSym = new jsrepl.lisp.LispSymbol(typeString);

		return typeSym;
	}

	function Lib_sym_eq(scope, args) {
		utils.assertNumArgs(args, 2);

		utils.assertType("first", args[0], "LispSymbol");
		utils.assertType("second", args[1], "LispSymbol");

		return  args[0].name ===
				args[1].name;
	}

	var Lib_is_cons = create_is_T("LispExpression");
	var Lib_is_num  = create_is_T("number");
	var Lib_is_sym  = create_is_T("LispSymbol");
	var Lib_is_func = create_is_T("LispFunction");
	var Lib_is_bool = create_is_T("boolean");
	var Lib_is_null = create_is_T("null");

	function create_is_T(T) {
		function is_T(scope, args) {
			utils.assertNumArgs(args, 1);

			var arg = args[0];
			var typeString = utils.getTypeOf(arg);
			var isType = typeString === T;

			return isType;
		};

		return is_T;
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
	
	lib = createLib();
	return lib;
};

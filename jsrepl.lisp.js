// Required : "utils.js"
// Required : "jsrepl.pp.js"

var jsrepl = jsrepl || {};

jsrepl.lisp = function() {

	function LispEvaluator(logFn) {
		this.bindMethod = bindMethod;
		
		var priv = {};	
		
		priv["_globalScopeFrame"] = new LispScopeFrame(); 
		priv["_this"] = this; 
		priv["_debugLogging"] = true; 
		priv["logFn"] = logFn; 
		priv["debugLog"] = this.bindMethod(priv, LispEvaluator_debugLog);
		priv["tokenise"] = this.bindMethod(priv, LispEvaluator_tokenise);
		priv["createNewScope"] = this.bindMethod(priv, LispEvaluator_createNewScope);
		priv.evalOneExpr = this.bindMethod(priv, LispEvaluator_evalOneExpr);

		priv.createLispFunctionFromExpression = this.bindMethod(priv, LispEvaluator_createLispFunctionFromExpression);

		// * Set initial global vars *
		priv._globalScopeFrame.vars["hello"] = "world!";
		priv._globalScopeFrame.vars["+"] = new LispFunction(Lib_plus);
		priv._globalScopeFrame.vars["*"] = new LispFunction(Lib_multiply);

		this.readEval =
			this.bindMethod(priv, LispEvaluator_readEval);
		this.eval =
			this.bindMethod(priv, LispEvaluator_eval);
		this.read =
			this.bindMethod(priv, LispEvaluator_read);

		delete this.bindMethod;
	}

	function bindMethod(priv, method) {
		return function() {
			var newArgs =
				[priv];
				
			for(var ixArg = 0; ixArg < arguments.length; ixArg++) {
				var arg = arguments[ixArg];
				newArgs.push(arg);
			}
			return method.apply(this,newArgs);
		};
	}

	function LispEvaluator_debugLog(priv, msgString) {
		if(priv._debugLogging !== true) {
			return;
		}

		priv.logFn(msgString);
	}

	function LispEvaluator_readEval(priv, cmdString) {
		var exprs = this.read(cmdString);
		return this.eval(exprs);
	}

	function LispEvaluator_eval(priv, exprs, scope) {
		if(exprs.length === 0) {
			throw "Empty expression.";
		}

		if(scope === undefined) {
			scope = priv.createNewScope();
		}

		var result = undefined;
		// eval all expressions, keeping last result
		for(var ixExpr = 0; ixExpr < exprs.length; ixExpr++) {
			var currExpr = exprs[ixExpr];
			var currResult = priv.evalOneExpr(scope, currExpr);
			result = currResult;
		}

		return result;
	}
	
	function LispEvaluator_evalOneExpr(priv, scope, expr) {
		var exprType = utils.getTypeOf(expr);
		
		priv.debugLog("evalOneExpr called on '" + expr + "', of type " + exprType);

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

			var funcName = exprArray[0];
			var funcArgDefinitions = exprArray.slice(1);
			
			var funcArgs =
				utils.map(
					funcArgDefinitions,
					function(argDefn) {
						return priv.evalOneExpr(scope, argDefn);
					});

			var func = scope.lookUp(funcName);
			var funcType = utils.getTypeOf(func);

			utils.assertType(funcName, func, "LispFunction");

			priv.debugLog("Running " + funcName + " with args:\n" + jsrepl.pp.prettyPrint(funcArgs));

			var result = func.func.apply(this, funcArgs);

			return result;
		}
		else {
			throw "Cannot eval object '" + expr + "' of unknown type " + utils.getTypeOf(expr);
		}
	}

	function LispEvaluator_read(priv,str) {
		var tokens = priv.tokenise(str);

		var nestLevels = [new LispExpression()];

		for(var ixToken = 0; ixToken < tokens.length; ixToken++) 
		{
			var currToken = tokens[ixToken];

			if(currToken === "(") {
				nestLevels.push(new LispExpression());
			}
			else if(currToken === ")") {
				if(nestLevels.length === 1) {
					throw "Encountered ')' when no nestLevels were on the stack!";
				}

				var doneLevel = nestLevels.pop();

				nestLevels[nestLevels.length-1].list.push(doneLevel);
				
			}
			else {
				// Non-bracket token
				nestLevels[nestLevels.length-1].list.push(currToken);
			}
		} // for each token

		if(nestLevels.length !== 1) {
			throw ("Unbalanced brackets at end of parse; nestLevels.length = " + nestLevels.length.toString());
		}

		// Total hack: unwrap the top-level LispExpression
		// into an array.
		var exprs = nestLevels[0].list;

		priv.debugLog("parsed: " + exprs.toString());

		return exprs;
	} // function read

	function LispEvaluator_tokenise(priv, str) {
		var tokens = [];
		var emptyCurrToken = "";
		var currToken = emptyCurrToken;
		
		function pushCurrToken() {
			var tokenObject;
			
			if(utils.isIntegerString(currToken)) {
				tokenObject = parseInt(currToken);
			}
			else if(isSymbolString(currToken)) {
				tokenObject = new LispSymbol(currToken);
			}
			else {
				throw "Unrecognised token: '" + currToken + "'";
			}

			tokens.push(tokenObject);
			currToken = emptyCurrToken;
		}

		for(var ix = 0; ix < str.length; ix++) {
			var ch = str[ix];
			
			if(isWhiteSpace(ch)) {
				if(currToken !== emptyCurrToken) {
					pushCurrToken();
				}
			}
			else if(ch === "(" || ch === ")") {
				if(currToken !== emptyCurrToken) {
					pushCurrToken();
				}
				
				tokens.push(ch);
			}
			else {
				currToken =
					currToken === emptyCurrToken ?
					ch :
					currToken + ch;
			}
		} // for each ch loop

		if(currToken !== emptyCurrToken) {
			pushCurrToken();
		}
		
		priv.debugLog("tokenise() parsed tokens: '" + tokens + "'");
		return tokens;
	} // function tokenise

	function LispEvaluator_createNewScope(priv) {
		var scope = new LispScope();
		scope.pushFrame(priv._globalScopeFrame);
		return scope;
	}

	function LispEvaluator_createLispFunctionFromExpression(priv, defnScope, expr) {
		utils.assertType("expr", expr, "LispExpression");

		if(expr.list.length < 3) {
			throw "Function expressions must contain at least 3 items";
		}

		if(expr.list[0] !== functionDefinitionKeyword) {
			throw "Function expression started with '" + expr.list[0] + "', not the function definition keyword '" + functionDefinitionKeyword + "'.";
		}

		var argsDefnList = expr.list[1];
		var funcBody = expr.list.slice(2);

		utils.assertType("argsDefnList", argsDefnList, "LispExpression");

		var numArgsRequired = argsDefnList.list.length;

		var func = function() {
			if(numArgsRequired !== arguments.length) {
				throw "Function required " + numArgsRequired + " args but received " + y + " args."
			}
		
			var execScope = defnScope.copy();

			// Push function evaluation scope frame.
			execScope.pushFrame(new LispScopeFrame());
			
			utils.each(argsDefnList.list, function(argDefn, ix) {
				utils.assertType("argDefn", argDefn, "LispExpression");
				if(argDefn.list.length !== 2) {
					throw "Function argument definitions must contain two elements; received: '" + argDefn + "'.";
				}

				var argName = argDefn.list[0];
				var argValue = arguments[ix];

				execScope.set(argName, argValue);
			});

			return priv.eval(execScope, funcBody);
		};

		return new LispFunction(func);
	}

	var functionDefinitionKeyword = "\\";

	// ** Library functions **

	function Lib_plus() {
		var ret = 0;

		utils.each(arguments, function(elt) {
			utils.assertType("argument for +:", elt, "number");
			ret += elt;
		});

		return ret;
	}

	function Lib_multiply() {
		var ret = 1;

		utils.each(arguments, function(elt) {
			utils.assertType("argument for +:", elt, "number");
			ret *= elt;
		});

		return ret;
	}
	
	// ** / Library functions **

	function isSymbolString(str) {
		return /[a-z=_+*?!<>/\-][a-z=_+*?!<>/\-0-9]*/i.test(str);
	}

	function isWhiteSpace(ch) {
		return 	ch === " "  ||
				ch === "\n" ||
				ch === "\t" ||
				ch === "\r";
	}

	// ** Types ** //

	function LispSymbol(name) {
		this.name = name;
		this.toString = function() {
			return name;
		};
	}

	function LispExpression(list) {
		this.list = list || [];
		this.toString = function() {
			return "(" +
				utils.join(" ", this.list) +
				")";
		}
	}

	function LispFunction(func) {
		utils.assertType("func", func, "function");
		this.func = func;
	}

	function LispScope() {
		var frames = [];

		this.set = function(varName, varValue) {
			if(frames.length === 0) {
				throw "Cannot set variable '" + varName + "' in a scope with no frames.";
			}

			var topFrame = frames[frames.length - 1];
			topFrame.vars[varName] = varValue;
		};

		this.pushFrame = function(frame) {
			utils.assertType("frame", frame, "LispScopeFrame");

			frames.push(frame);
		};

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

	function LispScopeFrame() {
		this.vars = {};
	}

	// ** / Types ** //

	var pub = {
		LispEvaluator: LispEvaluator
	};

	return pub;
}();

// Required : "utils.js"

var jsrepl = jsrepl || {};

jsrepl.lisp = function() {

	function LispEvaluator(logFn) {
		this.bindMethod = bindMethod;
		
		var priv = {};	
		
		priv["_vars"] = {}; 
		priv["_this"] = this; 
		priv["_debugLogging"] = true; 
		priv["logFn"] = logFn; 
		priv["debugLog"] = this.bindMethod(priv, LispEvaluator_debugLog);
		priv["tokenise"] = this.bindMethod(priv, LispEvaluator_tokenise);

		priv._vars["hello"] = "world!";

		this.readEval =
			this.bindMethod(priv, LispEvaluator_readEval);

		this.evalOneExpr =
			this.bindMethod(priv, LispEvaluator_evalOneExpr);

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
		
		if(exprs.length === 0) {
			throw "Empty expression.";
		}

		var result = undefined;
		// eval all expressions, keeping last result
		for(var ixExpr = 0; ixExpr < exprs.length; ixExpr++) {
			var currExpr = exprs[ixExpr];
			var currResult = priv._this.evalOneExpr(currExpr);
			result = currResult;
		}

		return result;
	}
	
	function LispEvaluator_evalOneExpr(priv, expr) {
		var exprType = utils.getTypeOf(expr);
		
		priv.debugLog("evalOneExpr called on '" + expr + "', of type " + exprType);

		if(exprType === "LispSymbol")
		{
			return priv._vars[expr.name];
		}
		
		if(exprType === "LispExpression") {
			throw "Evaluating functions is not yet supported."
		
			// assert(expr is array)
			if(expr.length === 0) {
				throw "Cannot evaluate empty expression";
			}
			else if (expr.length === 1) {
				
			}
		}
		else {
			throw expr;
			throw "Cannot eval object '" + expr + "' of unknown type " + typeof(expr);
		}
	}

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
			// Assume all tokens are symbols for now.
			var tokenObject = new LispSymbol(currToken);
			
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

	function isWhiteSpace(ch) {
		return 	ch === " "  ||
				ch === "\n" ||
				ch === "\t" ||
				ch === "\r";
	}

	var pub = {
		LispEvaluator: LispEvaluator
	};

	return pub;
}();

var jsrepl = jsrepl || {};

jsrepl.lisp = function() {

	function LispEvaluator() {
		var priv = {
			_vars = {},
			_this = this
		}

		priv._vars["hello"] = "world!";

		this.readEval = function(cmdString) {
			LispEvaluator_readEval(priv, cmdString);
		}

		this.evalOneExpr = function(expr) {
			LispEvaluator_evalOneExpr(priv, expr);
		}
	}

	function LispEvaluator_readEval(priv, cmdString) {
		var exprs = parseSExprs(cmdString);
		
		if(exprs.length === 0) {
			throw "Empty expression.";
		}

		var result = undefined;
		// eval all expressions, keeping last result
		for(var ixExpr = 0; ixExpr < expr.length; ixExpr++) {
			var currExpr = exprs[ixExpr];
			var currResult = this.evalOneExpr(currExpr);
			result = currResult;
		}

		return result;
	}
	
	function LispEvaluator_evalOneExpr(priv, expr) {
		if(typeof(expr) === "LispSymbol")
		{
			return priv._vars[expr.name];
		}
		
		if(isArray(expr)) {
			throw "Evaluating functions is not yet supported."
		}
		
		// assert(expr is array)
		if(expr.length === 0) {
			throw "Cannot evaluate empty expression";
		}
		else if (expr.length === 1) {
			
		}
	}

	function LispSymbol(name) {
		this.name = name;
	}

	function parseSExprs(str) {
		var tokens = tokenise(str);

		var nestLevels = [[]];

		for(var ixToken = 0; ixToken < tokens.length; ixToken++) 
		{
			var currToken = tokens[ixToken];

			if(currToken === "(") {
				nestLevels.push([]);
			}
			else if(currToken === ")") {
				if(nestLevels.length === 1) {
					throw "Encountered ')' when no nestLevels were on the stack!";
				}

				var doneLevel = nestLevels.pop();

				nestLevels[nestLevels.length-1].push(doneLevel);
				
			}
			else {
				// Non-bracket token
				nestLevels[nestLevels.length-1].push(currToken);
			}
		} // for each token

		if(nestLevels.length !== 1) {
			throw ("Unbalanced brackets at end of parse; nestLevels.length = " + nestLevels.length.toString());
		}

		return nestLevels[0];
	} // function parseSExpr

	function tokenise(str) {
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

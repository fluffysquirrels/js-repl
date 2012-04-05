// Required : jsrepl.lisp.langTypes.js

var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {};

jsrepl.lisp.parser = function() {
	var pub = {};

	var _logger = ioc.createLogger("lisp.parser").withDebug(false);

	pub.read = function(str) {
		var tokens = tokenise(str);

		var nestLevels = [{expr: new jsrepl.lisp.LispExpression()}];

		function pushToTopLevel(elt) {
			if(getPrevTokenOnThisLevelWasQuote()) {
				var quotExpr = new jsrepl.lisp.LispExpression();
				quotExpr.list.push(
					new jsrepl.lisp.LispSymbol("quote"));
				quotExpr.list.push(elt);
				removePrevTokenOnThisLevelWasQuote();
				pushToTopLevel(quotExpr);
			}
			else {
				getTopLevel().expr.list.push(elt);
			}
		}

		function getPrevTokenOnThisLevelWasQuote() {
			return getTopLevel().prevTokenWasQuote === true;
		}

		function removePrevTokenOnThisLevelWasQuote() {
			delete getTopLevel().prevTokenWasQuote;
		}

		function setPrevTokenOnThisLevelWasQuote() {
			getTopLevel().prevTokenWasQuote = true;
		}

		function getTopLevel(){
			return nestLevels[nestLevels.length-1];
		}

		for(var ixToken = 0; ixToken < tokens.length; ixToken++) 
		{
			var currToken = tokens[ixToken];

			if(currToken === "(") {
				nestLevels.push({expr: new jsrepl.lisp.LispExpression()});
			}
			else if(currToken === ")") {
				if(nestLevels.length === 1) {
					throw "Encountered ')' when no nestLevels were on the stack!";
				}

				var doneLevel = nestLevels.pop();

				pushToTopLevel(doneLevel.expr);
			}
			else if(getPrevTokenOnThisLevelWasQuote() || currToken !== "'") {
				// Not a special token
				pushToTopLevel(currToken);
			}
			else if(currToken === "'") {
				setPrevTokenOnThisLevelWasQuote();
			}
			else {
				throw new Error("Not reached.")
			}
		} // for each token

		if(nestLevels.length !== 1) {
			throw ((nestLevels.length - 1) + " unbalanced bracket(s) at end of parse");
		}

		// Total hack: unwrap the top-level LispExpression
		// into an array.
		var exprs = nestLevels[0].expr.list;

		_logger.debug("parsed: " + exprs.toString());

		return exprs;
	} // function read

	function tokenise(str) {
		var tokens = [];
		var emptyCurrToken = "";
		var currToken = emptyCurrToken;
		
		function pushCurrToken() {
			var tokenObject;
			
			if(utils.isFloatString(currToken)) {
				tokenObject = parseFloat(currToken);
			}
			else if(isSymbolString(currToken)) {
				tokenObject = new jsrepl.lisp.LispSymbol(currToken);
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
			else if(ch === "(" ||
					ch === ")") {
				if(currToken !== emptyCurrToken) {
					pushCurrToken();
				}
				
				tokens.push(ch);
			}
			else if(ch === "'" &&
					currToken === emptyCurrToken) {
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
		
		_logger.debug("tokenise() parsed tokens: '" + tokens + "'");
		return tokens;
	} // function tokenise

	function isSymbolString(str) {
		return /[a-z=_+*?!<>/\-][a-z=_+*?!<>/\-0-9]*/i.test(str);
	}

	function isWhiteSpace(ch) {
		return 	ch === " "  ||
				ch === "\n" ||
				ch === "\t" ||
				ch === "\r";
	}

	return pub;
}();

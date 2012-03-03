// Required : jsrepl.lisp.langTypes.js

var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {};

jsrepl.lisp.parser = function() {
	var pub = {};

	var _logger = ioc.createLogger("lisp.parser");

	pub.read = function(str) {
		var tokens = tokenise(str);

		var nestLevels = [new jsrepl.lisp.LispExpression()];

		for(var ixToken = 0; ixToken < tokens.length; ixToken++) 
		{
			var currToken = tokens[ixToken];

			if(currToken === "(") {
				nestLevels.push(new jsrepl.lisp.LispExpression());
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

		_logger.debug("parsed: " + exprs.toString());

		return exprs;
	} // function read

	function tokenise(str) {
		var tokens = [];
		var emptyCurrToken = "";
		var currToken = emptyCurrToken;
		
		function pushCurrToken() {
			var tokenObject;
			
			if(utils.isIntegerString(currToken)) {
				tokenObject = parseInt(currToken);
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
					ch === ")" ||
					ch === "\\") {
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

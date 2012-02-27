var jsrepl = jsrepl || {};
jsrepl.lisp = function() {
	function LispEvaluator() {
		this.eval = LispEvaluator_eval;
	}

	function LispEvaluator_eval(cmd) {
		return parseSExpr(cmd);
	}

	function parseSExpr(str) {
		//var ret = [];

		return tokenise(str);
	}

	function tokenise(str) {
		var tokens = [];
		var emptyCurrToken = "";
		var currToken = emptyCurrToken;
		
		function pushCurrToken() {
			tokens.push(currToken);
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
				
				currToken = ch;
				pushCurrToken();
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
	}

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

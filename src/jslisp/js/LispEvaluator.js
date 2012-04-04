// Required : "utils.js"
// Required : "ioc.js"
// Required : "jsrepl.pp.js"
// Required : "jsrepl.lisp.langTypes.js"
// Required : "jsrepl.lisp.scopeTypes.js"
// Required : "jsrepl.lisp.parser.js"
// Required : "jsrepl.lisp.lib.js"

var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {}

jsrepl.lisp.initScriptUrls =
	[
		"src/jslisp/lisp/control-flow.lisp",
		"src/jslisp/lisp/prologue.lisp",
		"src/jslisp/lisp/collections.lisp",
		"src/jslisp/lisp/maths.lisp",
		"src/jslisp/lisp/primes.lisp",
		"src/jslisp/lisp/ListDict.lisp",
		"src/jslisp/lisp/dict-is-ListDict.lisp",
		"src/jslisp/lisp/oo.lisp",
	];

jsrepl.lisp.beginCreateEvaluator =
function() { // Create new scope.
	function beginCreateEvaluator(callback) {
		var logger = ioc.createLogger("jsrepl.lisp.beginCreateEvaluator").withDebug(false);

		logger.debug("Start");

		var evaluator = new LispEvaluator();
		evaluator.beginRunUrls(jsrepl.lisp.initScriptUrls,
			function() {
				logger.debug("In beginRunUrls callback.");
				logger.debug("Running beginCreateEvaluator callback.");
				callback(evaluator);
				logger.debug("Finished beginCreateEvaluator callback.");
			}
		);
	}

	function LispEvaluator() {
		// << Vars
		
		var _globalScopeFrame = new jsrepl.lisp.LispScopeFrame(); 
		_globalScopeFrame.vars = jsrepl.lisp.getLib();
		var _this = this;
		var _logger =
			ioc.createLogger(
				"LispEvaluator").withDebug(true);
	
		this.readEval = function(cmdString) {
			var exprs = jsrepl.lisp.parser.read(cmdString);
			var scope = createNewScope();
			return this.eval(scope, exprs);
		}
	
		this.eval = function(scope, exprs) {
			// utils.assertType("exprs", exprs, "Array");
			// utils.assertType("scope", scope, "LispScope");
			
			if(exprs.length === 0) {
				throw new Error("Cannot eval an empty expression.");
			}
	
			var result = undefined;
			// eval all expressions, keeping last result
			exprs.forEach(
				function(currExpr) {
					var currResult = _this.evalOneExpr(scope, currExpr);
					result = currResult;
				}
			);
	
			return result;
		}
		
		this.evalOneExpr = function(scope, expr) {
			try {
				var result = evalOneExpr_body(scope, expr);
	
				return result;
			}
			catch(ex) {
				var currLispFrame =
					new jsrepl.lisp.LispStackFrame(
						scope, expr);

				if(utils.getTypeOf(ex) === "LispException") {
					ex.thread.pushFrame(currLispFrame);
					
					throw ex;
				}
				else
				{
					var thread =
						new jsrepl.lisp.LispThread();
					
					thread.pushFrame(currLispFrame);

					throw new jsrepl.lisp.LispException(thread, ex);
				}
			}
		}
	
		var evalOneExpr_body = function(scope, expr) {
			var exprType = utils.getTypeOf(expr);
			
			if(exprType === "LispSymbol")
			{
				var symbolValue = scope.lookUp(expr.name);
				if(symbolValue === undefined) {
					throw "There is no variable to take the value of with name '" + expr.name + "'.";
				}
	
				return symbolValue;
			}
			else if(exprType === "number" ||
					exprType === "boolean" ||
					exprType === "LispFunction" ||
					exprType === "LispMacro") {
				return expr;
			}
			else if(exprType === "LispExpression") {
				var exprArray = expr.list;
	
				if(exprArray.length === 0) {
					throw "Cannot evaluate empty expression";
				}
	
				var firstValue =
					_this.evalOneExpr(scope, exprArray[0]);
				var argDefns = exprArray.slice(1);
	
				return firstValue.evalWithArgDefns(
							scope,
							argDefns);
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
	
		this.beginRunUrls = function(urls, callback) {
			if(urls.length === 0) {
				callback();
				return;
			}
	
			var firstUrl = urls[0];
			var restOfUrls = urls.slice(1);
			
			_this.beginRunUrl(
				firstUrl,
				function() {
					_this.beginRunUrls(restOfUrls, callback);
				});
		}
	
		this.beginRunUrl = function(url, callback) {
			utils.beginLoadFile(
				url,
				function(lispStr) {
					ioc.withErrorHandler(function() {
						_logger.info("Running '" + url + "'.");
						_this.readEval(lispStr);
						if(callback) {
							callback();
						}
					});
				});
		}
	}

	return beginCreateEvaluator;
}();

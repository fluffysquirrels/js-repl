// Required : "utils.js"
// Required : "ioc.js"
// Required : "jsrepl.pp.js"
// Required : "jsrepl.lisp.langTypes.js"
// Required : "jsrepl.lisp.scopeTypes.js"
// Required : "jsrepl.lisp.parser.js"
// Required : "jsrepl.lisp.lib.js"

var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {}

jsrepl.lisp.logger = ioc.createLogger("lisp").withDebug(true);
jsrepl.lisp.initScriptUrls =
	[
		"lisp/prologue.lisp",
		"lisp/collections.lisp",
		"lisp/control-flow.lisp",
		"lisp/maths.lisp",
		"lisp/primes.lisp",
		"lisp/oo.lisp",
	];

jsrepl.lisp.beginCreateEvaluator =
function() { // Create new scope.
	function beginCreateEvaluator(callback) {
		var logger = ioc.createLogger("jsrepl.lisp.beginCreateEvaluator").withDebug(true);

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
				"lisp.LispEvaluator").withDebug(true);
	
		this.readEval = function(cmdString) {
			var exprs = jsrepl.lisp.parser.read(cmdString);
			return this.eval(exprs);
		}
	
		this.eval = function(exprs, scope) {
			utils.assertType("exprs", exprs, "Array");
			
			if(exprs.length === 0) {
				throw new Error("Cannot eval an empty expression.");
			}
	
			if(scope === undefined) {
				scope = createNewScope();
			}
				
			utils.assertType("scope", scope, "LispScope");
	
			var result = undefined;
			// eval all expressions, keeping last result
			for(var ixExpr = 0; ixExpr < exprs.length; ixExpr++) {
				var currExpr = exprs[ixExpr];
				var currResult = _this.evalOneExpr(scope, currExpr);
				result = currResult;
			}
	
			return result;
		}
		
		this.evalOneExpr = function(scope, expr) {
			var thread;
	
			try {
				thread = scope.getThread();
				var newStackFrame = new jsrepl.lisp.LispStackFrame(scope, expr);
				thread.pushFrame(newStackFrame);
	
				var result = evalOneExpr_body(scope, expr);
	
				thread.popFrame();
	
				return result;
			}
			catch(ex) {
				if(utils.getTypeOf(ex) === "LispException") {
					throw ex;
				}
				else {
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
				var firstType = utils.getTypeOf(firstValue);
				var argDefns = exprArray.slice(1);
	
				if( firstType === "LispKeyword"  ||
					firstType === "LispFunction" ||
					firstType === "LispMacro") {
					return firstValue.evalWithArgDefns(
								scope,
								argDefns);
				}
				else
				{
					throw new Error("Cannot evaluate LispExpression with first value '" + firstValue + "' of unknown type " + firstType + ".");
				}
			}
			else {
				throw "Cannot eval object '" + expr + "' of unknown type " + utils.getTypeOf(expr);
			}
		}
		
		function createNewScope() {
			var thread = new jsrepl.lisp.LispThread(_this);
			var scope = new jsrepl.lisp.LispScope(_this, thread);
	
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
						_logger.debug("Running Lisp script from URL '" + url + "'.");
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

var jslisp = jslisp || {};
jslisp.lang = jslisp.lang || {};
jslisp.lang.Dict = jslisp.lang.Dict || function Dict() {};

jslisp.lang.Dict.LispFunctions = (function() {
  var pub = {};

  pub.addToLib = function(lib) {
    lib["JsDict.new"] = 
    new jslisp.lang.LispFunction(function(scope, args) {
		return new jslisp.lang.Dict();
	});

    lib["JsDict.from-list"] = 
    new jslisp.lang.LispFunction(function(scope, args) {
		var kvList = args[0];

		return jslisp.lang.Dict.fromExpression(kvList);
	});

    lib["JsDict.is?"] = 
    new jslisp.lang.LispFunction(function(scope, args) {
		var obj = args[0];

		return jslisp.lang.Dict.isA(obj);
	});

    lib["JsDict.has?"] = 
    new jslisp.lang.LispFunction(function(scope, args) {
	  var dict = args[0];
	  var key = args[1];

	  return dict.hasKey(key);
	});

    lib["JsDict.get"] = 
    new jslisp.lang.LispFunction(function(scope, args) {
	  var dict = args[0];
	  var key = args[1];

	  return dict.get(key);
	});

    lib["JsDict.tryget"] = 
    new jslisp.lang.LispFunction(function(scope, args) {
	  var dict = args[0];
	  var key = args[1];

	  return dict.tryGet(key);
	});

    lib["JsDict.keys"] = 
    new jslisp.lang.LispFunction(function(scope, args) {
	  var dict = args[0];

	  return dict.keys();
	});

    lib["JsDict.with-value"] = 
    new jslisp.lang.LispFunction(function(scope, args) {
	  var dict  = args[0];
	  var key   = args[1];
	  var value = args[2];

	  return dict.withValue(key, value);
	});

    lib["JsDict.with-values"] = 
    new jslisp.lang.LispFunction(function(scope, args) {
	  var dict    = args[0];
	  var kvPairs = args[1];

	  return dict.withValueExpressions(kvPairs);
	});
  };

  return pub;
})();

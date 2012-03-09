// Requires: jstest.js

var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {};

jsrepl.lisp.runTests = function() {
	var logger = ioc.createLogger("lisp.tests");
	
	var lispTests = [
		new LispTest("(setl si (func (x) (if (= x 1) 1 (+ x (si (- x 1)))  ))) (si 20)", 210),
	
		// Parsing basic values
		new LispTest("hello", "world!"),
		new LispTest("true",  true),
		new LispTest("false", false),
		new LispTest("5", 5),
		new LispTest("null", null),

		// Arithmetic
		new LispTest("(+ 5 6)", 	11),
		new LispTest("(+ 2 8 20)", 	30),
		new LispTest("(* 7 3)", 	21),
		new LispTest("(* 7 3 8)", 	168),
		new LispTest("(- 55 42)", 	13),
		new LispTest("(/ 56 8)", 	7),
		new LispTest("(/ 13 4)", 	3.25),

		// Numerical comparisons
		new LispTest("(= 5 5)", 	true),
		new LispTest("(= 5 6)", 	false),
		
		new LispTest("(< 4 5)", 	true),
		new LispTest("(< 5 5)", 	false),
		new LispTest("(< 6 5)", 	false),

		new LispTest("(> 4 5)", 	false),
		new LispTest("(> 5 5)", 	false),
		new LispTest("(> 6 5)", 	true),

		new LispTest("(<= 4 5)", 	true),
		new LispTest("(<= 5 5)", 	true),
		new LispTest("(<= 6 5)", 	false),

		new LispTest("(>= 4 5)", 	false),
		new LispTest("(>= 5 5)", 	true),
		new LispTest("(>= 6 5)", 	true),

		// Assignment
		new LispTest("(setg abra 5) abra", 5),
		new LispTest("(setl abra 5) abra", 5),
		
		// func
		new LispTest("((func () 27))", 27),
		new LispTest("((func (x) x) 27)", 27),
		new LispTest("((func (x y) (* x y)) 4 5)", 20),
		new LispTest("(setl myfunc (func (x y) (* x y)))(myfunc 4 5)", 20),

		// car
		new LispTest("(car (quot ()))", null),
		new LispTest("(car (quot (2)))", 2),
		new LispTest("(car (quot (1 2)))", 1),
		new LispTest("(setl chillax true)(eval (car (quot (chillax))))", true),
		
		// cdr
		new LispTest("(cdr (quot ()))", null),
		new LispTest("(cdr (quot (1)))", null),
		new LispTest("(car (cdr (quot (1 2))))", 2),
		new LispTest("(cdr (cdr (quot (1 2))))", null),

		// cons
		new LispTest("(car      (cons 1 (quot (2))))", 1),
		new LispTest("(car (cdr (cons 1 (quot (2)))))", 2),
		new LispTest("(cdr (cdr (cons 1 (quot (2)))))", null),
		
		new LispTest("(car (cons 1))", 1),
		new LispTest("(cdr (cons 1))", null),
		
		// quot
		new LispTest("(quot 5)", 5),
		new LispTest("(eval (quot (+ 2 3)))", 5), // incl eval
		new LispTest("(car (quot (2 3 4)))", 2),

		// eval
		new LispTest("(eval 5)", 5),
		new LispTest("(eval 2 3 4 5)", 5),
		new LispTest("(eval (cons (quot *) (quot (2 3))))", 6),
		new LispTest("(eval (setl testVar 7) testVar)", 7),

		// if
		new LispTest("(if true 5 6)", 5),
		new LispTest("(if false 5 6)", 6),
		new LispTest("(if true 5 (throwError))", 5),
		new LispTest("(if false (throwError) 6)", 6),
		new LispTest("(if true (* 4 6) 1)", 24)
	]; // / lispTests

	function LispTest(lispStr, expectedResult) {
		function testFunc() {
			logger.debug("Running lisp code '" + lispStr + "'");
			
			var evaluator = new jsrepl.lisp.LispEvaluator();
			var result = evaluator.readEval(lispStr);
			jstest.assertEqual(
				result,
				expectedResult,
				"Incorrect LispTest result.");
		}

		var description =
			"Lisp code '" + lispStr +
			"' should return '" + expectedResult + "'";

		return new jstest.Test(testFunc, description);
	}

	jstest.runTests(lispTests);
}

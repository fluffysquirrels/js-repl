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

		// divrem
		new LispTest("(eq (divrem 3 2)  (quot (1 1)))", true),
		new LispTest("(eq (divrem 8 4)  (quot (2 0)))", true),
		new LispTest("(eq (divrem 29 7) (quot (4 1)))", true),

		// js=
		new LispTest("(js= 5 5)", 	true),
		new LispTest("(js= 5 6)", 	false),
		new LispTest("(js= true true)", true),
		new LispTest("(js= 5 false)", false),
		new LispTest("(js= (quot a) (quot a))", false),

		// jstypeof
		new LispTest("(sym= (jstypeof 5) (quot number))", true),
		new LispTest("(sym= (jstypeof 5) (quot boolean))", false),
		new LispTest("(sym= (jstypeof true) (quot boolean))", true),
		new LispTest("(sym= (jstypeof null) (quot null))", true),
		new LispTest("(sym= (jstypeof (quot somesymbol)) (quot LispSymbol))", true),
		new LispTest("(sym= (jstypeof (quot (1 2 3))) (quot LispExpression))", true),
		new LispTest("(sym= (jstypeof (func () true)) (quot LispFunction))", true),

		// sym=
		new LispTest("(sym= (quot a) (quot a))", true),
		new LispTest("(sym= (quot a) (quot b))", false),

		// (?<type>\w+)?
		new LispTest("(cons? (quot ()))", 	true),
		new LispTest("(num?  5)", 			true),
		new LispTest("(sym?  (quot a))", 	true),
		new LispTest("(func? (func () 6))", true),
		new LispTest("(bool? true)", 		true),
		new LispTest("(null? (cdr (quot ())))", true),

		// Assignment
		new LispTest("(setg abra 5) abra", 5),
		new LispTest("(setl abra 5) abra", 5),
		
		// func
		new LispTest("((func () 27))", 27),
		new LispTest("((func (x) x) 27)", 27),
		new LispTest("((func (x y) (* x y)) 4 5)", 20),
		new LispTest("(setl myfunc (func (x y) (* x y)))(myfunc 4 5)", 20),

		// func with varags
		new LispTest("((func (x y *args) (* x y)) 4 5)", 20),
		new LispTest("((func (x y *args) (* x y)) 4 5 6)", 20),
		new LispTest("((func (x y *args) (* x y)) 4 5 6 7)", 20),
		new LispTest(
			"(eq " +
				"((func (x y *args) (cons (* x y) *args)) 4 5)" +
				"(quot (20)))", true),
		new LispTest(
			"(eq " +
				"((func (x y *args) (cons (* x y) *args)) 4 5 6)" +
				"(quot (20 6)))", true),
		new LispTest(
			"(eq " +
				"((func (x y *args) (cons (* x y) *args)) 4 5 6 7)" +
				"(quot (20 6 7)))", true),

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

		// list
		new LispTest("(eq (list)     (quot ()))", true),
		new LispTest("(eq (list 1)   (quot (1)))", true),
		new LispTest("(eq (list 1 2) (quot (1 2)))", true),

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
		new LispTest("(if true (* 4 6) 1)", 24),

		// condf
		new LispTest("(condf (quot ((false 4)(true 5))))", 5),
		new LispTest("(condf (quot ((true 4) (true 5))))", 4),
		new LispTest("(condf (quot (((< 2 3) 4) (true 5))))", 4),
		new LispTest("(setl x 5)(condf (quot ((true x))))", 5),

		// not
		new LispTest("(not true)",  false),
		new LispTest("(not false)", true),

		// and
		new LispTest("(and false false)",  false),
		new LispTest("(and false true )",  false),
		new LispTest("(and true  false)",  false),
		new LispTest("(and true  true )",  true ),
		
		// or
		new LispTest("(or false false)",  false),
		new LispTest("(or false true )",  true ),
		new LispTest("(or true  false)",  true ),
		new LispTest("(or true  true )",  true )

	]; // / lispTests

	function LispTest(lispStr, expectedResult) {
		function testFunc() {
			logger.debug("Running lisp code '" + lispStr + "'");
			
			var evaluator = ioc.createLispEvaluator();
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

// Requires: jstest.js

var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {};

jsrepl.lisp.beginRunTests = function(testsDoneCallback) {
	var logger = ioc.createLogger("lisp.tests");

	// We require that no one modifies global state,
	// so we can use a shared evaluator and speed up
	// the tests by not re-running the prologue hundreds
	// of times.
	var evaluator;

	function beginRunTests() {
		jsrepl.lisp.beginCreateEvaluator(
			function(returnedEvaluator) {
				evaluator = returnedEvaluator;
				jstest.runTests(lispTests);
				if(testsDoneCallback) {
					testsDoneCallback;
				}
			}
		);
	}

	var lispTests = [
		// Parsing basic values
		new LispTest("hello", "world!"),
		new LispTest("true",  true),
		new LispTest("false", false),
		new LispTest("5", 5),
		new LispTest("null", null),
		
		// Parsing '
		new LispTestEq("'true", "(quote true)"),
		new LispTestEq("'()", "(quote ())"),
		new LispTestEq("'(1 2 3)", "(quote (1 2 3))"),
		new LispTestEq("'(1 (2 3) 4)", "(quote (1 (2 3) 4))"),
		new LispTestEq("'(1 (2 3) 4)", "(list 1 (list 2 3) 4)"),

		// Arithmetic
		new LispTest("(+ 5 6)", 	11),
		new LispTest("(+ 2 8 20)", 	30),
		new LispTest("(* 7 3)", 	21),
		new LispTest("(* 7 3 8)", 	168),
		new LispTest("(- 55 42)", 	13),
		new LispTest("(/ 56 8)", 	7),
		new LispTest("(/ 12 4)", 	3),
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
		new LispTest("(eq (divrem 3 2)  '(1 1))", true),
		new LispTest("(eq (divrem 8 4)  '(2 0))", true),
		new LispTest("(eq (divrem 29 7) '(4 1))", true),

		// js=
		new LispTest("(js= 5 5)", 	true),
		new LispTest("(js= 5 6)", 	false),
		new LispTest("(js= true true)", true),
		new LispTest("(js= 5 false)", false),
		new LispTest("(js= 'a 'a)", false),
		new LispTest("(js= '() '())", false),

		// jstypeof
		new LispTest("(sym= (jstypeof 5) 'number)", true),
		new LispTest("(sym= (jstypeof 5) 'boolean)", false),
		new LispTest("(sym= (jstypeof true) 'boolean)", true),
		new LispTest("(sym= (jstypeof null) 'null)", true),
		new LispTest("(sym= (jstypeof 'somesymbol) 'LispSymbol)", true),
		new LispTest("(sym= (jstypeof '(1 2 3)) 'LispExpression)", true),
		new LispTest("(sym= (jstypeof (func () true)) 'LispFunction)", true),

		// sym=
		new LispTest("(sym= 'a 'a)", true),
		new LispTest("(sym= 'a 'b)", false),

		// (?<type>\w+)?
		new LispTest("(cons? '())", 		true),
		new LispTest("(num?  5)", 			true),
		new LispTest("(sym?  'a)", 			true),
		new LispTest("(func? (func () 6))", true),
		new LispTest("(bool? true)", 		true),
		new LispTest("(null? (cdr '()))", 	true),
		new LispTest("(null? null)", 		true),

		// Assignment
		// new LispTest("(setg abra 0)(setg abra 6) abra", 6), -- setg is banned in tests; see runTestLispCode for more details.
		new LispTest("(setl abra 5) abra", 5),

		// let
		new LispTestEq("(let (x 5) x)", 5),
		new LispTestEq("(let (x 5) 'other 'expressions (+ x 12))", 17),

		// func
		new LispTest("((func () 27))", 27),
		new LispTest("((func (x) x) 27)", 27),
		new LispTest("((func (x y) (* x y)) 4 5)", 20),
		new LispTest("(setl myfunc (func (x y) (* x y)))(myfunc 4 5)", 20),
		
		// func - variable capture in lexical scope
		new LispTest("((do (setl x 5)(func () x)))", 5),

		// func with varags
		new LispTest("((func (x y *args) (* x y)) 4 5)", 20),
		new LispTest("((func (x y *args) (* x y)) 4 5 6)", 20),
		new LispTest("((func (x y *args) (* x y)) 4 5 6 7)", 20),
		new LispTest(
			"(eq " +
				"((func (x y *args) (cons (* x y) *args)) 4 5)" +
				"'(20))", true),
		new LispTest(
			"(eq " +
				"((func (x y *args) (cons (* x y) *args)) 4 5 6)" +
				"'(20 6))", true),
		new LispTest(
			"(eq " +
				"((func (x y *args) (cons (* x y) *args)) 4 5 6 7)" +
				"'(20 6 7))", true),

		// apply
		new LispTestEq(
			"(apply + '(1 2 3))",
			"6"),
		new LispTestEq(
			"(apply (func () 42) '())",
			"42"),
		new LispTestEq(
			"(setl x 21)(setl a-func (func (arg) (* arg 2)))(apply a-func (list x))",
			"42"),

		// macro
		new LispTestEq(
			"(setl get-arg-defns (macro (*arg-defns) (list 'quote *arg-defns)))(get-arg-defns this wouldnt eval)",
			"'(this wouldnt eval)"),
		new LispTestEq(
			"(setl eval-args-in-fn-scope (macro (*arg-defns) *arg-defns))(setl x 21)(eval-args-in-fn-scope * 2 x)",
			"42"),
		new LispTestThrows(
			"(setl eval-args-in-fn-scope (macro (*arg-defns) (setl macro-var 17) *arg-defns))(eval-args-in-fn-scope macro-var)"),
		new LispTestEq(
			"(setl eval-args-in-macro-scope (macro (*arg-defns) (setl macro-var 17)(eval *arg-defns)))(eval-args-in-macro-scope eval macro-var)",
			"17"),
		new LispTestThrows(
			"(setl eval-args-in-macro-scope (macro (*arg-defns) (eval *arg-defns)))(do (setl x 21)(eval-args-in-macro-scope * 2 x))"),

		// macrotest
		new LispTestEq("( (macrotest (expr) (list 'setl '(quote my-expr) (list expr expr))) (* x y))", "'(setl 'my-expr ( (* x y) (* x y) ))"),
		// car
		new LispTest("(car '())", null),
		new LispTest("(car '(2))", 2),
		new LispTest("(car '(1 2))", 1),
		new LispTest("(setl chillax true)(eval (car '(chillax)))", true),
		
		// cdr
		new LispTest("(cdr '())", null),
		new LispTest("(cdr '(1))", null),
		new LispTest("(car (cdr '(1 2)))", 2),
		new LispTest("(cdr (cdr '(1 2)))", null),

		// cons
		new LispTestEq("(cons)",   "'()"),
		new LispTestEq("(cons 1)", "'(1)"),

		new LispTest("(car      (cons 1 '(2)))", 1),
		new LispTest("(car (cdr (cons 1 '(2))))", 2),
		new LispTest("(cdr (cdr (cons 1 '(2))))", null),
		
		new LispTest("(car (cons 1 null))", 1),
		new LispTest("(cdr (cons 1 null))", null),
		new LispTest("(car (cons 1))", 1),
		new LispTest("(cdr (cons 1))", null),
		new LispTest("(car (cons))", null),
		new LispTest("(cdr (cons))", null),

		// list
		new LispTestEq("(list)    ", "'()"),
		new LispTestEq("(list 1)  ", "'(1)"),
		new LispTestEq("(list 1 2)", "'(1 2)"),
		
		// second
		new LispTestEq("(second '(1 2))",   "2"),
		new LispTestEq("(second '(1 2 3))", "2"),
		new LispTestEq("(second '(1 3))",   "3"),
		new LispTestThrows("(second '(1))"),
		new LispTestThrows("(second '())"),
		new LispTestThrows("(second 'notAList)"),

		// ** ListDict **

		// new up various ListDict's and check output lists
		new LispTestEq("(ListDict.new)",   "'(dict)"),
		new LispTestEq("(setl v 10)(ListDict.with-value (ListDict.new) 'k v)",   "'(dict (k 10))"),
		new LispTestEq("(ListDict.with-values (ListDict.new) '((k 10)(k2 20)))", "'(dict (k2 20)(k 10))"),
		new LispTestEq("(ListDict.with-values (ListDict.new) (list (list 'k (* 10 1))(list 'k2 (* 10 2))))", "'(dict (k2 20)(k 10))"),
		new LispTestEq("(ListDict.new (k 10)(k2 20))",   "'(dict (k2 20)(k 10))"),
		new LispTestEq("(ListDict.new (k1 (* 10 1)) (k2 (* 10 2)))",   "'(dict (k2 20)(k1 10))"),

		// from-list
		new LispTestEq("(ListDict.from-list '( (k v)(k2 v2) ) )", "'(dict (k2 v2)(k v))"),
		new LispTestEq("(ListDict.from-list (list (list 'k1 (* 10 1))(list 'k2 (* 10 2)) ))", "'(dict (k2 20)(k1 10))"),


		// is?
		new LispTestEq("(ListDict.is? (ListDict.new (k 10)(k2 20)))",   "true"),
		new LispTestEq("(ListDict.is? (ListDict.new))",   "true"),
		
		// has?
		new LispTestEq("(ListDict.has? (ListDict.new (k 10)(k2 20)) 'k)",   "true"),
		new LispTestEq("(ListDict.has? (ListDict.new (k 10)(k2 20)) 'k2)",   "true"),
		new LispTestEq("(ListDict.has? (ListDict.new (k 10)(k2 20)) 'x)",   "false"),

		// get
		new LispTestEq("(ListDict.get (ListDict.new (k 10)(k2 20)) 'k)",   "10"),
		new LispTestEq("(ListDict.get (ListDict.new (k 10)(k2 20)) 'k2)",  "20"),
		new LispTestThrows("(ListDict.get (ListDict.new (k 10)(k2 20)) 'x)"),
		
		// tryget
		new LispTestEq("(ListDict.tryget (ListDict.new (k 10)(k2 20)) 'k)",  "10"),
		new LispTestEq("(ListDict.tryget (ListDict.new (k 10)(k2 20)) 'k2)", "20"),
		new LispTestEq("(ListDict.tryget (ListDict.new (k 10)(k2 20)) 'x)",  "null"),

		// keys
		new LispTestEq("(ListDict.keys (ListDict.new (k 10)(k2 20)))", "'(k2 k)"),
		
		// ** / ListDict **

		// push
		new LispTestEq("(push (list 1 2) 8)", "'(1 2 8)"),

		// append
		new LispTestEq("(append '(1 2) '(3 4))", "'(1 2 3 4)"),
		new LispTestEq("(append '(1 2) '())",    "'(1 2)"),
		new LispTestEq("(append '()    '(3 4))", "'(3 4)"),

		// num-seq
		new LispTestEq("(num-seq 5 8)", "'(5 6 7)"),
		new LispTestEq("(num-seq 5 6)", "'(5)"),
		new LispTestEq("(num-seq 5 5)", "'()"),
		new LispTestEq("(num-seq 5 4)", "'()"),

		// reverse
		new LispTestEq("(reverse '())",      "'()"),
		new LispTestEq("(reverse '(1))",     "'(1)"),
		new LispTestEq("(reverse '(1 2))",   "'(2 1)"),
		new LispTestEq("(reverse '(1 2 3))", "'(3 2 1)"),

		// filter on numerical sequences
		new LispTest("(eq (filter (num-seq 5 9) num-even?) '(6 8))", true),
		new LispTest("(eq (filter (num-seq 5 9) num-odd?)  '(5 7))", true),
		new LispTest("(eq (filter '() num-even?) '())", true),
		new LispTest("(eq (filter '(1 3 5) num-even?) '())", true),

		// map on numerical sequences
		new LispTest("(eq (map (num-seq 1 7) (func (x) (* x x))) '(1 4 9 16 25 36))", true),
		new LispTest("(eq (map '() (func (x) notReached)) '())", true),

		// first-or-null
		new LispTest("(eq (first-or-null (num-seq 2 4) num-odd?) 3)", true),
		new LispTest("(eq (first-or-null (num-seq 3 4) num-odd?) 3)", true),
		new LispTest("(eq (first-or-null (list 4) num-odd?) null)", true),
		new LispTest("(eq (first-or-null (list 4 6 8) num-odd?) null)", true),
		new LispTest("(eq (first-or-null (cons) num-odd?) null)", true),
		new LispTest("(eq (first-or-null '(3 notReached) num-odd?) 3)", true),

		// quote
		new LispTest("(quote 5)", 5),
		new LispTest("(eval (quote (+ 2 3)))", 5), // incl eval
		new LispTest("(car (quote (2 3 4)))", 2),

		// eval
		new LispTest("(eval 5)", 5),
		new LispTest("(eval 2 3 4 5)", 5),
		new LispTest("(eval (cons '* '(2 3)))", 6),
		new LispTest("(eval (setl testVar 7) testVar)", 7),
		new LispTest("(eval (list (func () 12)))", 12),

		// if
		new LispTest("(if true 5 6)", 5),
		new LispTest("(if false 5 6)", 6),
		new LispTest("(if true 5 (throwError))", 5),
		new LispTest("(if false (throwError) 6)", 6),
		new LispTest("(if true (* 4 6) 1)", 24),
		new LispTest("(if (eq 5 (+ 3 2)) 10 12)", 10),
		new LispTest("(if (eq 0 (+ 3 2)) 10 12)", 12),

		// condf
		new LispTest("(eq (condf-test 4) '(4 lessthan5))", true),
		new LispTest("(eq (condf-test 5) '(5 equals5))", true),
		new LispTest("(eq (condf-test 6) '(6 morethan5))", true),

		// cond
        new LispTestEq(
			"(setl cond-test (func (x) (cond ((not(num? x)) 'notanum) ((< x 0) -1) ((> x 0) +1) (true 0))))" +
			"(cond-test -5)",
			"-1"),
        new LispTestEq(
			"(setl cond-test (func (x) (cond ((not(num? x)) 'notanum) ((< x 0) -1) ((> x 0) +1) (true 0))))" +
			"(cond-test 5)",
			"1"),
        new LispTestEq(
			"(setl cond-test (func (x) (cond ((not(num? x)) 'notanum) ((< x 0) -1) ((> x 0) +1) (true 0))))" +
			"(cond-test 0)",
			"0"),
        new LispTestEq(
			"(setl cond-test (func (x) (cond ((not(num? x)) 'notanum) ((< x 0) -1) ((> x 0) +1) (true 0))))" +
			"(cond-test 'one)",
			"'notanum"),

		// not
		new LispTest("(not true)",  false),
		new LispTest("(not false)", true),

		// and
		new LispTest("(and false false)",  false),
		new LispTest("(and false true )",  false),
		new LispTest("(and false throwError)",  false),
		new LispTest("(and false throwError)",  false),
		new LispTest("(and true  false)",  false),
		new LispTest("(and true  true )",  true ),
		
		// or
		new LispTest("(or false false)",  false),
		new LispTest("(or false true )",  true ),
		new LispTest("(or true  false)",  true ),
		new LispTest("(or true  throwError)",  true ),
		new LispTest("(or true  true )",  true ),

		// do (a macro)
		new LispTest("(do (setl x 5) (* x 4))", 20),

		// eval-debug (a macro)
		new LispTest("(eq (eval-debug (+ 3 4)) '((+ 3 4) = 7) )", true),
		new LispTest("(setl x 3)(eq (eval-debug (+ x 4)) '((+ x 4) = 7) )", true),

		// int-pow-2
		new LispTest("(int-pow-2 0)",  1),
		new LispTest("(int-pow-2 1)",  2),
		new LispTest("(int-pow-2 15)", 32768),
		new LispTest("(int-pow-2 24)", 16777216),

		// sqrt-ceil
		new LispTest("(sqrt-ceil 2)",   2),
		new LispTest("(sqrt-ceil 99)",  10),
		new LispTest("(sqrt-ceil 100)", 10),
		new LispTest("(sqrt-ceil 101)", 11),
		new LispTest("(sqrt-ceil 16777216)", 4096),
		new LispTest("(sqrt-ceil 16777217)", 4097),
		
		// sum-ints
		new LispTest("(sum-ints 20)", 210),

		// prime-factors
		new LispTest("(eq (prime-factors 17) '(17))", true),
		new LispTest("(eq (prime-factors 30) '(2 3 5))", true),
		new LispTest("(eq (prime-factors 120) '(2 2 2 3 5))", true),
		new LispTest("(eq (prime-factors 1) '())", true),

		// ** OO **

		// new
		new LispTest("(setl r (new 'type)) true", true),

		// record?
		new LispTest("(setl r (new 'type))(record? r)", true),
		new LispTest("(record? '())", false),
		new LispTest("(record? '(not-a-record () ()))", false),
		new LispTest("(record? 5)", false),

		// with-values and get-value
		new LispTestThrows("(setl r (new 'type))(get-value r 'f1)"),
		new LispTestEq("(setl r (with-values (new 'type) '((f1 true))))(get-value r 'f1)", "'true"),
		new LispTestThrows("(setl r (with-values (new 'type) '((f1))))"),
		new LispTestThrows("(setl r (with-values (new 'type) '((f1 true extraArg))))"),
		new LispTestThrows("(setl r (with-values (new 'type) (quote ((17 true)))))"),
		new LispTestEq("(setl r (with-values (new 'type) '((f1 true))))(setl r (with-values r '((f1 false))))(get-value r (quote f1))", "'false"),
		new LispTestEq("(setl r (with-values (new 'type) '((f1 true))))(setl r (with-values r '((f2 false))))(get-value r 'f1)", "'true"),
		new LispTestEq("(setl r (with-values (new 'type) '((f1 true))))(setl r (with-values r '((f2 false))))(get-value r 'f2)", "'false"),

		// new with optional values param
		new LispTestEq("(setl r (new 'type '((f1 true)))) (get-value r 'f1)", "'true"),
		new LispTestEq("(setl r (new 'type '((f1 true)))) (record? r)", "true"),

		// get-type-name
		new LispTestEq("(setl r (new 'type))(get-type-name r)", "'type"),
		new LispTestEq("(get-type-name null)", 		 "'null"),
		new LispTestEq("(get-type-name (dict.new))", "'dict"),
		new LispTestEq("(get-type-name 17)", 		 "'number"),
		new LispTestEq("(get-type-name '())", 		 "'list"),
		new LispTestEq("(get-type-name 'hai)", 		 "'symbol"),
		new LispTestEq("(get-type-name true)", 		 "'bool"),
		new LispTestEq("(get-type-name do)", 		 "'macro"),
		new LispTestEq("(get-type-name quote)", 		 "'keyword"),
		new LispTestEq("(get-type-name eq)", 		 "'func"),
		new LispTestEq("(get-type-name hello)", 	 "'string"),

		// is-a
		new LispTestEq("(is-a 17 'number)", 		 "true"),
		new LispTestEq("(is-a (new 'type) 'type)", 	 "true"),

		// type-exists
		new LispTestEq("(type-exists 'number)", 	 "true"),
		new LispTestEq("(type-exists 'this-is-not-a-real-type-name)", 	 "false"),

		// type-of
		new LispTestEq("(setl t (type-of 17))(record? t)", 	 "true"),
		new LispTestEq("(setl t (type-of 17))(get-value t 'name)", 	 "'number"),

		// get-type
		new LispTestEq("(setl t (get-type 'number))(record? t)", 	 "true"),
		new LispTestEq("(setl t (get-type 'number))(get-value t 'name)", 	 "'number"),
		new LispTestThrows("(get-type 'this-is-not-a-type-name)"),

		// tryget-type
		new LispTestEq("(get-type 'number)", "(tryget-type 'number)"),
		new LispTestEq("(tryget-type 'this-is-not-a-type-name)", 	 "null"),
	
	]; // / lispTests

	function LispTest(lispStr, expectedResult) {
		function testFunc() {
			var result = runTestLispCode(lispStr);

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

	function LispTestEq(lispTestStr, lispExpectedResultStr) {
		function testFunc() {
			var lispStr =
				"(setl __testResult (do " + lispTestStr + "))" +
				"(setl __testExpected (do " + lispExpectedResultStr + "))" +
				"(setl __testPassed (eq __testResult __testExpected))" +
				"(list __testPassed __testResult __testExpected)";

			var resultLispExpr = runTestLispCode(lispStr);

			var resultArray = resultLispExpr.list;
			var testPassed = resultArray[0];

			if(!testPassed) {
				var result = resultArray[1];
				var expected = resultArray[2];

				throw new Error(
					"Result not eq to expected\r\n" +
					"    Expected: " + utils.nullableToString(expected) + "\r\n" +
					"    Actual:   " + utils.nullableToString(result));
			}
		}

		var description =
			"Lisp code '" + lispTestStr +
			"' should return something that eq '" + lispExpectedResultStr + "'";

		return new jstest.Test(testFunc, description);
	}

	function LispTestThrows(lispStr, expectedResult) {
		function testFunc() {
			var result;
			try {
				result = runTestLispCode(lispStr);
			}
			catch(ex) {
				logger.debug("Code threw as expected; ex: \r\n" + jsrepl.pp.prettyPrint(ex));
				return;
			}

			throw new Error("Lisp code did not throw as expected; returned '" + result + "'.");
		}

		var description =
			"Lisp code '" + lispStr +
			"' should throw.";

		return new jstest.Test(testFunc, description);
	}

	function runTestLispCode(lispStr) {
		logger.debug("Running test lisp code '" + lispStr + "'");
	
		if(/setg/.test(lispStr)) {
			throw new Error("Cannot run this test lisp code that will modify global state by using 'setg'. This is to allow optimisation by re-using LispEvaluators.\r\nOffending code: '" + lispStr + "'.");
		}

		result = evaluator.readEval(lispStr);
		logger.debug("Result: '" + result + "'");
		return result;
	}

	beginRunTests();
};

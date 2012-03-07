
var jsrepl = jsrepl || {};
jsrepl.lisp = jsrepl.lisp || {};

jsrepl.lisp.runTests = function() {
	var lispTests = [
		new LispTest("(setl si (func (x) (if (= x 1) 1 (+ x (si (- x 1)))  ))) (si 20)", 210),
	
		// Parsing basic values
		new LispTest("hello", "world!"),
		new LispTest("true",  true),
		new LispTest("false", false),
		new LispTest("5", 5),

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
			assertEqual(
				result,
				expectedResult,
				"Incorrect LispTest result.");
		}

		var description =
			"Lisp code '" + lispStr +
			"' should return '" + expectedResult + "'";

		return new Test(testFunc, description);
	}

	function Test(testFunc, testDescription) {
		this.func = testFunc;
		this.description = testDescription;
		this.toString = function() {
			return "Test: '" + testDescription + "'";
		}
	}

	function assertEqual(
		actualValue,
		expectedValue,
		customErrorMessage) {
		
		if(actualValue !== expectedValue) {
			errorMessage =
				customErrorMessage + "\n" +
				"    Expected: '" + expectedValue + "' \n" +
				"    Actual: '" + actualValue + "' \n";
			throw new Error(errorMessage);
		}
	}

	var logger = ioc.createLogger("lisp.tests").withDebug(false);

	function runTests(tests) {
		
		var testResults =
			utils.map(
				tests,
				runTest);
		
		printTotals(testResults);
	}

	function runTest(test) {
		utils.assertType("test", test, "Test");
		var testException = null;
		
		try {
			test.func();
			logger.debug("Test passed.");
		}
		catch (ex) {
			logger.debug("Test failed");
			testException = ex;
		}

		var testResult = new TestResult(
			test,
			testException);

		logger.debug("testResult.passed = '" + testResult.passed + "'.");

		if(testResult.passed === false) {
			printTestError(testResult);
		}

		return testResult;
	}

	function TestResult(test, exception) {
		utils.assertType("test", test, "Test");
		
		this.test = test;
		this.passed = (exception === null);
		this.exception = exception;
	}
	
	function printTestError(testResult) {
		var message =
			"Test failed.\n" +
			testResult.test.toString() + "\n" +
			getExceptionString(testResult.exception);

		logger.info(message);
	}

	function getExceptionString(ex) {
		if(ex.toString) {
			return ex.toString();
		}
		else {
			return "" + ex;
		}
	}

	function printTotals(testResults) {
		var passed = 0;
		var failed = 0;

		utils.each(
			testResults,
			function(testResult) {
				if(testResult.passed) {
					passed += 1;
				}
				else {
					failed += 1;
				}
			});

		logger.info("Tests passed: " + passed);
		logger.info("Tests failed: " + failed);
	}

	runTests(lispTests);
}

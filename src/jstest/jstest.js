var jstest = function() {
	
	var pub = {};
	
	var logger = ioc.createLogger("jstest").withDebug(false);
	
	pub.Test = function Test(testFunc, testDescription) {
		this.func = testFunc;
		this.description = testDescription;
		this.toString = function() {
			return "Test: '" + testDescription + "'";
		}
	}

	pub.runTests = function(tests) {
		logger.info("Running " + tests.length + " tests...");

		function doIt() {
			var timeResult = utils.time(
				function() {
					return utils.map(
							tests,
							runTest);
				});

			var testResults = timeResult.result;
			
			printSlowTestsReport(testResults);

			logger.info("");
			logger.info("All tests finished in " + (timeResult.timeMs / 1000).toString() + "s.");
			printTotals(testResults);
		}

		// Run the tests in a timeout callback, so the
		// "Running *$# tests..." line is displayed before
		// the tests are started and the browser blocked by
		// JavaScript processing.
		setTimeout(doIt, 0);
	}

	function runTest(test) {
		utils.assertType("test", test, "Test");
		logger.debug("Running test '" + test.description + "'.");

		var testException = null;
		
		var timeResult = utils.time(
			function() {
				try {
					test.func();
					logger.debug("Test passed.");
				}
				catch (ex) {
					logger.debug("Test failed");
					testException = ex;
				}
			});

		var testResult = new TestResult(
			test,
			testException,
			timeResult.timeMs);

		logger.debug("Test finished in " + utils.msToTimeString(timeResult.timeMs) + ".");
		logger.debug("testResult.passed = '" + testResult.passed + "'.");

		if(testResult.passed === false) {
			printTestError(testResult);
		}

		return testResult;
	}

	function TestResult(test, exception, timeMs) {
		utils.assertType("test", test, "Test");
		
		this.test = test;
		this.passed = (exception === null);
		this.exception = exception;
		this.timeMs = timeMs;
	}
	
	function printTestError(testResult) {
		var message =
			"Test failed.\n" +
			testResult.test.toString() + "\n" +
			getExceptionString(testResult.exception);

		logger.info(message);
	}

	function getExceptionString(ex) {
		return jsrepl.pp.prettyPrint(ex);
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
	function printSlowTestsReport(testResults) {
		var resultsSlowestFirst =
			testResults.slice(0).sort(
				function (resultA, resultB) {
					// If A took longer we return a negative
					// number, indicating resultA < resultB
					// for the sort, hence resultA comes
					// first in the result.
					return resultB.timeMs - resultA.timeMs;
				});

		printNSlowestTests(resultsSlowestFirst, 10);
		printSlowTestsHistogram(resultsSlowestFirst);
	}
	
	function printNSlowestTests(
		resultsSlowestFirst, maxSlowTests) {

		logger.info(maxSlowTests + " slowest tests:");

		for(var ixResult = 0,
		       len = Math.min(maxSlowTests, resultsSlowestFirst.length);
			ixResult < len;
			ixResult++) {

			var result = resultsSlowestFirst[ixResult];
			logger.info(
				utils.msToTimeString(result.timeMs) + " : '" +
				result.test.description + "'");
		}
	}

	function printSlowTestsHistogram(resultsSlowestFirst) {

	}

	pub.assertEqual = function(
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

	return pub;
}();

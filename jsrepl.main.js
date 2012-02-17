// Required : "jsrepl.pp.js"
// Required : "jsrepl.cmdhist.js"

var jsrepl = jsrepl || {};

jsrepl.main = function() {
	var logKeys = false;
	var registerKeyLogHandlers = true;
	
	// ** Event handlers **

	function onLoad() {
		withErrorLogger( function() {
			evalBtn.addEventListener("click", evalBtn_onClick);
			
			inputBox.addEventListener("keypress", inputBox_onKeyPress);

			if(registerKeyLogHandlers){
				
				inputBox.addEventListener("keydown",  keyEventLogger);
				inputBox.addEventListener("keypress", keyEventLogger);
				inputBox.addEventListener("keyup",    keyEventLogger);
			}

			addOutput("onLoad done");
		});
	}

	function evalBtn_onClick() {
		var inputBox = document.getElementById("inputBox");
		var input = inputBox.value;

		addOutput("");
		addOutput(" > " + input);

		var outputString;

		withErrorLogger( function() {
			jsrepl.cmdhist.pushHistoryCommand(input);
		
			inputBox.value = "";

			var output = eval(input);
			var outputString = jsrepl.pp.prettyPrint(output);
			addOutput(outputString);
			
			jsrepl.cmdhist.resetHistoryIndex();
		});

		return false;
	}

	lastKeyWasEscapeKey = false;

	escapeKeyCode = 35; // '#'
	
	escapedKeyMapping = {
		35:   '#', // was '#' -- for escape key
		107:  '[', // was 'k'
		108:  ']', // was 'l'
		110:  '{', // was 'n'
		109:  '}', // was 'm'
		163:  '<', // was pound sign  = symshift+n
		8364: '>', // was euro symbol = symshift+m

		42:   function(){ scrollInputBoxHistory(+1); }, // was '*'
		54:   function(){ scrollInputBoxHistory(-1); }  // was '6'
	};

	function inputBox_onKeyPress(event) {
		var isEnter = event.charCode == 13;
		var isEscapeKey = event.charCode == escapeKeyCode;

		if(isEnter) {
			evalBtn.click();
			// inputBox.value = "";
			event.returnValue = false;
			return;
		}
		else if(lastKeyWasEscapeKey){
			var newChar =
				escapedKeyMapping[event.charCode];

			if(typeof(newChar) === 'string') {
				inputBox.value += newChar;
			}
			else if(typeof(newChar) === 'function') {
				newChar();
			}

			lastKeyWasEscapeKey = false;
			event.returnValue = false;

			return;
		}
		else if(isEscapeKey) {
			lastKeyWasEscapeKey = true;
			
			event.returnValue = false;
			
			return;
		}
		else {
			return;
		}
	}

	function scrollInputBoxHistory(historyOffset) {
		var historyCommand = jsrepl.cmdhist.scrollHistory(historyOffset);
		inputBox.value = historyCommand;
	}

	function keyEventLogger(event) {
		withErrorLogger( function() {
			if(!logKeys) {
				return;
			}

			var loggedProperties = {
				charCode	 : event.charCode,
				keyCode		 : event.keyCode,
				which		 : event.which,
				type		 : event.type,
				altGraphKey	 : event.altGraphKey,
				altKey		 : event.altKey,
				ctrlKey		 : event.ctrlKey,
				metaKey		 : event.metaKey,
				shiftKey	 : event.shiftKey
			}

			addOutput(jsrepl.pp.prettyPrint(loggedProperties));
		});
	}

	// ** Error handling **

	function withErrorLogger(fn) {
		try {
			var output = fn();
			return output;
		}
		catch(ex) {
			var errString = "An exception occurred. It has been saved in __err\n" + ex.toString()
			addOutput(errString);
			__err = ex;

			throw "Terminating the call stack."
		}
	}

	// ** Utilities **

	function showCharCodes(str) {
		var ret = {};
		
		for(ixChar = 0; ixChar < str.length; ixChar++) {
			var charStr = str[ixChar];
			var charCode = charStr.charCodeAt(0);
			ret[charStr] = charCode;
		}

		return ret;
	}
	
	// ** Output view **
	
	var outputMaxChars = 30000

	function addOutput(strOutput) {
		var newOutput = strOutput + "\n" + getOutput();
		setOutput(newOutput);
	}

	function getOutput() {
		var outDiv = document.getElementById("output");
		return outDiv.innerText;
	}

	function setOutput(strOutput) {
		var outDiv = document.getElementById("output");
		outDiv.innerText = strOutput.substring(0, outputMaxChars);
	}
	
	var pub = {
		onLoad 		: onLoad,
		addOutput 	: addOutput,
	};

	return pub;
}();

// Required : "jsrepl.pp.js"
// Required : "jsrepl.cmdhist.js"
// Required : "jsrepl.err.js"

var jsrepl = jsrepl || {};

jsrepl.main = function() {
	var logKeys = false;
	var registerKeyLogHandlers = true;
	
	var _withErrorHandler =
		function() {
			var errorHandler = new jsrepl.err.ErrorHandler(addOutput);
			return function(fn) {
				return errorHandler.withErrorHandler(fn);
			};
		}();

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

	// ** Event handlers **

	function onLoad() {
		_withErrorHandler( function() {
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
		addOutput("> " + input);

		var outputString;

		_withErrorHandler( function() {
			jsrepl.cmdhist.pushHistoryCommand(input);
		
			inputBox.value = "";
			jsrepl.cmdhist.resetHistoryIndex();

			var output = eval(input);
			var outputString = jsrepl.pp.prettyPrint(output);
			addOutput(outputString);
		});

		return false;
	}

	// ** Key constants **
	var escapeKeyCode = 35; // '#'
	
	var escapedKeyMapping = {
		35:   '#', 	// was '#' -- for escape key
		107:  '[', 	// was 'k'
		108:  ']', 	// was 'l'
		110:  '{', 	// was 'n'
		109:  '}', 	// was 'm'
		122:  "\\",	// was 'z'
		163:  '<', 	// was pound sign  = symshift+n
		8364: '>', 	// was euro symbol = symshift+m

		42:   function(){ scrollInputBoxHistory(+1); }, // was '*'
		54:   function(){ scrollInputBoxHistory(-1); }  // was '6'
	};
	
	// ** / Key constants **

	// ** Key state
	var lastKeyWasEscapeKey = false;
	var lastSelectionRange = null;
	
	function inputBox_onKeyPress(event) {
		var isEnter = event.charCode == 13;
		var isEscapeKey = event.charCode == escapeKeyCode;

		if(isEnter) {
			evalBtn.click();
			event.returnValue = false;
		}
		else if(lastKeyWasEscapeKey){
			restoreLastSelectionRange();

			var newChar =
				escapedKeyMapping[event.charCode];

			if(typeof(newChar) === 'string') {
				insertTextBoxString(inputBox, newChar);
			}
			else if(typeof(newChar) === 'function') {
				newChar();
			}

			lastKeyWasEscapeKey = false;
			event.returnValue = false;
		}
		else if(isEscapeKey) {
			lastKeyWasEscapeKey = true;

			event.returnValue = false;
		}
		else
		{}

		setLastSelectionRange();
	}

	function setLastSelectionRange() {
		lastSelectionRange =
			{
				selectionStart	: inputBox.selectionStart,
				selectionEnd	: inputBox.selectionEnd
			};
	}
	
	function restoreLastSelectionRange() {
		inputBox.setSelectionRange(
			lastSelectionRange.selectionStart,
			lastSelectionRange.selectionEnd);
	}

	function scrollInputBoxHistory(historyOffset) {
		var historyCommand = jsrepl.cmdhist.scrollHistory(historyOffset);
		inputBox.value = historyCommand;
		setTextBoxSelectionToEnd(inputBox);
	}

	function insertTextBoxString(textBox, str) {
		var oldValue = textBox.value;
		var newValue =
			oldValue.substring(0, textBox.selectionStart) +
			str +
			oldValue.substring(textBox.selectionEnd, oldValue.length);
		var newSelectionIndex =
			textBox.selectionStart +
			str.length - 1;

		textBox.value = newValue;
		textBox.setSelectionRange(
			newSelectionIndex,
			newSelectionIndex);
	}

	function setTextBoxSelectionToEnd(textBox) {
		var selIndex = textBox.value.length;
		textBox.setSelectionRange(selIndex, selIndex);
	}

	function keyEventLogger(event) {
		_withErrorHandler( function() {
			if(!logKeys) {
				return;
			}

			var loggedProperties = {
				charCode	 	: event.charCode,
				keyCode		 	: event.keyCode,
				which		 	: event.which,
				type		 	: event.type,
				altGraphKey	 	: event.altGraphKey,
				altKey		 	: event.altKey,
				ctrlKey		 	: event.ctrlKey,
				metaKey		 	: event.metaKey,
				shiftKey	 	: event.shiftKey,

				selectionStart 	: inputBox.selectionStart,
				selectionEnd	: inputBox.selectionEnd,
				textBoxValue	: inputBox.value
			}
			addOutput(jsrepl.pp.prettyPrint(loggedProperties));
		});
	}

	function addCustomBtn(clickHandler, btnText) {
		if(!btnText) {
			btnText = "Do it!";
		}

		var clickHandlerFn = null;

		if(typeof(clickHandler) === "string") {
			clickHandlerFn = function () {
					return eval(clickHandler);
				};
		}
		else if(typeof(clickHandler) === "function") {
			clickHandlerFn = clickHandler;
		}
		else {
			assertParameterType('clickHandler', clickHandler);
		}

		var wrappedClickHandler = function() {
			_withErrorHandler(
				function() {
					jsrepl.main.addOutput(
						jsrepl.pp.prettyPrint(
							clickHandlerFn()));
				});
			return false;
		};


		var btn = document.createElement('input');
		btn.type = 'submit';
		btn.value = btnText;
		btn.addEventListener(
			'click',
			wrappedClickHandler);

		customButtons.appendChild(btn);
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
	
	var pub = {
		onLoad 				: onLoad,
		addOutput 			: addOutput,
		addCustomBtn		: addCustomBtn,
		withErrorHandler 	: _withErrorHandler
	};

	return pub;
}();

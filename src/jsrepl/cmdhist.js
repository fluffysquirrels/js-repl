// ** Command history store and scroll logic **
//
var jsrepl = jsrepl || {};

jsrepl.cmdhist = function() {
	var currentHistoryIndex = 0;
	var historyCommands = [];

	function scrollHistory(historyOffset) {
		var newHistoryIndex =
			currentHistoryIndex + historyOffset;

		if(newHistoryIndex < 0) {
			newHistoryIndex = 0;
		}
		else if(newHistoryIndex >= historyCommands.length) {
			newHistoryIndex = historyCommands.length -1;
		}

		currentHistoryIndex = newHistoryIndex;

		var historyCommand =
			historyCommands[currentHistoryIndex];

		if(	historyCommand === undefined ||
			historyCommand === null) {
			historyCommand = "";
		}

		return historyCommand;
	}

	function resetHistoryIndex() {
		currentHistoryIndex =
			historyCommands.length;
	}

	function pushHistoryCommand(commandStr) {
		historyCommands.push(commandStr);		
	}

	var pub = {
		scrollHistory      : scrollHistory,
		resetHistoryIndex  : resetHistoryIndex,
		pushHistoryCommand : pushHistoryCommand
	};

	return pub;
}();

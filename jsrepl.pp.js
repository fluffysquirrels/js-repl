// ** JavaScript object pretty printer **

var jsrepl = jsrepl || {};

jsrepl.pp = function() {
	var indent = "    ";
	var propValueMaxChars = 400
	function prettyPrint(obj) {
		return prettyPrintInternal(obj, "< " + indent, 0)
	}

	function prettyPrintInternal(obj, linePrefix, recDepthLeft) {
		var objTypeStr = utils.getTypeOf(obj);
		
		var strOutput = linePrefix + "'" + obj + "' is " + objTypeStr;

		if(	objTypeStr === "string"  ||
			objTypeStr === "number"  ||
			objTypeStr === "boolean" ||
			objTypeStr === "undefined") {
			
			// No more output required for these
			// primitive types.
		}
		else {
			strOutput += "\n" + linePrefix + " = { \n";
	
			propertyKeysArray = getObjectPropertyKeysArray(obj);

			for(var ixPropKey = 0; ixPropKey < propertyKeysArray.length; ixPropKey++) {
				
				var propKey = propertyKeysArray[ixPropKey];
				
				var propValue;
				
				try {
					propValue = obj[propKey];
				}
				catch(ex) {
					propValue = ex;
				}

				if(recDepthLeft <= 0) {
					strOutput += linePrefix + indent + "'" + propKey + "' = '" + asString(propValue).substring(0, propValueMaxChars).replace(/\n/g, "\n" + linePrefix + indent + indent) + "' is " + utils.getTypeOf(propValue) + "\n";
				}
				else {
					strOutput += linePrefix + indent + propKey + " = \n" + prettyPrintInternal(propValue, linePrefix + indent + indent, recDepthLeft - 1);
				}
			}

			strOutput += linePrefix + "}";
		}

		return strOutput;
	}

	function asString(obj) {
		return "" + obj;
	}

	function getObjectPropertyKeysArray(obj) {
		var keys = new Array;

		for(propKey in obj) {
			keys.push(propKey);
		}

		keys.sort();

		return keys;
	}

	var pub = {
			prettyPrint: prettyPrint
		};
	return pub;
}();

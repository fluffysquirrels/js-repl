utils = function(){
	var pub = {};
	
	pub.getTypeOf = function(obj) {
		var badTypeOf = typeof(obj);

		if(badTypeOf !== 'object') {
			return badTypeOf;
		}

		// typeof operator only told us obj was an
		// object. Return 'null' or the name of the object's 
		// constructor, which may tell more.
		if(obj === null) {
			return 'null';
		}

		return obj.constructor.name;
	};

	pub.isArray = function(obj) {
		return pub.getTypeOf(obj) === 'Array';
	};

	pub.each = function(arr, func) {
		var	ret = pub.map(arr, func);
		return;
	};

	pub.map = function(arr, func) {
		var ret = [];
		
		for(var ix = 0, arrLen = arr.length; ix < arrLen; ix++){
			var elt = arr[ix];
			var outFromElt = func(elt, ix);
			ret.push(outFromElt);
		}

		return ret;
	};

	pub.join = function(separator, arr) {
		var strings =
			pub.map(
				arr,
				function(elt){ return "" + elt; });
		
		var ret = "";

		pub.each(strings, function(elt, ix) {
			if(ix !== 0) {
				ret += separator;
			}

			ret += elt;
		});

		return ret;
	};

	pub.cloneArray = function(arr) {
		var ret = [];

		pub.each(arr, function(elt) {
			ret.push(elt);
		});

		return ret;
	};

	pub.assertType = function(name, value, expectedType) {
		var actualType = pub.getTypeOf(value);

		if(!expectedType) {
			throw "Variable '" + name + "' was '" + value + "', of unexpected type " + actualType;
		}

		if(actualType !== expectedType) {
			throw "Expected variable '" + name + "' to be of type " + expectedType + ", but it was '" + value + "', of type " + actualType;
		}
	}

	pub.isIntegerString = function(str) {
		return /^[0-9]+$/.test(str);
	};

	return pub;
}();

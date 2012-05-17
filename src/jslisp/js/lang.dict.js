var jslisp = jslisp || {};
jslisp.lang = jslisp.lang || {};

(function() {

	jslisp.lang.Dict = jslisp.lang.Dict || function Dict() {};

	var _dictType = jslisp.lang.Dict;
	
	_dictType.fromExpression =
	function(expr) {
		var ret = new _dictType();

		expr.list.forEach(
			function(clause) {
				var key = clause.list[0].name;
				var value = clause.list[1];

				ret.set(key, value);
			});

		return ret;
	};

	_dictType.isA =
	function(obj) {
		return 	typeof(obj) === "object" &&
				Object.getPrototypeOf(obj) ===
					_dictType.prototype;
	};

	var _internalKeyPrefix = "__data_";
	var _internalKeyPrefixLength = _internalKeyPrefix.length;

	function getInternalKey(key) {
		return _internalKeyPrefix + key;
	};
	
	_dictType.prototype.hasKey =
	function(keyString) {
		var internalKey = getInternalKey(keyString);
		return this.hasOwnProperty(internalKey);
	};

	_dictType.prototype.keys =
	function() {
		var propertyNames = Object.getOwnPropertyNames(this);

		return propertyNames.map(
			function(internalKey) {
				return internalKey.substring(_internalKeyPrefixLength);
			});
	};

	_dictType.prototype.get =
	function(keyString) {
		var internalKey = getInternalKey(keyString);
		var value = this[internalKey];

		if(	value === undefined &&
			!this.hasOwnProperty(internalKey)) {
			throw new Error(
				"Key not found: '" + keyString + "'.");
		}

		return this[internalKey];
	};

	_dictType.prototype.tryGet =
	function(keyString) {
		var internalKey = getInternalKey(keyString);
		var value = this[internalKey];

		return this[internalKey];
	};

	_dictType.prototype.set =
	function(keyString, value) {
		var internalKey = getInternalKey(keyString);
		this[internalKey] = value;
	};

	_dictType.prototype.withValue =
	function(keyString, value) {
		var ret = this.clone();
		ret.set(keyString, value);
		return ret;
	};

	_dictType.prototype.withValueExpressions =
	function(pairsExpr) {
		var ret = this.clone();
		var pairsArray = pairsExpr.list;

		pairsArray.forEach(
			function(pairExpr) {
				var pair = pairExpr.list;
				var keyString = pair[0].name;
				var value = pair[1];

				ret.set(keyString, value);
			});

		return ret;
	};

	// Shallow copy. All properties directly on a Dict object
	// are the values in the dict, so we just copy all of those.
	_dictType.prototype.clone =
	function() {
		var ret = new _dictType();
		var propertyNames = Object.keys(this);

		propertyNames.forEach(
			function(propertyName) {
				ret[propertyName] = this[propertyName];
			});

		return ret;
	}
})();

module.exports = {
	// bind some shit to some other shit.
	bind : function (fn, context) { return Function.prototype.bind.apply(fn, Array.prototype.slice.call(arguments, 1)); },
	// The amazing underscore extend Method;
	extend : function (obj) {
		Array.prototype.slice.call(arguments, 1).forEach(function(source) {
			for (var prop in source) { obj[prop] = source[prop]; }
		});
		return obj;
	},
	objectLength : function (object) {
		var len = object.length ? --this.length : 0;
			for (var k in object)
				len++;
		return len;
	},
	typeOf : function (value) {
		var s = typeof value;
		if (s === 'object') {
			if (value) {
				if (value instanceof Array) {
					s = 'array';
				}
			} else {
				s = 'null';
			}
		}
		return s;
	}
}

module.exports = {
	// bind some shit to some other shit.
	bind : function (fn, context) { return Function.prototype.bind.apply(fn, Array.prototype.slice.call(arguments, 1)); },
	// The amazing underscore extend Method;
 	extend : function (obj) {
		Array.prototype.slice.call(arguments, 1).forEach(function(source) {
			for (var prop in source) { obj[prop] = source[prop]; }
		});
		return obj;
	}
}
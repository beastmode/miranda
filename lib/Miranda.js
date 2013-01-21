var Utils = require("./Utils")
	, db = require('ninjazord');


function Miranda(initialPermissions) {
	var dblWildcard = this.pattern(this.wildcard, this.wildcard);
	this.exists(dblWildcard, function(exists){
		if (exists) { this._doubleWildCardExists = true; }
	});

	return this;
}

Utils.extend(Miranda.prototype, {
	separator : '.',
	prefix : 'permissions' + '.',
	wildcard : '*',
	_doubleWildCardExists : false,
	actions : {
		'*' : true,
		'create' : true,
		'read' : true,
		'update' : true,
		'delete' : true
	},
	get : function (user, resource, action, callback) {
		callback || (callback === function(){})

		this.match(user, resource, function (pattern) {
			if (!pattern) return callback(false);
			db.getHash(pattern, function(permission){
				if (!permission) { return callback(false); }
				if (permission[action] || permission['*'] === true) { 
					callback(true);
				} else {
					callback(false);
				}
			});
		});
	},
	set : function (user, resource, actions, callback) {
		callback || (callback === function(){})
		if (typeof actions !== 'object') { return callback(false); }
		
		if(this.invalid(actions)){ return 'invalid action: ' + this.invalid(actions); }
		db.setHash( this.pattern(user, resource), actions, callback);
	},
	invalid : function (actions) {
		for (var action in actions) {
			if (!this.actions[action]) { return action; }
		}
		return false;
	},
	pattern : function (user, resource) {
		return this.prefix + user + this.separator + resource;
	},
	match : function (user, resource, callback) {
		// 1. [user].[resource]
		var pattern = this.pattern(user, resource);
		this.exists(pattern, function(exists){
			if (exists) { callback(pattern); }
			else {
				// 2. *.[resource]
				pattern = this.pattern(this.wildcard,resource);
				this.exists(pattern, function(exists){
					if (exists) { callback(pattern); }
					else {
						// 3. [user].*
						pattern = this.pattern(user, this.wildcard);
						this.exists(pattern, function(exists){
							if (exists) { callback(pattern); }
							// 4. *.*
							else if (this._doubleWildCardExists) {
								callback( this.pattern(this.wildcard, this.wildcard) );
							} else {
								callback(false);
							}
						});
					}
				});
			}
		});
	},
	exists : function (pattern, callback) {
		db.exists(pattern, Utils.bind(callback, this));
	}
 });

module.exports = new Miranda();
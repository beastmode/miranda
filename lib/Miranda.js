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
		'create' : true,
		'read' : true,
		'update' : true,
		'delete' : true
	},
	// takes wildcard & stores is as plain actions
	conformWildcard : function (actions) {
		if (actions[this.wildcard] === false)
			return { create : false, read : false, update : false, delete : false };
		else if (actions[this.wildcard] === true)
			return this.actions;
		else
			return actions;
	},
	get : function (user, resource, action, callback) {
		// support providing an object for resource in format : { name : 'resource' }
		// will return the permissions object for each listed resource in the specifified 'name'
		if (Utils.typeOf(resource) === 'object') {
			var permissionsObject = {}
				, count = Utils.objectLength(resource);
			callback = action;
			for (var name in resource) {
				this._getNamedObject(user, resource[name], name, function(name, permissions){
					permissionsObject[name] = permissions;
					if (--count === 0) callback(permissionsObject);
				});
			}
		} else {
			// standard use
			this._get(user,resource,action,callback);
		}
	},
	// Interal Get Method.
	_get : function (user, resource, action, callback) {
		// support 'get' with just the user & resource returning
		// the access list.
		if (typeof action === 'function'){ callback = action; action = undefined;}

		callback || (callback === function(){});

		this.match(user, resource, function (pattern) {
			// if there's no pattern we have no matching record aka, no permissions.
			if (!pattern) return action ? callback(false) : callback({});

			db.getHash(pattern, function(permission){
				if (!action) {
					// if action isn't defined assume we want the permissions
					// object
					if (!permission) { return callback({}); }
					callback(permission);
				} else {
					// otherwise we want a true/false answer on the action
					// in question.
					if (!permission) { return callback(false); }
					if (permission[action] || permission['*'] === true) {
						callback(true);
					} else if (action === '*') {
						// support asking for wildcard permissions
						if (permission.create && permission.read && permission.update && permission.delete) callback(true);
						else callback(false);
					} else {
						callback(false);
					}
				}
			});
		});
	},
	_getNamedObject : function (user, resource, name, callback) {
		this._get(user, resource, function(permissions){
			callback(name, permissions);
		});
	},
	set : function (user, resource, actions, callback) {
		var self = this
			, count;
		// support providing an array of set arguments
		if (typeof arguments[0] === 'object' && arguments[0].length) {
			callback = (typeof arguments[1] === 'function') ? arguments[1] : function(){};
			count = arguments[0].length;
			arguments[0].forEach(function(args){
				self._set(args[0],args[1],args[2], function(){
					if (--count === 0) callback();
				});
			});
		} else {
			// or just a plain 'ol set command.
			callback || (callback = function(){})
			if (typeof actions !== 'object') { return callback(false); }
			this._set(user,resource,actions,callback);
		}
	},
	// internal set called by both array and single versions of 'set'.
	_set : function (user, resource, actions, callback) {
		actions = this.conformWildcard(actions);

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
				// 2. [user].*
				pattern = this.pattern(user, this.wildcard);
				this.exists(pattern, function(exists){
					if (exists) { callback(pattern); }
					else {
						// 3. *.[resource]
						pattern = this.pattern(this.wildcard, resource);
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
	},
	httpMethods : {
		get : 'read',
		post : 'create',
		put : 'update',
		delete : 'delete',
		del : 'delete'
	},
	mapMethod : function (method) {
		if (Miranda.httpMethods[method]) return Miranda.httpMethods[method];
		else return false;
	},
 });

module.exports = new Miranda();
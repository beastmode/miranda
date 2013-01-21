var Utils = require('./Utils')
	, Miranda = require('./Miranda');

Utils.extend(Miranda, {
	methods : {
		get : 'read',
		post : 'create',
		put : 'update',
		delete : 'delete',
		del : 'delete'
	},
	mapMethod : function (method) {
		if (Miranda.methods[method]) return Miranda.methods[method];
		else return false;
	},
	resource : function (req, resource, callback) {
		var action = Miranda.mapMethod(req.route.method)
			, user;
		if (!action){
			req.error('invalid req method: ' + req.route.method);
			return callback(false);
		}
		else {
			if (!req.user) user = { id : 'no-auth' };
			if (!user.id) {
				req.error('could not find user id to check permissions against');
				return callback(false);
			}
			Miranda.get(user.id, resource, callback);
		}
	}
});

module.exports = Miranda;
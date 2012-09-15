var restify = require('restify');

module.exports = exports = function(params) {
	var generateUuid = params.generateUuid,
		Account = params.Account;
	return {
		createAccount : function (req, res, next) {
			var account = new Account,
				guid = generateUuid();
			account.guid = req.params.id || guid;
			account.account_type = req.params.account_type;
			account.parent_guid = req.params.parent_guid;
			account.name = req.params.name;
			account.description = req.params.description;
			account.save(function(err) {
				if(err)
					return next(err);
				res.send(account);
				return next();
			});
		},
	
		respondAccount : function (req, res, next) {
			Account.findOne({ guid : req.params.id }, function(err, account) {
				if(err || account == null)
					return next(new restify.InvalidArgumentError("No such account"));
				res.json(account);
				return next();
			});
		},

		respondAccounts : function (req, res, next) {
			Account.find(function(err, account) {
				res.json(account);
			});
		},
		
		deleteAccount : function (req, res, next) {
			Account.findOneAndRemove({ guid : req.params.id }, function(err, account) {
				if(err || account == null)
					return next(new restify.InvalidArgumentError("No such account"));
				res.json(account);
				return next();
			});
		}
		
	};
};
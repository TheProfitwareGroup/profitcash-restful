var restify = require('restify');

module.exports = exports = function(params) {
	var generateUuid = params.generateUuid, 
		Currency = params.Currency,
		Account = params.Account,
		Transaction = params.Transaction;
	return {
		createTransaction : function(req, res, next) {
			var transaction = new Transaction,
				guid = generateUuid();
			transaction.guid = req.params.id || guid;
			transaction.enter_date = new Date;
			transaction.post_date = req.params.date || new Date;
			transaction.description = req.params.description;
			if(!req.params.value_num)
				return next(new restify.InvalidArgumentError("Money value is required"));
			Currency.findOne({ mnemonic : req.params.currency }, function(err, currency) {
				if(err || currency == null)
					return next(new restify.InvalidArgumentError("No such currency"));
				transaction.currency_guid = currency.guid;
				Account.findOne({ guid : req.params.acc_from }, function(err, acc_from) {
					if(err || acc_from == null)
						return next(new restify.InvalidArgumentError("No such debit account"));
					Account.findOne({ guid : req.params.acc_to }, function(err, acc_to) {
						if(err || acc_to == null)
							return next(new restify.InvalidArgumentError("No such credit account"));
						transaction.splits.push({ 
							account_guid : acc_from.guid,
							value_num : -req.params.value_num * currency.fraction,
							value_denom : currency.fraction,
							quantity_num : -req.params.value_num * currency.fraction,
							quantity_denom : currency.fraction						
						});
						transaction.splits.push({ 
							account_guid : acc_to.guid,
							value_num : req.params.value_num * currency.fraction,
							value_denom : currency.fraction,
							quantity_num : req.params.value_num * currency.fraction,
							quantity_denom : currency.fraction						
						});
						transaction.save(function(err) {
							if(err)
								return next(err);
							res.send(transaction);
							return next();
						});
					});
				});
			});
		},
		
		respondTransactions : function (req, res, next) {
			Transaction.find(function(err, transactions) {
				res.json(transactions);
				return next();
			});
		},
		
		respondTransaction : function (req, res, next) {
			Transaction.findOne({ guid : req.params.id }, function(err, transactions) {
				if(err || transactions == null)
					return next(new restify.InvalidArgumentError("No such transaction"));
				res.json(transactions[0]);
				return next();
			});
		},
		
		deleteTransaction : function(req, res, next) {
			Transaction.findOneAndRemove({ guid : req.params.id }, function(err, transactions) {
				if(err || transactions == null)
					return next(new restify.InvalidArgumentError("No such transaction"));
				res.json(204, transactions[0]);
				return next();
			});
		}
	};
};
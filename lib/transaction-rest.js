var restify = require('restify');

module.exports = exports = function(generateUuid, Currency, Account, Transaction) {
	return {
		createTransaction : function(req, res, next) {
			var transaction = new Transaction,
				guid = generateUuid();
			transaction.guid = guid;
			transaction.enter_date = new Date;
			transaction.post_date = req.params.date;
			transaction.description = req.params.description;
			Currency.find({ mnemonic : req.params.currency }, function(err, currency) {
				transaction.currency_guid = currency.guid;
				Account.find({ guid : req.params.acc_from }, function(err, acc_from) {
					Account.find({ guid : req.params.acc_to }, function(err, acc_to) {
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
						transaction.save(next);
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
		}
	};
};
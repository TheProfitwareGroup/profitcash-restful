var restify = require('restify'),
	mongoose = require('mongoose'),
	uuid = require('node-uuid'),
	schemas = require('../lib/schemas.js'),
	db = mongoose.createConnection((process.env.MONGOHQ_URL || 'mongodb://localhost/profitcash'));

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	var Currency = db.model('currencies', schemas.commoditySchema),
		Account = db.model('accounts', schemas.accountSchema),
		Transaction = db.model('transactions', schemas.transactionSchema);
	
	function generateUuid() {
		return uuid.v4();
	}
	
	function createTransaction(req, res, next) {
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
	}

	function respondTransactions(req, res, next) {
		Transaction.find(function(err, transactions) {
			res.json(transactions);
			return next();
		});
	}
	
	function respondTransaction(req, res, next) {
		Transaction.find({ guid : req.params.id }, function(err, transactions) {
			res.json(transactions);
			return next();
		});
	}
	
	var server = restify.createServer();
	server.post('/transaction', createTransaction);
	server.get('/transaction', respondTransactions);
	server.get('/transaction/:id', respondTransaction);
	server.head('/transaction/:id', respondTransaction);
	
	server.listen((process.env.PORT || 8080), function() {
		console.log('%s listening at %s', server.name, server.url);
	});
});

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
	
	var CurrencyREST = require('../lib/REST/currency.js')(uuid.v4, Currency),
		AccountREST = require('../lib/REST/account.js')(uuid.v4, Account),
		TransactionREST = require('../lib/REST/transaction.js')(uuid.v4, Currency, Account, Transaction);

	var server = restify.createServer();
	server.use(restify.bodyParser({ mapParams: true }));
	
	server.post('/currency', CurrencyREST.createCurrency);
	server.get('/currency', CurrencyREST.respondCurrencies);
	server.get('/currency/:mnemonic', CurrencyREST.respondCurrency);
	server.head('/currency/:mnemonic', CurrencyREST.respondCurrency);

	server.post('/account', AccountREST.createAccount);
	server.get('/account', AccountREST.respondAccounts);
	server.get('/account/:id', AccountREST.respondAccount);
	server.head('/account/:id', AccountREST.respondAccount);
	
	server.post('/transaction', TransactionREST.createTransaction);
	server.get('/transaction', TransactionREST.respondTransactions);
	server.get('/transaction/:id', TransactionREST.respondTransaction);
	server.head('/transaction/:id', TransactionREST.respondTransaction);
	
	server.listen((process.env.PORT || 8080), function() {
		console.log('%s listening at %s', server.name, server.url);
	});
});

var restify = require('restify'),
	mongoose = require('mongoose'),
	schemas = require('../lib/schemas.js'),
	db = mongoose.createConnection((process.env.MONGOHQ_URL || 'mongodb://localhost/profitcash'));

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	var Currency = db.model('currencies', schemas.commoditySchema),
		Account = db.model('accounts', schemas.accountSchema),
		Transaction = db.model('transactions', schemas.transactionSchema);
		
	function respond(req, res, next) {
		res.send('hello ' + req.params.name);
	}
	
	var server = restify.createServer();
	server.get('/hello/:name', respond);
	server.head('/hello/:name', respond);
	
	server.listen((process.env.PORT || 8080), function() {
		console.log('%s listening at %s', server.name, server.url);
	});
});

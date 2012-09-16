var restify = require('restify'), 
    mongoose = require('mongoose'), 
    uuid = require('node-uuid'), 
    schemas = require('../lib/schemas.js'), 
    db = mongoose.createConnection((process.env.MONGOHQ_URL || 'mongodb://localhost/profitcash'));

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    var Currency = db.model('currencies', schemas.commoditySchema), 
        Account = db.model('accounts', schemas.accountSchema), 
        Transaction = db.model('transactions', schemas.transactionSchema),
        User = db.model('users', schemas.userSchema);

    var params = {
            generateUuid : uuid.v4,
            Currency : Currency,
            Account : Account,
            Transaction : Transaction,
            User : User
        },
        UserREST = require('../lib/REST/user.js')(params),
        CurrencyREST = require('../lib/REST/currency.js')(params), 
        AccountREST = require('../lib/REST/account.js')(params), 
        TransactionREST = require('../lib/REST/transaction.js')(params);

    var server = restify.createServer();
    server.use(restify.bodyParser({ mapParams : true }));
    server.use(restify.queryParser());
    server.use(restify.authorizationParser());
    server.use(function authenticate(req, res, next) {
        var pwd = req.authorization.basic ? req.authorization.basic.password : '';
        User.checkSchemaByUser(req.username, pwd, req.url, function(err, methods) {
            var i = methods.length;
            while(i--) {
                if(methods[i] == req.method)
                    return next();
            }
            return next(new restify.NotAuthorizedError());
        });
    });

    server.post('/user', UserREST.createUser);
    server.get('/user', UserREST.respondUsers);
    server.get('/user/:username', UserREST.respondUser);
    server.head('/user/:username', UserREST.respondUser);
    server.del('/user/:username', UserREST.deleteUser);
    
    server.post('/currency', CurrencyREST.createCurrency);
    server.get('/currency', CurrencyREST.respondCurrencies);
    server.get('/currency/:mnemonic', CurrencyREST.respondCurrency);
    server.head('/currency/:mnemonic', CurrencyREST.respondCurrency);
    server.del('/currency/:mnemonic', CurrencyREST.deleteCurrency);

    server.post('/account', AccountREST.createAccount);
    server.get('/account', AccountREST.respondAccounts);
    server.get('/account/:id', AccountREST.respondAccount);
    server.head('/account/:id', AccountREST.respondAccount);
    server.del('/account/:id', AccountREST.deleteAccount);

    server.post('/transaction', TransactionREST.createTransaction);
    server.get('/transaction', TransactionREST.respondTransactions);
    server.get('/transaction/:id', TransactionREST.respondTransaction);
    server.head('/transaction/:id', TransactionREST.respondTransaction);
    server.del('/transaction/:id', TransactionREST.deleteTransaction);

    server.listen((process.env.PORT || 8080), function() {
        console.log('%s listening at %s', server.name, server.url);
    });
});

var restify = require('restify'),
    passwordHash = require('password-hash');

var getPrivilegesByName = function(name) {
    switch(name) {
    default:
        return [
                { url : '.*', method : 'GET' }, 
                { url : '.*', method : 'POST' },
                { url : '.*', method : 'PUT' },
                { url : '.*', method : 'DELETE' }, 
                { url : '.*', method : 'HEAD' }
               ];
    };
};

module.exports = exports = function(params) {
    var generateUuid = params.generateUuid, 
        User = params.User;
    return {
        createUser : function(req, res, next) {
            var user = new User, 
                guid = generateUuid();
            user.guid = req.params.id || guid;
            user.username = req.params.username;
            user.password = passwordHash.generate(req.params.password);
            user.fullname = req.params.fullname || 'USER';
            user.family_guid = req.params.family_guid;
            user.privileges = getPrivilegesByName(req.params.privileges);
            user.save(function(err) {
                if (err)
                    return next(err);
                res.send(user);
                return next();
            });
        },

        respondUser : function(req, res, next) {
            User.findOne({
                username : req.params.username
            }, function(err, user) {
                if (err || user == null)
                    return next(new restify.InvalidArgumentError("No such user"));
                res.json(user);
                return next();
            });
        },

        respondUsers : function(req, res, next) {
            User.find(function(err, users) {
                res.json(users);
            });
        },

        deleteUser : function(req, res, next) {
            User.findOneAndRemove({
                username : req.params.username
            }, function(err, user) {
                if (err || user == null)
                    return next(new restify.InvalidArgumentError("No such user"));
                res.json(user);
                return next();
            });
        }

    };
};
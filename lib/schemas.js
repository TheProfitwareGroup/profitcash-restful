var mongoose = require('mongoose'),
    passwordHash = require('password-hash');

var commoditySchema = new mongoose.Schema({
    guid : String,
    namespace : String,
    mnemonic : String,
    fullname : String,
    cusip : String,
    fraction : Number,
    family_guid : String
});

var accountSchema = new mongoose.Schema({
    guid : String,
    account_type : String,
    parent_guid : String,
    name : String,
    description : String,
    family_guid : String
});

var splitSchema = new mongoose.Schema({
    account_guid : String,
    value_num : Number,
    value_denom : Number,
    quantity_num : Number,
    quantity_denom : Number
});

var transactionSchema = new mongoose.Schema({
    guid : String,
    currency_guid : String,
    post_date : Date,
    enter_date : Date,
    description : String,
    family_guid : String,
    splits : [ splitSchema ]
});

var privilegeSchema = new mongoose.Schema({
    method : String,
    url : String
});

var userSchema = new mongoose.Schema({
    username : String,
    password : String,
    fullname : String,
    family_guid : String,
    privileges : [ privilegeSchema ]
});

userSchema.statics.checkSchemaByUser = function(username, password, url, cb) {
    this.findOne({ username : username}, function(err, user) {
        if(err || user == null)
            return cb(null, []);
        if(!passwordHash.verify(password, user.password))
            return cb(null, []);
        var i = user.privileges.length,
            retArr = [];
        while(i--) {
            new RegExp(user.privileges[i].url).test(url) &&
                retArr.push(user.privileges[i].method);
        }
        return cb(null, retArr);
    });
};

module.exports = {
    commoditySchema : commoditySchema,
    accountSchema : accountSchema,
    transactionSchema : transactionSchema,
    userSchema : userSchema
};
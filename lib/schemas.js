var mongoose = require('mongoose');

var commoditySchema = new mongoose.Schema({
	guid : String,
	namespace : String,
	mnemonic : String,
	fullname : String,
	cusip : String,
	fraction : Number
});

var accountSchema = new mongoose.Schema({
	guid : String,
	account_type : String,
	parent_guid : String,
	name : String,
	description : String
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
	splits : [splitSchema]
});

module.exports = {
	commoditySchema : commoditySchema,
	accountSchema : accountSchema,
	transactionSchema : transactionSchema
};
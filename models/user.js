var mongodb = require('mongodb');
var mongoose = require('mongoose');
var cryptoit = require('../config/crypto.js');

var UserSchema = mongoose.Schema({
    user_name: String,
    email: String,
    password: String,
    game_num: Number,
    win_num: Number,
    win_time: Number
});

UserSchema.methods = {
    authenticate: function(plain){
        return cryptoit.encrypt(plain) == this.password;
    }
};

mongoose.model('User',UserSchema);
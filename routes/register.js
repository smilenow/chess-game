var express = require('express');
var mongoose = require('mongoose'),
    User = mongoose.model('User');
var crypto = require('../config/crypto');

var router = express.Router();

router.get('/', function(req, res) {
    var errors = req.flash('error');
    var error = '';
    if (errors.length) {
        error = errors[0];
    }
    res.render('partials/register', {
        title: 'Register',
        error: error,
        isLoginPage: true
    });
});

router.post('/',function(req,res,next){
    var email = req.body.email;
    var username = req.body.user_name;
    var PWD = req.body.password;
    var CfPWD = req.body.confirm_password;

    User.findOne({email:email},function(error,user){
        if (user!== null){
            req.flash('registerStatus', false);
            req.flash('error', 'We have already an account with email: ' + email);
            res.redirect('/register');
        } else {
            if (PWD === CfPWD){
                var newone = new User({user_name:username, email:email, password:crypto.encrypt(PWD),game_num:0, win_num:0, win_time:0 });
                newone.save(function(err){
                    if (err) {
                        next(err);
                    } else {
                        console.log('new user:' + newone);
                        req.login(newone, function(err) {
                            if (err) { return next(err); }
                            req.flash('registerStatus', true);
                            req.flash('registerSuccessMessage', 'Welcome ' + newone.user_name + "!");
                            return res.redirect('/');
                        });
                    }
                });
            } else {
                req.flash('registerStatus', false);
                req.flash('error', 'The confirmation password does not match the password');
                res.redirect('/register');
            }
        }
    });
});


module.exports = router;
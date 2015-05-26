var express = require('express');
var mongoose = require('mongoose');
var crypto = require('../config/crypto');

var router = express.Router();

router.get('/',function(req,res){
    res.render('partials/account.hbs',{
        title: 'Account',
        user: req.user,
        isAccountPage: true,
        updateStatus: req.flash('updateStatus'),
        updateMessage: req.flash('updateMessage')
    });
});

router.post('/',function(req,res){
    var User = mongoose.model('User');
    var CurPWD = req.body.password;
    var NewPWD = req.body.new_password;
    var CfNewPWD = req.body.confirm_new_password;
    var hash = crypto.encrypt(CurPWD);
    if (hash === req.user.password){
        if (NewPWD === CfNewPWD){
            var newhash = crypto.encrypt(NewPWD);
            User.findOneAndUpdate({_id:req.user._id},{password:newhash},{},function(err,user){
                req.user = user;
                req.flash('updateStatus', true);
                req.flash('updateMessage', 'Your password has been updated successfully');
                res.redirect('/account');
            });
        } else {
            req.flash('updateStatus',false);
            req.flash('updateMessage',"The confirmed password is not matched to the new password");
            res.redirect('/account');
        }
    } else {
        req.flash('updateStatus',false);
        req.flash('updateMessage',"The current password is incorrect!");
        res.redirect('/account');
    }
});

module.exports = router;
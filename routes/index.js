var express = require('express');
var mongoose = require('mongoose'),
    User = mongoose.model('User');

var router = express.Router();

/* GET home page. */
/*
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
*/
router.get('/',function(req,res){
    var logoutSuccessMessage = req.flash('logoutSuccess');
    var welcomeMessage = req.flash('welcomeMessage');
    var registerSuccessMessage = req.flash('registerSuccessMessage');
    res.render('partials/index', {
        title: 'Chess Game',
        logoutSuccessMessage: logoutSuccessMessage,
        welcomeMessage: welcomeMessage,
        registerSuccessMessage: registerSuccessMessage,
        user: req.user,
        isHomePage: true
    });
});

router.get('/game/:token/:role', function(req, res) {
    var token = req.params.token;
    var role = req.params.role;
    res.render('partials/game', {
        title: 'Chess Game - ' + token,
        user: req.user,
        isPlayPage: true,
        token: token,
        role: role
    });
});

router.get('/logout', function(req, res) {
    req.logout();
    req.flash('logoutSuccess', 'You have been successfully logged out');
    res.redirect('/');
});

module.exports = router;

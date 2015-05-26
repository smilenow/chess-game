var express = require('express');
var mongoose = require('mongoose'),
    User = mongoose.model('User');
var random = require('../config/random');

var router = express.Router();

router.get('/', function(req, res) {
    res.render('partials/play', {
        title: 'Game',
        user: req.user,
        isPlayPage: true
    });
});

router.post('/', function(req, res) {
    var role = req.body.role;
    var token = random.randomString(20);
    res.redirect('/game/' + token + '/' + role);
});

module.exports = router;
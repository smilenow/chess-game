var fs = require('fs');
var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var env = process.env.NODE_ENV || 'default';
var config = require('config');
var app = express();


// config database
//mongoose.createConnection('mongodb://localhost/test');
require('./config/database')(app, mongoose);

// bootstrap data models
fs.readdirSync(__dirname + '/models').forEach(function (file) {
    if (~file.indexOf('.js')) require(__dirname + '/models/' + file);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('Chess000game'));
app.use(session({secret:'ChEss-game000',saveUninitialized: true, resave: true} ));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
require('./config/passport')(app, passport);
app.use(passport.initialize());
app.use(passport.session());

// config routes
var routes = require('./routes/index');
var account = require('./routes/account');
var login = require('./routes/login');
var play = require('./routes/play');
var register = require('./routes/register');

app.use('/',routes);
app.use('/account', account);
app.use('/login',login);
app.use('/play',play);
app.use('/register',register);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development' || app.get('env') === 'default') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('partials/error', {
        message: err.message,
        error: {}
    });
});

// launch app server
var server = require('http').createServer(app).listen(3333);
require('./config/socketio.js')(server);

module.exports = app;

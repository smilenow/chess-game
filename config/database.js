var config = require('config');

module.exports = function(app,mongoose){
    // connect
    var connect = function(){
        var options = {
            server:{
                socketOptions: { keepAlive: 1 }
            },
            auto_reconnect : true
        };
        mongoose.connect(config.get('chess.db'), options);
    };
    connect();

    // reconnect
    mongoose.connection.on('disconnected',function(){
        connect();
    });

    // error
    mongoose.connection.on('error',function(err){
        console.error("Mongodb Error: "+err);
    });
};
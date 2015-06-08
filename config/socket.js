module.exports = function(server){
    var io = require('socket.io').listen(server);
    var chess =  require('../public/javascripts/chess.min.js');

    var games = {};
    var user_num = 0;

    var mongoose = require('mongoose'),
        User = mongoose.model('User');

    function getname(room,role){
        var game = games[room];
        for (var p in game.players) {
            var player = game.players[p];
            if (player.role === role) {
                return player.name;
            }
        }
    };

    io.sockets.on('connection',function(socket){
        var username = socket.handshake.query.user;

        user_num++;

        // join
        socket.on('join',function(data){
            var room = data.token;
            // create
            if (!(room in games)){
                var players = [
                    {
                        socket:socket,
                        name:username,
                        status:'joined',
                        role:data.role
                    },
                    {
                        socket:null,
                        name:"",
                        status:'open',
                        role:data.role==='white'?'black':'white'
                    }
                ];
                games[room] = {
                    room: room,
                    creator: socket,
                    status: 'waiting',
                    players: players
                };
                socket.join(room);
                socket.emit('wait');
                return;
            }

            // player2 join
            var game = games[room];
            socket.join(room);
            game.players[1].socket = socket;
            game.players[1].name = username;
            game.players[1].status = "joined";
            game.status = "ready";

            // update database
            //console.log("lalala");
            var u0 = game.players[0].name.replace(/^\s+|\s+$/g,'');
            //console.log("u0=@"+u0+"@");
            /*
            User.findOne({user_name:u0},function(err,result){
                console.log(result);
            });
            */
            //console.log(game.players[0].name);
            //console.log("lalala22");

            var gamenum;
            User.findOne({user_name:u0},function(error,user){
                if (user !== null ){
                    //console.log(user);
                    gamenum = user.game_num;
                    gamenum++;
                    User.findOneAndUpdate({user_name:u0},{game_num:gamenum},{},function(err){});
                }
            });

            var u1 = game.players[1].name.replace(/^\s+|\s+$/g,'');
            User.findOne({user_name:u1},function(error,user){
                if (user !== null ){
                    //console.log(user);
                    gamenum = user.game_num;
                    gamenum++;
                    User.findOneAndUpdate({user_name:u1},{game_num:gamenum},{},function(err){});
                }
            });

            // start
            io.sockets.to(room).emit('ready', { white: getname(room, "white"), black: getname(room, "black") });
        });

        // move
        socket.on('new-move',function(data){
            socket.broadcast.to(data.token).emit('new-move',data);
        });

        // resign
        socket.on('resign', function (data) {
            var room = data.token;
            if (room in games) {
                io.sockets.to(room).emit('player-resigned', {
                    'role': data.role
                });

                console.log("time");
                console.log(data.timew);
                console.log(data.timeb);

                // update win_num && win_time
                if (games[room].players[0].role === data.role){
                    var t1 = games[room].players[1].name.replace(/^\s+|\s+$/g,'');
                    console.log("t1=@"+t1+"@");
                    User.findOne({user_name:t1},function(error,user){
                        if (user !== null ){
                            //console.log(user);
                            var winnum = user.win_num;
                            winnum++;
                            var wintime = user.win_time;
                            if (data.role === 'white') wintime += data.timeb;
                            else wintime += data.timew;

                            User.findOneAndUpdate({user_name:t1},{win_num:winnum,win_time:wintime},{},function(err){});
                        }
                    });
                } else {
                    var t0 = games[room].players[0].name.replace(/^\s+|\s+$/g,'');
                    User.findOne({user_name:t0},function(error,user){
                        if (user !== null ){
                            //console.log(user);
                            var winnum = user.win_num;
                            winnum++;
                            var wintime = user.win_time;
                            if (data.role === 'white') wintime += data.timeb;
                            else wintime += data.timew;

                            User.findOneAndUpdate({user_name:t0},{win_num:winnum,win_time:wintime},{},function(err){});
                        }
                    });
                }
                games[room].players[0].socket.leave(room);
                games[room].players[1].socket.leave(room);
                delete games[room];
            }
        });

        // disconnect
        socket.on('disconnect', function(data){
            user_num--;
            for (var token in games) {
                var game = games[token];
                for (var p in game.players) {
                    var player = game.players[p];
                    if (player.socket === socket) {
                        socket.broadcast.to(token).emit('opponent-disconnected');
                        delete games[token];
                    }
                }
            }
        });

    });

};
module.exports = function(server){
    var io = require('socket.io').listen(server);
    var chess = require('../public/javascripts/chess.js');

    var game = {};
    var user_num = 0;

    function getname(room,role){
        var curgame = game[room];
        for (var i in curgame.players){
            if (curgame.players[i].role === role)
                return curgame.players[i].name;
        }
    };

    io.sockets.on('connection',function(socket){
        var username = socket.handshake.query.user;

        user_num++;

        // join
        socket.on('join',function(data){
            var room = data.token;
            // create
            if (!(room in game)){
                var player = [
                    {
                        socket:socket,
                        name:username,
                        status:'join',
                        role:data.role
                    },
                    {
                        socket:null,
                        name:"",
                        status:'open',
                        role:data.role=='white'?'black':'white'
                    }
                ];
                game[room] = {
                    room: room,
                    creator: socket,
                    status: 'waiting',
                    players: player
                };
                socket.join(room);
                socket.emit('wait');
                return;
            }

            // player2 join
            var curgame = game[room];
            socket.join(room);
            curgame.player[1].socket = socket;
            curgame.player[1].name=username;
            curgame.player[1].status='joined';
            curgame.status = 'ready';

            // start
            io.socket.to(room).emit('ready', {white:getname(room,'white'), black:getname(room,'black')});
        });

        // move
        socket.on('newmove',function(data){
            socket.broadcast.to(data.token).emit('newmove',data);
        });

        // resign
        socket.on('resign',function(data){
           var room = data.token;
           if (room in game){
               io.socket.to(room).emit('resigned',{
                   role: data.role
               });
               game[room].players[0].socket.leave(room);
               game[room].players[1].socket.leave(room);
               delete game[room];
           }
        });

        // disconnect
        socket.on('disconnect',function(data){
            user_num--;
            for (var i in game){
                var curgame = game[i];
                for (var j in curgame.players){
                    var curplayer = curgame.players[i];
                    if (curplayer.socket===socket){
                        socket.broadcast.to(i).emit('opponent-disconnected');
                        delete game[i];
                    }
                }
            }
        });
    });

};
$(document).ready(function() {

    // when sign in, keep the user information for several minutes.
    var username;
    var time_out = 180; // 3 mins
    if ($("#loggedUser").length) {
        username = $("#loggedUser").data("user");
    } else {
        username = "Visitor";
    }

    var socket = io('http://localhost:3333', { query: 'user='+username});

    // when login succeed, print the message
    if ($("#welcomeMessage").length && !($("#welcomeMessage").is(':empty'))){
        Messenger({
            extraClasses: 'messenger-on-right messenger-on-top messenger-fixed',
            theme: 'air'
        }).post({
            message: $("#welcomeMessage").html(),
            type: 'success',
            showCloseButton: true,
            hideAfter: 10
        });
    }

    // when login failure, print the message
    if ($("#loginError").length && !($("#loginError").is(':empty'))){
        Messenger({
            extraClasses: 'messenger-on-right messenger-on-top messenger-fixed',
            theme: 'air'
        }).post({
            message: $("#loginError").html(),
            type: 'error',
            showCloseButton: true,
            hideAfter: 10
        });
    }

    // when logout succeed, print the message
    if ($("#logoutSuccess").length && !($("#logoutSuccess").is(':empty'))){
        Messenger({
            extraClasses: 'messenger-on-right messenger-on-top messenger-fixed',
            theme: 'air'
        }).post({
            message: $("#logoutSuccess").html(),
            type: 'success',
            showCloseButton: true,
            hideAfter: 10
        });
    }

    // when register succeed, print the message
    if ($("#registerSuccessMessage").length && !($("#registerSuccessMessage").is(':empty'))){
        Messenger({
            extraClasses: 'messenger-on-right messenger-on-top messenger-fixed',
            theme: 'air'
        }).post({
            message: $("#registerSuccessMessage").html(),
            type: 'success',
            showCloseButton: true,
            hideAfter: 10
        });
    }

    // when register failure, print the message
    if ($("#registerError").length && !($("#registerError").is(':empty'))){
        Messenger({
            extraClasses: 'messenger-on-right messenger-on-top messenger-fixed',
            theme: 'air'
        }).post({
            message: $("#registerError").html(),
            type: 'error',
            showCloseButton: true,
            hideAfter: 10
        });
    }

    // when update account, print the message
    if ($("#updateStatus").length && !($("#updateStatus").is(':empty'))){

        var ok = $("#updateStatus").data('ok');
        var message = $("#updateStatus").html();
        Messenger({
            extraClasses: 'messenger-on-right messenger-on-top messenger-fixed',
            theme: 'air'
        }).post({
            message: message,
            type: ok ? 'success' : 'error',
            showCloseButton: true,
            hideAfter: 10
        });
    }

    /*              */
    /*  game logic  */
    /*              */

    if ($("#board").length) {
        // init game
        var game = new Chess();
        var pgnEl = $('#pgn');
        var token = $("#board").data('token');
        var role = $("#board").data('role');
        var opponentSide = role === "black" ? "white" : "black";

        // timer
        var timer = function (time_set) {
            if (true) {
                if (game.turn().toString() == 'w') {
                    time_set[0] += 1;
                    if (time_set[0] > time_out) {
                        //handle time out
                        $('#gameResult').html('TimeOut! Black Won !');
                        $('#GameResultPush').modal({
                            keyboard: false,
                            backdrop: 'static'
                        });
                        clearInterval(timer_interval);
                    }
                    $("#timew").html(("00" + Math.floor(time_set[0] / 60)).slice(-2) + ":" + ("00" + time_set[0] % 60).slice(-2));
                }
                if (game.turn().toString() == 'b') {
                    time_set[1] += 1;
                    if (time_set[1] > time_out) {
                        //handle time out
                        $('#gameResult').html('TimeOut!  White Won !');
                        $('#GameResultPush').modal({
                            keyboard: false,
                            backdrop: 'static'
                        });
                        clearInterval(timer_interval);
                    }
                    $("#timeb").html(("00" + Math.floor(time_set[1] / 60)).slice(-2) + ":" + ("00" + time_set[1] % 60).slice(-2));
                }
            }
            return time_set;
        };

        //When dragged, check if it is his turn
        var onDragStart = function (source, piece, position, orientation) {
            if (game.game_over() === true ||
                (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
                (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
                (game.turn() !== role.charAt(0) )) {
                return false;
            }
        };

        //When dropped, check legal
        var onDrop = function (source, target, piece, newPos, oldPos, orientation) {
            // see if the move is legal
            var move = game.move({
                from: source,
                to: target,
                promotion: 'q' // NOTE: always promote to a queen for example simplicity
            });
            // illegal move
            if (move === null) return 'snapback';
            pgnEl.html(game.pgn());
            $('.turn').removeClass("fa fa-spinner");
            $('#turn-' + game.turn()).addClass("fa fa-spinner");
            socket.emit('new-move', {
                token: token,
                source: source,
                target: target,
                piece: piece,
                newPosition: ChessBoard.objToFen(newPos),
                oldPosition: ChessBoard.objToFen(oldPos)
            });
        };

        // update the board position
        var onSnapEnd = function () {
            board.position(game.fen());
        };

        // init a new board
        var cfg = {
            draggable: true,
            position: 'start',
            moveSpeed: 'slow',
            onDragStart: onDragStart,
            onSnapEnd: onSnapEnd,
            onDrop: onDrop,
            snapbackSpeed: 500,
            snapSpeed: 150,
            orientation: role
        };
        var board = new ChessBoard('board', cfg);

        // emit join singal
        socket.emit('join', {
            'token': token,
            'role': role
        });

        // wait the opponent
        socket.on('wait', function () {
            var url = "http:/localhost:3333/game/" + token + "/" + opponentSide;
            $('#gameURL').html(url);
            $('#GameUrlPush').modal({ // show modal popup to wait for opponent
                keyboard: false,
                backdrop: 'static'
            });
        });

        var time_sets;
        // start game
        socket.on('ready', function (data) {
            //intialize the timer
            time_sets = [0, 0];
            timer_interval = setInterval(function () {
                time_sets = timer(time_sets)
            }, 1000);//repeat every second
            $('#turn-w').addClass("fa fa-spinner");
            $('#player-white').html(data.white);
            $('#player-black').html(data.black);
            $('#GameUrlPush').modal('hide');
        });

        // new move
        socket.on('new-move', function (data) {
            game.move({from: data.source, to: data.target});
            board.position(game.fen());
            pgnEl.html(game.pgn());
            $('.turn').removeClass("fa fa-spinner");
            $('#turn-' + game.turn()).addClass("fa fa-spinner");
        });

        // resign
        $('#resign_button').click(function (ev) {
            ev.preventDefault();
            socket.emit('resign', {
                'token': token,
                'role': role,
                'timew': time_sets[0],
                'timeb': time_sets[1]
            });
        });

        //opponent resign
        socket.on('player-resigned', function (data) {
            $('#gameResult').html(data.role + ' resigned.');
            $('#GameResultPush').modal({
                keyboard: false,
                backdrop: 'static'
            });
        });

        //opponent disconnect
        socket.on('opponent-disconnected', function () {
            $('#gameResult').html('Your opponent has been disconnected.');
            $('#GameResultPush').modal({
                keyboard: false,
                backdrop: 'static'
            });
        });
    }
});
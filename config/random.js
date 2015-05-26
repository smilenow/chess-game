module.exports = {
    randomString: function(length){
        var str = "";
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < length; i++) {
            var randomNumber = Math.floor(Math.random() * chars.length);
            str += chars.substring(randomNumber, randomNumber + 1);
        }
        return str;
    }
};
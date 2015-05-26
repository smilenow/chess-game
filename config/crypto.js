var crypto = require('crypto');

module.exports = {
    encrypt : function (plain){
        return crypto.createHash('md5').update(plain).digest('Hex');
    }
};
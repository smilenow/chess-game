var express = require('express');
var mongoose = require('mongoose'),
    User = mongoose.model('User');

var router = express.Router();

router.get('/',function(req,res){
    var errors = req.flash('error');
    var error = '';
    if (errors.length) {
        error = errors[0];
    }

    var criteria = {};
    var fields = { user_name : 1 , win_num : 1, game_num : 1, win_time : 1};
    var options = {};
    User.find(criteria,fields,options,function(err,result) {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            var ret = [];
            var cnt = 0;
            for (var i in result){
                var tmp = {};
                //cnt++;
                //tmp.rk = cnt;
                tmp.user_name = result[i].user_name;
                tmp.win_num = result[i].win_num;
                tmp.win_ratio = result[i].win_num/result[i].game_num;
                tmp.win_time = result[i].win_time;
                ret.push(tmp);
            }
            ret.sort(sortfunc('win_num','win_ratio','win_time'));
            for (var i in ret){
                cnt++;
                ret[i].rk = cnt;
            }
            res.render('partials/ranklist', {
                title: 'RankList',
                error: error,
                user: req.user,
                result: ret,
                isRankListPage: true
            });
        }
    });
});

module.exports = router;

/*
* 排行榜上,排名的第一关键字是获胜场次, 第二关键字是获胜比例,第三关键字是获胜累计时长
* */

var sortfunc = function(f1,f2,f3){
    return function(x,y){
        if (typeof x === "object" && typeof y === "object" && x && y){
            if (x[f1]<y[f1]) return 1;
            if (x[f1]===y[f1] && x[f2]<y[f2]) return 1;
            if (x[f1]===y[f1] && x[f2]===y[f2] && x[f3]>y[f3]) return 1;
            return -1;
        } else { throw("error"); }
    }
};
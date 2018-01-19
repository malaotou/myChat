    var express=require('express'); 
    var app=express();
    var bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({
        extended:false
    }));
    app.use(bodyParser.json());
    var jwt=require('jsonwebtoken');

    var apiConfig=require('../server');
    
    app.all('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
        //res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        //res.header("X-Powered-By", ' 3.2.1');
        res.header("Content-Type", "application/json;charset=utf-8");
        console.log('header')
        next();
    });
    //var router = express.Router();
    /*得到当前用户参加过的所有活动*/
    app.get('/', function (req, res) {
        //console.log(req);
        res.header("Access-Control-Allow-Headers", "Content-Type, authorization")
        res.send({
            id:1,
            name:'name',
            age:12
        });
    });
    app.post("/login",function(req,res){

        // 验证用户身份是否合法
        // 合法，则颁发Token，并返回给客户端。
        
        // 测试则不做任何验证，直接颁发Token
        console.log(req.body.name);
        var token=jwt.sign({userid:'laoma'},'password',{ expiresIn: '1h' });
        res.header("Access-Control-Allow-Headers", "Content-Type, authorization")
        res.send({token});
    })
    app.post('/register',function(req,res){
        // 登记信息至数据库
        console.log(req.body);
    })
 
module.exports=app;
var express = require('express');
var app = express();
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

exports = module.exports = function(req, res, next) {
    // check header or url parameters or post parameters for token
   // var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var authorization =req.headers.authorization;
    console.log(authorization);
    
    if(authorization!=undefined){
        jwt.verify(token, config.secret, function(err, decoded) {
                    console.log(err);
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    }
    else{
        return res.status(403).send({
            sucess:false,
            message:'No Token provided'
        });
        res.end;
    }
}
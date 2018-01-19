var jwt = require('jsonwebtoken');
var response = require('./services/modules/responsemodel')
var config = require('./config')
var Utils = {
  decode(token) {
    var decodetoken = jwt.decode(token, null);
    console.log(decodetoken);
    return decodetoken;

  },
  verifySocketToken(tokenStr) {
    return new Promise((resolve, reject) => {
      //console.log(config.jwt.encryptStr);
      jwt.verify(tokenStr, config.jwt.encryptStr, function (err, token) {
        //console.log(err,token);
        if (err)  {
          reject(err);
        }
        else{
          resolve(token);
        }

      })
    })
  },
  verifyToken(req, res, callback) {
    rtn = true;
    if (req.headers.authorization != undefined) {
      jwt.verify(req.headers.authorization.replace('Bearer ', ''),
        config.jwt.encryptStr,
        function (err, token) {
          if (err) {
            rtn = false;
            res.send(
              new response(false, null, err)
            )
            callback(null);
            res.end();
          } else {
            callback(jwt.decode(req.headers.authorization.replace('Bearer ', ''), null));
          }
        });

    } else {
      res.send(
        new response(false, "Token can not be null", null)
      )
      callback(null);
      res.end();
    }
  },

  // verifyTokenV2(req, res, callback) {
  //   return new Promise((resolve, reject) => {
  //     rtn = true;
  //     if (req.headers.authorization != undefined) {
  //       jwt.verify(req.headers.authorization.replace('Bearer ', ''),
  //         'password',
  //         function (err, token) {
  //           if (err) {
  //             rtn = false;
  //             res.send(
  //               new response(false, null, err)
  //             )
  //             resolve(null);
  //             res.end();
  //           } else {
  //             //callback(jwt.decode(req.headers.authorization.replace('Bearer ', ''), null));
  //             resove(jwt.decode(req.headers.authorization.replace('Bearer ', ''), null));
  //           }
  //         });

  //     } else {
  //       res.send(
  //         new response(false, "Token can not be null", null)
  //       )
  //       resolve(null);
  //       res.end();
  //     }
  //   })
  // },
  sendResponse(res, status, message, data) {
    res.send(new response(status, message, data)
      /*{
      message:message,
      isSuccess,status,
      data:data
    }*/
    )
    res.end();
  }
}
module.exports = Utils;

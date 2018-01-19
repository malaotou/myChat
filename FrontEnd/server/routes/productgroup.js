var express = require('express');
var apiRoutes = express.Router();
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
var jwt = require('jsonwebtoken');

var companyRepo = require('../services/Repository/companyRepository');
/*得到当前用户参加过的所有活动*/
app.get('', function (req, res) {
  console.log(req);
  res.send({
    id: 1,
    name: 'name',
    age: 12
  });
})

app.post('/add', function (req, res) {

  companyRepo.createCompany({
    name: req.body.name,
    avatarsrc: req.body.avatarsrc,
    description: req.body.description
  }, function (data, err) {

  })
  res.send({
    message: req.body
  });
  res.end();

})

module.exports = app;

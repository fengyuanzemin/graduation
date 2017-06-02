/**
 * Created by fengyuanzemin on 2017/4/3.
 */
require('babel-register');
require('babel-polyfill');
const calculate = require('./calculate');
const mongoose = require('mongoose');


mongoose.connect('mongodb://localhost/graduation');
const db = mongoose.connection;
db.on('error', console.error.bind(console, '连接错误:'));

mongoose.Promise = global.Promise;
setInterval(() => {
  calculate.hot().then(() => {

  }).catch((err) => {
    console.log(err);
  });
}, 1000 * 1000);

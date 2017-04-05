/**
 * Created by fengyuanzemin on 2017/4/4.
 */
require('babel-register');
require('babel-polyfill');
const douban = require('./douban');
const mongoose = require('mongoose');


mongoose.connect('mongodb://localhost/graduation');
const db = mongoose.connection;
db.on('error', console.error.bind(console, '连接错误:'));

mongoose.Promise = global.Promise;

douban.douban().then(() => {

}).catch(err => {
    console.log(err);
});
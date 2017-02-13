/**
 * Created by fengyuanzemin on 17/2/13.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    author: {
        type: String,
        default: '',
        trim: true
    },
    author_id: {
        type: Number,
        default: 0
    },
    attitudes_count: {
        type: Number,
        default: 0
    },
    reposts_count: {
        type: Number,
        default: 0
    },
    comments_count: {
        type: Number,
        default: 0
    }
});

// 数据库连接
mongoose.connect('mongodb://localhost/weibo');
const db = mongoose.connection;

db.on('error', console.error.bind(console, '连接错误:'));

module.exports = mongoose.model('WeiboUser', Schema);
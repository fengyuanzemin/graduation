const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    id: {
        type: String,
        default: ''
    },
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
    created_at: {
        type: String,
        default: ''
    },
    reposts_count: {
        type: Number,
        default: 0
    },
    comments_count: {
        type: Number,
        default: 0
    },
    text: {
        type: String,
        default: ''
    },
    retweeted_id: {
        type: String,
        default: ''
    },
    retweeted_author: {
        type: String,
        default: ''
    },
    retweeted_author_id: {
        type: Number,
        default: 0
    },
    retweeted_attitudes_count: {
        type: Number,
        default: 0
    },
    retweeted_created_at: {
        type: String,
        default: ''
    },
    retweeted_reposts_count: {
        type: Number,
        default: 0
    },
    retweeted_comments_count: {
        type: Number,
        default: 0
    },
    retweeted_text: {
        type: String,
        default: ''
    }
});

// 数据库连接
mongoose.connect('mongodb://localhost/weibo');
const db = mongoose.connection;

db.on('error', console.error.bind(console, '连接错误:'));

module.exports = mongoose.model('WeiboSpider', Schema);
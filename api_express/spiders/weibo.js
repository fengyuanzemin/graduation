const superAgent = require('superagent');
const mongoose = require('mongoose');

const Spider = require('../models/weibo');
const uaArr = require('./ua');

// 数据库连接
mongoose.connect('mongodb://localhost/weibo');
const db = mongoose.connection;

db.on('error', console.error.bind(console, '连接错误:'));

const baseUrl = 'http://m.weibo.cn/container/getIndex?type=uid';
let page = 1;

// 5分钟爬一次
const updateTime = 0.2 * 60 * 1000;

// 爬数据函数
function curl(value, containerid, page, callback) {
    superAgent('GET', baseUrl)
        .set('User-Agent', uaArr[Math.floor(Math.random() % uaArr.length)])
        .query({value, containerid, page})
        .then(callback)
        .catch((err) => {
            console.log(err);
        });
}
// 爬
const timer = setInterval(() => {
    // 前面一个是微博的id，后面的是containerid，不知道啥
    curl(2616609787, 1076032616609787, page, (res) => {
        if (res) {
            const text = JSON.parse(res.text);
            text.cards.forEach((v) => {
                const blog = v.mblog;
                const weiboText = new Spider({
                    id: blog.id,
                    author: blog.user ? blog.user.screen_name : '',
                    author_id: blog.user ? blog.user.id : 0,
                    created_at: blog.created_at,
                    text: blog.text,
                    attitudes_count: blog.attitudes_count,
                    comments_count: blog.comments_count,
                    reposts_count: blog.reposts_count,
                    retweeted_id: blog.retweeted_status ? blog.retweeted_status.id : '',
                    retweeted_author: blog.retweeted_status ? blog.retweeted_status.user ? blog.retweeted_status.user.screen_name : '' : '',
                    retweeted_author_id: blog.retweeted_status ? blog.retweeted_status.user ? blog.retweeted_status.user.id : 0 : 0,
                    retweeted_attitudes_count: blog.retweeted_status ? blog.retweeted_status.attitudes_count : 0,
                    retweeted_created_at: blog.retweeted_status ? blog.retweeted_status.created_at : '',
                    retweeted_reposts_count: blog.retweeted_status ? blog.retweeted_status.reposts_count : 0,
                    retweeted_comments_count: blog.retweeted_status ? blog.retweeted_status.comments_count : 0,
                    retweeted_text: blog.retweeted_status ? blog.retweeted_status.text : ''
                });
                weiboText.save();
                console.log(`页数：${page}`);
                console.log(`ID：${blog.id}`);
                console.log(`作者：${blog.user ? blog.user.screen_name : ''}`);
                console.log(`作者ID：${blog.user ? blog.user.id : 0}`);
                console.log(`创建时间：${blog.created_at}`);
                console.log(`微博内容：${blog.text}`);
                console.log(`点赞数：${blog.attitudes_count}`);
                console.log(`评论数：${blog.comments_count}`);
                console.log(`转发数：${blog.reposts_count}`);
                // 转发的
                if (blog.retweeted_status) {
                    console.log(`原po ID：${blog.retweeted_status.id}`);
                    console.log(`原po作者：${blog.retweeted_status ? blog.retweeted_status.user ? blog.retweeted_status.user.screen_name : '' : ''}`);
                    console.log(`原po作者ID：${blog.retweeted_status ? blog.retweeted_status.user ? blog.retweeted_status.user.id : 0 : 0}`);
                    console.log(`原po创建时间：${blog.retweeted_status.created_at}`);
                    console.log(`原po微博内容：${blog.retweeted_status.text}`);
                    console.log(`原po点赞数：${blog.retweeted_status.attitudes_count}`);
                    console.log(`原po评论数：${blog.retweeted_status.comments_count}`);
                    console.log(`原po转发数：${blog.retweeted_status.reposts_count}`);
                } else {
                    console.log('此为原创微博');
                }
                console.log('----------------------split------------------------');
            });
            if (text.cards.length === 0) {
                clearInterval(timer);
                console.log('end');
            }
        } else {
            console.log('no data');
        }
        page += 1;
    })
}, updateTime);
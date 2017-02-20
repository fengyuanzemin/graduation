import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import {saltRounds} from '../config/salt';

import User from '../models/user';
import Post from '../models/post';

import {errCode} from '../utils/codeTransfer';
import {randomKey} from '../utils/index';

router.get('/', (req, res) => {
    res.json({
        data: {
            message: '首页'
        },
        code: 200
    });
});

router.post('/login', (req, res) => {
    User.findOne({name: req.body.name}, (err, data) => {
        if (err) {
            console.log(err);
            res.json({
                message: errCode[5001],
                code: 5000
            });
            return;
        }
        if (data) {
            bcrypt.compare(req.body.password, data.password).then((response) => {
                if (response) {
                    res.json({
                        message: '登录成功',
                        token: data.token,
                        code: 200
                    })
                } else {
                    res.json({
                        message: errCode[5000],
                        code: 5000
                    })
                }
            });
        } else {
            res.json({
                message: errCode[5000],
                code: 5000
            });
        }
    })
});

router.post('/sign-up', (req, res) => {
    const token = randomKey();
    bcrypt.hash(req.body.password, saltRounds).then((hash) => {
        const userInfo = new User({
            name: req.body.name,
            password: hash,
            token
        });
        const promise = userInfo.save();
        promise.then(() => {
            res.json({
                message: '注册成功',
                token,
                code: 200
            });
        }).catch((err) => {
            res.json({
                message: errCode[err.code] || '注册失败',
                code: err.code
            });
        });
    });
});

router.post('/post', (req, res) => {
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        if (doc) {
            const postInfo = new Post({
                userId: doc._id,
                content: req.body.text
            });
            postInfo.save().then(() => {
                doc.posts_count += 1;
                // 先不做事务回滚了
                doc.save().then(() => {
                    res.json({
                        message: '发送成功',
                        code: 200
                    });
                });
            }).catch((err) => {
                res.json({
                    message: errCode[err.code] || '发送失败',
                    code: err.code
                });
            });

        } else {
            res.json({
                message: errCode[5002],
                code: 5002
            });
        }
    });

});

router.get('/checkToken', (req, res) => {
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        if (doc) {
            res.json({
                loggedIn: true,
                code: 200
            })
        } else {
            res.json({
                loggedIn: false,
                code: 200
            })
        }
    })
});

router.get('/getList', (req, res) => {
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        if (doc) {
            Post.find({userId: doc._id}).sort({_id: -1}).then((list) => {
                const cardList = list.map((item) => {
                    return {
                        attitudes_count: item.attitudes_count,
                        comments_count: item.comments_count,
                        content: item.content,
                        createdAt: item.createdAt,
                        reposts_count: item.reposts_count,
                        id: item._id,
                        user: {
                            followers_count: doc.followers_count,
                            following_count: doc.following_count,
                            name: doc.name,
                            posts_count: doc.posts_count
                        }
                    }
                });
                res.json({
                    cardList,
                    code: 200
                });
            });
        } else {
            res.json({
                message: errCode[5002],
                code: 5002
            })
        }
    });
});

router.get('/getUserInfo', (req, res) => {
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        if (doc) {
            res.json({
                userInfo: {
                    followers_count: doc.followers_count,
                    following_count: doc.following_count,
                    name: doc.name,
                    posts_count: doc.posts_count
                },
                code: 200
            });
        } else {
            res.json({
                code: 5002,
                message: errCode[5002]
            })
        }
    });
});

export default router;

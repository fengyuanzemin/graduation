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
                data: {
                    message: errCode[5001]
                },
                code: 5000
            });
            return;
        }
        if (data) {
            bcrypt.compare(req.body.password, data.password).then((response) => {
                if (response) {
                    res.json({
                        data: {
                            message: '登录成功',
                            token: data.token
                        },
                        code: 200
                    })
                } else {
                    res.json({
                        data: {
                            message: errCode[5000]
                        },
                        code: 5000
                    })
                }
            });
        } else {
            res.json({
                data: {
                    message: errCode[5000]
                },
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
                data: {
                    message: '注册成功',
                    token
                },
                code: 200
            });
        }).catch((err) => {
            res.json({
                data: {
                    message: errCode[err.code] || '注册失败'
                },
                code: err.code
            });
        });
    });
});

router.post('/post', (req, res) => {
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        if (doc) {
            const postInfo = new Post({
                userId: doc._id + '',
                content: req.body.text
            });
            postInfo.save().then(() => {
                res.json({
                    data: {
                        message: '发送成功'
                    },
                    code: 200
                });
            }).catch((err) => {
                res.json({
                    data: {
                        message: errCode[err.code] || '发送失败'
                    },
                    code: err.code
                });
            });

        } else {
            res.json({
                data: {
                    message: errCode[5002]
                },
                code: 5002
            });
        }
    });

});

router.get('/checkToken', (req, res) => {
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        if (doc) {
            res.json({
                data: {
                    loggedIn: true
                },
                code: 200
            })
        } else {
            res.json({
                data: {
                    loggedIn: false
                },
                code: 200
            })
        }
    })
});

router.get('/getList', (req, res) => {
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        if (doc) {
            Post.find({userId: doc._id}).then((list) => {
                res.json({
                    data: {
                        list,
                        user: {
                            followers_count: doc.followers_count,
                            following_count: doc.following_count,
                            name: doc.name,
                            posts_count: doc.posts_count
                        }
                    },
                    code: 200
                });
            });
        } else {
            res.json({
                data: {
                    message: errCode[5002]
                },
                code: 5002
            })
        }
    });
});
export default router;

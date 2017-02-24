import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import {saltRounds} from '../config/salt';

import User from '../models/user';
import Post from '../models/post';
import Action from '../models/action';

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
    if (!req.body.text) {
        res.json({
            code: 5004,
            message: errCode[5004]
        });
        return;
    }
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        if (doc) {
            const user = new User({
                _id: doc._id
            });
            const postInfo = new Post({
                user,
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
                console.log(err)
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
            Post.find({user: doc._id})
                .select('attitudes_count comments_count content createdAt reposts_count user')
                .sort({_id: -1})
                .populate('user', ['name'])
                .then((cardList) => {
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
    User.findOne({token: req.headers['f-token']}, 'followers_count following_count name posts_count')
        .then((doc) => {
            if (doc) {
                res.json({
                    userInfo: doc,
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

router.get('/getPostItem', (req, res) => {
    Post.findOne({_id: req.query.pId})
        .select('attitudes_count comments_count content createdAt reposts_count user')
        .populate('user', ['name']).then((detail) => {
        if (detail) {
            res.json({
                code: 200,
                detail
            });
        } else {
            res.json({
                code: 5005,
                message: errCode[5005]
            });
        }
    });
});

router.post('/action', (req, res, next) => {
    // User.findOne({token: req.headers['f-token']}).then((doc) => {
    //     // 判断是否已经点过赞
    //     if (req.body.action === 'attitude') {
    //         Action.findOne({post: req.body.pId, user: doc._id}).then((data) => {
    //             if (data) {
    //                 // 应该是取消赞
    //                 data.remove();
    //                 res.json({
    //                     code: 5007,
    //                     message: errCode[5007]
    //                 });
    //                 next();
    //             }
    //         });
    //     }
    //     const action = new Action({
    //         post: new Post({
    //             _id: req.body.pId
    //         }),
    //         user: new User({
    //             _id: doc._id
    //         }),
    //         content: req.body.content,
    //         action: req.body.action
    //     });
    //     action.save().then(() => {
    //         switch (req.body.action) {
    //             case 'attitude': {
    //                 Post.update({_id: req.body.pId}, {$inc: {attitudes_count: 1}}).then(()=>{});
    //                 break;
    //             }
    //             case 'repost': {
    //                 Post.update({_id: req.body.pId}, {$inc: {reposts_count: 1}}).then(()=>{});
    //                 break;
    //             }
    //             case 'comment': {
    //                 Post.update({_id: req.body.pId}, {$inc: {comments_count: 1}}).then(()=>{});
    //                 break;
    //             }
    //             default:
    //                 break;
    //         }
    //         res.json({
    //             code: 200,
    //             message: '操作成功'
    //         });
    //     }).catch(() => {
    //         res.json({
    //             code: 5001,
    //             message: errCode[5001]
    //         });
    //     });
    // });
    const action = new Action({
        post: new Post({
            _id: req.body.pId
        }),
        user: new User({
            _id: doc._id
        }),
        content: req.body.content,
        action: req.body.action
    });
});

router.post('/actionAttitude', (req, res) => {
    const result = {
        attitudes_count: 1
    };
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        result.user = doc;
        return Action.findOne({post: req.body.pId, user: doc._id});
    }).then((doc) => {
        if (doc) {
            // 取消赞
            res.json({
                code: 5007,
                message: errCode[5007]
            });
            result.attitudes_count = -1;
            return doc.remove();
        } else {
            const action = new Action({
                post: new Post({
                    _id: req.body.pId
                }),
                user: new User({
                    _id: result.user._id
                }),
                action: 'attitude'
            });
            return action.save();
        }
    }).then(() => {
        return Post.update({_id: req.body.pId}, {$inc: {attitudes_count: result.attitudes_count}});
    }).then(() => {
        res.json({
            code: 200,
            message: '操作成功'
        });
    }).catch(() => {
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    });
});

export default router;

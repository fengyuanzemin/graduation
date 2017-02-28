import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import {saltRounds} from '../config/salt';

import User from '../models/user';
import Post from '../models/post';
import Action from '../models/action';

import {errCode} from '../utils/codeTransfer';
import {randomKey} from '../utils/index';

// 空请求
router.get('/', (req, res) => {
    res.json({
        data: {
            message: '首页'
        },
        code: 200
    });
});

// 登录
router.post('/login', (req, res) => {
    const result = {};
    User.findOne({name: req.body.name}).then((data) => {
        if (data) {
            result.token = data.token;
            return bcrypt.compare(req.body.password, data.password);
        } else {
            throw new Error('5000');
        }
    }).then((doc) => {
        if (doc) {
            res.json({
                message: '登录成功',
                token: result.token,
                code: 200
            })
        } else {
            throw new Error('5000');
        }
    }).catch((err) => {
        console.log(err);
        let code;
        if (err.message === '5000') {
            code = 5000;
        } else {
            code = 5001;
        }
        res.json({
            message: errCode[code],
            code: code
        });
    });
});

// 注册
router.post('/sign-up', (req, res) => {
    const token = randomKey();
    bcrypt.hash(req.body.password, saltRounds).then((hash) => {
        const userInfo = new User({
            name: req.body.name,
            password: hash,
            token
        });
        return userInfo.save();
    }).then(() => {
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

// 发送微博
router.post('/post', (req, res) => {
    if (!req.body.text) {
        res.json({
            code: 5004,
            message: errCode[5004]
        });
        return;
    }
    const result = {};
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        if (doc) {
            result._id = doc._id;
            doc.posts_count += 1;
            return doc.save();
        }
    }).then(() => {
        const postInfo = new Post({
            user: new User({
                _id: result._id
            }),
            content: req.body.text
        });
        return postInfo.save();
    }).then(() => {
        res.json({
            message: '发送成功',
            code: 200
        });
    }).catch((err) => {
        console.log(err);
        res.json({
            message: errCode[err.code] || '服务器错误，请稍后重试',
            code: err.code
        });
    });
});

// 判断用户是否登录
router.get('/checkToken', (req, res) => {
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        res.json({
            loggedIn: !!doc,
            code: 200
        })
    })
});

// 已登录首页数据
router.get('/getList', (req, res) => {
    console.log(req.ip)
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        if (doc) {
            Post.find({user: doc._id})
                .select('attitudes_count comments_count content createdAt reposts_count user retweeted_post')
                .sort({_id: -1})
                .populate('user', ['name'])
                .populate('retweeted_post')
                .populate({
                    path: 'retweeted_post',
                    populate: {
                        path: 'user',
                        select: 'name'
                    }
                })
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

// 用户列表
router.get('/getUserPostList', (req, res) => {
    Post.find({user: req.query.uId})
        .sort({_id: -1})
        .populate('user', ['name'])
        .populate('retweeted_post')
        .populate({
            path: 'retweeted_post',
            populate: {
                path: 'user',
                select: 'name'
            }
        })
        .then((docs) => {
            if (docs) {
                res.json({
                    code: 200,
                    items: docs
                })
            }
        }).catch((err) => {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        })
    })
});

// 用户简介
router.get('/getUserInfo', (req, res) => {
    User.findOne({token: req.headers['f-token']})
        .select('followers_count following_count name posts_count brief')
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

// 更改用户简介
router.post('/updateUserInfo', (req, res) => {
    if (!(req.body.name || req.body.brief)) {
        res.json({
            code: 5004,
            message: errCode[5004]
        });
        return;
    }
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        if (doc) {
            if (req.body.name) {
                doc.name = req.body.name;
            }
            if (req.body.brief) {
                doc.brief = req.body.brief;
            }
            return doc.save();
        }
    }).then(() => {
        res.json({
            code: 200,
            message: '更改成功'
        })
    }).catch((err) => {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        })
    });

});

// 只拿一个微博数据
router.get('/getPostItem', (req, res) => {
    Post.findOne({_id: req.query.pId})
        .select('attitudes_count comments_count content createdAt reposts_count user retweeted_post')
        .populate('user', ['name'])
        .populate('retweeted_post')
        .populate({
            path: 'retweeted_post',
            populate: {
                path: 'user',
                select: 'name'
            }
        })
        .then((detail) => {
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

// 转发
router.post('/repost', (req, res) => {
    if (!req.body.content) {
        res.json({
            code: 5004,
            message: errCode[5004]
        });
        return;
    }
    const result = {};
    Post.findOne({_id: req.body.pId}).populate('user', ['name']).then((doc) => {
        // 不是原创
        if (doc && doc.retweeted_post) {
            result.originalPostId = doc.retweeted_post;
            result.content = `${req.body.content} // @${doc.user.name}：${doc.content}`;
        } else {
            result.originalPostId = req.body.pId;
            result.content = req.body.content;
        }
        return User.findOne({token: req.headers['f-token']});
    }).then((doc) => {
        const action = new Action({
            post: new Post({
                _id: req.body.pId
            }),
            user: new User({
                _id: doc._id
            }),
            content: result.content,
            action: 'repost'
        });
        result.user_id = doc._id;
        return action.save();
    }).then(() => {
        return Post.update({_id: req.body.pId}, {$inc: {reposts_count: 1}});
    }).then(() => {
        return User.update({token: req.headers['f-token']}, {$inc: {posts_count: 1}});
    }).then(() => {
        const postInfo = new Post({
            user: new User({
                _id: result.user_id
            }),
            content: result.content,
            retweeted_post: new Post({
                _id: result.originalPostId
            })
        });
        return postInfo.save();
    }).then(() => {
        res.json({
            code: 200,
            message: '操作成功'
        });
    }).catch((err) => {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    });
});

// 评论
router.post('/comment', (req, res) => {
    if (!req.body.content) {
        res.json({
            code: 5004,
            message: errCode[5004]
        });
        return;
    }
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        const action = new Action({
            post: new Post({
                _id: req.body.pId
            }),
            user: new User({
                _id: doc._id
            }),
            content: req.body.content,
            action: 'comment'
        });
        return action.save();
    }).then(() => {
        return Post.update({_id: req.body.pId}, {$inc: {comments_count: 1}});
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

// 点赞
router.post('/attitude', (req, res) => {
    const result = {
        attitudes_count: 1
    };
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        result.user = doc;
        return Action.findOne({post: req.body.pId, user: doc._id, action: 'attitude'});
    }).then((doc) => {
        if (doc) {
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
        if (result.attitudes_count > 0) {
            res.json({
                code: 200,
                message: '操作成功'
            });
        } else {
            res.json({
                code: 5007,
                message: errCode[5007]
            });
        }

    }).catch((err) => {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    });
});

// 拉取转发、评论、点赞
router.get('/getActionInfo', (req, res) => {
    Action.find({post: req.query.pId, action: req.query.action})
        .populate('user', ['name']).then((docs) => {
        res.json({
            items: docs,
            code: 200
        })
    }).catch(() => {
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    })
});

// 在微博正文检查用户是否点过赞
router.get('/checkAttitude', (req, res) => {
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        if (doc) {
            return Action.find({post: req.query.pId, user: doc._id, action: 'attitude'});
        }
    }).then((docs) => {
        const check = docs.length > 0;
        res.json({
            code: 200,
            check
        })
    }).catch(() => {
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    })
});

// 搜索
router.get('/search', (req, res) => {
    const result = {};
    Post.find({content: {'$regex': req.query.text}})
        .sort({_id: -1})
        .select('attitudes_count comments_count content createdAt reposts_count user retweeted_post')
        .populate('user', ['name'])
        .populate('retweeted_post')
        .populate({
            path: 'retweeted_post',
            populate: {
                path: 'user',
                select: 'name'
            }
        })
        .then((doc) => {
            result.post = doc;
            return User.find({name: {'$regex': req.query.text}})
                .select('name brief')
        }).then((doc) => {
        res.json({
            user: doc,
            post: result.post,
            code: 200
        });
    }).catch((err) => {
        console.log(err);
    })
});
export default router;

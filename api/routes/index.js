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

router.get('/getUserList', (req, res) => {
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

router.post('/repost', (req, res) => {
    const result = {};
    Post.findOne({_id: req.body.pId}).populate('user', ['name']).then((doc) => {
        if (doc) {
            result.postContent = doc.content;
            result.userName = doc.user.name;
        }
        // 不是原文章
        if (doc && doc.retweeted_post) {
            result.originalPostId = doc.retweeted_post;
        } else {
            result.originalPostId = req.body.pId;
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
            content: `${req.body.content} // @${result.userName}：${result.postContent}`,
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
            content: `${req.body.content} //@${result.userName}：${result.postContent}`,
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
        console.log(err)
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    });
});

router.post('/comment', (req, res) => {
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
export default router;

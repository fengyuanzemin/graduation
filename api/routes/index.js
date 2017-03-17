import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import async from 'async';
import {saltRounds} from '../config/salt';
import similar from '../algorithm/calculate';

import User from '../models/user';
import Post from '../models/post';
import Action from '../models/action';
import RelationShip from '../models/relationship';

import {errCode} from '../utils/codeTransfer';
import {randomKey} from '../utils/index';

// 空请求
router.get('/', (req, res) => {
    res.json({
        message: '首页',
        code: 200
    });
});

// 请求/favicon的，给个空
router.get('/favicon', (req, res) => {
    res.json({
        message: '没有这个东西，好烦呢你',
        code: 200
    })
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

// 热门微博
router.get('/getHotList', (req, res) => {
    Post.find()
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
        }).then((cardList) => {
        res.json({
            cardList,
            code: 200
        });
    }).catch(() => {
        res.json({
            message: errCode[5002],
            code: 5002
        });
    });
});

// 已登录首页数据
router.get('/getList', (req, res) => {
    const result = {};
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        if (doc) {
            result.user = [];
            result.user.push(doc._id);
            // 搜索的是关注的人的ID
            return RelationShip.find({follower: doc._id});
        } else {
            throw new Error('token不存在');
        }
    }).then((docs) => {
        docs.forEach(item => {
            result.user.push(item.following);
        });
        return Post.find({user: {$in: result.user}})
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
            });
    }).then((cardList) => {
        res.json({
            cardList,
            code: 200
        });
    }).catch((err) => {
        console.log(err);
        let code = 5001;
        if (err.message === 'token不存在') {
            code = 5002;
        }
        res.json({
            code: code,
            message: errCode[code]
        })
    });
});

// 用户的个人微博列表
router.get('/getUserPostList', (req, res) => {
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        // 两种情况
        const selfUserId = doc._id;
        if (String(selfUserId) === String(req.query.uId)) {
            // 看自己的个人微博
            const result = {};
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
                }).then((docs) => {
                result.post = docs;
                return User.findOne({_id: req.query.uId})
                    .select('followers_count following_count name posts_count brief');
            }).then((doc) => {
                res.json({
                    code: 200,
                    items: result.post,
                    userInfo: doc
                })
            })
        } else {
            // 看别人的个人微博
            const result = {};
            User.findOne({_id: req.query.uId})
                .select('followers_count following_count name posts_count brief').then((doc) => {
                result.user = doc;
                // 查找该用户与自己的关系
                return RelationShip.findOne({following: req.query.uId, follower: selfUserId});
            }).then((doc) => {
                // 是否是粉丝
                result.following = !!doc;
                return RelationShip.findOne({follower: req.query.uId, following: selfUserId});
            }).then((doc) => {
                // 是否是关注自己的人
                result.follower = !!doc;
                // 互相关注
                if (result.follower && result.following) {
                    result.follow = 'eachOther';
                } else if (!result.follower && result.following) {
                    // 已经关注
                    result.follow = 'following';
                } else {
                    // 并没有关注
                    result.follow = 'none';
                }
                // 查找别人点赞的，不属于别人，也不属于自己的微博
                // 先找到别人点赞的所有微博
                return Action.find({action: 'attitude', user: req.query.uId})
                    .sort({_id: -1})
                    .populate({
                        path: 'post',
                        match: {
                            user: {
                                $nin: [req.query.uId, selfUserId]
                            }
                        },
                        populate: [
                            {
                                path: 'user',
                                select: 'name _id'
                            },
                            {
                                path: 'retweeted_post',
                                populate: {
                                    path: 'user',
                                    select: 'name'
                                }
                            }
                        ]
                    })
                    .populate('user');
            }).then((docs) => {
                result.attitude = [];
                docs.forEach(item => {
                    if (item.post) {
                        result.attitude.push(item);
                    }
                });
                return Post.find({user: req.query.uId})
                    .sort({_id: -1})
                    .populate('user', ['name'])
                    .populate('retweeted_post')
                    .populate({
                        path: 'retweeted_post',
                        populate: {
                            path: 'user',
                            select: 'name'
                        }
                    });
            }).then((docs) => {
                result.items = [];
                // 按时间排序
                let [i, j, k] = [0, 0, 0];
                // 先排序
                while (i < result.attitude.length && j < docs.length) {
                    if (new Date(result.attitude[i].createdAt).valueOf() >= new Date(docs[j].createdAt).valueOf()) {
                        result.items[k++] = result.attitude[i++];
                    } else {
                        result.items[k++] = docs[j++];
                    }
                }
                // 再把剩下的全放进去
                while (i < result.attitude.length) {
                    result.items[k++] = result.attitude[i++];
                }
                while (j < docs.length) {
                    result.items[k++] = docs[j++];
                }
                res.json({
                    code: 200,
                    items: result.items,
                    userInfo: result.user,
                    follow: result.follow
                })
            }).catch((err) => {
                console.log(err);
            })
        }
    }).catch((err) => {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        })
    })
})
;

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
    let result = {};
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
                .limit(3)
                .select('name brief');
        }).then((doc) => {
        result.user = doc;
        return User.findOne({token: req.headers['f-token']});
    }).then((doc) => {
        if (doc) {
            async.map(result.user, (item, callback) => {
                // 简单的深拷贝，不支持数据格式里面有函数
                const user = JSON.parse(JSON.stringify(item));
                RelationShip.findOne({
                    following: item._id,
                    follower: doc._id
                }, (err, following) => {
                    // 是否是粉丝
                    user.following = !!following;
                    RelationShip.findOne({
                        following: doc._id,
                        follower: item._id
                    }, (err, follower) => {
                        // 是否是关注的人
                        user.follower = !!follower;
                        // 互相关注
                        if (user.follower && user.following) {
                            user.follow = 'eachOther';
                        } else if (!user.follower && user.following) {
                            // 已经关注
                            user.follow = 'following';
                        } else {
                            // 并没有关注
                            user.follow = 'none';
                        }
                        callback(null, user);
                    });
                });
            }, (err, user) => {
                res.json({
                    user,
                    post: result.post,
                    code: 200
                });
            });
        }
    }).catch((err) => {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        })
    })
});

// 关注或者取关
router.post('/follow', (req, res) => {
    if (req.body.follow) {
        // 关注
        const result = {};
        User.findOne({token: req.headers['f-token']}).then((doc) => {
            if (String(doc._id) === String(req.body.uId)) {
                throw new Error('自己不能关注自己');
            }
            result.user = doc;
            // 先看看是否关注过
            return RelationShip.findOne({
                following: req.body.uId,
                follower: doc._id
            });
        }).then((doc) => {
            if (doc) {
                throw new Error('已经关注过了');
            } else {
                // 新增一条新关注
                const re = new RelationShip({
                    following: req.body.uId,
                    follower: result.user._id
                });
                return re.save();
            }
        }).then(() => {
            // 查询是否互相关注
            return RelationShip.findOne({
                follower: req.body.uId,
                following: result.user._id
            });
        }).then((doc) => {
            result.eachOtherFollow = !!doc;
            // 关注加一
            return User.update({token: req.headers['f-token']}, {$inc: {following_count: 1}});
        }).then(() => {
            // 粉丝加一
            return User.update({_id: req.body.uId}, {$inc: {followers_count: 1}});
        }).then(() => {
            res.json({
                code: 200,
                message: '关注成功',
                eachOtherFollow: result.eachOtherFollow
            })
        }).catch((err) => {
            console.log(err);
            let code;
            if (err.message === '自己不能关注自己') {
                code = 5008;
            } else if (err.message === '已经关注过了') {
                code = 5010;
            } else {
                code = 5001;
            }
            res.json({
                code,
                message: errCode[code]
            });
        })
    } else {
        // 取关
        User.findOne({token: req.headers['f-token']}).then((doc) => {
            // 先找是否有关注
            return RelationShip.findOne({
                following: req.body.uId,
                follower: doc._id
            });
        }).then((doc) => {
            if (doc) {
                return doc.remove();
            } else {
                throw new Error('没有关注过');
            }
        }).then(() => {
            // 粉丝减一
            return User.update({_id: req.body.uId}, {$inc: {followers_count: -1}});
        }).then(() => {
            // 关注减一
            return User.update({token: req.headers['f-token']}, {$inc: {following_count: -1}});
        }).then(() => {
            res.json({
                code: 200,
                message: '取关成功'
            })
        }).catch((err) => {
            console.log(err);
            let code;
            if (err.message === '没有关注过') {
                code = 5009;
            } else {
                code = 5001;
            }
            res.json({
                code,
                message: errCode[code]
            });
        })
    }
});

// 关注列表和粉丝列表
router.get('/getFollowList', (req, res) => {
    // 关注列表
    if (Number(req.query.follow)) {
        User.findOne({_id: req.query.uId}).then((doc) => {
            if (doc) {
                return RelationShip.find({follower: doc._id})
                    .populate('following', ['name', 'brief']);
            }
        }).then((docs) => {
            let followList = JSON.parse(JSON.stringify(docs));
            followList = followList.map((item) => {
                item.following.follow = true;
                return item;
            });
            res.json({
                code: 200,
                followList
            })
        }).catch((err) => {
            console.log(err);
            res.json({
                code: 5001,
                message: errCode[5001]
            })
        });
    } else {
        // 粉丝列表
        User.findOne({_id: req.query.uId}).then((doc) => {
            if (doc) {
                return RelationShip.find({following: doc._id})
                    .populate('follower', ['name', 'brief']);
            }
        }).then((docs) => {
            res.json({
                code: 200,
                followList: docs
            })
        }).catch((err) => {
            console.log(err);
            res.json({
                code: 5001,
                message: errCode[5001]
            })
        });
    }
});

// 判断用户是否在看自己的个人中心
router.get('/judgeUser', (req, res) => {
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        if (doc) {
            const self = String(doc._id) === req.query.uId;
            res.json({
                code: 200,
                self
            });
        } else {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
        }
    }).catch((err) => {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        })
    });
});

// 记录用户查看微博的行为
router.post('/clickIn', (req, res) => {
    const result = {};
    Post.findOne({_id: req.body.pId}).then((doc) => {
        result.user = doc.user;
        return User.findOne({token: req.headers['f-token']});
    }).then((doc) => {
        if (doc) {
            // 如果查看的是自己的微博
            if (String(doc._id) === String(result.user)) {
                throw new Error('看自己的微博不记录');
            } else {
                return new Action({
                    user: doc._id,
                    post: req.body.pId,
                    action: 'click'
                }).save();
            }
        } else {
            throw new Error('没有该用户');
        }
    }).then(() => {
        res.json({
            code: 200,
            message: '成功记录'
        })
    }).catch((err) => {
        console.log(err);
        let code = 5001;
        if (err.message === '没有该用户') {
            code = 5002;
        } else if (err.message === '看自己的微博不记录') {
            code = 5011;
        }
        res.json({
            code: code,
            message: errCode[code]
        })
    });
});

router.get('/recommend', (req, res) => {
    similar(req.headers['f-token']).then((data) => {
        res.json({
            code: 200,
            recommend: data
        })
    }).catch((err) => {
        console.log(err)
        res.json({
            code: 5001,
            message: errCode[5001]
        })
    });
});

export default router;

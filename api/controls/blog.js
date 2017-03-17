/**
 * Created by fengyuanzemin on 2017/3/17.
 */
import async from 'async';

import User from '../models/user';
import Post from '../models/post';
import Action from '../models/action';
import RelationShip from '../models/relationship';

import {errCode} from '../utils/codeTransfer';

function post(req, res) {
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
}

// 热门微博
function getHotList(req, res) {
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
}
// 已登录首页数据
function getList(req, res) {
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
}

// 用户的个人微博列表
function getUserPostList(req, res) {
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
}

// 只拿一个微博数据
function getPostItem(req, res) {
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
}

// 搜索
function search(req, res) {
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
}

// 关注列表和粉丝列表
function getFollowList(req, res) {
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
}

export default {
    post, getHotList, getList, getUserPostList,
    getPostItem, search, getFollowList
}
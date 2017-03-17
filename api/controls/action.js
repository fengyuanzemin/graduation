/**
 * Created by fengyuanzemin on 2017/3/17.
 */
import User from '../models/user';
import Post from '../models/post';
import Action from '../models/action';
import RelationShip from '../models/relationship';

import {errCode} from '../utils/codeTransfer';

// 转发
function repost(req, res) {
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
}

//评论
function comment(req, res) {
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
}

// 点赞
function attitude(req, res) {
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
}

// 关注或者取关
function follow(req, res) {
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
}
// 拉取转发、评论、点赞
function getActionInfo(req, res) {
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
}

export default {
    attitude, repost, comment, follow,
    getActionInfo
}
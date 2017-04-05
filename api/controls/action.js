/**
 * Created by fengyuanzemin on 2017/3/17.
 */
import User from '../models/user';
import Post from '../models/post';
import Action from '../models/action';
import RelationShip from '../models/relationship';

import errCode from '../utils/codeTransfer';

// 转发
export async function repost(req, res) {
    try {
        // 找到用户
        const user = await User.findOne({token: req.headers['f-token']});
        if (user) {
            // 用户转发行为添加
            await new Action({
                post: req.body.pId,
                user: user._id,
                content,
                action: 'repost'
            }).save();
        } else {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        const post = await Post.findOne({_id: req.body.pId}).populate('user', ['name']);
        // 不是原创
        let originalPostId = '';
        let content = '';
        // 判断转发时写什么
        if (post && post.retweeted_post) {
            originalPostId = post.retweeted_post;
            content = `${req.body.content} // @${post.user.name}：${post.content}`;
        } else {
            originalPostId = req.body.pId;
            content = req.body.content ? req.body.content : '转发';
        }
        // 文章的被转发数加一
        await Post.update({_id: req.body.pId}, {$inc: {reposts_count: 1}});
        // 用户的微博数加一
        await User.update({token: req.headers['f-token']}, {$inc: {posts_count: 1}});
        // 新添一条微博
        await new Post({
            user: user._id,
            content,
            retweeted_post: originalPostId
        }).save();
        res.json({
            code: 200,
            message: '操作成功'
        });
    } catch (err) {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    }
}

//评论
export async function comment(req, res) {
    if (!req.body.content) {
        res.json({
            code: 5004,
            message: errCode[5004]
        });
        return;
    }
    try {
        const user = await User.findOne({token: req.headers['f-token']});
        if (user) {
            // 用户评论行为加一
            await new Action({
                post: req.body.pId,
                user: user._id,
                content: req.body.content,
                action: 'comment'
            }).save();
        } else {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        // 微博评论数加一
        await Post.update({_id: req.body.pId}, {$inc: {comments_count: 1}});
        res.json({
            code: 200,
            message: '操作成功'
        });
    } catch (err) {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    }
}

// 点赞
export async function attitude(req, res) {
    try {
        let count = 1;
        // 查找用户
        const user = await User.findOne({token: req.headers['f-token']});
        if (!user) {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        // 查找之前是否点过赞
        const action = await Action.findOne({post: req.body.pId, user: user._id, action: 'attitude'});
        if (action) {
            count = -1;
            await action.remove();
        } else {
            await new Action({
                post: req.body.pId,
                user: user._id,
                action: 'attitude'
            }).save();
        }
        await Post.update({_id: req.body.pId}, {$inc: {attitudes_count: count}});
        if (count > 0) {
            res.json({
                code: 200,
                message: '点赞成功'
            });
        } else {
            res.json({
                code: 5007,
                message: errCode[5007]
            });
        }
    } catch (err) {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    }
}

// 关注或者取关
export async function follow(req, res) {
    try {
        const user = await User.findOne({token: req.headers['f-token']});
        if (!user) {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        if (String(user._id) === String(req.body.uId)) {
            res.json({
                code: 5008,
                message: errCode[5008]
            });
            return;
        }
        // 查询是否关注过
        const relationShip = await RelationShip.findOne({
            following: req.body.uId,
            follower: user._id
        });
        // 关注操作
        if (req.body.follow) {
            // 关注过
            if (relationShip) {
                res.json({
                    code: 5010,
                    message: errCode[5010]
                });
                return;
            } else {
                // 新增一条关注
                await new RelationShip({
                    following: req.body.uId,
                    follower: user._id
                }).save();
            }
            // 查询是否互相关注
            const eachOtherFollow = !!await RelationShip.findOne({
                follower: req.body.uId,
                following: user._id
            });
            // 关注加一
            await User.update({token: req.headers['f-token']}, {$inc: {following_count: 1}});
            // 粉丝加一
            await User.update({_id: req.body.uId}, {$inc: {followers_count: 1}});
            res.json({
                code: 200,
                message: '关注成功',
                eachOtherFollow
            })
        } else {
            // 取关操作
            if (relationShip) {
                await relationShip.remove();
            } else {
                res.json({
                    code: 5009,
                    message: errCode[5009]
                });
                return;
            }
            // 粉丝减一
            await User.update({_id: req.body.uId}, {$inc: {followers_count: -1}});
            // 关注减一
            await User.update({token: req.headers['f-token']}, {$inc: {following_count: -1}});
            res.json({
                code: 200,
                message: '取关成功'
            });
        }
    } catch (err) {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    }
}

// 记录用户查看微博的行为
export async function clickIn(req, res) {
    try {
        const post = await Post.findOne({_id: req.body.pId});
        const user = await User.findOne({token: req.headers['f-token']});
        if (user && post) {
            if (String(user._id) === String(post.user)) {
                res.json({
                    code: 5011,
                    message: errCode[5011]
                });
            } else {
                await new Action({
                    user: user._id,
                    post: req.body.pId,
                    action: 'click'
                }).save();
                res.json({
                    code: 200,
                    message: '成功记录'
                });
            }
        } else {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
        }
    } catch (err) {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    }
}

// 拉取转发、评论、点赞
export async function getActionInfo(req, res) {
    try {
        const user = await User.findOne({token: req.headers['f-token']});
        if (!user) {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        const items = await Action.find({post: req.query.pId, action: req.query.action})
            .populate('user', ['name']).sort({_id: -1});
        res.json({
            items,
            code: 200
        });
    } catch (err) {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    }
}

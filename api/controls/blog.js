/**
 * Created by fengyuanzemin on 2017/3/17.
 */
import User from '../models/user';
import Post from '../models/post';
import Action from '../models/action';
import RelationShip from '../models/relationship';

import {errCode} from '../utils/codeTransfer';

async function post(req, res) {
    if (!req.body.text) {
        res.json({
            code: 5004,
            message: errCode[5004]
        });
        return;
    }
    try {
        // 查找用户
        let user = await User.findOne({token: req.headers['f-token']});
        if (user) {
            user.posts_count += 1;
            await user.save();
        } else {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        // 添加新微博
        await new Post({
            user: user._id,
            content: req.body.text
        }).save();
        res.json({
            message: '发送成功',
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

// 热门微博
async function getHotList(req, res) {
    try {
        const cardList = await Post.find()
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
        res.json({
            cardList,
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
// 已登录首页数据
async function getList(req, res) {
    try {
        let userArr = [];
        let user = await User.findOne({token: req.headers['f-token']});
        if (!user) {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        userArr.push(user._id);
        let relationShip = await RelationShip.find({follower: user._id});
        relationShip.forEach(item => {
            userArr.push(item.following);
        });
        let cardList = await Post.find({user: {$in: userArr}})
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
        res.json({
            cardList,
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

// 用户的个人微博列表
async function getUserPostList(req, res) {
    try {
        let user = await User.findOne({token: req.headers['f-token']});
        if (!user) {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        let userInfo = await User.findOne({_id: req.query.uId})
            .select('followers_count following_count name posts_count brief');
        if (String(user._id) === String(req.query.uId)) {
            // 看自己的个人微博
            let items = await Post.find({user: req.query.uId})
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
            res.json({
                code: 200,
                items,
                userInfo
            });
        } else {
            // 看别人微博
            let follow;
            // 是否是已经关注ta
            let following = await RelationShip.findOne({following: req.query.uId, follower: user._id});
            // 是否是粉丝
            let follower = await RelationShip.findOne({follower: req.query.uId, following: user._id});
            // 互相关注
            if (follower && following) {
                follow = 'eachOther';
            } else if (!follower && following) {
                // 已经关注
                follow = 'following';
            } else {
                // 并没有关注
                follow = 'none';
            }
            // 查找别人点赞的，不属于别人，也不属于自己的微博
            // 先找到别人点赞的所有微博
            let action = await Action.find({action: 'attitude', user: req.query.uId})
                .sort({_id: -1})
                .populate({
                    path: 'post',
                    match: {
                        user: {
                            $nin: [req.query.uId, user._id]
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
            let attitude = [];
            // 放入attitude数组中
            action.forEach(item => {
                if (item.post) {
                    attitude.push(item);
                }
            });
            // 再找到他的所有微博
            let postArr = await Post.find({user: req.query.uId})
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
            // 按时间排序
            let [i, j, k] = [0, 0, 0];
            let items = [];
            // 先排序
            while (i < attitude.length && j < postArr.length) {
                if (new Date(attitude[i].createdAt).valueOf() >= new Date(postArr[j].createdAt).valueOf()) {
                    items[k++] = attitude[i++];
                } else {
                    items[k++] = postArr[j++];
                }
            }
            // 再把剩下的全放进去
            while (i < attitude.length) {
                items[k++] = attitude[i++];
            }
            while (j < postArr.length) {
                items[k++] = postArr[j++];
            }
            res.json({
                code: 200,
                items,
                userInfo,
                follow
            })
        }
    } catch (err) {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    }

    // User.findOne({token: req.headers['f-token']}).then((doc) => {
    //     // 两种情况
    //     const selfUserId = doc._id;
    //     if (String(selfUserId) === String(req.query.uId)) {
    //         // 看自己的个人微博
    //         const result = {};
    //         Post.find({user: req.query.uId})
    //             .sort({_id: -1})
    //             .populate('user', ['name'])
    //             .populate('retweeted_post')
    //             .populate({
    //                 path: 'retweeted_post',
    //                 populate: {
    //                     path: 'user',
    //                     select: 'name'
    //                 }
    //             }).then((docs) => {
    //             result.post = docs;
    //             return User.findOne({_id: req.query.uId})
    //                 .select('followers_count following_count name posts_count brief');
    //         }).then((doc) => {
    //             res.json({
    //                 code: 200,
    //                 items: result.post,
    //                 userInfo: doc
    //             })
    //         })
    //     } else {
    //         // 看别人的个人微博
    //         const result = {};
    //         User.findOne({_id: req.query.uId})
    //             .select('followers_count following_count name posts_count brief').then((doc) => {
    //             result.user = doc;
    //             // 查找该用户与自己的关系
    //             return RelationShip.findOne({following: req.query.uId, follower: selfUserId});
    //         }).then((doc) => {
    //             // 是否是粉丝
    //             result.following = !!doc;
    //             return RelationShip.findOne({follower: req.query.uId, following: selfUserId});
    //         }).then((doc) => {
    //             // 是否是关注自己的人
    //             result.follower = !!doc;
    //             // 互相关注
    //             if (result.follower && result.following) {
    //                 result.follow = 'eachOther';
    //             } else if (!result.follower && result.following) {
    //                 // 已经关注
    //                 result.follow = 'following';
    //             } else {
    //                 // 并没有关注
    //                 result.follow = 'none';
    //             }
    //             // 查找别人点赞的，不属于别人，也不属于自己的微博
    //             // 先找到别人点赞的所有微博
    //             return Action.find({action: 'attitude', user: req.query.uId})
    //                 .sort({_id: -1})
    //                 .populate({
    //                     path: 'post',
    //                     match: {
    //                         user: {
    //                             $nin: [req.query.uId, selfUserId]
    //                         }
    //                     },
    //                     populate: [
    //                         {
    //                             path: 'user',
    //                             select: 'name _id'
    //                         },
    //                         {
    //                             path: 'retweeted_post',
    //                             populate: {
    //                                 path: 'user',
    //                                 select: 'name'
    //                             }
    //                         }
    //                     ]
    //                 })
    //                 .populate('user');
    //         }).then((docs) => {
    //             result.attitude = [];
    //             docs.forEach(item => {
    //                 if (item.post) {
    //                     result.attitude.push(item);
    //                 }
    //             });
    //             return Post.find({user: req.query.uId})
    //                 .sort({_id: -1})
    //                 .populate('user', ['name'])
    //                 .populate('retweeted_post')
    //                 .populate({
    //                     path: 'retweeted_post',
    //                     populate: {
    //                         path: 'user',
    //                         select: 'name'
    //                     }
    //                 });
    //         }).then((docs) => {
    //             result.items = [];
    //             // 按时间排序
    //             let [i, j, k] = [0, 0, 0];
    //             // 先排序
    //             while (i < result.attitude.length && j < docs.length) {
    //                 if (new Date(result.attitude[i].createdAt).valueOf() >= new Date(docs[j].createdAt).valueOf()) {
    //                     result.items[k++] = result.attitude[i++];
    //                 } else {
    //                     result.items[k++] = docs[j++];
    //                 }
    //             }
    //             // 再把剩下的全放进去
    //             while (i < result.attitude.length) {
    //                 result.items[k++] = result.attitude[i++];
    //             }
    //             while (j < docs.length) {
    //                 result.items[k++] = docs[j++];
    //             }
    //             res.json({
    //                 code: 200,
    //                 items: result.items,
    //                 userInfo: result.user,
    //                 follow: result.follow
    //             })
    //         }).catch((err) => {
    //             console.log(err);
    //         })
    //     }
    // }).catch((err) => {
    //     console.log(err);
    //     res.json({
    //         code: 5001,
    //         message: errCode[5001]
    //     })
    // })
}

// 只拿一个微博数据
async function getPostItem(req, res) {
    try {
        const detail = await Post.findOne({_id: req.query.pId})
            .select('attitudes_count comments_count content createdAt reposts_count user retweeted_post')
            .populate('user', ['name'])
            .populate('retweeted_post')
            .populate({
                path: 'retweeted_post',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            });
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
    } catch (err) {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    }
}

// 搜索
async function search(req, res) {
    try {
        let user = await User.findOne({token: req.headers['f-token']});
        if (!user) {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        let post = await Post.find({content: {'$regex': req.query.text}})
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
            });
        let userSearch = await User.find({name: {'$regex': req.query.text}})
            .limit(3)
            .select('name brief');
        // 找到搜出来的用户是否已经关注
        let userArr = [];
        for (let u of userSearch) {
            let parseU = JSON.parse(JSON.stringify(u));
            let following = await RelationShip.findOne({
                following: u._id,
                follower: user._id
            });
            let follower = await RelationShip.findOne({
                following: user._id,
                follower: u._id
            });
            if (follower && following) {
                // 互相关注
                parseU.follow = 'eachOther';
            } else if (!follower && following) {
                // 已经关注
                parseU.follow = 'following';
            } else {
                // 并没有关注
                parseU.follow = 'none';
            }
            userArr.push(parseU);
        }
        res.json({
            user: userArr,
            post: post,
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

// 关注列表和粉丝列表
async function getFollowList(req, res) {
    try {
        let user = await User.findOne({_id: req.query.uId});
        if (!user) {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        if (Number(req.query.follow)) {
            let relationShip = await RelationShip.find({follower: user._id})
                .populate('following', ['name', 'brief']);
            let followList = JSON.parse(JSON.stringify(relationShip));
            followList = followList.map((item) => {
                item.following.follow = true;
                return item;
            });
            res.json({
                code: 200,
                followList
            })
        } else {
            let followList = await RelationShip.find({following: user._id})
                .populate('follower', ['name', 'brief']);
            res.json({
                code: 200,
                followList
            })
        }
    } catch (err) {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        })
    }
}

export default {
    post, getHotList, getList, getUserPostList,
    getPostItem, search, getFollowList
}
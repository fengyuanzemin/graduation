/**
 * Created by fengyuanzemin on 2017/3/17.
 */
import User from '../models/user';
import Post from '../models/post';
import Action from '../models/action';
import RelationShip from '../models/relationship';

import {errCode} from '../utils/codeTransfer';

// 发送原创微博
export async function post(req, res) {
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
export async function getHotList(req, res) {
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
export async function getList(req, res) {
    try {
        const user = await User.findOne({token: req.headers['f-token']});
        if (!user) {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        let userArr = [];
        userArr.push(user._id);
        // 找到关注过的
        const relationShip = await RelationShip.find({follower: user._id});
        relationShip.forEach(item => {
            userArr.push(item.following);
        });
        // 找到所有的数据
        const cards = await Post.find({user: {$in: userArr}})
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
        let cardList = [];
        // 判断用户在当前数据是否点过赞
        for (let card of cards) {
            const c = JSON.parse(JSON.stringify(card));
            c.attituded = !!await Action.findOne({user: user._id, post: c._id, action: 'attitude'});
            cardList.push(c);
        }
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
export async function getUserPostList(req, res) {
    try {
        const user = await User.findOne({token: req.headers['f-token']});
        if (!user) {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        // 用户个人介绍
        const userInfo = await User.findOne({_id: req.query.uId})
            .select('followers_count following_count name posts_count brief');
        if (String(user._id) === String(req.query.uId)) {
            // 看自己的个人微博
            const postItems = await Post.find({user: req.query.uId})
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
            // 查看自己是否点过赞
            let items = [];
            for (let item of postItems) {
                const i = JSON.parse(JSON.stringify(item));
                i.attituded = !!await Action.findOne({post: i._id, user: user._id, action: 'attitude'});
                items.push(i);
            }
            res.json({
                code: 200,
                items,
                userInfo
            });
        } else {
            // 看别人微博
            let follow;
            // 是否是已经关注ta
            const following = await RelationShip.findOne({following: req.query.uId, follower: user._id});
            // 是否是粉丝
            const follower = await RelationShip.findOne({follower: req.query.uId, following: user._id});
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
            const action = await Action.find({action: 'attitude', user: req.query.uId})
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
            const postArr = await Post.find({user: req.query.uId})
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
            let postItems = [];
            // 先排序
            while (i < attitude.length && j < postArr.length) {
                if (new Date(attitude[i].createdAt).valueOf() >= new Date(postArr[j].createdAt).valueOf()) {
                    postItems[k++] = attitude[i++];
                } else {
                    postItems[k++] = postArr[j++];
                }
            }
            // 再把剩下的全放进去
            while (i < attitude.length) {
                postItems[k++] = attitude[i++];
            }
            while (j < postArr.length) {
                postItems[k++] = postArr[j++];
            }
            // 查看自己是否点过赞
            let items = [];
            for (let item of postItems) {
                const i = JSON.parse(JSON.stringify(item));
                i.attituded = !!await Action.findOne({post: i._id, user: user._id, action: 'attitude'});
                items.push(i);
            }
            // // 关注他的人
            // const userFollower = await RelationShip.find({
            //     following: req.query.uId,
            //     follower: {
            //         $ne: user._id
            //     }
            // }).populate('follower');
            // // 也关注他
            // let userRecommend = [];
            // for (let u of userFollower) {
            //     const userR = await RelationShip.find({
            //         following: {
            //             $nin: [
            //                 user._id,
            //                 req.query.uId
            //             ]
            //         },
            //         follower: u.follower
            //     }).populate('following');
            //     userRecommend = userRecommend.concat(userR);
            // }
            res.json({
                code: 200,
                items,
                userInfo,
                follow,
                // userRecommend
            })
        }
    } catch (err) {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    }
}

// 只拿一个微博数据
export async function getPostItem(req, res) {
    try {
        const user = await User.findOne({token: req.headers['f-token']});
        if (!user) {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        const post = await Post.findOne({_id: req.query.pId})
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
        if (post) {
            const detail = JSON.parse(JSON.stringify(post));
            detail.attituded = !!await Action.findOne({user: user._id, post: post._id, action: 'attitude'});
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
export async function search(req, res) {
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
export async function getFollowList(req, res) {
    try {
        // 该用户
        const userSelf = await User.findOne({token: req.headers['f-token']});
        if (!userSelf) {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        // 观看的用户的微博，可能是自己
        const user = await User.findOne({_id: req.query.uId});
        if (Number(req.query.follow)) {
            let relationShip = await RelationShip.find({follower: user._id})
                .populate('following', ['name', 'brief']);
            let followList = [];
            for (let u of relationShip) {
                let parseU = JSON.parse(JSON.stringify(u));
                let following = await RelationShip.findOne({
                    following: u.following._id,
                    follower: userSelf._id
                });
                let follower = await RelationShip.findOne({
                    following: userSelf._id,
                    follower: u.following._id
                });
                if (follower && following) {
                    // 互相关注
                    parseU.following.follow = 'eachOther';
                } else if (!follower && following) {
                    // 已经关注
                    parseU.following.follow = 'following';
                } else {
                    // 并没有关注
                    parseU.following.follow = 'none';
                }
                followList.push(parseU);
            }
            res.json({
                code: 200,
                followList
            })
        }
        else {
            const relationShip = await RelationShip.find({following: user._id})
                .populate('follower', ['name', 'brief']);
            let followList = [];
            for (let u of relationShip) {
                let parseU = JSON.parse(JSON.stringify(u));
                let following = await RelationShip.findOne({
                    following: u.follower._id,
                    follower: userSelf._id
                });
                let follower = await RelationShip.findOne({
                    following: userSelf._id,
                    follower: u.follower._id
                });
                if (follower && following) {
                    // 互相关注
                    parseU.follower.follow = 'eachOther';
                } else if (!follower && following) {
                    // 已经关注
                    parseU.follower.follow = 'following';
                } else {
                    // 并没有关注
                    parseU.follower.follow = 'none';
                }
                followList.push(parseU);
            }
            res.json({
                code: 200,
                followList
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

// 转发时，取得转发的微博的数据


// 评论时，取得评论的微博的数据

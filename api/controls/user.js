/**
 * Created by fengyuanzemin on 2017/3/17.
 */
import bcrypt from 'bcrypt';

import {errCode} from '../utils/codeTransfer';
import {saltRounds} from '../config/salt';
import {randomKey} from '../utils';

import User from '../models/user';
import Post from '../models/post';
import Action from '../models/action';

// 登录
async function login(req, res) {
    try {
        const user = await User.findOne({name: req.body.name});
        let doc;
        if (user) {
            doc = await bcrypt.compare(req.body.password, user.password);
        } else {
            res.json({
                message: errCode[5000],
                code: 5000
            });
            return;
        }
        if (doc) {
            res.json({
                message: '登录成功',
                token: user.token,
                code: 200
            })
        } else {
            res.json({
                message: errCode[5000],
                code: 5000
            });
        }
    } catch (err) {
        console.log(err);
        res.json({
            message: errCode[5001],
            code: 5001
        });
    }
}

// 注册
async function signUp(req, res) {
    try {
        const token = randomKey();
        const hash = await bcrypt.hash(req.body.password, saltRounds);
        await new User({
            name: req.body.name,
            password: hash,
            token
        }).save();
        res.json({
            message: '注册成功',
            token,
            code: 200
        });
    } catch (err) {
        console.log(err);
        res.json({
            message: errCode[err.code] || '注册失败',
            code: err.code
        });
    }
}

// 判断用户是否登录
async function checkToken(req, res) {
    try {
        const user = await User.findOne({token: req.headers['f-token']});
        res.json({
            loggedIn: !!user,
            code: 200
        })
    } catch (err) {
        console.log(err);
        res.json({
            message: errCode[5001],
            code: 5001
        });
    }
}

// 判断用户是否在看自己的个人中心
async function judgeUser(req, res) {
    try {
        const doc = await User.findOne({token: req.headers['f-token']});
        if (doc) {
            res.json({
                code: 200,
                self: String(doc._id) === String(req.query.uId)
            });
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
        })
    }
}

// 记录用户查看微博的行为
async function clickIn(req, res) {
    try {
        let post = await Post.findOne({_id: req.body.pId});
        let user = await User.findOne({token: req.headers['f-token']});
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
// 更改用户简介
async function updateUserInfo(req, res) {
    if (!(req.body.name || req.body.brief)) {
        res.json({
            code: 5004,
            message: errCode[5004]
        });
        return;
    }
    try {
        let user = await User.findOne({token: req.headers['f-token']});
        if (user) {
            if (req.body.name) {
                user.name = req.body.name;
            }
            if (req.body.brief) {
                user.brief = req.body.brief;
            }
            await user.save();
            res.json({
                code: 200,
                message: '更改成功'
            });
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

// 用户简介
async function getUserInfo(req, res) {
    try {
        const userInfo = await User.findOne({token: req.headers['f-token']})
            .select('followers_count following_count name posts_count brief');
        if (userInfo) {
            res.json({
                userInfo,
                code: 200
            });
        } else {
            res.json({
                code: 5002,
                message: errCode[5002]
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
// 在微博正文检查用户是否点过赞
async function checkAttitude(req, res) {
    try {
        const user = await User.findOne({token: req.headers['f-token']});
        if (user) {
            const action = await Action.find({post: req.query.pId, user: user._id, action: 'attitude'});
            res.json({
                code: 200,
                check: action.length > 0
            })
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
export default {
    login, signUp, checkToken, judgeUser, clickIn,
    updateUserInfo, getUserInfo, checkAttitude
}
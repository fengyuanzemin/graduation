/**
 * Created by fengyuanzemin on 2017/3/17.
 */
import bcrypt from 'bcrypt';

import {errCode} from '../utils/codeTransfer';
import {saltRounds} from '../config/salt';
import {randomKey} from '../utils';

import User from '../models/user';
import Action from '../models/action';

// 登录
export async function login(req, res) {
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
export async function signUp(req, res) {
    try {
        let token = randomKey();
        let tokenExist = await User.findOne({token});
        // 检查token是否已经存在了
        while (tokenExist) {
            token = randomKey();
            tokenExist = await User.findOne({token});
        }
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
export async function checkToken(req, res) {
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
export async function judgeUser(req, res) {
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

// 更改用户简介
export async function updateUserInfo(req, res) {
    if (!(req.body.name || req.body.brief)) {
        res.json({
            code: 5004,
            message: errCode[5004]
        });
        return;
    }
    try {
        const user = await User.findOne({token: req.headers['f-token']});
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
export async function getUserInfo(req, res) {
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
export async function checkAttitude(req, res) {
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

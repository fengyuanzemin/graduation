/**
 * Created by fengyuanzemin on 2017/3/17.
 */
import bcrypt from 'bcrypt';

import {errCode} from '../utils/codeTransfer';
import {saltRounds} from '../config/salt';

import User from '../models/user';
import Post from '../models/post';
import Action from '../models/action';

// 登录
function login(req, res) {
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
}

// 注册
function signUp(req, res) {
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
}

// 判断用户是否登录
function checkToken(req, res) {
    User.findOne({token: req.headers['f-token']}).then((doc) => {
        res.json({
            loggedIn: !!doc,
            code: 200
        })
    })
}

// 判断用户是否在看自己的个人中心
function judgeUser(req, res) {
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
}

// 记录用户查看微博的行为
function clickIn(req, res) {
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
}
// 更改用户简介
function updateUserInfo(req, res) {
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
}

// 用户简介
function getUserInfo(req, res) {
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
}
// 在微博正文检查用户是否点过赞
function checkAttitude(req, res) {
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
}
export default {
    login, signUp, checkToken, judgeUser, clickIn,
    updateUserInfo, getUserInfo, checkAttitude
}
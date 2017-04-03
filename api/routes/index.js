import express from 'express';
const router = express.Router();

import * as user from '../controls/user';
import * as action from '../controls/action';
import * as recommend from '../controls/recommend';
import * as blog from '../controls/blog';

// 空请求
router.get('/', (req, res) => {
    res.json({
        message: '首页',
        code: 200
    });
});

/**
 * user route
 */

// 登录
router.post('/login', user.login);

// 注册
router.post('/sign-up', user.signUp);

// 判断用户是否登录
router.get('/checkToken', user.checkToken);

// 用户简介
router.get('/getUserInfo', user.getUserInfo);

// 更改用户简介
router.post('/updateUserInfo', user.updateUserInfo);

// 在微博正文检查用户是否点过赞
router.get('/checkAttitude', user.checkAttitude);

// 判断用户是否在看自己的个人中心
router.get('/judgeUser', user.judgeUser);

/**
 * blog route
 */

// 发送微博
router.post('/post', blog.post);

// 热门微博
router.get('/getHotList', blog.getHotList);

// 已登录首页数据
router.get('/getList', blog.getList);

// 用户的个人微博列表
router.get('/getUserPostList', blog.getUserPostList);

// 只拿一个微博数据
router.get('/getPostItem', blog.getPostItem);

// 搜索
router.get('/search', blog.search);

// 关注列表和粉丝列表
router.get('/getFollowList', blog.getFollowList);

/**
 * action route
 */

// 转发
router.post('/repost', action.repost);

// 评论
router.post('/comment', action.comment);

// 点赞
router.post('/attitude', action.attitude);

// 拉取转发、评论、点赞
router.get('/getActionInfo', action.getActionInfo);

// 关注或者取关
router.post('/follow', action.follow);

// 记录用户查看微博的行为
router.post('/clickIn', action.clickIn);

/**
 * recommend route
 */

// 推荐用户
router.get('/recommend', recommend.getUserRecommend);

export default router;

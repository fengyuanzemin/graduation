import express from 'express';
import * as user from '../controls/user';
import * as action from '../controls/action';
import * as recommend from '../controls/recommend';
import * as post from '../controls/post';
import * as movie from '../controls/movie';

const router = express.Router();

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

// 在文章正文检查用户是否点过赞
router.get('/checkAttitude', user.checkAttitude);

// 判断用户是否在看自己的个人中心
router.get('/judgeUser', user.judgeUser);

/**
 * post route
 */

// 发送文章
router.post('/post', post.post);

// 热门文章
router.get('/getHotList', post.getHotList);

// 已登录首页数据
router.get('/getList', post.getList);

// 用户的个人文章列表
router.get('/getUserPostList', post.getUserPostList);

// 只拿一个文章数据
router.get('/getPostItem', post.getPostItem);

// 搜索
router.get('/search', post.search);

// 关注列表和粉丝列表
router.get('/getFollowList', post.getFollowList);

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

// 记录用户查看文章／电影的行为
router.post('/clickIn', action.clickIn);

/**
 * movie route
 */

// 热门电影
router.get('/hotMovieList', movie.hotMovieList);

// 已登录电影列表
router.get('/movieList', movie.movieList);

// 电影详情关联的评价
router.get('/movieComment', movie.movieComment);

// 发布电影评价
router.post('/moviePostComment', movie.moviePostComment);

/**
 * recommend route
 */

// 推荐用户
router.get('/recommend', recommend.getUserRecommend);

// 为什么推荐用户
router.get('/why', recommend.getWhy);

export default router;

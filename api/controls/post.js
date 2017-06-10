/**
 * Created by fengyuanzemin on 2017/3/17.
 */
import User from '../models/user';
import Post from '../models/post';
import Action from '../models/action';
import Hot from '../models/hot';
import Movie from '../models/movie';
import RelationShip from '../models/relationship';
import Similar from '../models/similar';

import errCode from '../utils/codeTransfer';
import { PAGE_OPTION } from '../utils/const';
import { recommend } from '../algorithm/calculate';

// 发送原创文章
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
    const user = await User.findOne({ token: req.headers['f-token'] });
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
    // 添加新文章
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

// 热门文章
export async function getHotList(req, res) {
  try {
    // 分页，一页多少条数据
    const size = req.query.size ? Number(req.query.size) : PAGE_OPTION.size;
    // 跳过前面多少条
    const skip = req.query.page ? Number(req.query.page) * size : PAGE_OPTION.page * size;
    const cardList = await Hot.find({ type: 'post' })
      .sort({ point: -1, _id: -1 })
      .limit(size)
      .skip(skip)
      .populate({
        path: 'post',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .populate({
        path: 'post',
        populate: {
          path: 'retweeted_post',
          populate: {
            path: 'user',
            select: 'name'
          }
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
    const user = await User.findOne({ token: req.headers['f-token'] });
    if (!user) {
      res.json({
        code: 5002,
        message: errCode[5002]
      });
      return;
    }
    // 分页，一页多少条数据
    const size = req.query.size ? Number(req.query.size) : PAGE_OPTION.size;
    // 跳过前面多少条
    const skip = req.query.page ? Number(req.query.page) * size : PAGE_OPTION.page * size;
    // 此数组放置用户ID和用户关注的人的ID
    const userArr = [];
    userArr.push(user._id);
    // 找到关注过的
    const relationShip = await RelationShip.find({ follower: user._id });
    relationShip.forEach((item) => {
      userArr.push(item.following);
    });
    // 找到所有的数据
    let cards = await Post.find({ user: { $in: userArr } })
      .select('attitudes_count comments_count content createdAt reposts_count user retweeted_post')
      .sort({ _id: -1 })
      .limit(size)
      .skip(skip)
      .populate('user', ['name'])
      .populate('retweeted_post')
      .populate({
        path: 'retweeted_post',
        populate: {
          path: 'user',
          select: 'name'
        }
      });
    /**
     * 推荐列表里的用户的文章
     * 很多文章才推荐
     */
    let cardsRecommend = [];
    if (cards.length === 10) {
      const userRecommend = await recommend(user);
      cardsRecommend = await Post.find({ user: { $in: userRecommend } })
        .select('attitudes_count comments_count content createdAt reposts_count user retweeted_post')
        .sort({ _id: -1 })
        .limit(1)
        .skip(+req.query.page)
        .populate('user', ['name'])
        .populate('retweeted_post')
        .populate({
          path: 'retweeted_post',
          populate: {
            path: 'user',
            select: 'name'
          }
        });
      cardsRecommend = JSON.parse(JSON.stringify(cardsRecommend)).map(item => {
        item.recommend = true;
        return item;
      });
      if (cardsRecommend.length > 0) {
        cards.splice(Math.floor(Math.random() * cards.length), 0, cardsRecommend[0]);
      }
    }
    /**
     * 用户首页为空的情况下
     */
      // 这是热门文章的标志位
    let hot = false;
    if (cards.length === 0 && +req.query.page === 0) {
      hot = true;
      // 直接展示热门文章
      cards = await Hot.find({ type: 'post' })
        .sort({ point: -1 })
        .populate({
          path: 'post',
          populate: {
            path: 'user',
            select: 'name'
          }
        })
        .populate({
          path: 'post',
          populate: {
            path: 'retweeted_post',
            populate: {
              path: 'user',
              select: 'name'
            }
          }
        });
    }
    let cardList = [];
    // 判断用户在当前数据是否点过赞
    for (let card of cards) {
      const c = JSON.parse(JSON.stringify(card));
      c.attituded = !!await Action.findOne({
        user: user._id,
        post: hot ? c.post._id : c._id,
        action: 'attitude',
        type: 'post'
      });
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

// 用户的个人文章列表
export async function getUserPostList(req, res) {
  try {
    const user = await User.findOne({ token: req.headers['f-token'] });
    if (!user) {
      res.json({
        code: 5002,
        message: errCode[5002]
      });
      return;
    }
    // 分页，一页多少条数据
    const size = req.query.size ? Number(req.query.size) : PAGE_OPTION.size;
    // 跳过前面多少条
    const skip = req.query.page ? Number(req.query.page) * size : PAGE_OPTION.page * size;
    // 用户个人介绍
    let userInfo = await User.findOne({ _id: req.query.uId })
      .select('followers_count following_count name posts_count brief');
    if (String(user._id) === String(req.query.uId)) {
      // 看自己的个人文章
      const postItems = await Post.find({ user: req.query.uId })
        .sort({ _id: -1 })
        .limit(size)
        .skip(skip)
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
        i.attituded = !!await Action.findOne({
          post: i._id,
          user: user._id,
          type: 'post',
          action: 'attitude'
        });
        items.push(i);
      }
      res.json({
        code: 200,
        items,
        userInfo
      });
    } else {
      // 看别人文章
      let follow;
      // 是否是已经关注ta
      const following = await RelationShip.findOne({ following: req.query.uId, follower: user._id });
      // 是否是粉丝
      const follower = await RelationShip.findOne({ follower: req.query.uId, following: user._id });
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
      userInfo = JSON.parse(JSON.stringify(userInfo));
      userInfo.follow = follow;
      // 查找别人点赞的，不属于别人，也不属于自己的文章
      // 先找到别人点赞的所有文章
      const action = await Action.find({ action: 'attitude', user: req.query.uId, type: 'post' })
        .sort({ _id: -1 })
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
      // 再找到他的所有文章
      const postArr = await Post.find({ user: req.query.uId })
        .sort({ _id: -1 })
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
        i.attituded = !!await Action.findOne({
          post: i._id,
          user: user._id,
          action: 'attitude',
          type: 'post'
        });
        items.push(i);
      }
      // 拿这里面的分页数据
      if (items.length > skip) {
        // 最后一页了
        if (skip + size > items.length) {
          items = items.slice(skip === 0 ? 0 : skip - 1);
        } else {
          // 不是最后一页
          items = items.slice(skip === 0 ? 0 : skip - 1, skip + size - 1);
        }
      } else {
        // 这个时候说明已经没数据了
        items = items.slice(skip === 0 ? 0 : skip - 1);
      }
      // 给当前用户推荐可能认识的人
      let recommend = [];
      // 首先这得是自己的关注
      if (following) {
        // 别人熟悉的人
        const userASimilar = await Similar.find({
          $or: [
            { userA: req.query.uId },
            { userB: req.query.uId }
          ]
        }).sort({ similar: -1 });
        // 该用户熟悉的人
        const userBSimilar = await Similar.find({
          $or: [
            { userA: user._id },
            { userB: user._id }
          ]
        }).sort({ similar: -1 });
        // 只取出用户ID
        const userA = userASimilar.map(item =>
          String(item.userA) === String(req.query.uId) ?
            String(item.userB) : String(item.userA));
        const userB = userBSimilar.map(item =>
          String(item.userA) === String(user._id) ?
            String(item.userB) : String(item.userA));
        // 相似度有交集的
        const userAB = userA.filter(a => userB.includes(a));
        // 查看自己是否关注过这几个人
        for (let u of userAB) {
          let isFollow = await RelationShip.findOne({
            following: u,
            follower: user._id
          });
          // 自己并没有关注他
          // 放进可能喜欢的数组里面
          if (!isFollow) {
            recommend.push(u);
          }
        }
      }
      let userRecommend = await User.find({ _id: { $in: recommend } }).select('name brief');
      // 都是未关注的
      userRecommend = JSON.parse(JSON.stringify(userRecommend)).map(item => {
        item.follow = 'none';
        return item;
      });
      res.json({
        code: 200,
        items,
        userInfo,
        userRecommend
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

// 只拿一个文章数据
export async function getPostItem(req, res) {
  try {
    const user = await User.findOne({ token: req.headers['f-token'] });
    if (!user) {
      res.json({
        code: 5002,
        message: errCode[5002]
      });
      return;
    }
    const post = await Post.findOne({ _id: req.query.pId })
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
      detail.attituded = !!await Action.findOne({
        user: user._id,
        post: post._id,
        action: 'attitude',
        type: 'post'
      });
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
    const user = await User.findOne({ token: req.headers['f-token'] });
    if (!user) {
      res.json({
        code: 5002,
        message: errCode[5002]
      });
      return;
    }
    const post = await Post.find({ content: { '$regex': req.query.text } })
      .sort({ _id: -1 })
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
    const userSearch = await User.find({ name: { '$regex': req.query.text } })
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
    // 搜索电影
    const movie = await Movie.find({
      $or: [
        { brief: { '$regex': req.query.text } },
        { title: { '$regex': req.query.text } },
        { tags: { '$regex': req.query.text } },
        { directors: { '$regex': req.query.text } },
        { actors: { '$regex': req.query.text } }
      ]
    }).limit(3);
    res.json({
      user: userArr,
      post,
      movie,
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
    const userSelf = await User.findOne({ token: req.headers['f-token'] });
    if (!userSelf) {
      res.json({
        code: 5002,
        message: errCode[5002]
      });
      return;
    }
    // 分页，一页多少条数据
    const size = req.query.size ? Number(req.query.size) : PAGE_OPTION.size;
    // 跳过前面多少条
    const skip = req.query.page ? Number(req.query.page) * size : PAGE_OPTION.page * size;
    // 观看的用户的文章，可能是自己
    const user = await User.findOne({ _id: req.query.uId });
    if (Number(req.query.follow)) {
      let relationShip = await RelationShip.find({ follower: user._id })
        .populate('following', ['name', 'brief']).limit(size).skip(skip);
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
      const relationShip = await RelationShip.find({ following: user._id })
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

// 用户地理位置记录
export async function logGeo(req, res) {
  try {
    const user = await User.findOne({ token: req.headers['f-token'] });
    if (!user) {
      res.json({
        code: 5002,
        message: errCode[5002]
      });
      return;
    }
    const ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
    await User.update({ _id: user._id }, {
      geo: {
        latitude:req.body.latitude,
        longitude: req.body.longitude,
        accuracy: req.body.accuracy
      },
      ip
    });
    res.json({
      code: 200,
      message: '成功记录'
    });
  } catch (err) {
    console.log(err);
    res.json({
      code: 5001,
      message: errCode[5001]
    });
  }
}

/**
 * Created by fengyuanzemin on 2017/4/6.
 */
import Movie from '../models/movie';
import Action from '../models/action';
import User from '../models/user';
import errCode from '../utils/codeTransfer';
import { PAGE_OPTION } from '../utils/const';

// 热门电影列表
export async function hotMovieList(req, res) {
  try {
    // 分页，一页多少条数据
    const size = req.query.size ? Number(req.query.size) : PAGE_OPTION.size;
    // 跳过前面多少条
    const skip = req.query.page ? Number(req.query.page) * size : PAGE_OPTION.page * size;
    const cardList = await Movie.find()
      .select('brief title rating imgUrl')
      .skip(skip).limit(size);
    res.json({
      code: 200,
      cardList
    });
  } catch (err) {
    console.log(err);
    res.json({
      message: errCode[5001],
      code: 5001
    });
  }
}

// 已登录电影列表
export async function movieList(req, res) {
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
    const cardList = await Movie.find()
      .select('brief title rating imgUrl')
      .skip(skip).limit(size);
    res.json({
      code: 200,
      cardList
    });
  } catch (err) {
    console.log(err);
    res.json({
      message: errCode[5001],
      code: 5001
    });
  }
}

// 电影详情关联的评价
export async function movieComment(req, res) {
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
    let movieInfo = [];
    if (Number(req.query.page) === 0) {
      movieInfo = await Movie.findOne({ _id: req.query.mId });
    }
    const commentList = await Action.find({
      movie: req.query.mId,
      type: 'movie',
      action: 'comment'
    }).sort({ _id: -1 }).populate({
      path: 'user',
      select: 'name'
    }).skip(skip).limit(size);
    res.json({
      code: 200,
      movieInfo,
      commentList
    });
  } catch (err) {
    console.log(err);
    res.json({
      message: errCode[5001],
      code: 5001
    });
  }
}

// 发布电影评价
export async function moviePostComment(req, res) {
  if (!req.body.rating) {
    res.json({
      code: 5004,
      message: errCode[5004]
    });
    return;
  }
  if (typeof req.body.content !== 'string' ||
    typeof req.body.mId !== 'string' ||
    typeof req.body.rating !== 'number') {
    res.json({
      code: 5012,
      message: errCode[5012]
    });
    return;
  }
  try {
    const user = await User.findOne({ token: req.headers['f-token'] });
    if (!user) {
      res.json({
        code: 5002,
        message: errCode[5002]
      });
      return;
    }
    const movie = await Movie.findOne({ _id: req.body.mId });
    if (!movie) {
      res.json({
        code: 5005,
        message: errCode[5005]
      });
      return;
    }
    // 查看是否评价过
    const isRating = await Action.findOne({
      user: user._id,
      type: 'movie',
      action: 'comment',
      movie: req.body.mId
    });
    if (isRating) {
      res.json({
        code: 5017,
        message: errCode[5017]
      });
      return;
    }
    await new Action({
      user: user._id,
      movie: req.body.mId,
      content: req.body.content,
      rating: req.body.rating,
      type: 'movie',
      action: 'comment'
    }).save();

    if(req.body.rating <= 4) {
      // 如果打的是低分，就把所有的查看行为删除
      await Action.remove({
        user: user._id,
        movie: req.body.mId,
        type: 'movie',
        action: 'click'
      });
    }

    // 查询所有的，该电影的评分，更新movie
    const commentArr = await Action.find({ movie: req.body.mId, action: 'comment', type: 'movie' });
    let ratingSum = 0;
    let count = 0;
    commentArr.forEach(item => {
      count += 1;
      ratingSum += item.rating;
    });

    const rating = ratingSum / count;
    await Movie.update({ _id: req.body.mId }, { rating, $inc: { comments_count: 1 } });

    res.json({
      code: 200,
      message: '发布成功'
    })
  } catch (err) {
    console.log(err);
    res.json({
      message: errCode[5001],
      code: 5001
    });
  }
}

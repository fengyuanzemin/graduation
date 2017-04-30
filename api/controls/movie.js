/**
 * Created by fengyuanzemin on 2017/4/6.
 */
import Movie from '../models/movie';
import MovieAction from '../models/movieAction';
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
        const user = await User.findOne({token: req.headers['f-token']});
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
        const user = await User.findOne({token: req.headers['f-token']});
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
            movieInfo = await Movie.findOne({_id: req.query.mId});
        }
        const commentList = await MovieAction.find({movie: req.query.mId, action: 'comment'})
            .sort({_id: -1})
            .populate({
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
        const user = await User.findOne({token: req.headers['f-token']});
        if (!user) {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        const movie = await Movie.findOne({_id: req.body.mId});
        if (!movie) {
            res.json({
                code: 5005,
                message: errCode[5005]
            });
            return;
        }
        await new MovieAction({
            user: user._id,
            movie: req.body.mId,
            content: req.body.content,
            rating: req.body.rating,
            action: 'comment'
        }).save();

        // 查询所有的，该电影的评分，更新movie
        const commentArr = await MovieAction.find({movie: req.body.mId, action: 'comment'});
        let ratingSum = 0;
        let count = 0;
        commentArr.forEach(item => {
            count += 1;
            ratingSum += item.rating;
        });

        const rating = ratingSum / count;
        await Movie.update({_id: req.body.mId}, {rating, $inc: {comments_count: 1}});

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

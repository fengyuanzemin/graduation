/**
 * Created by fengyuanzemin on 2017/4/6.
 */
import Movie from '../models/movie';
import User from '../models/user';
import errCode from '../utils/codeTransfer';
import {PAGE_OPTION} from '../utils/const';

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

// 电影详情
export async function movieDetail(req, res) {
    try {
        const user = await User.findOne({token: req.headers['f-token']});
        if (!user) {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        const movie = await Movie.findOne({_id: req.query.mId});
        res.json({
            code: 200,
            movie
        })
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
        res.json({
            code: 200,
            message: '22'
        })

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
    try {
        res.json({
            code: 200,
            message: '233333'
        })
    } catch (err) {
        console.log(err);
        res.json({
            message: errCode[5001],
            code: 5001
        });
    }
}

/**
 * Created by fengyuanzemin on 2017/3/17.
 */
import User from '../models/user';
import Action from '../models/action';
import MovieAction from '../models/movieAction';
import errCode from '../utils/codeTransfer';
import { PAGE_OPTION } from '../utils/const';
import { recommend } from '../algorithm/calculate';
import { operationCategory, deleteSameAction, findIntersection } from '../utils/index';

export async function getUserRecommend(req, res) {
    try {
        let recommendArr = [];
        // 查找是谁的推荐人
        const user = await User.findOne({token: req.headers['f-token']});
        if (user) {
            // 分页，一页多少条数据
            const size = req.query.size ? Number(req.query.size) : PAGE_OPTION.size;
            // 跳过前面多少条
            const skip = req.query.page ? Number(req.query.page) * size : PAGE_OPTION.page * size;
            const userArr = await recommend(user);
            const follow = await User.find({_id: {$in: userArr}}, 'name brief').limit(size).skip(skip);
            const parseFollow = JSON.parse(JSON.stringify(follow));
            for (let i of parseFollow) {
                i.follow = 'none';
                recommendArr.push(i);
            }
            res.json({
                code: 200,
                recommend: recommendArr
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

export async function getWhy(req, res) {
    try {
        const user = await User.findOne({token: req.headers['f-token']});
        if (!user) {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        const recommendUser = await User.findOne({_id: req.query.uId});
        if (!recommendUser) {
            res.json({
                code: 5013,
                message: errCode[5013]
            });
            return;
        }
        // 先查微博上面相似行为的
        const postUserAction = deleteSameAction(
            await Action.find({user: user._id}).sort({post: 1, action: 1, _id: -1})
                .populate({
                    path: 'user',
                    select: 'name'
                })
                .populate('post')
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
                }), 'post');
        const postRecommendUserAction = deleteSameAction(
            await Action.find({user: recommendUser._id}).sort({post: 1, action: 1, _id: -1})
                .populate({
                    path: 'user',
                    select: 'name'
                })
                .populate('post')
                .populate({
                    path: 'post',
                    populate: {
                        path: 'user'
                    }
                }).populate({
                    path: 'post',
                    populate: {
                        path: 'retweeted_post',
                        populate: {
                            path: 'user',
                            select: 'name'
                        }
                    }
                }), 'post');

        let intersection = [];
        if (postUserAction.length > 0 && postRecommendUserAction.length > 0) {
            intersection = operationCategory(postRecommendUserAction, postUserAction, 'post');
        } else if (postUserAction.length > 0) {
            intersection = findIntersection(postUserAction, recommendUser._id);
        } else if (postRecommendUserAction.length > 0) {
            intersection = findIntersection(postRecommendUserAction, user._id);
        }

        // 再查电影上面有相似行为的
        const movieUserAction = deleteSameAction(
            await MovieAction.find({user: user._id}).sort({movie: 1, action: 1, _id: -1})
                .populate({
                    path: 'user',
                    select: 'name'
                })
                .populate('movie'), 'movie');
        const movieRecommendUserAction = deleteSameAction(
            await MovieAction.find({user: recommendUser._id}).sort({movie: 1, action: 1, _id: -1})
                .populate({
                    path: 'user',
                    select: 'name'
                })
                .populate('movie'), 'movie');

        let movieIntersection = [];
        if (movieUserAction.length > 0 && movieRecommendUserAction.length > 0) {
            movieIntersection = operationCategory(movieRecommendUserAction, movieUserAction, 'movie');
        }

        res.json({
            code: 200,
            intersection,
            movieIntersection
        })

    } catch (err) {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    }
}

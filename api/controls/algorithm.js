/**
 * Created by fengyuanzemin on 2017/3/17.
 */
import User from '../models/user';
import Similar from '../models/similar';
import RelationShip from '../models/relationship';
import {errCode} from '../utils/codeTransfer';

export async function getUserRecommend(req, res) {
    try {
        let recommend = [];
        // 查找是谁的推荐人
        const user = await User.findOne({token: req.headers['f-token']});
        if (user) {
            let recommendFollow = [];
            const sim = await Similar.find({$or: [{userA: user._id}, {userB: user._id}]})
                .sort('-similar');
            for (let s of sim) {
                const re = await RelationShip.findOne({
                    $or: [{
                        follower: user._id,
                        following: s.userA
                    }, {
                        follower: user._id,
                        following: s.userB
                    }]
                });
                // 没有关注过
                if (!re) {
                    recommendFollow.push(s);
                }
            }
            for (let i of recommendFollow) {
                const id = String(i.userA) === String(user._id) ? i.userB : i.userA;
                const follow = await User.findOne({_id: id}, 'name brief');
                const parseFollow = JSON.parse(JSON.stringify(follow));
                parseFollow.follow = 'none';
                recommend.push(parseFollow);
            }
        } else {
            res.json({
                code: 5002,
                message: errCode[5002]
            });
            return;
        }
        res.json({
            code: 200,
            recommend
        });
    } catch (err) {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        });
    }
}


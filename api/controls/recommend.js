/**
 * Created by fengyuanzemin on 2017/3/17.
 */
import User from '../models/user';
import {errCode} from '../utils/codeTransfer';
import {recommend} from '../algorithm/calculate';

export async function getUserRecommend(req, res) {
    try {
        let recommendArr = [];
        // 查找是谁的推荐人
        const user = await User.findOne({token: req.headers['f-token']});
        if (user) {
            const userArr = await recommend(user);
            const follow = await User.find({_id: {$in: userArr}}, 'name brief');
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


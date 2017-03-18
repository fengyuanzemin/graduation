/**
 * Created by fengyuanzemin on 2017/3/17.
 */
import similar from '../algorithm/calculate';
import {errCode} from '../utils/codeTransfer';

async function getUserRecommend(req, res) {
    try {
        const recommend = await similar(req.headers['f-token']);
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

export default {
    getUserRecommend
}

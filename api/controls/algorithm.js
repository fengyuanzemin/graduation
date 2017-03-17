/**
 * Created by fengyuanzemin on 2017/3/17.
 */
import similar from '../algorithm/calculate';
import {errCode} from '../utils/codeTransfer';

function getUserRecommend(req, res) {
    similar(req.headers['f-token']).then((data) => {
        res.json({
            code: 200,
            recommend: data
        })
    }).catch((err) => {
        console.log(err);
        res.json({
            code: 5001,
            message: errCode[5001]
        })
    });
}

export default {
    getUserRecommend
}

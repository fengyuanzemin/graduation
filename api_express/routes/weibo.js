/**
 * Created by fengyuanzemin on 17/2/13.
 */
import express from 'express';
const router = express.Router();
const Weibo = require('../models/weibo');

router.get('/', (req, res) => {
    if (req.query.id) {
        Weibo.find({'author_id': req.query.id}, (err, data) => {
            if (err) {
                console.log(err)
            }
            res.json({
                code: 200,
                data
            })
        });
    }
});
//
// router.get('/userInfo', (req, res) => {
//     if (req.query.id) {
//         Weibo.find({'author_id': req.query.id}, (err, data) => {
//             res.json({
//                 code: 200,
//                 data
//             })
//         });
//     }
// });

export default router;
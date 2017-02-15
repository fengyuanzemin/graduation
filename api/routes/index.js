import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
    res.json({
        data: {
            message: '首页'
        },
        code: 200
    });
});


export default router;

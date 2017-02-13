import express from 'express';
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
    res.json({
        data: {
            message: '用户首页'
        },
        code: 200
    });
});

export default router;

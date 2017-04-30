/**
 * Created by fengyuanzemin on 17/2/22.
 */
import mongoose from 'mongoose';

const Schema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
    },
    type: {
        type: String
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    // 点赞attitude 转发repost 评论comment 查看click
    action: {
        type: String,
        require: true
    },
    // 只有电影评价的时候
    rating: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Action', Schema);
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
        ref: 'Post',
        require: true
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('PostAction', Schema);
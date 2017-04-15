/**
 * Created by fengyuanzemin on 2017/4/9.
 */
import mongoose from 'mongoose';

const Schema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        require: true
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    // comment是评价  click是查看
    action: {
        type: String,
        default: ''
    },
    // 只有评价的时候
    rating: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('MovieAction', Schema);
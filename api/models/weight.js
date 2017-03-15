/**
 * Created by fengyuanzemin on 17/3/13.
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
    maxSum: {
        type: Number,
        default: 0
    },
    point: {
        type: Number,
        default: 0
    }
});

export default mongoose.model('Weight', Schema);
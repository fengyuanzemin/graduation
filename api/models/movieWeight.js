/**
 * Created by fengyuanzemin on 2017/4/16.
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
    maxSum: {
        type: Number,
        default: 0
    },
    point: {
        type: Number,
        default: 0
    }
});

export default mongoose.model('MovieWeight', Schema);
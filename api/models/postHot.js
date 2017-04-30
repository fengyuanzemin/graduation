/**
 * Created by fengyuanzemin on 2017/4/3.
 */

import mongoose from 'mongoose';

const Schema = mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        require: true
    },
    point: {
        type: Number,
        require: true
    }
});

export default mongoose.model('PostHot', Schema);
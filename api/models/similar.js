/**
 * Created by fengyuanzemin on 2017/3/14.
 */
import mongoose from 'mongoose';

const Schema = mongoose.Schema({
    userA: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    userB: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    interAction: {
        type: Number,
        default: 0
    },
    coupling: {
        type: Number,
        default: 0
    },
    similar: {
        type: Number,
        default: 0
    }
});

export default mongoose.model('Similar', Schema);
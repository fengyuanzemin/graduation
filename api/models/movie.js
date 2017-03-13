/**
 * Created by fengyuanzemin on 17/2/15.
 */
import mongoose from 'mongoose';

const Schema = mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    img: {
        type: String,
        default: ''
    },
    ratings: {
        type: Number,
        default: 0
    },
    brief: {
        type: String,
        default: ''
    },
    tags: {
        type: Array,
        default: []
    }
});

export default mongoose.model('Movie', Schema);
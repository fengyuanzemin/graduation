/**
 * Created by fengyuanzemin on 2017/4/9.
 */
import mongoose from 'mongoose';

const Schema = mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        require: true
    },
    point: {
        type: Number,
        default: 0
    }
});

export default mongoose.model('HotMovie', Schema);
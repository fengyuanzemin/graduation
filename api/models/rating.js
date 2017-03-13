/**
 * Created by fengyuanzemin on 17/2/15.
 */
import mongoose from 'mongoose';

const Schema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId
    },
    ratings: {
        type: Number,
        default: 0
    },
    movieId: {
        type: mongoose.Schema.Types.ObjectId
    }
});

export default mongoose.model('Rating', Schema);
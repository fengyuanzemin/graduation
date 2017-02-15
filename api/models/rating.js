/**
 * Created by fengyuanzemin on 17/2/15.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    userId: {
        type: ObjectId
    },
    ratings: {
        type: Number,
        default: 0
    },
    movieId: {
        type: ObjectId
    }
});

module.exports = mongoose.model('Rating', Schema);
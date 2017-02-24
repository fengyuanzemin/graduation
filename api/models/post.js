/**
 * Created by fengyuanzemin on 17/2/15.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        require: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    reposts_count: {
        type: Number,
        default: 0
    },
    attitudes_count: {
        type: Number,
        default: 0
    },
    comments_count: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Post', Schema);
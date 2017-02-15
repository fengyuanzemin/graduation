/**
 * Created by fengyuanzemin on 17/2/15.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    name: {
        type: String,
        default: '',
        trim: true
    },
    posts_count: {
        type: Number,
        default: 0
    },
    following_count: {
        type: Number,
        default: 0
    },
    followers_count: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('User', Schema);

/**
 * Created by fengyuanzemin on 17/2/22.
 */
const mongoose = require('mongoose');

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
    content: {
        type: String,
        default: '',
        trim: true
    },
    action: {
        type: String,
        require: ''
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Action', Schema);
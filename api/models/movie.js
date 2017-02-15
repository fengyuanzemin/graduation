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
    ratings: {
        type: Number,
        default: 0
    },
    content: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Relationship', Schema);
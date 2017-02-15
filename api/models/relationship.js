/**
 * Created by fengyuanzemin on 17/2/15.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    following: {
        type: ObjectId
    },
    follower: {
        type: ObjectId
    }
});

module.exports = mongoose.model('User', Schema);
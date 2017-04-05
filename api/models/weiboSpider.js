import mongoose from 'mongoose';

const Schema = mongoose.Schema({
    id: {
        type: String,
        default: ''
    },
    author: {
        type: String,
        default: '',
        trim: true
    },
    author_id: {
        type: Number,
        default: 0
    },
    attitudes_count: {
        type: Number,
        default: 0
    },
    created_at: {
        type: String,
        default: ''
    },
    reposts_count: {
        type: Number,
        default: 0
    },
    comments_count: {
        type: Number,
        default: 0
    },
    text: {
        type: String,
        default: ''
    },
    retweeted_id: {
        type: String,
        default: ''
    },
    retweeted_author: {
        type: String,
        default: ''
    },
    retweeted_author_id: {
        type: Number,
        default: 0
    },
    retweeted_attitudes_count: {
        type: Number,
        default: 0
    },
    retweeted_created_at: {
        type: String,
        default: ''
    },
    retweeted_reposts_count: {
        type: Number,
        default: 0
    },
    retweeted_comments_count: {
        type: Number,
        default: 0
    },
    retweeted_text: {
        type: String,
        default: ''
    }
});

export default mongoose.model('WeiboSpider', Schema);
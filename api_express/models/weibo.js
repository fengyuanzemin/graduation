import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const WeiboSchema = new Schema({
    name: {
        type: String,
        default: '',
        trim: true
    },
    userId: {
        type: String,
        default: ''
    },

});
/**
 * Created by fengyuanzemin on 17/2/15.
 */
import mongoose from 'mongoose';

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
  },
  retweeted_post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }
});

export default mongoose.model('Post', Schema);

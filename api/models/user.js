/**
 * Created by fengyuanzemin on 17/2/15.
 */
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    unique: true,
    require: true
  },
  brief: {
    type: String,
    trim: true
  },
  token: {
    type: String,
    require: true,
    unique: true
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
    require: true
  },
  ip: {
    type: String,
    default: ''
  },
  geo: {
    type: Object,
    default: null
  }
});
export default mongoose.model('User', Schema);

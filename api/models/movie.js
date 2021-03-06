/**
 * Created by fengyuanzemin on 17/2/15.
 */
import mongoose from 'mongoose';

const Schema = mongoose.Schema({
  url: {
    type: String,
    default: '',
    unique: true
  },
  title: {
    type: String,
    require: true,
    trim: true
  },
  actors: {
    type: Array,
    default: []
  },
  directors: {
    type: Array,
    default: []
  },
  imgUrl: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0
  },
  comments_count: {
    type: Number,
    default: 0
  },
  brief: {
    type: Array,
    default: []
  },
  tags: {
    type: Array,
    default: []
  }
});

export default mongoose.model('Movie', Schema);

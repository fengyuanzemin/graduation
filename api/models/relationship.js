/**
 * Created by fengyuanzemin on 17/2/15.
 */
import mongoose from 'mongoose';

const Schema = mongoose.Schema({
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

export default mongoose.model('Relationship', Schema);

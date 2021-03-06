/**
 * Created by fengyuanzemin on 17/2/22.
 */
import mongoose from 'mongoose';

const Schema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  },
  // 被作用人
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // 三种类型，post文章层面，movie电影层面，user用户层面
  type: {
    type: String
  },
  content: {
    type: String,
    default: '',
    trim: true
  },
  // 点赞attitude 转发repost 评论/评价comment 查看click，follow关注、unfollow取关
  action: {
    type: String,
    require: true
  },
  // 只有电影评价的时候
  rating: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Action', Schema);

/**
 * Created by fengyuanzemin on 17/2/12.
 */
import axios from 'axios';


axios.defaults.baseURL = 'http://localhost:3000';

// 获取某用户的数据
export default function getIndex(id) {
  axios.get('/weibo', {
    params: {
      id
    }
  });
}


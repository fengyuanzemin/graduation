/**
 * Created by fengyuanzemin on 17/2/17.
 */
import axios from 'axios';
import baseURL from '../../config/axiosDefaultsBaseURL';

if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = baseURL.axiosDefaultsBaseURL;
} else {
  axios.defaults.baseURL = 'http://localhost:3000';
}

// 注册
export function signUp(name, password) {
  return axios.post('/sign-up', {
    name, password
  });
}

// 登录
export function login(name, password) {
  return axios.post('/login', {
    name, password
  })
}

// 发送微博
export function post(text, token) {
  return axios.post('/post', {
    text
  }, {
    headers: {
      'f-token': token
    }
  })
}

// 拉取热门微博
export function getHotList(page = 0, size = 10) {
  return axios.get('/getHotList', {
    params: {
      page, size
    }
  })
}

// 拉取用户微博
export function getList(token, page = 0, size = 10) {
  return axios.get('/getList', {
    params: {
      size, page
    },
    headers: {
      'f-token': token
    }
  });
}

// 拉取某一用户微博
export function getUserPostList(uId, token, page = 0, size = 10) {
  return axios.get('/getUserPostList', {
    params: {
      uId, page, size
    },
    headers: {
      'f-token': token
    }
  })
}

// 检查Token
export function checkToken(token) {
  return axios.get('/checkToken', {
    headers: {
      'f-token': token
    }
  })
}

// 拉取用户信息
export function getUserInfo(token) {
  return axios.get('/getUserInfo', {
    headers: {
      'f-token': token
    }
  })
}

// 拉取微博正文
export function getPostItem(pId, token) {
  return axios.get('/getPostItem', {
    params: {
      pId
    },
    headers: {
      'f-token': token
    }
  })
}

// 转发
export function repost(pId, content, token) {
  return axios.post('/repost', {
    pId, content
  }, {
    headers: {
      'f-token': token
    }
  });
}

// 评论
export function comment(pId, content, token) {
  return axios.post('/comment', {
    pId, content
  }, {
    headers: {
      'f-token': token
    }
  });
}
// 点赞
export function attitude(pId, token) {
  return axios.post('/attitude', {
    pId
  }, {
    headers: {
      'f-token': token
    }
  })
}

// 拉取转发、评论、点赞
export function getActionInfo(pId, action, token, page = 0, size = 10) {
  return axios.get('/getActionInfo', {
    params: {
      pId, action, page, size
    },
    headers: {
      'f-token': token
    }
  });
}

// 更改用户信息
export function updateUserInfo(name, brief, token) {
  return axios.post('/updateUserInfo', {
    name, brief
  }, {
    headers: {
      'f-token': token
    }
  });
}

// 搜索
export function search(text, token) {
  return axios.get('/search', {
    params: {
      text
    },
    headers: {
      'f-token': token
    }
  })
}

// 关注和取消关注
// follow 为true是关注，false是取关
export function follow(uId, token, follow) {
  return axios.post('/follow', {
    uId, follow
  }, {
    headers: {
      'f-token': token
    }
  });
}

// 关注列表和粉丝列表
// follow为1是关注列表，为0是粉丝列表
export function getFollowList(follow, uId, token, page = 0, size = 10) {
  return axios.get('/getFollowList', {
    params: {
      follow, uId, page, size
    },
    headers: {
      'f-token': token
    }
  })
}

// 查看用户关注、粉丝的时候判断是不是在看本人的资料
export function judgeUser(uId, token) {
  return axios.get('/judgeUser', {
    params: {
      uId
    },
    headers: {
      'f-token': token
    }
  })
}

// 记录查看微博/电影的点击事件
export function clickIn(id, token, type = 'post') {
  return axios.post('/clickIn', {
    id, type
  }, {
    headers: {
      'f-token': token
    }
  }).then(res => res);
}

// 推荐
export function recommend(token, page = 0, size = 10) {
  return axios.get('/recommend', {
    params: {
      page, size
    },
    headers: {
      'f-token': token
    }
  })
}

// 热门电影
export function hotMovieList(page = 0, size = 10) {
  return axios.get('/hotMovieList', {
    params: {
      page, size
    }
  })
}

// 已登录电影列表
export function movieList(token, page = 0, size = 10) {
  return axios.get('/movieList', {
    params: {
      page, size
    },
    headers: {
      'f-token': token
    }
  })
}

// 电影详情关联的评价
export function movieComment(mId, token, page = 0, size = 10) {
  return axios.get('/movieComment', {
    params: {
      mId, page, size
    },
    headers: {
      'f-token': token
    }
  })
}

// 发布电影评价
export function moviePostComment(mId, content, rating = 0, token) {
  return axios.post('/moviePostComment', {
    mId, content, rating
  }, {
    headers: {
      'f-token': token
    }
  })
}

// 拉取为什么推荐
export function why(uId, token) {
  return axios.get('/why', {
    params: {
      uId
    },
    headers: {
      'f-token': token
    }
  })
}

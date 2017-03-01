/**
 * Created by fengyuanzemin on 17/2/17.
 */
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:3000';

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
export function getHotList(page) {
  return axios.get('/getHotList', {
    params: {
      page
    }
  })
}

// 拉取用户微博
export function getList(token, page) {
  return axios.get('/getList', {
    params: {
      page
    },
    headers: {
      'f-token': token
    }
  });
}

// 拉取某一用户微博
export function getUserList(uId, page) {
  return axios.get('/getUserPostList', {
    params: {
      uId, page
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
export function getPostItem(pId) {
  return axios.get('/getPostItem', {
    params: {
      pId
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
export function getActionInfo(pId, action, token) {
  return axios.get('/getActionInfo', {
    params: {
      pId, action
    },
    headers: {
      'f-token': token
    }
  });
}

// 检查是否点过赞
export function checkAttitude(pId, token) {
  return axios.get('/checkAttitude', {
    params: {
      pId
    },
    headers: {
      'f-token': token
    }
  })
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
export function getFollowList(token) {
  return axios.get('/getFollowList', {
    headers: {
      'f-token': token
    }
  })
}

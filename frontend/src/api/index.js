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

// // 用户退出登录
// export function logout() {
//   return axios.get('/logout', {
//     headers: {
//       'f-token': token
//     }
//   })
// }

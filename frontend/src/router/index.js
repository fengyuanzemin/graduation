/**
 * Created by fengyuanzemin on 17/2/15.
 */

import Vue from 'vue'
import Router from 'vue-router'
import {getCookie} from 'src/utils';
import {checkToken} from 'src/api';

Vue.use(Router);

export default new Router({
  mode: 'history',
  scrollBehavior() {
    // 期望滚动到页面最上部
    return {x: 0, y: 0};
  },
  routes: [
    {
      path: '/',
      component: resolve => require(['../views/Index/Layout'], resolve),
      beforeEnter: (to, from, next) => {
        const token = getCookie('f-token');
        if (!token) {
          next('/un-login');
        }
        checkToken(token).then((res) => {
          if (res.data.code === 200) {
            const loggedIn = res.data.loggedIn;
            if (loggedIn) {
              next();
            } else {
              next('/un-login');
            }
          } else {
            next('/un-login');
          }
        }).catch(() => {
          next('/un-login');
        });
      }
    },
    {
      path: '/un-login',
      component: resolve => require(['../views/UnLogin/Layout'], resolve)
    },
    {
      path: '/post',
      component: resolve => require(['../views/Post'], resolve),
      beforeEnter: (to, from, next) => {
        const token = getCookie('f-token');
        if (!token) {
          next('/un-login');
        }
        checkToken(token).then((res) => {
          if (res.data.code === 200) {
            const loggedIn = res.data.loggedIn;
            if (loggedIn) {
              next();
            } else {
              next('/un-login');
            }
          } else {
            next('/un-login');
          }
        }).catch(() => {
          next('/un-login');
        });
      }
    },
    {
      path: '/repost/:postId',
      name: 'repost',
      component: resolve => require(['../views/Repost'], resolve),
      beforeEnter: (to, from, next) => {
        const token = getCookie('f-token');
        if (!token) {
          next('/un-login');
        }
        checkToken(token).then((res) => {
          if (res.data.code === 200) {
            const loggedIn = res.data.loggedIn;
            if (loggedIn) {
              next();
            } else {
              next('/un-login');
            }
          } else {
            next('/un-login');
          }
        }).catch(() => {
          next('/un-login');
        });
      }
    },
    {
      path: '/comment/:postId',
      name: 'comment',
      component: resolve => require(['../views/Comment'], resolve),
      beforeEnter: (to, from, next) => {
        const token = getCookie('f-token');
        if (!token) {
          next('/un-login');
        }
        checkToken(token).then((res) => {
          if (res.data.code === 200) {
            const loggedIn = res.data.loggedIn;
            if (loggedIn) {
              next();
            } else {
              next('/un-login');
            }
          } else {
            next('/un-login');
          }
        }).catch(() => {
          next('/un-login');
        });
      }
    },
    {
      path: '/status/:postId',
      name: 'status',
      component: resolve => require(['../views/Detail'], resolve)
    },
    {
      path: '/user/:userId',
      name: 'user',
      component: resolve => require(['../views/User'], resolve)
    },
    {
      path: '/login',
      component: resolve => require(['../views/Login/Layout'], resolve)
    },

    {path: '*', component: resolve => require(['../views/404'], resolve)}
  ]
})

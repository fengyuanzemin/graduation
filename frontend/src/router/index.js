/**
 * Created by fengyuanzemin on 17/2/15.
 */

import Vue from 'vue'
import Router from 'vue-router'
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
      component: resolve => require(['../views/Index/Layout'], resolve)
    },
    {
      path: '/un-login',
      component: resolve => require(['../views/UnLogin/Layout'], resolve),
      beforeEnter: (to, from, next) => {
        const token = localStorage.getItem('f-token');
        checkToken(token).then((res) => {
          if (res.data.code === 200) {
            const loggedIn = res.data.loggedIn;
            if (loggedIn) {
              next('/');
            } else {
              next();
            }
          } else {
            next();
          }
        }).catch(() => {
          next();
        });
      }
    },
    {
      path: '/post',
      component: resolve => require(['../views/Post'], resolve)
    },
    {
      path: '/repost/:postId',
      name: 'repost',
      component: resolve => require(['../views/Repost'], resolve)
    },
    {
      path: '/comment/:postId',
      name: 'comment',
      component: resolve => require(['../views/Comment'], resolve)
    },
    {
      path: '/status/:postId',
      name: 'status',
      component: resolve => require(['../views/Detail'], resolve)
    },
    {
      path: '/movie/:movieId',
      name: 'movie',
      component: resolve =>require(['../views/MovieDetail'], resolve)
    },
    {
      path: '/movieComment/:movieId',
      name: 'movieComment',
      component: resolve => require(['../views/MovieComment'], resolve)
    },
    {
      path: '/user/:userId',
      name: 'user',
      component: resolve => require(['../views/UserPostList'], resolve)
    },
    {
      path: '/follow/:userId',
      name: 'follow',
      component: resolve => require(['../views/Follow/Layout'], resolve)
    },
    {
      path: '/userUpdate',
      component: resolve => require(['../views/UserUpdate'], resolve)
    },
    {
      path: '/login',
      component: resolve => require(['../views/Login/Layout'], resolve)
    },
    {
      path: '*', component: resolve => require(['../views/404'], resolve)
    }
  ]
})

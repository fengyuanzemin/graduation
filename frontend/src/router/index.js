/**
 * Created by fengyuanzemin on 17/2/15.
 */

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
  mode: 'history',
  scrollBehavior() {
    // 期望滚动到页面最上部
    return {x: 0, y: 0};
  },
  routes: [
    {path: '/', component: resolve => require(['../views/Index/Layout'], resolve)},
    {path: '/login', component: resolve => require(['../views/Login'], resolve)},
    {path: '/sign-up', component: resolve => require(['../views/SignUp'], resolve)},
    {path: '*', component: resolve => require(['../views/404'], resolve)},
  ]
})

import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import * as filters from './filters';

Vue.directive('focus-parent', {
  // 当绑定元素插入到 DOM 中。
  inserted: (el) => {
    // 元素focus时，父元素加个focus类
    el.onfocus = () => {
      el.parentNode.classList.add('focus');
    };
    el.onblur = () => {
      el.parentNode.classList.remove('focus');
    };
  }
});

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  ...App,
  router
});

import Vue from 'vue';
import App from './App';
import router from './router';

/* eslint-disable no-new */
new Vue({
  el: '#app',
  ...App,
  router
});

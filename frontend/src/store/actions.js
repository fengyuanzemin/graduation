/**
 * Created by fengyuanzemin on 2017/3/21.
 */
export const show = ({commit}, data) => commit('show', data);
export const checkoutMsg = ({commit}, data) => commit('checkoutMsg', data);
export const close = ({commit}) => commit('close');
export const login = ({commit}, data) => commit('login', data);
export const logout = ({commit}) => commit('logout');


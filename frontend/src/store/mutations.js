/**
 * Created by fengyuanzemin on 2017/3/21.
 */
export const show = (state, data) => {
  state.isShow = true;
  state.msg = data.msg;
};

export const checkoutMsg = (state, data) => {
  state.msg = data.msg;
};

export const close = state => state.isShow = false;
/**
 * Created by fengyuanzemin on 17/2/18.
 */
// 根据名字取cookie
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

/**
 * Created by fengyuanzemin on 2017/4/22.
 */
// 时间格式化
export function timeFormat(val, option) {
  const time = new Date(val);
  const now = Date.now();
  const diff = (now - time.valueOf()) / 1000;

  if (diff < 30) {
    return '刚刚';
  } else if (diff < 3600) {
    return Math.ceil(diff / 60) + '分钟前';
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前';
  } else if (diff < 3600 * 24 * 2) {
    return '1天前';
  }
  return parseTime(time, option);
}

/*格式化时间*/
function parseTime(time, format = '{y}-{m}-{d} {h}:{i}:{s}') {
  if (arguments.length === 0) {
    return null;
  }
  let date;
  if (typeof(time) === 'object') {
    date = time;
  } else {
    date = new Date(parseInt(time));
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  };
  return format.replace(/{(y|m|d|h|i|s|a)+}/g, function (result, key) {
    let value = formatObj[key];
    if (result.length > 0 && value < 10) {
      value = '0' + value;
    }
    return value || 0;
  });
}

// 添加图片前缀
export function imgAttend(url) {
  return `http://7xn2lr.com1.z0.glb.clouddn.com/movie/${url}`;
}

// 数字处理，省两位小数
export function toFixed(num) {
  return Number(num).toFixed(2);
}

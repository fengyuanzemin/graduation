# 毕设后端API

## 运行

1. 安装依赖

    npm i 

2. 安装mongoDB
3. 将./config/salt.example.js复制到./config/salt.js，并根据喜好取一个10以内的数
4. 如果要尝试爬电影数据，得将./config/cookie.example.js复制到./config/cookie.js，并将自己的豆瓣cookie复制粘贴过来
5. 运行
    
    npm start
    
# 如果要在后台运行

不运行上面的npm start，然后
  
```bash
# 运行api
forever start ./bin/www
    
# 运行推荐算法
forever start ./algorithm/index.js
    
# 运行热门文章计算
forever start ./algorithm/hot.js
```
   

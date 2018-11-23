# js-sdk-demo使用指南

---

前端项目地址:svn://192.168.24.144:8888/wcs/RD/trunk/wcs-demos/wcs-js-sdk
后端项目地址:svn://192.168.24.144:8888/wcs/RD/trunk/wcs-demos/wcs-service-demo

##方案一:使用webstorm 推荐
 1. 下载安装node
 2. 下载安装webstorm, 打开前端项目
 3. npm install
![](https://wiki.chinanetcenter.com/html/doc//20181115/1542273737319image.png)  

 4. npm run dev
 ![](https://wiki.chinanetcenter.com/html/doc//20181115/1542273766831image.png)  

 5. 启动后端项目
 6. 设置代理地址,代理后端项目端口, 解决跨域问题
 ![](https://wiki.chinanetcenter.com/html/doc//20181115/1542273968193image.png)  
 7. 进入test/demo1测试页面

##方案二:直接使用node
 1. 下载安装node
 2. cmd进入前端项目根目录
 3. npm install
 4. npm run dev
 5. 启动后端项目
 6. 设置代理地址,代理后端项目端口, 解决跨域问题
 7. 进入test/demo1测试页面

##方案三:使用Tomcat 此方案前端有改动不能打包出wcs.min.js
1. 前端文件放webapp
2. java中提供getUploadToken接口


##方案四:使用nginx 此方案前端有改动不能打包出wcs.min.js
1. 前端使用alias
2. 后端使用proxy_pass代理getUploadToken接口

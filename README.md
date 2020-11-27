## 工程介绍
1. [工程源码](https://github.com/Wangsu-Cloud-Storage/wcs-js-sdk/tree/master/src)
2. [demo&例子](https://github.com/Wangsu-Cloud-Storage/wcs-js-sdk/tree/master/test/demo1)
3. [demo使用指南](https://github.com/Wangsu-Cloud-Storage/wcs-js-sdk/tree/master/demo使用指南.md)

## 开发准备
* 账号要求：已开通网宿云存储，并获取上传密钥，上传域名等
* 系统要求：H5以上
* Wcs-JavaScript-SDK没有包含`token`计算逻辑，为了安全，建议客户自己搭建token服务器计算token。可参考java-sdk等服务端SDK。

## 安装说明
1. 直接引用
```
<script type="text/javascript" src="/dist/wcs.min.js"></script>
通过sctipt标签引入该文件，会在全局生成名为 wcs 的对象
```

2. npm安装
```
npm install wcs-js-sdk
```

## 初始化说明
1. sdk通过一个`uploadObj`对象用来控制上传行为，可触发上传、回调、停止等操作。
2. sdk会判断文件大小同块大小`BLOCK_SIZE`来决定使用直接上传还是分片上传。文件大小>BLOCK_SIZE：使用分片上传；文件大小<=BLOCK_SIZE：使用直接上传
```
引用
import * as wangsu from 'wcs-js-sdk'

其它引用方法
1. import * as wangsu from 'wcs-js-sdk'           调用wangsu.wcsUpload()
2. import { wcsUpload } from 'wcs-js-sdk'         调用wcsUpload()  


使用
var uploadObj = wangsu.wcsUpload(file, token, uploadUrl, extraConfig);

参数
file // 要上传的文件
token // 后台服务器获取的token
uploadUrl // 网宿云存储分配的上传地址
extraConfig={
    timeout: 0, //超时时间, 默认为0 超时错误可以重试上传
    concurrentRequestLimit:3, //并发数,默认为3。注：浏览器对连接的请求资源是有限的, 比如Chrome的请求资源是6, 所以会有这样的情况, 如果并发数写10, 虽然发起了10个请求, 但是只有6个真正在上传
    retryCount:0 //上传重试, 默认为0
    key: key //选填，用于指定文件上传至云存储的名称，注：token中指定的key优先级较高
    mimeType: mimeType //选填，自定义文件的MIME-Type
    deadline: deadline //选填，文件保存期限。超过保存天数文件自动删除,单位：天。例如：1、2、3
}
```

### 上传
```
uploadObj.putFile();
```

### 上传进度回调
```
uploadObj.uploadProgress = function (progress) {}
- progress格式
{
    total:{
        loaded: ?, //已经加载的大小
        size: ?,   //总文件大小
        percent: ? //百分比
    },
    chunks:[     //块信息, 数组形式
        {loaded: ?, size: ?, percent: ?},
        {loaded: ?, size: ?, percent: ?}
    ]
}
```

### 错误回调
```
uploadObj.onError = function (error) {}
- error格式
{
    code: ?,  // 错误码, 其中uploadObj.stop()停止与超时上传没有code
    message: "",  //错误信息
    isRequestError: true //是否是请求错误, 即正常上传后, 服务端返回错误, 这种是正常的错误, 不必重新上传
}
```

### 完成回调
```
uploadObj.onComplete = function(res){}
- res 格式
{
    data: jsonObj/String   //服务端返回的结果。注：如果是直传返回的是编码后的字符串，如果超过块大小使用了分片上传的话返回的就是json对象
}
```

### 停止
```
uploadObj.stop();
```

### 获取文件etag
```
wangsu.getEtagHash(file, callback)
```

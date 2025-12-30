# WCS JavaScript SDK

## 语言 / Language
- [简体中文](README.md)
- [English](README.en.md)

## Project Introduction
1. [Source Code](https://github.com/Wangsu-Cloud-Storage/wcs-js-sdk/tree/master/src)
2. [Demo & Examples](https://github.com/Wangsu-Cloud-Storage/wcs-js-sdk/tree/master/test/demo1)
3. [Demo Usage Guide](https://github.com/Wangsu-Cloud-Storage/wcs-js-sdk/tree/master/demo使用指南.md)

## Development Preparation
* **Account Requirements**: You must have a WCS cloud storage account and have obtained the upload key, upload domain, etc.
* **System Requirements**: HTML5 or above
* **Note**: The Wcs-JavaScript-SDK does not include `token` calculation logic. For security reasons, it is recommended that customers set up their own token server to calculate tokens. You can refer to server-side SDKs like java-sdk for reference.

## Installation Instructions

### 1. Direct Reference
```html
<script type="text/javascript" src="/dist/wcs.min.js"></script>
```
By introducing this file through the script tag, a global object named `wcs` will be generated.

### 2. npm Installation
```bash
npm install wcs-js-sdk
```

## Initialization Instructions

1. The SDK controls upload behavior through an `uploadObj` object, which can trigger uploads, callbacks, stop operations, etc.
2. The SDK determines whether to use direct upload or multipart upload by comparing the file size with the block size `BLOCK_SIZE`. File size > BLOCK_SIZE: use multipart upload; File size <= BLOCK_SIZE: use direct upload.

```javascript
// Import
import * as wangsu from 'wcs-js-sdk'

// Other import methods
// 1. import * as wangsu from 'wcs-js-sdk'           Call wangsu.wcsUpload()
// 2. import { wcsUpload } from 'wcs-js-sdk'         Call wcsUpload()

// Usage
var uploadObj = wangsu.wcsUpload(file, token, uploadUrl, extraConfig);

// Parameters
file // The file to upload
token // Token obtained from the backend server
uploadUrl // Upload address allocated by WCS cloud storage
extraConfig={
    timeout: 0, // Timeout in milliseconds, default is 0 (no timeout). Timeout errors can be retried
    concurrentRequestLimit: 3, // Concurrency limit, default is 3. Note: Browsers have limited connection resources. For example, Chrome's request resource limit is 6, so if you set the concurrency to 10, although 10 requests are initiated, only 6 are actually uploading
    retryCount: 0, // Upload retry count, default is 0
    key: key, // Optional, used to specify the name of the file uploaded to cloud storage. Note: The key specified in the token has higher priority
    mimeType: mimeType, // Optional, custom MIME-Type of the file
    deadline: deadline, // Optional, file retention period. Files will be automatically deleted after the retention days. Unit: days. For example: 1, 2, 3
    blockSize: blockSize, // Optional, file upload block size setting. Default is 4M. If you need to modify, please enter a multiple of 4, unit: M. For example: 8, 12, 16
}
```

### Upload
```javascript
uploadObj.putFile();
```

### Upload Progress Callback
```javascript
uploadObj.uploadProgress = function (progress) {}
```
- progress format
```javascript
{
    total:{
        loaded: ?, // Size already loaded
        size: ?,   // Total file size
        percent: ? // Percentage
    },
    chunks:[     // Chunk information, in array form
        {loaded: ?, size: ?, percent: ?},
        {loaded: ?, size: ?, percent: ?}
    ]
}
```

### Error Callback
```javascript
uploadObj.onError = function (error) {}
```
- error format
```javascript
{
    code: ?,  // Error code. Note: uploadObj.stop() stop and timeout upload have no code
    message: "",  // Error message
    isRequestError: true // Whether it is a request error, that is, after normal upload, the server returns an error. This is a normal error and does not need to be re-uploaded
}
```

### Complete Callback
```javascript
uploadObj.onComplete = function(res){}
```
- res format
```javascript
{
    data: jsonObj/String   // Result returned by the server. Note: If it is direct upload, it returns the encoded string; if it exceeds the block size and uses multipart upload, it returns a json object
}
```

### Stop
```javascript
uploadObj.stop();
```

### URL Safe Base64 Decode
**Note**: After successful file upload, a URL Safe Base64 encoded string will be returned. You can decode it through the decoding method in the SDK.
```javascript
wcs.URLSafeBase64Decode(incodeString)
```

### Get File ETag
```javascript
wcs.getEtagHash(file, callback)
```

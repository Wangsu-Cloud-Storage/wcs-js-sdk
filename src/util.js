
import SparkMD5 from "spark-md5";
import {getErrorMessage, timeoutErrorMessage} from "./error";

export function createXHR() {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    }
    return new window.ActiveXObject("Microsoft.XMLHTTP");
}


export function request(url, options) {
    return new Promise((resolve, reject) => {
        let xhr = createXHR();
        xhr.open(options.method, url);

        if (options.onCreate) {
            options.onCreate(xhr);
        }

        if (options.timeout) {
            xhr.timeout = options.timeout;
        }
        if (options.headers) {
            Object.keys(options.headers).forEach(k =>
                xhr.setRequestHeader(k, options.headers[k])
            );
        }

        xhr.onreadystatechange = function () {
            console.log("xhr.onreadystatechange");
            console.log(xhr.readyState);
            console.log(xhr.status);
        };

        xhr.onloadstart = function() {
            console.log("xhr.onloadstart");
        };

        xhr.upload.onloadstart = function(){
            console.log("xhr.upload.onloadstart");
        };


        xhr.upload.onprogress = function(evt) {

            console.log("xhr.upload.onprogress");
            console.log(xhr.readyState);
            console.log(xhr.status);
            if (evt.lengthComputable && options.onProgress) {
                options.onProgress({loaded: evt.loaded, total: evt.total});
            }
        };

        //上传异常事件开始
        xhr.upload.onabort = function(){
            console.log("xhr.upload.onabort");
        };
        // XMLHttpRequest 超时
        xhr.upload.ontimeout = function (e) {
            console.log("xhr.upload.ontimeout");
            reject({code:0, message:timeoutErrorMessage, isRequestError: true});
        };

        xhr.upload.onerror = function(){
            console.log("xhr.upload.onerror");
        };
        //上传异常事件结束

        xhr.upload.onload = function(){
            console.log("xhr.upload.onload");

        };

        xhr.upload.onloadend = function(){
            console.log("xhr.upload.onloadend");
        };

        xhr.onprogress = function(){
            console.log("xhr.onprogress");
        };

        //异常事件开始
        xhr.onabort = function(){
            console.log("xhr.onabort");
        };
        // XMLHttpRequest 超时
        xhr.ontimeout = function (e) {
            console.log("xhr.ontimeout");
            reject({code:0, message:timeoutErrorMessage, isRequestError: true});
        };

        xhr.onerror = function(){
            console.log("xhr.onerror");
        };
        //异常事件结束

        xhr.onload = function(){
            console.log("xhr.onload");


        };

        xhr.onloadend = function(){
            console.log("xhr.onloadend");

            let responseText = xhr.responseText;
            console.log(xhr);
            console.log(xhr.readyState);
            console.log(xhr.status);
            if (xhr.readyState !== 4) {
                return;
            }

            if (xhr.status !== 200) {

                let  message = getErrorMessage(xhr.status);
                console.log(message);
                reject({code: xhr.status, message: message,  isRequestError: true});
                return;
            }

            try {
                resolve({data: parseResult(responseText)});
            } catch (err) {
                reject(err);
            }
        };

        xhr.send(options.body);
    });
}

export function parseResult(responseText) {
    try {
        let result = JSON.parse(responseText);
        if (typeof result === "object") {
            return result;
        }
    } catch (e) {
        console.log(e)
    }
    return responseText;
}

export function getChunks(file, blockSize) {
    let chunks = [];
    let count = Math.ceil(file.size / blockSize);
    for (let i = 0; i < count; i++) {
        let chunk = file.slice(
            blockSize * i,
            i === count - 1 ? file.size : blockSize * (i + 1)
        );
        chunks.push(chunk);
    }
    return chunks;
}


export function sum(list){
    return list.reduce((sum, loaded) => {
        return sum + loaded;
    }, 0);
}


export function computeMd5(data) {
    return readAsArrayBuffer(data).then(buffer => {
        let spark = new SparkMD5.ArrayBuffer();
        spark.append(buffer);
        return spark.end();
    });
}

export function readAsArrayBuffer(data) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsArrayBuffer(data);
        reader.onload = evt => {
            let body = evt.target.result;
            resolve(body);
        };
        reader.onerror = () => {
            reject(new Error("fileReader 读取错误"));
        };
    });
}


export function generateUUID() {

    let d = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function") {
        d += performance.now(); // use high-precision timer if available
    }
    let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

export function utf8_encode(argString) {

    if (argString === null || typeof argString === "undefined") {
        return "";
    }

    var string = (argString + ''); // .replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var utftext = '',
        start, end, stringl = 0;

    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;

        if (c1 < 128) {
            end++;
        } else if (c1 > 127 && c1 < 2048) {
            enc = String.fromCharCode(
                (c1 >> 6) | 192, (c1 & 63) | 128
            );
        } else if (c1 & 0xF800 ^ 0xD800 > 0) {
            enc = String.fromCharCode(
                (c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
            );
        } else { // surrogate pairs
            if (c1 & 0xFC00 ^ 0xD800 > 0) {
                throw new RangeError('Unmatched trail surrogate at ' + n);
            }
            var c2 = string.charCodeAt(++n);
            if (c2 & 0xFC00 ^ 0xDC00 > 0) {
                throw new RangeError('Unmatched lead surrogate at ' + (n - 1));
            }
            c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
            enc = String.fromCharCode(
                (c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
            );
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.slice(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }

    if (end > start) {
        utftext += string.slice(start, stringl);
    }

    return utftext;
}

export function base64_encode(data) {
    let b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        enc = '',
        tmp_arr = [];

    if (!data) {
        return data;
    }

    data = utf8_encode(data + '');

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1 << 16 | o2 << 8 | o3;

        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;

        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
            break;
        case 2:
            enc = enc.slice(0, -1) + '=';
            break;
    }

    return enc;
}

export function URLSafeBase64Encode(v) {
    v = base64_encode(v);
    return v.replace(/\//g, '_').replace(/\+/g, '-');
}

export function getProgressInfoItem(loaded, size) {
    return {
        loaded: loaded,
        size: size,
        percent: loaded / size * 100
    };
}
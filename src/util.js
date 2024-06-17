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
        };

        xhr.onloadstart = function () {
        };

        xhr.upload.onloadstart = function () {
        };


        xhr.upload.onprogress = function (evt) {

            if (evt.lengthComputable && options.onProgress) {
                options.onProgress({loaded: evt.loaded, total: evt.total});
            }
        };

        // 上传异常事件开始
        xhr.upload.onabort = function () {
        };
        // XMLHttpRequest 超时
        xhr.upload.ontimeout = function (e) {
            reject({code: 0, message: timeoutErrorMessage, isRequestError: true});
        };

        xhr.upload.onerror = function () {
        };
        // 上传异常事件结束

        xhr.upload.onload = function () {
        };

        xhr.upload.onloadend = function () {
        };

        xhr.onprogress = function () {
        };

        // 异常事件开始
        xhr.onabort = function () {
        };
        // XMLHttpRequest 超时
        xhr.ontimeout = function (e) {
            reject({code: 0, message: timeoutErrorMessage, isRequestError: true});
        };

        xhr.onerror = function () {
        };
        // 异常事件结束

        xhr.onload = function () {
        };

        xhr.onloadend = function () {
            let responseText = xhr.responseText;
            if (xhr.readyState !== 4) {
                return;
            }

            if (xhr.status !== 200) {

                let message = getErrorMessage(xhr.status);
                reject({code: xhr.status, message: message, isRequestError: true});
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
        // 无需打印日志
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


export function sum(list) {
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

    let string = (argString + ''); // .replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    let utftext = '',
        start, end, stringl = 0;

    start = end = 0;
    stringl = string.length;
    for (let n = 0; n < stringl; n++) {
        let c1 = string.charCodeAt(n);
        let enc = null;

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
            let c2 = string.charCodeAt(++n);
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

export function URLSafeEncode(v) {
    return v.replace(/\//g, '_').replace(/\+/g, '-');
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

function base64_decode(input) {
    let b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let chr1, chr2, chr3;
    let enc1, enc2, enc3, enc4;
    let i = 0;

    // 将输入的 URL 安全的 Base64 字符串替换回原来的字符
    input = input.replace(/_/g, '/').replace(/-/g, '+');
    // 移除 Base64 字符串中的所有非 Base64 字符
    input = input.replace(/[^A-Za-z0-9]/g, '');

    while (i < input.length) {
        enc1 = b64.indexOf(input.charAt(i++));
        enc2 = b64.indexOf(input.charAt(i++));
        enc3 = b64.indexOf(input.charAt(i++));
        enc4 = b64.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }
    }

    return output;
}

function utf8_decode(utftext) {
    let string = '';
    let i = 0;
    let c = 0, c1 = 0, c2 = 0;

    while ( i < utftext.length ) {
        c = utftext.charCodeAt(i);

        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        } else if((c > 191) && (c < 224)) {
            c1 = utftext.charCodeAt(i+1);
            string += String.fromCharCode(((c & 31) << 6) | (c1 & 63));
            i += 2;
        } else {
            c1 = utftext.charCodeAt(i+1);
            c2 = utftext.charCodeAt(i+2);
            string += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
            i += 3;
        }
    }

    return string;
}

export function URLSafeBase64Decode(input) {
    let decodedData = base64_decode(input); // 首先解码 Base64
    return utf8_decode(decodedData); // 然后进行 UTF-8 解码
}
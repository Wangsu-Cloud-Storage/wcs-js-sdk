import {URLSafeEncode} from "./util";

export let BLOCK_SIZE = 4 * 1024 * 1024;
let crypto = require('crypto');
const BYTE_LOW_4 = 0x16;
const BYTE_OVER_4 = 0x96;

function blockCount(file) {
    let count = Math.ceil(file.size / BLOCK_SIZE);
    return count;
}

/**
 * 不分块的情况计算文件sha1值
 */
function encodeFileSha1(file) {
    return new Promise((resolve) => {
        file.arrayBuffer().then(arrayBuffer => {
            let buf = new Buffer(arrayBuffer.byteLength);
            let view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < buf.length; ++i) {
                buf[i] = view[i];
            }
            let sha = crypto.createHash('sha1');
            sha.update(buf);
            let shaBuffer = sha.digest();
            resolve(shaBuffer);
        });
    });
}

/**
 * 计算每块的sha1值
 */
function encodeSha1(chunk, sha1Buffers, index) {
    return new Promise((resolve) => {
        chunk.arrayBuffer().then(arrayBuffer => {
            let buf = new Buffer(arrayBuffer.byteLength);
            let view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < buf.length; ++i) {
                buf[i] = view[i];
            }
            let sha = crypto.createHash('sha1');
            sha.update(buf);
            let shaBuffer = sha.digest();
            sha1Buffers[index] = shaBuffer;
            resolve();
        });
    });
}

function multipartSha1(sha1Strings) {
    let rec = Buffer.concat(sha1Strings);
    let sha1 = crypto.createHash('sha1');
    sha1.update(rec);
    return sha1.digest();
}

export function getEtag(file) {
    return new Promise((resolve) => {
        let count = blockCount(file);
        let etagHash = "";
        if (count <= 1) {
            let promise = encodeFileSha1(file);
            promise.then((shaBuffer) => {
                let clcBuffer = new Buffer(shaBuffer.length + 1);
                clcBuffer[0] = BYTE_LOW_4;
                for (let i = 0; i < shaBuffer.length; i++) {
                    clcBuffer[i + 1] = shaBuffer[i];
                }
                let etagHash = URLSafeEncode(clcBuffer.toString('base64'));
                resolve(etagHash);
            });
        } else {
            let sha1Buffers = new Array(count);
            let promises = [];
            for (let i = 0; i < count; i++) {
                let chunk = file.slice(BLOCK_SIZE * i, i === count - 1 ? file.size : BLOCK_SIZE * (i + 1));
                promises.push(encodeSha1(chunk, sha1Buffers, i));
            }
            // 计算完所有块的sha1后才能继续进行
            Promise.all(promises).then(() => {
                let ret = multipartSha1(sha1Buffers);
                let clcBuffer = new Buffer(ret.length + 1);
                clcBuffer[0] = BYTE_OVER_4;
                for (let i = 0; i < ret.length; i++) {
                    clcBuffer[i + 1] = ret[i];
                }
                let etagHash = URLSafeEncode(clcBuffer.toString('base64'));
                resolve(etagHash);
            });
        }
    });

}
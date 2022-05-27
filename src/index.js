import {URLSafeBase64Encode} from "./util";
import {UploadChunk} from "./uploadChunk";
import {UploadDirect} from "./uploadDirect";
import {getEtag} from "./etagUtil"



export let BLOCK_SIZE = 4 * 1024 * 1024;


function wcsUpload(file, token, uploadUrl, extraConfig, handlers) {
    let config = {
        file: file,
        token: token,
        uploadUrl: uploadUrl
    };

    if(extraConfig && extraConfig.blockSize){
        BLOCK_SIZE = extraConfig.blockSize * 1024 * 1024;
    }

    if(BLOCK_SIZE % 4 !== 0) {
        console.log("请将块大小设置为4的倍数!");
        return null;
    }

    if (!file) {
        console.log("没有文件!");
        return null;
    }

    if (file.size > BLOCK_SIZE) {
        return new UploadChunk(config, extraConfig, handlers);
    }

    return new UploadDirect(config, extraConfig, handlers);
}

function getEtagHash(file, callback) {
    if (!file) {
        console.log("没有文件!");
        callback("");
    }
    let promise = getEtag(file);
    promise.then((etagHash) => {
        callback(etagHash);
    });
}

export {
    wcsUpload,
    URLSafeBase64Encode,
    getEtagHash
};
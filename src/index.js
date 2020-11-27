import {URLSafeBase64Encode} from "./util";
import {BLOCK_SIZE, UploadChunk} from "./uploadChunk";
import {UploadDirect} from "./uploadDirect";
import {getEtag} from "./etagUtil"


function wcsUpload(file, token, uploadUrl, extraConfig, handlers) {
    let config = {
        file: file,
        token: token,
        uploadUrl: uploadUrl
    };

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
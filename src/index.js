

import {URLSafeBase64Encode} from "./util";
import {BLOCK_SIZE, UploadChunk} from "./uploadChunk";
import {UploadDirect} from "./uploadDirect";



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
        console.log("use upload chunk");
        return new UploadChunk(config, extraConfig, handlers);
    }

    return new UploadDirect(config, extraConfig, handlers);
}


export {
    wcsUpload,
    URLSafeBase64Encode
};
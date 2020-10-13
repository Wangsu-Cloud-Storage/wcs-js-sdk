

// 直传
import {generateUUID, getProgressInfoItem, request} from "./util";
import {abortErrorMessage} from "./error";

export class UploadDirect {

    constructor(config, extraConfig, handlers) {
        this.extraConfig = Object.assign(
            {
                retryCount: 0,
                timeout:0,
            },
            extraConfig
        );
        this.file = config.file;
        this.token = config.token;
        this.uploadUrl = config.uploadUrl;
        this.progress = null;
        this.aborted = false;
        this.xhr = null;
        this.retryCount = 0;
        this.file.id = generateUUID();
        this.xhrHandler = xhr => this.xhr = xhr;
        this.uploadProgress = () => {};
        this.onError = () => {};
        this.onComplete = () => {};
        Object.assign(this, handlers);
    }

    getUploadType(){
        return "uploadDirect";
    }

    putFile() {

        this.aborted = false;

        let formData = new FormData();
        formData.append("file", this.file);
        formData.append("token", this.token);
        if ('key' in this.extraConfig) {
            formData.append('key', this.extraConfig.key);
        }
        if ('mimeType' in this.extraConfig) {
            formData.append('mimeType', this.extraConfig.mimeType);
        }
        if ('deadline' in this.extraConfig) {
            formData.append('deadline', this.extraConfig.deadline);
        }
        let promise = request(this.getUploadUrl(), {
            method: "POST",
            body: formData,
            onCreate:this.xhrHandler,
            timeout: this.extraConfig.timeout,
            onProgress: (data) => {
                let progress = getProgressInfoItem(data.loaded, data.total);
                this.uploadProgress({total:progress});
            }
        }).then(res => {
            this.onComplete(res);
        }, err => {

            let needRetry = err.isRequestError && err.code === 0 && !this.aborted;
            if (needRetry) {
                let notReachRetryCount = ++this.retryCount <= this.extraConfig.retryCount;
                if (notReachRetryCount) {
                    this.putFile();
                    return;
                }
            }

            if (this.aborted) {
                this.onError({message: abortErrorMessage});
            } else {
                this.onError(err);
            }

        });

        return promise;
    }

    stop() {
        this.xhr.abort();
        this.xhr = null;
        this.aborted = true;
        this.retryCount = 0;
    }

    getUploadUrl() {
        return this.uploadUrl + "/file/upload";
    }
}






import {Pool} from "./pool.js";
import {computeMd5, generateUUID, getChunks, request, sum} from "./util.js";
import {URLSafeBase64Encode} from "./util.js";
import {getProgressInfoItem} from "./util";
import {abortErrorMessage} from "./error";

export let BLOCK_SIZE = 4 * 1024 * 1024;
//分片上传
export class UploadChunk {


    constructor(config, extraConfig, handlers) {
        this.extraConfig = Object.assign(
            {
                retryCount: 0,
                concurrentRequestLimit: 3,
                timeout:0,
                checkByMD5: false,
            },
            extraConfig
        );
        this.file = config.file;
        this.token = config.token;
        this.uploadUrl = config.uploadUrl;
        this.progress = null;
        this.xhrList = [];
        this.aborted = false;
        this.retryCount = 0;
        this.xhrHandler = xhr => this.xhrList.push(xhr);
        this.file.id = generateUUID();
        this.uploadProgress = () => {};
        this.onError = () => {};
        this.onComplete = () => {};
        Object.assign(this, handlers);
    }

    getUploadType(){
        return "uploadChunk";
    }

    putFile() {
        this.aborted = false;

        this.loaded = {
            mkFileProgress: 0,
            chunks: null
        };

        this.ctxList = [];
        this.localInfo = this.getLocalFileInfo(this.file);

        this.chunks = getChunks(this.file, BLOCK_SIZE);

        this.initChunksProgress();

        let pool = new Pool((chunkInfo) => this.uploadChunk(chunkInfo), this.extraConfig.concurrentRequestLimit);
        let uploadChunks = this.chunks.map((chunk, index) => {
            return pool.enqueue({chunk, index});
        });
        let result = Promise.all(uploadChunks).then(() => {
            return this.mkFileReq();
        });

        result.then(
            res => {
                this.onComplete(res);
                this.removeLocalFileInfo(this.file);
            },
            err => {


                let needRetry = err.isRequestError && err.code === 0 && !this.aborted;
                if (needRetry) {
                    let notReachRetryCount = ++this.retryCount <= this.extraConfig.retryCount;
                    if (notReachRetryCount) {
                        this.putFile();
                        return;
                    }
                }

                if (this.aborted) {
                    this.onError({message: abortErrorMessage})
                } else {
                    this.onError(err);
                }

                this.setLocalFileInfo(this.file, this.ctxList);
            }
        );
        return result;
    }

    clear() {
        this.xhrList.forEach(xhr => xhr.abort());
        this.xhrList = [];
    }

    stop() {
        this.clear();
        this.aborted = true;
        this.retryCount = 0;
    }



    createLocalKey(file) {
        return file.name + ":" + file.id;
    }

    uploadChunk(chunkInfo) {
        let {index, chunk} = chunkInfo;

        let info = this.localInfo[index];

        let requestUrl = this.uploadUrl + "/mkblk/" + chunk.size + "/" + index + "?name=" + URLSafeBase64Encode(this.file.name) + "&chunk=" + index + "&chunks=" + this.chunks.length;

        let savedReusable = info && !this.isChunkExpired(info.time);
        let shouldCheckMD5 = this.extraConfig.checkByMD5;
        let reuseSaved = () => {
            this.updateChunkProgress(chunk.size, index);
            this.ctxList[index] = {ctx: info.ctx, time: info.time, md5: info.md5};
            return Promise.resolve(null);
        };

        if (savedReusable && !shouldCheckMD5) {
            return reuseSaved();
        }

        return computeMd5(chunk).then(md5 => {

            if (savedReusable && md5 === info.md5) {
                return reuseSaved();
            }

            let headers = this.getHeadersForChunkUpload(this.token);
            let onProgress = data => {
                this.updateChunkProgress(data.loaded, index);
            };
            let onCreate = this.xhrHandler;
            let method = "POST";

            return request(requestUrl, {
                method,
                headers,
                timeout: this.extraConfig.timeout,
                body: chunk,
                onProgress,
                onCreate
            }).then(response => {
                this.ctxList[index] = {
                    time: new Date().getTime(),
                    ctx: response.data.ctx,
                    md5: md5
                };
            });
        });
    }


    isChunkExpired(time) {
        let expireAt = time + 3600 * 24 * 1000;
        return new Date().getTime() > expireAt;
    }

    getHeadersForMkFile(token) {
        let header = this.getAuthHeaders(token);
        return Object.assign({"content-type": "text/plain;charset=UTF-8", "uploadBatch": this.file.id}, header);
    }

    getHeadersForChunkUpload(token) {
        let header = this.getAuthHeaders(token);
        return Object.assign({"uploadBatch": this.file.id}, header);
    }

    getAuthHeaders(token) {
        let auth = "UpToken " + token;
        return {Authorization: auth};
    }

    mkFileReq() {

        let requestUrL = this.createMkFileUrl(this.uploadUrl, this.file.size);

        let body = this.ctxList.map(value => value.ctx).join(",");
        let headers = this.getHeadersForMkFile(this.token);
        let onCreate = this.xhrHandler;
        let method = "POST";
        return request(requestUrL, {method, body, headers, onCreate}).then(
            res => {
                this.updateMkFileProgress(1);
                return Promise.resolve(res);
            }
        );
    }

    createMkFileUrl(uploadUrl, size, key, putExtra) {
        return uploadUrl + '/mkfile/' + size;
    }

    removeLocalFileInfo(file) {
        try {
            localStorage.removeItem(this.createLocalKey(file));
        } catch (err) {
            if (window.console && window.console.warn) {
                console.warn("removeLocalFileInfo failed");
            }
        }
    }

    setLocalFileInfo(file, ctxList) {
        try {
            localStorage.setItem(this.createLocalKey(file), JSON.stringify(ctxList));
        } catch (err) {
            if (window.console && window.console.warn) {
                console.warn("setLocalFileInfo failed");
            }
        }
    }

    getLocalFileInfo(file) {
        try {
            return JSON.parse(localStorage.getItem(this.createLocalKey(file))) || [];
        } catch (err) {
            if (window.console && window.console.warn) {
                console.warn("getLocalFileInfo failed");
            }
            return [];
        }
    }

    initChunksProgress() {
        this.loaded.chunks = this.chunks.map(_ => 0);
        this.notifyResumeProgress();
    }

    updateChunkProgress(loaded, index) {
        this.loaded.chunks[index] = loaded;
        this.notifyResumeProgress();
    }

    updateMkFileProgress(progress) {
        this.loaded.mkFileProgress = progress;
        this.notifyResumeProgress();
    }

    notifyResumeProgress() {
        this.progress = {
            total: getProgressInfoItem(
                sum(this.loaded.chunks) + this.loaded.mkFileProgress,
                this.file.size + 1
            ),
            chunks: this.chunks.map((chunk, index) => {
                return getProgressInfoItem(this.loaded.chunks[index], chunk.size);
            })
        };
        this.uploadProgress(this.progress);

    }





}
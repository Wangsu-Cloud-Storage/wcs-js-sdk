/*global plupload ,mOxie*/
/*global ActiveXObject */
/*exported UploadDemo */

window.console = window.console || (function () {
    var c = {};
    c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile
        = c.clear = c.exception = c.trace = c.assert = function () {
    };
    return c;
})();

function UploadDemoJsSDK() {



    this.detectIEVersion = function () {
        var v = 4,
            div = document.createElement('div'),
            all = div.getElementsByTagName('i');
        while (
            div.innerHTML = '<!--[if gt IE ' + v + ']><i></i><![endif]-->',
                all[0]
            ) {
            v++;
        }
        return v > 4 ? v : false;
    };

    this.getFileExtension = function (filename) {
        var tempArr = filename.split(".");
        var ext;
        if (tempArr.length === 1 || (tempArr[0] === "" && tempArr.length === 2)) {
            ext = "";
        } else {
            ext = tempArr.pop().toLowerCase(); //get the extension and make it lower-case
        }
        return ext;
    };

    this.utf8_encode = function (argString) {

        if (argString === null || typeof argString === 'undefined') {
            return '';
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
    };

    this.base64_encode = function (data) {
        var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
            ac = 0,
            enc = '',
            tmp_arr = [];

        if (!data) {
            return data;
        }

        data = this.utf8_encode(data + '');

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
    };

    this.URLSafeBase64Encode = function (v) {
        v = this.base64_encode(v);
        return v.replace(/\//g, '_').replace(/\+/g, '-');
    };

    this.createAjax = function (argument) {
        var xmlhttp = {};
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        return xmlhttp;
    };

    this.parseJSON = function (data) {
        // Attempt to parse using the native JSON parser first
        if (window.JSON && window.JSON.parse) {
            return window.JSON.parse(data);
        } else {
            var json = (new Function("return " + data))();
            return json;
        }

        if (data === null) {
            return data;
        }
        if (typeof data === "string") {

            // Make sure leading/trailing whitespace is removed (IE can't handle it)
            // data = this.trim(data);

            if (data) {
                // Make sure the incoming data is actual JSON
                // Logic borrowed from http://json.org/json2.js
                if (/^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, "@").replace(/"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {

                    return (function () {
                        return data;
                    })();
                }
            }
        }
    };

    this.trim = function (text) {
        return text === null ? "" : this.trim.call(text);
    };
    this.changeSize = function(val) {
        if (val / 1024 < 1024) {
            return Math.round(val / 1024) + "kb";
        } else {
            return Math.round(val / 1024 / 1024) + "MB";
        }
    }

    //Todo ie7 handler / this.parseJSON bug;

    var that = this;

    this.uploader = function (op) {
        $("#uploadFileTable").on("click", function (e) {
            var tar = $(e.target);
            if (tar.hasClass("J_upfile_delete")) {
                var pobj = tar.parents("tr");
                var fileId = pobj.data("fileid");
                var fileName = document.getElementById("fileName_" + fileId).innerHTML;
                var bucket = $("#bucketNameId").val();
                var parentFilePath = $("#parentPathId").val();
                var parentPath = parentFilePath + "/" + fileName;
                if (parentPath.charAt(0) == "/") {
                    parentPath = parentPath.substr(1, parentPath.length);
                }
                parentPath = bucket + ":" + parentPath;
                console.log("delete locate before", localStorage.getItem(parentPath + ":" + fileId));
                localStorage.removeItem(parentPath + ":" + fileId);
                localStorage.removeItem(parentPath + ":" + fileId + "_ctx");
                console.log("delete locate after", localStorage.getItem(parentPath + ":" + fileId));
                //uploader.stop();
                //console.log("uploader.stop", uploader.files.length);

                uploader.removeFile(fileId);
                console.log("uploader.removeFile", fileId);
                pobj.remove();
                if (uploader.files.length < 1) {
                    $(".upload_filelist .nulltip").show();
                    //}else{
                    //    uploader.start();
                    //    console.log("uploader.start", uploader.files.length);
                }
            }
        });

        var option = {
            runtimes: 'html5,flash,html4',    //上传模式,依次退化
            browse_button: 'selectFile', // you can pass in id...
            container: document.getElementById('fileContain'), // ... or DOM Element itself
            uptoken_url: $("#getTokenUrlId").val(),
            flash_swf_url: '/js/plupload/Moxie.swf',
            max_retries: 0,                   //上传失败最大重试次数
            dragdrop: true,                   //开启可拖曳上传
            //drop_element: 'container',        //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
            chunk_size: '4mb',                //分块上传时，每片的体积
            auto_start: true,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
            filters: {
                // max_file_size: '4gb',
                mime_types: [
                    {title: "config file", extensions: "*"}
                ]
            },
            init: {
                PostInit: function () {
                    $("#uploadFile").on("click", function () {
                        if (uploader.total.queued < 1) {
                            BUI.Message.Alert('您还未选择配置文件！')
                        } else {
                            $(this).attr("disabled", true);
                            uploader.start();
                        }
                        return false;
                    });
                },

                FilesAdded: function (up, files) {
                    var htmlstr = "";
                    plupload.each(files, function (file) {
                        console.log("添加文件:", file.name + ":" + file.id);
                        htmlstr += '<tr data-fileid=' + file.id + ' data-start=' + Date.parse(new Date()) + '>\
								<td>\
									<div class="filename" id="fileName_' + file.id + '"  style="overflow:hidden;width:350px">' + file.name + '</div>\
									<div class="process_contain" id="statu_' + file.id + '">\
										<span class="process_bar"><span></span></span>\
										<span class="process_num">等待上传</span>\
									</div>\
								</td>\
								<td>\
									<div class="filesize">' + that.changeSize(file.size) + '</div>\
									<div class="process_time">00:00</div>\
								</td>\
								<td width="50" class="filectrl_td">\
									<span class="delete_file J_upfile_delete">×</span>\
								</td>\
								<td width="50" class="filectrl_td22">\
								</td>\
							</tr>';
                    });
                    $(".upload_filelist .nulltip").hide();
                    $("#uploadFileTable tbody").append(htmlstr);
                    uploader.start();
                },
                UploadProgress: function (up, file) {
                    //updateProcess(file.percent, file.id);
                    var item = $("#statu_" + file.id);
                    var num = file.percent;
                    if (file.percent >= 100) {
                        num = 99;
                    }
                    item.find(".process_bar span").css("width", num + "%");
                    item.find(".process_num").text(num + "%");

                    var trobj = $("#uploadFileTable tr[data-fileid=" + file.id + "]");
                    var updateobj = trobj.find(".process_time");
                    var start = trobj.data("start");
                    var end = Date.parse(new Date());
                    var counttime = Math.round(end - uploadStartTime) / 1000;
                    if (counttime < 60) {
                        if (counttime < 10) {
                            updateobj.html("00:0" + counttime);
                        } else {
                            updateobj.html("00:" + counttime);
                        }
                    } else {
                        var sval = counttime % 60;
                        var mval = Math.floor(counttime / 60);
                        sval = sval < 10 ? ("0" + sval) : sval;
                        mval = mval < 10 ? ("0" + mval) : mval;
                        updateobj.html(mval + ":" + sval);
                    }
                },
                UploadComplete: function (up, files) {
                    $("#uploadFile").remove();
                    $("#upfileBtnBottom").prepend("<a href='#' class='button J_filesave'>保存</a>")
                },
                UploadFile: function (up, file) {
                },
                FilesRemoved: function (up, files) {
                    //alert("<p style='color:#999;font-size:18px;margin-top:17.5%;text-align:center;'>您还没有选择任何文件</p>");
                },
                Error: function (up, err, errTipe) {
                    if (errTipe) {
                        var item = $("tr[data-fileid='" + err.file.id + "']");
                        item.find(".process_contain").html("<span class='txt-error'> " + errTipe + " </span>");
                        item.find(".filectrl_td").html("<a href='javascript:;' class='button button-darkblue'>续传</a>");
                        item.find(".filectrl_td a").on("click", function () {
                            $(this).parents("tr").remove();
                            err.file.status = 1;
                            uploader.addFile(err.file);
                        });
                        item.find(".filectrl_td22").html("<a href='javascript:;' class='button button-darkblue'>重新上传</a>");
                        item.find(".filectrl_td22 a").on("click", function () {
                            var bucket = $("#bucketNameId").val();
                            var parentFilePath = $("#parentPathId").val();
                            var parentPath = parentFilePath + "/" + err.file.name;
                            if (parentPath.charAt(0) == "/") {
                                parentPath = parentPath.substr(1, parentPath.length);
                            }
                            parentPath = bucket + ":" + parentPath;
                            console.log("重新上传 remove key", parentPath + ":" + err.file.id);
                            console.log("重新上传 remove key before", localStorage.getItem(parentPath + ":" + err.file.id));
                            localStorage.removeItem(parentPath + ":" + err.file.id);
                            localStorage.removeItem(parentPath + ":" + err.file.id + "_ctx");
                            console.log("重新上传 remove key after", localStorage.getItem(parentPath + ":" + err.file.id));
                            $(this).parents("tr").remove();
                            err.file.status = 1;
                            err.file.offset = 0;
                            err.file.percent = 0;
                            err.file.loaded = 0;
                            uploader.addFile(err.file);
                        });
                    }
                    //document.getElementById('console').innerHTML += "\nError #" + err.code + ": " + err.message;
                }
            }
        };

        var op = $.extend(option, op);
        var _Error_Handler = op.init && op.init.Error;
        var _FileUploaded_Handler = op.init && op.init.FileUploaded;

        //op.init.Error = function () {
        //};
        //op.init.FileUploaded = function () {
        //};

        that.uptoken_url = op.uptoken_url;
        that.token = '';
        that.key_handler = typeof op.init.Key === 'function' ? op.init.Key : '';
        //this.domain = op.domain;
        var bucket = $("#bucketNameId").val();
        var parentFilePath = $("#parentPathId").val();
        var fullFileName = '';
        var upload_url = $("#uploadUrlId").val();
        var akId = $("#akId").val();
        var overwrite = 0;
        var uploadStartTime = Date.parse(new Date());

        var reset_chunk_size = function () {
            var ie = that.detectIEVersion();
            var BLOCK_BITS, MAX_CHUNK_SIZE, chunk_size;
            var isSpecialSafari = (mOxie.Env.browser === "Safari" && mOxie.Env.version <= 5 && mOxie.Env.os === "Windows" && mOxie.Env.osVersion === "7") || (mOxie.Env.browser === "Safari" && mOxie.Env.os === "iOS" && mOxie.Env.osVersion === "7");
            if (ie && ie <= 7 && op.chunk_size) {
                //  link: http://www.plupload.com/docs/Frequently-Asked-Questions#when-to-use-chunking-and-when-not
                //  when plupload chunk_size setting is't null ,it cause bug in ie8/9  which runs  flash runtimes (not support html5) .
                op.chunk_size = 0;

            } else if (isSpecialSafari) {
                // win7 safari / iOS7 safari have bug when in chunk upload mode
                // reset chunk_size to 0
                // disable chunk in special version safari
                op.chunk_size = 0;
            } else {
                BLOCK_BITS = 20;
                MAX_CHUNK_SIZE = 4 << BLOCK_BITS; //4M

                chunk_size = plupload.parseSize(op.chunk_size);
                if (chunk_size > MAX_CHUNK_SIZE) {
                    op.chunk_size = MAX_CHUNK_SIZE;
                }
            }
        };
        reset_chunk_size();
        /**
         * 获取上传的token
         * @param fileKey
         */
        var getUpToken = function (fileKey) {
            var fullFileName = parentFilePath + "/" + fileKey;
            if (fullFileName.charAt(0) == "/") {
            	fullFileName = fullFileName.substr(1, fullFileName.length);
            }
            var checkBoxOverWrite = document.getElementById('fileOverWrite')
            if (checkBoxOverWrite.checked) {
                overwrite = 1;
            } else {
                overwrite = 0;
            }
            var expire = new Date();
            expire.setDate(expire.getDate()+1);//设置token有效期1天
            if (!op.uptoken) {
                var ajax = that.createAjax();

                var uptoken_url = that.uptoken_url + "?bucket=" + bucket + "&key=" + that.URLSafeBase64Encode(fullFileName) + "&overwrite=" + overwrite  + "&expire="+expire.getTime()+"&ak=" + akId ;
                console.log('uptoken_url:', uptoken_url);
                ajax.open('GET', uptoken_url, false);
                ajax.onreadystatechange = function () {
                    if (ajax.readyState === 4 && ajax.status === 200) {
                        that.token = ajax.responseText;
                        console.log('that.token:', that.token);
                    }
                };
                ajax.send();
            } else {
                that.token = op.uptoken;
            }
        };

        var getFileKey = function (up, file, func) {
            var key = '',
                unique_names = false;
            if (!op.save_key) {
                unique_names = up.getOption && up.getOption('unique_names');
                unique_names = unique_names || (up.settings && up.settings.unique_names);
                if (unique_names) {
                    var ext = that.getFileExtension(file.name);
                    key = ext ? file.id + '.' + ext : file.id;
                } else if (typeof func === 'function') {
                    key = func(up, file);
                } else {
                    key = file.name;
                }
            }
            return key;
        };

        plupload.extend(option, op, {
            url: upload_url + '/file/upload',
            multipart_params: {
                token: ''
            }
        });

        var uploader = new plupload.Uploader(option);

        uploader.bind('Init', function (up, params) {
//            getUpToken();
        });

        uploader.bind('FilesAdded', function (up, files) {
            var auto_start = up.getOption && up.getOption('auto_start');
            auto_start = auto_start || (up.settings && up.settings.auto_start);
            if (auto_start) {
                up.start();
            }
            up.refresh(); // Reposition Flash/Silverlight
        });

        uploader.bind('BeforeUpload', function (up, file) {
            uploadStartTime = Date.parse(new Date());
            fullFileName = parentFilePath + "/" + file.name;
            if (fullFileName.charAt(0) == "/") {
                fullFileName = fullFileName.substr(1, fullFileName.length);
            }
            fullFileName = bucket + ":" + fullFileName;
            console.log('BeforeUpload fullFileName:', fullFileName + ":" + file.id);
            getUpToken(file.name);
            if(that.token == ''){
                _Error_Handler(up, err, "获取token失败!");
                return;
            }

            var directUpload = function (up, file, func) {

                var multipart_params_obj;
                if (op.save_key) {
                    multipart_params_obj = {
                        'token': that.token
                    };
                } else {
                    multipart_params_obj = {
                        'key': getFileKey(up, file, func),
                        'token': that.token
                    };
                }

                var x_vars = op.x_vars;
                if (x_vars !== undefined && typeof x_vars === 'object') {
                    for (var x_key in x_vars) {
                        if (x_vars.hasOwnProperty(x_key)) {
                            if (typeof x_vars[x_key] === 'function') {
                                multipart_params_obj['x:' + x_key] = x_vars[x_key](up, file);
                            } else if (typeof x_vars[x_key] !== 'object') {
                                multipart_params_obj['x:' + x_key] = x_vars[x_key];
                            }
                        }
                    }
                }


                up.setOption({
                    'url': upload_url + '/file/upload',
                    'multipart': true,
                    'chunk_size': undefined,
                    'multipart_params': multipart_params_obj
                });
            };


            var chunk_size = up.getOption && up.getOption('chunk_size');
            chunk_size = chunk_size || (up.settings && up.settings.chunk_size);
            if ((uploader.runtime == 'flash' || uploader.runtime == 'html5') && chunk_size) {
                if (file.size < chunk_size) {
                    console.log('BeforeUpload directUpload file.size:', file.size);
                    directUpload(up, file, that.key_handler);
                } else {
                    var localFileInfo = localStorage.getItem(fullFileName + ":" + file.id);
                    var blockSize = chunk_size;
                    console.log('BeforeUpload localFileInfo:', localFileInfo);
                    if (localFileInfo) {
                        localFileInfo = that.parseJSON(localFileInfo);
                        var now = (new Date()).getTime();
                        var before = localFileInfo.time || 0;
                        var aDay = 24 * 60 * 60 * 1000; //  milliseconds
                        if (now - before < aDay) {
                            if (localFileInfo.percent !== 100) {
                                if (file.size === localFileInfo.total) {
                                    file.percent = localFileInfo.percent;
                                    file.loaded = localFileInfo.offset;
                                    //ctx = localFileInfo.ctx;
                                    if (localFileInfo.offset + blockSize > file.size) {
                                        blockSize = file.size - localFileInfo.offset;
                                    }
                                } else {
                                    localStorage.removeItem(fullFileName + ":" + file.id);
                                    localStorage.removeItem(fullFileName + ":" + file.id + "_ctx");
                                }

                            } else {
                                // 进度100%时，删除对应的localStorage，避免 499 bug
                                localStorage.removeItem(fullFileName + ":" + file.id);
                                localStorage.removeItem(fullFileName + ":" + file.id + "_ctx");

                            }
                        } else {
                            localStorage.removeItem(fullFileName + ":" + file.id);
                            localStorage.removeItem(fullFileName + ":" + file.id + "_ctx");
                        }
                    }
                    console.log("before mkblk offset", file.percent);
                    if (blockSize > 0) {
                        up.setOption({
                            'url': upload_url + '/mkblk/' + blockSize, //url 为mkblk/块大小/块序号z
                            'multipart': false,
                            'chunk_size': chunk_size,
                            'required_features': "chunks",
                            'headers': {
                                'Authorization': 'UpToken ' + that.token,
                                'uploadBatch': file.id
                            },
                            'multipart_params': {}
                        });
                    } else {
                        console.log("before mkblk blockSize", blockSize);
                    }
                }
            } else {
                directUpload(up, file, that.key_handler);
            }
        });

        uploader.bind('ChunkUploaded', function (up, file, info) {
            var res = that.parseJSON(info.response);
            var ctx = localStorage.getItem(fullFileName + ":" + file.id + "_ctx");
            ctx = ctx ? ctx + ',' + res.ctx : res.ctx;
            localStorage.setItem(fullFileName + ":" + file.id + "_ctx", ctx);
            var leftSize = info.total - info.offset;
            var chunk_size = up.getOption && up.getOption('chunk_size');
            chunk_size = chunk_size || (up.settings && up.settings.chunk_size);
            if (leftSize < chunk_size) {
                up.setOption({
                    'url': upload_url + '/mkblk/' + leftSize
                });
            }
            localStorage.setItem(fullFileName + ":" + file.id, JSON.stringify({
                ctx: ctx,
                percent: file.percent,
                total: info.total,
                offset: info.offset,
                time: (new Date()).getTime()
            }));
            console.log('ChunkUploaded localFileInfo:', localStorage.getItem(fullFileName + ":" + file.id));
        });

        uploader.bind('Error', (function (_Error_Handler) {
            return function (up, err) {
                var errTip = '';
                var file = err.file;
                console.log('Error err.code:', err.code);
                console.log('Error err.status:', err.status);
                if (file) {
                    switch (err.code) {
                        case plupload.FAILED:
                            errTip = '上传失败。请稍后再试。';
                            break;
                        case plupload.FILE_SIZE_ERROR:
                            var max_file_size = up.getOption && up.getOption('max_file_size');
                            max_file_size = max_file_size || (up.settings && up.settings.max_file_size);
                            errTip = '浏览器最大可上传' + max_file_size + '。更大文件请使用其他工具。';
                            break;
                        case plupload.FILE_EXTENSION_ERROR:
                            errTip = '文件验证失败。请稍后重试。';
                            break;
                        case plupload.HTTP_ERROR:
                            switch (err.status) {
                                case 400:
                                    errTip = "请求报文格式错误。";
                                    break;
                                case 401:
                                    errTip = "客户端认证授权失败。请重试或提交反馈。";
                                    break;
                                case 405:
                                    errTip = "客户端请求错误。请重试或提交反馈。";
                                    break;
                                case 579:
                                    errTip = "资源上传成功，但回调失败。";
                                    break;
                                case 599:
                                    errTip = "网络连接异常。请重试或提交反馈。";
                                    break;
                                case 406:
                                    errTip = "文件已存在，请修改文件名后重试。";
                                    try {
                                        errorObj = that.parseJSON(errorObj.error);
                                        errorText = errorObj.error || 'file exists';
                                    } catch (e) {
                                        errorText = 'file exists';
                                    }
                                    break;
                                case 631:
                                    errTip = "指定空间不存在。";
                                    break;
                                case 701:
                                    errTip = "上传数据块校验出错。请重试或提交反馈。";
                                    break;
                                default:
                                    errTip = "其他网络错误!";
                                    break;
                            }
                            //errTip = errTip + '(' + err.status + '：' + errorText + ')';
                            break;
                        case plupload.SECURITY_ERROR:
                            errTip = '安全配置错误。请联系网站管理员。';
                            break;
                        case plupload.GENERIC_ERROR:
                            errTip = '上传失败。请稍后再试。';
                            break;
                        case plupload.IO_ERROR:
                            errTip = '上传失败。请稍后再试。';
                            break;
                        case plupload.INIT_ERROR:
                            errTip = '网站配置错误。请联系网站管理员。';
                            uploader.destroy();
                            break;
                        default:
                            errTip = err.message + err.details;
                            break;
                    }
                    if (_Error_Handler) {
                        _Error_Handler(up, err, errTip);
                    }
                }
                up.refresh(); // Reposition Flash/Silverlight
            };
        })(_Error_Handler));

        uploader.bind('FileUploaded', (function (_FileUploaded_Handler) {
            return function (up, file, info) {

                var last_step = function (up, file, info) {
                    console.log("FileUploaded remove before", localStorage.getItem(fullFileName + ":" + file.id));
                    localStorage.removeItem(fullFileName + ":" + file.id);
                    localStorage.removeItem(fullFileName + ":" + file.id + "_ctx");
                    console.log("FileUploaded remove after", localStorage.getItem(fullFileName + ":" + file.id));
                    var item = $("#statu_" + file.id);
                    if (file.percent >= 100) {
                        item.html("<span class='upload_success'>上传完成</span>");
                        item.parents("tr").find(".delete_file").remove();
                    }
                };
                console.log('FileUploaded info:', info.response);
                var res;
                var ctx = localStorage.getItem(fullFileName + ":" + file.id + "_ctx");
                try{
                    res = that.parseJSON(info.response);
                    ctx = ctx ? ctx : res.ctx;
                }catch (e) {
                    console.log('that.parseJSON err:', info.response);
                }
                console.log('FileUploaded res:', res);
                if (ctx) {
                    var key = '';
                    if (!op.save_key) {
                        key = getFileKey(up, file, that.key_handler);
                        key = key ? '/key/' + that.URLSafeBase64Encode(key) : '';
                    }

                    var x_vars = op.x_vars,
                        x_val = '',
                        x_vars_url = '';
                    if (x_vars !== undefined && typeof x_vars === 'object') {
                        for (var x_key in x_vars) {
                            if (x_vars.hasOwnProperty(x_key)) {
                                if (typeof x_vars[x_key] === 'function') {
                                    x_val = that.URLSafeBase64Encode(x_vars[x_key](up, file));
                                } else if (typeof x_vars[x_key] !== 'object') {
                                    x_val = that.URLSafeBase64Encode(x_vars[x_key]);
                                }
                                x_vars_url += '/x:' + x_key + '/' + x_val;
                            }
                        }
                    }

                    var ie = that.detectIEVersion();var ajax;
                    if (ie && ie <= 9) {
                        ajax = new mOxie.XMLHttpRequest();
                        mOxie.Env.swf_url = op.flash_swf_url;
                    }else{
                        ajax = that.createAjax();
                    }
                    var url = upload_url + '/mkfile/' + file.size + key + x_vars_url;
                    ajax.open('POST', url, false);
                    ajax.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
                    ajax.setRequestHeader('Authorization', 'UpToken ' + that.token);
                    ajax.setRequestHeader('uploadBatch', file.id);
                    var onreadystatechange = function () {
                        console.log('ajax.readyState '+ajax.readyState+" ajax.status " +ajax.status);
                        if (ajax.readyState === 4) {
                            localStorage.removeItem(fullFileName + ":" + file.id);
                            localStorage.removeItem(fullFileName + ":" + file.id + "_ctx");
                            if (ajax.status === 200) {
                                var info = ajax.responseText;
                                last_step(up, file, info);
                            } else {
                                uploader.trigger('Error', {
                                    status: ajax.status,
                                    response: ajax.responseText,
                                    file: file,
                                    code: -200
                                });
                            }
                        }
                    };
                    if (ie && ie <= 9) {
                        ajax.bind('readystatechange', onreadystatechange);
                    }else{
                        ajax.onreadystatechange = onreadystatechange;
                    }
                        ajax.send(ctx);
                } else {
                    last_step(up, file, info.response);
                }

            };
        })(_FileUploaded_Handler));

        uploader.init();

        return uploader;
    };
}

var UploadDemo = new UploadDemoJsSDK();

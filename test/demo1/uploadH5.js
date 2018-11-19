$("#h5selectFile").on("click", function () {
    $("#file").click();
});

$("#file").on("change", function () {
    if($(this).val() == ''){//如果没有选择文件则不触发
        return false;
    }
    for (var i = 0; i < this.files.length; i++) {
        var file = this.files[i];
        initFile(file);
    }
    $(this).val('');//操作结束清空input中的内容
});


function initFileAdd(file) {
    var htmlstr = "";
    console.log("添加文件:", file.name + ":" + file.id);
    htmlstr += '<tr data-fileid=' + file.id + ' data-start=' + Date.parse(new Date()) + '>\
								<td>\
									<div class="filename"  style="overflow:hidden;width:350px">' + file.name + '</div>\
									<div class="process_contain">\
										<span class="process_bar"><span></span></span>\
										<span class="process_num"></span>\
										<span class="message">等待上传</span>\
									</div>\
								</td>\
								<td width="50" class="filectrl_td">\
									<span class="delete_file J_upfile_delete">×</span>\
								</td>\
								<td width="50" class="filectrl_td22">\
								   <span class="button button-darkblue upload_start">上传</span>\
								</td>\
								<td width="50" class="filectrl_td22">\
                                    <span class="button button-darkblue upload_stop">暂停</span>\
                                </td>\
							</tr>';

    $(".upload_filelist .h5nulltip").hide();
    $("#h5uploadFileTable tbody").append(htmlstr);
};

function initFile(file) {

    var getTokenUrlId = $("#getTokenUrlId").val();
    var expire = new Date();
    expire.setDate(expire.getDate()+1);//设置token有效期1天
    $.ajax({
        url: getTokenUrlId,
        type: "POST",
        data: {
            ak: $("#akId").val(),
            bucket: $("#bucketNameId").val(),
            expire: expire.getTime(),
            key: file.name,
            overwrite:$("#h5fileOverWrite").is(":checked")?1:0
        },
        error:function(res){
            alert("token 获取失败");
        },
        success: function (res) {
            console.log(res);
            var token = res;

            var uploadUrl = $("#uploadUrlId").val();

            var extraConfig = {
                timeout: parseInt($("#timeout").val()),
                concurrentRequestLimit: parseInt($("#concurrentRequestLimit").val()),
                retryCount: parseInt($("#retryCount").val())
            };

            var uploadObj = wcs.wcsUpload(file, token, uploadUrl, extraConfig);

            console.log(uploadObj);


            initFileAdd(uploadObj.file);
            var li = $("#h5uploadFileTable tr[data-fileid='" + uploadObj.file.id + "']");
            uploadObj.uploadProgress = function (progress) {
                console.log("uploadProgress");
                console.log(progress);

                if (progress.chunks) {

                    if ($(li).find(".chunk_process_contain").length == 0) {

                        $(li).find(".process_contain").after("<div>块进度</div><div class='chunk_process_contain'></div>");
                        var splitPercent = 100 / progress.chunks.length;
                        for (var i = 0; i < progress.chunks.length; i++) {
                            $(li).find(".chunk_process_contain").append("<span class=\"process_bar\" width='"+splitPercent+"%'><span></span></span>");
                        }
                    }

                    var chunkProcessSpan =   $(li).find(".chunk_process_contain .process_bar span");
                    for (var i = 0; i < progress.chunks.length; i++) {
                        var chunk = progress.chunks[i];
                        var chunkPercent = chunk.percent.toFixed(2) + "%";
                        $($(chunkProcessSpan).get(i)).css("width", chunkPercent);
                    }
                }
                console.log(progress.total.percent);
                $(li).find(".process_contain .process_bar span").css("width", progress.total.percent.toFixed(2) + "%");
                $(li).find(".process_num").html(progress.total.percent.toFixed(2)+"%");

            };

            uploadObj.onError = function (error) {
                $(li).find(".message").html(error.message);
            };

            uploadObj.onComplete = function(res){
                console.log(res);
                $(li).find(".message").html("上传成功");
            };

            $(li).find(".upload_start").on("click", function () {
                uploadObj.putFile();
                $(li).find(".message").html("");
            });

            $(li).find(".upload_stop").on("click", function () {
                uploadObj.stop();
            });

            $(li).find(".J_upfile_delete").on("click", function () {
                $(li).remove();

            });

        }
    });
}


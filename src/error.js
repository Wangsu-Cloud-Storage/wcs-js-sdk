let errorMap = {
    400: "请求报文格式错误。",
    401: "客户端认证授权失败。请重试或提交反馈。",
    405: "客户端请求错误。请重试或提交反馈。",
    579: "资源上传成功，但回调失败。",
    599: "网络连接异常。请重试或提交反馈。",
    406: "文件已存在，请修改文件名后重试。",
    631: "指定空间不存在。",
    701: "上传数据块校验出错。请重试或提交反馈。"
};

export let timeoutErrorMessage = "上传文件超时。";
export let abortErrorMessage = "停止上传文件。";

export function getErrorMessage(code) {

    let message = errorMap[code];
    if (message) {
        return message;
    }

    return "其他网络错误!";

}
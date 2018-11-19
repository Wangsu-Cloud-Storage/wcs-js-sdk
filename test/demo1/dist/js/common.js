function setAutoHeight(){
    var winh=$(window).height();
    var bodyh=$("body").height();
    var footh=$(".footer").height();
    var heighth=$(".header").height();
    $(".body").css({'min-height':(winh-footh-heighth)+"px"});
}
$(window).resize(setAutoHeight);
$(document).ready(function(){
    //tooltip提示
        var toolTipEvent = function(){
            $("[data-tooltip]").live("mouseover mouseout",function(e){
                var now = $(this),_dest = $("#J-functips");
                if(e.type == "mouseover"){
                    var _msg = now.data("tooltip");
                    var _offset = now.offset();
                    var _nowW = now.outerWidth();
                    var _nowH = now.height()+13;

                    var _left = _offset.left;
                    var _top = _offset.top;
                    if(_dest.length < 1){
                        $("body").append('<div id="J-functips" class="btn-tipwrap"><div id="J-functipstxt" class="btn-tip">'+_msg+'</div><span class="triangle triangle-down"></span></div>');
                    }
                    $("#J-functipstxt").html(_msg);
                    var _w = $("#J-functips").outerWidth(true);
                    var _h = $("#J-functips").outerHeight(true)+6;

                    $("#J-functips").css({"left":_left - _w/2 + _nowW*0.5,"top":_top - _h}).stop(false,true).show();
                }else{
                    $("#J-functips").stop(false,true).hide();
                }
            });
        };
        toolTipEvent();
        setAutoHeight();
    });
$(document).on("click", "#J_MainLeftNav p.text-sub", function (event) {//p.text-sub含有子菜单的父级，当折叠起来的时候再menu-curr 展开当前级别submenu-unfold
        var li = $(this).parent();
        if ($(this).siblings("ul").length) {
            if (li.hasClass("submenu-unfold")) {
                $(this).siblings("ul").slideUp("normal", function () {
                    li.removeClass("submenu-unfold");
                });
            } else {//非激活状态
                li.siblings(".submenu-unfold").find("ul").slideUp("normal", function () {
                    $(this).parent("li").removeClass("submenu-unfold");
                });
                $(this).siblings("ul").slideDown("normal", function () {
                    li.addClass("submenu-unfold");
                });
            }
        }

});
//自定义placeholder提示
function placeInit(){
    var obj=$(".emulation_place");
    var textobj=obj.find(".my_placeholder");
    var inputid=textobj.attr("data-id");
    var inputobj=$("#"+inputid);
    inputobj.on("click focus keydown",function(){
        if(inputobj.val()==""){
            textobj.show();
        }else{
            textobj.hide();
        }
    });
    textobj.on("click",function(){
        inputobj.focus();
    });
}
//自定义TAB组件
function tabInit(obj) {
    var navobj=$(".tabs-nav li", obj);
    var selectobj=$(obj).find(".tabs-nav li.selected");
    var index=navobj.index(selectobj);
    index= index==-1 ? 0 : index;
    $(".tabs-nav li", obj).eq(index).addClass("selected");
    $(".tabs-con", obj).eq(index).show();
    navobj.on("click", function(event) {
        if (!$(this).hasClass("selected")) {
            var curIndex = $(".tabs-nav li", obj).index(this);
            $(".tabs-nav li.selected", obj).removeClass("selected");
            $(this).addClass("selected");
            $(".tabs-con", obj).hide();
            $(".tabs-con", obj).eq(curIndex).show();
        }
    });
}

/* tips关闭 */
$(".tips").on("click",".tips-close",function(){
    $(this).parents(".tips").hide();
});

//自定义选择框
function initCheck(){
    var icheckwrap=$(".icheck_wrap");
    icheckwrap.each(function(){
        var checkobj=$(this).find("input");
        var inputtype=checkobj.attr("type");
        var checkval=checkobj.prop("checked");
        var classval="my"+inputtype+"_box";
        if(checkval){
            classval+=" checked";
        }
        checkobj.wrap("<div class='"+classval+"'></div>").after("<span style='position:absolute;left:0;top:0;bottom:0;width:100%;height:100%:display:block;z-index:2;'></span>");
    });
    icheckwrap.on("click",function(e){
        var inputobj=$(this).find("input");
        var inputobjval=inputobj.prop("checked");
        var checktype=inputobj.attr("type");
        if($(e.target).is("input")){
            inputobjval=!inputobjval;
        }
        if(inputobjval){
            if(checktype=="radio"){
                return false
            }
            inputobj.parent().removeClass("checked");
            inputobj.prop("checked",false);
        }else{
            if(checktype=="radio"){
                var radioname=inputobj.attr("name");
                $(".icheck_wrap").find("input[name='"+radioname+"']").parent().removeClass("checked");
            }
            inputobj.parent().addClass("checked");
            inputobj.prop("checked",'chekced');
        }
        console.log($(this).find("input").data("event"));
        return false;
    });
}

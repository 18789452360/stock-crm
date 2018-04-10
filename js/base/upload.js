/**
 * [description] 上传类
 * @param  {[type]} layui){} [description]
 * @return {[type]}            [description]
 */
define(['layui','ajaxurl'],function(layui, ajaxurl){
	return {
		init : function(optins){
			if(!optins.elem){
				throw new Error('上传类缺少参数');
			}
			var _THIS_ = new Object();
			$.extend(_THIS_, {
                elem: '', //指向容器选择器，如：elem: '#id'。也可以是DOM对象
                url: ajaxurl.upload.ftp_upload, //上传接口地址
                method: 'post', //上传接口的 HTTP 类型
                data:{}, //请求上传接口的额外参数
                accept: 'images', //指定允许上传的文件类型，可选值有：images（图片）、file（所有文件）、video（视频）、audio（音频）
                exts: 'jpg|png|bmp|jpeg', //允许上传的文件后缀
                size: 2048, //设置文件最大可允许上传的大小，单位 KB。不支持ie8/9
                drag: false, //是否接受拖拽的文件上传，设置 false 可禁用
                choose:function(object){}, 
                before:function(object){}, //上传前的方法 可以设置loading
                done:function(res,index,upload){},
                error:function(index,upload){}
            }, optins);
			layui.use('upload', function(){
				//获取upload实列
		        var upload = layui.upload;
		        upload.render(_THIS_)
		    })
		}
	}
});
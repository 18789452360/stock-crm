!(function () {
    // 配置绝对路径
    var BaseUrl = (window.location.origin ? window.location.origin : window.location.protocol + '//' + window.location.host) + window.ADMINJS; 
    requirejs.config({
        baseUrl: BaseUrl,
        paths: {
            //--------------公共库----------------------
            'jquery'             :       'libs/jquery/jquery.min', //jquery库 
            'vue'                :       'libs/vue/vue',// vuejs
            'layui'              :       'libs/layui/layui',// layui 库
            'text'               :       'libs/require/require.text',// require.text
            'moment'             :       'libs/moment/moment_2.18.1',// 时间处理库
            'moment-zh-cn'       :       'libs/moment/zh-cn',
            'jquery.cookie'      :       'libs/jquery/jquery.cookie', // 设置 cookie
            'jquery.treeview'    :       'libs/jquery/jquery.treeview', // 设置树形菜单
            'jquery.Jcrop'       :       'libs/jquery/jquery.Jcrop',// 图像剪裁
            'jquery.metisMenu'   :       'libs/jquery/jquery.metisMenu',//折叠菜单
            'jquery.slimscroll'  :       'libs/jquery/jquery.slimscroll.min',// 滚动条
            'lazyload'           :       'libs/jquery/jquery.lazyload.min',// 图片懒加载
            'validform'          :       'libs/jquery/validform_v5.3.2',// 表单验证
            'store'              :       'libs/store/store.min',// localStorage 、sessionStorage
            'bootstrap'          :       'libs/bootstrap/bootstrap.min',// bootstrap
            'iCheck'             :       'libs/jquery/icheck.min',//表单美化
            'jstree'             :       'libs/jsTree/js/jstree.min',//
            'jplayer'            :       'libs/jplayer/jquery.jplayer', //音频播放
            'jquery.rebox'       :       'libs/jquery/jquery-rebox', // 灯箱组件
            'jsTree'             :       'libs/jsTree/js/jstree.min', // 灯箱组件
            'template'           :       'libs/template/template', // 模板引擎
            //--------------封装方法----------------------
            'ajaxurl'            :       'base/ajaxurl',// 全局 ajax url
            'layers'             :       'base/layers',// 弹出层
            'tools'              :       'base/tools',// 工具类
            'page'               :       'base/page',// 分页类
            'formate'            :       'base/formate',// 时间格式化类
            'common'             :       'base/common', // 共用js
            'player'             :       'base/player', //音频播放
            'lightbox'           :       'base/lightbox', //灯箱
            'upload'             :       'base/upload', //上传文件类
            'Base64'             :       'base/base64',//base64加密与解密
        },
		waitSeconds: 0,
        shim: {
            'layui': {
                init: function(){
                    return this.layui.config({dir: window.ADMINJS + '/libs/layui/'});
                }
            }
        },
        urlArgs:  'v=' + window.VERSION
         //urlArgs: new Date().getTime() // 开发时启用
    });
})();

window.jQuery && define('jquery', [], function () {
    return window.jQuery;
});

/**
 * Created by Administrator on 2017-10-10.
 * 标的管理
 */
require(['common', 'layui', 'ajaxurl', 'tools', 'layers'], function (common, layui, ajaxurl, tool, layers) {

    var main = {
        initSpace: function() {
            layui.use('layedit', function(){
                var layedit = layui.layedit;
                layedit.set({ // 插入图片
                    uploadImage: {
                        url: ajaxurl.upload.ftp_upload, // 接口url
                        type: 'post' // 默认post
                    }
                });
                layedit.build('speech', { // 建立编辑器

                });
            });
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {

        },
        methods: {

        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.initSpace();
    };
    _init();
});

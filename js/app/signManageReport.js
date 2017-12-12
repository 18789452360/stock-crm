/**
 * Created by Administrator on 2017-10-10.
 * 标的管理
 */
require(['common', 'layui', 'ajaxurl', 'tools', 'layers', 'upload'], function (common, layui, ajaxurl, tool, layers, upload) {

    var main = {
        /**
         * [uploadImg description] 上传图片
         * @return {[type]} [description]
         */
        uploadFile: function() {
            layui.use(['upload', 'form'], function(){
                var upload = layui.upload;
                    form = layui.form;

                //创建一个上传组件
                upload.render({
                    elem: '#test',
                    before: function (obj) {
                        obj.preview(function (index, file, result) { // 依次得到文件的索引,文件对象,文件的base64编码
                            // 设置图片
                            $(".avatar").prop("src", result);
                            // 设置
                            $(".file-span").text(file.name);
                            // 点击删除的时间
                            $(".icon-delete").click(function() {

                            })
                        });
                    },
                    done: function (res) {
                        //如果上传失败
                        if (res.code == 1) {
                            console.log(1)
                        }else{
                            layers.toast(res.message);
                        }
                        //上传成功
                    },
                    error: function (index, uploadInst) {

                    }
                });
                form.on('submit(reportForm)', function(data) {
                    console.log(data.field)
                })
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
        common.getTabLink();
        main.uploadFile();
    };
    _init();
});

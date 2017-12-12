require(['layui', 'common'], function (layui, common) {

    var main = {
        /**
         * 渲染 Tab 标签卡
         */
        renderTabs: function () {
            vm.tabs = common.getTabArr();
        },
        /**
         * 创建 Form 表单
         */
        createForm: function () {
            layui.use(['form', 'upload'], function (form, upload) {
                var upload = layui.upload,
                    form = layui.form;
                var uploadInst = upload.render({
                    elem: '#test1'
                    , url: '/upload/'
                    , before: function (obj) {
                        //预读本地文件示例，不支持ie8
                        obj.preview(function (index, file, result) {
                            $('#demo1').attr('src', result); //图片链接（base64）
                        });
                    }
                    , done: function (res) {
                        //如果上传失败
                        if (res.code > 0) {
                            return layer.msg('上传失败');
                        }
                        //上传成功
                    }
                    , error: function () {
                        //演示失败状态，并实现重传
                        var demoText = $('#demoText');
                        demoText.html('<span style="color: #FF5722;">上传失败</span> <a class="layui-btn layui-btn-mini demo-reload">重试</a>');
                        demoText.find('.demo-reload').on('click', function () {
                            uploadInst.upload();
                        });
                    }
                });
            })
        }
    };


    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            tabs: [],// 选项卡
            department: '',//部门
            place: '',//职位
            rank: '',//职级
        },
        methods: {
            // 切换标签卡
            switchTabs: function (e) {
                var url = $(e.target).attr('href');
                common.setActive(url);
            },
            // 删除标签卡
            closeCurTab: function (index) {
                common.delCurTab(index);
                this.tabs = common.getTabArr();
            },
            // 左移标签卡
            moveLeft: function () {
                var url = common.moveLeftTab();
                url && (window.location.href = window.location.origin + url);
            },
            // 右移标签卡
            moveRight: function () {
                var url = common.moveRightTab();
                url && (window.location.href = window.location.origin + url);
            },
            // 关闭所有标签卡
            delAllTab: function () {
                common.delAllTab();
                this.tabs = common.getTabArr();
            },
            // 关闭其它标签卡
            closeOtherTab: function () {
                common.delOtherTab();
                this.tabs = common.getTabArr();
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        common.getTabLink();
        main.renderTabs();
        main.createForm();
    };
    _init();
});

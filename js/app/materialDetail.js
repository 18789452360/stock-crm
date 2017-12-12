require(['common', 'layui', 'text!/assets/popup/opr-tip.html', 'layers', 'tools', 'ajaxurl'], function (common, layui, oprTip, layers, tools, ajaxurl) {

    var main = {
        /**
         * 初始化 Layui 表单
         */
        createForm: function () {
            var that = this;
            layui.use(['form', 'layedit'], function () {
                var form = layui.form;
                var layedit = layui.layedit;

                // 自定义验证规则
                form.verify({
                    search: function (value) {
                        if ($.trim(value) == '') {
                            return '输入内容不能为空！';
                        }
                    }
                });

                // 添加客户备注
                form.on('submit(formAddRemark)', function (data) {
                    if ($.trim(data.field.mark_name) != '') {
                        that.addRemark();
                    }
                    return false;
                });
                form.render();

                // 富文本编辑器
                layedit.build('inputContent'); //建立编辑器
            });
        },
        /**
         * 获取url参数
         */
        getUrlData: function () {
            var urls = tools.getUrlArgs();
            if (urls.has) {
                if (urls.data.usertell != undefined) {
                    vm.addObject.mobileArr[0].mobile = urls.data.usertell;
                }
            }
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {},
        methods: {
            uploadFile: function () {
                // 模拟 file input 触发
                $('#up').trigger('click');
            }
        },
        watch: {}
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.createForm();
        common.getTabLink();
    };
    _init();
});

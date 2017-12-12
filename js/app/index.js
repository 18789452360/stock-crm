require(['common', 'tools', 'ajaxurl', 'layers', 'text!/assets/popup/change-password.html'], function (common, tool, ajaxurl, layers, cPassword) {

    var main = {
        /**
         * [select description] 点击空白地方 关闭下拉
         * @return {[type]} [description]
         */
        select: function () {
            $('.nav').hide();// 隐藏面包屑导航
            var $optMenu = $('.examine-filter');
            $(document).click(function (e) {
                e.stopPropagation();
                if (!$optMenu.is(e.target) && $optMenu.has(e.target).length === 0) {
                    if (vm.menubar) {
                        vm.menubar = false;
                    }
                }
            })
        },
        /**
         * [admin description] 获取用户信息
         * @return {[type]} [description]
         */
        admin: function () {
            var userinfo = common.getUserInfo();
            if (userinfo) {
                vm.userinfo = userinfo;
            }
        },
        /**
         * [admin description] 修改密码
         * @return {[type]} [description]
         */
        change: function (index) {
            layui.use(['form', 'layer', 'laydate'], function () {
                var form = layui.form;
                //验证表单
                form.verify({
                    oldPwd: function (value, item) {
                        if (new RegExp("/^[\w]{6,30}$/").test(value)) {
                            return "密码必须6到30位，只能是数字字母下划线";
                        }
                    },
                    newPwd: [
                        /^[\w]{6,30}$/, '密码必须6到30位，只能是数字字母下划线'
                    ],
                    confirmPwd: function (value, item) {
                        if ($("#newPwd").val() != value) {
                            return "两次输入密码不一致，请重新输入！";
                        }
                    }
                });
                //监听提交
                form.on('submit(password)', function (data, index) {
                    var $target = $(data.elem);
                    if (!$.isEmptyObject(data.field)) {
                        main.getoldPwd(data.field);
                    }
                    return false;
                });
            })
        },
        /**
         * 修改密码询问框
         */
        cPassword: function () {
            layers.open({
                btn: null,
                title: '修改密码',
                content: cPassword,
                area: ['402px', 'auto'],
                success: function (layero, index) {
                    var $layero = $(layero);
                    // 取消
                    $layero.find('.cancel').click(function () {
                        layers.closed(index);
                    });
                    // 保存
                    main.change(index); // 初始化 layui form 表单
                }
            });
        },
        /**
         * [clearTab description] 返回首页  应该清除所有的tab选项
         * @return {[type]} [description]
         */
        clearTab: function () {
            if (tool.hasStorage('tabIndex')) {
                tool.removeStorage('tabIndex');
            }
        },
         /**
         * [newsNum description]验证原始密码
         * @return {[type]} [description]
         */
        getoldPwd: function (data) {
            tool.ajax({
                url: ajaxurl.user.verifyPwd,
                type: 'post',
                data: {
                    id: vm.userinfo.id,
                    oldpassword: data.password,
                },
                success: function (result) {
                    if (result.code == 1) {
                        main.getnewPwd(data)
                    } else {
                        layers.toast(result.message, {icon: 2, anim: 6});
                    }
                }
            });
        },
         /**
         * [newsNum description]提交新密码
         * @return {[type]} [description]
         */
        getnewPwd: function (data) {
            tool.ajax({
                url: ajaxurl.user.editPassword,
                data: {
                    id: vm.userinfo.id,
                    newpassword: data.newpassword
                },
                type: 'post',
                success: function (result) {
                    if (result.code == 1) {
                        layers.toast("修改成功！", {icon: 1, anim: 1});
                        setTimeout(function () {
                            common.logout();
                        }, 1000);
                    } else {
                        layers.toast(result.message, {icon: 2, anim: 6});
                    }
                },
            });
        },
        /**
         * [newsNum description]消息条数
         * @return {[type]} [description]
         */
        newsView: function () {
            tool.ajax({
                url: ajaxurl.sms.List,
                type: 'get',
                data: {
                    employee_id: vm.userinfo.id,
                    pagesize: 5
                },
                success: function (result) {
                    if (result.code == 1) {
                        vm.newsView = result.data;
                    } else {
                        layers.toast(result.message, {icon: 2, anim: 6});
                    }
                }
            });
        },
        /**
         * [newsNum description]未读条数和今日未读条数
         * @return {[type]} [description]
         */
        allView: function () {
            tool.ajax({
                url: ajaxurl.sms.allview,
                type: 'get',
                data: {
                    employee_id: vm.userinfo.id
                },
                success: function (result) {
                    if (result.code == 1) {
                        vm.allview = result.data;
                    } else {
                        layers.toast(result.message, {icon: 2, anim: 6});
                    }
                }
            });
        },
        /**
         * [newsNum description]档案客户
         * @return {[type]} [description]
         */
        CustomerTote: function () {
            tool.ajax({
                url: ajaxurl.customer.CustomerTote,
                type: 'get',
                success: function (result) {
                    if (result.code == 1) {
                        vm.CustomerTote = result.data;
                    } else {
                        layers.toast(result.message, {icon: 2, anim: 6});
                    }
                }
            });
        }
    };


    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            userinfo: '',
            menubar: false,
            newsView: [],
            allview: {
                all: 0,
                today: 0
            },
            CustomerTote: {
                all_total: 0,
                today_total: 0
            }
        },
        methods: {
            logout: function () { //退出登录
                common.logout();
                this.menubar = false;
            },
            menu: function () { //菜单下拉
                this.menubar = !this.menubar;
            },
            cPassword: function () {//修改密码询问框
                main.cPassword();
                this.menubar = false;
            }
        }
    });


    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.select();
        main.admin();
        main.clearTab();
        main.newsView();
        main.allView();
        main.CustomerTote();
        common.getTabLink();
    };
    _init();
});

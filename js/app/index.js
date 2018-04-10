require(['common', 'tools', 'ajaxurl', 'layers', 'text!/assets/popup/change-password.html'], function (common, tool, ajaxurl, layers, cPassword) {

    var main = {
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
        },
        /**
         * 初始化点击事件
         */
        initEvent:function () {
            $('.page-tabs-content').on('click','.first-item',function(){//点击去首页
                common.isTabShow(true);
            });
            $('.page-tabs-content').on('click','.J_menuTab',function (e) {//单击切换
                common.activeTab(this,e);
            });
            $('.page-tabs-content').on('dblclick','.J_menuTab',function () {//双击该tab刷新该tab
                common.refreshTab(this);
            });
            $('.page-tabs-content').on('click', '.J_menuTab i',function(){//点击删除
                common.delCurTab(this);
            });
            $('.operate-list').on('click','.J_tabCloseAll',function(){//点击删除全部tab
                common.closeAllTab();
            });
            $('.operate-list').on('click','.refresh-tab',function(){//点击右上角刷新按钮，刷新当前tab
                if($('.page-tabs-content .first-item').hasClass('active')){
                    main.newsView();
                    main.allView();
                    main.CustomerTote();
                }else{
                    common.refreshTab($('.page-tabs-content .J_menuTab.active'));
                }
            });
            $('.page-tabs-content .first-item').on('dblclick',function(){
                $('.operate-list .refresh-tab').click();
            })
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
            },
        }
    });


    /**
     * 初始化
     * @private
     */
    var _init = function () {
        //初始化全局函数--start
        common.sideBarPhone();
        common.globaladmin();
        common.getCallRecordDelay();
        common.newPolling();//消息轮询
        //初始化全局函数---end

        main.admin();
        main.newsView();
        main.allView();
        main.CustomerTote();
        common.getTabLink();
        main.initEvent();
    };
    _init();
});

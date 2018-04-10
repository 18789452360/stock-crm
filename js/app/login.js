require(['layui', 'tools', 'ajaxurl', 'layers'], function (layui, tool, ajaxurl, layers) {
    var main = {
        init: function () {
            layui.use(['form'], function () {
                var form = layui.form;
                //验证表单
                form.verify({
                    username: function (value, item) { //value：表单的值、item：表单的DOM对象
                        if (!(/^1[3|4|5|7|8|][0-9]{9}$/.test($.trim(value)))) {
                            return '请输入正确的手机号登录';
                        }
                    },
                    pass: [/^[\w]{6,30}$/, '密码必须6到30位，只能是数字字母下划线']
                });
                //监听提交
                form.on('submit(formLogin)', function (data) {
                    var $target = $(data.elem);
                    if (!$.isEmptyObject(data.field)) {
                        tool.ajax({
                            url: ajaxurl.login.login,
                            data: {
                                loginusername: $.trim(data.field.loginusername),
                                loginpassword: data.field.loginpassword
                            },
                            type: 'post',
                            beforeSend: function () {
                                $target.prop('disabled', true);
                            },
                            success: function (result) {
                                if (result.code == 1) {
                                    main.initIVR();
                                    window.location.href = '/admin/index/index';
                                } else {
                                    layers.toast(result.message, {icon: 2, anim: 6});
                                }
                            },
                            complete: function () {
                                setTimeout(function () {
                                    $target.prop('disabled', false);
                                }, 800);
                            },
                            error: function () {
                                layers.toast('网络异常！');
                            }
                        });
                    }
                    return false;
                });
            })
        },
        /**
         * [initIVR description] 初始化IVR
         * @return {[type]} [description]
         */
        initIVR:function(){
            tool.ajax({
                url:ajaxurl.ivr.initIvr,
                type:'post',
                success:function(data){

                },
                error:function(){
                    //layers.toast('网络异常！');
                }
            })
        },
        /**
         * 判断当前窗口是否是最顶层
         */
        isIframe: function () {
            var flag = '';
            window.self != window.top ? flag = true : flag = false;
            return flag;
        },
        /**
         * [goTopLoGin description]当前页面如果嵌套在iframe内，则让最顶层的地址跳转到登陆页面
         * @return {[type]} [description]
         */
        goTopLoGin:function(){
            var isTop = main.isIframe();
            if(isTop){
                window.top.location.href = '/admin/index/login';
            }
        },
    };

    //初始化
    var _init = function () {
        main.init();
        main.goTopLoGin();
    };
    _init();
});
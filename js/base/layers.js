/**
 * 配置 layer 弹出层公共方法
 */
define(['layui'], function (layui) {
    //var BaseUrl = (window.location.origin || (window.location.protocol + '//' + window.location.host)) + '/js/';
    layui.use('layer', function () {
        var layer = layui.layer;
        //配置
        layer.config({
            move: false
        })
    });
    return {
        /**
         * [open description] 公用弹出组件
         * @param  {[type]}   args     [description] [{type:1,title:false,closeBtn:0,shadeClose: false,area: ['700px','350px'],content: Object}]
         * @return {[type]}            [description]
         */
        open: function (args) {
            if (!args.content) {
                throw new Error('弹出组件缺少参数');
            }
            var _THIS_ = new Object(), that = this;
            $.extend(_THIS_, {
                type: 1,
                title: '提示',
                closeBtn: 1,
                shadeClose: false,
                area: ['700px', '350px'],
                content: null,
                btn: ['取消', '确定'],
                resize: false,
                skin: 'layer-gxscrm-open', //自定义样式 设置弹出层的UI样式
                success: function (layero, index) {
                },
                yes: function (index, layero) { // btn 0 取消
                    that.closed(index);
                },
                btn2: function (index, layero) { // btn 1  确定回调
                    return false;
                }
            }, args);
            //加载layui组件
            layui.use('layer', function () {
                var layer = layui.layer;
                //依赖layer资源加载完，不然页面一打开就要执行弹层时，当宽度小于360px的会默认设置360px的宽度
                layer.ready(function () {
                    layer.open(_THIS_);
                });
            });
        },
        /**
         * [confirm description] confirm选择框 深度定制  适用于confirm提示框  只有文字内容的
         * @param  {[type]}   args     [description]
         * @return {[type]}            [description]
         * args.content 必须为  <div class="confirm-tips"><p>xxx</p><p>xxxx</p></div>
         */
        confirm: function (args) {
            if (!args.content) {
                throw new Error('弹出组件缺少参数');
            }
            var _THIS_ = new Object(), that = this;
            $.extend(_THIS_, {
                type: 1,
                title: '提示',
                closeBtn: 1,
                shadeClose: false,
                area: ['402px', '254px'],
                content: null,
                btn: ['取消', '确定'],
                resize: false,
                skin: 'layer-gxscrm-confirm', //自定义样式 设置弹出层的UI样式
                yes: function (index, layero) { // btn 0 取消
                    that.closed(index);
                },
                btn2: function (index, layero) { // btn 1  确定回调
                    return false;
                }
            }, args);
            //加载layui组件
            layui.use('layer', function () {
                var layer = layui.layer;
                //依赖layer资源加载完，不然页面一打开就要执行弹层时，当宽度小于360px的会默认设置360px的宽度
                layer.ready(function () {
                    layer.open(_THIS_);
                });
            });
        },
        /**
         * [closed description] 关闭指定层
         * @param  {[type]} index [description]
         * @return {[type]}       [description]
         */
        closed: function (index) {
            if (index != undefined && index != null) {
                layui.use('layer', function () {
                    var layer = layui.layer;
                    //依赖layer资源加载完，不然页面一打开就要执行弹层时，当宽度小于360px的会默认设置360px的宽度
                    layer.ready(function () {
                        layer.close(index);
                    })
                })
            }
        },
        /**
         * [closedAll description] 关闭全部的弹出层
         * @return {[type]} [description]
         */
        closedAll: function () {
            layui.use('layer', function () {
                var layer = layui.layer;
                //依赖layer资源加载完，不然页面一打开就要执行弹层时，当宽度小于360px的会默认设置360px的宽度
                layer.ready(function () {
                    layer.closeAll();
                })
            });
        },
        /**
         * [toast description] toast提示
         * @param  {[type]} msg  [description]
         * @param  {[type]} options [description]
         * @return {[type]}      [description]
         */
        toast: function (msg, options) {
            if (!msg) {
                throw new Error('toast缺少msg对象！')
            }
            var defaults = $.extend(true, {time: 2000}, options);
            layui.use('layer', function () {
                var layer = layui.layer;
                //依赖layer资源加载完，不然页面一打开就要执行弹层时，当宽度小于360px的会默认设置360px的宽度
                layer.ready(function () {
                    layer.msg(msg, defaults);
                });
            })
        },
        /**
         * [load description] loading
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        load: function (callback) {
            layui.use('layer', function () {
                var layer = layui.layer;
                //依赖layer资源加载完，不然页面一打开就要执行弹层时，当宽度小于360px的会默认设置360px的宽度
                layer.ready(function () {
                    var indexs = layer.load(0, {time: 10 * 1000}); //最长等待10S
                    typeof callback === 'function' && callback.call(this, indexs);
                })
            });
        }
    }
});
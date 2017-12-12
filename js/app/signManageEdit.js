/**
 * Created by Administrator on 2017-10-10.
 * 标的管理
 */
require(['common', 'layui', 'ajaxurl', 'tools', 'layers'], function (common, layui, ajaxurl, tool, layers) {

    var main = {
        /**
         * 初始话表单
         */
        initForm: function() {
            var _this = this;
            layui.use('form', function(){
                var form = layui.form;
                //自定义验证规则
                form.verify({
                    stockWin: function(value) {
                        if(isNaN(value)) {
                            return '止盈价只能为数字'
                        }
                    },
                    stockLose: function(value) {
                        if(isNaN(value)) {
                            return '止损价只能为数字'
                        }
                    }
                });
                form.on('submit(stockForm)', function(data){
                    // 获取路由参数id的值
                    var urls = tool.getUrlArgs(), product_id = '';
                    if(urls.has){
                        product_id = urls.data.product_id;
                    }
                    data.field.product_id = product_id;
                    if(data) {
                        console.log(data.field);
                    }
                    return false;
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
            userInfo: '', // 参数
            verifyData: {
                verifyWin: {checkShow: false, text: ''},  // 止盈价
                verifyLose: {checkShow: false, text: ''}  // 止损价
            }
        },
        methods: {
            //止盈价
            stockWin: function(event) {
                var stockWinVal = $.trim(event.target.value);
                if(isNaN(stockWinVal)) { // 如果是数字
                    this.verifyData.verifyWin = {
                        checkShow: true,
                        text: '止盈价只能为数字'
                    }
                } else {
                    this.verifyData.verifyWin = {
                        checkShow: false
                    }
                }
            },
            //止损价
            stockLose: function(event) {
                var stockLoseVal = $.trim(event.target.value);
                if(isNaN(stockLoseVal)) { // 如果是数字
                    this.verifyData.verifyLose = {
                        checkShow: true,
                        text: '止损价只能为数字'
                    }
                } else {
                    this.verifyData.verifyLose = {
                        checkShow: false
                    }
                }
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        common.getTabLink();
        main.initForm();
    };
    _init();
});

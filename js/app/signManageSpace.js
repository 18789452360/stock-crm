/**
 * Created by Administrator on 2017-10-10.
 * 标的管理
 */
require(['common', 'layui', 'ajaxurl', 'tools', 'layers'], function (common, layui, ajaxurl, tool, layers) {

    var main = {
        /**
         * 声明正则
         */
        reg: {
            regRate: /^(\d(\.\d)?|10)$/ // 验证调仓比例
        },
        /**
         * 初始话表单
         */
        initForm: function() {
            var _this = this;
            layui.use('form', function(){
                var form = layui.form;
                //自定义验证规则
                form.verify({
                    stockRate: function(value){ // 验证调仓比例
                        if(!new RegExp(_this.reg.regRate).test(value)){
                            return "调仓比例不正确";
                        }
                    },
                    stockBook: function(value) { // 验证建仓
                        if(isNaN(value)) {
                            return '调仓价格只能为数字'
                        }
                    }
                });
                form.on('submit(formSpace)', function(data){
                    data.field.product_stock_id = 1;
                    data.field.product_id = 2;
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
            verifyData: {
                verifyRate: {checkShow: false, text: ''}, // 调仓比例
                verifyBook: {checkShow: false, text: ''}  // 调仓价格
            }
        },
        methods: {
            // 调仓比例
            stockRate: function(event) {
                var stockRateVal = $.trim(event.target.value);
                if(!isNaN(stockRateVal)) { // 如果是数字
                    if(!new RegExp(main.reg.regRate).test(stockRateVal)) {
                        this.verifyData.verifyRate = {
                            checkShow: true,
                            text: '总仓位不得小于0或大于10，请计算后重新输入'
                        }
                    } else {
                        this.verifyData.verifyRate = {
                            checkShow: false
                        }
                    }
                } else {
                    this.verifyData.verifyRate = {
                        checkShow: true,
                        text: '调仓比例只能为数字'
                    }
                }
            },
            // 调仓价格
            stockBook: function(event) {
                var stockBookVal = $.trim(event.target.value);
                if(isNaN(stockBookVal)) { // 如果是数字
                    this.verifyData.verifyBook = {
                        checkShow: true,
                        text: '调仓价格只能为数字'
                    }
                } else {
                    this.verifyData.verifyBook = {
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
        main.initForm();
    };
    _init();
});

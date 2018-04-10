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
                        if(value < 0 || value - 0 > vm.tableDataPositions){
                            return "总仓位不得小于0或大于10，请计算后重新输入";
                        }
                        if(isNaN(value)) {
                            return '调仓比例只能为数字'
                        }
                    },
                    stockBook: function(value) { // 验证建仓
                        if(isNaN(value)) {
                            return '调仓价格只能为数字'
                        }
                    }
                });
                // 监听radio
                form.on('radio(filter)', function(data){
                    if(data.value == 1) {
                        vm.tableDataPositions = 10 - vm.tableDataPosition;
                        vm.radioChang = false;
                    } else {
                        vm.tableDataPositions = vm.tableDataPosition;
                        vm.radioChang = false;
                    }
                });
                form.on('submit(formSpace)', function(data){
                    var urls = tool.getUrlArgs(), productId = '', productStockId= '';
                    if(urls.has){
                        productId = urls.data.product_id;
                        productStockId = urls.data.product_stock_id;
                    }
                    data.field.product_id = productId;
                    data.field.product_stock_id = productStockId;
                    if(data.field.buy_price > data.field.buy_price_end - 0) {
                        layers.toast("调仓起始价不能大于调仓结束价");
                        return false;
                    }
                    if(data) {
                        main.productSpaceAdd(data.field);
                    }
                    return false;
                });
            });
        },
        /**
         * 获取股票的详细信息
         */
        getStock: function() {
            var urls = tool.getUrlArgs(), stock_codes='';
            if(urls.has){
                stock_codes = urls.data.stock_codes;
            }
            tool.ajax({
                url: ajaxurl.productStock.getOneStock,
                type: 'get',
                data: {
                    stock_code: stock_codes
                },
                success: function(result){
                    if(result.code == 1){
                        vm.getDetailStockData = result.data;
                        vm.getDetailStockDataXj = result.data.xj;
                    }else{
                        layers.toast(result.message);
                    }
                },
                error: function(){
                    layers.toast("网络异常!")
                }
            });
        },
        /**
         * 获取标的全部信息
         */
        getAllList: function(callback) {
            var urls = tool.getUrlArgs();
            if(urls.has){
                vm.productStrockId = urls.data.product_stock_id;
            }
            tool.ajax({
                url: ajaxurl.productStock.detail,
                type: 'post',
                data: {
                    product_stock_id: vm.productStrockId,
                    info_type: 666
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableDataBase = result.data.product_stock_base;
                        vm.tableDataPosition = result.data.product_stock_base.position;
                        vm.stockCodes = result.data.product_stock_base.stock_codes;
                        typeof callback === "function" && callback.call(this);
                    }else{
                        layers.toast(result.message);
                    }
                },
                error: function(){
                    layers.toast("网络异常!")
                }
            });
        },
        /**
         * 新增调仓
         * @param datas
         */
        productSpaceAdd: function(datas) {
            if(vm.isTrue) {
                vm.isTrue = false;
                tool.ajax({
                    url: ajaxurl.productTransfer.add,
                    type: 'post',
                    data: datas,
                    success: function(result){
                        if(result.code == 1){
                            layers.toast("新增成功");
                            setTimeout(function() {
                                common.closeTab(true);
                            }, 1000)
                        }else{
                            layers.toast(result.message);
                        }
                    },
                    error: function(){
                        layers.toast("网络异常!")
                    }
                });
            }
        }
    };
    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            tableDataBase: [],
            productStrockId: '',
            getDetailStockData: '', // 股票的相信信息
            getDetailStockDataXj: '',
            tableDataPosition: '', // 股票的当前仓位
            tableDataPositions: '', // 变更后的股票的当前仓位
            stockCodes: '', // 股票识别码
            radioChang: true,
            verifyData: {
                verifyRate: {checkShow: false, text: ''}, // 调仓比例
                verifyBook: {checkShow: false, text: ''}  // 调仓价格
            },
            isTrue: true
        },
        methods: {
            // 调仓比例
            stockRate: function(event) {
                var stockRateVal = $.trim(event.target.value);
                if(this.radioChang) {
                    this.tableDataPositions = 10 - this.tableDataPosition;
                }
                if(!isNaN(stockRateVal)) { // 如果是数字
                    if(stockRateVal - 0 > this.tableDataPositions || stockRateVal < 0) {
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
                var stockBookVal = $.trim(event.target.value),
                    stockBookValEnd = $.trim($(event.target).siblings("input").val());
                if(isNaN(stockBookVal) || isNaN(stockBookValEnd)) { // 如果是数字
                    this.verifyData.verifyBook = {
                        checkShow: true,
                        text: '调仓价格只能为数字'
                    }
                } else {
                    this.verifyData.verifyBook = {
                        checkShow: false
                    }
                }
            },
            // 取消
            cancel: function() {
                common.closeTab();
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.initForm();
        main.getAllList();
        main.getStock();
    };
    _init();
});

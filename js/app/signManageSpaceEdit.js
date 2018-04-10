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
                            return "总仓位不得小于0或大于10，请计算后重新输入";
                        }
                    },
                    stockBook: function(value) { // 验证建仓
                        if(isNaN(value)) {
                            return '调仓价格只能为数字'
                        }
                    }
                });
                form.on('submit(formSpace)', function(data){
                    var urls = tool.getUrlArgs(), productId = '', productStockId = '', transferId = '', stockCodes = '';
                    if(urls.has){
                        productId = urls.data.product_id;
                        productStockId = urls.data.product_stock_id;
                        transferId = urls.data.id;
                        stockCodes = urls.data.stock_codes;
                    }
                    data.field.product_id = productId;
                    data.field.product_stock_id = productStockId;
                    data.field.transfer_id = transferId;
                    data.field.stock_codes = stockCodes;
                    if(data) {
                        main.productSpaceEdit(data.field);
                    }
                    return false;
                });
            });
        },
        /**
         * 获取调仓编辑信息
         */
        getAllList: function() {
            var urls = tool.getUrlArgs();
            if(urls.has){
                vm.productStrockId = urls.data.product_stock_id;
                vm.transferId = urls.data.id;
            }
            tool.ajax({
                url: ajaxurl.productTransfer.editDataFind,
                type: 'post',
                data: {
                    product_stock_id: vm.productStrockId,
                    transfer_id: vm.transferId
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableEditData = result.data;
                        tool.setCookie('setVal', vm.tableEditData);
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
         * 获取调仓编辑的头部信息
         */
        getEditList: function(callback) {
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
         * 编辑调仓保存
         */
        productSpaceEdit: function(datas) {
            if(vm.isTrue) {
                vm.isTrue = false;
                tool.ajax({
                    url: ajaxurl.productTransfer.editPost,
                    type: 'post',
                    data: datas,
                    success: function(result){
                        if(result.code == 1){
                            layers.toast("编辑成功");
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
        },
        /**
         * 取消操作判断用户是否更改表单数据
         */
        cancel: function() {
            // 获取cookie储存的val值
            var setVal = tool.getCookie('setVal');
            // 储存当前的值到setValNew
            tool.setCookie('setValNew', vm.tableEditData);
            var setValNew = tool.getCookie('setValNew');
            // 判断用户操作前后数据是否发生了变化
            var queryVal = main.diff(setVal, setValNew);
            if(!queryVal) {
                // 提示用户数据已发生改变
                layers.confirm({
                    title: '提示',
                    area: ['450px', '250px'],
                    content: '<div class="confirm-tips"><p>取消操作将不保留已变更信息，确认取消？</p></div>',
                    btn2: function (index, layero) {
                        common.closeTab();
                    }
                });
            } else {
                common.closeTab();
            }
        },
        /**
         * 判断对象的值是否相等
         */
        diff: function(obj1,obj2){
            var o1 = obj1 instanceof Object;
            var o2 = obj2 instanceof Object;
            if(!o1 || !o2){ //判断不是对象
                return obj1 === obj2;
            }
            if(Object.keys(obj1).length !== Object.keys(obj2).length){
                return false;
                // Object.keys() 返回一个由对象的自身可枚举属性(key值)组成的数组,例如：数组返回下表：let arr = ["a", "b", "c"];
                // console.log(Object.keys(arr))->0,1,2;
            }
            for(var attr in obj1){
                var t1 = obj1[attr] instanceof Object;
                var t2 = obj2[attr] instanceof Object;
                if(t1 && t2){
                    return diff(obj1[attr],obj2[attr]);
                }else if(obj1[attr] !== obj2[attr]){
                    return false;
                }
            }
            return true;
        }
    };
    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            tableDataBase: [],
            getDetailStockData: [],
            tableEditData: '', // 编辑默认信息
            productStrockId: '',
            transferId: '', // 调仓id
            stockCodes: '', // 股票识别码
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
            },
            // 取消
            cancel: function() {
                main.cancel();
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
        main.getEditList();
    };
    _init();
});

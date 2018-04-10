/**
 * Created by Administrator on 2017-10-10.
 * 新增标的
 */
require(['common', 'layui', 'ajaxurl', 'tools', 'layers', 'jquery.metisMenu'], function (common, layui, ajaxurl, tool, layers) {

    var main = {
        /**
         * 声明正则
         */
        reg: {
            regRate: /^([1-9]|10)$/ // 验证调仓比例 0 < regRate <= 10
        },
        form: '',
        /**
         * 初始化全局树形菜单
         */
        sideMenu: function (callback) {
            Vue.nextTick(function () {
                $('#org-framework').metisMenu();
                typeof callback === 'function' && callback.call(this);
            })
        },
        /**
         * 初始话表单
         */
        initForm: function() {
            var _this = this;
            layui.use('form', function(){
                var form = layui.form;
                // 自定义验证规则
                form.verify({
                    stockBook: function(value) { // 验证建仓
                        if(isNaN(value)) {
                            return '建仓价只能为数字'
                        }
                    },
                    stockRate: function(value){ // 验证调仓比例
                        if(isNaN(value)) {
                            return '建仓比例只能为数字'
                        }
                        if(!new RegExp(_this.reg.regRate).test(value)){
                            return '建仓比例不正确';
                        }
                    },
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
                // 监听select选择框的变化
                form.on('select(test)', function(data){
                    var sayCode = data.value.split("-")[1];
                    if(sayCode == undefined) {
                        vm.getDetailStockData = [];
                        vm.stockBuyPrice = '';
                        return false;
                    }
                    // 获取当前股票的详细信息
                    tool.ajax({
                        url: ajaxurl.productStock.getOneStock,
                        type: 'post',
                        data: {
                            stock_code: sayCode
                        },
                        success: function(result){
                            if(result.code == 1){
                                vm.getDetailStockData = result.data;
                                vm.stockBuyPrice = result.data.xj;
                                vm.isShow = false;
                            }else{
                                vm.isShow = true;
                                layers.toast(result.message);
                            }
                        },
                        error: function(){
                            layers.toast("网络异常!")
                        }
                    });
                });
                form.on('submit(stockForm)', function(data){
                    // 获取路由参数id的值
                    var urls = tool.getUrlArgs(), product_id = '';
                    if(urls.has){
                        product_id = urls.data.product_id;
                    }
                    data.field.product_id = product_id;
                    var allCode = data.field.stock_code;
                    data.field.stock_code = allCode.split("-")[0];
                    data.field.stock_codes = allCode.split("-")[1];
                    if(data.field.stock_buy_price > data.field.stock_buy_price_end - 0) {
                        layers.toast("建仓起始价不能大于建仓结束价");
                        return false;
                    }
                    if(data.field.stock_win_price > data.field.stock_win_price_end - 0) {
                        layers.toast("止盈起始价不能大于止盈结束价");
                        return false;
                    }
                    if(data.field.stock_lose_price > data.field.stock_lose_price_end - 0) {
                        layers.toast("止损起始价不能大于止损结束价");
                        return false;
                    }
                    if(data) {
                        if(vm.readerOrgUsr.id == '') {
                            layers.toast("标的负责人不能为空");
                            return false;
                        }
                        main.prockAdd(data.field);
                    }
                    return false;
                });
            });
        },
        /**
         * 获取产品信息头
         */
        getTotleProduct: function() {
            var urls = tool.getUrlArgs(), product_id = '';
            if(urls.has){
                product_id = urls.data.product_id;
            }
            tool.ajax({
                url: ajaxurl.product.getProductDetail,
                type: 'post',
                data: {
                    product_id: product_id
                },
                success: function(result){
                    if(result.code == 1){
                        vm.productTotleData = result.data;
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
         * 新增标的
         * @param datas
         */
        prockAdd: function(datas) {
            if(vm.isShow) {
                layers.toast("股票停牌中不能添加");
                return false;
            }
            if(vm.isTrue) {
                vm.isTrue = false;
                tool.ajax({
                    url: ajaxurl.productStock.add,
                    type: 'post',
                    data: datas,
                    success: function(result){
                        if(result.code == 1){
                            layers.toast("新增成功");
                            setTimeout(function() {
                                common.closeTab();
                            }, 1000)
                        }else{
                            layers.toast(result.message);
                        }
                    },
                    error: function(){
                        layers.toast("网络异常!");
                    }
                });
            }
        },
        /**
         * 获取股票信息
         */
        getStockData: function() {
            var loading = '';
            var data = tool.getStorage('stockData');
            if(!data) {
                var newArr = [];
                tool.ajax({
                    url: ajaxurl.productStock.getAllStock,
                    data:{},
                    beforeSend: function() {
                        layers.load(function(indexs) {
                            loading = indexs
                        })
                    },
                    success: function(result){
                        if(result.code == 1){
                            for (var i = 0, les = result.data.length; i < les; i++) {
                                var firstStr = result.data[i][5].substring(0, 1);
                                // 去除非股票的指数
                                firstStr !== '5' && firstStr !== '3' && newArr.push(result.data[i]);
                            }
                            tool.setStorage('stockData', newArr);
                            vm.getAllStockData = newArr;
                        }else{
                            layers.toast(result.message);
                        }
                    },
                    complete:function(){
                        setTimeout(function(){
                            layers.closed(loading);
                        },200)
                    }
                })
            } else {
                vm.getAllStockData = tool.getStorage('stockData');
            }
        },
        /**
         * [getBasic description] 获取基础信息
         * @return {[type]} [description]
         */
        getBasic: function(){
            var that = this;
            tool.ajax({
                url: ajaxurl.department.getdepartment,
                data:{},
                success: function(result){
                    if(result.code == 1){
                        vm.BasicDepartment = result.data;
                        that.sideMenu(function(){
                            that.filterOrgSearch();
                        });
                    }else{
                        layers.toast(result.message);
                    }
                }
            })
        },
        /**
         * 筛选--组织架构搜索
         */
        filterOrgSearch: function () {
            Vue.nextTick(function () {
                var $item = $('#org-framework').find('a[data-type="member"]'); //查找所有的 部门列表
                $item.each(function () {
                    var newItem = {id: $(this).data('id'), name: $(this).data('text')};
                    vm.OrgSearchArr.push(newItem);
                });
            });
            layui.use(['form'], function () {
                var form = layui.form;
                form.on('select(search-org)', function (data) {
                    vm.selectedOrgUsr = [];
                    if(data.value != '') {
                        var addItem = {id: data.value.split(',')[0] * 1, department_name: data.value.split(',')[1]};
                        vm.selectedOrgUsr.push(addItem);
                    }
                });
                setTimeout(function(){
                    form.render()
                },500);
            });
        },
        /**
         * 数组对象简单去重 对 id 去重, 名字可以有重复
         * @param arr
         * @return {Array}
         */
        unique: function (arr) {
            var result = {};
            var finalResult = [];
            for (var i = 0; i < arr.length; i++) {
                result[arr[i].id] = arr[i];
            }
            for (var item in result) {
                finalResult.push(result[item]);
            }
            return finalResult;
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            userInfo: '', // 参数
            getAllStockData: [], // 获取股票信息
            getDetailStockData: [], // 获取股票详情信息
            stockBuyPrice: '', // 建仓价
            verifyData: {
                verifyBook: {checkShow: false, text: ''}, // 建仓价
                verifyRate: {checkShow: false, text: ''}, // 调仓比例
                verifyWin: {checkShow: false, text: ''},  // 止盈价
                verifyLose: {checkShow: false, text: ''}  // 止损价
            },

            BasicDepartment: [], // 标的负责人
            selectedOrgUsr: [], // 暂时记录组织架构的选中
            readerOrgUsr: {id: '', department_name:''}, // 组织架构选中
            showpop: false, // 组织架构显示隐藏
            OrgSearchArr: [], // 缓存组织架构搜索结果
            productTotleData: [], // 产品头信息
            isTrue: true,
            isShow: false
        },
        methods: {
            // 建仓价
            stockBook: function(event) {
                var stockBookVal = $.trim(event.target.value),
                    stockBookValEnd = $.trim($(event.target).siblings("input").val());
                //if(!stockBookVal) {
                //    return false;
                //}
                //if(!isNaN(stockBookVal)) { // 如果是数字
                //    if(stockBookVal < vm.getDetailStockData.dt || stockBookVal > vm.getDetailStockData.zt) {
                //        this.verifyData.verifyBook = {
                //            checkShow: true,
                //            text: '建仓价介于跌停价与涨停价之间'
                //        }
                //    } else {
                //        this.verifyData.verifyBook = {
                //            checkShow: false
                //        }
                //    }
                //} else {
                //    this.verifyData.verifyBook = {
                //        checkShow: true,
                //        text: '建仓价只能为数字'
                //    }
                //}

                if(isNaN(stockBookVal) || isNaN(stockBookValEnd)) { // 如果是数字
                    this.verifyData.verifyBook = {
                        checkShow: true,
                        text: '建仓价只能为数字'
                    }
                } else {
                    this.verifyData.verifyBook = {
                        checkShow: false
                    }
                }
            },
            // 调仓比例
            stockRate: function(event) {
                var stockRateVal = $.trim(event.target.value);
                if(!stockRateVal) {
                    return false;
                }
                if(!isNaN(stockRateVal)) { // 如果是数字
                    if(!new RegExp(main.reg.regRate).test(stockRateVal)) {
                        this.verifyData.verifyRate = {
                            checkShow: true,
                            text: '总仓位不得小于等于0或大于10，请计算后重新输入'
                        }
                    } else {
                        this.verifyData.verifyRate = {
                            checkShow: false
                        }
                    }
                } else {
                    this.verifyData.verifyRate = {
                        checkShow: true,
                        text: '建仓比例只能为数字'
                    }
                }
            },
            // 止盈价
            stockWin: function(event) {
                var stockWinVal = $.trim(event.target.value),
                    stockWinValEnd = $.trim($(event.target).siblings("input").val());
                if(isNaN(stockWinVal) || isNaN(stockWinValEnd)) { // 如果不是数字
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
            // 止损价
            stockLose: function(event) {
                var stockLoseVal = $.trim(event.target.value),
                    stockLoseValEnd = $.trim($(event.target).siblings("input").val());
                if(isNaN(stockLoseVal) || isNaN(stockLoseValEnd)) { // 如果是数字
                    this.verifyData.verifyLose = {
                        checkShow: true,
                        text: '止损价只能为数字'
                    }
                } else {
                    this.verifyData.verifyLose = {
                        checkShow: false
                    }
                }
            },

            // 组织架构获取成员模糊搜索
            orgSelectItem: function(e, type){
                if(type != undefined){
                    if(type != 0 && !$(e.target).hasClass('has-arrow')){
                        var newItem = {id: $(e.target).data('id'), department_name: $(e.target).data('text')};
                        this.selectedOrgUsr = [];
                        this.selectedOrgUsr.push(newItem);
                    }
                }
            },
            // 组织架构添加成员
            orgSelectAdd: function(e, id, name){
                if(id != undefined && name != undefined){
                    var newItem = {id:id, department_name: name};
                    this.selectedOrgUsr = [];
                    this.selectedOrgUsr.push(newItem);
                }
            },
            // 组织架构确定渲染到输入框
            addConditonsOrg:function(e){
                if (this.selectedOrgUsr.length) {
                    this.readerOrgUsr = this.selectedOrgUsr[0];
                    this.showpop = false;
                } else {
                    layers.toast('请选择人员');
                }
            },
            // 组织架构删除选中成员
            delChoose: function(){
                this.selectedOrgUsr = [];
            },
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
        common.getTabLink();
        main.initForm();
        main.getBasic(); // 获取组织架构基础数据
        main.getTotleProduct();
        main.getStockData();
    };
    _init();
});

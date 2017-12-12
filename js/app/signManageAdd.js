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
            regRate: /^(\d(\.\d)?|10)$/ // 验证调仓比例
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
                        if(!isNaN(value)) { // 如果是数字
                            if(value < 11 || value > 13) {
                                return '建仓价不正确'
                            }
                        } else {
                            return '建仓价只能为数字'
                        }
                    },
                    stockRate: function(value){ // 验证调仓比例
                        if(!new RegExp(_this.reg.regRate).test(value)){
                            return '调仓比例不正确';
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
                form.on('submit(stockForm)', function(data){
                    // 获取路由参数id的值
                    var urls = tool.getUrlArgs(), product_id = '';
                    if(urls.has){
                        product_id = urls.data.product_id;
                    }
                    data.field.product_id = product_id;
                    if(data) {
                        main.prockAdd(data.field);
                    }
                    return false;
                });
            });
        },
        /**
         * 新增标的
         * @param datas
         */
        prockAdd: function(datas) {
            tool.ajax({
                url: ajaxurl.productStock.add,
                type: 'post',
                data: datas,
                success: function(result){
                    if(result.code == 1){
                        layers.toast(result.message);
                        setTimeout(function() {
                            window.location.href= '/admin/product/product_stock/index';
                        }, 1000)
                    }else{
                        layers.toast(result.message);
                    }
                },
                error: function(){
                    console.log("网络异常!")
                }
            });
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
                    console.log(result);
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
                    var addItem = {id: data.value.split(',')[0] * 1, department_name: data.value.split(',')[1]};
                    vm.selectedOrgUsr.push(addItem);
                    //vm.selectedOrgUsr = home.unique(vm.selectedOrgUsr).reverse();
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
            OrgSearchArr: [] // 缓存组织架构搜索结果
        },
        methods: {
            // 建仓价
            stockBook: function(event) {
                var stockBookVal = $.trim(event.target.value);
                if(!stockBookVal) {
                    return false;
                }
                if(!isNaN(stockBookVal)) { // 如果是数字
                    if(stockBookVal < 11 || stockBookVal > 13) {
                        this.verifyData.verifyBook = {
                            checkShow: true,
                            text: '建仓价介于跌停价与涨停价之间'
                        }
                    } else {
                        this.verifyData.verifyBook = {
                            checkShow: false
                        }
                    }
                } else {
                    this.verifyData.verifyBook = {
                        checkShow: true,
                        text: '建仓价只能为数字'
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
                        text: '调仓价只能为数字'
                    }
                }
            },
            // 止盈价
            stockWin: function(event) {
                var stockWinVal = $.trim(event.target.value);
                if(isNaN(stockWinVal)) { // 如果不是数字
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
    };
    _init();
});

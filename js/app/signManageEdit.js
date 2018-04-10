/**
 * Created by Administrator on 2017-10-10.
 * 标的管理
 */
require(['common', 'layui', 'ajaxurl', 'tools', 'layers', 'jquery.metisMenu'], function (common, layui, ajaxurl, tool, layers) {

    var main = {
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
                    var urls = tool.getUrlArgs(), product_id = '', product_stock_id = '';
                    if(urls.has){
                        product_id = urls.data.product_id;
                        product_stock_id = urls.data.product_stock_id;
                    }
                    data.field.product_id = product_id;
                    data.field.product_stock_id = product_stock_id;
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
                        main.prockEdit(data.field);
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
         * 获取标的编辑的初始数据
         */
        getEditList: function() {
            var urls = tool.getUrlArgs();
            if(urls.has){
                vm.productStrockId = urls.data.product_stock_id;
            }
            tool.ajax({
                url: ajaxurl.productStock.detail,
                type: 'post',
                data: {
                    product_stock_id: vm.productStrockId,
                    info_type: 6
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableEditData = result.data;
                        vm.readerOrgUsr = {nickname: result.data.nickname, id: result.data.nickname_id};
                        // 储存表单的初始值到val
                        tool.setCookie('setValue', vm.tableEditData);
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
         * 编辑标的
         * @param datas
         */
        prockEdit: function(data) {
            if(vm.isTrue) {
                vm.isTrue = false;
                tool.ajax({
                    url: ajaxurl.productStock.edit,
                    type: 'post',
                    data: data,
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
                        var addItem = {id: data.value.split(',')[0] * 1, nickname: data.value.split(',')[1]};
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
        },
        /**
         * 取消操作判断用户是否更改表单数据
         */
        cancel: function() {
            // 获取cookie储存的val值
            var setVal = tool.getCookie('setValue');
            // 储存当前的值到setValNew
            tool.setCookie('setValueNew', vm.tableEditData);
            var setValNew = tool.getCookie('setValueNew');
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
            userInfo: '', // 参数
            verifyData: {
                verifyWin: {checkShow: false, text: ''},  // 止盈价
                verifyLose: {checkShow: false, text: ''}  // 止损价
            },
            productTotleData: '',
            tableEditData: [], // 标的编辑的初始数据
            productStrockId: '', // 标的id
            tableEditInitData: [], // 获取初始化值

            BasicDepartment: [], // 标的负责人
            selectedOrgUsr: [], // 暂时记录组织架构的选中
            readerOrgUsr: {id: '', nickname:''}, // 组织架构选中
            showpop: false, // 组织架构显示隐藏
            OrgSearchArr: [], // 缓存组织架构搜索结果
            isTrue: true
        },
        methods: {
            //止盈价
            stockWin: function(event) {
                var stockWinVal = $.trim(event.target.value),
                    stockWinValEnd = $.trim($(event.target).siblings("input").val());
                if(isNaN(stockWinVal) || isNaN(stockWinValEnd)) { // 如果是数字
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
                        var newItem = {id: $(e.target).data('id'), nickname: $(e.target).data('text')};
                        this.selectedOrgUsr = [];
                        this.selectedOrgUsr.push(newItem);
                    }
                }
            },
            // 组织架构添加成员
            orgSelectAdd: function(e, id, name){
                if(id != undefined && name != undefined){
                    var newItem = {id:id, nickname: name};
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
        common.getTabLink();
        main.getBasic(); // 获取组织架构基础数据
        main.initForm();
        main.getEditList();
        main.getTotleProduct();
    };
    _init();
});

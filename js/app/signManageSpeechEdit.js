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
                form.on('submit(formSpeech)', function(data){
                    if(data) {
                        data.field.product_stock_id = vm.productStrockId;
                        data.field.product_id = vm.productId;
                        data.field.suggest_content_id = vm.suggestContentId;
                        if($.trim(data.field.suggest_content) == '') {
                            layers.toast("建议话术不能为空");
                            return false;
                        }
                        main.productSpeechEdit(data.field);
                    }
                    return false;
                });
            });
        },
        /**
         * 获取话术数据
         */
        getSpeech: function() {
            var urls = tool.getUrlArgs(), suggestContentId = '';
            if(urls.has){
                suggestContentId = urls.data.id;
            }
            tool.ajax({
                url: ajaxurl.productSuggest.editData,
                type: 'post',
                data: {
                    suggest_content_id: suggestContentId
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableDataDetail = result.data.suggestContentInfo;
                        tool.setCookie('setVal', vm.tableDataDetail);
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
        getAllList: function() {
            var urls = tool.getUrlArgs();
            if(urls.has){
                vm.productStrockId = urls.data.product_stock_id;
                vm.productId = urls.data.product_id;
                vm.suggestContentId = urls.data.id;
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
         * 编辑话术
         * @param datas
         */
        productSpeechEdit: function(datas) {
            if(vm.isTrue) {
                vm.isTrue = false;
                tool.ajax({
                    url: ajaxurl.productSuggest.edit,
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
            tool.setCookie('setValNew', vm.tableDataDetail);
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
            tableDataDetail: [],
            productStrockId: '',
            productId: '',
            suggestContentId: '',
            isTrue: true
        },
        methods: {
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
        main.getSpeech();
    };
    _init();
});

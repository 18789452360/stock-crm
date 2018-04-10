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
                        if($.trim(data.field.suggest_content) == '') {
                            layers.toast("建议话术不能为空");
                            return false;
                        }
                        main.productSpeechAdd(data.field);
                    }
                    return false;
                });
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
         * 新增话术
         * @param datas
         */
        productSpeechAdd: function(datas) {
            if(vm.isTrue) {
                vm.isTrue = false;
                tool.ajax({
                    url: ajaxurl.productSuggest.add,
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
            productId: '',
            isTrue: true
        },
        methods: {
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
    };
    _init();
});

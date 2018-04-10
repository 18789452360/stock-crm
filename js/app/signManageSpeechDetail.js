/**
 * Created by Administrator on 2017-10-10.
 * 标的管理
 */
require(['common', 'layui', 'ajaxurl', 'tools', 'layers'], function (common, layui, ajaxurl, tool, layers) {

    var main = {
        /**
         * 获取研报数据
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
            var urls = tool.getUrlArgs(), productStrockId = '';
            if(urls.has){
                productStrockId = urls.data.product_stock_id;
            }
            tool.ajax({
                url: ajaxurl.productStock.detail,
                type: 'post',
                data: {
                    product_stock_id: productStrockId,
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
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            tableDataBase: [],
            tableDataDetail: []
        },
        methods: {
            cancel: function() {
                common.closeTab()
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.getAllList();
        main.getSpeech();
    };
    _init();
});

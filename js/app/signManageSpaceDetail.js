/**
 * Created by Administrator on 2017-10-10.
 * 标的管理
 */
require(['common', 'layui', 'ajaxurl', 'tools', 'layers'], function (common, layui, ajaxurl, tool, layers) {

    var main = {
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
                type: 'post',
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
            getDetailStockData: [],
            tableEditData: '', // 编辑默认信息
            transferId: '', // 调仓id
            stockCodes: '' // 股票识别码
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
        main.getAllList();
        main.getEditList();
        main.getStock();
    };
    _init();
});

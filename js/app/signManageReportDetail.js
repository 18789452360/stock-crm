/**
 * Created by Administrator on 2017-10-10.
 * 标的管理
 */
require(['common', 'layui', 'ajaxurl', 'tools', 'layers'], function (common, layui, ajaxurl, tool, layers) {

    var main = {
        /**
         * 获取标的全部信息
         */
        getAllList: function() {
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
         * 获取研报数据
         */
        getReport: function(callback) {
            var urls = tool.getUrlArgs();
            if(urls.has){
                vm.productReportId = urls.data.id;
            }
            tool.ajax({
                url: ajaxurl.productReport.findProductReportById,
                type: 'post',
                data: {
                    product_report_id: vm.productReportId
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableDataDetail = result.data.report_info;
                        vm.productReportId = result.data.report_info.id;
                        var fileName = result.data.report_info.filename;
                        typeof callback === 'function' && callback.call(this);
                        if(fileName != '') {
                            vm.tableDataDetailName = true;
                        } else {
                            vm.tableDataDetailName = false;
                        }
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
         * 下载研报
         */
        downAttach: function() {
            tool.ajax({
                url: ajaxurl.productReport.downAttachment,
                data: {
                    id: vm.productReportId
                },
                type: 'post',
                success: function (res) {
                    if (res.code === 1) {
                        vm.reportUrl = res.data;
                    } else {
                        //layers.toast(res.message);
                    }
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
            tableDataDetail: [],
            tableDataDetailName: true,
            productStrockId: '', // 标的id
            productReportId: '', // 研报id
            reportUrl: ''
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
        common.getTabLink();
        main.getAllList();
        main.getReport(function() {
            main.downAttach();
        });
    };
    _init();
});

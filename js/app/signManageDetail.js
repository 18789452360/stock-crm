/**
 * Created by Administrator on 2017-10-10.
 * 标的管理
 */
require(['common', 'layui', 'ajaxurl', 'tools', 'layers'], function (common, layui, ajaxurl, tool, layers) {

    var main = {
        /**
         * 初始化tab
         */
        initTab: function() {
            layui.use('element', function(){
                var element = layui.element;
                // 获取点击后需要前往的tab对应的lay-id
                var toTab = $(".to-report");
                toTab.click(function() { // 点用户点击前往对应的tab时
                    var that = $(this),
                        layID = that.attr("data-id"); // 获取与tab的下标对应的值
                    element.tabChange('test', layID); // 加载对应的tab页面
                });
                element.on('tab(test)', function(data){
                    var layIDNew = data.index; // 获取当前tab所在的下标
                    switch (layIDNew) {
                        case 1:
                            if(vm.isTrueTabReport) {
                                main.getReportList(); // 调用研报接口
                                vm.isTrueTabReport = false;
                            }
                            break;
                        case 2:
                            if(vm.isTrueTabSpace) {
                                main.getSpaceList(); // 调用调仓接口
                                vm.isTrueTabSpace = false;
                            }
                            break;
                        case 3:
                            if(vm.isTrueTabSpeech) {
                                main.getSpeechList(); // 调用话术接口
                                vm.isTrueTabSpeech = false;
                            }
                            break;
                        case 4:
                            if(vm.isTrueTabLog) {
                                main.getLogList(); // 调用操作日志接口
                                vm.isTrueTabLog = false;
                            }
                            break;
                    }
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
                    info_type: 0
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableDataBase = result.data.product_stock_base;
                        vm.stockCodes = result.data.product_stock_base.stock_codes;
                        vm.stockStatus = result.data.product_stock_base.status;
                        vm.tableDataReport = result.data.report_list;
                        vm.tableDataSpace = result.data.transfer_list;
                        vm.tableDataSpeech = result.data.suggest_content_list;
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
         * 获取研报列表
         */
        getReportList: function() {
            tool.ajax({
                url: ajaxurl.productStock.detail,
                type: 'post',
                data: {
                    product_stock_id: vm.productStrockId,
                    info_type: 1,
                    pagesize: vm.dataReport.pagesize,
                    curpage: vm.dataReport.curpage
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableDataReport = result.data.report_list;
                        // 获取总条数
                        vm.getReportListTotal = result.data.total_num;
                        // 调用分页
                        main.getReportPage();
                        Vue.nextTick(function() {
                            // DOM 更新了
                            layui.use(['form'],function() {
                                var form = layui.form;
                                form.render()
                            });
                        })
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
         * 获取调仓列表
         */
        getSpaceList: function() {
            tool.ajax({
                url: ajaxurl.productStock.detail,
                type: 'post',
                data: {
                    product_stock_id: vm.productStrockId,
                    info_type: 2,
                    pagesize: vm.dataSpace.pagesize,
                    curpage: vm.dataSpace.curpage
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableDataSpace = result.data.transfer_list;
                        // 获取总条数
                        vm.getSpaceListTotal = result.data.total_num;
                        // 调用分页
                        main.getSpacePage();
                        Vue.nextTick(function() {
                            // DOM 更新了
                            layui.use(['form'],function() {
                                var form = layui.form;
                                form.render()
                            });
                        })
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
         * 获取话术列表
         */
        getSpeechList: function() {
            tool.ajax({
                url: ajaxurl.productStock.detail,
                type: 'post',
                data: {
                    product_stock_id: vm.productStrockId,
                    info_type: 3,
                    pagesize: vm.dataSpeech.pagesize,
                    curpage: vm.dataSpeech.curpage
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableDataSpeech = result.data.suggest_content_list;
                        // 获取总条数
                        vm.getSpeechListTotal = result.data.total_num;
                        // 调用分页
                        main.getSpeechPage();
                        Vue.nextTick(function() {
                            // DOM 更新了
                            layui.use(['form'],function() {
                                var form = layui.form;
                                form.render()
                            });
                        })
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
         * 获取操作日志
         */
        getLogList: function() {
            tool.ajax({
                url: ajaxurl.productStock.logList,
                type: 'post',
                data: {
                    product_stock_id: vm.productStrockId,
                    pagesize: vm.dataLog.pagesize,
                    curpage: vm.dataLog.curpage
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableDataLog = result.data.list;
                        // 获取总条数
                        vm.getLogListTotal = result.data.total_num;
                        // 调用分页
                        main.getLogPage();
                        Vue.nextTick(function() {
                            // DOM 更新了
                            layui.use(['form'],function() {
                                var form = layui.form;
                                form.render()
                            });
                        })
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
         * 删除研报
         */
        delReport: function(id, indexs) {
            layers.confirm({
                title: '删除研报',
                area: ['450px', '250px'],
                content: '<div class="confirm-tips">删除操作不可逆，确认删除？</div>',
                success: function() {
                },
                btn2: function (index, layero) {
                    tool.ajax({
                        url: ajaxurl.productReport.delete,
                        type: 'post',
                        data: {
                            product_report_id: id
                        },
                        success: function (result) {
                            if (result.code == 1) {
                                layers.toast(result.message);
                                setTimeout(function () {
                                    vm.tableDataReport.splice(indexs, 1);
                                }, 1000)
                            } else {
                                layers.toast(result.message);
                            }
                        },
                        error: function () {
                            layers.toast("网络异常!")
                        }
                    });
                }
            })
        },
        /**
         * 删除调仓
         */
        delSpace: function(id, indexs) {
            layers.confirm({
                title: '删除研报',
                area: ['450px', '250px'],
                content: '<div class="confirm-tips">删除操作不可逆，确认删除？</div>',
                success: function () {
                },
                btn2: function (index, layero) {
                    tool.ajax({
                        url: ajaxurl.productTransfer.delete,
                        type: 'post',
                        data: {
                            transfer_id: id
                        },
                        success: function (result) {
                            if (result.code == 1) {
                                layers.toast(result.message);
                                setTimeout(function () {
                                    vm.tableDataSpace.splice(indexs, 1);
                                }, 1000)
                            } else {
                                layers.toast(result.message);
                            }
                        },
                        error: function () {
                            layers.toast("网络异常!")
                        }
                    });
                }
            })
        },
        /**
         * 删除话术
         */
        delSpeech: function(id, indexs) {
            layers.confirm({
                title: '删除研报',
                area: ['450px', '250px'],
                content: '<div class="confirm-tips">删除操作不可逆，确认删除？</div>',
                success: function () {
                },
                btn2: function (index, layero) {
                    tool.ajax({
                        url: ajaxurl.productSuggest.delete,
                        type: 'post',
                        data: {
                            suggest_content_id: id
                        },
                        success: function (result) {
                            if (result.code == 1) {
                                layers.toast(result.message);
                                setTimeout(function () {
                                    vm.tableDataSpeech.splice(indexs, 1);
                                }, 1000)
                            } else {
                                layers.toast(result.message);
                            }
                        },
                        error: function () {
                            layers.toast("网络异常!")
                        }
                    });
                }
            })
        },
        /**
         * 研报分页
         */
        getReportPage: function() {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'test-report',
                    count: vm.getReportListTotal    // 数据总数
                    , limit: vm.dataReport.pagesize         // 每页显示条数
                    , curr: vm.dataReport.curpage           // 当前页数
                    , jump: function (obj, first) {
                        if (!first) {
                            vm.dataReport.pagesize = obj.limit;    // 获取每页显示条数
                            vm.dataReport.curpage = obj.curr;      // 获取当前页
                            main.getReportList();           // 发送请求
                        }
                    }
                });
            });
        },
        /**
         * 调仓分页
         */
        getSpacePage: function() {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'test-space',
                    count: vm.getSpaceListTotal    // 数据总数
                    , limit: vm.dataSpace.pagesize         // 每页显示条数
                    , curr: vm.dataSpace.curpage           // 当前页数
                    , jump: function (obj, first) {
                        if (!first) {
                            vm.dataSpace.pagesize = obj.limit;    // 获取每页显示条数
                            vm.dataSpace.curpage = obj.curr;      // 获取当前页
                            main.getSpaceList();           // 发送请求
                        }
                    }
                });
            });
        },
        /**
         * 话术分页
         */
        getSpeechPage: function() {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'test-speech',
                    count: vm.getSpeechListTotal    // 数据总数
                    , limit: vm.dataSpeech.pagesize         // 每页显示条数
                    , curr: vm.dataSpeech.curpage           // 当前页数
                    , jump: function (obj, first) {
                        if (!first) {
                            vm.dataSpeech.pagesize = obj.limit;    // 获取每页显示条数
                            vm.dataSpeech.curpage = obj.curr;      // 获取当前页
                            main.getSpeechList();           // 发送请求
                        }
                    }
                });
            });
        },
        /**
         * 操作日志分页
         */
        getLogPage: function() {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'test-log',
                    count: vm.getLogListTotal    // 数据总数
                    , limit: vm.dataLog.pagesize         // 每页显示条数
                    , curr: vm.dataLog.curpage           // 当前页数
                    , jump: function (obj, first) {
                        if (!first) {
                            vm.dataLog.pagesize = obj.limit;    // 获取每页显示条数
                            vm.dataLog.curpage = obj.curr;      // 获取当前页
                            main.getLogList();           // 发送请求
                        }
                    }
                });
            });
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            tableDataBase: [], // 标的基本信息
            tableDataReport: [], // 研报
            tableDataSpace: [], // 调仓
            tableDataSpeech: [], // 话术
            tableDataLog: [], // 操作日志
            getReportListTotal: '', // 研报总数
            getSpaceListTotal: '', // 调仓总数
            getSpeechListTotal: '', // 话术总数
            getLogListTotal: '', // 操作日志总数
            isTrueTabReport: true,
            isTrueTabSpace: true,
            isTrueTabSpeech: true,
            isTrueTabLog: true,
            stockCodes: '', // 股票识别码
            productStrockId: '', // 标的id
            productId: '', // 产品id
            stockStatus: '', // 标的是否出局
            dataReport: {
                pagesize: '' | 10,
                curpage: '' | 1
            },
            dataSpace: {
                pagesize: '' | 10,
                curpage: '' | 1
            },
            dataSpeech: {
                pagesize: '' | 10,
                curpage: '' | 1
            },
            dataLog: {
                pagesize: '' | 10,
                curpage: '' | 1
            }
        },
        methods: {
            delReport: function(id, index) {
                main.delReport(id, index);
            },
            delSpace: function(id, index) {
                main.delSpace(id, index);
            },
            delSpeech: function(id, index) {
                main.delSpeech(id, index);
            }
        }
    });
    /**
     * 初始化
     * @private
     */
    var _init = function () {
        common.getTabLink();
        main.initTab(); // 初始化tab
        main.getAllList(); // 获取标的全部信息
    };
    _init();
});

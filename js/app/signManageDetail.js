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
                    if(layIDNew == 4) {
                        main.getLogList(); // 调用操作日志接口
                    }
                });
            });
        },
        /**
         * 获取研报列表
         */
        getReportList: function() {
            tool.ajax({
                url: ajaxurl.group.index,
                type: 'post',
                data: vm.dataReport,
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableDataReport = result.data.list;
                        // 获取总条数
                        vm.getReportListTotal = result.data.all_num;
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
                    console.log("网络异常!")
                }
            });
        },
        /**
         * 获取调仓列表
         */
        getSpaceList: function() {
            tool.ajax({
                url: ajaxurl.group.index,
                type: 'post',
                data: vm.dataSpace,
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableDataSpace = result.data.list;
                        // 获取总条数
                        vm.getSpaceListTotal = result.data.all_num;
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
                    console.log("网络异常!")
                }
            });
        },
        /**
         * 获取话术列表
         */
        getSpeechList: function() {
            tool.ajax({
                url: ajaxurl.group.index,
                type: 'post',
                data: vm.dataSpeech,
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableDataSpeech = result.data.list;
                        // 获取总条数
                        vm.getSpeechListTotal = result.data.all_num;
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
                    console.log("网络异常!")
                }
            });
        },
        /**
         * 获取操作日志
         */
        getLogList: function() {
            tool.ajax({
                url: ajaxurl.group.index,
                type: 'post',
                data: vm.dataLog,
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableDataLog = result.data.list;
                        // 获取总条数
                        vm.getLogListTotal = result.data.all_num;
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
                    console.log("网络异常!")
                }
            });
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
            tableDataReport: [], // 研报
            tableDataSpace: [], // 调仓
            tableDataSpeech: [], // 话术
            tableDataLog: [], // 操作日志
            getReportListTotal: '', // 研报总数
            getSpaceListTotal: '', // 调仓总数
            getSpeechListTotal: '', // 话术总数
            getLogListTotal: '', // 操作日志总数
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

        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        common.getTabLink();
        main.initTab(); // 初始化tab
        main.getReportList(); // 研报
        main.getSpaceList(); // 调仓
        main.getSpeechList(); // 话术
        //main.getLogList(); // 操作日志
    };
    _init();
});

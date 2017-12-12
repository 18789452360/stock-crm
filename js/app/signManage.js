/**
 * Created by Administrator on 2017-10-10.
 * 标的管理
 */
require(['common', 'layui', 'ajaxurl', 'tools', 'layers'], function (common, layui, ajaxurl, tool, layers) {

    var main = {
        /**
         * 渲染列表
         */
        getAllList: function() {
            layui.use(['form', 'laydate'],function() {
                var form = layui.form,
                    laydate = layui.laydate;
                laydate.render({
                    elem: '#test-start'
                    ,trigger: 'click'
                    ,type: "datetime"
                    ,done: function(value, date) {
                        vm.data.start_time = value
                    }
                });
                laydate.render({
                    elem: '#test-stop'
                    ,trigger: 'click'
                    ,type: "datetime"
                    ,done: function(value, date) {
                        vm.data.stop_time = value
                    }
                });
            });
            tool.ajax({
                url: ajaxurl.productStock.index,
                type: 'post',
                data: vm.data,
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableDataAll = result.data.list;
                        // 获取总条数
                        vm.getAllListTotal = result.data.total_num;
                        console.log(vm.tableDataAll);
                        // 调用分页
                        main.getAllPage();
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
         * 模糊查询
         */
        accuntQuery: function() {
            layui.use(['form', 'laydate'],function() {
                var form = layui.form,
                    laydate = layui.laydate;
                form.on('select(level)', function(data){
                    vm.data.status = data.value; // 得到下来框状态的值
                });
                laydate.render({
                    elem: '#test-start'
                    ,trigger: 'click'
                    ,type: "datetime"
                    ,done: function(value, date) {
                        vm.data.product_stock_create_time_start = value
                    }
                });
                laydate.render({
                    elem: '#test-stop'
                    ,trigger: 'click'
                    ,type: "datetime"
                    ,done: function(value, date) {
                        vm.data.product_stock_create_time_end = value
                    }
                });
                //监听提交
                form.on('submit(formSelect)', function (data) {
                    if(data.field.product_stock_create_time_start != '' && data.field.product_stock_create_time_end != ''){
                        if(data.field.product_stock_create_time_start > data.field.product_stock_create_time_start){
                            layers.toast('开始时间不能大于结束时间！');
                            return false;
                        }
                    }
                    vm.data.curpage = 1;
                    main.getAllList();
                    return false;
                });
            })
        },
        /**
         * 分页 (全部)
         */
        getAllPage: function() {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'test',
                    count: vm.getAllListTotal    // 数据总数
                    ,limit: vm.data.pagesize         // 每页显示条数
                    ,curr: vm.data.curpage           // 当前页数
                    ,jump: function (obj, first) {
                        if (!first) {
                            vm.data.pagesize = obj.limit;    // 获取每页显示条数
                            vm.data.curpage = obj.curr;      // 获取当前页
                            main.getAllList();
                        }
                    }
                });
            });
        },
        /**
         * 删除
         */
        stockDelete: function(StockID) {
            layers.confirm({
                title: '提示',
                area: ['450px', '250px'],
                content: '<div class="confirm-tips"><p>确定删除？</p></div>',
                btn2: function (index, layero) {
                    tool.ajax({
                        url: ajaxurl.productStock.delete,
                        type: 'post',
                        data: { product_stock_id: StockID },
                        success: function(result){
                            if(result.code == 1){
                                layers.toast(result.message);
                                setTimeout(function() {
                                    window.location.reload();
                                }, 1000)
                            }else{
                                layers.toast(result.message);
                            }
                        },
                        error: function(){
                            console.log("网络异常!")
                        }
                    });
                }
            });
        },
        /**
         * 出局
         */
        stockOutPut: function(StockID) {
            layers.confirm({
                title: '提示',
                area: ['450px', '250px'],
                content: '<div class="confirm-tips"><p>确定出局？</p></div>',
                btn2: function (index, layero) {
                    tool.ajax({
                        url: ajaxurl.productStock.outProductStock,
                        type: 'post',
                        data: { product_id: StockID },
                        success: function(result){
                            if(result.code == 1){
                                layers.toast(result.message);
                                setTimeout(function() {
                                    window.location.reload();
                                }, 1000)
                            }else{
                                layers.toast(result.message);
                            }
                        },
                        error: function(){
                            console.log("网络异常!")
                        }
                    });
                }
            });
        },
        /**
         * 重置
         */
        reset: function(){
            vm.data = {};
            main.getAllList()
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            tableDataAll: [], // 获取列表
            getAllListTotal: '', // 获取列表条数
            data: {
                stock_name: '',
                product_name: '',
                product_stock_create_time_start: '',
                product_stock_create_time_end: '',
                status: '', // 标的状态,0为全部,1为正常, 2为已结束
                product_stock_leader_name: '',
                pagesize: 10,
                curpage: 1
            }
        },
        methods: {
            // 删除标的
            stockDelete: function(StockID) {
                if(StockID == undefined) {
                    throw new Error("缺少参数")
                }
                main.stockDelete(StockID);
            },
            // 标的出局
            stockOutPut: function(StockID) {
                if(StockID == undefined) {
                    throw new Error("缺少参数")
                }
                main.stockOutPut(StockID);
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
        main.accuntQuery();
    };
    _init();
});

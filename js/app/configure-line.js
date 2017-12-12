/**
 * Created by Administrator on 2017-09-25.
 */
/**
 * Created by Administrator on 2017-09-18.
 */
require(['common', 'jquery.metisMenu', 'layui', 'layers','ajaxurl','tools'], function (common, undefined, layui, layer,ajaxurl,tool) {

    var home = {
        /* 表格渲染 + 注册element */
        tableInfo: function() {
            tool.ajax({
                url:ajaxurl.setting.index,
                type:'get',
                success:function(result){
                    if(result.code == 1 ){
                        vm.sourceInfo = result.data.customer_from_channel;
                        vm.onlineInfo = result.data.online_consulting_plan;
                        vm.lineInfo = result.data.line_investment_plan;
                        vm.sourceInfo = result.data.follow_up_type;
                        vm.followupInfo = result.data.follow_up_type;
                        vm.collectionInfo = result.data.collection_account;
                        vm.processInfo = result.data.sales_process;
                        // console.log(vm.sourceInfo);
                    }else{
                        console.log("查询失败！");
                    }
                }
            });

            layui.use(['table','form', 'layedit', 'laydate'], function(){
                var table = layui.table,
                     form = layui.form,
                     layer = layui.layer,
                     layedit = layui.layedit,
                     laydate = layui.laydate;
                //监听表格复选框选择
                table.on('checkbox(demo)', function(obj){
                        console.log(obj);
                         // layer.alert(obj);       
                });
                var $ = layui.$, active = {
                    getCheckData: function(){ //获取选中数据
                      var checkStatus = table.checkStatus('idTest')
                      ,data = checkStatus.data;
                    }
                };      
                $('.demoTable .layui-btn').on('click', function(obj){
                     var type = $(this).data('type');
                        active[type] ? active[type].call(this) : '';
                });
            });
        }
    };
    var _init = function() {
        home.tableInfo();
    };
    /* 实例化vue */
    var vm = new Vue({
        el: "#app",
        data: {
            tableList: [],
            sourceInfo:'',
            lineInfo:'',
            onlineInfo:'',
            followupInfo:'',
            collectionInfo:'',
            processInfo:'',
        },
        methods: {  },
    });
    _init();
});
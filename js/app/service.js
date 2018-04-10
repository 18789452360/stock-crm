/**
 * Created by Administrator on 2017-09-25.
 * 权限管理
 */
require(["vue", "layui", "layers", "common", "tools", "ajaxurl",], function (Vue, layui, layers, common, tool, ajaxurl) {

    var home = {
        /**
         * 表格渲染
         */
        getserviceData: function(start_time,end_time,Opname,Pname,follow,pagesize,curpage) {
            layui.use([ 'laydate'],function(){
                var laydate = layui.laydate;
                // 执行一个laydate实例
                lay('.test-item').each(function(){
                    laydate.render({
                        elem: this
                        ,trigger: 'click'
                        ,type: "datetime"
                    });
                });
                tool.ajax({
                    url: ajaxurl.service.index,
                    type: 'post',
                    data: {
                        start_time:start_time,
                        end_time:end_time,
                        operate_real_name:Opname,
                        product_name:Pname,
                        followup_content:follow,
                        pagesize:vm.pagesize,
                        curpage:vm.page,
                    },
                    success: function(result){
                        if(result.code == 1){
                            // 渲染到vue数据层
                            if(result.data != null){
                               vm.serviceInfo = result.data.list;
                                // 获取总条数
                                vm.serviceTotal = result.data.total_num ; 
                                home.getAllPage()
                            }else{
                                vm.serviceInfo = '';
                                vm.serviceTotal = 0; 
                            }
                            
                            // 调用分页
                            home.getAllPage();
                        }else{
                            layers.toast(result.message);
                        }
                    }
                });
            })
        },
        /**
         * 模糊查询
         */
        jurQuery: function() {
            layui.use(['form', 'laydate'],function() {
                var form = layui.form,
                    laydate = layui.laydate;
                //监听提交
                form.on('submit(formSelect)', function (data) {
                    if (!$.isEmptyObject(data.field)) {
                        vm.Stime = data.field.start_time;
                        vm.Etime = data.field.stop_time;
                        vm.Opname = data.field.name;
                        vm.Pname = data.field.product;
                        vm.page = 1;
                        if(new Date(vm.Etime) - new Date(vm.Stime) <= 0){
                            layers.toast('首次时间不能大于结束时间！', {
                                icon: 2,
                                anim: 6
                            });
                            return false;
                        }
                        home.getserviceData(vm.Stime,vm.Etime,vm.Opname,vm.Pname,vm.num);
                    }
                    return false;
                })
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
                    count: vm.serviceTotal    // 数据总数
                    ,limit: vm.pagesize         // 每页显示条数
                    ,curr: vm.page           // 当前页数
                    ,jump: function (obj, first) {
                        if (!first) {
                            vm.pagesize = obj.limit;    // 获取每页显示条数
                            vm.page = obj.curr;      // 获取当前页
                            home.getserviceData(vm.Stime,vm.Etime,vm.Opname,vm.Pname,vm.num);           // 发送请求
                        }
                    }
                });
            });
        },
         /**
         * 设置权限管理
         */
        getDataAuth: function (callback) {
            tool.ajax({
                url: ajaxurl.setting.getDataAuth,
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        vm.customer = data.data.noHas_auth.customer;
                        vm.customer_contact = data.data.noHas_auth.customer_contact;
                        vm.cooper_situation = data.data.noHas_auth.customer_cooper_situation;
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                },
                error: function (err) {
                    layers.toast('网络异常!');
                }
            })
        },
    };
    /**
     * 实例化vue
     */
    var vm = new Vue({
        el: "#app",
        data: {
            serviceTotal: '',
            serviceInfo: '',
            pagesize: '',
            page: '',
            pageNum: '',
            Stime:'',
            Etime:'',
            Opname:'',
            Pname:'',
            num:'',
            customer:'',
            customer_contact:'',
            cooper_situation:'',
        },
        methods: {
            // 重置
            reset: function() {
                home.getserviceData();
                vm.num = '';
                vm.Pname = '';
                vm.Opname = '';
                vm.Stime = '';
                vm.Etime = '';
                vm.page = 1;
                $('.example-handle .layui-btn').removeClass('active');
            },
            product:function(event,num){
                vm.num = num
                vm.page = 1;
                $(event.target).addClass('active');
                $(event.target).siblings().removeClass('active');
                home.getserviceData(vm.Stime,vm.Etime,vm.Opname,vm.Pname,num);
            },
            noData:function(){
                layers.toast('无导出数据！', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
        },

    });
    var _init = function() {
        home.getserviceData();
        home.jurQuery();
        home.getDataAuth();
    };
    _init();

});
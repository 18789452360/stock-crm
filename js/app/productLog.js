require(['layui', 'common', 'layers', 'tools', 'ajaxurl', 'page'], function (layui, common, layers, tool, ajaxurl ) {
    var main = {
        form: '',
        /**
         * 初始化layui
         */
        initLayui: function () {
            layui.use(['form', 'laydate'], function () {
                var form = layui.form,
                    laydate = layui.laydate;
                main.form = layui.form;
                form.render();
                laydate.render({ //循环初始化时间控件
                    elem: '#operate_start_time',
                    type: 'datetime',
                    done:function(value,date){
                        vm.getLogData.create_time_start = value;
                    }
                });
                laydate.render({ //循环初始化时间控件
                    elem: '#operate_end_time',
                    type: 'datetime',
                    done:function(value,date){
                        vm.getLogData.create_time_end = value;
                    }
                });
            });
        },
        /**
         * 获取操作日志数据
         */
        getProductLog:function(flag){
            var urls = vm.getUrls;
            if(urls.has){
                if(!urls.data.product_id){
                    layers.toast('缺少产品id参数');
                    return false; 
                }
            }else{
                layers.toast('缺少产品id参数');
                return false; 
            }
            vm.getLogData.product_id = urls.data.product_id;
            var loading = '';
            tool.ajax({
                url:ajaxurl.product.productLog,
                data:vm.getLogData,
                type:'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success:function(data){
                    if(data.code == 1){
                        vm.logData = data.data;
                        vm.total_num = data.data.total_num;
                        !flag && main.productLogPage();
                    }else{
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                },
                error:function(){
                    layers.toast('网络异常!');
                },
                complete:function(){
                    setTimeout(function(){
                        layers.closed(loading);
                    },200)
                },
            })
        },
        /**
         * 操作日志分页器
         */
        productLogPage:function(){
            layui.use('laypage', function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'product-page', //注意，这里的 test1 是 ID，不用加 # 号
                    count: vm.total_num, //数据总数，从服务端得到
                    curr: vm.getLogData.curpage,
                    jump: function (obj, first) {
                        if (!first) {
                            vm.getLogData.curpage = obj.curr;
                            main.getProductLog(true);
                        }
                    }
                });
            })
        },
        /**
         * 查询操作
         */
        inquire: function () {
            if(vm.getLogData.create_time_start && vm.getLogData.create_time_end){
                if(vm.getLogData.create_time_start > vm.getLogData.create_time_end){
                    layers.toast('操作结束时间不能小于操作开始时间', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
            };
            if(!vm.getLogData.create_time_start && !vm.getLogData.create_time_end && !vm.getLogData.content){
                layers.toast('请输入或选择筛选条件', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            main.getProductLog();
        },
        /**
         * 重置操作
         */
        reset:function(){
            vm.getLogData = {
                create_time_start:'',//开始时间
                create_time_end:'',//结束时间
                content:'',//操作内容
                curpage: 1, //当前页码,默认为1
            }
            main.getProductLog();
        }
    };
    var vm = new Vue({
        el: '#app',
        data: {
            getUrls: tool.getUrlArgs(), //获取Url参数
            getLogData:{
                create_time_start:'',//开始时间
                create_time_end:'',//结束时间
                content:'',//操作内容
                curpage: 1, //当前页码,默认为1
            },
            total_num:'',//数据总条数
            logData:{},//获取到的操作日志内容
        },
        methods: {
            comeback: function () { //返回上一页
                common.closeTab();
            },
            inquire: function () {//查询操作
                main.inquire();
            },
            reset:function(){//重置操作
                main.reset();
            }
        }
    });
    var _init = function () {
        common.getTabLink();
        main.initLayui();
        main.getProductLog();
    }
    _init();
})
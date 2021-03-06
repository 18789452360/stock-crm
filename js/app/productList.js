require(['layui', 'common', 'layers', 'tools', 'ajaxurl'], function (layui, common, layers, tool, ajaxurl) {
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
                //初始化时间并绑定到Vue上
                laydate.render({//产品创建开始时间
                    elem: '#product_create_time_start',
                    type: 'datetime',
                    done: function (value) {
                        if(vm.filterData.product_create_time_end){
                            if(value > vm.filterData.product_create_time_end){
                                layers.toast('开始时间不能大于结束时间');
                                vm.filterData.product_create_time_start = '';
                                setTimeout(function(){
                                    $('#product_create_time_start').val('');
                                },200);
                                return false;
                            }
                        }
                        vm.filterData.product_create_time_start = value;
                    }
                });
                laydate.render({//产品创建结束时间
                    elem: '#product_create_time_end',
                    type: 'datetime',
                    done: function (value) {
                        if(vm.filterData.product_create_time_start){
                            if(vm.filterData.product_create_time_start > value){
                                layers.toast('结束时间不能小于开始时间');
                                vm.filterData.product_create_time_end = '';
                                setTimeout(function(){
                                    $('#product_create_time_end').val('');
                                },200);
                                return false;
                            }
                        }
                        vm.filterData.product_create_time_end = value;
                    }
                });
                laydate.render({//产品开始的开始时间
                    elem: '#product_start_time_start',
                    type: 'datetime',
                    done: function (value) {
                        if(vm.filterData.product_start_time_end){
                            if(value > vm.filterData.product_start_time_end){
                                layers.toast('开始时间不能大于结束时间');
                                vm.filterData.product_start_time_start = '';
                                setTimeout(function(){
                                    $('#product_start_time_start').val('');
                                },200);
                                return false;
                            }
                        }
                        vm.filterData.product_start_time_start = value;
                    }
                });
                laydate.render({//产品开始的结束时间
                    elem: '#product_start_time_end',
                    type: 'datetime',
                    done: function (value) {
                        if(vm.filterData.product_start_time_start){
                            if(vm.filterData.product_start_time_start > value){
                                layers.toast('结束时间不能小于开始时间');
                                vm.filterData.product_start_time_end = '';
                                setTimeout(function(){
                                    $('#product_start_time_end').val('');
                                },200);
                                return false;
                            }
                        }
                        vm.filterData.product_start_time_end = value;
                    }
                });
                laydate.render({//产品结束的开始时间
                    elem: '#product_end_time_start',
                    type: 'datetime',
                    done: function (value) {
                        if(vm.filterData.product_end_time_end){
                            if(value > vm.filterData.product_end_time_end){
                                layers.toast('开始时间不能大于结束时间');
                                vm.filterData.product_end_time_start = '';
                                setTimeout(function(){
                                    $('#product_end_time_start').val('');
                                },200);
                                return false;
                            }
                        }
                        vm.filterData.product_end_time_start = value;
                    }
                });
                laydate.render({//产品结束的结束时间
                    elem: '#product_end_time_end',
                    type: 'datetime',
                    done: function (value) {
                        if(vm.filterData.product_end_time_start){
                            if(vm.filterData.product_end_time_start > value){
                                layers.toast('结束时间不能小于开始时间');
                                vm.filterData.product_end_time_end = '';
                                setTimeout(function(){
                                    $('#product_end_time_end').val('');
                                },200);
                                return false;
                            }
                        }
                        vm.filterData.product_end_time_end = value;
                    }
                });
                form.on('select(status)', function (data) {
                    vm.filterData.product_status = data.value;
                    vm.filterData.curpage = 1;
                });
            });
        },
        /**
         * 获取产品列表
         */
        getProductList: function (flag) {
            var loading = '';
            tool.ajax({
                url: ajaxurl.product.index,
                data: vm.filterData,
                type: 'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success: function (data) {
                    if (data.code == 1) {
                        vm.productsData = data.data;
                        !flag && main.productListPage();
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                },
                error: function () {
                    layers.toast('网络异常!');
                },
                complete:function(){
                    setTimeout(function(){
                        layers.closed(loading);
                    },50)
                },
            })
        },
        /**
         * 产品列表分页器
         */
        productListPage: function () {
            layui.use('laypage', function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'product-page', //注意，这里的 test1 是 ID，不用加 # 号
                    count: vm.productsData.total_num, //数据总数，从服务端得到
                    curr: vm.filterData.curpage,
                    jump: function (obj, first) {
                        if (!first) {
                            vm.filterData.curpage = obj.curr;
                            main.getProductList(true);
                        }
                    }
                });
            })
        },
        /**
         * 筛选项的验证
         */
        formVerify: function () {
            var flag = false;
            if (vm.filterData.product_create_time_start && !vm.filterData.product_create_time_end) {
                layers.toast('请选择产品创建的结束时间', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            if (!vm.filterData.product_create_time_start && vm.filterData.product_create_time_end) {
                layers.toast('请选择产品创建的开始时间', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            if (vm.filterData.product_start_time_start && !vm.filterData.product_start_time_end) {
                layers.toast('请选择产品开始的结束时间', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            if (!vm.filterData.product_start_time_start && vm.filterData.product_start_time_end) {
                layers.toast('请选择产品开始的开始时间', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            if (vm.filterData.product_end_time_start && !vm.filterData.product_end_time_end) {
                layers.toast('请选择产品结束的结束时间', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            if (!vm.filterData.product_end_time_start && vm.filterData.product_end_time_end) {
                layers.toast('请选择产品结束的开始时间', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            flag = true;
            return flag;
        },
        /**
         * 查询操作
         */
        inquire: function () {
            var flag = main.formVerify();
            if (flag) {
                vm.filterData.curpage = 1;
                main.getProductList();
            }
        },
        /**
         * 重置操作
         */
        reset: function () {
            vm.filterData = {
                product_name: '', //产品名称
                product_person_leader: '', //产品负责人
                product_select_type: '', //产品查询类型
                product_create_time_start: '', //产品创建时间开始时间
                product_create_time_end: '', //产品创建时间结束时间
                product_start_time_start: '', //产品开始时间开始时间
                product_start_time_end: '', //产品开始时间结束时间
                product_end_time_start: '', //产品结束时间开始时间
                product_end_time_end: '', //产品结束时间结束时间
                product_status: '', //产品状态（''为全部,1为正常,2为已结束）
                curpage: 1, //当前页码,默认为1
                name:'create_time',//默认为创建时间排序
                type:'desc',//默认为降序
            }
            var $option = $('select').find('option'),
                len = $option.length;
            for (var i = 0; i < len; i++) {
                $option.attr('selected', false);
            }
            $('.layui-select-title').find('input').val('');
            main.form.render();
            main.getProductList();
        },
        /**
         * 排序
         */
        sort: function (e,name) {
            var $i = $(e.currentTarget).find('i'),
                type = $i.attr('data-type');
            $(e.currentTarget).siblings('.icon-td').find('i')
                    .removeClass('bottom')
                    .removeClass('top')
                    .attr('data-type',0);
                vm.filterData.name = name;
            if (type == 0) {
                $i.removeClass('bottom')
                    .addClass('top')
                    .attr('data-type', 1);
                vm.filterData.type = 'asc';
            } else {
                $i.removeClass('top')
                    .addClass('bottom')
                    .attr('data-type', 0);
                vm.filterData.type = 'desc';
            };
            vm.filterData.curpage = 1;
            main.getProductList();
        },
        /**
         * 删除产品
         */
        delProduct:function(index,id){
            if(!id){
                layers.toast('缺少产品id', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            layers.confirm({
                title:'提示',
                content:'<div class="confirm-tips"><p>删除操作不可逆，确认删除？</p></div>',
                btn2:function(){
                    var loading = '';
                    tool.ajax({
                        url:ajaxurl.product.deleteProduct,
                        data:{
                            product_id:id,
                        },
                        type:'post',
                        beforeSend: function () {
                            layers.load(function (indexs) {
                                loading = indexs;
                            });
                        },
                        success:function(data){
                            if(data.code == 1){
                                layers.toast('删除成功!');
                                setTimeout(function(){
                                    main.getProductList();
                                },300);
                            }else {
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
                        }
                    })
                    layers.closedAll();
                }
            });
        },
        /**
         * 出局产品
         */
        outProduct:function(index,id){
            if(!id){
                layers.toast('缺少产品id', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }else{
                layers.confirm({
                    title:'提示',
                    content:'<div class="confirm-tips"><p>出局后产品内容不可再进行更改，确认出局？</p></div>',
                    btn2:function(){
                        var loading = '';
                        tool.ajax({
                            url:ajaxurl.product.outProduct,
                            data:{
                                product_id:id,
                            },
                            type:'post',
                            beforeSend: function () {
                                layers.load(function (indexs) {
                                    loading = indexs;
                                });
                            },
                            success:function(data){
                                if(data.code == 1){
                                    layers.toast('产品出局成功');
                                    setTimeout(function(){
                                        main.getProductList();
                                    },300);
                                }else {
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
                                },50)
                            }
                        })
                    }
                });
            }
        },
    };
    var vm = new Vue({
        el: '#app',
        data: {
            filterData: {
                product_name: '', //产品名称
                product_person_leader: '', //产品负责人
                product_select_type: '', //产品查询类型
                product_create_time_start: '', //产品创建时间开始时间
                product_create_time_end: '', //产品创建时间结束时间
                product_start_time_start: '', //产品开始时间开始时间
                product_start_time_end: '', //产品开始时间结束时间
                product_end_time_start: '', //产品结束时间开始时间
                product_end_time_end: '', //产品结束时间结束时间
                product_status: '', //产品状态（0为全部,1为正常,2为已结束）
                curpage: 1, //当前页码,默认为1
                name:'create_time',//默认为创建时间排序
                type:'desc',//默认为降序
            },
            productsData: {}, //列表数据
        },
        methods: {
            inquire: function () { //查询操作
                main.inquire();
            },
            reset: function () { //重置操作
                main.reset();
            },
            sort: function ($event,name) {//排序
                main.sort($event,name)
            },
            delProduct:function(index,id){//删除某个产品
                main.delProduct(index,id);
            },
            outProduct:function(index,id){//结束产品
                main.outProduct(index,id);
            }
        }
    });
    var _init = function () {
        common.getTabLink();
        main.initLayui();
        main.getProductList();
    }
    _init();
})
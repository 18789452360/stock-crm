require(['layui', 'common', 'layers', 'tools', 'ajaxurl'], function (layui, common, layers, tool, ajaxurl) {
    var main = {
        /**
         * 获取数据 type 为空 获取所有的数据  1 获取新增操盘信息统计  2 操盘信息统计
         * @param data
         */
        getData:function(data){
            var obj = {};
            data ? obj = data : obj = {page:'1',type:'',date_start:'',date_end:'',page_size:10};
            var loading='';
            tool.ajax({
                url:ajaxurl.statistics.project,
                data:obj,
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success:function(data){
                    if(data.code == 1){//当返回的数据中有该模块的数据时，该模块的数据才会去加载变化
                        if(data.data.project || data.data.product_stock){
                            if(data.data.project.total > 0){
                                vm.showProduct = true;
                                Vue.nextTick(function(){
                                    main.productHighcharts('product','项目运营情况统计',data.data.project);
                                })
                            }
                            if(data.data.product_stock.total > 0){
                                vm.showProduct_stock = true;
                                Vue.nextTick(function(){
                                    main.productHighcharts('product-stock','标的运营情况统计',data.data.product_stock);
                                })
                            }
                        }
                        if(data.data.product_stock_transfer_position){//新增操盘信息统计
                            vm.addProduct_stock = data.data.product_stock_transfer_position;
                            if(vm.addProduct_stock.data && vm.addProduct_stock.data.length){
                                Vue.nextTick(function(){
                                    main.operateHighCharts();
                                    main.initLayui();
                                })
                            }
                        }
                        if(data.data.product_stock_transfer_position_statistics){//操盘信息统计
                            vm.statisticsInfo = data.data.product_stock_transfer_position_statistics;
                            main.operateInfoPage();
                        }
                    }else{
                        layers.toast(data.message);
                    }
                },
                error:function(){
                    layers.toast('网络异常');
                },
                complete:function(){
                    setTimeout(function(){
                        layers.closed(loading);
                    },200)
                },
            })
        },
        /**
         * 项目、标的运营情况饼状图
         * @param elem 该图所在的盒子 传该盒子id的字符串  string
         * @param title 该图的名字 string
         * @param data 该图的数据 obj
         */
        productHighcharts: function (elem,title,data) {
            Highcharts.chart(elem, {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                title: {
                    text: title,
                    style: {
                        fontWeight: 'bold'
                    }
                },
                tooltip: {//鼠标悬停的时候提示
                    headerFormat: '{series.name}<br>',
                    pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
                },
                colors: ['#F2493b', '#2883e0'],//设置显示的饼状颜色
                plotOptions: {//数据列表配置
                    pie: {//饼图
                        allowPointSelect: true,//是否允许选中点
                        cursor: 'pointer',
                        size:'90%',//饼状图大小，默认是 75%，
                        dataLabels: {
                            enabled: true,
                            /*format: '<b>{point.name}</b>: {point.y}',*/
                            formatter: function() {//当所占百分比为 0 时不显示边线及 0.0%
                                if (this.percentage > 0)
                                    return '<b>' + this.point.name + '</b>: ' + this.point.y; // 这里进行判断
                            },
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        },
                        showInLegend: true //显示下边图例
                    }
                },
                credits: {//去除版权信息
                    enabled: false,
                },
                series: [{
                    type: 'pie',
                    name: title,
                    data: [
                        {
                            name: '已结束',
                            y: data.stop,
                            sliced: true,
                            selected: true
                        },
                        {
                            name: '运作中',
                            y: data.starting,
                        },
                    ]
                }]
            })
        },
        /**
         * 新增操作数量折线图
         */
        operateHighCharts: function () {
            var xArr = [],
                yArr = [],
                len = vm.addProduct_stock.data.length;
            for(var i = 0;i<len;i++){
                xArr.push(vm.addProduct_stock.data[i].time_date + '');//转换成string类型
                yArr.push(vm.addProduct_stock.data[i].total - 0);//转换成number类型
            }
            xArr = xArr.reverse();
            yArr = yArr.reverse();
            Highcharts.chart('operate', {
                chart: {
                    type: 'spline'//配置线条是曲线还是折线
                },
                title: {
                    text: '操盘新增数量统计',
                    style: {
                        fontWeight: 'bold'
                    }
                },
                xAxis: {
                    categories: xArr
                },
                tooltip: {
                    headerFormat: '<b>当日操盘新增数量{point.y}</b><br />',
                    pointFormat: ''
                },
                credits: {//去除版权信息
                    enabled: false,
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                },
                plotOptions: {
                    spline: {
                        dataLabels: {
                            enabled: true          // 开启数据标签
                        },
                        enableMouseTracking: true, // 关闭鼠标跟踪，对应的提示框、点击事件会失效
                       // pointStart: 1//默认从1开始
                    }
                },
                series: [{
                    name: '新增数量',
                    data: yArr,
                }]
            })
        },
        /**
         * 分页器
         */
        operateInfoPage: function () {
            layui.use('laypage', function () {
                var laypage = layui.laypage
                laypage.render({
                    elem: 'stat-page', //注意，这里的 test1 是 ID，不用加 # 号
                    count: vm.statisticsInfo.total, //数据总数，从服务端得到
                    limit:vm.statisticsInfo.page_size,
                    curr: vm.statisticsInfo.page,
                    jump: function (obj, first) {
                        if (!first) {
                            vm.statisticsInfo.page = obj.curr;
                            var data = {
                                page:vm.statisticsInfo.page,
                                type:2,
                                page_size:10
                            }
                            main.getData(data);
                        }
                    }
                })
            })
        },
        /**
         * 初始化layui时间控件
         */
        initLayui: function () {
            layui.use('laydate', function () {
                var laydate = layui.laydate;
                laydate.render({//初始化开始时间
                    elem: '#operate_time_start',
                    done:function (value) {
                        vm.startTime = value;
                    }
                });
                laydate.render({//初始化结束时间
                    elem: '#operate_time_end',
                    done:function (value) {
                        vm.endTime = value;
                    }
                });
            })
        },
        /**
         * 查询新增操盘信息
         * @returns {boolean}
         */
        inquire:function(){
            if(!vm.startTime || !vm.endTime){
                layers.toast('请输入筛选时间');
                return false;
            }
            if(vm.startTime > vm.endTime){
                layers.toast('开始时间不能大于结束时间');
                return false;
            }
            var data = {type:1,date_start:vm.startTime,date_end:vm.endTime};
            main.getData(data);
        },
        /**
         * 重置查询新增操盘信息
         */
        reset:function(){
            vm.startTime = '';
            vm.endTime = '';
            var $input = $('input');
            $input.each(function(){
                $(this).val('');
            });
            var data = {type:1,date_start:'',date_end:''};
            main.getData(data);
        },
    }
    var vm = new Vue({
        el: '#app',
        data: {
            showProduct:false,//是否显示项目饼状图
            showProduct_stock:false,//是否显示标的饼状图
            addProduct_stock:{},//新增操盘信息统计
            statisticsInfo:{},//操盘信息统计
            startTime:'',//筛选的开始时间
            endTime:'',//筛选的结束时间
        },
        methods: {
            inquire:function(){//查询操作
                main.inquire();
            },
            reset:function(){//重置操作
                main.reset();
            },
        }
    })
    var _init = function () {
        common.getTabLink()
        main.getData();
    }
    _init()
})
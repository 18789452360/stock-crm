require(['layui', 'common', 'layers', 'tools', 'ajaxurl'], function (layui, common, layers, tool, ajaxurl) {
    var main = {
        /**
         * Highcharts图
         */
        setHighcharts: function () {
            //项目运营情况
            Highcharts.chart('product', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                title: {
                    text: '项目运营情况统计',
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
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.y}',
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
                    name: '项目运营情况统计',
                    data: [
                        {
                            name: '已结束',
                            y: 31,
                            sliced: true,
                            selected: true
                        },
                        {
                            name: '运作中',
                            y: 12
                        },
                    ]
                }]
            })
            //标的运营情况
            Highcharts.chart('product-stock', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    verticalAlign: top,
                },
                title: {
                    text: '标的运营情况统计',
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
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.y}',
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
                    name: '标的运营情况统计',
                    data: [
                        {
                            name: '已出局',
                            y: 31,
                            sliced: true,
                            selected: true
                        },
                        {
                            name: '运作中',
                            y: 12
                        },
                    ]
                }]
            })
        },
        /**
         * 新增操作数量折线图
         */
        operateHighCharts: function () {
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
                    tickInterval: 1,
                },
                tooltip: {
                    headerFormat: '<b>操盘新增数量</b><br />',
                    pointFormat: 'x = {point.x}, y = {point.y}'
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
                        pointStart: 1//默认从1开始
                    }
                },
                series: [{
                    name: '新增数量',
                    data: [10, 7, 6, 9, 14, 18, 21, 25, 26, 23, 18, 13, 9, 20, 10, 15, 9, 18, 25, 23, 29, 30, 5, 25, 15, 16, 9, 21, 29, 8],
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
                    count: 20, //数据总数，从服务端得到
                    curr: 1,
                    jump: function (obj, first) {
                        if (!first) {

                        }
                    }
                })
            })
        },
        /**
         * 初始化layui
         */
        initLayui: function () {
            layui.use('laydate', function () {
                var laydate = layui.laydate
                laydate.render({//初始化开始时间
                    elem: '#operate_time_start',
                    type: 'datetime'
                })
                laydate.render({//初始化结束时间
                    elem: '#operate_time_end',
                    type: 'datetime'
                })
            })
        }
    }
    var vm = new Vue({
        el: '#app',
        data: {},
        methods: {}
    })
    var _init = function () {
        common.getTabLink()
        main.setHighcharts()
        main.operateInfoPage()
        main.operateHighCharts()
        main.initLayui()
    }
    _init()
})
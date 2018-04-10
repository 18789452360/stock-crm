require(['moment', 'layui', 'common', 'ajaxurl', 'tools', 'layers', 'page'], function (moment, layui, common, ajaxurl, tools, layers, page) {

    var main = {
        /**
         * 搜索表单
         */
        searchForm: function () {
            var _this = this;
            layui.use(['form'], function () {
                var form = layui.form;
                form.on('submit(formSearchAll)', function (data) {
                    vm.searchContent = data.field.title.trim();
                    _this.getLogList('', vm.searchContent, function () {
                        _this.setListPage();
                    });
                    return false;
                });
            })
        },
        /**
         * 渲染筛选条件--自定义时间选择器
         */
        renderLayDate: function () {
            layui.use('laydate', function () {
                var laydate = layui.laydate;
                for (var i = 0, len = vm.condition.length; i < len; i++) {
                    laydate.render({
                        elem: '.lay-date-a-' + i,
                        done: function (value) {
                            vm.inputTimeA = value;
                        }
                    });
                    laydate.render({
                        elem: '.lay-date-b-' + i,
                        done: function (value) {
                            vm.inputTimeB = value;
                        }
                    })
                }
            });
        },
        /**
         * 返回时间段 {Array}: 今天/昨天/最近7天/最近30天
         */
        timeArea: function () {
            return {
                today: [moment().format('YYYY-MM-DD')],
                yesterday: [moment().subtract(1, 'days').format('YYYY-MM-DD')],
                recent7day: [moment().subtract(6, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
                recent30day: [moment().subtract(29, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
            };
        },
        /**
         * 获取从操作日志列表
         */
        getLogList: function (page, search, callback) {
            tools.ajax({
                url: ajaxurl.material.logList,
                data: {
                    type: vm.logCondition.type,
                    operate_real_name: search || '',
                    start_time: vm.logCondition.start_time,
                    end_time: vm.logCondition.end_time,
                    pagesize: vm.pagesize,
                    curpage: page || 1
                },
                type: 'post',
                success: function (res) {
                    if (res.code === 1) {
                        vm.logList = res.data.list;
                        vm.logListTotal = res.data.all_num;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 处理文档页分页
         */
        setListPage: function () {
            var _this = this;
            page.init({
                elem: 'page',
                count: vm.logListTotal,// 总条数
                limit: vm.pagesize,// 每页多少条
                jump: function (obj, flag) {
                    if (!flag) {
                        $('.main-wrap').animate({scrollTop: 0}, 200);
                        var curPage = obj.curr;
                        _this.getLogList(curPage);
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
            searchContent: '', // 搜索内容
            pagesize: 10,// 每页显示多少条
            logList: [], //日志记录
            logListTotal: '', //日志总条数
            logCondition: {// 筛选条件
                type: '',// 操作类型
                start_time: '',
                end_time: ''
            },
            condition: [{name: '操作时间', show: false, active: false}],
            conditionStr: ['操作时间'],
            conditionTime: ['今天', '昨天', '最近7天', '最近30天'],
            inputTimeA: '',
            inputTimeB: ''
        },
        methods: {
            // 选择操作类型
            checkOpType: function (e, id) {
                this.logCondition.type = id;

                var $curTarget = $(e.target);
                var $list = $curTarget.parent().parent();
                $list.find('a').each(function () {
                    $(this).removeClass('tag-active');
                });
                $curTarget.addClass('tag-active');
            },
            // 备注不限
            notLimitedRemark: function (e) {
                this.logCondition.type = '';
                var $curTarget = $(e.target);
                var $ul = $(e.target).parent().parent();
                $ul.find('a').each(function () {
                    $(this).removeClass('tag-active');
                });
                $curTarget.addClass('tag-active');
            },
            // 显示筛选条件框
            showCondition: function (index) {
                var _this = this;
                this.condition.forEach(function (item, i) {
                    if (i !== index) {
                        _this.condition[i].show = false;
                    }
                });
                this.condition[index].show = !this.condition[index].show;
            },
            // 不限
            noCondition: function (e, index) {
                this.condition[index].show = false;
                $(e.target).parent().find('a').each(function () {
                    $(this).removeClass('active');
                });
                vm.condition[index].name = vm.conditionStr[index];
                this.condition[index].active = false;

                this.logCondition.start_time = '';
                this.logCondition.end_time = '';

                $('.lay-date-a-' + index).val('');
                $('.lay-date-b-' + index).val('');
            },
            // 设置快速筛选时间
            setCondition: function (e, index, type) {
                $(e.target).parent().find('a').each(function () {
                    $(this).removeClass('active');
                });
                if (type) {// 自定义
                    $(e.target).addClass('active');
                } else {
                    this.condition[index].show = false;
                    this.condition[index].active = true;
                    vm.condition[index].name = vm.conditionStr[index];
                    vm.condition[index].name += '：' + $(e.target).text();

                    // 筛选时间
                    switch ($(e.target).text()) {
                        case vm.conditionTime[0]:// 今天
                            this.logCondition.start_time = main.timeArea().today[0];
                            this.logCondition.end_time = main.timeArea().today[0];
                            break;
                        case vm.conditionTime[1]:// 昨天
                            this.logCondition.start_time = main.timeArea().yesterday[0];
                            this.logCondition.end_time = main.timeArea().yesterday[0];
                            break;
                        case vm.conditionTime[2]:// 最近7天
                            this.logCondition.start_time = main.timeArea().recent7day[0];
                            this.logCondition.end_time = main.timeArea().recent7day[1];
                            break;
                        case vm.conditionTime[3]:// 最近30天
                            this.logCondition.start_time = main.timeArea().recent30day[0];
                            this.logCondition.end_time = main.timeArea().recent30day[1];
                            break;
                    }
                }
            },
            // 添加自定义筛选时间
            addConditons: function (e, index) {
                // 时间范围验证
                if ((new Date(vm.inputTimeB) - new Date(vm.inputTimeA)) < 0) {
                    layers.toast('开始时间不能大于结束时间', {time: 2500});
                } else {
                    var domValA = $('.lay-date-a-' + index).val();
                    var domValB = $('.lay-date-b-' + index).val();
                    // 添加自定义时间
                    if (domValA && domValB) {
                        vm.inputTimeA = domValA;
                        vm.inputTimeB = domValB;
                        // 关闭筛选框
                        vm.condition[index].show = false;
                        vm.condition[index].active = true;
                        vm.condition[index].name = vm.conditionStr[index];
                        vm.condition[index].name += ('：' + vm.inputTimeA + '到' + vm.inputTimeB);
                        // 设置自定义时间
                        this.logCondition.start_time = this.inputTimeA;
                        this.logCondition.end_time = this.inputTimeB;
                    } else {
                        layers.toast('请填入自定义时间范围');
                    }
                }
            }
        },
        watch: {
            logCondition: {
                handler: function (val, oldVal) {
                    main.getLogList('', '', function () {
                        main.setListPage();
                    });
                },
                deep: true
            },
            searchContent: function (val, oldVal) {
                !val && main.getLogList('','', function () {
                    main.setListPage();
                });
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.getLogList('', '', function () {
            main.setListPage();
        });
        main.renderLayDate();
        main.searchForm();
        common.getTabLink();
    };
    _init();
});
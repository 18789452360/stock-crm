require(['moment', 'layui', 'common', 'ajaxurl', 'tools', 'layers'], function (moment, layui, common, ajaxurl, tool, layers) {

    var main = {
        /**
         * 财务审核列表
         */
        getWaitList: function (callback) {
            tool.ajax({
                url: ajaxurl.examine.examine_list,
                type: 'post',
                data: {
                    keywords: '',
                    pagesize: 10, // 每页显示条数
                    curpage: 1 // 当前页
                },
                success: function (result) {
                    if (result.code === 1) {
                        vm.tableDataAll = result.data.list;
                        vm.getWaitListTotal = result.data.all_num;

                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(result.message);
                    }
                }
            });
        },
        /**
         * 搜索表单
         */
        searchForm: function () {
            layui.use(['form'], function () {
                var form = layui.form;
                form.on('submit(formSearchAll)', function (data) {
                    vm.contractConditon.keywords = data.field.title;
                    vm.contractConditon.curpage = 1;
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
         * 搜索框着色变蓝
         */
        searchBlur: function (event) {
            var lightVal = event.target.value;
            if (lightVal !== '') {
                $(event.target).addClass("inputlight");
                $(event.target).siblings("button").addClass("buttonlight");
            } else {
                $(event.target).removeClass("inputlight");
                $(event.target).siblings("button").removeClass("buttonlight");
            }
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            tableDataAll: [], //待审核合同列表
            tableDataWait: [], //全部处理记录
            contractConditon: {// 全部筛选条件
                compliance_status: '',
                start_time: '',
                end_time: '',
                post_start_time: '',
                post_end_time: '',
                pagesize: 10,
                curpage: 1
            },
            conditionStr: ['合规状态', '操作时间', '审核状态'],
            conditionTime: ['今天', '昨天', '最近7天', '最近30天', '已合规', '未合规', '待审核', '审核通过', '审核拒绝'],
            condition: [
                {name: '合规状态', show: false, active: false},
                {name: '操作时间', show: false, active: false},
                {name: '审核状态', show: false, active: false}
            ],
            inputTimeA: '',
            inputTimeB: ''
        },
        methods: {
            // 全选所有
            checkAllUsr: function () {
                var _this = this;
                if (this.allChecked) {// 全选了
                    // 遍历当前用户数组, 添加到已选择中
                    if (this.checkedIdArr.length) {
                        this.tableDataWait.forEach(function (item) {
                            if (_this.checkedIdArr.indexOf(item.cooper_id) === -1) {
                                _this.checkedIdArr.push(item.cooper_id);
                            }
                        })
                    } else {
                        // 已选择中为空
                        this.tableDataWait.forEach(function (item) {
                            _this.checkedIdArr.push(item.cooper_id);
                        })
                    }
                } else {
                    _this.checkedIdArr = [];
                }
            },
            // 选择单个
            checkUsr: function (checkId) {
                var _this = this;
                if (this.checkedIdArr.indexOf(checkId) === -1) {
                    this.checkedIdArr.push(checkId);
                } else {
                    this.checkedIdArr.forEach(function (item, index) {
                        item === checkId && _this.checkedIdArr.splice(index, 1);
                    });
                }
            },
            // 选择备注
            checkRemark: function (e, id) {
                var _this = this;
                $(e.target).toggleClass('tag-active');
                if (this.checkedMarkList.indexOf(id) === -1) {
                    this.checkedMarkList.push(id);
                } else {
                    this.checkedMarkList.forEach(function (item, index) {
                        item === id && _this.checkedMarkList.splice(index, 1);
                    })
                }
                this.contractConditon.mark_id = this.checkedMarkList.join(',');
            },
            // 备注不限
            notLimitedRemark: function (e) {
                this.checkedMarkList = [];
                this.contractConditon.mark_id = '';
                var ul = $(e.target).parent().parent();
                $(ul).find('a').each(function () {
                    $(this).removeClass('tag-active');
                })
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
                switch (index) {
                    case 0:// 合规状态
                        vm.contractConditon.compliance_status = '';
                        break;
                    case 1:// 移交时间
                        vm.contractConditon.start_time = '';
                        vm.contractConditon.end_time = '';
                        break;
                    case 2:// 审核状态
                        vm.contractConditon.status = '';
                        break;
                    default:
                }
                $('.lay-date-a-' + index).val('');
                $('.lay-date-b-' + index).val('');
            },
            // 设置快速筛选时间
            setCondition: function (e, index, customer) {
                vm.contractConditon.curpage = 1;
                $(e.target).parent().find('a').each(function () {
                    $(this).removeClass('active');
                });
                if (customer) {// 自定义
                    $(e.target).addClass('active');
                } else {
                    this.condition[index].show = false;
                    this.condition[index].active = true;
                    vm.condition[index].name = vm.conditionStr[index];
                    vm.condition[index].name += '：' + $(e.target).text();
                    var quicklyTime = [];
                    switch ($(e.target).text()) {
                        case vm.conditionTime[0]:
                            quicklyTime = main.timeArea().today;
                            break;
                        case vm.conditionTime[1]:
                            quicklyTime = main.timeArea().yesterday;
                            break;
                        case vm.conditionTime[2]:
                            quicklyTime = main.timeArea().recent7day;
                            break;
                        case vm.conditionTime[3]:
                            quicklyTime = main.timeArea().recent30day;
                            break;
                        case vm.conditionTime[4]:// 待处理
                            vm.contractConditon.compliance_status = 1;
                            break;
                        case vm.conditionTime[5]:// 审核通过
                            vm.contractConditon.compliance_status = 2;
                            break;
                        case vm.conditionTime[6]:// 待处理
                            vm.contractConditon.status = 'dzjsh';
                            break;
                        case vm.conditionTime[7]:// 审核通过
                            vm.contractConditon.status = 'zjytg';
                            break;
                        case vm.conditionTime[8]:// 审核拒绝
                            vm.contractConditon.status = 'zjyjj';
                            break;
                        default:
                    }
                    switch (index) {
                        case 1:// 移交时间
                            vm.contractConditon.start_time = quicklyTime[0];
                            vm.contractConditon.end_time = quicklyTime[1];
                            break;
                        case 2:// 合同邮寄时间
                            vm.contractConditon.post_start_time = quicklyTime[0];
                            vm.contractConditon.post_end_time = quicklyTime[1];
                            break;
                        default:
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
                        switch (index) {
                            case 1:// 移交时间
                                vm.contractConditon.start_time = this.inputTimeA;
                                vm.contractConditon.end_time = this.inputTimeB;
                                break;
                            case 2:// 合同邮寄时间
                                vm.contractConditon.post_start_time = this.inputTimeA;
                                vm.contractConditon.post_end_time = this.inputTimeB;
                                break;
                            default:
                        }
                    } else {
                        layers.toast('请填入自定义时间范围');
                    }
                }
            },
            // 搜索框样式
            searchBlur: function (event) {
                main.searchBlur(event);
            }
        },
        computed: {
            // 全选
            allChecked: {
                get: function () {
                    if (this.tableDataWait.length) {
                        return this.checkedCount === this.tableDataWait.length;
                    }
                },
                set: function (value) {
                    this.tableDataWait.forEach(function (item) {
                        item.checked = value
                    });
                    return value;
                }
            },
            // 计算选中个数
            checkedCount: {
                get: function () {
                    var i = 0;
                    this.tableDataWait.forEach(function (item) {
                        if (item.checked === true) i++;
                    });
                    return i;
                }
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.renderLayDate();
        main.searchForm();
        main.getWaitList();
        common.getTabLink();
    };
    _init();
});
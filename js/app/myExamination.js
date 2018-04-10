/**
/**
 * Created by Administrator on 2017-10-12.
 * 我的审批
 */
require(['moment', 'layui', 'layers', 'common', 'tools', 'ajaxurl'], function (moment, layui, layers, common, tools, ajaxurl) {

    var main = {
        /**
         * 加载页面显示tab
         */
        initTab:function() {
            layui.use(['form', 'element'],function() {
                var form = layui.form,
                    element = layui.element;
            });
            // 获取路由参数sms_type的值
            var urls = tools.getUrlArgs(), smsType = '';
            if(urls.has){
                smsType = urls.data.sms_type;
            }
            var tabInit = $(".init-tab").find("li"),
                contentInit = $(".init-content").find(".content-list");
            // 如果路由有sms_type参数,跳转到对应的tab
            if(smsType) {
                tabInit.each(function() {
                    if($(this).attr("data-id") == smsType) {
                        $(this).addClass("layui-this");
                    }
                });
                contentInit.each(function() {
                    if($(this).attr("data-id") == smsType) {
                        $(this).addClass("layui-show");
                    }
                });
            } else { // 否则加载第一个tab
                for(var i = 0; i < tabInit.length; i ++) {
                    $(tabInit[0]).addClass("layui-this");
                }
                for(var j = 0; j < contentInit.length; j ++) {
                    $(contentInit[0]).addClass("layui-show");
                }
            }


        },
        /**
         * [getMeList description] 获取我提交的审批
         * @param  {[type]} keywords [description]
         * @return {[type]}          [description]
         */
        getMeList: function () {
            var loading = '';
            tools.ajax({
                url: ajaxurl.examination.mysubmit,
                data: vm.dataMe,
                type: 'post',
                beforeSend: function() {
                    layers.load(function(indexs) {
                        loading = indexs
                    })
                },
                success: function (result) {
                    if (result.code == 1) {
                        vm.tableDataMe = result.data.list;
                        vm.tableDataAllPower = result.data.power;
                        // 获取总条数
                        vm.getMeListTotal = result.data.all_num;
                        // 调用分页
                        main.getMePage();
                    } else {
                        layers.toast(result.message);
                    }
                },
                error: function(){
                    layers.toast("网络异常!");
                },
                complete:function(){
                    setTimeout(function(){
                        layers.closed(loading);
                    },200)
                },
            })
        },
        /**
         * [getAllList description] 获取全部审批
         * @return {[type]} [description]
         */
        getAllList: function (page, callback) {
            var loading = '';
            page = page || 1;
            tools.ajax({
                url: ajaxurl.examination.alllist,
                data: {
                    keywords: vm.keywords,
                    mark_id: vm.contractConditon.mark_id,
                    status: vm.contractConditon.status,
                    start_time: vm.contractConditon.start_time,
                    end_time: vm.contractConditon.end_time,
                    pay_type: vm.contractConditon.pay_type,
                    pagesize: vm.contractConditon.pagesize || 10,
                    curpage: vm.contractConditon.curpage || 1
                },
                beforeSend: function() {
                    layers.load(function(indexs) {
                        loading = indexs
                    })
                },
                success: function (result) {
                    if (result.code == 1) {
                        vm.tableDataAll = result.data.list;
                        vm.tableDataAllPower = result.data.power;
                        // 获取总条数
                        vm.getAllListTotal = result.data.all_num;
                        // 调用分页
                        main.getAllPage();
                    } else {
                        layers.toast(result.message);
                    }
                    layers.closed(loading);
                },
                error: function(){
                    layers.toast("网络异常!");
                    layers.closed(loading);
                }
            })
        },
        /**
         * [getAllList description] 获取待我修改的审批
         * @return {[type]} [description]
         */
        getWaitList: function () {
            var loading = '';
            tools.ajax({
                url: ajaxurl.examination.mymodify,
                data: vm.dataWait,
                beforeSend: function() {
                    layers.load(function(indexs) {
                        loading = indexs
                    })
                },
                success: function (result) {
                    if (result.code == 1) {
                        vm.tableDataWait = result.data.list;
                        vm.tableDataAllPower = result.data.power;
                        // 获取总条数
                        vm.getWaitListTotal = result.data.all_num;
                        // 调用分页
                        main.getWaitPage();
                    } else {
                        layers.toast(result.message);
                    }
                    layers.closed(loading);
                },
                error: function(){
                    layers.toast("网络异常!");
                    layers.closed(loading);
                }
            })
        },
        /**
         * 模糊查询
         */
        initProject: function () {
            /* 实例化日期,表格 */
            layui.use(['form'], function () {
                var form = layui.form;
                //监听我的提交审批 搜索
                form.on('submit(formSearchMe)', function (data) {
                    vm.dataMe.my_keywords = data.field.title;
                    vm.dataMe.curpage = 1;
                    main.getMeList();
                    return false;
                });
                //监听全部审批 搜索
                form.on('submit(formSearchAll)', function (data) {
                    vm.keywords = data.field.title;
                    vm.contractConditon.curpage = 1;
                    main.getAllList();
                    return false;
                });
            });
        },
        /**
         * 选择现有群组(单选)
         */
        deleteName: function () {
            var $commonTable = $(".common-table tr input:checked"),
                group_id = '';
            $commonTable.each(function () {
                var dataID = $(this).attr("data-id");
                group_id += (dataID + ",");
            });
            group_id = group_id.substring(0, group_id.length - 1);
            if(group_id == '') {
                layers.toast("请选择要删除的合作情况");
                return;
            }
            layers.confirm({
                title: '操作提示！',
                area: ['450px', '250px'],
                content: '<div class="confirm-tips"><p>删除后无法修复，确认删除？</p></div>',
                btn2: function (index, layero) {
                    tools.ajax({
                        url: ajaxurl.examination.delcooper,
                        data: {cooper_id: group_id},
                        success: function (result) {
                            if (result.code == 1) {
                                layers.toast(result.message);
                                setTimeout(function () {
                                    window.location.reload();
                                }, 1000)
                            } else {
                                layers.toast(result.message);
                            }
                        }
                    })
                }
            });
        },
        /**
         * 分页 (我提交的审批)
         */
        getMePage: function () {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'test1',
                    count: vm.getMeListTotal,   // 数据总数
                    limit: vm.dataMe.pagesize,      // 每页显示条数
                    curr: vm.dataMe.curpage,         // 当前页数
                    jump: function (obj, first) {
                        if (!first) {
                            vm.dataMe.pagesize = obj.limit;    // 获取每页显示条数
                            vm.dataMe.curpage = obj.curr;      // 获取当前页
                            main.getMeList();           // 发送请求
                        }
                    }
                });
            });
        },
        /**
         * 分页 (全部审批)
         */
        getAllPage: function () {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'test2',
                    count: vm.getAllListTotal, // 数据总数
                    limit: vm.contractConditon.pagesize,        // 每页显示条数
                    curr: vm.contractConditon.curpage,     // 当前页数
                    jump: function (obj, first) {
                        if (!first) {
                            vm.contractConditon.pagesize = obj.limit;    // 获取每页显示条数
                            vm.contractConditon.curpage = obj.curr;      // 获取当前页
                            $("input[name='check']").prop('checked', false);
                            $("input[name='checks']").prop('checked', false);
                            //main.getAllList();           // 发送请求
                        }
                    }
                });
            });
        },
        /**
         * 分页 (待我修改的审批)
         */
        getWaitPage: function () {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'test3',
                    count: vm.getWaitListTotal    // 数据总数
                    , limit: vm.dataWait.pagesize         // 每页显示条数
                    , curr: vm.dataWait.curpage           // 当前页数
                    , jump: function (obj, first) {
                        if (!first) {
                            vm.dataWait.pagesize = obj.limit;    // 获取每页显示条数
                            vm.dataWait.curpage = obj.curr;      // 获取当前页
                            main.getWaitList();           // 发送请求
                        }
                    }
                });
            });
        },
        /**
         * 点击切换分页
         */
        pageNumMe: function (event) {
            $(event.target).addClass("active");
            $(event.target).parent("li").siblings("li")
                .children("a").removeClass("active");
            vm.dataMe.pagesize = $(event.target).html();
            vm.dataMe.curpage = 1;
            main.getMeList();
        },
        pageNumAll: function (event) {
            $(event.target).addClass("active");
            $(event.target).parent("li").siblings("li")
                .children("a").removeClass("active");
            vm.contractConditon.pagesize = $(event.target).html();
            vm.contractConditon.curpage = 1;
            //main.getAllList();
        },
        pageNumWait: function (event) {
            $(event.target).addClass("active");
            $(event.target).parent("li").siblings("li")
                .children("a").removeClass("active");
            vm.dataWait.pagesize = $(event.target).html();
            vm.dataWait.curpage = 1;
            main.getWaitList();
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
         * 设置时间范围 Helper
         */
        /**
         * 返回时间段, 返回 {Array}: 今天/昨天/最近7天/最近30天
         */
        timeArea: function () {
            return {
                today: [moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
                yesterday: [moment().subtract('days',1).format('YYYY-MM-DD'), moment().subtract('days',1).format('YYYY-MM-DD')],
                recent7day: [moment().subtract('days',7).format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
                recent30day: [moment().subtract('days',30).format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
            };
        },
        /**
         * [getMarkList description] 获取备注列表
         * @return {[type]} [description]
         */
        getMarkList: function () {
            if (vm.userinfo) {
                tools.ajax({
                    url: ajaxurl.remarks.index,
                    data: {
                        employee_id: vm.userinfo.id
                    },
                    type: 'get',
                    success: function (result) {
                        if (result.code === 1) {
                            vm.markList = result.data.list;
                        } else {
                            layers.toast(result.message);
                        }
                    }
                })
            }
        },
        /**
         * 获取标签和备注
         */
        getTagMark: function () {
            tools.ajax({
                url: ajaxurl.customer.getListTagMark,
                data: {},
                success: function (res) {
                    if (res.code === 1) {
                        // 备注 && 标签
                        vm.remarkList = res.data.marklist;
                        //vm.tagList = res.data.taglist;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 添加备注询问框
         */
        addRemark: function () {
            layers.open({
                btn: null,
                title: '添加备注',
                area: ['604px', 'auto'],
                content: addRemark,
                success: function (layero, index) {
                    var $layero = $(layero);
                    var addedId = [];
                    // 渲染备注标签
                    $layero.find('.tag-group').html(template('addRemark', {data: vm.remarkList}));
                    $layero.find('.remark-tip span').text(vm.checkedIdArr.length);
                    $layero.on('click', '.list-item', function (e) {
                        $(e.target).toggleClass('active');
                        var remarkId = $(e.target).data('id');
                        // 有则删除, 无则添加
                        if (addedId.indexOf(remarkId) === -1) {
                            addedId.push(remarkId);
                        } else {
                            addedId.forEach(function (item, index) {
                                item === remarkId && addedId.splice(index, 1);
                            });
                        }
                    });
                    // 全选 && 取消全选
                    $layero.find('.un-checkall-btn').click(function () {
                        addedId = [];
                        $('.list-item').each(function () {
                            $(this).removeClass('active');
                        });
                    });
                    $layero.find('.checkall-btn').click(function () {
                        vm.remarkList.forEach(function (item) {
                            addedId.push(item.id);
                        });
                        $('.list-item').each(function () {
                            $(this).addClass('active');
                        });
                    });
                    // 取消 && 确定
                    $layero.find('.cancel').click(function () {
                        layers.closed(index);
                    });
                    $layero.find('.ok').click(function () {
                        var customerId = vm.checkedIdArr.join(',');
                        tools.ajax({
                            url: ajaxurl.customer.addRemark,
                            data: {
                                mark_id: addedId.join(','),
                                customer_id: customerId // 用户id
                            },
                            success: function (res) {
                                if (res.code === 1) {
                                    layers.toast('添加成功！');
                                    layers.closed(index);
                                } else {
                                    layers.toast(res.message);
                                }
                            }
                        });
                    });
                }
            });
        },
        /**
         * 监听checkbox的变化
         */
        checkChange: function () {
            // 监听全选框的状态
            $(".checkAll").click(function () {
                var checked = $(this).prop('checked'),
                    childInput = $("input[name='check']");
                if (checked) {
                    childInput.prop("checked", true);
                } else {
                    childInput.prop("checked", false);
                }
            });
            // 监听子选择框的状态
            $(".wait-table").on("click", '.child-input', function () {
                var checkedAll = $(".checkAll"),
                    allInput = $("input[name='check']").length,
                    sInput = $("input[name='check']:checked").length;
                if (sInput < allInput) {
                    checkedAll.prop('checked', false);
                } else {
                    checkedAll.prop('checked', true);
                }
            })
        },
        /**
         * 搜索框
         */
        searchBlur: function(event) {
            var lightVal = event.target.value;
            if(lightVal != '') {
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
            getMeListTotal: '',

            userinfo: common.getUserInfo(), //获取用户信息
            markList: [], //备注列表
            checkedMarkList: [], //已选备注 id
            tableDataMe: [],
            tableDataAll: [], //待审核合同列表
            tableDataAllPower: '',
            tableDataWait: [], //全部处理记录
            tableDataWaitTotalNum: '', //全部处理记录总条数
            tableDataWaitPagesize: 10, //全部处理记录总页数
            remarkList: [],
            checkedIdArr: [], // 已选中的用户
            keywords: '',// 搜索
            contractConditon: {// 全部筛选条件
                mark_id: '', //备注id
                status: '',// 状态 待处理1、己邮寄2、己签订3
                start_time: '',
                end_time: '',
                pay_type: '',
                pagesize: 10,
                curpage: 1
            },
            dataMe: {
                my_keywords: '',
                pagesize: 10, // 每页显示条数
                curpage: 1 // 当前页
            },
            dataWait: {
                pagesize: 10, // 每页显示条数
                curpage: 1 // 当前页
            },
            conditionStr: ['审核状态', '移交时间', '支付方式'],
            conditionTime: ['今天', '昨天', '最近7天', '最近30天', '待财务审核', '待质检审核', '质检转投诉', '待合同审核', '合同待签订', '合同待审核', '合同待修改', '待回访审核', '回访转投诉', '签单审核待修改', '线上支付', '线下支付'],
            condition: [
                {name: '审核状态', show: false, active: false},
                {name: '移交时间', show: false, active: false},
                {name: '支付方式', show: false, active: false}
            ],
            inputTimeA: '',
            inputTimeB: '',
            getWaitListTotal: '',
            getAllListTotal: '',
            pagesize: '',
            curpage: '',
            pageNum: ''
        },
        methods: {
            //删除客户
            deleteName: function () {
               main.deleteName();
            },
            pageNumMe: function (event, index) {
                this.active = index;
                main.pageNumMe(event);
            },
            // 全部
            pageNumAll: function (event) {
                main.pageNumAll(event);
            },
            // 待
            pageNumWait: function (event) {
                main.pageNumWait(event);
            },

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
                    case 0:// 审核状态
                        vm.contractConditon.status = '';
                        break;
                    case 1:// 移交时间
                        vm.contractConditon.start_time = '';
                        vm.contractConditon.end_time = '';
                        break;
                    case 2:// 支付方式
                        vm.contractConditon.pay_type = '';
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
                        case vm.conditionTime[4]:// 待财务审核
                            vm.contractConditon.status = "dcwsh";
                            break;
                        case vm.conditionTime[5]:// 待质检审核
                            vm.contractConditon.status = "dzjsh";
                            break;
                        case vm.conditionTime[6]:// 质检转投诉
                            vm.contractConditon.status = "zjzts";
                            break;
                        case vm.conditionTime[7]:// 待合同审核
                            vm.contractConditon.status = "dhtsh";
                            break;
                        case vm.conditionTime[8]:// 合同待签订
                            vm.contractConditon.status = "dhtqd";
                            break;
                        case vm.conditionTime[9]:// 合同待审核
                            vm.contractConditon.status = "htdsh";
                            break;
                        case vm.conditionTime[10]:// 合同待修改
                            vm.contractConditon.status = "htdxg";
                            break;
                        case vm.conditionTime[11]:// 待回访审核
                            vm.contractConditon.status = "dhfsh";
                            break;
                        case vm.conditionTime[12]:// 回访转投诉
                            vm.contractConditon.status = "hfzts";
                            break;
                        case vm.conditionTime[13]:// 签单审核待修改
                            vm.contractConditon.status = "qdshdxg";
                            break;
                        case vm.conditionTime[14]:// 线上支付
                            vm.contractConditon.pay_type = 1;
                            break;
                        case vm.conditionTime[15]:// 线下支付
                            vm.contractConditon.pay_type = 2;
                            break;
                        default:
                    }
                    switch (index) {
                        case 1:// 移交时间
                            vm.contractConditon.start_time = quicklyTime[0];
                            vm.contractConditon.end_time = quicklyTime[1];
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
            searchBlur: function(event) {
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
        },
        watch: {
            // 深度监控筛选条件变动则更新数据
            contractConditon: {
                handler: function (val, newVal) {
                    main.getAllList();
                },
                deep: true
            }
        }
    });
    /**
     * 初始化
     * @private
     */
    var _init = function () {
        common.getTabLink();
        main.initTab();
        main.getMeList();

        console.clear();
        main.renderLayDate();
        main.initProject();
        common.getTabLink();
        main.getWaitList();
        main.getAllList(main.setPage2);
        // main.getMarkList();
        // main.getTagMark();
        main.checkChange();
    };
    _init();
});

/**
 * Created by Administrator on 2017-10-13.
 */
require(['moment', 'layui', 'common', 'ajaxurl', 'tools', 'layers', 'text!/assets/popup/finance-audit.html'], function (moment, layui, common, ajaxurl, tool, layers, financeAudit) {

    var main = {
        /**
         * 加载页面显示tab
         */
        initTab:function() {
            layui.use(['form', 'element'],function() {
                var form = layui.form,
                    element = layui.element;
            });
            var tabInit = $(".init-tab").find("li"),
                contentInit = $(".init-content").find(".content-list");
            for(var i = 0; i < tabInit.length; i ++) {
                $(tabInit[0]).addClass("layui-this");
            }
            for(var j = 0; j < contentInit.length; j ++) {
                $(contentInit[0]).addClass("layui-show");
            }
        },
        /**
         * 关键词搜索
         */
        initProject: function () {
            layui.use(['laydate', 'form', 'element'], function () {
                var form = layui.form;
                //监听我的提交审批 搜索
                form.on('submit(formSearchWait)', function(data){
                    vm.dataWait.keywords = data.field.title;
                    vm.dataWait.curpage = 1;
                    main.getWaitList();
                    return false;
                });
                //监听全部审批 搜索
                form.on('submit(formSearchAll)', function(data){
                    vm.keywords = data.field.title;
                    vm.contractConditon.curpage = 1;
                    main.getAllList();
                    return false;
                });

            })
        },
        /**
         * 初始化待财务审核列表
         * @param keywords 关键字搜索
         */
        getWaitList: function(keywords) {
            var loading = '';
            // 待财务审核
            tool.ajax({
                url: ajaxurl.visit.list,
                type: 'post',
                data: vm.dataWait,
                beforeSend: function() {
                    layers.load(function(indexs) {
                        loading = indexs
                    })
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableDataAll = result.data.list;
                        vm.tableDataAllPower = result.data.power;
                        // 获取总条数
                        vm.getWaitListTotal = result.data.all_num;
                        // 调用分页
                        main.getWaitPage();
                    }else{
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
            });
        },
        /**
         * 初始化全部审核列表
         * @param mark_id
         * @param status
         * @param start_time
         * @param end_time
         * @param keywords
         * @param pagesize
         * @param curpage
         */
        getAllList: function(page, callback) {
            var loading = '';
            page = page || 1;
            // 全部审核记录
            tool.ajax({
                url: ajaxurl.visit.record_list,
                type: 'post',
                data: {
                    keywords: vm.keywords,
                    mark_id: vm.contractConditon.mark_id,
                    status: vm.contractConditon.status,
                    contract_type: vm.contractConditon.contract_type,
                    contract_status: vm.contractConditon.contract_status,
                    start_time: vm.contractConditon.start_time,
                    end_time: vm.contractConditon.end_time,
                    post_start_time: vm.contractConditon.post_start_time,
                    post_end_time: vm.contractConditon.post_end_time,
                    pagesize: vm.contractConditon.pagesize,
                    curpage: vm.contractConditon.curpage
                },
                beforeSend: function() {
                    layers.load(function(indexs) {
                        loading = indexs
                    })
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableDataWait = result.data.list;
                        vm.tableDataAllPower = result.data.power;
                        // 获取总条数
                        vm.getAllListTotal = result.data.all_num;
                        // 调用分页
                        main.getAllPage();
                    }else{
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
            });
        },
        /**
         * [getMarkList description] 获取备注列表
         * @return {[type]} [description]
         */
        getMarkList: function(){
            if(vm.userinfo){
                tool.ajax({
                    url: ajaxurl.remarks.index,
                    data:{employee_id: vm.userinfo.id},
                    type: 'get',
                    success:function(result){
                        if(result.code == 1){
                            if(result.data.list != undefined){
                                vm.markList = result.data.list;
                            }
                        }else{
                            layers.toast(result.message);
                        }
                    }
                })
            }
        },
        /**
         * 分页 (全部)
         */
        getAllPage: function() {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'test2',
                    count: vm.getAllListTotal    // 数据总数
                    ,limit: vm.contractConditon.pagesize         // 每页显示条数
                    ,curr: vm.contractConditon.curpage           // 当前页数
                    ,jump: function (obj, first) {
                        if (!first) {
                            vm.contractConditon.pagesize = obj.limit;    // 获取每页显示条数
                            vm.contractConditon.curpage = obj.curr;      // 获取当前页
                            //main.getAllList();           // 发送请求
                        }
                    }
                });
            });
        },
        /**
         * 分页 (待)
         */
        getWaitPage: function() {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'test3',
                    count: vm.getWaitListTotal    // 数据总数
                    ,limit: vm.dataWait.pagesize         // 每页显示条数
                    ,curr: vm.dataWait.curpage           // 当前页数
                    ,jump: function (obj, first) {
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
        pageNumWait: function(event) {
            $(event.target).addClass("active");
            $(event.target).parent("li").siblings("li")
                .children("a").removeClass("active");
            vm.contractConditon.pagesize = $(event.target).html();
            vm.contractConditon.curpage = 1;
            //main.getAllList();
        },
        pageNumAll: function(event) {
            $(event.target).addClass("active");
            $(event.target).parent("li").siblings("li")
                .children("a").removeClass("active");
            vm.dataWait.pagesize = $(event.target).html();
            vm.dataWait.curpage = 1;
            main.getWaitList();
        },
        /**
         * 全部处理记录 分页处理 *************************************************************
         */
        setPage2: function () {
            page.init({
                elem: 'page2',
                count: Math.ceil(vm.tableDataWaitTotalNum / vm.tableDataWaitPagesize),
                jump: function (obj, flag) {
                    if (!flag) {
                        $('.main-wrap').animate({scrollTop: 0}, 300);
                        main.getAllList(obj.curr);
                    }
                }
            });
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
                tool.ajax({
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
            tool.ajax({
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
            userinfo: common.getUserInfo(), //获取用户信息
            markList: [], //备注列表
            checkedMarkList: [], //已选备注 id
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
                contract_type: '',
                contract_status: '',
                start_time: '',
                end_time: '',
                post_start_time: '',
                post_end_time: '',
                pagesize: 10,
                curpage: 1
            },
            dataWait: {
                keywords: '',
                pagesize: 10, // 每页显示条数
                curpage: 1 // 当前页
            },
            conditionStr: ['回访状态', '移交时间', '合同类型', '合同状态'],
            conditionTime: ['今天', '昨天', '最近7天', '最近30天', '待回访', '回访通过', '回访拒绝', '转投诉', '电子合同', '纸质合同', '待签订', '待审核', '待修改', '已签订', '已邮寄'],
            condition: [
                {name: '回访状态', show: false, active: false},
                {name: '移交时间', show: false, active: false},
                {name: '合同类型', show: false, active: false},
                {name: '合同状态', show: false, active: false}
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
            // 全部
            pageNumWait: function(event) {
                main.pageNumWait(event);
            },
            // 待
            pageNumAll: function(event) {
                main.pageNumAll(event);
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
                    case 0:// 回访状态
                        vm.contractConditon.status = '';
                        break;
                    case 1:// 移交时间
                        vm.contractConditon.start_time = '';
                        vm.contractConditon.end_time = '';
                        break;
                    case 2:// 合同类型
                        vm.contractConditon.contract_type = '';
                        break;
                    case 3:// 合同状态
                        vm.contractConditon.contract_status = '';
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
                            vm.contractConditon.status = 'dhfsh';
                            break;
                        case vm.conditionTime[5]:// 审核通过
                            vm.contractConditon.status = 'hfytg';
                            break;
                        case vm.conditionTime[6]:// 审核拒绝
                            vm.contractConditon.status = 'hfyjj';
                            break;
                        case vm.conditionTime[7]:// 待处理
                            vm.contractConditon.status = 'hfzts';
                            break;
                        case vm.conditionTime[8]:// 审核通过
                            vm.contractConditon.contract_type = 1;
                            break;
                        case vm.conditionTime[9]:// 审核拒绝
                            vm.contractConditon.contract_type = 2;
                            break;
                        case vm.conditionTime[10]:// 待处理
                            vm.contractConditon.contract_status = 'htdqd';
                            break;
                        case vm.conditionTime[11]:// 审核通过
                            vm.contractConditon.contract_status = 'htdsh';
                            break;
                        case vm.conditionTime[12]:// 审核拒绝
                            vm.contractConditon.contract_status = 'htdxg';
                            break;
                        case vm.conditionTime[13]:// 待处理
                            vm.contractConditon.contract_status = 'htyqd';
                            break;
                        case vm.conditionTime[14]:// 审核通过
                            vm.contractConditon.contract_status = 'htyyj';
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
        main.initTab();
        console.clear();
        main.renderLayDate();
        main.initProject();
        common.getTabLink();
        main.getWaitList();
        main.getAllList(main.setPage2);
        main.getMarkList();
    };
    _init();
});

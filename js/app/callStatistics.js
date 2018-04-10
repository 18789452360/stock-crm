/**
 * [description]  通话统计页面
 * @return {[type]}                [description]
 */
require(['common','layui','tools','ajaxurl', 'layers', 'page', 'moment','jquery.metisMenu'],function(common, layui, tools, ajaxurl, layers, page, moment){
    var main = {
        form: '',
        /**
         * 初始化全局树形菜单
         */
        sideMenu: function (callback) {
            Vue.nextTick(function () {
                $('#org-framework').metisMenu();
                typeof callback === 'function' && callback.call(this);
            })
        },
        /**
         * 组织架构输入框监听
         */
        createForm: function(){
            var that = this;
            layui.use(['form'], function () {
                var form = layui.form;
                //搜索 关键字
                form.on('submit(formSearch)', function(data){
                    vm.keywords = data.field.keywords;
                    that.getCallRecordAll();
                    return false;
                });
                that.form = form;
            });
        },
        /**
         * 获取通话列表
         * @param callback
         */
        getCallRecordAll: function(callback){
            var that = this;
            tools.ajax({
                url: ajaxurl.ivr.getCallRecordCount,
                type: 'post',
                data: {
                    find_employee_id: vm.employeeAndDep, //员工/部门,传员工的id,逗号分隔
                    s_start_time: vm.filterTime[0], //筛选时间/统计时间
                    e_start_time: vm.filterTime[1], //筛选时间/统计时间
                    order: vm.order,
                    asc: vm.sort,
                    pagesize: vm.page_limit || 20,
                    page: vm.page || 1 //分页参数
                },
                beforeSend: function(){
                    layers.load();
                },
                success: function(result){
                    if(result.code == 1){
                        if(result.data.list != undefined){
                            vm.callRecord = result.data.list;
                            vm.callRecordHead = result.data.head[0];
                            vm.callRecordHeadLength = result.data.head.length;

                            vm.total_num = result.data.total_number;
                            setTimeout(function() {
                                main.getAllPage();
                            },300)
                        }
                    }else{
                        layers.toast(result.message);
                    }
                },
                complete: function(){
                    layers.closedAll();
                }
            })
        },
        /**
         * 获取组织结构
         * @return {[type]} [description]
         */
        getdepartment: function(){
            var that = this;
            tools.ajax({
                url: ajaxurl.department.getdepartment,
                data: {},
                type: 'post',
                success: function(result){
                    if(result.code == 1){
                        vm.epartment = result.data;
                        that.sideMenu(function(){
                            that.filterOrgSearch();
                        });
                    }else{
                        layers.toast(result.message);
                    }
                }
            })
        },
        /**
         * 数组对象简单去重 对 id 去重, 名字可以有重复
         * @param arr
         * @return {Array}
         */
        unique: function (arr) {
            var result = {};
            var finalResult = [];
            for (var i = 0; i < arr.length; i++) {
                result[arr[i].id] = arr[i];
            }
            for (var item in result) {
                finalResult.push(result[item]);
            }
            return finalResult;
        },
        /**
         * 返回时间段,
         * return {Array}: 今天/昨天/最近7天/最近30天
         */
        timeArea: function () {
            return {
                today: [moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
                yesterday: [moment().subtract(1, 'days').format('YYYY-MM-DD'), moment().subtract(1, 'days').format('YYYY-MM-DD')],
                recent7day: [moment().subtract(6, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
                recent30day: [moment().subtract(29, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
            };
        },
        /**
         * 渲染筛选条件--自定义时间选择器
         */
        renderLayDate: function () {
            layui.use('laydate', function () {
                var laydate = layui.laydate;
                laydate.render({
                    elem: '.lay-date-a',
                    done: function (value) {
                        vm.inputTimeA = value;
                    }
                });
                laydate.render({
                    elem: '.lay-date-b',
                    done: function (value) {
                        vm.inputTimeB = value;
                    }
                })
            });
        },
        /**
         * 分页
         */
        getAllPage: function() {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'callpages',
                    count: vm.total_num    // 数据总数
                    ,limit: vm.page_limit         // 每页显示条数
                    ,curr: vm.page           // 当前页数
                    ,jump: function (obj, first) {
                        if (!first) {
                            vm.page_limit = obj.limit;    // 获取每页显示条数
                            vm.page = obj.curr;      // 获取当前页
                            main.getCallRecordAll();           // 发送请求
                        }
                    }
                });
            });
        },
        /**
         * 筛选--组织架构搜索
         */
        filterOrgSearch: function () {
            Vue.nextTick(function () {
                var $item = $('#org-framework').find('a').not('.has-arrow');
                $item.each(function () {
                    var newItem = {id: $(this).data('id'), name: $(this).data('text')};
                    vm.OrgSearchArr.push(newItem);
                });
            });
            this.form.on('select(search-org)', function (data) {
                var addItem = {id: data.value.split(',')[0] * 1, name: data.value.split(',')[1]};
                vm.selectedOrgUsr.push(addItem);
                vm.selectedOrgUsr = main.unique(vm.selectedOrgUsr).reverse();
            });
        },
        /**
         * 点击拨号次数排序
         */
        callLenght: function() {
            var $that = $(event.target),
                sortData = $that.attr('data-type');
            $that.removeClass("asc desc");
            vm.order = 'sendok_count';
            vm.page = 1;
            if(sortData == 0) {
                $that.prop("class", "asc");
                $that.attr("data-type", 1);
                vm.sort = 'asc';
            } else {
                $that.prop("class", "desc");
                $that.attr("data-type", 0);
                vm.sort = 'desc';
            }
        }
    };
    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            total_num: '', //总条数
            page_limit: 20, //分页size
            page: 1, // 当前页
            page_limit_arr: [{id:20,active:true},{id:50,active:false},{id:100,active:false},{id:500,active:false},{id:1000,active:false}],
            keywords: '', //搜索关键字
            callRecord: [], //通话记录列表
            callRecordHead: [], //通话记录列表
            callRecordHeadLength: '',
            order: '', // 按照什么排序
            sort: '', // 排序
            epartment: [], //组织架构筛选
            employeeAndDep: '', //员工/部门,传员工的id,逗号分隔
            find_employee_id: '', //员工/部门,传员工的id,逗号分隔
            selectedOrgUsr: [], //全局组织架构已选用户 {id:1, name: '张三'},{id:2, name: '李四'}
            selectedOrgUsrShow: [], //回显数据
            showpop: false, //显示与隐藏筛选框
            showpopActive: false, //筛选状态激活状态
            showDate: false, //日期筛选的显示与隐藏
            showDateActive: false, //日期选择框激活状态
            conditionStr: ['今天', '昨天', '最近7天', '最近30天', '自定义'], //缓存数据
            filterTime: ['', ''], //筛选日期
            inputTimeA: '',
            inputTimeB: '',
            dateName: '统计时间',
            showTime: false, //语音时长显示与隐藏
            OrgSearchArr: [] //缓存组织架构搜索结果
        },
        methods: {
            choicepart: function(index, id){
                if(index != null && id != null){
                    this.epartment[index].active = !this.epartment[index].active;
                }
            },
            //选择每页展示的条数
            choiceLimit: function(index, id){
                if(index != undefined && id != undefined){
                    var lens = this.page_limit_arr.length;
                    for(var i = 0; i < lens; i++){
                        this.page_limit_arr[i].active = false;
                        if(index == i){
                            this.page_limit_arr[i].active = true;
                        }
                    }
                    this.page_limit = id;
                    vm.page = 1;
                    main.getCallRecordAll();
                }
            },
            //筛选的弹窗框的全选
            orgSelectAll: function(event, id){
                var $ul = $(event.target).parent().siblings();
                var $item = $ul.find('a').not('.has-arrow');
                $item.each(function () {
                    var newItem = {id: $(this).data('id'), name: $(this).data('text')};
                    vm.selectedOrgUsr.push(newItem);
                });
                this.selectedOrgUsr = main.unique(vm.selectedOrgUsr).reverse();
            },
            //筛选的弹窗框的单个选择
            orgSelectItem: function (e) {
                if (!$(e.target).hasClass('has-arrow')) {
                    var newItem = {id: $(e.target).data('id'), name: $(e.target).data('text')};
                    this.selectedOrgUsr.push(newItem);
                    this.selectedOrgUsr = main.unique(this.selectedOrgUsr).reverse();
                }
            },
            //点击筛选框确定按钮
            addConditonsOrg: function (e) {
                if (this.selectedOrgUsr.length) {
                    var tmpArr = [];
                    this.selectedOrgUsr.forEach(function (t) {
                        tmpArr.push(t.id);
                    });
                    var $end = $(".choose-people ul").find("li"),
                        dataVal = [];
                    $end.each(function() {
                       dataVal.push({id: $(this).attr("data-id"), name: $(this).text()})
                    });
                    this.selectedOrgUsrShow = dataVal;
                    this.employeeAndDep = tmpArr.join(',');
                    main.getCallRecordAll();
                    this.showpop = false;
                } else {
                    layers.toast('请选择人员');
                }
            },
            //删除单个选项
            delChoose: function(index){
                if(index != undefined){
                    this.selectedOrgUsr.splice(index, 1);
                }
            },
            // 筛选不限 日期
            cancelCondition: function (e) {
                $(e.target).parent().find('a').each(function () {
                    $(this).removeClass('active');
                });
                this.dateName = '统计时间';
                this.showDate = false;
                this.showDateActive = false;
                this.filterTime = ['',''];
                this.page = 1;
            },
            // 日期筛选
            choiceTime: function(e, custom){
                if (custom) {// 自定义
                    $(e.target).toggleClass('active');
                } else {// 快速时间筛选
                    $(e.target).parent().find('a').each(function () {
                        $(this).removeClass('active');
                    });
                    this.showDate = false;
                    this.showDateActive = true;
                    this.dateName = '统计时间';
                    this.dateName += '：' + $(e.target).text();
                    var quicklyTime = [];
                    switch ($(e.target).text()) {
                        case vm.conditionStr[0]:
                            quicklyTime = main.timeArea().today;
                            break;
                        case vm.conditionStr[1]:
                            quicklyTime = main.timeArea().yesterday;
                            break;
                        case vm.conditionStr[2]:
                            quicklyTime = main.timeArea().recent7day;
                            break;
                        case vm.conditionStr[3]:
                            quicklyTime = main.timeArea().recent30day;
                            break;
                        default:
                    }
                    this.filterTime = quicklyTime;
                }
            },
            /**
             * 添加筛选: 自定义时间录入的情况
             */
            addConditons: function (e) {
                // 时间范围验证
                if ((new Date(this.inputTimeB) - new Date(this.inputTimeA)) < 0) {
                    layers.toast('开始时间不能大于结束时间', {time: 2500});
                } else {
                    var domValA = $('.lay-date-a').val();
                    var domValB = $('.lay-date-b').val();
                    // 添加自定义时间
                    if (domValA && domValB) {
                        this.inputTimeA = domValA;
                        this.inputTimeB = domValB;
                        // 关闭筛选框
                        this.showDate = false;
                        this.showDateActive = true;
                        this.dateName = '统计时间';
                        this.dateName += ('：' + this.inputTimeA + '到' + this.inputTimeB);
                        this.filterTime = [this.inputTimeA, this.inputTimeB]
                    } else {
                        layers.toast('请填入自定义时间范围');
                    }
                }
            },
            delUsr: function(index){//删除组织架构中已经选择的展示出来的选项
                if(index != undefined){
                    this.selectedOrgUsr.splice(index, 1);
                    this.selectedOrgUsrShow.splice(index, 1);
                    var tmpArr = [];
                    this.selectedOrgUsrShow.forEach(function (t) {
                        tmpArr.push(t.id);
                    });
                    this.employeeAndDep = tmpArr.join(',');
                    main.getCallRecordAll();
                }
            },
            /**
             * 点击拨号次数排序
             */
            callLenght: function() {
                main.callLenght();
            },
            /**
             * 点击取消组织架构弹窗
             */
            cancel: function() {
                this.showpop = false;
                //this.selectedOrgUsr = [];
            },
            /**
             * 部门员工筛选不限
             */
            noPlace: function() {
                this.employeeAndDep = '';
                this.selectedOrgUsrShow = [];
                this.selectedOrgUsr = [];
                main.getCallRecordAll();
            }
        },
        watch:{
            showpop:{
                handler: function(val, oldVal){
                    this.showpopActive = val;
                    if(val){
                        main.form.render();
                        this.showTime = false;
                        this.showDate = false;
                    }
                },
                deep: true
            },
            showDate:{
                handler: function(val, oldVal){
                    if(!this.filterTime[0] == '' && !this.filterTime[1] == ''){
                        this.showDateActive = true;
                    }else{
                        this.showDateActive = val;
                    }
                    if(val){
                        this.showTime = false;
                        this.showpop = false;
                    }
                },
                deep: true
            },
            filterTime:{
                handler: function(val, oldVal){
                    this.page = 1;
                    main.getCallRecordAll();
                },
                deep: true
            },
            sort: { // 监听拨号次数排序的切换
                handler: function() {
                    main.getCallRecordAll();
                },
                deep: true
            }
        },
        /**
         * 录音时间过滤
         */
        filters: {
            VformatM: function (value) {
                if (value == undefined || value == null) {
                    return '--';
                }
                if (value === 0) {
                    return '0';
                }
                if (value < 60) {
                    return '00:' + (value >= 10 ? value : '0' + value);
                }
                if (60 <= value < 3600) {
                    return (Math.floor(value / 60) >= 10 ? Math.floor(value / 60) : '0' + Math.floor(value / 60)) + ':' + (value % 60 >= 10 ? value % 60 : '0' + value % 60)
                }
                if (value >= 3600) {
                    var H = Math.floor(value / 3600) >= 10 ? Math.floor(value / 3600) : '0' + Math.floor(value / 3600);
                    var M = Math.floor((value % 3600) / 60) >= 10 ? Math.floor((value % 3600) / 60) : '0' + Math.floor((value % 3600) / 60);
                    var S = Math.floor((value % 3600) / 60 * 60) >= 10 ? Math.floor((value % 3600) / 60 * 60) : '0' + Math.floor((value % 3600) / 60 * 60);
                    return H + M + S;
                }
            }
        }
    });
    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.createForm();
        common.getTabLink();
        main.getCallRecordAll();
        main.getdepartment();
        main.renderLayDate();
    };
    _init();
});
/**
 * Created by Administrator on 2017-10-13.
 */
require(['moment', 'layui', 'common', 'ajaxurl', 'tools', 'layers', 'template', 'text!/assets/popup/add-remark.html','lightbox'], function (moment, layui, common, ajaxurl, tool, layers, template, addRemark, lightbox) {
     // 配置 template 界定符
    template.config('openTag', '{?');
    template.config('closeTag', '?}');
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
                //待投诉列表 搜索
                form.on('submit(formSearchWait)', function(data){
                    vm.dataWait.keywords = data.field.title;
                    vm.dataWait.curpage = 1;
                    main.getrecordList();
                    return false;
                });
                //全部投诉列表 搜索
                form.on('submit(formSearchAll)', function(data){
                    vm.keywords = data.field.title;
                    vm.contractConditon.curpage = 1;
                    main.getAllList();
                    return false;
                });

            })
        },
        /**
         * 初始化我的投诉列表
         * @param keywords 关键字搜索
         */
        getmyList: function(keywords) {
            // var loading = '';
            // 待投诉
            tool.ajax({
                url: ajaxurl.complaint.myList,
                type: 'post',
                data: {  
                    pagesize:vm.dataMy.pagesize,
                    curpage:vm.dataMy.curpage,
                },
                beforeSend: function() {
                    // layers.load(function(indexs) {
                    //     loading = indexs
                    // })
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.myList = result.data.list;
                        // 获取总条数
                        vm.myListNum = result.data.total_num;
                        // 调用分页
                        main.getMyPage();
                    }else{
                        layers.toast(result.message);
                    }
                    // layers.closed(loading);
                },
                error: function(){
                    layers.toast("网络异常!");
                    // layers.closed(loading);
                }
            });
        },
        /**
         * 初始化待投诉列表
         * @param keywords 关键字搜索
         */
        getrecordList: function(keywords) {
            // var loading = '';
            // 待投诉
            tool.ajax({
                url: ajaxurl.complaint.recordList,
                type: 'post',
                data: {
                    search_value: vm.dataWait.keywords,
                    pagesize:vm.dataWait.pagesize,
                    curpage:vm.dataWait.curpage,
                },
                beforeSend: function() {
                    // layers.load(function(indexs) {
                    //     loading = indexs
                    // })
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.recordList = result.data.list;
                        // 获取总条数
                        vm.recordListTotal = result.data.total_num;
                        // 调用分页
                        main.getWaitPage();
                    }else{
                        layers.toast(result.message);
                    }
                    // layers.closed(loading);
                },
                error: function(){
                    layers.toast("网络异常!");
                    // layers.closed(loading);
                }
            });
        },
        /**
         * 初始化全部投诉列表
         * @param mark_id
         */
        getAllList: function(page, callback) {
            $("input[name='checks']").prop("checked", false);
            $("input[name='check']").prop("checked", false);
            // var loading = '';
            page = page || 1;
            // 全部投诉列表
            tool.ajax({
                url: ajaxurl.complaint.allList,
                type: 'post',
                data: {
                    search_value: vm.keywords,//搜索条件：
                    employee_id:vm.userinfo.id,//员工id
                    mark_id: vm.contractConditon.mark_id,//备注id
                    complaint_type: vm.contractConditon.complaint_type,//投诉类型
                    status: vm.contractConditon.status,//投诉处理状态
                    start_time: vm.contractConditon.start_time,//投诉创建时间
                    end_time: vm.contractConditon.end_time,//投诉结束时间
                    pagesize: vm.contractConditon.pagesize || 10,//分页大小
                    curpage: vm.contractConditon.curpage || 1,//当前页
                },
                beforeSend: function() {
                    // layers.load(function(indexs) {
                    //     loading = indexs
                    // })
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                         vm.AllList = result.data.list;
                        // 获取总条数
                        vm.AllListNum = result.data.total_num;
                        // 调用分页
                        main.getAllPage();
                    }else{
                        layers.toast(result.message);
                    }
                    // layers.closed(loading);
                },
                error: function(){
                    layers.toast("网络异常!");
                    // layers.closed(loading);
                }
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
                    elem: 'allList',
                    count: vm.AllListNum    // 数据总数
                    ,limit: vm.contractConditon.pagesize         // 每页显示条数
                    ,curr: vm.contractConditon.curpage           // 当前页数
                    ,jump: function (obj, first) {
                        if (!first) {
                            vm.contractConditon.pagesize = obj.limit;    // 获取每页显示条数
                            vm.contractConditon.curpage = obj.curr;      // 获取当前页
                            // main.getAllList();           // 发送请求
                        }
                    }
                });
            });
        },
        /**
         * 分页 (待处理)
         */
        getWaitPage: function() {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'waitList',
                    count: vm.recordListTotal    // 数据总数
                    ,limit: vm.dataWait.pagesize         // 每页显示条数
                    ,curr: vm.dataWait.curpage           // 当前页数
                    ,jump: function (obj, first) {
                        if (!first) {
                            vm.dataWait.pagesize = obj.limit;    // 获取每页显示条数
                            vm.dataWait.curpage = obj.curr;      // 获取当前页
                            main.getrecordList();           // 发送请求
                        }
                    }
                });
            });
        },
        /**
         * 分页 (我的)
         */
        getMyPage: function() {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'myList',
                    count: vm.myListNum    // 数据总数
                    ,limit: vm.dataMy.pagesize         // 每页显示条数
                    ,curr: vm.dataMy.curpage           // 当前页数
                    ,jump: function (obj, first) {
                        if (!first) {
                            vm.dataMy.pagesize = obj.limit;    // 获取每页显示条数
                            vm.dataMy.curpage = obj.curr;      // 获取当前页
                            main.getmyList();           // 发送请求
                        }
                    }
                });
            });
        },
        /**
         * 点击切换分页 (我发起)
         */
        pageNumMy: function(event) {
            $(event.target).addClass("active");
            $(event.target).parent("li").siblings("li").children("a").removeClass("active");
            vm.dataMy.pagesize = $(event.target).html();
            vm.dataMy.curpage = 1;
            main.getmyList();
        },
        /**
         * 点击切换分页（待处理）
         */
        pageNumWait: function(event) {
            $(event.target).addClass("active");
            $(event.target).parent("li").siblings("li").children("a").removeClass("active");
            vm.dataWait.pagesize = $(event.target).html();
            vm.dataWait.curpage = 1;
            main.getrecordList();
        },
        /**
         * 点击切换分页（全部）
         */
        pageNumAll: function(event) {
            $(event.target).addClass("active");
            $(event.target).parent("li").siblings("li").children("a").removeClass("active");
            vm.contractConditon.pagesize = $(event.target).html();
            vm.contractConditon.curpage = 1;
            main.getAllPage();
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
        },
        /**
         * 删除投诉记录(单选)
         */
        deleteName: function () {
            var $commonTable = $(".common-table tr input:checked"),
                complaint_id = '';
            $commonTable.each(function () {
                var dataID = $(this).attr("data-id");
                complaint_id += (dataID + ",");
            });
            complaint_id = complaint_id.substring(0, complaint_id.length - 1);
            if(complaint_id == '') {
                layers.toast("请选择要删除的合作情况");
                return;
            }
            layers.confirm({
                title: '操作提示！',
                area: ['450px', '250px'],
                content: '<div class="confirm-tips"><p>删除后无法修复，确认删除？</p></div>',
                btn2: function (index, layero) {
                    tool.ajax({
                        url: ajaxurl.complaint.delcomplaint,
                        data: {complaint_id: complaint_id},
                        success: function (result) {
                            if (result.code == 1) {
                                 layers.toast('删除成功！', {
                                    icon: 1,
                                    anim: 1
                                });
                                 setTimeout(function () {
                                    window.location.reload();
                                }, 1000);
                            } else {
                                layers.toast(result.message);
                            }
                        }
                    })
                }
            });
        },
        /**
         * 获取标签和备注
         */
        getTagMark: function (callback) {
            tool.ajax({
                url: ajaxurl.customer.getListTagMark,
                data: {
                    employee_id: vm.userinfo.id
                },
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
         * 编辑当前客户的备注
         */
        remarkEdit: function () {
            var $commonTable = $(".common-table tr input:checked"),
                customer_id = '',checkedIdArr = [];
            $commonTable.each(function () {
                var dataID = $(this).attr("value");
                checkedIdArr.push(dataID);
                customer_id += (dataID + ",");
            });
            customer_id = customer_id.substring(0, customer_id.length - 1);
            if(customer_id == '') {
                layers.toast("请选择选项");
                return;
            }
            vm.customer_id = customer_id;
            if (!checkedIdArr.length) {
                return;
            }
            layers.open({
                btn: null,
                title: '添加备注',
                area: ['604px', 'auto'],
                content: addRemark,
                success: function (layero, index) {
                    var $layero = $(layero);
                    var addedId = [];
                    if (vm.markList.length) {
                        $layero.find('.tag-group').html(template('addRemark', {data: vm.markList}));
                    } else {
                        layers.toast('您暂无任何备注可供添加，请先去“备注管理”处添加备注！');
                    }
                    $layero.find('.remark-tip span').text(checkedIdArr.length);
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
                        if (addedId.length) {
                            $layero.find('.un-checkall-btn').show();
                        } else {
                            $layero.find('.un-checkall-btn').hide();
                        }
                    });
                    $layero.find('.un-checkall-btn').click(function () {
                        $(this).hide();
                        addedId = [];
                        $('.list-item').each(function () {
                            $(this).removeClass('active');
                        });
                    });
                    $layero.find('.checkall-btn').click(function () {
                        $layero.find('.un-checkall-btn').show();
                        vm.remarkList.forEach(function (item) {
                            addedId.push(item.id);
                        });
                        $('.list-item').each(function () {
                            $(this).addClass('active');
                        });
                    });
                    $layero.find('.cancel').click(function () {
                        layers.closed(index);
                    });
                    $layero.find('.ok').click(function () {
                        var customerId = vm.checkedIdArr.join(',');
                        tool.ajax({
                            url: ajaxurl.customer.addRemark,
                            data: {
                                mark_id: addedId.join(','),
                                customer_id: vm.customer_id // 用户id
                            },
                            success: function (res) {
                                if (res.code === 1) {
                                    layers.toast(res.message);
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
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            financialList: [],
            customer_id:'',
            userinfo: common.getUserInfo(), //获取用户信息
            markList: [], //备注列表
            checkedMarkList: [], //已选备注 id
            recordList: [], //待投诉列表
            recordListTotal:'',
            myList: [], //我发起的投诉列表
            myListNum: [], //我发起的投诉列表
            AllList: [], //全部投诉记录
            AllListNum: '', //全部处理记录总条数
            tableDataWaitPagesize: 10, //全部处理记录总页数
            remarkList: [],
            gainRemarkList:[],
            checkedIdArr: [], // 已选中的用户
            keywords: '',
            contractConditon: {// 全部筛选条件
                mark_id: '', //备注id
                complaint_type: '',// 状态 产品1、服务2、
                status: '',// 状态 待处理1、处理中2、已处理3
                start_time: '',
                end_time: '',
                pagesize: 10,
                curpage: 1
            },
            dataWait: {
                keywords: '',
                pagesize: 10, // 每页显示条数
                curpage: 1 // 当前页
            },
            dataAll: {
                keywords: '',
                pagesize: 10, // 每页显示条数
                curpage: 1 // 当前页
            },
            dataMy: {
                pagesize: 10, // 每页显示条数
                curpage: 1 // 当前页
            },
            conditionStr: ['投诉类型', '投诉时间', '处理状态'],
            conditionTime: ['今天', '昨天', '最近7天', '最近30天','产品', '服务', '待处理', '处理中', '已处理'],
            condition: [    
                {name: '投诉类型', show: false, active: false},
                {name: '投诉时间', show: false, active: false},
                {name: '处理状态', show: false, active: false},
            ],
            inputTimeA: '',
            inputTimeB: '',
            pagesize: '',
            curpage: '',
            pageNum: '',
            start_time: '', // 导出财务数据开始时间
            end_time:'' // 导出财务数据结束时间
        },
        methods: {
            // 我发起
            pageNumMy: function(event) {
                main.pageNumMy(event);
            },
            // 待处理
            pageNumWait: function(event) {
                main.pageNumWait(event);
            },
            // 全部
            pageNumAll: function(event) {
                main.pageNumAll(event);
            },
            //删除被选记录
            deleteName: function(){
                main.deleteName();
            },
            // 选择备注
            checkRemark: function (e, id) {
                var _this = this;
                $(e.target).toggleClass('tag-active');
                if (this.checkedMarkList.indexOf(id) === -1) {
                    this.checkedMarkList.push(id);
                } else {
                    this.checkedMarkList.forEach(function (item, index) {
                        //如果id === item 则在数据中删除
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
                    case 0:// 投诉类型
                        vm.contractConditon.complaint_type = '';
                        break;
                    case 1:// 移交时间
                        vm.contractConditon.start_time = '';
                        vm.contractConditon.end_time = '';
                        break;
                    case 2:// 处理状态
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
                            vm.contractConditon.start_time = quicklyTime[0];
                            vm.contractConditon.end_time = quicklyTime[1];
                            break;
                        case vm.conditionTime[1]:
                            quicklyTime = main.timeArea().yesterday;
                            vm.contractConditon.start_time = quicklyTime[0];
                            vm.contractConditon.end_time = quicklyTime[1];
                            break;
                        case vm.conditionTime[2]:
                            quicklyTime = main.timeArea().recent7day;
                            vm.contractConditon.start_time = quicklyTime[0];
                            vm.contractConditon.end_time = quicklyTime[1];
                            break;
                        case vm.conditionTime[3]:
                            quicklyTime = main.timeArea().recent30day;
                            vm.contractConditon.start_time = quicklyTime[0];
                            vm.contractConditon.end_time = quicklyTime[1];
                            break;
                        case vm.conditionTime[4]:// 产品
                            vm.contractConditon.complaint_type = 1;
                            break;
                        case vm.conditionTime[5]:// 服务
                            vm.contractConditon.complaint_type = 2;
                            break;
                        case vm.conditionTime[6]:// 待处理
                            vm.contractConditon.status = 1;
                            break;
                        case vm.conditionTime[7]:// 处理中
                            vm.contractConditon.status = 2;
                            break;
                        case vm.conditionTime[8]:// 已处理
                            vm.contractConditon.status = 3;
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
                        vm.contractConditon.start_time = this.inputTimeA;
                        vm.contractConditon.end_time = this.inputTimeB;
                    } else {
                        layers.toast('请填入自定义时间范围');
                    }
                }
            },
            searchBlur: function(event) {
                main.searchBlur(event);
            },
            remarkEdit: function(){
                main.remarkEdit();
            },
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
        },
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.initTab();
        main.renderLayDate();
        main.initProject();
        common.getTabLink();
        main.getrecordList();
        main.getmyList();
        main.getAllList(main.setPage2);
        main.getMarkList();
        main.checkChange();
    };
    _init();
});


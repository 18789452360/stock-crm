require(['moment', 'layui', 'common', 'tools', 'ajaxurl', 'layers', 'text!/assets/popup/add-remark.html', 'template', 'page'], function (moment, layui, common, tools, ajaxurl, layers, addRemark, template, page) {
    // 配置 template 界定符
    template.config('openTag', '{?');
    template.config('closeTag', '?}');

    var main = {
        /**
         * 加载页面显示tab
         */
        initTab:function() {
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
         * 初始化 Layui 组件
         */
        initProject: function () {
            var that = this;
            layui.use(['laydate', 'table', 'layer', 'form', 'element'], function () {
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
         * 获取待审核合同
         */
        getWaitList: function (keywords) {
            var loading = '';
            tools.ajax({
                url: ajaxurl.contract.contract_list,
                type: 'post',
                data: vm.dataWait,
                beforeSend: function() {
                    layers.load(function(indexs) {
                        loading = indexs
                    })
                },
                success: function (result) {
                    if (result.code == 1) {
                        vm.tableDataAll = result.data.list;
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
         * 合同全部处理记录
         * @param page  当前页
         * @param callback  请求数据完成的回调
         */
        getAllList: function (page, callback) {
            var loading = '';
            page = page || 1;
            tools.ajax({
                url: ajaxurl.contract.contract_record_list,
                type: 'post',
                data: {
                    keywords: vm.keywords,
                    mark_id: vm.contractConditon.mark_id,
                    status: vm.contractConditon.status,
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
                success: function (result) {
                    if (result.code === 1) {
                        result.data.list.forEach(function (item) {
                            item.checked = false;
                        });
                        vm.tableDataWait = result.data.list;
                        // 获取总条数
                        vm.getAllListTotal = result.data.all_num;
                        // 调用分页
                        main.getAllPage();
                        typeof callback === 'function' && callback.call(this);
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
            if (!vm.checkedIdArr.length) {
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
                    if (vm.remarkList.length) {
                        $layero.find('.tag-group').html(template('addRemark', {data: vm.remarkList}));
                    } else {
                        layers.toast('您暂无任何备注可供添加，请先去“备注管理”处添加备注！');
                    }
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
                        tools.ajax({
                            url: ajaxurl.remarks.hit,
                            data: {
                                mark_id: addedId.join(','),
                                situation_id: customerId
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
         * 分页 (全部)*********************************************************************
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
            conditionStr: ['合同状态', '移交时间', '合同邮寄时间'],
            conditionTime: ['今天', '昨天', '最近7天', '最近30天', '待处理', '己邮寄', '己签订'],
            condition: [
                {name: '合同状态', show: false, active: false},
                {name: '移交时间', show: false, active: false},
                {name: '合同邮寄时间', show: false, active: false}
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
                    case 0:// 合同状态
                        vm.contractConditon.status = '';
                        break;
                    case 1:// 移交时间
                        vm.contractConditon.start_time = '';
                        vm.contractConditon.end_time = '';
                        break;
                    case 2:// 合同邮寄时间
                        vm.contractConditon.post_start_time = '';
                        vm.contractConditon.post_end_time = '';
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
                            vm.contractConditon.status = 'dhtsh,htdqd,htdsh,htdxg';
                            break;
                        case vm.conditionTime[5]:// 已邮寄
                            vm.contractConditon.status = 'htyyj';
                            break;
                        case vm.conditionTime[6]:// 已签订
                            vm.contractConditon.status = 'htyqd';
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

            // 添加备注
            addRemark: function () {
                main.addRemark();
            },
            // 全部
            pageNumWait: function(event) {
                main.pageNumWait(event);
            },
            // 待
            pageNumAll: function(event) {
                main.pageNumAll(event);
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
        // main.getTagMark();
    };
    _init();
});

require(['layui', 'common', 'layers', 'text!/assets/popup/perfect-tip.html', 'text!/assets/popup/edit-group.html', 'text!/assets/popup/add-record.html', 'text!/assets/popup/alter-serve.html', 'text!/assets/popup/associate-track.html', 'text!/assets/popup/pay-record.html', 'ajaxurl', 'tools', 'upload', 'lightbox', 'template', 'page', 'text!/assets/popup/remark-edit.html'], function (layui, common, layers, perfect, editGroup, addRecord, alterServe, track, payRecord, ajaxurl, tool, upload, lightbox, template, page, remarkEdit) {
    //修改template模板界定符
    template.config('openTag', '{%');
    template.config('closeTag', '%}');
    var main = {
        laydate: '',
        form: '',
        followBtnFlag: true,
        /**
         * tab切换监听
         */
        tabSwitch: function () {
            layui.use('element', function () {
                var element = layui.element;
                var urls = vm.getUrls;
                if (urls.has) {
                    var type = urls.data.type, //当url有type的时候
                        status = '';
                    if (urls.data.status) {
                        status = urls.data.status;
                    }
                    switch (type) {
                        case '1':
                            vm.tabs.basic = true;
                            break;
                        case '2':
                            vm.tabs.follow = true;
                            break;
                        case '3':
                            vm.tabs.cooperation = true;
                            break;
                    };
                    element.on('tab(client-tabs)', function () { //当页面直接点击tab切换的时候
                        if (this.getAttribute('lay-id') == 1) {
                            if (!vm.tabs.basic) {
                                main.getClinetInfo();
                                vm.tabs.basic = true;
                            }
                        }
                        if (this.getAttribute('lay-id') == 2) {
                            if (!vm.tabs.follow) {
                                main.resetFollow(); //初始花筛选跟进信息条件
                                main.lightboxInit();
                                main.getFollowInfo();
                                vm.tabs.follow = true;
                            }
                        }
                        if (this.getAttribute('lay-id') == 3) {
                            if (!vm.tabs.cooperation) {
                                status ? main.getCustomerCooper() : main.getCooperationList();
                                vm.tabs.cooperation = true;
                            }
                        }
                    });
                };
            });

        },
        /**
         * 默认加载进来URL处理
         */
        getUrl: function () {
            var urls = vm.getUrls;
            if (urls.has) {
                if (urls.data.customer_id != '' && urls.data.customer_id != undefined) { //缺少客户id
                    main.getFileHead(); //获取档案头部信息
                    layui.use('element', function () {
                        var element = layui.element;
                        if (urls.data.type) {
                            element.tabChange('client-tabs', urls.data.type);
                        }
                        if (!urls.data.type || urls.data.type == 1) { //缺少type属性，或者type = 1默认加载基本信息页面
                            main.getClinetInfo();
                            vm.tabs.basic = true;
                            if (urls.data.status == 2) { //处于编辑状态
                                vm.editBasic = true;
                            }
                        } else {
                            if (urls.data.type == 2) { //type == 2的时候 加载跟进信息页面
                                main.resetFollow(); //初始花筛选跟进信息条件
                                main.getFollowInfo(); //获取跟进信息列表
                                main.lightboxInit();
                                vm.tabs.follow = true;
                            }
                            if (urls.data.type == 3) { //type == 3 合作情况页面  有 status为查看或编辑的时候 没有的时候加载合作情况列表页
                                main.getCooperttion(function () {
                                    main.getCustomerCooper();
                                    vm.tabs.cooperation = true;
                                });
                            }
                        }
                    })
                } else {
                    layers.toast('缺少customer_id参数');
                    return false;
                }
            } else {
                layers.toast('缺少参数');
                return false;
            }
        },
        /**
         * 新增或编辑合作情况数据处理
         */
        getCooperttion: function (callback) {
            var urls = vm.getUrls;
            if (urls.data.status == undefined) { //新增
                if (vm.editCooperation) {
                    vm.isCooper = false;
                    main.getCustomerMobile();
                    var salesLens = vm.global_set.sales_process.length;
                    var newArr = [];
                    for (var i = 0; i < salesLens; i++) {
                        newArr.push({
                            title: vm.global_set.sales_process[i].name,
                            info: [{
                                customer_cooper_situation_saleprocess_id: '', //合作情况销售过程ID
                                sp_type: '', //2(销售过程类型:1销售过程,2跟进记录)
                                employee_id: '', //员工ID
                                employee_nickname: '', //销售人员
                                employee_department: '', //销售人员部门
                                text_record: '', //记录文字
                                create_time: '', //创建日期
                                product_info: [],
                                images: [],
                                voice_records: []
                            }],
                            userdesc: '', //输入的文字
                            userimages: []
                        })
                    }
                    vm.sp_saleprocess = newArr;
                    main.setCooperationInfo();
                } else {
                    main.getCooperationList();
                }
            } else { //处于编辑或查看模式下
                typeof callback === 'function' && callback.call(this);
            }
        },
        /**
         * [getCustomerCooper description] 获取用户合作情况详细信息  处于编辑和查看状态下生效
         * @return {[type]} [description]
         */
        getCustomerCooper: function () {
            var urls = vm.getUrls,
                id = '',
                that = this,
                loading = '';
            if (urls.has && urls.data.status != undefined && urls.data.type == 3) { //stauts == 2 表示编辑  1查看
                vm.isCooper = true;
                if (urls.data.id != undefined) {
                    id = urls.data.id;
                } else {
                    layers.toast('缺少id参数');
                    throw new Error('缺少id参数！');
                }
                vm.editCooperation = true;
                if (urls.data.status == 1) {
                    vm.examine = true;
                }
                if (urls.data.status != 1) {
                    main.getCustomerMobile();
                }
                tool.ajax({
                    url: ajaxurl.customer_cooper.detail,
                    data: {
                        id: id,
                        customer_id: vm.customer_id,
                    },
                    type: 'post',
                    beforeSend: function () {
                        layers.load(function (indexs) {
                            loading = indexs;
                        });
                    },
                    success: function (result) {
                        switch (urls.data.status) {
                            case '1':
                                vm.checkCooper = true;
                                break;
                            case '2':
                                vm.checkCooper = false;
                                break;
                        }
                        if (result.code == 1) {
                            var sp_saleprocess = result.data.sp_saleprocess; //销售过程
                            var cooper_situation_base = result.data.cooper_situation_base; //基本信息
                            if (result.data.cooper_situation_base.cooper_situation_jjtag && result.data.cooper_situation_base.cooper_situation_jjtag.length && urls.data.status != 1) { //合作情况状态
                                vm.cooper_situation_jjtag = true;
                                switch (result.data.cooper_situation_base.cooper_situation_jjtag[0]) { //cooper_situation_jjtag 这个参数表示表示被谁拒绝，根据拒绝的对象不同显示不同的页面，cwjj 可以编辑全部的页面 质检，回访只能编辑合规信息
                                    case 'cwyjj': //财务拒绝
                                        vm.cooper_situation_jjtag = true;
                                        break;
                                    case 'zjyjj': //质检拒绝
                                    case 'hfyjj': //回访拒绝
                                        vm.cooper_situation_jjtag = false;
                                    default:
                                        break;
                                }
                            } else {
                                vm.cooper_situation_jjtag = false;
                                vm.examine = true;
                            }
                            //如果信息对象存在 覆盖原来的值
                            if (!$.isEmptyObject(cooper_situation_base)) {
                                vm.cooper_situation_base = cooper_situation_base;
                            }
                            //处理销售过程数据
                            if (sp_saleprocess instanceof Array) {
                                var salesLens = vm.global_set.sales_process.length;
                                var newArr = [];
                                for (var i = 0; i < salesLens; i++) {
                                    newArr.push({
                                        title: vm.global_set.sales_process[i].name,
                                        info: [{
                                            customer_cooper_situation_saleprocess_id: '', //合作情况销售过程ID
                                            sp_type: '', //2(销售过程类型:1销售过程,2跟进记录)
                                            employee_id: '', //员工ID
                                            employee_nickname: '', //销售人员
                                            employee_department: '', //销售人员部门
                                            text_record: '', //记录文字
                                            create_time: '', //创建日期
                                            product_info: [],
                                            images: [],
                                            voice_records: []
                                        }],
                                        userdesc: '', //输入的文字
                                        userimages: []
                                    });
                                    var lens = sp_saleprocess.length;
                                    for (var j = 0; j < lens; j++) {
                                        if (vm.global_set.sales_process[i].name == sp_saleprocess[j].title) {
                                            newArr[i] = sp_saleprocess[j];
                                            newArr[i].userdesc = '';
                                            newArr[i].userimages = [];
                                        }
                                    }
                                }
                                vm.sp_saleprocess = newArr;
                                main.monitorCooperation();
                            }
                        } else {
                            layers.toast(result.message);
                            layers.closed(loading);
                            vm.noData = true;
                            return false;
                        }
                        layers.closed(loading);
                        setTimeout(function () {
                            layui.use('form', function () {
                                var form = layui.form;
                                form.render();
                                main.asynUploadImg();
                                main.cooperLight();
                            });
                        }, 200);
                    },
                    error: function () {
                        layers.closed(loading);
                        layers.toast('网络异常!');
                    }
                })
            }
        },
        /**
         * 获取全局配置项
         */
        globalSet: function (callback) {
            var urls = vm.getUrls,
                that = this;
            tool.ajax({
                url: ajaxurl.setting.index,
                data: {
                    type: 1
                },
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        vm.global_set = data.data;
                        vm.customer_from_channel = data.data.customer_from_channel;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                },
                error: function (err) {
                    layers.toast('网络异常!');
                }
            })
        },
        /**
         * 获取客户电话号码
         */
        getCustomerMobile: function () {
            tool.ajax({
                url: ajaxurl.customer.getCustomerMobile,
                data: {
                    customerId: vm.customer_id
                },
                success: function (data) {
                    if (data.code == 1) {
                        vm.mobile = data.data;
                        setTimeout(function () {
                            main.form.render();
                        }, 200)
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                },
                error: function () {
                    layers.toast('网络异常');
                }
            })
        },
        /**
         * 完善客户资料提示弹框
         */
        perfectTip: function () {
            if (vm.customer_id) {
                tool.ajax({
                    url: ajaxurl.customer_cooper.checkAddCooperSituation,
                    data: {
                        customerId: vm.customer_id
                    },
                    success: function (data) {
                        if (data.code == 1) { //data.code ==1 表示为可以新增合作情况 否则不能新增
                            vm.editCooperation = true;
                            vm.isCooperAdd = true;
                            main.getCooperttion();
                        } else {
                            layers.open({
                                title: '操作提示',
                                area: ['402px', '254px'],
                                content: perfect,
                                btn: ['下次再说', '去完善'],
                                btn2: function () {
                                    $('.basic-li').addClass('layui-this');
                                    $('.cooper-li').removeClass('layui-this');
                                    var $tabItem = $('.tab-content-wrap').find('.layui-tab-item'),
                                        len = $tabItem.length;
                                    $tabItem.eq(len - 1).removeClass("layui-show");
                                    $tabItem.eq(0).addClass('layui-show');
                                    vm.editBasic = true;

                                }
                            });
                        }
                        main.asynUploadImg();
                        main.cooperLight();
                    },
                    error: function () {
                        layers.toast('网络异常');
                    }
                });
            } else {
                throw new Error('缺少customer_id参数！');
            }
        },
        /**
         * 获取客户已存在的分组
         */
        getCustomerGroup: function (callback) {
            var loading = '';
            tool.ajax({
                url: ajaxurl.customer.getCustomerGroup,
                data: {
                    customerId: vm.customer_id,
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success: function (data) {
                    if (data.code == 1) {
                        vm.clientList = data.data;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                    layers.closed(loading);
                },
                error: function () {
                    layers.toast('网络异常');
                    layers.closed(loading);
                }
            })
        },
        /**
         * 获取员工分组列表
         */
        gropList: function (callback) {
            main.getCustomerGroup(function () {
                tool.ajax({
                    url: ajaxurl.customer_group.getList,
                    type: 'post',
                    success: function (data) {
                        if (data.code == 1) {
                            vm.groupList = data.data;
                            typeof callback === 'function' && callback.call(this);
                        } else {
                            layers.toast(data.message, {
                                icon: 2,
                                anim: 6
                            });
                        }
                    },
                    error: function () {
                        layers.toast('网络异常');
                    }
                })
            });
        },
        /**
         * 编辑客户分组弹框
         */
        editGroup: function () {
            main.gropList(function () {
                if (vm.groupList.length) {
                    layers.open({
                        btn: null,
                        title: '编辑分组',
                        area: ['604px', '373px'],
                        content: editGroup,
                        success: function (layero, index) {
                            var $layero = $(layero);
                            $layero.find('#selectOptionBox').html(template('selectOptions', {
                                data: vm.groupList
                            }));
                            if (vm.clientList && vm.clientList.length) {
                                var html = '';
                                for (var i = 0; i < vm.clientList.length; i++) {
                                    html += "<span>" + vm.clientList[i] + " ; </span>";
                                }
                                $layero.find('.client-group-list').append(html);
                            }
                            var id = '';
                            layui.use('form', function () {
                                var form = layui.form;
                                form.on('select(group)', function (data) {
                                    id = data.value;
                                });
                                form.render();
                            })
                            // 取消
                            $layero.find('.cancel').click(function () {

                                layers.closed(index);
                            });
                            // 确定
                            $layero.find('.ok').click(function () {
                                if (id) {
                                    tool.ajax({
                                        url: ajaxurl.customer.moveGroup,
                                        data: {
                                            customerIds: '[' + vm.customer_id + ']', // 客户id
                                            customGroupId: id // 分组 id
                                        },
                                        success: function (res) {
                                            if (res.code === 1) {
                                                layers.toast('移动分组成功');
                                            } else {
                                                layers.toast(res.message);
                                            }
                                        },
                                        error: function () {
                                            layers.toast('网络异常');
                                        }
                                    });
                                } else {
                                    layers.toast('未选择任何分组');
                                    return false;
                                }
                                layers.closed(index);
                            });
                        }
                    });
                } else {
                    layers.toast('您没有添加任何客户分组，无法移动分组，请先去添加客户分组！');
                }
            })
        },
        /**
         * 添加录音记录弹框
         */
        addRecord: function () {
            var that = this;
            this.getCallRecordAll('', function (html) {
                // layui弹出框
                layers.confirm({
                    title: '添加录音记录',
                    area: ['902px', '610px'],
                    content: addRecord,
                    success: function (obj, index) {
                        var $elem = $(obj),
                            $reloadRecordBox = $elem.find('#reloadRecordBox'),
                            $addfooterspan = $elem.find('.add-footer').find('span');

                        //监听form表单的提交事件
                        main.form.on('submit(searchCallRecordAll)', function (data) {
                            if (data.field.start_time == '' && data.field.end_time == '') { //为空处理
                                layers.toast('请输入你要搜索的内容！', {
                                    icon: 2,
                                    anim: 6
                                });
                                return false;
                            }
                            if (data.field.start_time && data.field.end_time == '') {
                                layers.toast('请选择结束时间！', {
                                    icon: 2,
                                    anim: 6
                                });
                                return false;
                            }
                            if (data.field.start_time == '' && data.field.end_time) {
                                layers.toast('请选择开始时间！', {
                                    icon: 2,
                                    anim: 6
                                });
                                return false;
                            }
                            if (data.field.start_time && data.field.end_time) {
                                if (data.field.start_time > data.field.end_time) {
                                    layers.toast('开始时间不能大于结束时间！', {
                                        icon: 2,
                                        anim: 6
                                    });
                                    return false;
                                }
                            }
                            var times = data.field.start_time + ',' + data.field.end_time;
                            if (times == ',') {
                                times = '';
                            }
                            /* vm.recordSearch.keywords = data.field.name_and_tel; */
                            vm.recordSearch.filter_time = times;
                            that.getCallRecordAll('', function (htmls) {
                                $addfooterspan.text('已选0条').data('checknum', 0);
                                $reloadRecordBox.html(htmls);
                                main.form.render();
                            });
                            return false;
                        });

                        //重置
                        $elem.find('#resetCallRecord').off('click').on('click', function () {
                            /* vm.recordSearch.keywords = ''; */
                            vm.recordSearch.filter_time = '';
                            $elem.find('input[type="text"]').each(function (index, el) {
                                $(this).val('');
                            });
                            that.getCallRecordAll('', function (htmls) {
                                $addfooterspan.text('已选0条').data('checknum', 0);
                                $reloadRecordBox.html(htmls);
                                main.form.render();
                            });
                        });

                        //全选/全不选
                        main.form.on('checkbox(checkAllCall)', function (data) {
                            if (data.elem.checked) {
                                $reloadRecordBox.find('input[name^="tellCall"]').prop('checked', true);
                                var lens = $reloadRecordBox.find('input[name^="tellCall"]').length;
                                $addfooterspan.text('已选' + lens + '条').data('checknum', lens);
                            } else {
                                $reloadRecordBox.find('input[name^="tellCall"]').prop('checked', false);
                                $addfooterspan.text('已选0条').data('checknum', 0);
                            }
                            main.form.render();
                        });

                        //监听每个复选框的选择行为
                        main.form.on('checkbox(checkCallList)', function (data) {
                            var checknum = $addfooterspan.data('checknum');
                            if (data.elem.checked) {
                                checknum++
                            } else {
                                checknum--
                            }
                            $addfooterspan.text('已选' + checknum + '条').data('checknum', checknum);
                        });

                        //load DATA
                        $reloadRecordBox.html(html);


                        //如果用户已经选择了数据  继续选择 统计当前页面选择的条数
                        var init = function () {
                            var editRecord = vm.editFollowData.voice_record;
                            if (editRecord.length) {
                                var checkedLens = $reloadRecordBox.find('input[name^="tellCall"]:checked').length;
                                $addfooterspan.text('已选' + checkedLens + '条').data('checknum', checkedLens);
                            } else {
                                $addfooterspan.text('已选0条').data('checknum', 0);
                            }
                        }
                        init();

                        //分页
                        if (page) {
                            page.init({
                                elem: 'tempPages',
                                count: vm.record_total_page,
                                jump: function (obj, first) {
                                    if (!first) {
                                        that.getCallRecordAll(obj.curr, function (htmls) {
                                            $reloadRecordBox.html(htmls);
                                            init();
                                            main.form.render();
                                        })
                                    }
                                }
                            })
                        }

                        //重新渲染弹窗框里面的form组件
                        main.form.render();
                        main.laydate.render({
                            elem: '#start_time',
                        });
                        main.laydate.render({
                            elem: '#end_time',
                        });
                    },
                    btn2: function (index, layero) {
                        var $elem = $(layero),
                            $reloadRecordBox = $elem.find('#reloadRecordBox');
                        var $inputs = $reloadRecordBox.find('input[name^="tellCall"]'),
                            temp = [];
                        //循环处理选中的状态值
                        $inputs.each(function (index, el) {
                            if ($(this).prop('checked')) {
                                temp.push($(this).val());
                            }
                        });

                        if (temp.length == 0) {
                            layers.toast('你还未选择任何录音记录！', {
                                icon: 2,
                                anim: 6
                            });
                            return false;
                        }
                        var tempLens = temp.length,
                            record_lists = vm.record_lists, //获取原始数据
                            record_lists_lens = record_lists.length, //获取原始数据长度
                            newArr = [];
                        //vm.editFollowData.voice_record
                        if (tempLens) {
                            for (var i = 0; i < tempLens; i++) {
                                for (var j = 0; j < record_lists_lens; j++) {
                                    if (temp[i] == record_lists[j].tel_id) {
                                        newArr.push(record_lists[j]);
                                    }
                                }
                            }
                            //去重处理
                            var voice_record_datas = vm.editFollowData.voice_record;
                            var isRepeat;
                            if (voice_record_datas.length) {
                                var voiceLens = voice_record_datas.length;
                                for (var m = 0; m < newArr.length; m++) {
                                    isRepeat = false;
                                    for (var k = 0; k < voiceLens; k++) {
                                        if (voice_record_datas[k].tel_id == newArr[m].tel_id) {
                                            isRepeat = true;
                                            break;
                                        }
                                    }
                                    if (!isRepeat) {
                                        vm.editFollowData.voice_record.push(newArr[m]);
                                    }
                                }
                                layers.closedAll();
                                return false;
                            }
                            vm.editFollowData.voice_record = newArr;
                        }
                        layers.closedAll();
                        return false;
                    }
                });
            })
            return false;
        },
        /**
         * [getCallRecordAll description] 获取录音记录列表
         * @return {[type]} [description]
         */
        getCallRecordAll: function (cur_page, callback) {
            var that = this;
            var urls = tool.getUrlArgs(),
                customer_id = '';
            if (urls.has) {
                customer_id = urls.data.customer_id;
            }
            tool.ajax({
                url: ajaxurl.ivr.getEmployeeWithCustomer,
                data: {
                    filter_time: vm.recordSearch.filter_time, //vm.filterTime.join(','), //筛选时间/统计时间
                    /* name_and_tel: vm.recordSearch.keywords, */ //vm.keywords, //搜索姓名和电话
                    pagesize: 10, //分页数
                    customer_id: customer_id,
                    curpage: cur_page || 1 //分页参数
                },
                type: 'post',
                success: function (result) {
                    if (result.code == 1) {
                        if (result.data.list != undefined) {
                            var editRecord = vm.editFollowData.voice_record;
                            for (var i = 0, resLens = result.data.list.length; i < resLens; i++) {
                                if (result.data.list[i].ischecked == undefined) {
                                    result.data.list[i].ischecked = false;
                                }
                                if (editRecord.length) { //表示已经选择了一些数据了
                                    for (var j = 0; j < editRecord.length; j++) {
                                        if (editRecord[j].tel_id == result.data.list[i].tel_id) {
                                            result.data.list[i].ischecked = true;
                                        }
                                    }
                                }
                            }
                            var datas = result.data;
                            vm.record_lists = result.data.list;
                            vm.record_total_page = result.data.total_num; //分页总数
                            if (result.data.list.length == 0) {
                                layers.toast('暂无录音记录可添加！');
                                return;
                            }
                            var html = template('CallRecordAllLists', datas);
                            typeof callback === 'function' && callback.call(this, html);
                        }
                    } else {
                        layers.toast(result.message);
                    }
                }
            })
        },
        /**
         * 更改服务期限弹框
         */
        alterServeTime: function (data) {
            layers.confirm({
                title: '更改服务期限',
                area: ['902px', 'auto'],
                content: alterServe,
                success: function (obj, index) {
                    var $elem = $(obj);
                    $elem.find('.product_name').text(data.product_name);
                    $elem.find('.finance_verify_time').text(data.finance_verify_time);
                    $elem.find('.service_end_time').text(data.service_end_time);
                    var $textarea = $elem.find('.layui-textarea'),
                        $num = $elem.find('.text-num');
                    $textarea.on('input', function () {
                        $num.text($textarea.val().length);
                    });
                    var val = $elem.find('.layui-textarea').val();
                    main.laydate.render({
                        elem: '#service-time',
                        type: 'datetime',
                        done: function (value, date) {
                            alert('你选择的日期是：' + value);
                        }
                    });
                },
                btn2: function (index) {
                    layers.closed(index);
                }
            });
        },
        /**
         * 文件上传
         */
        uploadImg: function () {
            if (upload) {
                var uploadloadingfollow = '';
                //跟进信息上传图片
                upload.init({
                    elem: '#follow-upload',
                    url: ajaxurl.upload.ftp_upload,
                    multiple: true,
                    field: 'fileUpload',
                    beforeSend: function () {
                        layers.load(function (indexs) {
                            uploadloadingfollow = indexs;
                        });
                    },
                    done: function (data) {
                        if (data.code == 1) {
                            vm.editFollowData.images.push(data.data);
                        } else {
                            layers.toast(data.message);
                        }
                        layers.closed(uploadloadingfollow);

                    },
                    error: function () {
                        layers.closed(uploadloadingfollow);
                    }
                });
                //合作息上传财务凭证
                upload.init({
                    elem: '#uploadVoucher',
                    url: ajaxurl.upload.ftp_upload,
                    field: 'fileUpload',
                    beforeSend: function () {
                        layers.load(function (indexs) {
                            uploadloadingfollow = indexs;
                        })
                    },
                    done: function (data) {
                        if (data.code == 1) {
                            vm.cooper_situation_base.payment_certificate.push(data.data);
                        } else {
                            layers.toast(data.message);
                        }
                        layers.closed(uploadloadingfollow)
                    },
                    error: function () {
                        layers.closed(uploadloadingfollow);
                    }
                });
                //合作情况线下合规附件上传语音
                layui.use('upload', function () {
                    var upload = layui.upload;
                    upload.render({
                        elem: '#voiceBtn',
                        url: ajaxurl.upload.ftp_upload,
                        field: 'fileUpload',
                        accept: 'audio',
                        exts: 'mp3|wav|ogg', //允许上传的文件后缀
                        size: 20480, //设置文件最大可允许上传的大小，单位 KB。不支持ie8/9
                        beforeSend: function () {
                            layers.load(function (indexs) {
                                uploadloadingfollow = indexs;
                            })
                        },
                        done: function (data) {
                            if (data.code == 1) {
                                vm.cooper_situation_base.attachment.voice.push(data.data);
                            } else {
                                layers.toast(data.message);
                            }
                            layers.closed(uploadloadingfollow);
                        },
                        error: function () {
                            layers.closed(uploadloadingfollow);
                        }
                    });
                });
                //合作情况线下合规附件上传图片
                upload.init({
                    elem: '#uploadAnnex',
                    url: ajaxurl.upload.ftp_upload,
                    field: 'fileUpload',
                    beforeSend: function () {
                        layers.load(function (indexs) {
                            uploadloadingfollow = indexs;
                        })
                    },
                    done: function (data) {
                        if (data.code == 1) {
                            vm.cooper_situation_base.attachment.image.push(data.data);
                        } else {
                            layers.toast(data.message);
                        }
                        layers.closed(uploadloadingfollow)
                    },
                    error: function () {
                        layers.closed(uploadloadingfollow);
                    }
                });
            }
        },
        /**
         *  //销售过程的上传图片
         */
        asynUploadImg: function () {
           
            Vue.nextTick(function () {
                var curElem = $('.cooperation-situation').find('button[id^="salesImgUpload_"]'),
                    uploadloadingfollow = '';
                if (curElem) {
                    $.each(curElem, function (item, n) {
                        var curID = $(this).attr('id'), //salesImgUpload_0
                            curlens = curID.length;
                        curIndex = curID.substring(15, curlens);
                        (function (curIndex, curID) {
                            upload.init({
                                elem: '#' + curID,
                                url: ajaxurl.upload.ftp_upload,
                                field: 'fileUpload',
                                multiple: true,
                                beforeSend: function () {
                                    layers.load(function (indexs) {
                                        uploadloadingfollow = indexs;
                                    })
                                },
                                done: function (data) {
                                    if (data.code == 1) {
                                        vm.sp_saleprocess[curIndex].userimages.push(data.data);
                                    } else {
                                        layers.toast(data.message);
                                    }
                                    layers.closed(uploadloadingfollow)
                                },
                                error: function () {
                                    layers.closed(uploadloadingfollow);
                                }
                            });
                        })(curIndex, curID);

                    })
                }
            })
        },
        /**
         * 获取档案头部信息
         */
        getFileHead: function (render) {
            var loading = '';
            vm.customer_id = tool.getUrlArgs().data.customer_id;
            tool.ajax({
                url: ajaxurl.customer.getInfo,
                data: {
                    customer_id: vm.customer_id
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success: function (data) {
                    if (data.code == 1) {
                        vm.headInfo = data.data;
                        vm.customer_from_channel_text = data.data.from_channel == '******' ? data.data.from_channel : vm.customer_from_channel[data.data.from_channel];
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                        return false;
                    }
                    if (render) {
                        main.form.render();
                    }

                    layers.closed(loading);
                },
                error: function (err) {
                    layers.toast('网络异常!');
                    layers.closed(loading);
                }
            });
            tool.ajax({ //获取客户档案标签
                url: ajaxurl.tag.guest,
                data: {
                    customer_id: vm.customer_id
                },
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        vm.client_guest = data.data.list;
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                },
                error: function (err) {
                    layers.toast('网络异常!');
                }
            })
        },
        /**
         * 获取客户档案详细信息
         */
        getClinetInfo: function () {
            var that = this;
            var loading = '';
            if (vm.customer_id) {
                tool.ajax({
                    url: ajaxurl.customer.getDetail,
                    data: {
                        customer_id: vm.customer_id
                    },
                    type: 'post',
                    beforeSend: function () {
                        layers.load(function (indexs) {
                            loading = indexs;
                        });
                    },
                    success: function (data) {
                        if (data.code == 1) {
                            vm.basicInfo = data.data; //缓存基本变量
                            if (!vm.basicInfo.mobile || !vm.basicInfo.mobile.length) {
                                vm.headInfo.mobile = [{
                                    mobile: '',
                                    is_relation: 0,
                                    contact_id: ''
                                }];
                                vm.basicInfo.mobile = [{
                                    mobile: '',
                                    is_relation: 0,
                                    contact_id: ''
                                }];
                            }
                            vm.basicInfoData = JSON.stringify(data.data);
                            vm.finance_info = data.data.finance_info;
                            vm.financeInfoData = JSON.stringify(data.data.finance_info);
                            //处理省市区三级联动
                            that.getArea('', '', true);
                            if (data.data.province != undefined && data.data.province != 0) {
                                that.getArea(data.data.province, 1, true);
                            }
                            if (data.data.city != undefined && data.data.city != 0) {
                                that.getArea(data.data.city, 2, true);
                            }

                            if (data.data.mobile.length != 0) {
                                var dataMobile = JSON.parse(JSON.stringify(data.data.mobile));
                                var newMobArr = [];
                                //var editMobile = [];
                                for (var k = 0; k < dataMobile.length; k++) {
                                    newMobArr.push({
                                        err: ''
                                    });
                                    // editMobile.push({
                                    //     contact_id:dataMobile[k].contact_id,
                                    //     is_relation:dataMobile[k].is_relation,
                                    //     mobile:dataMobile[k].mobile
                                    // }); 
                                }
                                //vm.editBasicMobiles = editMobile;
                                vm.checkMobile = newMobArr;
                            }
                            Vue.nextTick(function () {
                                layui.use('form', function () {
                                    var form = layui.form;
                                    form.render();
                                })
                                main.monitorCheck();
                            })
                        } else {
                            layers.toast(data.message, {
                                icon: 2,
                                anim: 6
                            });
                        }
                        layers.closed(loading);
                    },
                    error: function (err) {
                        layers.toast('网络异常!');
                        layers.closed(loading);
                    }
                })
            }
        },

        /**
         * 监听基本信息页面单选复选框
         */
        monitorCheck: function () {
            layui.use('form', function () {
                var form = layui.form;
                form.on('radio(from_channel)', function (data) { //监听客户来源单选框
                    //vm.basicInfo.from_channel = data.value;
                    if (data.elem.checked && data.value == 120) {
                        $('div[data-show="from_channel"]').removeClass('layui-hide');
                    } else if (data.elem.checked && data.value != 120) {
                        $('div[data-show="from_channel"]').addClass('layui-hide');
                        $('input[name="mark"]').val('');
                    }
                });
                form.on('checkbox(income_source)', function (data) { //监听收入来源单选框
                    if (data.elem.checked && data.value == 4) {
                        $('div[data-show="showOther"]').removeClass('layui-hide');
                    } else if (data.elem.checked == false && data.value == 4) {
                        $('div[data-show="showOther"]').addClass('layui-hide');
                    }
                });
                form.on('radio(has_debt)', function (data) { //监听有无债券单选框
                    //vm.finance_info.has_debt = data.value;
                    if (data.elem.checked && data.value == 1) {
                        $('div[data-show="has_debt"]').removeClass('layui-hide');
                    } else if (data.elem.checked && data.value != 1) {
                        $('div[data-show="has_debt"]').addClass('layui-hide');
                    }
                });
                form.on('radio(financial_investment_experience)', function (data) { //监听是否金融投资学习经历
                    //vm.finance_info.financial_investment_experience = data.value;
                    if (data.elem.checked && data.value == 1) {
                        $('div[data-show="financial_investment_experience"]').removeClass('layui-hide');
                    } else if (data.elem.checked && data.value != 1) {
                        $('div[data-show="financial_investment_experience"]').addClass('layui-hide');
                        $('input[name="financial_investment_experience_mark"]').val('');
                    }
                });
                form.on('radio(financial_industry_certificate)', function (data) { //监听是否金融资格证书
                    //vm.finance_info.financial_industry_certificate = data.value;
                    if (data.elem.checked && data.value == 1) {
                        $('div[data-show="financial_industry_certificate_mark"]').removeClass('layui-hide');
                    } else if (data.elem.checked && data.value != 1) {
                        $('div[data-show="financial_industry_certificate_mark"]').addClass('layui-hide');
                        $('input[name="financial_industry_certificate_mark"]').val('');
                    }
                });
                //financial_assets
                form.on('checkbox(financial_assets)', function (data) { //监听是否金融资格证书
                    var index = data.elem.name.substring(17, 18);
                    $('input[name="financial_assets_money[' + index + ']"]').prop('disabled', !data.elem.checked)
                    //vm.finance_info.financial_assets[index].is_check = data.elem.checked;
                    if (data.elem.checked == false) {
                        $('input[name="financial_assets_money[' + index + ']"]').val('');
                    }
                });
                //portfolio_investment
                form.on('checkbox(portfolio_investment)', function (data) { //监听是否金融资格证书
                    var index = data.elem.name.substring(21, 22);
                    $('input[name="portfolio_investment_money[' + index + ']"]').prop('disabled', !data.elem.checked)
                    //vm.finance_info.portfolio_investment[index].is_check = data.elem.checked;
                    if (data.elem.checked == false) {
                        $('input[name="portfolio_investment_money[' + index + ']"]').val('');
                    }
                    // if(data.elem.checked){
                    //     $('input[name="portfolio_investment_money['+index+']"]').prop('disabled', false)
                    // }else{
                    //     $('input[name="portfolio_investment_money['+index+']"]').prop('disabled', true)
                    // }
                });
                form.on('select(province)', function (data) {
                    //以下注释的东西会有问题 采用JQ渲染的方式
                    main.getArea(data.value, 1);
                    //vm.basicInfo.province = data.value;
                    //vm.basicInfo.area = [];
                });
                form.on('select(city)', function (data) {
                    //以下注释的东西会有问题 采用JQ渲染的方式
                    main.getArea(data.value, 2);
                    //vm.basicInfo.city = data.value;
                });
                form.on('select(area)', function (data) {
                    //以下注释的东西会有问题 采用JQ渲染的方式
                    //vm.basicInfo.area = data.value;
                });

            });
        },
        /**
         * 号码验证
         * id:客户ID，
         * type:号码类型 1 电话号码 2 微信号 3 QQ号 4 身份证，
         * num：需要验证的号码，
         * action_type ：add 新增 update 编辑
         * index 验证电话号码的时候需要
         * 
         */
        numVerify: function (id, type, num, action_type, index) {
            if (!num) {
                return false;
            }
            if (type == 1) {
                if (!/^[\d]{0,30}/.test(num)) {
                    layers.toast('请输入正确的电话号码', {
                        icon: 2,
                        anim: 6
                    });
                    vm.checkMobile[index].err = '请输入正确的电话号码';
                    return false;
                } else {
                    if(vm.checkMobile[index].err){
                        vm.checkMobile[index].err = '';
                    }
                }
            };
            if (type == 4) {
                if (!num) {
                    var isIDCard = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X|x)$/;
                    if (!isIDCard.test(num)) {
                        layers.toast('请输入正确的身份证号码!', {
                            icon: 2,
                            anim: 6
                        });
                        return false;
                    } else {}
                }
            }
            tool.ajax({
                url: ajaxurl.customer.check,
                data: {
                    customer_id: id,
                    contact_type: type,
                    contact_way: num,
                    action_type: action_type,
                },
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        //1 电话号码 2 微信号 3 QQ号
                        switch (type) {
                            case 1:
                                vm.checkMobile[index].err = '';
                                break;
                            case 2:
                                vm.checkOnly.weixin = '';
                                break;
                            case 3:
                                vm.checkOnly.qq = '';
                                break;
                        }
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                        switch (type) {
                            case 1:
                                vm.checkMobile[index].err = data.message;
                                break;
                            case 2:
                                vm.checkOnly.weixin = data.message;
                                break;
                            case 3:
                                vm.checkOnly.qq = data.message;
                                break;
                        }
                        return false;
                    }
                },
                error: function (err) {
                    layers.toast('网络异常!');
                }
            })
        },
        /**
         * 获取省市地区
         */
        getArea: function (id, type, isrender) {
            tool.ajax({
                url: ajaxurl.customer.getArea,
                data: {
                    pid: id || 0
                },
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        //以下注释的东西会有问题 采用JQ渲染的方式
                        if (!type) {
                            vm.area.province = data.data.list;
                            // vm.area.city = [];
                            // vm.area.county = [];
                        }
                        if (type == 1) {
                            var html = '<option value=""></option>';
                            for (var i = 0; i < data.data.list.length; i++) {
                                if (data.data.list[i].id == vm.basicInfo.city) {
                                    html += '<option selected value="' + data.data.list[i].id + '">' + data.data.list[i].name + '</option>';
                                } else {
                                    html += '<option value="' + data.data.list[i].id + '">' + data.data.list[i].name + '</option>';
                                }
                            }
                            $('select[name="city"]').html(html);
                            $('select[name="area"]').html('');
                            //vm.area.city = data.data.list;
                            //vm.area.county = [];
                        }

                        if (type == 2) {
                            var str = '<option value=""></option>';
                            for (var i = 0; i < data.data.list.length; i++) {
                                if (data.data.list[i].id == vm.basicInfo.area) {
                                    str += '<option selected value="' + data.data.list[i].id + '">' + data.data.list[i].name + '</option>';
                                } else {
                                    str += '<option value="' + data.data.list[i].id + '">' + data.data.list[i].name + '</option>';
                                }
                            }
                            $('select[name="area"]').html(str);
                            //vm.area.county = data.data.list;
                        }

                        Vue.nextTick(function () {
                            layui.use('form', function () {
                                var form = layui.form;
                                form.render('select');
                            })
                        })
                    }
                },
                error: function () {
                    layers.toast('网络异常!');
                }
            })
        },
        /**
         * 编辑基本信息提交
         */
        basicBtn: function (obj) {
            var urls = tool.getUrlArgs();
            obj.customer_id = vm.customer_id; //拼接customer_id
            var flag = true;
            for (var i = 0; i < vm.checkMobile.length; i++) {
                if (vm.checkMobile[i].err != '') {
                    flag = false;
                    layers.toast(vm.checkMobile[i].err, {
                        icon: 2,
                        anim: 6
                    });
                    break;
                }
            }
            if (vm.checkOnly.weixin != '') {
                layers.toast(vm.checkOnly.weixin, {
                    icon: 2,
                    anim: 6
                });
                return;
            }
            if (vm.checkOnly.qq != '') {
                layers.toast(vm.checkOnly.qq, {
                    icon: 2,
                    anim: 6
                });
                return;
            }
            /*if(obj.current_position != ''){//处理有时候不能识别onkeyup事件或者中文状态输入拼音
                if(isNaN(obj.current_position - 0)){
                    layers.toast('当前仓位只能是0~10的数字', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
                if(obj.current_position - 0 > 10 || obj.current_position - 0 < 0){
                    layers.toast('当前仓位只能是大于0小于10的数字', {
                        icon: 2,
                        anim: 6
                    });
                    return;
                }
            }*/
            /*if(obj.age != '******' && obj.age != ''){
                if(isNaN(obj - 0)){
                    layers.toast('请输入正确的年龄', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
            }*/
            //获取页面上的电话输入框，看是否有重复的电话号码
            var mobileInput = $('#basicInfoMobile').find('input[name^="mobile["]');
            var arr = [];
            $.each(mobileInput,function(value,index){
                arr.push($(this).val())
            });
            var nArr = arr.sort();
            for(var i = 0;i<arr.length;i++){
                if(arr[i]!= '' && arr[i] == nArr[i + 1]){
                    layers.toast('电话号码不能重复', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
            }
            var loadIndex = '';
            //basicBtnDisabled
            flag && tool.ajax({
                url: ajaxurl.customer.update,
                data: obj,
                type: "post",
                beforeSend: function () {
                    vm.basicBtnDisabled = true;
                    layers.load(function(lindex){
                        loadIndex = lindex;
                    })
                },
                success: function (data) {
                    if (data.code == 1) {
                        setTimeout(function () {
                            vm.editBasic = false;
                        }, 1000);
                        //如果是新增客户有权限编辑的跳转过来的  编辑成功以后需要重新处理一下url地址
                        if (urls.has && urls.data.type == 1 && urls.data.status == 2) {
                            var jumpUrl = '/admin/customers/customer/update?type=1&customer_id=' + urls.data.customer_id;
                            common.jumpCloseTab(jumpUrl, '基本信息');
                        } else {
                            main.getClinetInfo();
                            main.getFileHead(true);
                        }
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                },
                complete: function () {
                    layers.closed(loadIndex);
                    var $basicInfoMobile = $('#basicInfoMobile');
                    $basicInfoMobile.find('div[data-type="addMobile"]').remove();
                    setTimeout(function () {
                        vm.basicBtnDisabled = false;
                    }, 300);
                },
                error: function (err) {
                    layers.toast('网络异常!');
                }
            });
        },
        /**
         * 初始化筛选跟进信息条件时间选项
         */
        filterFollow: function () {
            main.laydate.render({
                elem: '#follow_start',
                type: 'datetime',
                done: function (value, date) {
                    vm.filterFollow.start_time = value;
                }
            });
            main.laydate.render({
                elem: '#follow_end',
                type: 'datetime',
                done: function (value, date) {
                    vm.filterFollow.end_time = value;
                }
            })
        },
        /**
         * 初始化筛选跟进信息条件
         */
        resetFollow: function (callback) {
            var filterFollow = {
                customer_id: vm.customer_id,
                type: 1, //跟进信息类型 默认为1 销售信息
                operate_real_name: '',
                goods_name: '',
                start_time: '',
                end_time: '',
                followup_content: '', //跟进类型类型 默认为文字
                pagesize: 10, //默认展示条数
                curpage: 1
            };
            vm.filterFollow = filterFollow;
            vm.followup_content = [];
            vm.fContent = [{
                    name: '文字',
                    type: '1',
                    active: false
                },
                {
                    name: '图片',
                    type: '2',
                    active: false
                },
                {
                    name: '语音',
                    type: '3',
                    active: false
                },
            ];
            $('#follow_start').val('');
            $('#follow_end').val('');
            typeof callback === 'function' && callback.call(this);
        },
        /**
         * 多选与取消跟进信息内容：是否包含图片、文字、语音
         */
        followContent: function (index) {
            vm.fContent[index].active = !vm.fContent[index].active;
            var i = vm.fContent[index].type;
            if ($.inArray(i, vm.followup_content) == -1) {
                vm.followup_content.push(i);
            } else {
                vm.followup_content.splice(vm.followup_content.indexOf(i), 1)
            }
        },
        /**
         * [getFollowInfo description] 获取跟进信息
         * @return {[type]}         [description]
         */
        getFollowInfo: function () {
            vm.filterFollow.followup_content = vm.followup_content.join();
            var that = this;
            tool.ajax({
                url: ajaxurl.cooper.index,
                data: vm.filterFollow,
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        vm.followInfo = data.data;
                        that.followLight();
                        that.followPage();
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                },
                error: function (err) {
                    layers.toast('网络异常!');
                }
            })
        },
        /**
         * 编辑,获取某条跟进记录信息
         */
        edit_item_Follow: function (id) {
            vm.followup_id = id;
            if (id) {
                vm.editFollow = true;
                vm.isEditAdd = true; //编辑跟进信息表示
                tool.ajax({
                    url: ajaxurl.cooper.getEdit,
                    data: {
                        followup_id: id
                    },
                    type: 'post',
                    success: function (data) {
                        if (data.code == 1) {
                            var datas = data.data;
                            var onlineLens = vm.global_set.online_consulting_plan.length; //线上产品
                            var lineLens = vm.global_set.line_investment_plan.length; //线下产品
                            var followTypeLens = vm.global_set.follow_up_type.length; //跟进类型
                            var $editFollow = $('.edit-follow');

                            for (var i = 0; i < lineLens; i++) {
                                for (var j = 0; j < datas.offline_product_id.length; j++) {
                                    if (vm.global_set.line_investment_plan[i] == datas.offline_product_id[j]) {
                                        $editFollow.find('input[name^="offline_product_id"][value="' + datas.offline_product_id[j] + '"]').trigger('click');
                                        break;
                                    }
                                }
                            }
                            // //比较线上产品
                            for (var k = 0; k < onlineLens; k++) {
                                for (var y = 0; y < vm.global_set.online_consulting_plan[k].child.length; y++) {
                                    for (var o = 0; o < datas.product_id.length; o++) {
                                        if (vm.global_set.online_consulting_plan[k].child[y].sid == datas.product_id[o]) {
                                            $editFollow.find('input[name^="product_id"][value="' + datas.product_id[o] + '"]').trigger('click');
                                            break;
                                        }
                                    }
                                }
                            }
                            //比较跟进类型
                            if (datas.type != '' || datas.type != null) {
                                for (var m = 0; m < followTypeLens; m++) {
                                    if (datas.type == vm.global_set.follow_up_type[m].id) {
                                        $editFollow.find('input[name^="type"][value="' + datas.type + '"]').trigger('click');
                                        break;
                                    }
                                }
                            }
                            //以下将数据挂到vue对象上
                            vm.editFollowData = data.data;

                            setTimeout(function () {
                                layui.use('form', function () {
                                    var form = layui.form;
                                    form.render();
                                })
                            }, 200)
                        }
                    },
                    error: function (err) {
                        alert('网络异常')
                    }
                })
            }
        },
        /**
         * 删除某条跟进信息
         */
        del_item_Follow: function (id, index) {
            if (id) {
                layers.confirm({
                    content: '<div class="confirm-tips"><p>删除后，本条跟进信息将不存在，确定删除？</p></div>',
                    btn2: function (layindex, layero) {
                        tool.ajax({
                            url: ajaxurl.cooper.del,
                            data: {
                                followup_id: id
                            },
                            type: 'post',
                            success: function (data) {
                                if (data.code == 1) {
                                    vm.followInfo.list.splice(index, 1);
                                    layers.closedAll();
                                } else {
                                    layers.toast(data.message);
                                }
                            },
                            error: function (err) {
                                layers.toast('网络异常!');
                            }
                        })
                        return false;
                    }
                })
            }
        },
        /**
         * 分页获取跟进信息列表
         */
        followPage: function () {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'follow-page',
                    count: vm.followInfo.all_num //数据总数
                        ,
                    limit: vm.filterFollow.pagesize //每页显示条数
                        ,
                    curr: vm.filterFollow.curpage //当前页数
                        ,
                    jump: function (obj, first) {
                        if (!first) {
                            vm.filterFollow.curpage = obj.curr;
                            main.getFollowInfo();
                        }
                    }
                });
            })

        },
        /**
         * 新增、编辑跟进信息提交
         */
        submitFollow: function (data) {
            var url = '',
                that = this;
            vm.isEditAdd ? url = ajaxurl.cooper.edit : url = ajaxurl.cooper.add; //false为新增 true 为编辑
            if (vm.isEditAdd) {
                data.followup_id = vm.followup_id;
            };
            //除掉文本域中的回车换行，否则会导致合作情况销售过程读不出来
            data.record = data.record.replace(/[\r\n]/g,"");
            data.images = vm.editFollowData.images; 
            data.customer_id = vm.customer_id;
            var voiceLens = vm.editFollowData.voice_record.length,
                temp = [];
            if (voiceLens) {
                for (var i = 0; i < voiceLens; i++) {
                    temp.push(vm.editFollowData.voice_record[i].tel_id);
                }
                data.voice_record = temp.join(',');
            }
            data.voice_records = vm.editFollowData.voice_record;

            if (data.type == '' || data.type == undefined) {
                layers.toast('请选择跟进信息类型', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            var loadIndex = '';
            tool.ajax({
                url: url,
                data: data,
                type: 'post',
                beforeSend: function () {
                    that.followBtnFlag = false;
                    layers.load(function(lindex){
                        loadIndex = lindex;
                    })
                },
                success: function (data) {
                    if (data.code == 1) {
                        if (vm.isEditAdd) { //false为新增 true 为编辑
                            layers.toast('编辑成功!');
                        } else {
                            layers.toast('新增成功!');
                        }
                        that.getFollowInfo();
                        $('.edit-follow').find('button[type="reset"]').trigger('click');
                        vm.editFollowData.voice_record = [];
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                    that.followBtnFlag = true;
                    layers.closed(loadIndex);
                },
                error: function () {
                    that.followBtnFlag = true;
                    layers.toast('网络异常!');
                    layers.closed(loadIndex);
                }
            });
            return false;
        },
        /**
         * 获取合作信息列表
         */
        getCooperationList: function () {
            tool.ajax({
                url: ajaxurl.customer_cooper.getList,
                data: {
                    customer_id: vm.customer_id
                },
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        vm.cooperationTable = data.data;
                    } else {
                        return false;
                    }
                },
                error: function () {
                    layers.toast('网络异常!');
                }
            })
        },
        /**
         * 初始化合作情况信息
         */
        setCooperationInfo: function () {
            Vue.nextTick(function () {
                main.monitorCooperation();
            });

        },
        /**
         * 置空关联购买记录信息
         */
        initRecord: function () {
            vm.isPayHistory = false;
            vm.cooper_situation_base.days = '';
            vm.cooper_situation_base.pay_num = '';
            vm.cooper_situation_base.pay_money = '';
            vm.cooper_situation_base.pay_time = '';
            vm.cooper_situation_base.object_id = '';
            vm.cooper_situation_base.agency_time = '';
            vm.cooper_situation_base.is_identity = '';
            vm.cooper_situation_base.is_contract = '';
            vm.cooper_situation_base.goods_price = '';
            vm.cooper_situation_base.is_trade_day = 1;
            vm.cooper_situation_base.buyer_mobile = '';
            vm.cooper_situation_base.agency_status = '';
            vm.cooper_situation_base.third_order_id = '';
            vm.cooper_situation_base.agency_start_time = '';
        },
        /**
         * 获取当前时间
         */
        getNowFormatDate: function () {
            var date = new Date();
            var seperator1 = "-";
            var seperator2 = ":";
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate + " " + '00:00:00';
            return currentdate;
        },
        /**
         * 处理收款账号显示问题
         */
        collection_account: function (callback) {
            if (vm.cooper_situation_base.receive_bank && vm.cooper_situation_base.receive_bank) {
                var len = vm.global_set.collection_account.length;
                for (var i = 0; i < len; i++) {
                    if (vm.global_set.collection_account[i].name == vm.cooper_situation_base.receive_bank) {
                        vm.receive_account = vm.global_set.collection_account[i].acc;
                    }
                    break;
                }
                typeof callback === 'function' && callback.call(this);
                setTimeout(function () {
                    main.form.render('radio');
                }, 100);
            }
        },
        /**
         * 监听合作信息单选复选框,初始化一些默认选项；
         */
        monitorCooperation: function () {
            var urls = vm.getUrls;
            if (!urls.data.status || urls.data.status == 2) {
                if (urls.data.status != 2) { //新增展示默认值
                    //初始赋值
                    vm.isPayHistory = true; //展示关联购买记录按钮
                    vm.cooper_situation_base.product_type = 1; //默认选中第一项线上投顾计划
                    vm.cooper_situation_base.pay_type = 1; //默认选中线上支付
                    if (vm.global_set.online_consulting_plan && vm.global_set.online_consulting_plan.length) { //默认选中第一个产品
                        var online_consulting_plan = vm.global_set.online_consulting_plan[0];
                        if (online_consulting_plan.child && online_consulting_plan.child.length) {
                            vm.cooper_situation_base.product_id = online_consulting_plan.child[0].sid;
                            vm.cooper_situation_base.product_code = online_consulting_plan.child[0].scode;
                            vm.cooper_situation_base.product_name = online_consulting_plan.child[0].sname;
                        }
                    }
                    vm.cooper_situation_base.compliance_type = 1;
                    if (vm.cooper_situation_base.compliance_type == 1) {
                        main.memberCompliance();
                    }
                    vm.cooper_situation_base.contract_type = 1; //默认选择电子合同
                    setTimeout(function () {
                        if (vm.mobile && vm.mobile.length) { //默认选中第一个电话号码
                            vm.cooper_situation_base.pay_mobile = vm.mobile[0];
                        }
                    }, 200)
                }

                //初始化layui表单，时间控件
                layui.use(['form', 'laydate'], function () {
                    var form = layui.form,
                        laydate = layui.laydate;
                    setTimeout(function () {
                        form.render();
                    }, 100);
                    form.on('radio(product_type)', function (data) { //监听线上线下投顾计划单选框
                        vm.cooper_situation_base.product_type = data.value;
                        if (data.value == 2) { //选择线下产品的时候，只能线下购买与纸质合同
                            vm.cooper_situation_base.product_name = vm.global_set.line_investment_plan[0];
                            vm.cooper_situation_base.product_id = '';
                            vm.cooper_situation_base.pay_type = 2; //只能选择线下支付
                            vm.cooper_situation_base.contract_type = 2; //默认纸质合同
                            vm.cooper_situation_base.pay_method = 1; //默认显示银行转账
                            if (vm.global_set.collection_account && vm.global_set.collection_account.length) {
                                var len = vm.global_set.collection_account.length;
                                vm.cooper_situation_base.receive_bank = vm.global_set.collection_account[0].name; //默认显示第一个收款账户
                                if (vm.global_set.collection_account[0].acc && vm.global_set.collection_account[0].acc.length) {
                                    vm.receive_account = vm.global_set.collection_account[0].acc;
                                    vm.cooper_situation_base.receive_account = vm.receive_account[0]; //默认显示第一个账号
                                }
                            }
                            main.initRecord();
                        } else {
                            vm.cooper_situation_base.pay_type = 1;
                            vm.cooper_situation_base.contract_type = 1;
                            if (vm.global_set.online_consulting_plan && vm.global_set.online_consulting_plan.length) { //默认选中第一个产品
                                var online_consulting_plan = vm.global_set.online_consulting_plan[0];
                                if (online_consulting_plan.child && online_consulting_plan.child.length) {
                                    vm.cooper_situation_base.product_id = online_consulting_plan.child[0].sid;
                                    vm.cooper_situation_base.product_code = online_consulting_plan.child[0].scode;
                                    vm.cooper_situation_base.product_name = online_consulting_plan.child[0].sname;
                                }
                            }
                        }
                        setTimeout(function () {
                            form.render();
                        }, 100);
                    });
                    form.on('radio(product_id)', function (data) { //监听所选产品单选框
                        vm.cooper_situation_base.product_id = data.value;
                        $(data.elem).attr('data-code') ? vm.cooper_situation_base.product_code = $(data.elem).attr('data-code') : vm.cooper_situation_base.product_code = '';
                        vm.cooper_situation_base.product_name = $(data.elem).attr('title');
                        main.initRecord();
                    });
                    form.on('radio(pay_type)', function (data) { //监听线上线下支付方式单选框
                        main.initRecord();
                        vm.cooper_situation_base.pay_type = data.value;
                        if (data.value == 2 && data.elem.checked) { //点击线下时
                            vm.cooper_situation_base.is_trade_day = 1; //默认显示自然日
                            vm.cooper_situation_base.contract_type = 2; //默认纸质合同
                            vm.cooper_situation_base.pay_method = 1; //m默认显示银行转账
                            if (vm.global_set.collection_account && vm.global_set.collection_account.length) {
                                var len = vm.global_set.collection_account.length;
                                vm.cooper_situation_base.receive_bank = vm.global_set.collection_account[0].name; //默认显示第一个收款账户和账号
                                vm.receive_account = [];
                                if (vm.global_set.collection_account[0].acc && vm.global_set.collection_account[0].acc.length) {
                                    vm.receive_account = vm.global_set.collection_account[0].acc;
                                    vm.cooper_situation_base.receive_account = vm.receive_account[0];
                                }
                            }
                        }
                        if (data.value == 1 && data.elem.checked) {
                            vm.isPayHistory = true;
                            vm.cooper_situation_base.contract_type = 1;
                        }
                        setTimeout(function () {
                            if (!urls.data.status) {
                                if (data.value == 2 && data.elem.checked) {
                                    vm.cooper_situation_base.pay_time = main.getNowFormatDate(); //显示默认时间为今天
                                } else {
                                    vm.cooper_situation_base.pay_time = '';
                                }
                            }

                            form.render();
                        }, 100);
                    });
                    form.on('radio(pay_mobile)', function (data) { //监听电话号码单选框
                        vm.cooper_situation_base.pay_mobile = data.value;
                        main.initRecord();
                    });
                    form.on('radio(is_trade_day)', function (data) { //监听服务期限单选框
                        vm.cooper_situation_base.is_trade_day = data.value;
                    });
                    form.on('radio(pay_method)', function (data) { //监听付费方式单选框
                        vm.cooper_situation_base.pay_method = data.value;
                    });

                    if (urls.data.status == 2) { //处理编辑状态下的收款账号显示问题
                        main.collection_account();
                    }
                    form.on('radio(receive_bank)', function (data) { //监听收款银行单选框
                        vm.cooper_situation_base.receive_bank = data.value;
                        var receive_bank = vm.global_set.collection_account,
                            len = receive_bank.length;
                        for (var i = 0; i < len; i++) {
                            if (data.value == receive_bank[i].name) {
                                vm.receive_account = [];
                                vm.receive_account = receive_bank[i].acc;
                                break;
                            }
                        };
                        //这里是为了解决 vue渲染和layui render的问题
                        //layui render会循环出 重复的DOM节点  但是真实的单选是对的
                        //源码中 hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender  好像在这里并没有生效  
                        // 连同vue渲染的是  hasRender[0] 返回了  undefined  
                        $('#removeLayui').find('.layui-form-radio').remove(); //移除掉全部的layui 单选框样式
                        Vue.nextTick(function () {
                            vm.cooper_situation_base.receive_account = vm.receive_account[0];
                            setTimeout(function () {
                                form.render('radio');
                            }, 300);
                        });
                    });
                    form.on('radio(receive_account)', function (data) { //监听收款账号单选框
                        vm.cooper_situation_base.receive_account = data.value;
                    });
                    form.on('radio(compliance_type)', function (data) { //监听合规类型选框
                        vm.cooper_situation_base.compliance_type = data.value;
                        if (data.value == 1) {
                            main.memberCompliance();
                        }
                        if (data.value == 2) {
                            vm.cooper_situation_base.compliance_status = 1; //合规状态 0 未合规 1 已合规
                            vm.cooper_situation_base.adapt = '普通投资者'; //适当性评测
                            vm.cooper_situation_base.risk = '保守型'; //风险评测
                        }
                        setTimeout(function () {
                            form.render();
                        }, 100);
                    });
                    form.on('radio(compliance_status)', function (data) { //监听合规状态单选框
                        vm.cooper_situation_base.compliance_status = data.value;
                    });
                    form.on('radio(risk)', function (data) { //监听风险评测单选框
                        vm.cooper_situation_base.risk = data.value;
                    });
                    form.on('radio(adapt)', function (data) { //监听适当性评测单选框
                        vm.cooper_situation_base.adapt = data.value;
                    });
                    form.on('radio(contract_type)', function (data) { //监听合同类型单选框
                        vm.cooper_situation_base.contract_type = data.value;
                    });
                    laydate.render({
                        elem: '#product_pay_time',
                        type: 'datetime',
                        done: function (value, date) {
                            vm.cooper_situation_base.pay_time = value;
                        }
                    });
                });
            }

        },
        /**
         * 关联购买记录弹框
         */
        payRecord: function () {
            var loading = '';
            tool.ajax({
                url: ajaxurl.customer_cooper.orderList,
                data: {
                    asc_id: vm.cooper_situation_base.product_id,
                    mobile: vm.cooper_situation_base.pay_mobile,
                    customer_id: vm.customer_id,
                },
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success: function (data) {
                    if (data.code == 1) {
                        var data = data.data.list,
                            liItem = {};
                        layers.confirm({
                            title: '关联购买记录',
                            area: ['902px', '480px'],
                            btn: null,
                            content: payRecord,
                            success: function (obj, index) {
                                var $obj = obj,
                                    len = data.length,
                                    html = '';
                                for (var i = 0; i < len; i++) {
                                    html += '<li><div class="checkbox-box"><input type="radio" name="record" lay-filter="pay-record" title=" " value=' + i + ' lay-skin="primary"></div>' +
                                        ' <div class="li-item pay-account">' + data[i].buyer_mobile + '</div>' +
                                        '<div class="li-item pay-time">' + data[i].payment_time + '</div>' +
                                        '<div class="li-item">' + data[i].goods_name + '</div>' +
                                        '<div class="li-item ">' + data[i].agency_status + '</div>' +
                                        '<div class="li-item ">' + data[i].order_amount + '</div></li>'
                                };
                                $obj.find('.lists').append(html);
                                layui.use('form', function () {
                                    var form = layui.form;
                                    form.render(null, 'pay-record_box');
                                    form.on('radio(pay-record)', function (o) {
                                        liItem = data[o.value];
                                    })
                                });
                                $obj.find('.cancel').on('click', function () {
                                    layers.closed(index);
                                });
                                $obj.find('.ok').on('click', function () {
                                    layers.closed(index);
                                    vm.cooper_situation_base.pay_num = 1;
                                    vm.cooper_situation_base.third_order_id = liItem.order_id;
                                    vm.cooper_situation_base.days = liItem.days;
                                    vm.cooper_situation_base.goods_price = liItem.price;
                                    vm.cooper_situation_base.pay_money = liItem.order_amount;
                                    vm.cooper_situation_base.pay_time = liItem.payment_time;
                                    vm.cooper_situation_base.is_trade_day = liItem.is_trade_day;
                                    vm.cooper_situation_base.buyer_mobile = liItem.buyer_mobile;
                                    vm.cooper_situation_base.agency_start_time = liItem.agency_start_time;
                                    vm.cooper_situation_base.agency_time = liItem.agency_time;
                                    vm.cooper_situation_base.is_identity = liItem.is_identity;
                                    vm.cooper_situation_base.is_contract = liItem.is_contract;
                                    vm.cooper_situation_base.object_id = liItem.object_id;
                                    vm.cooper_situation_base.agency_status = liItem.agency_status;
                                    vm.isPayHistory = true;
                                })
                            },
                        });
                    } else {
                        layers.toast('暂无购买记录可关联，请重新选择产品名称或购买电话！', {
                            icon: 2,
                            anim: 6
                        });
                    }
                    layers.closed(loading);
                },
                error: function (err) {
                    layers.toast('网络异常!');
                    layers.closed(loading);
                }
            });
            return false;

        },
        /**
         * 查询第三方合规信息
         */
        memberCompliance: function () {
            tool.ajax({
                url: ajaxurl.customer_cooper.memberCompliance,
                data: {
                    customer_id: vm.customer_id,
                },
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        vm.cooper_situation_base.compliance_status = data.data.is_identity; //合规状态
                        vm.cooper_situation_base.adapt = data.data.adapt; //适当性评测
                        vm.cooper_situation_base.risk = data.data.risk; //风险评测
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                        vm.cooper_situation_base.compliance_type = ''
                    }
                },
                error: function () {
                    layers.toast('网络异常!');
                }
            })
        },
        /**
         * 初始化layui表单，时间
         */
        initLayui: function () {
            var that = this;
            layui.use(['form', 'laydate'], function () {
                main.laydate = layui.laydate;
                main.form = layui.form;
                main.filterFollow();
                var form = layui.form;
                form.verify({
                    username: function (value, item) { //value：表单的值、item：表单的DOM对象
                        /* if (!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]+$").test(value)) {
                            return '用户名不能有特殊字符';
                        } */
                        /* if (/(^\_)|(\__)|(\_+$)/.test(value)) {
                            return '用户名首尾不能出现下划线\'_\'';
                        }
                        if (/^\d+\d+\d$/.test(value)) {
                            return '用户名不能全为数字';
                        } */
                        if (!value) {
                            return '姓名不能为空'
                        }
                    },
                    required: function (value, item) {
                        if (!value) {
                            return '必填项不能为空'
                        }
                    },
                    current_position:function(value,item){//当前仓位
                        if(value){
                            if(isNaN(value - 0)){
                                return '当前仓位只能是0~10的数字';
                            }
                            if(value - 0 > 10 || value - 0 < 0){
                                return '当前仓位只能是大于0小于10的数字';
                            }
                        }
                    },
                    pay_num: function (value, item) {
                        if (!value) {
                            return '请输入购买数量'
                        }
                    },
                    days: function (value, item) {
                        if (!value) {
                            return '请输入服务期限'
                        }
                    },
                    goods_price: function (value, item) {
                        if (!value) {
                            return '请输入商品价格'
                        }
                    },
                    pay_money: function (value, item) {
                        if (!value) {
                            return '请输入付费金额'
                        }
                    },
                    pay_time: function (value, item) {
                        if (!value) {
                            return '请输入交费日期'
                        }
                    },
                    payer: function (value, item) {
                        if (!value) {
                            return '请输入付费人'
                        }
                    },
                    pay_bank: function (value, item) {
                        if (!value) {
                            return '请输入付费银行'
                        }
                    },
                    /*payment_account: function (value, item) {
                        if (!value) {
                            return '请输入付费账号'
                        }
                    },*/
                    noRequiredNum:function(value,item){
                        if(value){
                            if(isNaN(value - 0)){
                                return '请输入正确的数字'
                            }
                        }
                    }
                });
                form.on('submit(ok)', function (data) { //基本信息提交
                    //暂时注释掉
                    // for (var i in data.field) {
                    //     if (i.indexOf('financial_assets[') != -1) {
                    //         if ($.trim(data.field['financial_assets_money[' + i.charAt(17) + ']']) == '') {
                    //             layers.toast('请输入金融资产金额', {
                    //                 icon: 2,
                    //                 anim: 6
                    //             });
                    //             return false;
                    //         }
                    //     }
                    //     if (i.indexOf('portfolio_investment[') != -1) {
                    //         if ($.trim(data.field['portfolio_investment_money[' + i.charAt(21) + ']']) == '') {
                    //             layers.toast('请输入证券投资金额', {
                    //                 icon: 2,
                    //                 anim: 6
                    //             });
                    //             return false;
                    //         }
                    //     }
                    // }
                    //return false;
                    var tempArr = [];
                    for (var i in data.field) { //循环push电话号码
                        if (i.indexOf('mobile[') != -1) {
                            tempArr.push(data.field[i]);
                        }
                    }
                    var flag = false;
                    for (var j = 0; j < tempArr.length; j++) {
                        if ($.trim(tempArr[j]) != '') {
                            flag = true;
                            break;
                        }
                    }
                    if (flag == false && $.trim(data.field.qq) == '' && $.trim(data.field.weixin) == '') {
                        layers.toast('请输入电话、QQ、微信号其中一个后，保存客户信息！', {
                            icon: 2,
                            anim: 6
                        });
                        return false;
                    } else {
                        flag = true;
                    }

                    //如果填写了身份证  就验证
                    if ($.trim(data.field.id_card) != '' && $.trim(data.field.id_card) != '******') {
                        var isIDCard = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X|x)$/;
                        if (!isIDCard.test(data.field.id_card)) {
                            layers.toast('请输入正确的身份证号码！', {
                                icon: 2,
                                anim: 6
                            });
                            return false;
                        }
                    }
                    //失去所有焦点
                    $('.basic-first-content').find('input[type="text"]').each(function () {
                        $(this).blur();
                    });
                    //延迟执行
                    setTimeout(function () {
                        flag && main.basicBtn(data.field);
                    }, 500);
                    return false;
                });
                form.on('submit(followBtn)', function (data) { //跟进信息提交
                    that.followBtnFlag && that.submitFollow(data.field);
                    return false;
                });
                form.on('submit(cooprationBtn)', function (data) { //合作信息信息提交
                    main.cooperTionBtn();
                    return false;
                });
            });
        },
        /**
         * [delImage description] 删除图片
         * @param  {[type]}   image       [description]
         * @param  {[type]}   thumb_image [description]
         * @param  {Function} callback    [description]
         * @return {[type]}               [description]
         */
        delImage: function (image, thumb_image, callback) {
            if (!image && !thumb_image) {
                throw new Error('缺少图片路径！');
            }
            var src = image + ',' + thumb_image,
                loadIndex = '';
            tool.ajax({
                url: ajaxurl.upload.deleteOssFile,
                data: {
                    delete_file_path: src
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (index) {
                        loadIndex = index;
                    })
                },
                success: function (result) {
                    if (result.code == 1) {
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(result.message);
                    }
                },
                complete: function () {
                    if (loadIndex != undefined) {
                        layers.closed(loadIndex);
                    }
                }
            })
        },
        /**
         *  删除语音
         */
        delVioce: function (url, callback) {
            if (!url) {
                throw new Error('缺少语音路径！');
            }
            var loadIndex = '';
            tool.ajax({
                url: ajaxurl.upload.deleteOssFile,
                data: {
                    delete_file_path: url,
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (index) {
                        loadIndex = index;
                    })
                },
                success: function (result) {
                    if (result.code == 1) {
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(result.message);
                    }
                },
                complete: function () {
                    if (loadIndex != undefined) {
                        layers.closed(loadIndex);
                    }
                }
            })

        },
        /**
         * [lightboxInit description] 初始化灯箱效果 编辑新增展示的效果
         * @return {[type]} [description]
         */
        lightboxInit: function () {
            lightbox.init('#follow-upload-list section');
        },
        /**
         * [followLight description]跟进信息灯箱 列表
         * @return {[type]} [description]
         */
        followLight: function () {
            var $follow_info = '';
            Vue.nextTick(function () {
                $follow_info = $('.follow-info-content').find('div[id^="follow_info_"]');
                if ($follow_info.length) {
                    $follow_info.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
            })
        },
        /**
         * [cooperLight description] 销售过程中的灯箱
         * @return {[type]} [description]
         */
        cooperLight: function () {
            Vue.nextTick(function () {
                var $saleimgboxs = $('.cooperation-situation').find('section[id^="saleimgboxs_"]'); //编辑销售过程输入框中的图片
                if ($saleimgboxs.length) {
                    $saleimgboxs.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
                var $productIamges = $('.sales-item-content').find('div[id^="productIamges_"]'); //销售过程中的灯箱图
                if ($productIamges.length) {
                    $productIamges.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
                var $financeImgs = $('.cooperation-situation').find('#financeBoxs');
                if ($financeImgs.length) {
                    $financeImgs.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
                //financeCkeckBoxs
                var $justiceboxs = $('.cooperation-situation').find('#justiceboxs'); //查看付费凭证
                if ($justiceboxs.length) {
                    $justiceboxs.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
                var $financeCkeckBoxs = $('.cooperation-situation').find('#financeCkeckBoxs');
                if ($financeCkeckBoxs.length) {
                    $financeCkeckBoxs.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
                var $annexImages = $('.cooperation-situation').find('#annexImages'); //附件图片
                if ($annexImages.length) {
                    $annexImages.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
                var $examineImages = $('.cooperation-situation').find('#examineImages'); //付费凭证
                if ($examineImages.length) {
                    $examineImages.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
            })
        },
        /**
         * 获取关联跟进信息数据
         */
        gettrackData: function (cur_page, callback, cindex) {
            var that = this,
                loading = '';
            tool.ajax({
                url: ajaxurl.cooper.index,
                data: {
                    customer_id: vm.customer_id,
                    type: vm.associateTrackData.type,
                    operate_real_name: vm.associateTrackData.operate_real_name,
                    goods_name: vm.associateTrackData.goods_name,
                    start_time: vm.associateTrackData.start_time,
                    end_time: vm.associateTrackData.end_time,
                    followup_content: vm.associateTrackData.followup_content,
                    pagesize: 4,
                    curpage: cur_page || 1
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success: function (data) {
                    if (data.code == 1) {
                        if (data.data.list != undefined) {
                            for (var i = 0, len = data.data.list.length; i < len; i++) {
                                if (data.data.list[i].ischecked == undefined) {
                                    data.data.list[i].ischecked = false;
                                }
                                if (vm.sp_saleprocess[cindex].info.length) { //表示已经选择了一些数据了
                                    for (var j = 0, lens = vm.sp_saleprocess[cindex].info.length; j < lens; j++) {
                                        if (vm.sp_saleprocess[cindex].info[j].followup_id == data.data.list[i].followup_id) {
                                            data.data.list[i].ischecked = true;
                                        }
                                    }
                                }
                            }
                        }
                        var datas = data.data;
                        vm.trackList = data.data.list;
                        vm.track_page = data.data.all_num;
                        var html = template('track', datas);
                        typeof callback === 'function' && callback.call(this, html);
                    } else {
                        layers.toast(data.message);
                    }
                    layers.closed(loading);
                },
                error: function (err) {
                    layers.toast('网络异常!');
                    layers.closed(loading);
                }
            });
        },
        /**
         * 关联跟进信息弹框
         */
        associateTrack: function (indexs) {
            var that = this;
            this.gettrackData('', function (html) {
                layers.open({
                    title: '关联跟进信息',
                    area: ['902px', 'auto'],
                    btn: null,
                    content: track,
                    success: function (obj, n) {
                        var $elem = $(obj),
                            $reloadRecordBox = $elem.find('#content'),
                            $addfooterspan = $elem.find('.add-footer').find('#total');
                        $elem.find('.layui-layer-content').css('height', 'auto');
                        layui.use(['form', 'laydate', 'laypage'], function () { //初始化layui
                            var form = layui.form,
                                laydate = layui.laydate,
                                laypage = layui.laypage;
                            laydate.render({ //初始化时间
                                elem: '#start_track',
                                type: 'datetime',
                                done: function (value, date) {
                                    vm.associateTrackData.start_time = value;
                                }
                            });
                            laydate.render({ //初始化时间
                                elem: '#end_track',
                                type: 'datetime',
                                done: function (value, date) {
                                    vm.associateTrackData.end_time = value;
                                }
                            });
                        });
                        $elem.find('.reset-btn').on('click', function () { //重置操作
                            $elem.find('.operator').val('')
                            $elem.find('.product').val('');
                            $elem.find('input[type="text"]').each(function (index, el) {
                                $(this).val('');
                            });
                            vm.associateTrackData = { //获取关联跟进信息参数
                                    customer_id: '',
                                    type: '',
                                    operate_real_name: '',
                                    goods_name: '',
                                    start_time: '',
                                    end_time: '',
                                    followup_content: '',
                                },
                                that.gettrackData('', function (htmls) {
                                    $reloadRecordBox.html(htmls);
                                    main.form.render();
                                    trackPage();
                                },indexs);
                        });
                        $elem.find('.inquire-btn').on('click', function () { //查询操作
                            vm.associateTrackData.operate_real_name = $elem.find('input[name="operator"]').val();
                            vm.associateTrackData.goods_name = $elem.find('input[name="product"]').val();
                            if (vm.associateTrackData.end_time && vm.associateTrackData.start_time) {
                                if (vm.associateTrackData.end_time < vm.associateTrackData.start_time) {
                                    layers.toast('结束时间不能小于开始时间', {
                                        icon: 2,
                                        anim: 6
                                    });
                                    return false;
                                }
                            }
                            that.gettrackData('', function (htmls) {
                                $reloadRecordBox.html(htmls);
                                main.form.render();
                                trackPage();
                            },indexs);
                            return false;
                        });
                        main.form.on('checkbox(checkAllCall)', function (data) { //全选与全部取消
                            if (data.elem.checked) {
                                $reloadRecordBox.find('input[name="checkItem"]').prop('checked', true);
                                var lens = $reloadRecordBox.find('input[name^="checkItem"]').length;
                                $addfooterspan.text('已选' + lens + '条').data('checknum', lens);
                            } else {
                                $reloadRecordBox.find('input[name="checkItem"]').prop('checked', false);
                                var num = $addfooterspan.data('checknum') - 4;
                                if (num < 0) {
                                    num = 0;
                                }
                                $addfooterspan.text('已选0条').data('checknum', num);
                            }
                            main.form.render();
                        });
                        //监听每个复选框的选择行为
                        main.form.on('checkbox(checkItem)', function (data) {
                            var checknum = $addfooterspan.data('checknum') || 0;
                            if (data.elem.checked) {
                                checknum++
                            } else {
                                $reloadRecordBox.find('input[name="checkAllCall"]').prop('checked', false);
                                checknum--
                            }
                            $addfooterspan.text('已选' + checknum + '条').data('checknum', checknum);
                            main.form.render();
                        });
                        $reloadRecordBox.html(html);
                        main.form.render();
                        //如果用户已经选择了数据  继续选择 统计当前页面选择的条数
                        var init = function () {
                            if (vm.trackList.length) {
                                var checkedLens = $reloadRecordBox.find('input[name^="checkItem"]:checked').length;
                                $addfooterspan.text('已选' + checkedLens + '条').data('checknum', checkedLens);
                            } else {
                                $addfooterspan.text('已选0条').data('checknum', 0);
                            }
                        }
                        init();
                        var trackPage = function () {
                            if (page) {
                                page.init({
                                    elem: 'track-page',
                                    count: vm.track_page,
                                    limit: 4,
                                    jump: function (obj, first) {
                                        if (!first) {
                                            that.gettrackData(obj.curr, function (htmls) {
                                                $reloadRecordBox.html(htmls);
                                                init();
                                                main.form.render();
                                            }, indexs);
                                        }
                                    }
                                })
                            }
                        }
                        trackPage();
                        $elem.find('.ok').on('click', function () { //点击确定

                            vm.cooper_situation_base.is_saleprocess = 1;
                            var temp = [],
                                $inputs = $elem.find('input[name^="checkItem"]');
                            $inputs.each(function (index, el) {
                                if ($(this).prop('checked')) {
                                    vm.trackList[index].sp_type = 2; //打上跟进信息的表示
                                    temp.push(vm.trackList[index]);
                                }
                            });
                            vm.sp_saleprocess[indexs].info = vm.sp_saleprocess[indexs].info.concat(temp);
                            var info = vm.sp_saleprocess[indexs].info;
                            var arr_id = [],
                                arr = [];
                            for (var i = 0; i < info.length; i++) { //把数组中 带followup_id 与 不带的分开存起来。
                                if (info[i].followup_id != undefined) {
                                    arr_id.push(info[i]);
                                } else {
                                    arr.push(info[i]);
                                }
                            };
                            arr_id = main.unique(arr_id); //数组对象去重
                            vm.sp_saleprocess[indexs].info = arr_id.concat(arr); //两个数组合并
                            /* vm.sp_saleprocess[indexs].info = main.unique(vm.sp_saleprocess[indexs].info); */
                            layers.closedAll();
                            return false;
                        });
                        $elem.find('.cancel').on('click', function () {
                            layers.closedAll();
                            return false;
                        })
                    }
                })
            }, indexs);

        },
        /**
         * 数组对象根据参数去重
         */
        unique: function (arr) {
            var result = {};
            var finalResult = [];
            for (var i = 0; i < arr.length; i++) {
                result[arr[i].followup_id] = arr[i];
            }
            for (var item in result) {
                finalResult.push(result[item]);
            }
            return finalResult;
        },
        /**
         * 新增销售过程与跟进记录
         */
        addSaleprocess: function (index) {
            $('.sales-process').find('.sales-process-item').eq(index).find('.new-item-content').removeClass('layui-hide');
        },
        /**
         * 新增销售过程点击编辑确定后，数据处理。
         */
        addProductItem: function (index) {
            vm.cooper_situation_base.is_saleprocess = 1;
            var len = vm.sp_saleprocess[index].info.length;
           /* if(!len){
                var obj = {
                    customer_cooper_situation_saleprocess_id: '', //合作情况销售过程ID
                    sp_type: '', //2(销售过程类型:1销售过程,2跟进记录)
                    employee_id: '', //员工ID
                    employee_nickname: '', //销售人员
                    employee_department: '', //销售人员部门
                    text_record: '', //记录文字
                    create_time: '', //创建日期
                    product_info: [],
                    images: [],
                    voice_records: []
                }
                vm.sp_saleprocess[index].info.push(obj);
            }
            var len = vm.sp_saleprocess[index].info.length;
            if (vm.sp_saleprocess[index].info[len - 1].create_time == '' && vm.sp_saleprocess[index].info[len - 1].text_record == '' && vm.sp_saleprocess[index].info[len - 1].images.length == 0) {
                vm.sp_saleprocess[index].info[len - 1].text_record = vm.sp_saleprocess[index].userdesc.replace(/[\r\n]/g,"");//处理掉回车换行
                vm.sp_saleprocess[index].info[len - 1].images = vm.sp_saleprocess[index].userimages;
                vm.sp_saleprocess[index].info[len - 1].sp_type = 1;
            } else {
                vm.sp_saleprocess[index].info.push({
                    text_record: vm.sp_saleprocess[index].userdesc.replace(/[\r\n]/g,""),//处理掉回车换行
                    images: vm.sp_saleprocess[index].userimages,
                    sp_type: 1,
                });
            }*/
            var obj = {
                    customer_cooper_situation_saleprocess_id: '', //合作情况销售过程ID
                    sp_type: '1', //2(销售过程类型:1销售过程,2跟进记录)
                    employee_id: '', //员工ID
                    employee_nickname: '', //销售人员
                    employee_department: '', //销售人员部门
                    text_record: vm.sp_saleprocess[index].userdesc.replace(/[\r\n]/g,""), //记录文字
                    create_time: '', //创建日期
                    product_info: [],
                    images:vm.sp_saleprocess[index].userimages,
                    voice_records: [],
                };
            if(obj.text_record =='' && !obj.images.length){
                $('.sales-process').find('.sales-process-item').eq(index).find('.new-item-content').addClass('layui-hide');
                return;
            }
            vm.sp_saleprocess[index].info.push(obj);
            vm.sp_saleprocess[index].userdesc = '';
            vm.sp_saleprocess[index].userimages = [];
            $('.sales-process').find('.sales-process-item').eq(index).find('.new-item-content').addClass('layui-hide');
            //新增确认以后的灯箱效果
            Vue.nextTick(function () {
                var $productIamges = $('.sales-item-content').find('div[id^="productIamges_"]'); //销售过程中的灯箱图
                if ($productIamges.length) {
                    $productIamges.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
            })
        },
        /**
         * 合作情况提交表单必填项验证
         */
        cooperVerify: function () {
            var flag = false;
            if (vm.cooper_situation_base.product_type == 1) {
                if (!vm.global_set.online_consulting_plan || vm.global_set.online_consulting_plan.length == 0) {
                    layers.toast('暂无产品可供选择，请联系管理员配置后，提交合作情况！', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
            }
            if (vm.cooper_situation_base.product_type == 2) {
                if (!vm.global_set.line_investment_plan || vm.global_set.line_investment_plan.length == 0) {
                    layers.toast('暂无产品可供选择，请联系管理员配置后，提交合作情况！', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
            }
            if (!vm.cooper_situation_base.product_type) {
                layers.toast('请选择产品类型', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            if (!vm.cooper_situation_base.product_name) {
                layers.toast('请选择产品', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            if (!vm.cooper_situation_base.pay_type) {
                layers.toast('请选择支付方式', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            if (vm.isPayHistory) { //选择线上支付方式，需要关联购买记录
                if (!vm.cooper_situation_base.pay_num || !vm.cooper_situation_base.goods_price) {
                    layers.toast('请关联线上投顾计划的购买记录，否则无法提交', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
            }
            if (vm.cooper_situation_base.pay_type == 1 && !vm.cooper_situation_base.pay_mobile) {
                layers.toast('请选择购买电话', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            if (vm.cooper_situation_base.pay_type == 2) { //线下支付必填项
                if (!vm.cooper_situation_base.is_trade_day) {
                    layers.toast('请选择服务期限', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
                if (!vm.cooper_situation_base.pay_method) {
                    layers.toast('请选择付费方式', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
                if (!vm.cooper_situation_base.receive_bank) {
                    layers.toast('请选择收款方式', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
                if (!vm.cooper_situation_base.receive_account) {
                    layers.toast('请选择收款账号', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
            }
            if (!vm.cooper_situation_base.compliance_type) {
                layers.toast('请选择合规类型', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            if (vm.cooper_situation_base.compliance_type == 2) {
                if (!vm.cooper_situation_base.compliance_status && vm.cooper_situation_base.compliance_status != 0) {
                    layers.toast('请选择合规状态', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
                if (!vm.cooper_situation_base.risk) {
                    layers.toast('请选择风险评测', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
                if (!vm.cooper_situation_base.adapt) {
                    layers.toast('请选择适当性评测', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
                if (vm.cooper_situation_base.attachment.image.length == 0 && vm.cooper_situation_base.attachment.voice.length == 0) {
                    layers.toast('请上传附件', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
            }
            if (!vm.cooper_situation_base.contract_type) {
                layers.toast('请选择合同类型', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            flag = true;
            return flag;
        },
        /**
         * 删除无用的数据
         */
        handleSp_saleprocess: function () {
            var len = vm.sp_saleprocess.length;
            for (var i = 0; i < len; i++) {
                if (vm.sp_saleprocess[i].info && vm.sp_saleprocess[i].info.length) {
                    var info = vm.sp_saleprocess[i].info,
                        lens = info.length;
                    for (var j = 0; j < lens; j++) {
                        if (info[j].sp_type == "") {
                            info.splice(j, 1);
                            break;
                        }
                    }
                }
            };
            var arr = [];
            for (var i = 0; i < vm.sp_saleprocess.length; i++) {
                if (vm.sp_saleprocess[i].info.length) {
                    arr.push(vm.sp_saleprocess[i]);
                }
            };
            return arr;
        },
        /**
         * 合作情况提交
         */
        cooperTionBtn: function () {
            var flag = main.cooperVerify(),
                data = {};
            if (!flag) {
                return false;
            }
            data.cooper_situation_base = vm.cooper_situation_base;
            data.cooper_situation_base.customer_id = vm.customer_id;
            data.sp_saleprocess = main.handleSp_saleprocess();;
            if (vm.remarkWord) {
                data.cooper_situation_base.remark = vm.remarkWord;
                vm.remarkWord = '';
            }
            var urls = vm.getUrls,
                that = this;
            $('#cooperation-btn').attr("disabled", true);
            if (vm.isCooperAdd) { //新增合作情况提交
                var loading = '';
                tool.ajax({
                    url: ajaxurl.customer_cooper.add,
                    data: data,
                    type: 'post',
                    beforeSend: function () {
                        layers.load(function (indexs) {
                            loading = indexs;
                        });
                    },
                    success: function (data) {
                        if (data.code == 1) {
                            layers.toast('提交成功!');
                            setTimeout(function () {
                                common.getTabLinkWithJS({
                                    name: '客户审批',
                                    url: '/admin/examination/my_audit/all_list',
                                });
                            }, 1000);
                        } else {
                            layers.toast(data.message, {
                                icon: 2,
                                anim: 6
                            });
                            $('#cooperation-btn').attr("disabled", false);
                        }
                        layers.closed(loading);
                    },
                    error: function () {
                        layers.toast('网络异常!');
                        layers.closed(loading);
                        $('#cooperation-btn').attr("disabled", false);
                    }
                });
            } else {
                var loading = '';
                tool.ajax({
                    url: ajaxurl.customer_cooper.update,
                    data: data,
                    type: 'post',
                    beforeSend: function () {
                        layers.load(function (indexs) {
                            loading = indexs;
                        });
                    },
                    success: function (data) {
                        if (data.code == 1) {
                            layers.toast('提交成功!');
                            setTimeout(function () {
                                common.getTabLinkWithJS({
                                    name: '客户审批',
                                    url: '/admin/examination/my_audit/all_list',
                                });
                            }, 1000);
                        } else {
                            layers.toast(data.message, {
                                icon: 2,
                                anim: 6
                            });
                            $('#cooperation-btn').attr("disabled", false);
                        }
                        layers.closed(loading);
                    },
                    error: function () {
                        layers.toast('网络异常!');
                        $('#cooperation-btn').attr("disabled", false);
                        layers.closed(loading);
                    }
                });
            }
            return false;
        },
        /**
         * 获取客户备注列表
         */
        getTagMark: function (callback) {
            tool.ajax({
                url: ajaxurl.customer.getListTagMark,
                data: {},
                success: function (res) {
                    if (res.code === 1) {
                        // 备注 && 标签
                        vm.remarkList = res.data.marklist;
                        vm.tagList = res.data.taglist;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(res.message);
                    }
                },
                error: function () {
                    layers.toast('网络异常');
                }
            });
        },
        /**
         * 获取当前客户的备注
         */
        getTagMarkBefore: function (callback) {
            // 获取路由参数id的值
            var urls = tool.getUrlArgs(),
                customerId = '';
            if (urls.has) {
                customerId = urls.data.customer_id;
            }
            var loading = '';
            tool.ajax({
                url: ajaxurl.customer.gainRemark,
                data: {
                    customer_id: customerId // 用户id
                },
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success: function (result) {
                    if (result.code === 1) {
                        vm.gainRemarkList = result.data.list;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(result.message);
                    }
                    layers.closed(loading);
                },
                error: function () {
                    layers.closed(loading);
                    layers.toast('网络异常');
                }
            });
        },
        /**
         * 编辑当前客户的备注
         */
        remarkEdit: function () {
            main.getTagMark(function () {
                main.getTagMarkBefore(function () {
                    if(vm.remarkList.length == 0 && vm.gainRemarkList.length == 0){
                        layers.toast('暂无备注');  
                        return false;       
                    }
                    layers.open({
                        btn: null,
                        title: '编辑备注',
                        area: ['604px', 'auto'],
                        content: remarkEdit,
                        success: function (layero, index) {
                            var $layero = $(layero);
                            var addedId = [];
                            $layero.find('.tag-group').html(template('addRemark', {
                                data: vm.remarkList,
                                datas: vm.gainRemarkList
                            }));
                            //$layero.find('.remark-tip span').text(vm.checkedIdArr.length);
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
                            $layero.find('.cancel').click(function () {
                                layers.closed(index);
                            });
                            $layero.find('.ok').click(function () {
                                // 获取id
                                var urls = tool.getUrlArgs(),
                                    customerId = '';
                                if (urls.has) {
                                    customerId = urls.data.customer_id;
                                }
                                if (addedId.length == 0) {
                                    layers.closed(index);
                                    return false;
                                }
                                tool.ajax({
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
                            // 删除合作情况备注
                            $layero.on("click", '.remark-del', function () {
                                // 获取备注id
                                var mark_id = $(this).parent("li").attr('data-id');
                                // 删除当前备注
                                $(this).parent("li").remove();
                                var urls = tool.getUrlArgs(),
                                    customerId = '';
                                if (urls.has) {
                                    customerId = urls.data.customer_id;
                                }
                                // 发送请求
                                tool.ajax({
                                    url: ajaxurl.customer.delRemark,
                                    data: {
                                        mark_id: mark_id,
                                        customer_id: customerId // 用户id
                                    },
                                    success: function (res) {
                                        if (res.code === 1) {
                                            layers.toast('删除成功！');
                                        } else {
                                            layers.toast(res.message);
                                        }
                                    }
                                });
                            });
                        }
                    });
                })
                /*   */
            })

        },
        checkAddMobile: function(){
            var $basicInfoMobile = $('#basicInfoMobile');
            //验证手机号是否唯一
            $basicInfoMobile.on('blur', 'div[data-type="addMobile"] .layui-input', function(event){
                var mobile = $.trim(event.target.value);
                var index = event.target.name.replace('mobile','').replace('[','').replace(']','');
                if(mobile != ''){
                    main.numVerify(vm.customer_id, 1, mobile, 'update', index);
                }else{
                    if(vm.checkMobile[index].err){
                        vm.checkMobile[index].err = '';
                    }
                }
            });
            //删除
            $basicInfoMobile.on('click', 'div[data-type="addMobile"] .icon-shanchu', function(event){
                var index = $(this).attr('data-index');
                $(event.target).parent().siblings('.layui-input').val('');
                vm.checkMobile.splice(index,1);
                $(this).closest('div[data-type="addMobile"]').remove();
            });
        }
    };
    var vm = new Vue({
        el: '#app',
        data: {
            tabs: {
                basic: 0, //基本信息页面
                follow: 0, //跟进信息页面
                cooperation: 0 //合作情况页面
            },
            clientList: [], //客户已存在的分组列表
            groupList: [], //员工自定义分组列表
            getUrls: tool.getUrlArgs(), //获取Url参数
            userinfo: common.getUserInfo(),
            checkCooper: false, //合作情况处于  查看还是编辑状态 true查看  false编辑
            editFollow: false, //是否编辑跟进信息
            isCooper: false, // false 处于新增状态   true 处于编辑状态
            editBasic: false, //是否编辑基本信息
            isEditAdd: false, //跟进信息false 为新增   true 为编辑
            editCooperation: false, //是否编辑合作信息
            followup_id: '',
            mobile: [], //客户合作情况电话号码
            global_set: '', //全局配置
            customer_from_channel: [], //客户来源
            customer_from_channel_text: '', //客户来源展示
            customer_id: '', //客户ID
            client_guest: [], //客户档案标签
            headInfo: '', //客户档案头部信息
            basicInfo: '', //客户基本详细信息
            basicInfoData: '', //初始客户详细基本信息
            finance_info: {}, //客户基本财务信息
            financeInfoData: '', //初始客户财务基本信息
            area: { //省市地区
                province: [{
                    id: '',
                    name: '',
                    shortname: ''
                }],
                city: [{
                    id: '',
                    name: '',
                    shortname: ''
                }],
                county: [{
                    id: '',
                    name: '',
                    shortname: ''
                }],
            },
            selected: '',
            isFalse: [], //是否有无
            filterFollow: '', //筛选跟进信息
            followInfo: '', //跟进信息

            fContent: '', //跟进信息包含的内容：文字、图片、语音
            editFollowData: { //编辑的跟进信息
                employee_id: '',
                images: [], //{image:'',thumb_image:''}
                product_name: [],
                record: '',
                type: '',
                voice_record: [],
            },
            followTable: '',
            cooperationTable: [],
            pay_type: true,
            isCompliance: '', //是否合规
            isPayHistory: false, //显示与隐藏购买记录按钮
            cooper_situation_base: { //合作情况基本信息 除了销售过程
                id: '',
                product_type: '',
                product_id: '',
                product_name: '',
                customer_id: '',
                pay_type: '',
                pay_num: '',
                pay_mobile: '',
                third_order_id: '',
                is_trade_day: '',
                days: '',
                goods_price: '',
                pay_money: '',
                pay_time: '',
                payer: '',
                pay_bank: '',
                pay_method: '',
                payment_account: '',
                payment_certificate: [], //'付款凭证'  图片
                receive_bank: '',
                receive_account: '',
                compliance_type: '', //'合规类型： 1 线上合规   2 线下合规',
                compliance_status: '', //'合规状态： 1 已合规  2  未合规',
                adapt: '', //'适当性测评',
                risk: '', //'风险测评',
                contract_type: '', //'合同类型： 1 电子合同  2  纸质合同',
                attachment: { //附件  语音和图片都可以  数组
                    voice: [],
                    image: [],
                },
                remark: '', //备注
                is_saleprocess: '', //是否有销售过程，1 有 0 无

            },
            sp_saleprocess: [{ //销售过程所有字段
                title: '',
                info: [],
                userdesc: '', //输入的文字
                userimages: []
            }],
            productItem: {}, //缓存新增跟进信息
            infoItem: {},
            receive_account: [], //账号数组
            showOther: false, //收入来源选择其他的时候 显示输入框
            trackData: {}, //获取的跟进信息列表
            associateTrackData: { //获取关联跟进信息参数
                customer_id: '',
                type: '',
                operate_real_name: '',
                goods_name: '',
                start_time: '',
                end_time: '',
                followup_content: '',
            },
            trackArr: [], //关联跟进信息总信息
            isRemark: true, //是否显示备注弹窗
            examine: false, //查看状态
            cooper_situation_jjtag: true, //合作情况 处于法务，财务，回访拒绝的状态
            record_total_page: '', //获取通话记录的页数
            record_lists: [], //缓存通话记录列表
            recordSearch: { //通话记录的搜索关键字
               /*  keywords: '', */
                filter_time: ''
            },
            trackList: [],
            track_page: '',
            isCooperAdd: false, //用于控制提交时新增与编辑时的辨别  true 为新增  false为编辑
            followup_content: [], //查询跟进信息图片文字筛选项
            global_temp_line: [], //跟进信息编辑状态线下产品复选  默认选中
            remarkWord: '', //备注输入框内容
            gainRemarkList: '', // 当前合作情况的值
            remarkList: '', // 备注列表
            noData: false, //无数据的时候展示
            checkMobile: [{
                err: ''
            }], //用于验证电话号码唯一性
            checkOnly: { //验证唯一性
                qq: '',
                weixin: ''
            },
            basicBtnDisabled: false, //禁用基本信息表单连续提交
            editBasicMobiles: [{
                mobile: '',
                is_relation: 0,
                contact_id: ''
            }]
        },
        methods: {
            delFollowImage: function (index, image, thumb_image) { //删除跟进信息中的已上传的图片
                var that = this;
                if (index != undefined) {
                    main.delImage(image, thumb_image, function () {
                        that.editFollowData.images.splice(index, 1);
                    });
                }
            },
            delPaymentImage: function (index, image, thumb_image) { //删除合作情况的付费凭证中已上传的图片
                var that = this;
                if (index != undefined) {
                    main.delImage(image, thumb_image, function () {
                        that.cooper_situation_base.payment_certificate.splice(index, 1);
                    });
                }
            },
            delAnnexImage: function (index, image, thumb_image) { //删除合作情况附件已上传的图片
                var that = this;
                if (index != undefined) {
                    main.delImage(image, thumb_image, function () {
                        that.cooper_situation_base.attachment.image.splice(index, 1);
                    });
                }
            },
            // index 外层数组循环索引  imgsi 循环图片数组索引
            delSalesImage: function (index, imgsi, image, thumb_image) { //删除销售过程已上传的图片
                var that = this;
                if (index != undefined && imgsi != undefined) {
                    main.delImage(image, thumb_image, function () {
                        that.sp_saleprocess[index].userimages.splice(imgsi, 1);
                    });
                }
            },
            addMobile: function () { //向数组中添加一项
                // arr.push({
                //     mobile: '',
                //     is_relation: 0
                // });
                // this.editBasicMobiles.push({
                //     mobile: '',
                //     is_relation: 0
                // })
                var $basicInfoMobile = $('#basicInfoMobile');
                var lens = $basicInfoMobile.find('.layui-form-item').length;
                if(template){
                    var html = template('tpl-mobile',{index:lens++})
                    $basicInfoMobile.append(html);
                }
                this.checkMobile.push({
                    err: ''
                });
                //console.log(this.checkMobile)
            },
            delMobileItem: function (index) { //基本信息中删除增加的电话项
                if (index != undefined) {
                    // this.basicInfo.mobile.splice(index, 1);
                    // this.editBasicMobiles.splice(index, 1);
                    this.basicInfo.mobile.splice(index, 1);
                }
            },
            editRemark: function () { //编辑备注
                main.editRemark();
            },
            editGroup: function () { //编辑分组
                main.editGroup();
            },
            addRecord: function () { //添加录音记录
                main.addRecord();
            },
            addCoop: function () { //完善信息提示
                main.perfectTip();
            },
            alterServeTime: function (data) { //更改服务期限
                main.alterServeTime(data);
            },
            associateTrack: function (index) { //关联跟进信息
                main.associateTrack((index));
            },
            payRecord: function () { //关联购买记录
                main.payRecord();
            },
            isEditBasic: function () { //是否编辑基本信息
                this.editBasic = !this.editBasic;
            },
            callTell: function (id) { //拨打电话
                if (id != undefined) {
                    common.callTellFn(id, true);
                }
            },
            isEditFollow: function () { //是否编辑跟进信息
                this.editFollow = !this.editFollow;
                vm.isEditAdd = false; //新增跟进信息标识
                setTimeout(function () {
                    layui.use('form', function () {
                        var form = layui.form;
                        form.render();
                    })
                }, 200);
            },
            isEditCooperation: function () { //是否编辑合作信息
                this.editCooperation = !this.editCooperation;
                main.getCooperttion()
            },
            cancel: function () { //编辑基本情况取消按钮
                this.editBasic = false;
                this.basicInfo = JSON.parse(this.basicInfoData);
                this.finance_info = JSON.parse(this.financeInfoData);
            },
            inquiryFollow: function () { //查询跟进信息
                this.filterFollow.curpage = 1;
                main.getFollowInfo();
            },
            resetFollow: function () { //初始化筛选跟进信息条件
                main.resetFollow(function () {
                    main.getFollowInfo();
                });
            },
            followTab: function (i) { //跟进信息下面的四个信息切换
                this.filterFollow.type = i;
                this.filterFollow.curpage = 1;
                main.getFollowInfo();
            },
            followContent: function (index) { //多选与取消跟进信息类型
                main.followContent(index);
            },
            edit_item_Follow: function (id) { //编辑某条跟进信息
                main.edit_item_Follow(id);
            },
            del_item_Follow: function (id, index) { //删除某条跟进信息
                main.del_item_Follow(id, index);
            },
            pageSize: function (i) { //设置每页展示条数
                /* this.filterFollow.pagesize = i; */
                this.filterFollow.curpage = 1;
                main.getFollowInfo();
            },
            delFollowImg: function (i) { //删除跟进信息上传图片
                main.delFollowImg(i, this.editFollowData.images);
            },
            numVerify: function (type, num, str, index) { //验证号码是否重复id:客户ID，type:号码类型 1 电话号码 2 微信号 3 QQ号，num：需要验证的号码，action_type ：add 新增 update 编辑
                if (type == 2 || type == 3 || type == 4) {
                    num = num.target.value;
                }
                main.numVerify(vm.customer_id, type, num, str, index);
            },
            addSaleprocess: function (index) { //新增销售信息
                main.addSaleprocess(index);
            },
            addProductItem: function (index) { //新增销售信息确认按钮
                main.addProductItem(index);
            },
            cancelProductItem: function (index) { //新增销售信息取消按钮
                $('.sales-process').find('.sales-process-item').eq(index).find('.new-item-content').addClass('layui-hide');
                this.sp_saleprocess[index].userdesc = '';
                this.sp_saleprocess[index].userimages = [];
            },
            delProductItem: function (index, i) { //删除销售过程中的某一项
                vm.sp_saleprocess[index].info.splice(i, 1);
            },
            delRecordItem: function (index) { //删除添加的录音记录
                if (index != undefined) {
                    this.editFollowData.voice_record.splice(index, 1);
                }
            },
            playFollow: function (url, title, time) { //跟进信息列表播放语音
                common.jplayer(url, title, time);
            },
            cancelFollow: function () { //取消编辑跟进信息
                this.editFollowData.record = '';
                this.editFollowData.images = [];
                this.editFollow = false;
                return false;
            },
            cooprationCancel: function () { //新增合作情况返回按钮
                common.closeTab();
                return false;
            },
            remarkEdit: function ($event) { //编辑备注
                main.remarkEdit();
            },
            delVoice: function (index, url) { //删除附件上传的录音
                main.delVioce(url, function () {
                    vm.cooper_situation_base.attachment.voice.splice(index, 1)
                });
            },
            basicBack: function () { //基本信息页面返回上一页
                common.closeTab();
            }
        },
        filters: {
            formatSex: function (value) {
                if (value == '******') {
                    return value;
                }
                var sex = '';
                switch (value) {
                    case '0':
                        sex = '--';
                        break;
                    case '1':
                        sex = '男';
                        break;
                    case '2':
                        sex = '女';
                        break;
                }
                return sex;
            },
            VformatM: function (value) {
                if (value == undefined || value == null || value == '') {
                    return '--';
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
    //template过滤器
    template.helper('formatM', function (value) {
        if (value == undefined || value == null || value == '') {
            return '--';
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
    });
    /**
     * 初始化
     */
    var _init = function () {
        common.getTabLink();
        main.globalSet(function () {
            main.getUrl();
            main.tabSwitch();
        });
        main.initLayui();
        main.uploadImg();
        main.getTagMarkBefore();
        main.checkAddMobile();
    };
    _init();
});
require(['moment', 'page', 'upload', 'template', 'ajaxurl', 'tools', 'common', 'jquery.metisMenu', 'layui', 'layers', 'text!/assets/popup/rem-sea.html', 'text!/assets/popup/del-usr.html', 'text!/assets/popup/clear-usr.html', 'text!/assets/popup/mov-group.html', 'text!/assets/popup/add-remark.html', 'text!/assets/popup/clear-usr-detail.html', 'text!/assets/popup/import-usr.html', 'text!/assets/popup/share-usr.html', 'text!/assets/popup/move-usr.html', 'text!/assets/popup/del-group.html', 'text!/assets/popup/allot-usr.html', 'text!/assets/popup/export-server.html', 'text!/assets/popup/export-customers.html'], function (moment, page, upload, template, ajaxurl, tools, common, undefined, layui, layers, remSea, delUsr, clearUsr, movGroup, addRemark, clearUsrDetail, importUsr, shareUsr, moveUsr, delGroup, allotUsr, expServer, exportUser) {

    // 初始化 template 界定符
    template.config('openTag', '{?');
    template.config('closeTag', '?}');

    var main = {
        /**
         * 初始化侧栏树形菜单
         */
        sideMenu: function (callback) {
            Vue.nextTick(function () {
                $('.side-menu').metisMenu();
            })
        },
        /**
         * 我的客户--客户列表
         * @param callback 请求完成的回调
         * @param page  请求的页数
         * @param isGetCsv  是否导出当前符合提交的 csv 文件
         */
        getNavData: function (callback, page, isGetCsv) {
            layers.load(function (indexs) {
                vm.isLoadingIndex = indexs;
            });
            // 更新列表数据后, 置空选中人数
            vm.checkedIdArr = [];
            page = page || 1;
            tools.ajax({
                url: ajaxurl.customer.getList,
                data: {
                    username: vm.username,
                    phone: vm.phone,
                    mark_id: vm.showPool ? '' : vm.ajaxCondition.remarkId.join(','),
                    tag_code: vm.ajaxCondition.tagId.join(','),
                    // 筛选
                    create_time: vm.ajaxCondition.timeArea.create_time.join(','),
                    relation_time: vm.ajaxCondition.timeArea.relation_time.join(','),
                    turnover_time: vm.ajaxCondition.timeArea.turnover_time.join(','),
                    join_time: vm.ajaxCondition.timeArea.join_time.join(','),
                    no_relation_time: vm.ajaxCondition.timeArea.no_relation_time.join(','),
                    update_time: vm.ajaxCondition.timeArea.update_time.join(','),
                    service_end_time: vm.ajaxCondition.timeArea.service_end_time.join(','),
                    organizational_structure: vm.ajaxCondition.timeArea.organizational_structure.join(','),
                    cache_file_name: vm.ajaxCondition.sideGroupId ? vm.ajaxCondition.sideGroupId : vm.all_num.filename,
                    order: vm.ajaxCondition.order,
                    system_label_id: vm.ajaxCondition.system_label_id,// ECTag
                    channel_id: vm.ajaxCondition.selectSource, // 来源
                    pagesize: vm.pagesize,
                    curpage: page,
                    csv: isGetCsv ? 1 : ''// 导出符合当前条件的 csv 文件
                },
                type: 'post',
                success: function (res) {
                    if (res.code === 1) {
                        var originalList = $.isArray(res.data.list) ? res.data.list : [];
                        if (isGetCsv) {
                            layers.closed(vm.isLoadingIndex);
                            layers.toast(res.data);
                        } else {
                            originalList.forEach(function (item) {
                                item.checked = false;
                            });
                            vm.usrDataList = originalList;
                            vm.usrDataTotalNum = res.data.total_num;
                            vm.usrDataTotalPage = res.data.total_page;
                        }
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 获取侧栏导航
         * @param callback
         * @param noCache 请求无缓存结果 [对侧栏编辑/删除/转移客户时需要实时获取最新数据]
         */
        getLeftMenu: function (callback, noCache) {
            tools.ajax({
                url: ajaxurl.customer.getListLeft,
                data: {
                    no_cache: noCache && 1
                },
                success: function (res) {
                    if (res.code === 1) {
                        vm.generalList = res.data.customGroup;
                        vm.operaList = res.data.fixedGroup;
                        vm.productList = res.data.specialGroup;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 获取侧栏"全部"分组数据 列表数据项获取 "全部" 的最新结果
         * 需要在请求列表中传入 filename
         * @param callback
         */
        getAllNum: function (callback) {
            tools.ajax({
                url: ajaxurl.customer.getAllNum,
                data: {},
                beforeSend: function () {
                    layers.load(function (indexs) {
                        vm.isLoadingIndex = indexs;
                    });
                },
                success: function (res) {
                    layers.closed(vm.isLoadingIndex);
                    if (res.code === 1) {
                        vm.all_num = res.data.all_num;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
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
                        vm.remarkList = $.isArray(res.data.marklist) ? res.data.marklist : [];
                        vm.tagList = $.isArray(res.data.taglist) ? res.data.taglist : [];
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 移入公海询问框
         */
        removePublic: function () {
            if (!vm.checkedIdArr.length) {
                return;
            }
            layers.confirm({
                title: '移入公海友情提示',
                content: remSea,
                success: function (layero, index) {
                    var $layero = $(layero);
                    $layero.find('.confirm-tips span').text(vm.checkedIdArr.length);
                },
                btn2: function (index, layero) {
                    // 确认的回调
                    if (!vm.checkedIdArr.length) {
                        layers.toast('未选择任何用户');
                        return;
                    }
                    tools.ajax({
                        url: ajaxurl.customer.movePool,
                        type: 'post',
                        data: {
                            customerIds: vm.checkedIdArr,
                            cache_file_name: vm.ajaxCondition.sideGroupId ? vm.ajaxCondition.sideGroupId : vm.all_num.filename,
                            cache_file_name_all: vm.all_num.filename,
                            cache_file_name_groupall: vm.ajaxCondition.sideGroupId.indexOf('group_employee') > -1 ? vm.operaList[2].filename : ''
                        },
                        success: function (res) {
                            if (res.code === 1) {
                                main.getAllNum(function () {
                                    main.getLeftMenu(function () {
                                        main.getNavData(function () {
                                            layers.toast('移入公海成功！');
                                            layers.closed(vm.isLoadingIndex);
                                        }, vm.curPage);
                                    }, true);
                                });
                                vm.checkedIdArr = [];
                                layers.closed(index);
                            } else if (res.code === -2) {// 部分操作成功
                                main.getAllNum(function () {
                                    main.getLeftMenu(function () {
                                        main.getNavData(function () {
                                            layers.toast(res.message);
                                            layers.closed(vm.isLoadingIndex);
                                        }, vm.curPage);
                                    }, true);
                                });
                                vm.checkedIdArr = [];
                                layers.closed(index);
                            } else {
                                layers.toast(res.message);
                            }
                        }
                    })
                }
            });
        },
        /**
         * 删除用户询问框
         */
        delUser: function () {
            if (!vm.checkedIdArr.length) {
                return;
            }
            layers.confirm({
                title: '删除客户友情提示',
                content: delUsr,
                success: function (layero, index) {
                    var $layero = $(layero);
                    $layero.find('.confirm-tips span').text(vm.checkedIdArr.length);
                },
                btn2: function (index, layero) {
                    // 确认的回调
                    if (!vm.checkedIdArr.length) {
                        layers.toast('未选择任何用户');
                        return;
                    }
                    var delUsrId = vm.checkedIdArr.join(',');
                    tools.ajax({
                        url: ajaxurl.customer.delCustomer,
                        type: 'post',
                        data: {
                            customerIds: delUsrId,
                            cache_file_name: vm.ajaxCondition.sideGroupId ? vm.ajaxCondition.sideGroupId : vm.all_num.filename,
                            cache_file_name_all: vm.all_num.filename,
                            cache_file_name_groupall: vm.ajaxCondition.sideGroupId.indexOf('group_employee') > -1 ? vm.operaList[2].filename : ''
                        },
                        success: function (res) {
                            vm.curPage = 1;
                            if (res.code === 1) {
                                main.getAllNum(function () {
                                    main.getLeftMenu(function () {
                                        main.getNavData(function () {
                                            layers.toast('删除成功！');
                                            layers.closed(vm.isLoadingIndex);
                                            main.setTablePage();
                                        }, vm.curPage);
                                    }, true);
                                });
                                vm.checkedIdArr = [];
                                layers.closed(index);
                            } else if (res.code === -2) {// 部分操作成功
                                main.getAllNum(function () {
                                    main.getLeftMenu(function () {
                                        main.getNavData(function () {
                                            layers.toast(res.message);
                                            layers.closed(vm.isLoadingIndex);
                                            main.setTablePage();
                                        }, vm.curPage);
                                    }, true);
                                });
                                vm.checkedIdArr = [];
                                layers.closed(index);
                            } else {
                                layers.toast(res.message);
                            }
                        }
                    })
                }
            });
        },
        /**
         * 客户导出询问框
         */
        exportUser: function () {
            layers.confirm({
                title: '导出客户',
                area: ['430px', '254px'],
                content: exportUser,
                success: function (layero, index) {
                    var $layero = $(layero);
                    $layero.find('.blue').click(function () {
                        common.getTabLinkWithJS({
                            name: '消息管理',
                            url: '/admin/sms/sms?type=2&sontype=24'
                        })
                    })
                },
                btn2: function (index, layero) {
                    // 确认的回调
                    main.getNavData('', '', 1);
                }
            });
        },
        /**
         * 客户清理确认询问框
         */
        clearUsr: function (willDelArr) {
            layers.confirm({
                title: '客户清理友情提示',
                content: clearUsr,
                success: function (layero, index) {
                    $(layero).find('span').text(willDelArr.length);
                },
                btn2: function (index, layero) {
                    // 确认的回调
                    tools.ajax({
                        url: ajaxurl.customer.clearPool,
                        data: {
                            customerIds: willDelArr,
                            cache_file_name: vm.ajaxCondition.sideGroupId ? vm.ajaxCondition.sideGroupId : vm.all_num.filename,
                            cache_file_name_all: vm.all_num.filename,
                            cache_file_name_groupall: vm.ajaxCondition.sideGroupId.indexOf('group_employee') > -1 ? vm.operaList[2].filename : ''
                        },
                        success: function (res) {
                            if (res.code === 1) {
                                main.getAllNum(function () {
                                    main.getLeftMenu(function () {
                                        main.getNavData(function () {
                                            layers.toast('清理成功！');
                                            layers.closed(vm.isLoadingIndex);
                                        });
                                    }, true);
                                });
                                layers.closed(index);
                            } else if (res.code === -2) {// 部分操作成功
                                main.getAllNum(function () {
                                    main.getLeftMenu(function () {
                                        main.getNavData(function () {
                                            layers.toast(res.message);
                                            layers.closed(vm.isLoadingIndex);
                                        }, vm.curPage);
                                    }, true);
                                });
                                layers.closed(index);
                            } else {
                                layers.toast(res.message);
                            }
                        }
                    })
                }
            });
        },
        /**
         * 清理客户弹出层
         */
        clearUsrDetail: function () {
            var checkedUsrArr = [];// 已选客户id
            layers.confirm({
                title: '客户清理',
                area: ['604px', '645px'],
                content: clearUsrDetail,
                success: function (layero, index) {
                    var $layero = $(layero);
                    main.getPoolUsr('', function () {
                        var datas = {
                            data: vm.poolUsrList,
                            totalPage: vm.poolUsrListTotalPage,
                            totalNum: vm.poolUsrListTotalNum
                        };
                        $layero.find('.clear-usr-container ul').html(template('clear-usr', datas));
                        $layero.find('.total-num span').text(vm.poolUsrListTotalNum);
                        page.init({
                            elem: layero.find('#page'),
                            count: vm.poolUsrListTotalNum,// 总条数
                            limit: 6,// 每页多少条
                            groups: 3,// 连续出现的页码个数
                            prev: false,
                            next: false,
                            jump: function (obj, flag) {
                                if (!flag) {
                                    main.getPoolUsr(obj.curr, function () {
                                        // 翻页后清零前页已选, 以当前页为准
                                        $layero.find('.checked-num span').text(0);
                                        checkedUsrArr = [];
                                        var datas = {
                                            data: vm.poolUsrList,
                                            totalPage: vm.poolUsrListTotalPage,
                                            totalNum: vm.poolUsrListTotalNum
                                        };
                                        $layero.find('.clear-usr-container ul').html(template('clear-usr', datas));
                                    });
                                }
                            }
                        });
                        // 数据为空
                        if (!datas.data.length) {
                            $layero.find('.no-result').show();
                        }
                    });
                    $layero.on('click', '#_clr_check_all', function () {
                        var $inputs = $('.clr-data input');
                        if ($(this).prop('checked')) {// 全选
                            $inputs.each(function () {
                                if (!$(this).prop('checked')) {
                                    $(this).prop('checked', true);
                                    checkedUsrArr.push($(this).data('id'));
                                }
                                $(this).prop('checked', true);
                            });
                            $layero.find('.checked-num span').text($inputs.length);
                        } else {// 取消全选
                            checkedUsrArr = [];
                            $inputs.each(function () {
                                $(this).prop('checked', false);
                            });
                            $layero.find('.checked-num span').text(0);
                        }
                    });
                    $layero.on('click', '.clr-data input', function () {
                        // 点选时加入新数组
                        var id = $(this).data('id');
                        if (checkedUsrArr.indexOf(id) === -1) {
                            checkedUsrArr.push(id);
                        } else {
                            checkedUsrArr.forEach(function (item, index) {
                                item === id && checkedUsrArr.splice(index, 1);
                            });
                        }
                        if (checkedUsrArr.length === vm.poolUsrList.length) {
                            $('#_clr_check_all').prop('checked', true);
                        } else {
                            $('#_clr_check_all').prop('checked', false);
                        }
                        $layero.find('.checked-num span').text(checkedUsrArr.length);
                    });
                },
                btn2: function (index, layero) {
                    if (checkedUsrArr.length) {
                        main.clearUsr(checkedUsrArr);
                    } else {
                        layers.toast('请选择需要清理的客户');
                        return false;
                    }

                }
            });
        },
        /**
         * 移动分组询问框
         */
        moveGroup: function () {
            if (!vm.checkedIdArr.length) {
                return;
            }
            layers.open({
                btn: null,
                title: '移动分组',
                area: ['604px', '373px'],
                content: movGroup,
                success: function (layero, index) {
                    var groupId = '';// 已选择分组 id
                    var $layero = $(layero);
                    $layero.find('.num').text(vm.checkedIdArr.length);
                    if (vm.generalList.length) {
                        $layero.find('.selectOptionWrap').html(template('selectOption', {data: vm.generalList}));
                    } else {
                        layers.toast('您没有添加任何客户分组，无法移动分组，请先去添加客户分组！');
                    }
                    layui.use(['form'], function () {
                        var form = layui.form;
                        form.on('select(group)', function (data) {
                            groupId = data.value;
                        });
                        form.render();
                    });
                    $layero.find('.ok').click(function () {
                        if (!vm.checkedIdArr.length) {
                            layers.toast('未选择任何用户');
                            return;
                        }
                        if (!groupId) {
                            layers.toast('请选择分组后提交！');
                        } else {
                            tools.ajax({
                                url: ajaxurl.customer.moveGroup,
                                type: 'post',
                                data: {
                                    customerIds: vm.checkedIdArr,// 客户id
                                    customGroupId: groupId,// 分组 id
                                    cache_file_name: vm.ajaxCondition.sideGroupId ? vm.ajaxCondition.sideGroupId : vm.all_num.filename
                                },
                                success: function (res) {
                                    if (res.code === 1) {
                                        main.getAllNum(function () {
                                            main.getLeftMenu(function () {
                                                main.getNavData(function () {
                                                    layers.toast('移入分组成功！');
                                                    layers.closed(vm.isLoadingIndex);
                                                }, vm.curPage);
                                            }, true);
                                        });
                                        vm.checkedIdArr = [];
                                        layers.closed(index);
                                    } else {
                                        layers.toast(res.message);
                                    }
                                }
                            });
                        }
                    });
                    $layero.find('.cancel').click(function () {
                        layers.closed(index);
                    });
                }
            });
        },
        /**
         * 导入客户询问框
         */
        importUsr: function () {
            layers.open({
                btn: null,
                title: '导入客户',
                area: ['604px', 'auto'],
                content: importUsr,
                success: function (layero, index) {
                    var groupId = '';// 选择的分组 id
                    var channelId = '';// 选择的来源 id
                    var fileName = '';// 选择的文件名
                    var $layero = $(layero);
                    var uploadLoading = '';// 上传中动画

                    $('#fileUp').change(function (e) {
                        fileName = e.currentTarget.files[0].name;
                        $layero.find('.file-name').text(fileName);
                        $('.file-btn span').text('修改');
                        $('.file-container').addClass('uploaded');
                    });
                    layui.use(['form'], function () {
                        // 渲染数据
                        if (vm.generalList.length) {
                            $layero.find('.groupOption').html(template('groupOption', {data: vm.generalList}));
                        }
                        if (!$.isEmptyObject(vm.channelSource)) {
                            $layero.find('.fromOption').html(template('fromOption', {data: vm.channelSource}));
                        }
                        // 初始化表格
                        var form = layui.form;
                        form.render();
                        // 监听表格事件
                        form.on('select(group)', function (data) {
                            groupId = data.value;
                        });
                        form.on('select(from)', function (data) {
                            channelId = data.value;
                        });
                    });
                    //上传
                    upload.init({
                        elem: '#fileUp',
                        url: ajaxurl.upload.importCSV,
                        field: 'import_csv',
                        accept: 'file',
                        exts: 'csv',
                        size: 51200, // 上传限制50MB
                        auto: false, // 关闭自动上传
                        bindAction: '.ok-upload',// 由确定按钮触发上传
                        before: function () {
                            // 上传参数
                            this.data = {
                                customer_type: groupId,
                                channel_id: channelId
                            };
                            layers.load(function (indexs) {
                                uploadLoading = indexs;
                            });
                            // 上传中避免重复提交
                            $layero.find('.ok').prop('disabled', true);
                        },
                        done: function (data) {
                            $layero.find('.ok').prop('disabled', false);
                            if (data.code === 1) {
                                layers.toast(data.message, {time: 3000});
                                setTimeout(function () {
                                    layers.closed(index);
                                }, 500);
                            } else {
                                layers.toast(data.message, 2000);
                            }
                            layers.closed(uploadLoading);
                        },
                        error: function () {
                            layers.closed(uploadLoading);
                        }
                    });
                    $layero.find('.cancel').click(function () {
                        layers.closed(index);
                    });
                    $layero.find('.ok').click(function () {
                        if (!fileName.length) {
                            layers.toast('请选择上传文件');
                            return;
                        }
                        if (!channelId.length) {
                            layers.toast('请选择来源');
                            return;
                        }
                        $('.ok-upload').trigger('click');
                    });
                }
            });
        },
        /**
         * 共享客户询问框 [可以共享给多名员工]
         */
        shareUsr: function () {
            if (!vm.checkedIdArr.length) {
                return;
            }
            var leftData = {data: vm.usrOrgList};// 组织架构
            var rightData = {data: []};// 已选择用户
            layers.confirm({
                title: '共享客户',
                area: ['600px', 'auto'],
                content: shareUsr,
                success: function (layero, index) {
                    var $layero = $(layero);
                    $layero.find('.warning span').text(vm.checkedIdArr.length);
                    // 添加当前分组全部成员
                    $layero.on('click', '.check-all-btn', function (e) {
                        var $ul = $(e.target).parent().siblings();
                        var $item = $ul.find('a:not(.has-arrow)');
                        $item.each(function () {
                            var newItem = {id: $(this).data('id'), name: $(this).data('name')};
                            rightData.data.push(newItem);
                        });
                        if (rightData.data.length > 10) {
                            layers.toast('最多只能共享给10个人');
                            rightData.data = main.unique(rightData.data).reverse().splice(0, 10);
                        } else {
                            // 渲染到右侧已选择
                            rightData.data = main.unique(rightData.data).reverse();
                        }
                        $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                        $layero.find('.choose-people h2 span').text(rightData.data.length);
                    });
                    // 添加单个成员
                    $layero.on('click', '.metismenu a:not(.has-arrow)', function (e) {
                        var newItem = {id: $(this).data('id'), name: $(this).data('name')};
                        rightData.data.push(newItem);
                        if (rightData.data.length > 10) {
                            layers.toast('最多只能共享给10个人');
                            rightData.data = main.unique(rightData.data).reverse().splice(0, 10);
                        } else {
                            // 渲染到右侧已选择
                            rightData.data = main.unique(rightData.data).reverse();
                        }
                        $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                        $layero.find('.choose-people h2 span').text(rightData.data.length);
                    });
                    // 删除已选用户
                    $layero.on('click', '.del-choose', function (e) {
                        var id = $(e.target).parent().data('id');
                        rightData.data.forEach(function (item, index) {
                            if (item.id === id) {
                                rightData.data.splice(index, 1)
                            }
                        });
                        // 渲染到右侧已选择
                        rightData.data = main.unique(rightData.data).reverse();
                        $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                        $layero.find('.choose-people h2 span').text(rightData.data.length);
                    });
                    // 渲染组织架构 && 搜索
                    var searchAll = [];
                    var _form;
                    setTimeout(function () {
                        var $item = $layero.find('.sidebar-nav a').not('.has-arrow');
                        $item.each(function () {
                            var newItem = {id: $(this).data('id'), name: $(this).data('name')};
                            searchAll.push(newItem);
                        });
                        $layero.find('.search-org').html(template('org-search', {data: searchAll}));
                        _form.render();
                    }, 50);
                    layui.use(['form'], function () {
                        var form = layui.form;
                        _form = form;
                        form.on('select(search-org)', function (data) {
                            var addItem = {id: data.value.split(',')[0] * 1, name: data.value.split(',')[1]};
                            rightData.data.push(addItem);
                            rightData.data = main.unique(rightData.data).reverse();
                            $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                            $layero.find('.choose-people h2 span').text(rightData.data.length);
                        });
                    });
                    $layero.find('.sidebar-nav').html(template('share-usr-left', leftData));
                    $layero.find('.metismenu').metisMenu();
                },
                btn2: function (index, layero) {
                    var selectedId = [];
                    rightData.data.forEach(function (t) {
                        selectedId.push(t.id);
                    });
                    tools.ajax({
                        url: ajaxurl.customer.shareUsr,
                        type: 'post',
                        data: {
                            toEmployeeIds: selectedId,
                            customerIds: vm.checkedIdArr,
                            cache_file_name: vm.ajaxCondition.sideGroupId ? vm.ajaxCondition.sideGroupId : vm.all_num.filename
                        },
                        success: function (res) {
                            if (res.code === 1) {
                                main.getNavData(function () {
                                    layers.toast('共享成功！');
                                    layers.closed(vm.isLoadingIndex);
                                }, vm.curPage);
                                vm.checkedIdArr = [];
                            } else {
                                layers.toast(res.message);
                            }
                        }
                    });
                }
            });
        },
        /**
         * 转移客户询问框 [只能转移给1名员工]
         */
        moveUsr: function () {
            if (!vm.checkedIdArr.length) {
                return;
            }
            var leftData = {data: vm.usrOrgList};// 组织架构
            var rightData = {data: []};// 已选择用户
            layers.confirm({
                title: '转移客户',
                area: ['600px', 'auto'],
                content: moveUsr,
                success: function (layero, index) {
                    var $layero = $(layero);
                    $layero.find('.warning span').text(vm.checkedIdArr.length);
                    // 添加当前分组全部成员
                    $layero.on('click', '.check-all-btn', function (e) {
                        var $item = $(e.target).parent().siblings().find('a:not(.has-arrow)');
                        var newItem = {id: $($item[0]).data('id'), name: $($item[0]).data('name')};
                        $item.length > 0 && rightData.data.push(newItem);
                        // 渲染到右侧已选择
                        if (rightData.data.length > 1) {
                            layers.toast('只能转移给1个人！');
                        } else {
                            rightData.data = main.unique(rightData.data).reverse().splice(0, 1);
                            $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                            $layero.find('.choose-people h2 span').text(rightData.data.length);
                        }
                    });
                    // 添加单个成员
                    $layero.on('click', '.metismenu a:not(.has-arrow)', function (e) {
                        var newItem = {id: $(this).data('id'), name: $(this).data('name')};
                        rightData.data.push(newItem);
                        // 渲染到右侧已选择
                        if (rightData.data.length > 1) {
                            layers.toast('只能转移给1个人！');
                        } else {
                            rightData.data = main.unique(rightData.data).reverse().splice(0, 1);
                            $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                            $layero.find('.choose-people h2 span').text(rightData.data.length);
                        }
                    });
                    // 删除已选用户
                    $layero.on('click', '.del-choose', function (e) {
                        // 渲染到右侧已选择
                        rightData.data = [];
                        $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                        $layero.find('.choose-people h2 span').text(rightData.data.length);
                    });
                    // 渲染组织架构
                    $layero.find('.sidebar-nav').html(template('share-usr-left', leftData));
                    var searchAll = [];
                    var _form;
                    setTimeout(function () {
                        var $item = $layero.find('.sidebar-nav a').not('.has-arrow');
                        $item.each(function () {
                            var newItem = {id: $(this).data('id'), name: $(this).data('name')};
                            searchAll.push(newItem);
                        });
                        $layero.find('.search-org').html(template('org-search', {data: searchAll}));
                        _form.render();
                    }, 50);
                    layui.use(['form'], function () {
                        var form = layui.form;
                        _form = form;
                        form.on('select(search-org)', function (data) {
                            var addItem = {id: data.value.split(',')[0] * 1, name: data.value.split(',')[1]};
                            rightData.data.push(addItem);
                            if (rightData.data.length > 1) {
                                layers.toast('只能转移给1个人！');
                            } else {
                                rightData.data = main.unique(rightData.data).reverse().splice(0, 1);
                                $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                                $layero.find('.choose-people h2 span').text(rightData.data.length);
                            }
                        });
                    });
                    $layero.find('.metismenu').metisMenu();
                },
                btn2: function (index, layero) {
                    var selectedId = [];
                    rightData.data.forEach(function (t) {
                        selectedId.push(Number(t.id));
                    });
                    tools.ajax({
                        url: ajaxurl.customer.moveUsr,
                        type: 'post',
                        data: {
                            toEmployeeId: selectedId[0],
                            customerIds: vm.checkedIdArr,
                            cache_file_name: vm.ajaxCondition.sideGroupId ? vm.ajaxCondition.sideGroupId : vm.all_num.filename,
                            cache_file_name_all: vm.all_num.filename,
                            cache_file_name_groupall: vm.ajaxCondition.sideGroupId.indexOf('group_employee') > -1 ? vm.operaList[2].filename : ''
                        },
                        success: function (res) {
                            if (res.code === 1) {
                                main.getAllNum(function () {
                                    main.getLeftMenu(function () {
                                        main.getNavData(function () {
                                            layers.toast('转移成功！');
                                            layers.closed(vm.isLoadingIndex);
                                        }, vm.curPage);
                                    }, true);
                                });
                                vm.checkedIdArr = [];
                                layers.closed(index);
                            } else if (res.code === -2) {// 部分操作成功
                                main.getAllNum(function () {
                                    main.getLeftMenu(function () {
                                        main.getNavData(function () {
                                            layers.toast(res.message);
                                            layers.closed(vm.isLoadingIndex);
                                        }, vm.curPage);
                                    }, true);
                                });
                                vm.checkedIdArr = [];
                                layers.closed(index);
                            } else {
                                layers.toast(res.message);
                            }
                        }
                    });
                }
            });
        },
        /**
         * 客户分配询问框 [只能分配给1名员工]
         */
        allotUsr: function () {
            if (!vm.checkedIdArr.length) {
                return;
            }
            var leftData = {data: vm.usrOrgList};// 组织架构
            var rightData = {data: []};// 已选择用户
            layers.confirm({
                title: '客户分配',
                area: ['600px', 'auto'],
                content: allotUsr,
                success: function (layero, index) {
                    var $layero = $(layero);
                    $layero.find('.warning span').text(vm.checkedIdArr.length);
                    // 添加当前分组全部成员
                    $layero.on('click', '.check-all-btn', function (e) {
                        var $item = $(e.target).parent().siblings().find('a:not(.has-arrow)');
                        var newItem = {id: $($item[0]).data('id'), name: $($item[0]).data('name')};
                        rightData.data.push(newItem);
                        // 渲染到右侧已选择
                        if (rightData.data.length > 1) {
                            layers.toast('只能分配给1个人！');
                        } else {
                            rightData.data = main.unique(rightData.data).reverse().splice(0, 1);
                            $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                            $layero.find('.choose-people h2 span').text(rightData.data.length);
                        }
                    });
                    // 添加单个成员
                    $layero.on('click', '.metismenu a:not(.has-arrow)', function (e) {
                        var newItem = {id: $(this).data('id'), name: $(this).data('name')};
                        rightData.data.push(newItem);
                        // 渲染到右侧已选择
                        if (rightData.data.length > 1) {
                            layers.toast('只能分配给1个人！');
                        } else {
                            rightData.data = main.unique(rightData.data).reverse().splice(0, 1);
                            $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                            $layero.find('.choose-people h2 span').text(rightData.data.length);
                        }
                    });
                    // 删除已选用户
                    $layero.on('click', '.del-choose', function (e) {
                        // 渲染到右侧已选择
                        rightData.data = [];
                        $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                        $layero.find('.choose-people h2 span').text(rightData.data.length);
                    });
                    // 渲染组织架构
                    $layero.find('.sidebar-nav').html(template('share-usr-left', leftData));
                    var searchAll = [];
                    var _form;
                    setTimeout(function () {
                        var $item = $layero.find('.sidebar-nav a').not('.has-arrow');
                        $item.each(function () {
                            var newItem = {id: $(this).data('id'), name: $(this).data('name')};
                            searchAll.push(newItem);
                        });
                        $layero.find('.search-org').html(template('org-search', {data: searchAll}));
                        _form.render();
                    }, 50);
                    layui.use(['form'], function () {
                        var form = layui.form;
                        _form = form;
                        form.on('select(search-org)', function (data) {
                            var addItem = {id: data.value.split(',')[0] * 1, name: data.value.split(',')[1]};
                            rightData.data.push(addItem);
                            if (rightData.data.length > 1) {
                                layers.toast('只能分配给1个人！');
                            } else {
                                rightData.data = main.unique(rightData.data).reverse().splice(0, 1);
                                $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                                $layero.find('.choose-people h2 span').text(rightData.data.length);
                            }
                        });
                    });
                    $layero.find('.metismenu').metisMenu();
                },
                btn2: function (index, layero) {
                    var selectedId = [];
                    rightData.data.forEach(function (t) {
                        selectedId.push(Number(t.id));
                    });
                    tools.ajax({
                        url: ajaxurl.customer.customerAlloc,
                        type: 'post',
                        data: {
                            toEmployeeId: selectedId[0],
                            customerIds: vm.checkedIdArr,
                            cache_file_name: vm.ajaxCondition.sideGroupId ? vm.ajaxCondition.sideGroupId : vm.all_num.filename,
                            cache_file_name_all: vm.all_num.filename,
                            cache_file_name_groupall: vm.ajaxCondition.sideGroupId.indexOf('group_employee') > -1 ? vm.operaList[2].filename : ''
                        },
                        success: function (res) {
                            if (res.code === 1) {
                                main.getAllNum(function () {
                                    main.getLeftMenu(function () {
                                        main.getNavData(function () {
                                            layers.toast('分配成功！');
                                            layers.closed(vm.isLoadingIndex);
                                        }, vm.curPage);
                                    }, true);
                                });
                                vm.checkedIdArr = [];
                            } else {
                                layers.toast(res.message);
                            }
                        }
                    });
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
                        if (addedId.length) {
                            tools.ajax({
                                url: ajaxurl.customer.addRemark,
                                type: 'post',
                                data: {
                                    mark_id: addedId.join(','),
                                    customer_id: customerId,
                                    cache_file_name: vm.ajaxCondition.sideGroupId ? vm.ajaxCondition.sideGroupId : vm.all_num.filename
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
                        } else {
                            layers.closed(index);
                        }
                    });
                }
            });
        },
        /**
         * 删除备注询问框
         */
        delRemark: function () {
            if (!vm.checkedIdArr.length) {
                return;
            }
            layers.open({
                btn: null,
                title: '删除备注',
                area: ['604px', 'auto'],
                content: addRemark,
                success: function (layero, index) {
                    var $layero = $(layero);
                    var addedId = [];
                    var remarkDiffArr = [];
                    var singleUrsRemarkArr = [];
                    if (vm.checkedIdArr.length > 1) {
                        // 请求所选客户备注列表的交集
                        tools.ajax({
                            url: ajaxurl.customer.remarkDelDiff,
                            type: 'post',
                            data: {
                                customer_id: vm.checkedIdArr.join(',')
                            },
                            success: function (res) {
                                if (res.code === 1) {
                                    remarkDiffArr = res.data ? res.data : [];
                                    if (remarkDiffArr.length) {
                                        $layero.find('.tag-group').html(template('addRemark', {data: remarkDiffArr}));
                                    } else {
                                        $layero.find('.tag-group').html(template('addRemark', {data: remarkDiffArr}));
                                        layers.toast('选中客户无任何相同备注，无法批量删除，请重新选择客户！', 2000);
                                    }
                                    $layero.find('.remark-tip span').text(vm.checkedIdArr.length);
                                }
                            }
                        });
                    } else {
                        // 返回单个客户的备注
                        tools.ajax({
                            url: ajaxurl.customer.gainRemark,
                            data: {
                                customer_id: vm.checkedIdArr.join(',')
                            },
                            success: function (res) {
                                if (res.code === 1) {
                                    singleUrsRemarkArr = res.data.list ? res.data.list : [];
                                    if (singleUrsRemarkArr.length) {
                                        $layero.find('.tag-group').html(template('addRemark', {data: singleUrsRemarkArr}));
                                    } else {
                                        $layero.find('.tag-group').html(template('addRemark', {data: singleUrsRemarkArr}));
                                        layers.toast('无备注可供删除，请重新选择客户！');
                                    }
                                    $layero.find('.remark-tip span').text(vm.checkedIdArr.length);
                                }
                            }
                        });
                    }
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
                        if (addedId.length) {
                            tools.ajax({
                                url: ajaxurl.customer.delRemark,
                                type: 'post',
                                data: {
                                    mark_id: addedId.join(','),
                                    customer_id: customerId,
                                    cache_file_name: vm.ajaxCondition.sideGroupId ? vm.ajaxCondition.sideGroupId : vm.all_num.filename
                                },
                                success: function (res) {
                                    if (res.code === 1) {
                                        main.getAllNum(function () {
                                            main.getLeftMenu(function () {
                                                main.getNavData(function () {
                                                    layers.toast('删除成功！');
                                                    layers.closed(vm.isLoadingIndex);
                                                });
                                            }, true);
                                        });
                                        layers.closed(index);
                                    } else {
                                        layers.toast(res.message);
                                    }
                                }
                            });
                        } else {
                            layers.closed(index);
                        }
                    });
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
                    });
                }
            });
        },
        /**
         * 侧栏删除群组确认询问框
         */
        delGroupTip: function (id, totalNum, name) {
            layers.confirm({
                title: '删除群组',
                content: delGroup,
                success: function (layero, index) {
                    var $layero = $(layero);
                    $layero.find('.num').text(totalNum);
                    $layero.find('.name').css({color: '#000'}).text(name);
                },
                btn2: function (index, layero) {
                    // 确认的回调
                    tools.ajax({
                        url: ajaxurl.customer_group.delete,
                        data: {id: id},
                        success: function (res) {
                            if (res.code === 1) {
                                layers.toast('删除成功！');
                                main.getLeftMenu('', true);
                            } else {
                                layers.toast(res.message);
                            }
                        }
                    });
                }
            });
        },
        /**
         * 添加备注
         */
        addRemarks: function (e, index, id) {
            if (id === -1) {
                if ($(e.target).hasClass('tag-active')) {
                    $(e.target).removeClass('tag-active');
                    vm.ajaxCondition.remarkId = [];
                } else {
                    // 移除全部
                    var ul = $(e.target).parentsUntil('.examine-tag')[1];
                    $(ul).find('a').each(function () {
                        $(this).removeClass('tag-active');
                    });
                    // 当前添加
                    $(e.target).addClass('tag-active');
                    vm.ajaxCondition.remarkId = [];
                    vm.ajaxCondition.remarkId.push(-1);
                }
            } else {
                // 对无备注的处理
                if (vm.ajaxCondition.remarkId.indexOf(-1) >= 0) {
                    vm.ajaxCondition.remarkId.splice(vm.ajaxCondition.remarkId.indexOf(-1), 1);
                    var ul = $(e.target).parentsUntil('.examine-tag')[1];
                    $(ul).find('.no-tag').removeClass('tag-active');
                }

                // 设置选中样式
                $(e.target).toggleClass('tag-active');
                // 无则新增, 有则删除
                if (vm.ajaxCondition.remarkId.indexOf(id) === -1) {
                    vm.ajaxCondition.remarkId.push(id);
                } else {
                    vm.ajaxCondition.remarkId.forEach(function (item, index) {
                        item === id && vm.ajaxCondition.remarkId.splice(index, 1);
                    });
                }
            }
        },
        /**
         * 添加标签
         */
        addTags: function (e, index, id) {
            if (id === -1) {
                if ($(e.target).hasClass('tag-active')) {
                    $(e.target).removeClass('tag-active');
                    vm.ajaxCondition.tagId = [];
                } else {
                    // 移除全部
                    var ul = $(e.target).parentsUntil('.examine-tag')[1];
                    $(ul).find('a').each(function () {
                        $(this).removeClass('tag-active');
                    });
                    // 当前添加
                    $(e.target).addClass('tag-active');
                    vm.ajaxCondition.tagId = [];
                    vm.ajaxCondition.tagId.push(-1);
                }

            } else {
                // 对无标签的处理
                if (vm.ajaxCondition.tagId.indexOf(-1) >= 0) {
                    vm.ajaxCondition.tagId.splice(vm.ajaxCondition.tagId.indexOf(-1), 1);
                    var ul = $(e.target).parentsUntil('.examine-tag')[1];
                    $(ul).find('.no-tag').removeClass('tag-active');
                }

                // 设置选中样式
                $(e.target).toggleClass('tag-active');
                // 无则新增, 有则删除
                if (vm.ajaxCondition.tagId.indexOf(id) === -1) {
                    vm.ajaxCondition.tagId.push(id);
                } else {
                    vm.ajaxCondition.tagId.forEach(function (item, index) {
                        item === id && vm.ajaxCondition.tagId.splice(index, 1);
                    });
                }
            }
        },
        /**
         * 添加筛选: 自定义时间录入的情况
         */
        addConditons: function (e, index, type) {
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
                    vm.condition[index].name = vm.conditionName[index];
                    vm.condition[index].name += ('：' + vm.inputTimeA + '到' + vm.inputTimeB);
                    for (var attr in vm.ajaxCondition.timeArea) {
                        if (vm.condition[index].type === attr) {
                            vm.ajaxCondition.timeArea[attr] = [vm.inputTimeA, vm.inputTimeB];
                        }
                    }
                } else {
                    layers.toast('请填入自定义时间范围');
                }
            }
        },
        /**
         * 返回时间段, 返回 {Array}: 今天/昨天/最近7天/最近30天
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
         * 初始化搜索 表单
         */
        createForm: function () {
            var _this = this;
            layui.use(['element', 'form'], function () {
                var element = layui.element,
                    form = layui.form;
                form.verify({
                    search: function (value) {
                        if ($.trim(value) == '') {
                            return '输入内容不能为空！';
                        }
                    },
                    phone: function (value) {
                        if (!(/^1[34578]\d{9}$/.test(value))) {
                            return '请输入正确的手机号！';
                        }
                    }
                });
                form.on('submit(formSearch)', function (data) {
                    // 只处理电话的搜索
                    if ($.trim(data.field.phone)) {
                        _this.getNavData(function () {
                            layers.closed(vm.isLoadingIndex);
                            main.setTablePage();
                        });
                    }
                    return false;
                });
            })
        },
        /**
         * 获取客户公海用户数据
         */
        getPoolUsr: function (page, callback) {
            page = page || 1;
            tools.ajax({
                url: ajaxurl.customer.getPoolList,
                data: {
                    pagesize: 6,
                    curpage: page
                },
                success: function (res) {
                    if (res.code === 1) {
                        vm.poolUsrList = res.data.list;
                        vm.poolUsrListTotalPage = res.data.total_page;
                        vm.poolUsrListTotalNum = res.data.total_num;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 新增自定义群组
         */
        addGroup: function () {
            var inputName = $.trim(vm.addedGroupName);
            if (inputName) {
                main.checkGroupNameUnique(inputName, '', function () {
                    tools.ajax({
                        url: ajaxurl.customer_group.add,
                        data: {
                            name: inputName
                        },
                        success: function (res) {
                            if (res.code === 1) {
                                vm.addGroupShow = false;
                                vm.addedGroupName = '';
                                main.getLeftMenu(function () {
                                    layers.toast('新增成功！');
                                }, true);
                            } else {
                                layers.toast(res.message);
                            }
                        }
                    })
                })
            } else {
                vm.addedGroupNameEmpty = true;
            }
        },
        /**
         * 检查群组名是否唯一
         * @param inputName 待检查的名字
         * @param id        id
         * @param callback 不存在的回调
         */
        checkGroupNameUnique: function (inputName, id, callback) {
            tools.ajax({
                url: ajaxurl.customer_group.checkNameUnique,
                data: {
                    id: id,
                    name: inputName
                },
                success: function (res) {
                    if (res.code === 1) {// 无重复
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        vm.addedGroupNameExist = true;
                    }
                }
            });
        },
        /**
         * 重命名自定义群组
         */
        renameGroupName: function (id, target) {
            var thatId = id;
            var name = vm.editingGroupName;
            if (name) {
                this.checkGroupNameUnique(name, id, function () {
                    tools.ajax({
                        url: ajaxurl.customer_group.update,
                        data: {
                            id: thatId,
                            name: name
                        },
                        success: function (res) {
                            if (res.code === 1) {
                                vm.editingGroupName = '';
                                main.getLeftMenu(function () {
                                    layers.toast('修改成功！');
                                    $(target).closest('.nav').find('li').removeClass('show-add');
                                }, true);
                            } else {
                                layers.toast(res.message);
                            }
                        }
                    })
                })
            } else {
                vm.addedGroupNameEmpty = true;
            }
        },
        /**
         * 获取组织架构数据
         */
        getUsrOrgList: function (callback, type) {
            type = type || 1;
            tools.ajax({
                url: ajaxurl.department.getdepartment,
                data: {
                    type: type
                },
                success: function (res) {
                    if (res.code === 1) {
                        type === 1
                            ? vm.usrOrgList = res.data
                            : vm.usrOrgListInFiltrate = res.data;
                        // vm.usrOrgList = res.data;
                        // 获取组织架构完成后, 初始化组织架构树形结构
                        // Vue.nextTick(function () {
                        //     $('#org-framework').metisMenu();
                        // });
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
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
         * 处理表格分页
         */
        setTablePage: function () {
            page.init({
                elem: 'page',
                count: vm.usrDataTotalNum,// 总条数
                limit: vm.pagesize,// 每页多少条
                jump: function (obj, flag) {
                    if (!flag) {
                        $('.main-wrap').animate({scrollTop: 0}, 200);
                        vm.curPage = obj.curr;
                        main.getNavData(function () {
                            layers.closed(vm.isLoadingIndex);
                        }, obj.curr);
                    }
                }
            });
        },
        /**
         * 设置每页默认显示条数
         */
        setShowNum: function (e) {
            var _this = this;
            $('.show-num a').each(function () {
                $(this).removeClass('cur');
            });
            $(e.target).addClass('cur');
            vm.pagesize = $.trim($(e.target).text()) * 1;
            this.getNavData(function () {
                _this.setTablePage();
                layers.closed(vm.isLoadingIndex);
            });
        },
        /**
         * 筛选--组织架构搜索
         */
        filterOrgSearch: function () {
            var _this = this;
            layui.use(['form'], function () {
                var form = layui.form;
                _this.form = layui.form;
                form.on('select(search-org)', function (data) {
                    var addItem = {id: data.value.split(',')[0] * 1, name: data.value.split(',')[1]};
                    vm.selectedOrgUsr.push(addItem);
                    vm.selectedOrgUsr = main.unique(vm.selectedOrgUsr).reverse();
                });
            });
        },
        form: '',
        /**
         * 设置表格操作菜单吸附
         */
        setTableMenuFixed: function () {
            var $wrap = $('.main-wrap');
            var $menuBar = $('.t-header');

            // 节流函数用于提高性能, 每 500ms 才计算一次距离而非实时计算
            function _throttle(fn, time) {
                var _self = fn, timer, firstTime = true; //记录是否是第一次执行的flag
                return function () {
                    var args = arguments, //解决闭包传参问题
                        _me = this; //解决上下文丢失问题
                    if (firstTime) { //若是第一次，则直接执行
                        _self.apply(_me, args);
                        return firstTime = false;
                    }
                    if (timer) { //定时器存在，说明有事件监听器在执行，直接返回
                        return false;
                    }
                    timer = setTimeout(function () {
                        clearTimeout(timer);
                        timer = null;
                        _self.apply(_me, args);
                    }, time || 500)
                }
            }

            $wrap.scroll(_throttle(function () {
                if ($wrap.scrollTop() > 350) {
                    $menuBar.addClass('fixedTop');
                } else {
                    $menuBar.removeClass('fixedTop');
                }
            }, 500));
        },
        /**
         * 获取 EC 筛选标签 (临时)
         */
        getECTag: function () {
            tools.ajax({
                url: ajaxurl.customer.getEcTag,
                data: {},
                success: function (res) {
                    if (res.code === 1) {
                        vm.ECTagArr = res.data;
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 导出服务数据
         */
        expServer: function () {
            layers.open({
                title: '导出服务数据',
                area: ['550px', '243px'],
                content: expServer,
                btn: null,
                success: function (layero, index) {
                    var startTime,
                        endTime,
                        $okBtn = $(layero).find('.ok'),
                        nowTime = moment().format('YYYY-MM-DD HH:mm:ss'),
                        checkOk = function () {
                            (startTime && endTime)
                                ? $okBtn.removeClass('not-ok')
                                : !$okBtn.hasClass('not-ok') && $okBtn.addClass('not-ok')
                        };
                    $('.end-time').val(nowTime);
                    layui.use('laydate', function () {
                        var laydate = layui.laydate;
                        endTime = nowTime;// 默认结束时间等于当前时间
                        laydate.render({
                            elem: '.start-time',
                            type: 'datetime',
                            done: function (value) {
                                startTime = value;
                                checkOk();
                            },
                            change: function () {
                                checkOk();
                            }
                        });
                        laydate.render({
                            elem: '.end-time',
                            type: 'datetime',
                            done: function (value) {
                                endTime = value;
                                checkOk();
                            },
                            change: function () {
                                checkOk();
                            }
                        });
                    });
                    layero.on('click', '.ok', function () {
                        var expUrl = '/admin/customers/customer/export_cooper_situation?time_start=';
                        if (startTime && endTime) {
                            if ((new Date(endTime) - new Date(startTime)) < 0) {
                                layers.toast('开始时间不能大于结束时间', {time: 2500});
                            } else {
                                $(this).attr('href', expUrl + startTime + '&time_end=' + endTime);
                                layers.closed(index);
                            }
                        }
                    })
                }
            })
        },
        /**
         * 获取来源筛选项
         */
        getFromChannel: function () {
            tools.ajax({
                url: ajaxurl.setting.index,
                data: {},
                success: function (res) {
                    if (res.code === 1) {
                        //console.log(res.data.customer_from_channel);
                        vm.channelSource = res.data.customer_from_channel;
                    }
                }
            })
        },
        /**
         * 数据权限控制, dataAuth 中的字段表示没有权限
         */
        getDataAuth: function (callback) {
            tools.ajax({
                url: ajaxurl.setting.getDataAuth,
                success: function (res) {
                    if (res.code === 1) {
                        vm.dataAuth = res.data.noHas_auth;
                    } else {
                        layers.toast(res.message);
                    }
                    typeof callback === 'function' && callback.call(this)
                }
            })
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            // 原始数组
            generalList: '',// 常规群组
            operaList: '',// 操作群组
            productList: '',// 产品群组
            addGroupShow: false,// 新增客户按钮
            isLoadingIndex: '',// 载入中动画
            // 表格数据
            all_num: '',// 表格去重总数
            usrDataList: [],// 详细用户列表
            pagesize: 300, // 每页数量
            curPage: '',// 当前页
            usrOrgList: [],// 全局组织架构
            usrOrgListInFiltrate: [],// 筛选专用组织架构
            selectedOrgUsr: [],// 全局组织架构已选用户 {id:1, name: '张三'},{id:2, name: '李四'}
            OrgSearchArr: [],// 组织架构中遍历得到的所有员工
            usrDataTotalNum: '',// 用户总条数
            usrDataTotalPage: '',// 表格总页数
            poolUsrList: [],// 公海用户数据
            poolUsrListTotalPage: '',// 公海用户数据总页数
            poolUsrListTotalNum: '',// 公海用户数据总条数
            checkedIdArr: [],// 已选中的客户 id
            // 备注 & 标签
            remarkList: '',// 备注列表
            addedGroupName: '',// 新增自定义群组名
            addedGroupNameExist: false,// 新增自定义群组名是否已存在
            addedGroupNameEmpty: false,// 新增自定义群组名为空
            editingGroupName: '',// 正在编辑的群组名
            tagList: '',// 标签
            sideGroupType: '',// 自定义群组=0 固定群组=1 特殊群组=2
            showPool: false,// 是否显示客户公海
            // 用于 ajax 提交的筛选条件
            username: '',
            phone: '',
            inputTimeA: '',
            inputTimeB: '',
            ajaxCondition: {
                sideGroupId: '',
                remarkId: [],
                tagId: [],
                timeArea: {
                    create_time: [],
                    relation_time: [],
                    turnover_time: [],
                    join_time: [],
                    no_relation_time: [],
                    update_time: [],
                    service_end_time: [],
                    organizational_structure: []
                },
                order: '',
                system_label_id: '',// ECTag 已选择ID
                selectSource: ''// 已选来源
            },
            channelSource: '',// 来源列表数据
            ECTagArr: '',// ECTag 展示列表数据
            dataAuth: {// 基本信息数据权限
                customer: {},// 基本信息
                customer_contact: {},// 联系方式
                customer_cooper_situation: {}// 合作情况
            },
            // 固定数据
            conditionStr: ['今天', '昨天', '最近7天', '最近30天', '自定义'],
            conditionName: ['创建时间', '联系时间', '成交时间', '加入时间', '未联系时间', '更新动态时间', '服务到期时间', 'EC标签', '组织架构', '来源'],
            condition: [
                {name: '创建时间', show: false, active: false, type: 'create_time'},
                {name: '联系时间', show: false, active: false, type: 'relation_time'},
                {name: '成交时间', show: false, active: false, type: 'turnover_time'},
                {name: '加入时间', show: false, active: false, type: 'join_time'},
                {name: '未联系时间', show: false, active: false, type: 'no_relation_time'},
                {name: '更新动态时间', show: false, active: false, type: 'update_time'},
                {name: '服务到期时间', show: false, active: false, type: 'service_end_time'},
                {name: 'EC标签', show: false, active: false, type: 'ec_tag'},
                {name: '组织架构', show: false, active: false, type: 'organizational_structure'},
                {name: '来源', show: false, active: false, type: 'source'}
            ]
        },
        methods: {
            // 来源筛选确定
            addSource: function (e, index) {

            },
            // 选择来源
            choiceSource: function (e, id, index) {
                var $target = $(e.target);
                $target.parent().find('a').each(function () {
                    $(this).removeClass('active');
                });
                $target.addClass('active');
                for (var i = 0, len = vm.condition.length; i < len; i++) {
                    vm.condition[i].show = false;
                }
                vm.condition[index].active = true;
                vm.condition[index].name = vm.conditionName[index];
                vm.condition[index].name += '：' + $target.text();
                vm.ajaxCondition.selectSource = id;
            },
            // 筛选来源-不限
            cancelSource: function (e, index) {
                $(e.target).parent().find('a').each(function () {
                    $(this).removeClass('active');
                });
                vm.condition[index].show = false;
                vm.condition[index].active = false;
                vm.condition[index].name = vm.conditionName[index];
                vm.ajaxCondition.selectSource = '';
            },
            // 导出服务数据
            expServer: function () {
                main.expServer();
            },
            // ec标签筛选
            chooseECTag: function () {
                var $item = $(event.target);
                $('.ec-tag a').removeClass('active');
                $item.addClass('active');
            },
            // ec标签筛选确定
            okECTag: function () {
                var $curTarget = $('.ec-tag a.active');
                var curIndex = this.conditionName.indexOf('EC标签');
                if (this.ECTagArr.length) {
                    if ($curTarget.length) {
                        this.ajaxCondition.system_label_id = $curTarget.data('id');
                        this.condition[curIndex].show = false;
                        this.condition[curIndex].name = this.conditionName[curIndex];
                        this.condition[curIndex].name += '：' + $curTarget.text();
                        this.condition[curIndex].active = true;
                    } else {
                        layers.toast('请选择 EC 标签！');
                    }
                } else {
                    this.condition[curIndex].show = false;
                }
            },
            // ec标签筛选取消
            cancelECTag: function () {
                var curIndex = this.conditionName.indexOf('EC标签');
                $('.ec-tag a').removeClass('active');
                this.ajaxCondition.system_label_id = '';
                this.condition[curIndex].name = this.conditionName[curIndex];
                this.condition[curIndex].show = false;
                this.condition[curIndex].active = false;
            },
            // 导出客户
            exportUsr: function () {
                if (this.all_num.total_num) {
                    //main.getNavData('', '', 1);
                    // window.location.href = '/admin/customers/customer/export';
                    main.exportUser();
                } else {
                    layers.toast('无客户可导出！');
                }
            },
            // 针对搜索姓名单独处理
            searchName: function () {
                this.phone = $.trim(this.phone);
                this.username = $.trim(this.username);
                if (!this.phone && this.username) {
                    main.getNavData(function () {
                        main.setTablePage();
                        layers.closed(vm.isLoadingIndex);
                    });
                }
            },
            // 表头排序公共方法 orderType : 0最近联系 1最近动态 2创建时间
            orderFilter: function (e, orderType) {
                // 升序传入参数
                var ascStrArr = ['dyn_up', 'relation_up', 'create_up'];
                // 降序传入参数
                var descStrArr = ['dyn_down', 'relation_down', 'create_down'];
                var $that = $(e.currentTarget);
                var sortFlag = $that.data('type');
                $that.closest('th').siblings('th').find('a').removeClass('asc desc').data('type', 0);
                if (sortFlag === 0) {
                    $that.prop('class', 'asc');
                    $that.data('type', 1);
                    // 升序
                    vm.ajaxCondition.order = ascStrArr[orderType];
                } else {
                    $that.prop('class', 'desc');
                    $that.data('type', 0);
                    // 降序
                    vm.ajaxCondition.order = descStrArr[orderType];
                }
            },
            // 客户分配
            allotUsr: function () {
                main.allotUsr();
            },
            // 拨打电话
            getCallIt: function (e, mobileArr) {
                if ($(e.target).is('a.has-phone')) {
                    if (mobileArr) {
                        if (mobileArr.length > 1) {
                            // 有多个号码则打开更多列表
                            if ($(e.target).hasClass('has-phone')) {
                                $(e.target).parent().toggleClass('has-more');
                            }
                        } else {
                            // 只有一个号码
                            window.top.callTellFn(mobileArr[0].contact_id, true);
                        }
                    }
                } else {
                    $(e.target).closest(".call-it").removeClass("has-more");
                    if (!$(e.target).hasClass('layui-icon')) {
                        layers.toast('该客户没有录入电话号码');
                    }
                }
            },
            // 拨打更多列表中的号码
            moreTelCallIt: function (telId) {
                window.top.callTellFn(telId, true);
            },
            // 设置显示数据条数
            setShowNum: function (e) {
                main.setShowNum(e);
            },
            addGroup: function () {
                main.addGroup();
            },
            // 全选所有用户
            checkAllUsr: function () {
                var _this = this;
                if (this.allChecked) {// 全选了
                    // 遍历当前用户数组, 添加到已选择中
                    if (this.checkedIdArr.length) {
                        this.usrDataList.forEach(function (item) {
                            if (_this.checkedIdArr.indexOf(item.id) === -1) {
                                _this.checkedIdArr.push(item.id);
                            }
                        })
                    } else {
                        // 已选择中为空
                        this.usrDataList.forEach(function (item) {
                            _this.checkedIdArr.push(item.id);
                        })
                    }
                } else {
                    _this.checkedIdArr = [];
                }
            },
            checkUsr: function (checkId) {
                // 追加到一个零时数组,每项唯一
                var _this = this;
                if (this.checkedIdArr.indexOf(checkId) === -1) {
                    this.checkedIdArr.push(checkId);
                } else {
                    this.checkedIdArr.forEach(function (item, index) {
                        item === checkId && _this.checkedIdArr.splice(index, 1);
                    });
                }
            },
            // 切换侧栏菜单
            getSideMenu: function (e, queryType, groupType) {
                $('.side-menu li').each(function () {
                    $(this).removeClass('choice')
                });
                $(e.currentTarget).parent().addClass('choice');

                // 大分组及查询分组id
                queryType && (this.ajaxCondition.sideGroupId = queryType);
                this.sideGroupType = groupType;

                // 客户公海的展示
                this.showPool = queryType && (queryType.toLowerCase().indexOf('pool') > -1);

                // 清除搜索结果
                vm.username = '';
                vm.phone = '';
            },
            // 备注不限
            cancelAllRemarks: function (e) {
                if ($(e.target).hasClass('tag-active')) {
                    return false;
                }
                this.ajaxCondition.remarkId = [];
                var ul = $(e.target).parentsUntil('.examine-tag')[1];
                $(ul).find('a').each(function () {
                    $(this).removeClass('tag-active');
                })
            },
            // 标签不限
            cancelAllTag: function (e) {
                if ($(e.target).hasClass('tag-active')) {
                    return false;
                }
                this.ajaxCondition.tagId = [];
                var ul = $(e.target).parentsUntil('.examine-tag')[1];
                $(ul).find('a').each(function () {
                    $(this).removeClass('tag-active');
                })
            },
            // 筛选不限
            cancelCondition: function (e, index) {
                $(e.target).parent().find('a').each(function () {
                    $(this).removeClass('active');
                });
                vm.condition[index].show = false;
                vm.condition[index].active = false;
                vm.condition[index].name = vm.conditionName[index];
                for (var attr in vm.ajaxCondition.timeArea) {
                    if (vm.condition[index].type === attr) {
                        vm.ajaxCondition.timeArea[attr] = [];// 置空
                    }
                }
            },
            // 筛选--选择时间范围
            choiceTime: function (e, index, custom) {
                if (custom) {// 自定义
                    $(e.target).toggleClass('active');
                } else {// 快速时间筛选
                    $(e.target).parent().find('a').each(function () {
                        $(this).removeClass('active');
                    });
                    for (var i = 0, len = vm.condition.length; i < len; i++) {
                        vm.condition[i].show = false;
                    }
                    vm.condition[index].active = true;
                    vm.condition[index].name = vm.conditionName[index];
                    vm.condition[index].name += '：' + $(e.target).text();
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
                    for (var attr in vm.ajaxCondition.timeArea) {
                        if (vm.condition[index].type === attr) {
                            vm.ajaxCondition.timeArea[attr] = quicklyTime;
                        }
                    }
                }
            },
            addRemarks: function (e, index, id) {
                main.addRemarks(e, index, id);
            },
            addTags: function (e, index, id) {
                main.addTags(e, index, id);
            },
            addConditons: function (e, index, type) {
                main.addConditons(e, index, type);
            },
            // 侧栏顶部 + 号新增群组
            showAddGroup: function (e) {
                if ($(e.target).hasClass('disable')) {
                    return false;
                }
                this.addGroupShow = !this.addGroupShow;
                setTimeout(function () {
                    $('#addGroupName').focus();
                }, 0);
                this.addedGroupNameEmpty = false;
                this.addedGroupNameExist = false;
                this.addedGroupName = '';
            },
            // 删除群组提示
            delGroupTip: function (id, totalNum, name) {
                if (totalNum) {
                    main.delGroupTip(id, totalNum, name);
                } else {
                    tools.ajax({
                        url: ajaxurl.customer_group.delete,
                        data: {id: id},
                        success: function (res) {
                            if (res.code === 1) {
                                layers.toast('删除成功！');
                                main.getLeftMenu('', true);
                            } else {
                                layers.toast(res.message);
                            }
                        }
                    });
                }
            },
            // 打开重命名
            editGroup: function (e, id, name) {
                $(e.target).closest('.nav').find('li').removeClass('show-add');
                $(e.target).closest('li').toggleClass('show-add').find('input').focus();
                vm.editingGroupName = name;
            },
            closeEditGroup: function (e) {
                this.addedGroupNameExist = false;
                $(e.target).closest('.nav').find('li').removeClass('show-add');
            },
            renameGroupName: function (id) {
                main.renameGroupName(id, event.target);
            },
            orgSelectAll: function (e, id) {
                var $ul = $(e.target).parent().siblings();
                var $item = $ul.find('a').not('.has-arrow');
                $item.each(function () {
                    var newItem = {id: $(this).data('id'), name: $(this).data('text')};
                    vm.selectedOrgUsr.push(newItem);
                });
                vm.selectedOrgUsr = main.unique(vm.selectedOrgUsr).reverse();
            },
            orgSelectItem: function (e) {
                if (!$(e.target).hasClass('has-arrow')) {
                    var newItem = {id: $(e.target).data('id'), name: $(e.target).data('text')};
                    vm.selectedOrgUsr.push(newItem);
                    vm.selectedOrgUsr = main.unique(vm.selectedOrgUsr).reverse();
                }
            },
            addConditonsOrg: function (e, index, type) {
                if (vm.selectedOrgUsr.length) {
                    vm.condition[index].show = false;
                    vm.condition[index].active = true;
                    vm.condition[index].name = '组织架构：' + vm.selectedOrgUsr.length + '人';
                    var tmpArr = [];
                    vm.selectedOrgUsr.forEach(function (t) {
                        tmpArr.push(t.id);
                    });
                    vm.ajaxCondition.timeArea.organizational_structure = tmpArr;
                } else {
                    layers.toast('请选择人员');
                }
            },
            // 展示筛选条件
            setCondition: function (index) {
                var curActiveIndex = '';
                for (var i = 0, len = vm.condition.length; i < len; i++) {
                    if (vm.condition[i].active) {
                        curActiveIndex = i;
                    }
                }
                // 如果点击了其它窗口的自定义时间筛选,那么清零
                if (curActiveIndex !== index) {
                    // 重置时间
                    this.inputTimeA = '';
                    this.inputTimeB = '';
                    $('.lay-date-a-' + index).val('');
                    $('.lay-date-b-' + index).val('');
                }
                // 关闭其它已展示
                for (var i = 0, len = vm.condition.length; i < len; i++) {
                    if (i !== index) {
                        vm.condition[i].show = false;
                    }
                }
                vm.condition[index].show = !vm.condition[index].show;
                // 如果点击的是筛选中的组织架构, 则重新请求一次组织架构 type = 2 的数据
                if (index === 8 && !this.usrOrgListInFiltrate.length) {
                    main.getUsrOrgList(function () {
                        Vue.nextTick(function () {
                            $('#org-framework').metisMenu();
                            setTimeout(function () {
                                var $item = $('#org-framework').find('a').not('.has-arrow');
                                $item.each(function () {
                                    var newItem = {id: $(this).data('id'), name: $(this).data('text')};
                                    vm.OrgSearchArr.push(newItem);
                                });
                                Vue.nextTick(function () {
                                    main.form.render();
                                });
                            }, 500)
                        });
                    }, 2);
                }
                // 处理组织架构筛选框左侧被隐藏的问题
                var orgIndex = '';// 组织架构的索引
                var $org = $('.organize-framework');
                this.condition.forEach(function (item, index) {
                    item.name === '组织架构' && (orgIndex = index);
                });
                if (this.condition[orgIndex].show) {
                    setTimeout(function () {
                        if ($org.offset().left < 0) {
                            $org.css({
                                'left': '-1px'
                            });
                        }
                    }, 0);
                } else {
                    $org.removeAttr('style');
                }
            },
            // 关闭组织架构筛框
            closeOrg: function (index, statue) {
                if (statue) { // x 关闭按钮仅仅界面隐藏筛选框
                    vm.condition[index].show = false;
                } else {// 取消按钮则取筛选条件
                    vm.condition[index].show = false;
                    vm.condition[index].active = false;
                    vm.condition[index].name = vm.conditionName[index];
                    vm.selectedOrgUsr = [];
                    vm.ajaxCondition.timeArea.organizational_structure = [];
                }
            },
            delChoose: function (index) {
                vm.selectedOrgUsr.splice(index, 1);
            },
            removePublic: function () {
                main.removePublic();
            },
            delUser: function () {
                main.delUser();
            },
            clearUsr: function () {
                main.clearUsrDetail();
            },
            moveGroup: function () {
                main.moveGroup();
            },
            addRemark: function () {
                main.addRemark();
            },
            delRemark: function () {
                main.delRemark();
            },
            importUsr: function () {
                main.importUsr();
            },
            shareUsr: function () {
                main.shareUsr();
            },
            moveUsr: function () {
                main.moveUsr();
            }
        },
        watch: {
            // 监听已选择的筛选数据, 发生变动时请求 ajax 更新表格
            ajaxCondition: {
                handler: function (val, oldVal) {
                    main.getNavData(function () {
                        layers.closed(vm.isLoadingIndex);
                        main.setTablePage();
                    });
                },
                deep: true
            },
            username: function (val, oldVal) {
                if (val.length === 0) {
                    main.getNavData(function () {
                        layers.closed(vm.isLoadingIndex);
                        console.log('search name')
                        main.setTablePage();
                    });
                }
            },
            phone: function (val, oldVal) {
                if (val.length === 0) {
                    main.getNavData(function () {
                        layers.closed(vm.isLoadingIndex);
                        main.setTablePage();
                    });
                }
            },
            addedGroupName: function (val, oldVal) {
                if (val.length > 0) {
                    this.addedGroupNameExist = false;
                    this.addedGroupNameEmpty = false;
                }
            },
            editingGroupName: function (val, oldVal) {
                if (val && val.length > 0) {
                    this.addedGroupNameExist = false;
                    this.addedGroupNameEmpty = false;
                }
            },
            condition: {
                handler: function (val, oldVal) {
                    main.form.render();
                },
                deep: true
            },
            // 针对客户公海中的 `加入时间` 文案调整
            showPool: function (val, oldVal) {
                if (val) {
                    if (this.condition[3].active) {
                        this.condition[3].name = this.condition[3].name.replace('加入时间', '客户群组加入时间');
                        this.conditionName[3] = this.conditionName[3].replace('加入时间', '客户群组加入时间');
                    } else {
                        this.condition[3].name = '客户群组加入时间';
                        this.conditionName[3] = '客户群组加入时间';
                    }
                } else {
                    if (this.condition[3].active) {
                        this.condition[3].name = this.condition[3].name.replace('客户群组加入时间', '加入时间');
                        this.conditionName[3] = this.conditionName[3].replace('客户群组加入时间', '加入时间');
                    } else {
                        this.condition[3].name = '加入时间';
                        this.conditionName[3] = '加入时间';
                    }
                }
            }
        },
        computed: {
            // 全选
            allChecked: {
                get: function () {
                    if (this.usrDataList.length) {
                        return this.checkedCount === this.usrDataList.length;
                    }
                },
                set: function (value) {
                    this.usrDataList.forEach(function (item) {
                        item.checked = value
                    });
                    return value;
                }
            },
            // 计算选中个数
            checkedCount: {
                get: function () {
                    var i = 0;
                    this.usrDataList.forEach(function (item) {
                        if (item.checked === true) i++;
                    });
                    return i;
                }
            }
        },
        filters: {
            formatSex: function (value) {
                var sex = '';
                if (value === '**') return value;
                switch (value) {
                    case '0':
                        sex = '(--)';
                        break;
                    case '1':
                        sex = '(男)';
                        break;
                    case '2':
                        sex = '(女)';
                        break;
                    case '3':
                        sex = '(未知)';
                        break;
                }
                return sex;
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        console.clear();
        main.getFromChannel();
        main.getECTag();
        main.getAllNum(function () {
            main.getNavData(function () {
                // 列表数据中 cache_file_name 依赖 getAllNum 中的 filename 字段
                main.setTablePage();
                layers.closed(vm.isLoadingIndex);
            });
        });
        main.getLeftMenu(function () {
            main.sideMenu();
        });
        main.getTagMark();
        main.getUsrOrgList(function () {
            main.filterOrgSearch();
        });
        main.createForm();
        main.renderLayDate();
        main.setTableMenuFixed();
        main.getDataAuth();
        common.getTabLink();
    };
    _init();
});

require(['moment', 'layui', 'common', 'ajaxurl', 'tools', 'layers', 'text!/assets/popup/document-list.html', 'page', 'template'], function (moment, layui, common, ajaxurl, tools, layers, docList, page, template) {

    // 初始化 template 界定符
    template.config('openTag', '{?');
    template.config('closeTag', '?}');

    var main = {
        /**
         * 初始化 Layui 搜索组件/tab 组件
         */
        searchForm: function () {
            var _this = this;
            layui.use(['form', 'element'], function () {
                var form = layui.form,
                    element = layui.element,
                    attachFileLoadedFlag = false;// 附件是否已加载过
                // 文档页搜索
                form.on('submit(docSearch)', function (data) {
                    vm.docSearchContent = data.field.titleOrName.trim();
                    _this.getDocumentList('', vm.docSearchContent);
                    return false;
                });
                // 附件页搜索
                form.on('submit(attachSearch)', function (data) {
                    vm.attachSearchContent = data.field.titleOrName.trim();
                    // 附件搜索
                    _this.getAttachFileList('', '', '', vm.attachSearchContent);
                    return false;
                });
                // 懒加载附件页列表数据
                element.on('tab', function (data) {
                    if (data.index === 1 && !attachFileLoadedFlag) {
                        attachFileLoadedFlag = true;
                        _this.getAttachFileList('', function () {
                            _this.setAttachListPage();
                        });
                    }
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
         * 删除文档二次确认
         */
        delDocArticleAlert: function (id) {
            var _this = this;
            var alertStr = '<div class="confirm-tips">' +
                '<p>文档删除后，所有人不可见，</p><p>确认删除？</p>' +
                '</div>';
            layers.confirm({
                content: alertStr,
                btn2: function (index, layero) {
                    _this.delDocArticle(id);
                }
            });
        },
        /**
         * 附件列表弹出层
         */
        showDocumentList: function (id) {
            var _this = this;
            var attachList;// 查询得到的附件数组
            _this.getAttachFileList(id, function (attachArr) {
                attachList = attachArr;
                if (attachList.length) {
                    layers.open({
                        btn: null,
                        title: '文档附件',
                        area: ['604px', '373px'],
                        content: docList,
                        success: function (layero, index) {
                            var $layero = $(layero);
                            // 渲染行
                            $layero.find('#docListWrap').html(
                                template('docListItem', {
                                    data: attachList
                                })
                            );
                            // 附件下载
                            $layero.on('click', '.icon-export', function () {
                                main.downAttach($(this).data('id'));
                            });
                            // 关闭
                            $layero.find('.cls-btn').click(function () {
                                layers.closed(index);
                            })
                        }
                    });
                } else {
                    layers.toast('该文档不含附件');
                }
            });
        },
        /**
         * 获取当前文档库id
         */
        getCurDocId: function (callback) {
            var result = tools.getUrlArgs();
            if ($.isEmptyObject(result.data)) {
                throw new Error('页面缺少必要的 ID 参数: docId');
            } else {
                if (result.data.docId) {
                    vm.docId = result.data.docId;
                    vm.materialId = result.data.materialId || null;
                } else {
                    throw new Error('页面缺少必要的参数: 文档库ID: docId')
                }
            }
            typeof callback === 'function' && callback.call(this);
        },
        /**
         * 获取当前文档库分类
         */
        getCategoryList: function () {
            tools.ajax({
                url: ajaxurl.material.docCategoryList,
                data: {},
                type: 'get',
                success: function (res) {
                    if (res.code === 1) {
                        vm.categoryList = res.data;
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 获取当前文档库列表
         */
        getDocumentList: function (page, keywords, callback) {
            var toastIndex;
            tools.ajax({
                url: ajaxurl.material.docList,
                data: {
                    keywords: keywords || '',
                    document_type: vm.docListCondition.document_type,
                    start_time: vm.docListCondition.start_time,
                    end_time: vm.docListCondition.end_time,
                    material_document_id: vm.docId,
                    pagesize: vm.docPageSize,
                    curpage: page || 1
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        toastIndex = indexs;
                    });
                },
                success: function (res) {
                    if (res.code === 1) {
                        // 给每一项添加 checked 属性
                        var originalList = res.data.list || [];
                        originalList.forEach(function (item) {
                            item.checked = false;
                        });
                        vm.docList = originalList;
                        vm.docTotal = +res.data.all_num;
                        // 成功后的回调
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(res.message);
                    }
                },
                complete: function () {
                    setTimeout(function () {
                        layers.closed(toastIndex)
                    }, 200)
                }
            });
        },
        /**
         * 处理文档页分页
         */
        setListPage: function () {
            var _this = this;
            page.init({
                elem: 'doc-page',
                count: vm.docTotal,// 总条数
                limit: vm.docPageSize,// 每页多少条
                jump: function (obj, flag) {
                    if (!flag) {
                        $('.main-wrap').animate({scrollTop: 0}, 200);
                        var curPage = obj.curr;
                        _this.getDocumentList(curPage);
                    }
                }
            });
        },
        /**
         * 处理附件页分页
         */
        setAttachListPage: function () {
            var _this = this;
            page.init({
                elem: 'page',
                count: vm.attachTotal,// 总条数
                limit: vm.docPageSize,// 每页多少条
                jump: function (obj, flag) {
                    if (!flag) {
                        $('.main-wrap').animate({scrollTop: 0}, 200);
                        var curPage = obj.curr;
                        _this.getAttachFileList('', '', curPage);
                    }
                }
            });
        },
        /**
         * 删除指定文档, id 可接受多个1,2,3,4和单个
         */
        delDocArticle: function (id) {
            var _this = this;
            tools.ajax({
                url: ajaxurl.material.delDocArticle,
                data: {
                    material_document_article_id: id
                },
                type: 'post',
                success: function (res) {
                    if (res.code === 1) {
                        layers.toast('删除文档成功');
                        _this.getDocumentList('', '', function () {
                            _this.setListPage();
                        });
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 查看当前文档库附件 [可返回指定文档附件和全部附件]
         */
        getAttachFileList: function (id, callback, page, keywords) {
            var _this = this;
            tools.ajax({
                url: ajaxurl.material.attachList,
                data: {
                    keywords: keywords || '',
                    material_document_id: vm.docId,
                    material_document_article_id: id || '',
                    start_time: vm.attachListCondition.start_time,
                    end_time: vm.attachListCondition.end_time,
                    pagesize: vm.attachPageSize,
                    curpage: page || 1
                },
                type: 'post',
                success: function (res) {
                    if (res.code === 1) {
                        var newList = res.data.list || [];
                        // 转换文件类型
                        newList.forEach(function (item) {
                            // 新增字段
                            item.suffix_style = _this.transferSuffix(item.attach_suffix);
                        });
                        if (id) {
                            typeof callback === 'function' && callback.call(this, newList);
                        } else {
                            vm.attachTotal = res.data.all_num;
                            vm.attachList = newList;
                            typeof callback === 'function' && callback.call(this);
                        }
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 附件文件类型处理
         */
        transferSuffix: function (sfx) {
            /*  附件类型处理:
                type  suffix      description
                ------------------------------
                1     zip         icon-zip
                2     doc|docx    icon-doc
                3     png|jpg     icon-tupian
                4     ppt         icon-ppt
                5     xls|xlsx    icon-excel
                6     other       icon-wendang
            */
            var result;
            switch (sfx) {
                case 'zip':
                    result = 'icon-zip';
                    break;
                case 'doc':
                    result = 'icon-doc';
                    break;
                case 'docx':
                    result = 'icon-doc';
                    break;
                case 'png':
                    result = 'icon-tupian';
                    break;
                case 'jpg':
                    result = 'icon-tupian';
                    break;
                case 'ppt':
                    result = 'icon-ppt';
                    break;
                case 'xls':
                    result = 'icon-excel';
                    break;
                case 'xlsx':
                    result = 'icon-excel';
                    break;
                case 'other':
                    result = 'icon-wendang';
                    break;
                default:
                    result = 'icon-wendang';
            }
            return result;
        },
        /**
         * 附件下载
         */
        downAttach: function (id) {
            var loadingIndex,
                _this = this;
            tools.ajax({
                url: ajaxurl.material.attachDownload,
                data: {
                    attach_id: id
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loadingIndex = indexs
                    })
                },
                success: function (res) {
                    if (res.code === 1) {
                        // 这样处理避免图片直接打开了
                        var a = document.createElement('a');
                        a.download = true;
                        a.href = res.data;
                        a.click();
                        // 更新附件列表下载次数数据
                        _this.getAttachFileList('', _this.setAttachListPage);
                    } else {
                        layers.toast(res.message);
                    }
                },
                complete: function () {
                    setTimeout(function () {
                        layers.closed(loadingIndex)
                    }, 200)
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
            docId: '', // 当前文档库 id
            materialId: '', // 资料库 id
            categoryList: '',// 文档库分类
            checkedCategory: [],// 已选文档分类id
            docTotal: '', // 当前文档库文档总数
            attachTotal: '', // 当前文档库所有附件总数
            docPageSize: 10, // 当前文档库默认展示条数
            attachPageSize: 10, // 当前附件库默认展示条数
            docSearchContent: '',// 文档页搜索内容
            attachSearchContent: '',// 附件页搜索内容
            docList: [], // 当前文档库列表
            docCheckedIdArr: [],// 已选中的文档
            attachList: [], // 当前附件列表
            docListCondition: {// 文档列表筛选条件
                start_time: '',
                end_time: '',
                document_type: ''
            },
            attachListCondition: {// 附件页列表筛选条件
                start_time: '',
                end_time: ''
            },
            condition: [
                {name: '最近更新时间', show: false, active: false},
                {name: '创建时间', show: false, active: false}
            ],
            conditionStr: ['最近更新时间', '创建时间'],
            conditionTime: ['今天', '昨天', '最近7天', '最近30天'],
            inputTimeA: '',
            inputTimeB: ''
        },
        methods: {
            // 下载附件
            downAttach: function (id) {
                main.downAttach(id);
            },
            // 展示附件
            showDocList: function (id) {
                if (id) {
                    main.showDocumentList(id);
                } else {
                    throw new Error('缺少必要的参数 文档Id: article_id');
                    return false;
                }
            },
            // 删除文档
            delDocArticle: function (id) {
                id = $.type(id) === 'string'
                    ? id
                    : this.docCheckedIdArr.join(',');
                id ? main.delDocArticleAlert(id)
                    : layers.toast('请选择文档')
            },
            // 文档页全选所有
            checkAllUsr: function () {
                var _this = this;
                if (this.allChecked) {// 全选了
                    // 遍历当前用户数组, 添加到已选择中
                    if (this.docCheckedIdArr.length) {
                        this.docList.forEach(function (item) {
                            if (_this.docCheckedIdArr.indexOf(item.article_id) === -1) {
                                _this.docCheckedIdArr.push(item.article_id);
                            }
                        })
                    } else {
                        // 已选择中为空
                        this.docList.forEach(function (item) {
                            _this.docCheckedIdArr.push(item.article_id);
                        })
                    }
                } else {
                    this.docCheckedIdArr = [];
                }
            },
            // 文档页选择单个
            checkUsr: function (checkId) {
                var _this = this;
                if (this.docCheckedIdArr.indexOf(checkId) === -1) {
                    this.docCheckedIdArr.push(checkId);
                } else {
                    this.docCheckedIdArr.forEach(function (item, index) {
                        item === checkId && _this.docCheckedIdArr.splice(index, 1);
                    });
                }
            },
            // 文档分类筛选
            checkCategory: function (e, id) {
                var _this = this;
                var $curTarget = $(e.target);
                var $list = $curTarget.parent().parent();
                var len = $list.find('a').length;
                if (id === -1) { // 无分类
                    if ($curTarget.hasClass('tag-active')) {
                        $curTarget.removeClass('tag-active');
                        this.checkedCategory = [];
                        this.docListCondition.document_type = '';
                        $list.find('a').eq(0).addClass('tag-active');
                    } else {
                        $list.find('a').each(function () {
                            $(this).removeClass('tag-active');
                        });
                        $curTarget.addClass('tag-active');
                        this.docListCondition.document_type = -1;
                    }
                } else { // 有分类
                    $list.find('a').eq(0).removeClass('tag-active');
                    $list.find('a').eq(len - 1).removeClass('tag-active');
                    $curTarget.toggleClass('tag-active');
                    if (this.checkedCategory.indexOf(id) === -1) {
                        this.checkedCategory.push(id);
                    } else {
                        this.checkedCategory.forEach(function (item, index) {
                            item === id && _this.checkedCategory.splice(index, 1);
                        })
                    }
                    this.docListCondition.document_type = this.checkedCategory.join(',');
                    if (!this.checkedCategory.length) {
                        // 当没选任何分类时, 不限 active
                        $list.find('a').eq(0).addClass('tag-active');
                    }
                }
            },
            // 备注不限
            notLimitedCategory: function (e) {
                // 置空数据
                this.checkedCategory = [];
                this.docListCondition.document_type = '';

                // 处理样式
                var $curTarget = $(e.target);
                var $list = $curTarget.parent().parent();
                $list.find('a').each(function () {
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
            // 筛选时间不限
            noCondition: function (e, index) {
                this.condition[index].show = false;
                $(e.target).parent().find('a').each(function () {
                    $(this).removeClass('active');
                });
                vm.condition[index].name = vm.conditionStr[index];
                this.condition[index].active = false;
                $('.lay-date-a-' + index).val('');
                $('.lay-date-b-' + index).val('');
                if (index) {// 附件页
                    this.attachListCondition.start_time = '';
                    this.attachListCondition.end_time = '';
                } else {// 文档页
                    this.docListCondition.start_time = '';
                    this.docListCondition.end_time = '';
                }
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

                    if (index) {// 附件页
                        switch ($(e.target).text()) {
                            case vm.conditionTime[0]:// 今天
                                this.attachListCondition.start_time = main.timeArea().today[0];
                                this.attachListCondition.end_time = main.timeArea().today[0];
                                break;
                            case vm.conditionTime[1]:// 昨天
                                this.attachListCondition.start_time = main.timeArea().yesterday[0];
                                this.attachListCondition.end_time = main.timeArea().yesterday[0];
                                break;
                            case vm.conditionTime[2]:// 最近7天
                                this.attachListCondition.start_time = main.timeArea().recent7day[0];
                                this.attachListCondition.end_time = main.timeArea().recent7day[1];
                                break;
                            case vm.conditionTime[3]:// 最近30天
                                this.attachListCondition.start_time = main.timeArea().recent30day[0];
                                this.attachListCondition.end_time = main.timeArea().recent30day[1];
                                break;
                        }
                    } else {// 文档页
                        switch ($(e.target).text()) {
                            case vm.conditionTime[0]:// 今天
                                this.docListCondition.start_time = main.timeArea().today[0];
                                this.docListCondition.end_time = main.timeArea().today[0];
                                break;
                            case vm.conditionTime[1]:// 昨天
                                this.docListCondition.start_time = main.timeArea().yesterday[0];
                                this.docListCondition.end_time = main.timeArea().yesterday[0];
                                break;
                            case vm.conditionTime[2]:// 最近7天
                                this.docListCondition.start_time = main.timeArea().recent7day[0];
                                this.docListCondition.end_time = main.timeArea().recent7day[1];
                                break;
                            case vm.conditionTime[3]:// 最近30天
                                this.docListCondition.start_time = main.timeArea().recent30day[0];
                                this.docListCondition.end_time = main.timeArea().recent30day[1];
                                break;
                        }
                    }
                }
            },
            // 添加自定义筛选时间
            addConditions: function (e, index) {
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

                        if (index) { // 附件页
                            this.attachListCondition.start_time = this.inputTimeA;
                            this.attachListCondition.end_time = this.inputTimeB;
                        } else {// 文档页
                            this.docListCondition.start_time = this.inputTimeA;
                            this.docListCondition.end_time = this.inputTimeB;
                        }
                    } else {
                        layers.toast('请填入自定义时间范围');
                    }
                }
            },
            // 跳转到文档详情
            jumpArticle: function (id) {
                window.location.href = '/admin/material/material_document_article/detail?articleId=' + id;
            }
        },
        computed: {
            // 文档页全选
            allChecked: {
                get: function () {
                    if (this.docList.length) {
                        return this.checkedCount === this.docList.length;
                    }
                },
                set: function (value) {
                    this.docList.forEach(function (item) {
                        item.checked = value
                    });
                    return value;
                }
            },
            // 文档页选中个数
            checkedCount: {
                get: function () {
                    var i = 0;
                    this.docList.forEach(function (item) {
                        if (item.checked === true) i++;
                    });
                    return i;
                }
            }
        },
        watch: {
            docListCondition: {// 文档页筛选监控
                handler: function (val, oldVal) {
                    main.getDocumentList('', '', function () {
                        main.setListPage();
                    });
                },
                deep: true
            },
            attachListCondition: {// 附件页筛选监控
                handler: function (val, oldVal) {
                    main.getAttachFileList('', function () {
                        main.setAttachListPage();
                    });
                },
                deep: true
            },
            // 内容为空时触发一次搜索
            docSearchContent: function (val, oldVal) {
                !val && main.getDocumentList('', '', function () {
                    main.setListPage();
                });
            },
            attachSearchContent: function (val, oldVal) {
                !val && main.getAttachFileList('', function () {
                    main.setAttachListPage();
                });
            }
        }
    });


    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.getCategoryList();
        main.getCurDocId(function () {
            main.getDocumentList('', '', function () {
                main.setListPage();
            });
        });
        main.renderLayDate();
        main.searchForm();
        common.getTabLink();
    };
    _init();
});
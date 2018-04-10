require(['moment', 'layui', 'common', 'ajaxurl', 'tools', 'layers', 'text!/assets/popup/add-edit-catalog.html'], function (moment, layui, common, ajaxurl, tools, layers, newCatalog) {

    var main = {
        /**
         * 搜索分类
         */
        searchForm: function () {
            var _this = this;
            layui.use(['form'], function () {
                var form = layui.form;
                form.on('submit(formSearchAll)', function (data) {
                    var search = data.field.search;
                    if (!search) {
                        layers.toast('请输入搜索内容');
                        return false;
                    }
                    _this.getCategoryList(search);
                    return false;
                });
            })
        },
        /**
         * 新建文档分类
         */
        newCategoryArr: function () {
            var $layero;
            var _this = this;
            layers.confirm({
                title: '新建文档分类',
                content: newCatalog,
                closeBtn: 0,
                success: function (layero, index) {
                    $layero = $(layero);
                    $layero.find('p.err').hide();
                    $layero.find('input').focus();
                    $layero.on('input', 'input.input-category-name', function () {
                        $layero.find('p.err').hide();
                    })
                },
                btn2: function (index, layero) {
                    var newName = $.trim($layero.find('input').val());
                    if (!newName) {
                        $layero.find('p.err').text('请输入文档分类').show();
                        return false;
                    }
                    tools.ajax({
                        url: ajaxurl.material.addDocCategory,
                        data: {
                            class_name: newName
                        },
                        type: 'get',
                        success: function (res) {
                            if (res.code === 1) {
                                layers.toast('新增文档分类成功');
                                layers.closed(index);
                                _this.getCategoryList();
                            } else if (res.code === -2) {
                                $layero.find('p.err').text('文档分类已存在，请重新输入').show();
                            } else {
                                layers.toast(res.message);
                                layers.closed(index);
                            }
                        }
                    });
                    return false;
                }
            });
        },
        /**
         * 编辑文档分类 [重命名]
         */
        editCategoryArr: function (oldName, id) {
            var $layero;
            var _this = this;
            layers.confirm({
                title: '编辑文档分类',
                content: newCatalog,
                success: function (layero, index) {
                    $layero = $(layero);
                    $layero.find('p.err').hide();
                    $layero.find('input').focus().val(oldName);
                    $layero.on('input', 'input.input-category-name', function () {
                        $layero.find('p.err').hide();
                    })
                },
                btn2: function (index, layero) {
                    // 确认的回调
                    var newName = $.trim($layero.find('input').val());
                    if (!newName) {
                        $layero.find('p.err').text('请输入文档分类').show();
                        return false;
                    }
                    if (newName === oldName) {
                        layers.closed(index);
                        return false;
                    }
                    tools.ajax({
                        url: ajaxurl.material.editCategoryItem,
                        data: {
                            class_name: newName,
                            class_id: id
                        },
                        type: 'get',
                        success: function (res) {
                            if (res.code === 1) {
                                layers.toast('编辑文档分类成功');
                                layers.closed(index);
                                _this.getCategoryList();
                            } else if (res.code === -2) {
                                $layero.find('p.err').text('文档分类已存在，请重新输入').show();
                            } else {
                                layers.toast(res.message);
                                layers.closed(index);
                            }
                        }
                    });
                    return false;
                }
            });
        },
        /**
         * 删除文档分类
         */
        delCategoryArr: function (id) {
            var _this = this;
            var alertStr = '<div class="confirm-tips">' +
                '<p>文档分类删除后，下属文档将无分类，</p><p>确认删除？</p>' +
                '</div>';
            layers.confirm({
                content: alertStr,
                btn2: function (index, layero) {
                    // 确认的回调
                    _this.delCategoryItem(id);
                }
            });
        },
        /**
         * 获取分档分类列表
         */
        getCategoryList: function (search) {
            var toastIndex;
            tools.ajax({
                url: ajaxurl.material.docCategoryList,
                data: {
                    class_name: search || ''
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
                        var originalList = $.isArray(res.data) ? res.data : [];
                        originalList.forEach(function (item) {
                            item.checked = false;
                        });
                        vm.categoryArr = originalList;
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
         * 删除文档分类, id可删除多个: 1,2,3,4
         */
        delCategoryItem: function (id) {
            var _this = this;
            tools.ajax({
                url: ajaxurl.material.delCategoryItem,
                data: {
                    class_id: id
                },
                type: 'get',
                success: function (res) {
                    if (res.code === 1) {
                        layers.toast('删除分类成功');
                        _this.getCategoryList();
                    } else {
                        layers.toast(res.message);
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
            search: '',// 搜索内容
            categoryArr: [], // 分类数组
            checkedCategoryArr: []// 已选择分类
        },
        methods: {
            // 删除文档分类(含批量删除)
            delCategoryArr: function (id) {
                id = $.type(id) === 'string'
                    ? id
                    : this.checkedCategoryArr.join(',');
                id ? main.delCategoryArr(id)
                    : layers.toast('请选择分类')
            },
            // 编辑文档分类
            editCategoryArr: function (oldName, id) {
                main.editCategoryArr(oldName, id);
            },
            // 新建分档分类
            newCategoryArr: function () {
                main.newCategoryArr();
            },
            // 全选所有
            checkAllUsr: function () {
                var _this = this;
                if (this.allChecked) {// 全选了
                    // 遍历当前用户数组, 添加到已选择中
                    if (this.checkedCategoryArr.length) {
                        this.categoryArr.forEach(function (item) {
                            if (_this.checkedCategoryArr.indexOf(item.id) === -1) {
                                _this.checkedCategoryArr.push(item.id);
                            }
                        })
                    } else {
                        // 已选择中为空
                        this.categoryArr.forEach(function (item) {
                            _this.checkedCategoryArr.push(item.id);
                        })
                    }
                } else {
                    this.checkedCategoryArr = [];
                }
            },
            // 选择单个
            checkUsr: function (checkId) {
                // 追加到一个零时数组,每项唯一
                var _this = this;
                if (this.checkedCategoryArr.indexOf(checkId) === -1) {
                    this.checkedCategoryArr.push(checkId);
                } else {
                    this.checkedCategoryArr.forEach(function (item, index) {
                        item === checkId && _this.checkedCategoryArr.splice(index, 1);
                    });
                }
            },
            goBack: function () {
                window.history.go(-1);
            }
        },
        computed: {
            // 全选
            allChecked: {
                get: function () {
                    if (this.categoryArr.length) {
                        return this.checkedCount === this.categoryArr.length;
                    }
                },
                set: function (value) {
                    this.categoryArr.forEach(function (item) {
                        item.checked = value
                    });
                    return value;
                }
            },
            // 计算选中个数
            checkedCount: {
                get: function () {
                    var i = 0;
                    this.categoryArr.forEach(function (item) {
                        if (item.checked === true) i++;
                    });
                    return i;
                }
            }
        },
        watch: {
            search: function (val, OldVal) {
                val.length === 0 && main.getCategoryList()
            }
        }
    });


    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.searchForm();
        main.getCategoryList();
        common.getTabLink();
    };
    _init();
});
require(['layui', 'common', 'layers', 'tools', 'ajaxurl', 'text!/assets/popup/del-material.html', 'text!/assets/popup/del-material-item.html'], function (layui, common, layers, tools, ajaxurl, delMaterial, delMaterialItem) {

    var main = {
        /**
         * 初始化 Collapse
         */
        initCollapse: function () {
            Vue.nextTick(function () {
                layui.use(['element'], function () {
                    var element = layui.element;
                    element.init();
                })
            })
        },
        /**
         * 删除资料库二次确认
         */
        delMaterialAlert: function (willDelIndex) {
            var _this = this;
            layers.confirm({
                content: delMaterial,
                btn2: function () {
                    _this.delMaterial(willDelIndex)
                }
            });
        },
        /**
         * 删除文档库二次确认
         */
        delMaterialItem: function (id) {
            var _this = this;
            layers.confirm({
                content: delMaterialItem,
                btn2: function (index, layero) {
                    //console.log(id);
                    _this.delDocItem(id)
                }
            });
        },
        /**
         * 新增资料库
         */
        newMaterial: function () {
            var _this = this;
            layui.use(['form'], function () {
                var form = layui.form;
                form.verify({
                    // 新增资料库验证规则
                    newMaterialItem: function (value) {
                        if ($.trim(value) == '') {
                            return '输入内容不能为空！';
                        }
                    }
                });
                form.on('submit(formAdd)', function (data) {
                    tools.ajax({
                        url: ajaxurl.material.add,
                        data: {
                            material_name: data.field.material_name
                        },
                        type: 'get',
                        success: function (res) {
                            if (res.code === 1) {
                                layers.toast('新增资料库成功');
                                _this.getMaterialList();
                                // 隐藏新增输入框
                                vm.isShowNewMate = !vm.isShowNewMate;
                                vm.newMaterialVal = '';
                            } else {
                                layers.toast(res.message);
                            }
                        }
                    });
                    return false;
                });
            })
        },
        /**
         * 删除资料库
         */
        delMaterial: function (index) {
            var _this = this;
            tools.ajax({
                url: ajaxurl.material.delete,
                data: {
                    material_id: index
                },
                type: 'get',
                success: function (res) {
                    if (res.code === 1) {
                        layers.toast('删除资料库成功');
                        _this.getMaterialList();
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 获取资料库列表
         */
        getMaterialList: function () {
            var _this = this;
            tools.ajax({
                url: ajaxurl.material.index,
                data: {},
                type: 'get',
                success: function (res) {
                    if (res.code === 1) {
                        vm.materialList = res.data;
                        _this.initCollapse();
                        _this.setMaterialItem();
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 设置每个资料库属性
         */
        setMaterialItem: function () {
            var len = vm.materialList.length;
            var setObj = {
                showNewMaterialItem: false,// 是否展示编辑文档输入框
                newName: ''// 新增的文档名称
            };
            for (var i = 0; i < len; i++) {
                vm.materialItemConfig.push(setObj)
            }
        },
        /**
         * 新增文档库名称
         */
        addDocItem: function (id, index, name) {
            var _this = this;
            tools.ajax({
                url: ajaxurl.material.addDocItem,
                data: {
                    document_name: name,
                    material_id: id
                },
                type: 'post',
                success: function (res) {
                    if (res.code === 1) {
                        layers.toast('新增文档库成功');
                        Vue.set(vm.materialItemConfig, index, {
                            showNewMaterialItem: false,
                            newName: ''
                        });
                        _this.getMaterialList();
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 删除指定文档库
         */
        delDocItem: function (id) {
            var _this = this;
            tools.ajax({
                url: ajaxurl.material.delDocItem,
                data: {
                    material_document_id: id
                },
                type: 'get',
                success: function (res) {
                    if (res.code === 1) {
                        layers.toast('删除文档库成功');
                        _this.getMaterialList();
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 重命名资料库
         */
        renameMaterialItem: function (id, name) {
            var _this = this;
            tools.ajax({
                url: ajaxurl.material.edit,
                data: {
                    material_id: id,
                    material_name: name
                },
                type: 'get',
                success: function (res) {
                    if (res.code === 1) {
                        layers.toast('编辑资料库成功');
                    } else {
                        layers.toast(res.message);
                    }
                    _this.getMaterialList();
                }
            });
        },
        /**
         * 重命名文档库
         */
        renameDocItem: function (id, name) {
            var _this = this;
            tools.ajax({
                url: ajaxurl.material.editDocItem,
                data: {
                    material_document_id: id,
                    material_document_name: name
                },
                type: 'get',
                success: function (res) {
                    if (res.code === 1) {
                        layers.toast('编辑文档库成功');
                    } else {
                        layers.toast(res.message);
                    }
                    _this.getMaterialList();
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
            isShowNewMate: false,// 是否展示新增资料库输入框
            newMaterialVal: '',// 新增资料库名称
            materialList: '',// 资料库列表
            materialItemConfig: []// 资料库设置, 用于配置新增文档名 {showNewMaterialItem:false, newName:''}
        },
        methods: {
            //保存新增文档
            saveDocItem: function (id, index) {
                var newName = this.materialItemConfig[index].newName;
                if (newName.trim()) {
                    main.addDocItem(id, index, newName);
                } else {
                    // 没输入值
                    Vue.set(this.materialItemConfig, index, {
                        showNewMaterialItem: false,
                        newName: ''
                    })
                }
            },
            // 新增文档库
            newDocItem: function (index) {
                // Vue 不能动态监听数组
                // 参考文档 https://cn.vuejs.org/v2/guide/list.html#注意事项
                // 错误: this.materialItemConfig[index].showNewMaterialItem = true;
                Vue.set(this.materialItemConfig, index, {
                    showNewMaterialItem: true,
                    newName: ''
                })
            },
            // 展示新增资料库
            showMateItem: function () {
                this.isShowNewMate = !this.isShowNewMate;
            },
            // 删除资料库确认框
            delMaterial: function (index) {
                main.delMaterialAlert(index);
            },
            delMaterialItem: function (index) {
                main.delMaterialItem(index);
            },
            // 编辑
            edit: function (e) {
                $(e.target)
                    .focus()
                    .select()
                    .addClass('show')
                    .removeAttr('readonly')
            },
            // 离开焦点保存
            materialBlur: function (e, oldName, id, type) {
                $(e.target).removeClass('show').attr('readonly', true);
                var newName = e.target.value;
                // 如果值发生了变化
                if (newName.trim() !== oldName) {
                    // type  0资料库 1文档库
                    type ? main.renameDocItem(id, newName)
                         : main.renameMaterialItem(id, newName)
                }
            },
            // 阻止单击
            stopClick: function () {
                return false;
            }
        },
        // 新增自定义指令 v-focus
        directives: {
            focus: {
                update: function (el, value) {
                    value && el.focus()
                }
            }
        }
    });


    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.getMaterialList();
        main.newMaterial();
        common.getTabLink();
    };
    _init();
});
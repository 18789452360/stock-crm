require(['common', 'layui', 'tools', 'ajaxurl', 'layers'], function (common, layui, tools, ajaxurl, layers) {

    var main = {
        /**
         * 初始化 Layui 表格
         */
        createForm: function () {
            var that = this;
            layui.use(['element', 'form'], function () {
                var element = layui.element,
                    form = layui.form;
                form.verify({
                    search: function (value) {
                        if ($.trim(value) == '') {
                            return '输入内容不能为空！';
                        }
                    }
                })
                form.on('submit(formSearch)', function (data) {
                    if ($.trim(data.field.mark_name) != '') {
                        that.search();
                    }
                    return false;
                });
                form.on('submit(formAdd)', function (data) {
                    if ($.trim(data.field.mark_name) != '') {
                        that.add();
                    }
                    return false;
                });
            })
        },
        /**
         * [getList description] 获取员工自定义客户备注列表
         * @return {[type]} [description]
         */
        getList: function () {
            if (vm.userinfo) {
                tools.ajax({
                    url: ajaxurl.remarks.index,
                    data: {employee_id: vm.userinfo.id},
                    type: 'get',
                    success: function (result) {
                        if (result.code == 1) {
                            if (result.data.list != undefined) {
                                vm.list = result.data.list;
                            }
                        } else {
                            layers.toast(result.message);
                        }
                    }
                })
            }
        },
        /**
         * [search description] 搜索备注名称
         * @return {[type]} [description]
         */
        search: function () {
            var temp = [];
            tools.ajax({
                url: ajaxurl.remarks.search,
                data: {mark_name: vm.searchVal, employee_id: vm.userinfo.id},
                type: 'post',
                success: function (result) {
                    if (result.code == 1) {
                        temp.push(result.data);
                        vm.list = temp;
                    } else {
                        layers.toast(result.message);
                    }
                }
            })
        },
        /**
         * [getNum description] 获取当前备注下有多少客户
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        getNum: function (id, callback) {
            if (id == '') return;
            tools.ajax({
                url: ajaxurl.remarks.num,
                data: {employee_id: vm.userinfo.id, mark_id: id},
                type: 'post',
                success: function (result) {
                    if (result.code == 1) {
                        typeof callback === 'function' && callback.call(this, result.data);
                    } else {
                        layers.toast(result.message);
                    }
                }
            })
        },
        /**
         * [del description] 删除备注
         * @param  {[type]} arrindex [description]
         * @param  {[type]} id    [description]
         * @param  {[type]} name  [description]
         * @return {[type]}       [description]
         */
        del: function (arrindex, id, name) {
            this.getNum(id, function (res) {
                if (res != undefined) {
                    var num = res;
                    layers.confirm({
                        content: '<div class="confirm-tips"><p>你是否确定删除？</p><p>删除后客户的本条备注也将删除</p></div>',
                        btn2: function (index, layero) {
                            if (vm.userinfo) {
                                tools.ajax({
                                    url: ajaxurl.remarks.delown,
                                    data: {mark_id: id},
                                    type: 'post',
                                    success: function (result) {
                                        if (result.code == 1) {
                                            layers.closed(index);
                                            layers.toast('删除成功！');
                                            vm.list.splice(arrindex, 1);
                                        } else {
                                            layers.toast(result.message);
                                        }
                                    }
                                })
                            }
                        }
                    });
                }
            });
        },
        /**
         * [add description] 添加备注
         */
        add: function () {
            var listLens = vm.list.length;
            if (listLens >= 50) {
                layers.toast('客户备注最多50个！');
                return;
            }
            tools.ajax({
                url: ajaxurl.remarks.add,
                data: {mark_name: vm.addVal, employee_id: vm.userinfo.id},
                type: 'post',
                success: function (result) {
                    if (result.code == 1) {
                        layers.toast('添加成功');
                        vm.list.push(result.data);
                        vm.addVal = '';
                        vm.addShow = false;
                    } else {
                        vm.tipsword = result.message
                    }
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
            list: [],
            userinfo: common.getUserInfo(),
            searchVal: '', //搜索
            addVal: '', //添加
            tipsword: '',
            addShow: false,
            available: false
        },
        methods: {
            deleteRemark: function (index, id, name) {
                if (index != undefined && id != undefined && name != undefined) {
                    main.del(index, id, name);
                } else {
                    throw new Error('缺少对应参数！');
                }
            },
            tagJump: function () {
                var $parentDoc = common.getDocument();
                var curTabText = $parentDoc.find('.page-tabs-content .active a').text();
                // 从通话记录未知客户里点击进入的新增客户
                // 特殊处理返回到首页
                if (curTabText === '客户管理') {
                    window.history.go(-1);
                } else {
                    common.closeTab(0);
                }
            }
        },
        watch: {
            addShow: {
                handler: function (val, oldVal) {
                    if (val === false) {
                        this.addVal = '';
                        this.tipsword = '';
                    }
                },
                deep: true
            },
            searchVal: {
                handler: function (val, oldVal) {
                    if ($.trim(val) != '') {
                        this.available = true;
                    } else {
                        this.available = false;
                    }
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
        main.createForm();
        common.getTabLink();
        main.getList();
    };
    _init();
});

require(['common', 'layui', 'tools', 'ajaxurl', 'layers'], function (common, layui, tools, ajaxurl, layers) {

    var main = {
        /**
         * 搜索手机号
         */
        createForm: function () {
            var _this = this;
            layui.use(['element', 'form'], function () {
                var element = layui.element;
                var form = layui.form;
                // 验证
                form.verify({
                    search: function (value) {
                        if ($.trim(value) == '') {
                            layers.toast('请输入电话！');
                            return false;
                        }
                        // 规则: 1-30位数字
                        if (!/^[0-9]+(.[0-9]{1,30})?$/.test($.trim(value))) {
                            layers.toast('电话输入错误，请重新输入！');
                        }
                    }
                });
                // 提交搜索
                form.on('submit(formSearch)', function (data) {
                    if ($.trim(data.field.phone) !== '' && /^[0-9]+(.[0-9]{1,30})?$/.test($.trim(data.field.phone))) {
                        _this.search();
                    }
                    return false;
                });
            })
        },
        /**
         * 搜索客户绑定关系
         */
        search: function () {
            tools.ajax({
                url: ajaxurl.customer.getRelation,
                data: {
                    mobile: vm.searchVal
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        vm.isLoadingIndex = indexs;
                    });
                },
                success: function (res) {
                    layers.closed(vm.isLoadingIndex);
                    if (res.code === 1) {
                        vm.info = res.data.customer;
                        vm.relationArr = res.data.employee_list;
                        vm.showResult = !!res.data.customer;
                    } else {
                        // 客户详情不存在
                        vm.showResult = false;
                        vm.info = '';
                        layers.toast(res.message);
                    }
                }
            })
        },
        /**
         * 删除绑定关系
         * @param cid   客户id
         * @param eid   员工id
         * @param arrindex   删除项所在索引
         */
        del: function (cid, eid, arrindex) {
            var html = '<div class="confirm-tips"><p>删除后此用户将解除与本客户的绑定关系</p><p>无法查看本客户，确认删除？</p></div>';
            layers.confirm({
                content: html,
                btn2: function (index, layero) {
                    tools.ajax({
                        url: ajaxurl.customer.delRelation,
                        data: {
                            customerIds: cid,
                            del_employee_id: eid,
                            is_delete: 1
                        },
                        type: 'get',
                        beforeSend: function () {
                            layers.load(function (indexs) {
                                vm.isLoadingIndex = indexs;
                            });
                        },
                        success: function (result) {
                            layers.closed(vm.isLoadingIndex);
                            if (result.code === 1) {
                                layers.closed(index);
                                layers.toast('删除成功！');
                                vm.relationArr.splice(arrindex, 1);
                            } else {
                                layers.toast(result.message);
                            }
                        }
                    })
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
            searchVal: '',// 搜索
            available: false,// 搜索时变蓝色
            info: '', // 基本信息
            relationArr: '',// 关系列表
            isLoadingIndex: '',// 搜索中
            showResult: false
        },
        methods: {
            deleteRemark: function (cid, eid, index) {
                main.del(cid, eid, index);
            }
        },
        watch: {
            // 为空时清空搜索结果
            searchVal: function (val, newVal) {
                if (val.length === 0) {
                    this.available = false;
                    this.showResult = false;
                    this.info = '';
                } else {
                    this.available = true;
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
    };
    _init();
});
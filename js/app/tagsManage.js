require(['common', 'layui', 'tools', 'ajaxurl', 'layers'], function (common, layui, tools, ajaxurl, layers) {

    var main = {
        resultlens: 0,
        /**
         * 初始化 Layui 折叠面板
         */
        createForm: function () {
            layui.use(['element', 'form'], function () {
                var element = layui.element;
                element.init();// 重新渲染
            })
        },
        /**
         * 获取标签列表
         */
        getList: function () {
            var that = this;
            tools.ajax({
                url: ajaxurl.tag.index,
                data: {},
                beforeSend: function () {
                    layers.load();
                },
                success: function (result) {
                    if (result.code == 1) {
                        var resultData = result.data;
                        var resultlens = result.data.length;
                        //that.resultlens = resultlens; //缓存所有列表长度
                        for (var i = 0; i < resultlens; i++) {
                            var childLen = resultData[i].child.length;
                            that.resultlens += childLen;
                            // 初始化分组选中状态
                            resultData[i].groupSelectAll = false;
                            // 初始化当前分组已选择
                            resultData[i].totalSelect = 0;
                            for (var k = 0; k < childLen; k++) {
                                // 所有 tag 初始化为 false 状态
                                resultData[i].child[k].active = false;
                            }
                        }
                        vm.resultlens = that.resultlens;

                        // 处理用户已经选中的选中的tag标签
                        that.choice(function (res) {
                            var reslens = res.length;
                            for (var i = 0; i < resultlens; i++) {// 循环分组
                                var flag = 0;
                                for (var j = 0; j < reslens; j++) {
                                    if (resultData[i].id == res[j].pid) {
                                        var childData = resultData[i].child,
                                            childLens = childData.length;
                                        for (var k = 0; k < childLens; k++) {// 循环分组 tag
                                            if (childData[k].id === res[j].id) {
                                                resultData[i].child[k].active = true; //处理选中状态
                                                flag++;
                                            }
                                        }
                                        // 拉取用户已选择的 tag , 已经有了则可以展示取消已选按钮
                                        resultData[i].totalSelect = flag;
                                        resultData[i].groupSelectAll = !!flag;// 双叹号转成布尔值
                                    }
                                }
                            }
                            vm.list = resultData;
                            that.createForm();
                        })
                    } else {
                        layers.toast(result.message);
                    }
                },
                complete: function () {
                    layers.closedAll();
                }
            })
        },
        /**
         * 当前员工选择标签列表
         * @param callback
         */
        choice: function (callback) {
            tools.ajax({
                url: ajaxurl.tag.choice,
                data: {employee_id: vm.userinfo.id},
                success: function (result) {
                    if (result.code == 1) {
                        if (result.data.list != undefined) {
                            vm.choiceLens = result.data.list.length;
                            typeof callback === 'function' && callback.call(this, result.data.list)
                        }
                    } else {
                        layers.toast(result.message);
                    }
                }
            })
        },
        /**
         * 保存选择的标签
         * @param tag_id
         */
        determine: function (tag_id) {
            var formatTagId = '';
            if (tag_id.length) {
                formatTagId = tag_id.join(',');// 构造格式用于提交多个
            }
            tools.ajax({
                url: ajaxurl.tag.determine,
                data: {
                    tag_code: formatTagId
                },
                success: function (result) {
                    if (result.code == 1) {
                        layers.toast('保存成功！');
                        setTimeout(function () {
                            window.location.href = '/admin/customers/customer';
                        }, 1000);
                    } else {
                        layers.toast(result.message);
                    }
                },
                complete: function () {
                    vm.addTagBtn = false;
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
            list: [], //列表结果项
            tag_id: [],//用户选择的目标ID
            userinfo: common.getUserInfo(),
            choiceLens: 0, //选中标签长度
            resultlens: 0, //缓存所有列表的长度
            addTagBtn: false
        },
        methods: {
            // 全选
            choiceAll: function () {
                if (this.choiceLens == this.resultlens) return;
                var list = this.list,
                    lens = this.list.length;
                for (var i = 0; i < lens; i++) {
                    this.list[i].groupSelectAll = true;
                    for (var j = 0, childLens = list[i].child.length; j < childLens; j++) {
                        this.list[i].child[j].active = true;
                    }
                }
                this.choiceLens = this.resultlens;
            },
            // 取消全选
            cancelAll: function () {
                if (this.choiceLens == 0) return;
                var list = this.list, lens = this.list.length;
                for (var i = 0; i < lens; i++) {
                    this.list[i].groupSelectAll = false;
                    for (var j = 0, childLens = list[i].child.length; j < childLens; j++) {
                        this.list[i].child[j].active = false;
                    }
                }
                this.choiceLens = 0;
            },
            // 单个选中
            choice: function (event, tag_code, pid, groupIndex) {
                if (tag_code == undefined && pid == undefined) {
                    throw new Error('缺少参数');
                }
                //防止用户快速点击
                var $target = $(event.target);
                if ($target.hasClass('disabled')) return;
                $target.addClass('disabled');
                //循环处理选中状态
                var lens = this.list.length;
                for (var i = 0; i < lens; i++) {
                    if (pid == this.list[i].id) {
                        for (var j = 0, childLens = this.list[i].child.length; j < childLens; j++) {
                            if (tag_code == this.list[i].child[j].tag_code) {
                                this.list[i].child[j].active = !this.list[i].child[j].active;
                                if (this.list[i].child[j].active) {
                                    this.choiceLens++;
                                    this.list[i].totalSelect++;
                                } else {
                                    this.choiceLens--;
                                    this.list[i].totalSelect--;
                                }
                            }
                        }
                    }
                }
                $target.removeClass('disabled');
                // 当前分组所有 tag 选中时, 当前分组取消全选可用
                this.list[groupIndex].groupSelectAll = !!this.list[groupIndex].totalSelect;
            },
            // 确定(保存)
            addTag: function () {
                this.addTagBtn = true;
                var listLens = this.list.length,
                    tempArr = [];
                if (listLens) {
                    for (var i = 0; i < listLens; i++) {
                        for (var j = 0, childLens = this.list[i].child.length; j < childLens; j++) {
                            // 每个 tag 上都有一个 active 属性, 遍历所有 tag
                            // 拿到具有 active 拼接后, ajax 提交到后端
                            if (this.list[i].child[j].active) {
                                tempArr.push(this.list[i].child[j].tag_code);
                            }
                        }
                    }
                }
                main.determine(tempArr);
            },
            // 单组取消已选
            itemCancelAll: function (index) {
                var groupArr = this.list[index].child;
                this.choiceLens -= groupArr.length;
                this.list[index].groupSelectAll = false;
                $.type(groupArr === 'array') && groupArr.forEach(function (item) {
                    item.active = false;
                });

            },
            // 单组全选
            itemChoiceAll: function (index) {
                if (this.choiceLens === this.resultlens) return;
                var groupArr = this.list[index].child;
                this.list[index].totalSelect = groupArr.length;
                this.choiceLens += groupArr.length;
                this.list[index].groupSelectAll = true;
                $.type(groupArr === 'array') && groupArr.forEach(function (item) {
                    item.active = true;
                })
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.getList();
        common.getTabLink();
    };
    _init();
});

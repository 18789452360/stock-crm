require(['common', 'layui', 'tools', 'ajaxurl', 'layers'], function (common, layui, tools, ajaxurl, layers) {

    var main = {
        resultlens: 0,
        /**
         * 初始化 Layui 表格
         */
        createForm: function () {
            layui.use(['element', 'form'], function () {
                var element = layui.element,
                    form = layui.form;
            })
        },
        /**
         * [getList description] 获取标签列表
         * @return {[type]} [description]
         */
        getList: function () {
            var that = this;
            tools.ajax({
                url: ajaxurl.tag.index,
                data: {},
                success: function (result) {
                    if (result.code == 1) {
                        var resultData = result.data;
                        var resultlens = result.data.length;
                        //that.resultlens = resultlens; //缓存所有列表长度
                        for (var i = 0; i < resultlens; i++) {
                            var childLen = resultData[i].child.length;
                            that.resultlens += childLen;
                            for (var k = 0; k < childLen; k++) {
                                resultData[i].child[k].active = false; //处理选中状态
                            }
                        }
                        vm.resultlens = that.resultlens;
                        //获取用户默认选中的tag标签
                        that.choice(function (res) {
                            var reslens = res.length;
                            for (var i = 0; i < resultlens; i++) {
                                for (var j = 0; j < reslens; j++) {
                                    if (resultData[i].id == res[j].pid) {
                                        var childData = resultData[i].child, childLens = childData.length;
                                        for (var k = 0; k < childLens; k++) {
                                            if (childData[k].id === res[j].id) {
                                                resultData[i].child[k].active = true; //处理选中状态
                                            }
                                        }
                                    }
                                }
                            }
                            vm.list = resultData;
                            that.createForm(); //初始化layui组件
                        })
                    } else {
                        layers.toast(result.message);
                    }
                }
            })
        },
        /**
         * [choice description] 当前员工选择标签列表
         * @return {[type]} [description]
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
         * [determine description] 确定选择标签
         * @return {[type]} [description]
         */
        determine: function (tag_id) {
            var formatTagId = '';
            if(tag_id.length){
                formatTagId = tag_id.join(',');// 构造格式用于提交多个
            }
            //if (tag_id.length) {
                tools.ajax({
                    url: ajaxurl.tag.determine,
                    data: {tag_code: formatTagId},
                    success: function (result) {
                        if (result.code == 1) {
                            layers.toast('保存成功！');
                            setTimeout(function(){
                                common.closeTab();
                            },1000);
                        } else {
                            layers.toast(result.message);
                        }
                    },
                    complete: function () {
                        vm.addTagBtn = false;
                    }
                })
            //}
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
            choiceAll: function () { //全选
                if (this.choiceLens == this.resultlens) return;
                var list = this.list, lens = this.list.length;
                for (var i = 0; i < lens; i++) {
                    for (var j = 0, childLens = list[i].child.length; j < childLens; j++) {
                        this.list[i].child[j].active = true;
                    }
                }
                this.choiceLens = this.resultlens;
            },
            cancelAll: function () { //取消全选
                if (this.choiceLens == 0) return;
                var list = this.list, lens = this.list.length;
                for (var i = 0; i < lens; i++) {
                    for (var j = 0, childLens = list[i].child.length; j < childLens; j++) {
                        this.list[i].child[j].active = false;
                    }
                }
                this.choiceLens = 0;
            },
            choice: function (event, tag_code, pid) { //单个选中
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
                                } else {
                                    this.choiceLens--;
                                }
                            }
                        }
                    }
                }
                $target.removeClass('disabled');
            },
            addTag: function () {
                this.addTagBtn = true;
                var listLens = this.list.length, tempArr = [];
                if(listLens){
                   for (var i = 0; i < listLens; i++) {
                        for (var j = 0, childLens = this.list[i].child.length; j < childLens; j++) {
                            if (this.list[i].child[j].active) {
                                tempArr.push(this.list[i].child[j].tag_code);
                            }
                        }
                    } 
                }
                main.determine(tempArr);
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        common.getTabLink();
        main.getList();
    };
    _init();
});

/**
 * Created by Administrator on 2017-09-25.
 * 权限管理
 */
require(["layui", "layers", "common", "tools", "ajaxurl", "jquery.cookie", "jquery.treeview"], function (layui, layers, common, tool, ajaxurl) {

    var home = {
        /**
         * 处理树形
         */
        addTree: function() {
            // first example
            $("#browser").treeview();
            // second example
            $("#navigation").treeview({
                persist: "location",
                collapsed: true,
                unique: true
            });
            // third example
            $("#red").treeview({
                animated: "fast",
                collapsed: true,
                unique: true,
                persist: "cookie",
                toggle: function () {
                    window.console && console.log("%o was toggled", this);
                }
            });
            // fourth example
            $("#black, #gray").treeview({
                control: "#treecontrol",
                persist: "cookie",
                cookieId: "treeview-black"
            });
        },
        /**
         * 渲染权限列表
         */
        editInfo: function() {
            var loading = '';
            // 数据权限
            tool.ajax({
                url: ajaxurl.auth.dataGroup,
                type: 'post',
                beforeSend: function() {
                    layers.load(function(indexs) {
                        loading = indexs
                    })
                },
                success: function (result) {
                    if (result.code == 1) {
                        // 渲染到vue数据层
                        vm.dataList = result.data;
                        Vue.nextTick(function() {
                            // DOM 更新了
                            layui.use(['form', 'laydate'],function() {
                                var form = layui.form;
                                form.render()
                            });
                            home.addTree();
                        })
                    } else {
                        layers.toast(result.message);
                    }
                    layers.closed(loading);
                },
                error: function () {
                    layers.toast("网络异常!");
                    layers.closed(loading);
                }
            });
            // 功能权限
            tool.ajax({
                url: ajaxurl.auth.roleGroup,
                type: 'post',
                beforeSend: function() {
                    layers.load(function(indexs) {
                        loading = indexs
                    })
                },
                success: function (result) {
                    if (result.code == 1) {
                        // 渲染到vue数据层
                        vm.roleList = result.data;
                        Vue.nextTick(function() {
                            // DOM 更新了
                            layui.use(['form', 'laydate'],function() {
                                var form = layui.form;
                                form.render()
                            });
                            home.addTree();
                        })
                    } else {
                        layers.toast(result.message);
                    }
                    layers.closed(loading);
                },
                error: function () {
                    layers.toast("网络异常!");
                    layers.closed(loading);
                }
            });
        },
        /**
         * 添加权限
         */
        jurSave: function() {
            if(vm.isTrue) {
                var datas = [],
                    rules = [],
                    data = {},
                    dataJur = $(".data-jur").find("input:checked"),
                    ruleJur = $(".rule-jur").find("input:checked"),
                    name = $.trim($(".username").val()),
                    describe = $.trim($(".description").val());
                // 获取数据权限保存到datas
                dataJur.each(function() {
                    var that = $(this),
                        dataID = that.attr('data-type');
                    datas.push(dataID);
                });
                // 获取功能权限保存到rules
                ruleJur.each(function() {
                    var that = $(this),
                        ruleID = that.attr('data-type');
                    rules.push(ruleID);
                });
                // 获取data值
                data= {name: name, describe: describe,  rules: rules, datas: datas};
                if(name == '') {
                    layers.toast("权限组名称不能为空");
                    return;
                }
                if (!$.isEmptyObject(data)) {
                    vm.isTrue = false;
                    tool.ajax({
                        url: ajaxurl.auth.addGroup,
                        data: data,
                        type: 'post',
                        success: function (result) {
                            if (result.code == 1) {
                                layers.toast(result.message);
                                setTimeout(function() {
                                    common.closeTab(true);
                                }, 1000)
                            } else {
                                layers.toast(result.message);
                            }
                        },
                        error: function () {
                            layers.toast("网络异常!")
                        }
                    });
                }
                return false;
            }
        },
        /**
         * 全选和取消全选
         */
        selectAll: function() {
            $(".client-nav").on("change", "input[type=checkbox]", function () {
                var that = $(this),
                    $find = that.parent(".squaredFour").siblings("ul")
                        .find("input[type=checkbox]"),
                    $parent = that.parents("li").children(".squaredFour")
                        .children("input[type=checkbox]");
                // 当前是选中状态
                if (that.is(':checked')) {
                    $parent.prop("checked", true);
                    $find.prop("checked", true);
                } else { // 当前未选中
                    $find.prop("checked", false);
                }
            });
        },
        /**
         * 取消
         */
        cancel: function() {
            common.closeTab();
        },
        /**
         * 重置
         */
        reset: function() {
            home.tableInfo();
        }
    };
    
    var _init = function() {
        common.getTabLink();
        home.editInfo();
        home.selectAll();
    };
    /**
     * 实例化vue
     */
    var vm = new Vue({
        el: "#app",
        data: {
            dataList: [], // 数据权限数据
            roleList: [],  // 功能权限数据
            isTrue: true
        },
        methods: {
            // 保存
            jurSave: function() {
                home.jurSave()
            },
            // 取消
            cancel: function() {
                home.cancel();
            }
        }
    });
    _init();

});
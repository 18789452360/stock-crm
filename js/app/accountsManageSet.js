/**
 * Created by Administrator on 2017-09-18.
 * 帐号管理
 */
require(["layui", 'common', 'ajaxurl' ,'tools', 'layers', 'jstree', "jquery.cookie", "jquery.treeview"], function (layui, common, ajaxurl, tool, layers) {
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
         * 编辑当前用户权限
         */
        applyUser: function() {
            // 获取路由参数id的值
            var urls = tool.getUrlArgs(), selCode = '', loading = '';
            if(urls.has){
                selCode = urls.data.id;
            }
            if(selCode) {
                tool.ajax({
                    url: ajaxurl.user.selectUserAuth,
                    type: 'post',
                    data: {id: selCode},
                    beforeSend: function() {
                        layers.load(function(indexs) {
                            loading = indexs
                        })
                    },
                    success: function(result){
                        if(result.code == 1){
                            // 渲染到vue数据层
                            vm.dataLists = result.data;
                            Vue.nextTick(function() {
                                // DOM 更新
                                home.addTree();
                            })
                        }else{
                            layers.toast(result.message);
                        }
                    },
                    error: function(){
                        layers.toast("网络异常!");
                    },
                    complete:function(){
                        setTimeout(function(){
                            layers.closed(loading);
                        },50)
                    },
                })
            }
        },
        /**
         * 保存设置
         */
        saveAccount: function() {
            if(vm.isTrue) {
                // 获取路由参数id的值
                var urls = tool.getUrlArgs(), editCode = '';
                if(urls.has){
                    editCode = urls.data.id;
                }
                var datas = [],
                    rules = [],
                    dataJur = $(".data-jur").find("input:checked:not(:disabled)"),
                    ruleJur = $(".rule-jur").find("input:checked:not(:disabled)");
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
                if(rules.length === 0) {
                    rules = [0]
                }
                if(datas.length === 0) {
                    datas = [0]
                }
                // 获取data值
                data= {id: editCode, rules: rules, datas: datas};
                if (!$.isEmptyObject(data)) {
                    vm.isTrue = false;
                    tool.ajax({
                        url: ajaxurl.user.addUserAuth,
                        data: data,
                        type: 'post',
                        success: function (result) {
                            if (result.code == 1) {
                                layers.toast(result.message);
                                setTimeout(function() {
                                    common.closeTab();
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
                    $find = that.parent(".squaredFour").siblings("ul").find("input[type=checkbox]"),
                    $parent = that.parents("li").children(".squaredFour").children("input[type=checkbox]");
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
         * 返回,取消
         */
        cancel: function() {
            common.closeTab();
        }
    };
    var _init = function() {
        home.applyUser();
        home.selectAll();
    };

    /**
     * 实例化vue
     */
    var vm = new Vue({
        el: "#app",
        data: {
            dataLists: [],
            isTrue: true
        },
        methods: {
            // 保存设置
            saveAccount: function() {
                home.saveAccount();
            },
            // 取消
            cancel: function() {
                home.cancel();
            }
        }
    });

    _init();
});
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
         * 查看当前用户权限
         */
        lookUser: function() {
            // 获取路由参数id的值
            var urls = tool.getUrlArgs(), selCode = '';
            if(urls.has){
                selCode = urls.data.id;
            }
            if(selCode) {
                tool.ajax({
                    url: ajaxurl.auth.seeGroup,
                    type: 'post',
                    data: {id: selCode},
                    success: function(result){
                        if(result.code == 1){
                            vm.dataLists = result.data;
                            Vue.nextTick(function() {
                                // DOM 更新了
                                home.addTree();
                            })
                        } else {
                            layers.toast(result.message);
                        }
                    },
                    error: function(){
                        layers.toast("网络异常!")
                    }
                });
            }
        },
        /**
         * 取消
         */
        cancel: function() {
            common.closeTab();
        }
    };
    
    var _init = function() {
        common.getTabLink();
        home.lookUser();
    };
    /**
     * 实例化vue
     */
    var vm = new Vue({
        el: "#app",
        data: {
            dataLists: []
        },
        methods: {
            // 取消
            cancel: function() {
                home.cancel();
            }
        }
    });
    _init();

});
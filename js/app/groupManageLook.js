/**
 * Created by Administrator on 2017-10-15.
 */
require(['layui', 'layers', 'common', 'ajaxurl', 'tools'], function (layui, layers, common, ajaxurl, tool) {

    var main = {
        /**
         * 查看群组(展示列表)
         */
        lookGroup: function() {
            var selCode = window.location.href.split("=")[1];
            if(selCode) {
                tool.ajax({
                    url: ajaxurl.group.view,
                    type: 'post',
                    data: {group_id: selCode},
                    success: function(result){
                        if(result.code == 1){
                            vm.dataLists = result.data;
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
         * 返回上一页
         */
        cancel: function() {
            common.closeTab();
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            dataLists: [],
            groupShow: false
        },
        methods: {
            cancel: function() {
                main.cancel()
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        common.getTabLink();
        main.lookGroup();
    };
    _init();
});

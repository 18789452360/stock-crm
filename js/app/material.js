require(['layui', 'common', 'layers', 'tools', 'ajaxurl'], function (layui, common, layers, tool, ajaxurl) {

    var main = {};


    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {},
        methods: {}
    });


    /**
     * 初始化
     * @private
     */
    var _init = function () {
        common.getTabLink();
    };
    _init();
});
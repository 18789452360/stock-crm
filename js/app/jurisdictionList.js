/**
 * Created by Administrator on 2017-09-25.
 * 权限管理
 */
require(["layui", "layers", "common", "tools", "ajaxurl", "jsTree", "jquery.cookie", "jquery.treeview"], function (layui, layers, common, tool, ajaxurl, jsTree) {

    var home = {
        /**
         * 表格渲染
         */
        getAllList: function() {
            var loading = '';
            layui.use([ 'laydate'],function(){
                var laydate = layui.laydate;
                // 执行一个laydate实例
                layui.use(['form', 'laydate'],function() {
                    var form = layui.form,
                        laydate = layui.laydate;
                    laydate.render({
                        elem: '#test-start'
                        ,trigger: 'click'
                        ,type: "datetime"
                        ,done: function(value, date) {
                            vm.data.start_time = value
                        }
                    });
                    laydate.render({
                        elem: '#test-stop'
                        ,trigger: 'click'
                        ,type: "datetime"
                        ,done: function(value, date) {
                            vm.data.stop_time = value
                        }
                    });
                });
                tool.ajax({
                    url: ajaxurl.auth.index,
                    type: 'post',
                    data: vm.data,
                    beforeSend: function() {
                        layers.load(function(indexs) {
                            loading = indexs
                        })
                    },
                    success: function(result){
                        if(result.code == 1){
                            // 渲染到vue数据层
                            vm.tableDataAll = result.data.data;
                            // 获取总条数
                            vm.getAllListTotal = result.data.total;
                            // 调用分页
                            home.getAllPage();
                        }else{
                            layers.toast(result.message);
                        }
                        layers.closed(loading);
                    },
                    error: function(){
                        layers.toast("网络异常!");
                        layers.closed(loading);
                    }
                });
            })
        },
        /**
         * 模糊查询
         */
        jurQuery: function() {
            layui.use(['form', 'laydate'],function() {
                var form = layui.form,
                    laydate = layui.laydate;
                //监听提交
                form.on('submit(formSelect)', function (data) {
                    if (!$.isEmptyObject(data.field)) {
                        if(data.field.start_time != '' && data.field.stop_time != ''){
                            if(data.field.start_time > data.field.stop_time){
                                layers.toast('开始时间不能大于结束时间！');
                                return false;
                            }
                        }
                        vm.data.name = data.field.name;
                        vm.data.page = 1;
                        home.getAllList();
                    }
                    return false;
                })
            })
        },
        /**
         * 删除权限
         */
        jurDelete: function(delCode) {
            layers.confirm({
                title: '提示',
                area: ['450px', '250px'],
                content: '<div class="confirm-tips"><p>删除角色后拥有此角色权限的账号将不再拥有</p><p>此角色的权限，确定删除？</p></div>',
                btn2: function (index, layero) {
                    // 确认的回调
                    tool.ajax({
                        url: ajaxurl.auth.delGroup,
                        type: 'post',
                        data: {id: delCode},
                        success: function(result){
                            if(result.code == 1){
                                layers.toast(result.message);
                                setTimeout(function(){
                                    window.location.reload();
                                },1000);
                            }else{
                                layers.toast(result.message);
                            }
                        },
                        error: function(){
                            layers.toast("网络异常!")
                        }
                    });
                }
            });
        },
        /**
         * 分页 (全部)
         */
        getAllPage: function() {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'test2',
                    count: vm.getAllListTotal    // 数据总数
                    ,limit: vm.data.pagesize         // 每页显示条数
                    ,curr: vm.data.page           // 当前页数
                    ,jump: function (obj, first) {
                        if (!first) {
                            vm.data.pagesize = obj.limit;    // 获取每页显示条数
                            vm.data.page = obj.curr;      // 获取当前页
                            home.getAllList();           // 发送请求
                        }
                    }
                });
            });
        },
        /**
         * 重置
         */
        reset: function() {
            vm.data = {};
            home.getAllList();
        }
    };
    
    var _init = function() {
        common.getTabLink();
        home.getAllList();
        home.jurQuery();
    };
    /**
     * 注册全局过滤组件
     */
    Vue.filter("isMaxLen", function (str, len) {
        /**
         *  输入的只有中文,一个中文占两个字符
         *  @param str 传入的字符串
         *  @param len 限制的字符串的长度
         */
        var regexp = /[^\x00-\xff]/g, // 正则表达式匹配中文
            strLen = str.replace(regexp, "aa").length; // 获取字符串字节长度
        if (strLen <= len) { // 当字符串字节长度小于指定的字节长度时
            return str;
        }
        // 假设指定长度内都是中文
        var m = Math.floor(len/2);
        for (var i = m, j = str.length; i < j; i++) {
            // 当截取字符串字节长度满足指定的字节长度
            if (str.substring(0, i).replace(regexp, "aa").length >= 0) {
                return str.substring(0, i);
            }
        }
        return str;
    });
    /**
     * 实例化vue
     */
    var vm = new Vue({
        el: "#app",
        data: {
            tabledataLen: '',
            tableDataAll: [],
            getAllListTotal: '',
            data: {
                start_time:'',
                stop_time: '',
                pagesize: '',
                page: ''
            }
        },
        methods: {
            // 删除
            jurDelete: function(delCode) {
                if(delCode == undefined){
                    throw new Error('缺少参数');
                }
                home.jurDelete(delCode);
            },
            // 重置
            reset: function() {
                home.reset();
            }
        }
    });
    _init();

});
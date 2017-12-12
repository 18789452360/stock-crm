/**
 * Created by Administrator on 2017-10-15.
 */
require(['layui', 'layers', 'common', 'ajaxurl', 'tools', 'jstree',"jquery.cookie", "jquery.treeview"], function (layui, layers, common, ajaxurl, tool, jstree) {

    var main = {
        /**
         * 初始化群组列表
         */
        getAllList: function () {
            var loading = '';
            layui.use(['form', 'laydate'],function(){
                var form = layui.form,
                    laydate = layui.laydate;
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
                            vm.data.end_time = value
                        }
                    });
                });
                if(vm.data.start_time > vm.data.end_time) {
                    layers.toast("开始时间不能大于结束时间");
                    return false;
                }
                tool.ajax({
                    url: ajaxurl.group.index,
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
                            vm.tableDataAll = result.data.list;
                            // 获取总条数
                            vm.getAllListTotal = result.data.all_num;
                            // 调用分页
                            main.getAllPage();
                            Vue.nextTick(function() {
                                // DOM 更新了
                                layui.use(['form'],function() {
                                    var form = layui.form;
                                    form.render()
                                });
                            })
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
        groupQuery: function() {
            layui.use(['form', 'laydate'],function() {
                var form = layui.form,
                    laydate = layui.laydate;
                //监听提交
                form.on('submit(formSelect)', function (data) {
                    vm.data.group_name = data.field.group_name;
                    vm.data.administrator = data.field.administrator;
                    vm.data.curpage = 1;
                    main.getAllList();
                    return false;
                })
            })
        },
        /**
         * 重置
         */
        groupReset: function() {
            vm.data = {};
            main.getAllList();
        },
        /**
         * 删除群组
         * @param delCode
         */
        groupDelete: function(delCode) {
            layers.confirm({
                title: '提示',
                area: ['450px', '250px'],
                content: '<div class="confirm-tips"><p>是否确认删除档案群组，删除后该群组产生的<p>绑定关系，将被取消，确定删除？</p></p></div>',
                btn2: function (index, layero) {
                    // 确认的回调
                    tool.ajax({
                        url: ajaxurl.group.del,
                        type: 'post',
                        data: {group_id: delCode},
                        success: function(result){
                            if(result.code == 'ok'){
                                layers.toast(result.message);
                                setTimeout(function() {
                                    window.location.reload();
                                },1000);
                            } else {
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
         * 实例化tree树
         */
        initTree: function () {
            $('#jstree').jstree({
                'plugins': ['types', 'dnd'],
                "types" : {
                    "root" : {
                        "icon" : "32px.png"
                    },
                    "default" : { }
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
                    ,curr: vm.data.curpage           // 当前页数
                    ,jump: function (obj, first) {
                        if (!first) {
                            vm.data.pagesize = obj.limit;    // 获取每页显示条数
                            vm.data.curpage = obj.curr;      // 获取当前页
                            main.getAllList();           // 发送请求
                        }
                    }
                });
            });
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            tableDataAll: [],
            getAllListTotal: '',
            pageNum: '',
            data: {
                group_name: '',
                administrator: '',
                start_time: '',
                end_time: '',
                pagesize: '',
                curpage: ''
            }
        },
        methods: {
            groupQuery: function() {
                main.groupQuery();
            },
            groupDelete: function(delCode) {
                if(delCode == undefined){
                    throw new Error('缺少参数');
                }
                main.groupDelete(delCode);
            },
            groupReset: function() {
                main.groupReset();
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        common.getTabLink();
        main.getAllList();
        main.initTree();
    };
    _init();
});

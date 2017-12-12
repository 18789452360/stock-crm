/**
 * Created by Administrator on 2017-10-15.
 */
require(['layui', 'common', 'ajaxurl', 'tools', 'layers', 'text!/assets/popup/add-edit-position.html'], function (layui, common, ajaxurl, tool, layers, addEditPosition) {

    var main = {
        /**
         * 初始化列表
         */
        getAllList: function () {
            var loading = '';
            tool.ajax({
                url: ajaxurl.position.index,
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
                        main.getAllPage();
                    }else{
                        layers.toast(result.message)
                    }
                    layers.closed(loading);
                },
                error: function(){
                    console.log("网络异常!");
                    layers.closed(loading);
                }
            });
        },
        /**
         * 模糊查询
         */
        positionQuery: function() {
            layui.use(['form'],function() {
                var form = layui.form;
                //监听提交
                form.on('submit(formSelect)', function (data) {
                    vm.data.position_name = data.field.position_name;
                    vm.data.page = 1;
                    main.getAllList();
                    return false;
                })
            })
        },
        /**
         * 删除职位
         */
        positionDelete: function(delCode) {
            layers.confirm({
                title: '删除职位',
                content: '<div class="confirm-tips"><p>删除操作不可逆，确认删除？</p></div>',
                btn2: function (index, layero) {
                    // 确认的回调
                    tool.ajax({
                        url: ajaxurl.position.del,
                        type: 'post',
                        data: {id: delCode},
                        success: function(result){
                            if(result.code == 1){
                                layers.toast(result.message);
                                setTimeout(function(){
                                    window.location.reload();
                                },1000);
                            }else{
                                layers.toast(result.message)
                            }
                        },
                        error: function(){
                            console.log("网络异常!")
                        }
                    });
                }
            });
        },
        /**
         * 新增职位
         */
        addPosition: function() {
            layers.open({
                title: '新增职位',
                area: ['450px', '250px'],
                content: addEditPosition,
                btn2: function (index, layero) {
                    var positionName= $.trim($(".position-input").val());
                    if(positionName == '') {
                        layers.toast("职位名称不能为空");
                        return;
                    }
                    // 确认的回调
                    tool.ajax({
                        url: ajaxurl.position.add,
                        type: 'post',
                        data: {position_name: positionName},
                        success: function(result){
                            if(result.code == 1){
                                layers.toast(result.message);
                                setTimeout(function(){
                                    window.location.reload();
                                },1000);
                            }else{
                                layers.toast(result.message)
                            }
                        },
                        error: function(){
                            console.log("网络异常!")
                        }
                    });
                }
            });
        },
        /**
         * 编辑职位
         */
        positionEdit: function(editCode, index) {
            var val = vm.tableDataAll[index].position_name;
            layers.open({
                title: '编辑职位',
                area: ['450px', '250px'],
                content: addEditPosition,
                success: function (layero, index) {
                    $(".position-input").val(val);
                },
                btn2: function (index, layero) {
                    var positionName= $.trim($(".position-input").val());
                    if(positionName == '') {
                        layers.toast("职位名称不能为空");
                        return;
                    }
                    // 确认的回调
                    tool.ajax({
                        url: ajaxurl.position.edit,
                        type: 'post',
                        data: {id: editCode, position_name: positionName},
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
                            console.log("网络异常!")
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
                    count: vm.getAllListTotal        // 数据总数
                    ,limit: vm.data.pagesize         // 每页显示条数
                    ,curr: vm.data.page              // 当前页数
                    ,jump: function (obj, first) {
                        if (!first) {
                            vm.data.pagesize = obj.limit;    // 获取每页显示条数
                            vm.data.page = obj.curr;         // 获取当前页
                            main.getAllList();               // 发送请求
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
            data: {
                position_name: '',
                pagesize: '',
                page: ''
            }
        },
        methods: {
            // 删除
            positionDelete: function(deleteID) {
                if(deleteID == undefined){
                    throw new Error('缺少参数');
                }
                main.positionDelete(deleteID);
            },
            // 编辑
            positionEdit: function(EditorID, index) {
                if(EditorID == undefined || index == undefined){
                    throw new Error('缺少参数');
                }
                main.positionEdit(EditorID, index);
            },
            // 添加
            addPosition: function() {
                main.addPosition();
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.getAllList();
        main.positionQuery();
    };
    _init();
});

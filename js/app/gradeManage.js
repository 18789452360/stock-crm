/**
 * Created by Administrator on 2017-10-15.
 */
require(['layui', 'common', 'ajaxurl', 'tools', 'layers', 'text!/assets/popup/add-edit-grade.html'], function (layui, common, ajaxurl, tool, layers, addEditGrade) {

    var main = {
        /**
         * 初始化列表
         */
        getAllList: function () {
            var loading = '';
            tool.ajax({
                url: ajaxurl.grade.index,
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
        gradeQuery: function() {
            layui.use(['form'],function() {
                var form = layui.form;
                //监听提交
                form.on('submit(formSelect)', function (data) {
                    vm.data.grade_name = data.field.grade_name;
                    vm.data.page = 1;
                    main.getAllList();
                    return false;
                })
            })
        },
        /**
         * 新增职级
         */
        addGrade: function() {
            layers.open({
                title: '新增职级',
                area: ['450px', '250px'],
                content: addEditGrade,
                btn2: function (index, layero) {
                    var gradeName= $.trim($(".position-input").val());
                    if(gradeName == '') {
                        layers.toast("职级名称不能为空");
                        return false;
                    }
                    // 确认的回调
                    tool.ajax({
                        url: ajaxurl.grade.add,
                        type: 'post',
                        data: {grade_name: gradeName},
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
                    return false;
                }
            });
        },
        /**
         * 删除职级
         */
        gradeDelete: function(delCode) {
            layers.confirm({
                title: '删除职级',
                area: ['450px', '250px'],
                content: '<div class="confirm-tips"><p>删除操作不可逆，确认删除？</p></div>',
                btn2: function (index, layero) {
                    // 确认的回调
                    tool.ajax({
                        url: ajaxurl.grade.del,
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
                            console.log("网络异常!")
                        }
                    });
                }
            });
        },
        /**
         * 编辑职级
         */
        gradeEdit: function(editCode, index) {
            var val = vm.tableDataAll[index].grade_name;
            layers.open({
                title: '提示',
                area: ['450px', '250px'],
                content: addEditGrade,
                success: function (layero, index) {
                    $(".position-input").val(val);
                },
                btn2: function (index, layero) {
                    var gradeName= $.trim($(".position-input").val());
                    if(gradeName == '') {
                        layers.toast("职级名称不能为空");
                        return;
                    }
                    // 确认的回调
                    tool.ajax({
                        url: ajaxurl.grade.edit,
                        type: 'post',
                        data: {id: editCode, grade_name: gradeName},
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
                    count: vm.getAllListTotal    // 数据总数
                    ,limit: vm.data.pagesize         // 每页显示条数
                    ,curr: vm.data.page           // 当前页数
                    ,jump: function (obj, first) {
                        if (!first) {
                            vm.data.pagesize = obj.limit;    // 获取每页显示条数
                            vm.data.page = obj.curr;      // 获取当前页
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
                grade_name: '',
                pagesize: '',
                page: ''
            }
        },
        methods: {
            // 删除
            gradeDelete: function(delCode) {
                if(delCode == undefined){
                    throw new Error('缺少参数');
                }
                main.gradeDelete(delCode);
            },
            // 编辑
            gradeEdit: function(EditorID, index) {
                if(EditorID == undefined || index == undefined){
                    throw new Error('缺少参数');
                }
                main.gradeEdit(EditorID, index);
            },
            // 添加
            addGrade: function() {
                main.addGrade();
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.getAllList();
        main.gradeQuery()
    };
    _init();
});

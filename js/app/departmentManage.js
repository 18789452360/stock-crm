/**
 * Created by Administrator on 2017-09-28.
 * 部门管理
 */
require(['layui', 'ajaxurl', 'layers', 'jstree', 'tools', 'common', 'text!/assets/popup/edit-department.html', 'text!/assets/popup/add-department.html', 'text!/assets/popup/edit-depart-struct.html'], function (layui, ajaxurl, layers, jstree, tool, common, editorDepartment, addDepartment, editDepartStruct) {

    var init = {
        /**
         * 正则验证手机号
         */
        reg: {
            textPhone: /^1[34578]\d{9}$/ // 手机号
        },
        /**
         * 初始化列表
         */
        getAllList: function() {
            var loading = '';
            // 实例化日期,表格
            layui.use(['laydate', 'form'], function(){
                var form = layui.form,
                    laydate = layui.laydate
            });
            tool.ajax({
                url: ajaxurl.department.index,
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
                        init.getAllPage();
                    }else{
                        layers.toast(result.message)
                    }
                },
                error: function(){
                    layers.toast("网络异常!");
                },
                complete:function(){
                    setTimeout(function(){
                        layers.closed(loading);
                    },200)
                },
            });
        },
        /**
         * 模糊查询
         */
        departmentQuery: function() {
            layui.use(['form', 'laydate'],function() {
                var form = layui.form,
                    laydate = layui.laydate;
                //监听提交
                form.on('submit(formSelect)', function (data) {
                    vm.data.department_name = data.field.department_name;
                    vm.data.linkman = data.field.linkman;
                    vm.data.page = 1;
                    init.getAllList();
                    return false;
                })
            })
        },
        /**
         * 编辑弹出层
         */
        editDepartment: function(editCode, index) {
            var data = vm.tableDataAll[index];
            var departmentName = data.department_name,
                linkman = data.linkman,
                mobile = data.mobile,
                createTime = data.createtime;
            layers.open({
                title: '编辑',
                area: ['500px', '380px'],
                content: editorDepartment,
                btn: ['取消', '保存'],
                success: function (layero, index) {
                    $(".department_name").val(departmentName);
                    $(".linkman").val(linkman);
                    $(".mobile").val(mobile);
                    $(".department-time").html(createTime);
                },
                btn2: function (index, layero) {
                    var departmentName = $.trim($(".department_name").val());
                        linkman = $.trim($(".linkman").val());
                        mobile = $.trim($(".mobile").val());
                    if(departmentName == ''){
                        layers.toast('公司名称不能为空!');
                        return;
                    }
                    if(linkman == ''){
                        layers.toast('联系人不能为空!');
                        return;
                    }
                    if(!new RegExp(init.reg.textPhone).test(mobile)){
                        layers.toast('联系电话格式不正确!');
                        return;
                    }
                    // 确认的回调
                    tool.ajax({
                        url: ajaxurl.department.edit,
                        type: 'post',
                        data: { id: editCode, department_name: departmentName, linkman: linkman, mobile: mobile},
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
                            layers.toast("网络异常!")
                        }
                    });
                }
            })
        },
        /**
         * 新增公司
         */
        addDepartment: function(){
            layers.open({
                title: '新增',
                area: ['500px', '310px'],
                content: addDepartment,
                btn2: function(index) {
                    var departmentName = $.trim($(".department_name").val()),
                        linkman = $.trim($(".linkman").val()),
                        mobile = $.trim($(".mobile").val());
                    if(departmentName == ''){
                        layers.toast('公司名称不能为空!');
                        return;
                    }
                    if(linkman == ''){
                        layers.toast('联系人不能为空!');
                        return;
                    }
                    if(!new RegExp(init.reg.textPhone).test(mobile)){
                        layers.toast('联系电话格式不正确!');
                        return;
                    }
                    // 数据权限
                    tool.ajax({
                        url: ajaxurl.department.add,
                        type: 'post',
                        data: {department_name: departmentName, linkman: linkman, mobile: mobile},
                        success: function (result) {
                            if (result.code == 1) {
                                layers.toast(result.message);
                                setTimeout(function(){
                                    window.location.reload();
                                },1000);
                            } else {
                                layers.toast(result.message)
                            }
                        },
                        error: function () {
                            layers.toast("网络异常!")
                        }
                    });
                    return false;
                }
            })
        },
        /**
         * 删除
         * @param delCode
         */
        delDepartment: function(delCode) {
            layers.confirm({
                title: '删除',
                area: ['400px', '250px'],
                content: '<div class="confirm-tips"><p>删除操作不可恢复，确认继续删除？</p></div>',
                btn2: function(index){
                    tool.ajax({
                        url: ajaxurl.department.del,
                        type: 'post',
                        data: {id: delCode},
                        success: function(result){
                            if(result.code == 1){
                                layers.toast(result.message);
                                setTimeout(function(){
                                    window.location.reload();
                                },1000);
                            } else {
                                layers.toast(result.message)
                            }
                        },
                        error: function(){
                            layers.toast("网络异常!")
                        }
                    });
                    return false;
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
                            init.getAllList();           // 发送请求
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
                department_name: '',
                linkman: '',
                pagesize: '',
                page: ''
            }
        },
        methods: {
            // 编辑
            editDepartment: function(EditorID, index) {
                if(EditorID == undefined || index == undefined){
                    throw new Error('缺少参数');
                }
                init.editDepartment(EditorID, index)
            },
            // 添加
            addDepartment: function() {
                init.addDepartment()
            },
            // 删除
            delDepartment: function(deleteID) {
                if(deleteID == undefined){
                    throw new Error('缺少参数');
                }
                init.delDepartment(deleteID);
            },
            departmentQuery: function() {
                init.departmentQuery()
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        common.getTabLink();
        init.getAllList();
    };
    _init();
});

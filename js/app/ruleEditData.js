/**
 * Created by Administrator on 2017-09-28.
 * 部门管理
 */
require(['layui', 'template', 'ajaxurl', 'layers', 'jstree', 'tools', 'common', 'text!/assets/popup/edit-department.html', 'text!/assets/popup/add-department.html', 'text!/assets/popup/edit-depart-struct.html'], function (layui, template, ajaxurl, layers, jstree, tool, common, editorDepartment, addDepartment, editDepartStruct) {
    template.config('openTag', '{?');
    template.config('closeTag', '?}');
    var init = {
        /**
         * 实例化tree树
         */
        initTree: function() {
            $("#jstree").jstree({
                'plugins': ['types', 'dnd'],
                "types" : {
                    "root" : {
                        "icon" : "32px.png"
                    },
                    "default" : {
                    }
                }
            });
        },
        /**
         * 渲染部门列表
         */
        parentInfo: function(load) {
            layui.use('form', function(){
                var form = layui.form;
            });
            // 获取路由参数id的值
            var urls = tool.getUrlArgs(), pid = '';
            if(urls.has){
                pid = urls.data.id;
            }
            tool.ajax({
                url: ajaxurl.department.getdata,
                type: 'post',
                success: function(result){
                    if(result.code == 1){
                        vm.dataParent = [];
                        // 渲染到vue数据层
                        vm.dataParent = result.data;
                        Vue.nextTick(function() {
                            // DOM 更新了
                            if(load){
                                $.jstree.reference($('#jstree'));
                            }else{
                                init.initTree();
                            }
                        });
                    }else{
                        //layers.toast(result.message)
                    }
                },
                error: function(){
                    console.log("网络异常!")
                }
            });
        },
        /**
         * 保存
         */
        selectEnter: function() {
            var parentSpan = $(".tree-main").find("a.jstree-clicked").children('span'),
                parentHtml = parentSpan.html(),
                parentData = parentSpan.attr("data-id"),
                parentInput = $(".paren-canter");
            vm.getOneName = {'name': parentHtml, 'id': parentData}
        },
        /**
         * 获取
         */
        getOne: function() {
            // 获取路由参数id的值
            var urls = tool.getUrlArgs(), pid = '';
            if(urls.has){
                pid = urls.data.id;
            }
            tool.ajax({
                url: ajaxurl.department.getdataone,
                type: 'post',
                data: {
                    id: pid
                },
                success: function(result){
                    if(result.code == 1){
                        vm.getOneData = result.data;
                        vm.getOneName = result.dataname;
                    }
                },
                error: function(){
                    console.log("网络异常!")
                }
            });
        },
        /**
         * 最终保存
         */
        saveEdit: function() {
            // 获取路由参数id的值
            var urls = tool.getUrlArgs(), id = '';
            if(urls.has){
                id = urls.data.id;
            }
            var pid = $(".paren-canter").attr("data-id");
            tool.ajax({
                url: ajaxurl.department.editdata,
                type: 'post',
                data: {
                    id: id,
                    pid: pid,
                    name: vm.getOneData.name,
                    table_name: vm.getOneData.table_name,
                    field_name: vm.getOneData.field_name
                },
                success: function(result){
                    if(result.code == 1){
                        layers.toast('成功');
                        setTimeout(function() {
                            common.closeTab();
                        })
                    }else{
                        layers.toast('添加失败');
                    }
                },
                error: function(){
                    console.log("网络异常!")
                }
            });
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            dataParent: [], // 部门列表
            dataParentEdit: [], // 编辑部门列表
            nextAllLength: '', // 保存删除下来的值
            contractShow: false,
            dataEdit: [
                {'name': '', 'table_name': '', 'field_name': ''}
            ],
            getOneData: [],
            getOneName: []
        },
        methods: {
            // 选择上级部门
            selectCantrat: function() {
                this.contractShow = !this.contractShow;
            },
            // 保存选择的部门
            selectEnter: function() {
                this.contractShow = !this.contractShow;
                init.selectEnter();
            },
            // 保存选择的部门
            selectCancel: function() {
                this.contractShow = !this.contractShow;
                init.selectCancel();
            },
            // 保存
            saveEdit: function() {
                init.saveEdit();
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        init.parentInfo();
        init.getOne();
    };

    _init();

});

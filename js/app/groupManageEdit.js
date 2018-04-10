/**
 * Created by Administrator on 2017-10-15.
 */
require(["vue", 'layui', 'layers', 'common', 'ajaxurl', 'tools', 'jstree', 'jquery.metisMenu'], function (Vue, layui, layers, common, ajaxurl, tool, jstree) {

    var main = {
        /**
         * 初始化全局树形菜单
         */
        sideMenu: function () {
            Vue.nextTick(function () {
                $('#menu1').metisMenu();
            })
        },
        /***
         * 模糊查询
         */
        assNowGroupSelect: function() {
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
         * 查看群组页面数据获取
         */
        editGroup: function() {
            var urls = tool.getUrlArgs(), selCode = '';
            if(urls.has){
                selCode = urls.data.id;
            }
            if(selCode) {
                tool.ajax({
                    url: ajaxurl.group.view,
                    type: 'post',
                    data: {group_id: selCode},
                    success: function(result){
                        if(result.code == 1){
                            vm.groupName = result.data;
                            vm.lastTags1 = result.data.administrator;
                            vm.lastTags2 = result.data.member;
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
         * 渲染组织架构
         */
        departmentFramework: function(callback) {
            tool.ajax({
                url: ajaxurl.department.getdepartment,
                type: 'post',
                success: function(result){
                    if(result.code == 1){
                        vm.groupList = result.data;
                        Vue.nextTick(function() {
                            main.sideMenu();
                        });
                        typeof callback === 'function' && callback.call(this);
                    }else{
                        layers.toast(result.message)
                    }
                },
                error: function(){
                    layers.toast("网络异常!")
                }
            });
            return false;
        },
        /**
         * 新增后设置组织结构确定按钮的data-code值
         * @param event
         */
        addMan: function(event) {
            vm.groupShow = !vm.groupShow;
            layui.use(['form'], function () {
                var form = layui.form;
                form.render();
            });
            Vue.nextTick(function() {
                var dataCode = $(event.target).attr('data-code');
                $(".ensure").attr("data-code", dataCode);
            });
        },
        /**
         * 添加成员到列表
         */
        groupSure: function(event) {
            var codeData = $(event.target).attr("data-code"),
                $choose = $(".choose-people").find("li");
            // 如果点击的是添加管理员
            if(codeData == 1) {
                $choose.each(function() {
                    var lastTagGroup = {employee_id: $(this).attr('data-id'), employee_name: $(this).text()};
                    vm.lastTags1.push(lastTagGroup); // 获取的数据push到lastTags1中
                });
                vm.lastTags1 = main.uniqueOther(vm.lastTags1); // 去重

                vm.groupShow = false;
                vm.selectedOrgUsr = [];
            } else if(codeData == 2) { // 如果点击的是添加成员
                $choose.each(function() {
                    var lastTagMan = {employee_id: $(this).attr('data-id'), employee_name: $(this).text()};
                    vm.lastTags2.push(lastTagMan);
                });
                vm.lastTags2 = main.uniqueOther(vm.lastTags2);

                vm.groupShow = false;
                vm.selectedOrgUsr = [];

            }
        },
        /**
         * 添加现有群组
         */
        getAllList: function(group_name, administrator) {
            tool.ajax({
                url: ajaxurl.group.add_member,
                type: 'post',
                data: vm.data,
                success: function(result){
                    if(result.code == 1){
                        vm.groupNewList = result.data.list;
                        // 获取总条数
                        vm.getAllListTotal = result.data.all_num;
                        // 调用分页
                        main.getAllPage();
                    }else{
                        layers.toast(result.message)
                    }
                },
                error: function(){
                    layers.toast("网络异常!")
                }
            });
            return false;
        },
        /**
         * 选择现有群组(单选)
         */
        batchAdd: function() {
            var $commonTable = $(".common-table td input:checked"),
                group_id = '';
            $commonTable.each(function() {
                var dataID = $(this).attr("data-id");
                group_id += (dataID + ",");
            });
            group_id = group_id.substring(0, group_id.length - 1);
            main.newGroupSelect(group_id);
        },
        /**
         * 批量添加成员(多选)
         */
        newGroupSelect: function(id) {
            tool.ajax({
                url: ajaxurl.group.get_member,
                type: 'post',
                data: {group_ids: id},
                success: function(result){
                    if(result.code == 1){
                        var newGroupList = result.data.list;
                        for(var i = 0; i< newGroupList.length; i++) {
                            var newTag = { employee_id: newGroupList[i].employee_id, employee_name: newGroupList[i].nickname };
                            vm.lastChoose.push(newTag);
                        }
                        Vue.nextTick(function() {
                            main.sideMenu();
                        });
                        vm.addGroupShow = false;
                        vm.lastChooseShow = true;
                        //main.selectOneUser();
                    }else{
                        layers.toast(result.message)
                    }
                },
                error: function(){
                    layers.toast("网络异常!")
                }
            });
        },
        /**
         * 选择某个成员
         */
        selectOneUser: function() {
            var choosel = $(".choose-ul input:checked");
            if(choosel.length == 0) {
                layers.toast("未选择成员");
                return false;
            }
            choosel.each(function() {
                var dataID = $(this).attr("data-id"),
                    selectVal = $(this).parent(".squaredFour").siblings("span").html();
                var selectTag = { employee_id: dataID, employee_name: selectVal };
                vm.lastTags2.push(selectTag);
                vm.lastTags2 = main.uniqueOther(vm.lastTags2);
            });
            //layers.toast('添加成功');
            vm.lastChooseShow = false;
            $(".choose-ul li").empty();
            $("input[name='checkSelect']").prop('checked', false);
        },
        /**
         * 新增群组保存
         */
        editMan: function() {
            if(vm.isTrue) {
                var urls = tool.getUrlArgs(), selCode = '';
                if(urls.has){
                    selCode = urls.data.id;
                }
                var group_name = $.trim($(".group-name").val()), // 获取群组名称
                    ulMan = $(".ul-man").find("li"),
                    ulMember = $(".ul-member").find("li"),
                    administrator_id = '',
                    members_id = '';
                // 遍历管理员成员获取id
                ulMan.each(function() {
                    var dataID = $(this).attr("data-id");
                    administrator_id += (dataID + ",");
                });
                // 遍历群组成员获取id
                ulMember.each(function() {
                    var dataID = $(this).attr("data-id");
                    members_id += (dataID + ",");
                });
                administrator_id = administrator_id.substring(0, administrator_id.length - 1);
                members_id = members_id.substring(0, members_id.length - 1);

                if(group_name == ''){
                    layers.toast('群组名称不能为空!', {
                        icon: 2,
                        anim: 6
                    });
                    return;
                }
                if(administrator_id == ''){
                    layers.toast('请选择管理员!', {
                        icon: 2,
                        anim: 6
                    });
                    return;
                }
                if(members_id == ''){
                    layers.toast('请选择群组成员!', {
                        icon: 2,
                        anim: 6
                    });
                    return;
                }

                if(selCode) {
                    vm.isTrue = false;
                    tool.ajax({
                        url: ajaxurl.group.edit,
                        type: 'post',
                        data: {
                            group_id: selCode,
                            group_name: group_name,
                            administrator_id: administrator_id,
                            members_id: members_id
                        },
                        success: function(result){
                            if(result.code == 'ok'){
                                layers.toast(result.message);
                                setTimeout(function() {
                                    common.closeTab();
                                },1000)
                            } else {
                                layers.toast(result.message);
                            }
                        },
                        error: function(){
                            layers.toast("网络异常!")
                        }
                    });
                }
            }
        },
        /**
         * 取消成员
         */
        selectCancel: function() {
            vm.lastChooseShow = false;
            $(".choose-ul li").empty();
            $("input[name='checkSelect']").prop('checked', false);
        },
        /**
         * 选择用户
         * @param e
         * @param id
         */
        orgSelectAll: function (e, id) {
            var $ul = $(e.target).parent().siblings();
            var $item = $ul.find('a').not('.has-arrow');
            $item.each(function () {
                var newItem = {id: $(this).data('id'), name: $(this).data('text')};
                vm.selectedOrgUsr.push(newItem);
            });
            vm.selectedOrgUsr = main.unique(vm.selectedOrgUsr);
        },
        orgSelectItem: function (e) {
            if (!$(e.target).hasClass('has-arrow')) {
                var newItem = {id: $(e.target).data('id'), name: $(e.target).data('text')};
                vm.selectedOrgUsr.push(newItem);
                vm.selectedOrgUsr = main.unique(vm.selectedOrgUsr);
            }
        },
        addConditonsOrg: function (e, index, type) {
            if (vm.selectedOrgUsr.length) {
                vm.condition[index].show = false;
                vm.condition[index].active = true;
                vm.condition[index].name = '组织架构：' + vm.selectedOrgUsr.length + '人';
                var tmpArr = [];
                vm.selectedOrgUsr.forEach(function (t) {
                    tmpArr.push(t.id);
                });
                vm.ajaxCondition.timeArea.organizational_structure = tmpArr;
            } else {
                layers.toast('请选择人员');
            }
        },
        /**
         * 数组对象简单去重
         * @param arr
         * @return {Array}
         */
        unique: function (arr) {
            var result = {};
            var finalResult = [];
            for (var i = 0; i < arr.length; i++) {
                result[arr[i].id] = arr[i];
            }
            for (var item in result) {
                finalResult.push(result[item]);
            }
            return finalResult;
        },
        uniqueOther: function (arr) {
            var result = {};
            var finalResult = [];
            for (var i = 0; i < arr.length; i++) {
                result[arr[i].employee_id] = arr[i];
            }
            for (var item in result) {
                finalResult.push(result[item]);
            }
            return finalResult;
        },
        delChoose: function (index) {
            vm.selectedOrgUsr.splice(index, 1);
        },
        /**
         * 取消
         */
        cancel: function() {
            common.closeTab();
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
                            $(".wait-table").find("input").prop("checked", false);
                        }
                    }
                });
            });
        },
        /**
         * 添加具体成员列表
         */
        selectOneChecked: function() {
            // 监听全选框的状态
            $(".child-one").click(function() {
                var checked = $(this).prop('checked'),
                    childInput = $("input[name='checkOne']");
                if(checked) {
                    childInput.prop("checked", true);
                } else {
                    childInput.prop("checked", false);
                }
            });
            // 监听子选择框的状态
            $(".group-pop").on("click", '.child-last', function() {
                var checkedAll = $(".child-one"),
                    allInput = $("input[name='checkOne']").length,
                    sInput = $("input[name='checkOne']:checked").length;
                if(sInput < allInput) {
                    checkedAll.prop('checked', false);
                } else {
                    checkedAll.prop('checked', true);
                }
            })
        },
        /**
         * 添加现有群组列表全选
         */
        selectChecked: function() {
            // 监听全选框的状态
            $(".checkAll").click(function() {
                var checked = $(this).prop('checked'),
                    childInput = $("input[name='check']");
                if(checked) {
                    childInput.prop("checked", true);
                } else {
                    childInput.prop("checked", false);
                }
            });
            // 监听子选择框的状态
            $(".wait-table").on("click", '.child-input', function() {
                var checkedAll = $(".checkAll"),
                    allInput = $("input[name='check']").length,
                    sInput = $("input[name='check']:checked").length;
                if(sInput < allInput) {
                    checkedAll.prop('checked', false);
                } else {
                    checkedAll.prop('checked', true);
                }
            })
        },
        /**
         * 筛选--组织架构搜索
         */
        filterOrgSearch: function () {
            var _this = this;
            // 下面2个方法是同步执行, 在 render form 时, 可能数据还不存在
            // 所以需要把当前这个 form 挂载到 main 上
            // 然后 Vue 去监听当这个筛选框展示在用户面前时才去 render form
            Vue.nextTick(function () {
                var $item = $('#menu1').find('a').not('.has-arrow');
                $item.each(function () {
                    var newItem = {id: $(this).data('id'), name: $(this).data('text')};
                    vm.OrgSearchArr.push(newItem);
                });
            });
            layui.use(['form'], function () {
                var form = layui.form;
                _this.form = layui.form;
                form.on('select(search-org)', function (data) {
                    var addItem = {id: data.value.split(',')[0] * 1, name: data.value.split(',')[1]};
                    vm.selectedOrgUsr.push(addItem);
                    vm.selectedOrgUsr = main.unique(vm.selectedOrgUsr).reverse();
                });
            });
        },
        form: ''
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            OrgSearchArr: [],
            selectedOrgUsr: [],// 全局组织架构已选用户 {id:1, name: '张三'},{id:2, name: '李四'}
            dataLists: [],
            groupList: [],
            groupNewList: [],
            groupShow: false,
            groupShowMan: false,
            addGroupShow: false,
            lastChooseShow: false,
            getAllListTotal: '',
            pageNum: '',
            lastTags: [],
            lastTags1: [],
            lastTags2: [],
            lastTagNew: [],
            groupName: '',
            data: {
                group_name: '',
                administrator: '',
                pagesize: 8,
                curpage: ''
            },
            lastChoose: [], // 添加现有群组成员返回的数据列表
            isTrue: true
        },
        methods: {
            // 新增管理员
            addMan: function(event) {
                main.addMan(event);
            },
            // 保存编辑
            editMan: function() {
                main.editMan();
            },
            // 取消编辑
            groupCancel: function() {
                this.groupShow = !this.groupShow;
                this.selectedOrgUsr = []
            },
            // 取消(返回上一页)
            cancel: function() {
                main.cancel()
            },
            // 添加成员
            addMember: function(event) {
                main.addMember(event)
            },
            // 添加成员到列表
            groupSure: function(event) {
                main.groupSure(event);
            },
            // 添加现有群组
            nowGroupShow: function() {
                this.addGroupShow = !this.addGroupShow;
            },
            // 选择现有成员
            newGroupSelect: function(id) {
                main.newGroupSelect(id);
            },
            // 添加现有群组取消
            newAddCancel: function() {
                this.addGroupShow = false;
            },
            orgSelectAll: function(e) {
                main.orgSelectAll(e);
            },
            orgSelectItem: function(e, id) {
                main.orgSelectItem(e, id);
            },
            delChoose: function(index) {
                main.delChoose(index)
            },
            // 全部
            pageNum2: function(event) {
                main.pageNum2(event);
            },
            deleteTag1: function(index) {
                if(index == undefined){
                    throw new Error('缺少index')
                }
                vm.lastTags1.splice(index, 1);
            },
            deleteTag2: function(index) {
                if(index == undefined){
                    throw new Error('缺少index')
                }
                vm.lastTags2.splice(index, 1);
            },
            // 批量添加
            batchAdd: function() {
                main.batchAdd();
            },
            // 选择选中的成员
            selectOneUser: function() {
                main.selectOneUser();
            },
            // 取消选择成员
            selectCancel: function() {
                main.selectCancel();
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        common.getTabLink();
        main.editGroup();
        main.departmentFramework(function() {
            main.filterOrgSearch();
        });
        main.getAllList();
        main.assNowGroupSelect();
        main.selectChecked();
        main.selectOneChecked();
    };
    _init();
});

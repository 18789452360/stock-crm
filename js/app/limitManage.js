/**
 * Created by Administrator on 2017-09-18.
 * 帐号管理
 */
require(["layui", 'common', 'ajaxurl' ,'tools', 'layers', 'upload', 'text!/assets/popup/chang-password-account.html', 'text!/assets/popup/import-account.html', 'jstree', 'jquery.metisMenu'], function (layui, common, ajaxurl, tool, layers, upload, changPasswordAccount, importAccount) {
    var home = {
        /**
         * 初始化全局树形菜单
         */
        sideMenu: function () {
            Vue.nextTick(function () {
                $('#menu1').metisMenu();
            })
        },
        /**
         * 渲染列表
         */
        getAllList: function() {
            var loading = '';
            var urls = tool.getUrlArgs(), gid = '';
            if(urls.has){
                gid = urls.data.gid;
            }
            vm.data.gid = gid;
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
            // 获取列表数据
            tool.ajax({
                url: ajaxurl.auth.limitUser,
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
                        vm.limitGname =  result.data.gname;
                        // 获取总条数
                        vm.getAllListTotal = result.data.total;
                        // 调用分页
                        home.getAllPage();
                        Vue.nextTick(function() {
                            // DOM 更新了
                            layui.use(['form'],function() {
                                var form = layui.form;
                                form.render()
                            });
                        })
                    }else{
                        layers.toast("暂无数据!");
                    }
                    layers.closed(loading);
                },
                error: function(){
                    layers.toast("网络异常!");
                    layers.closed(loading);
                }
            });
        },
        /**
         * 模糊查询
         */
        accuntQuery: function() {
            layui.use(['form', 'laydate'],function() {
                var form = layui.form,
                    laydate = layui.laydate;
                form.on('select(status)', function(data){
                    vm.data.status = data.value; //得到被选中的值
                });
                form.on('select(level)', function(data){
                    vm.data.level = data.value; //得到被选中的值
                });
                form.on('select(position)', function(data){
                    vm.data.position = data.value; //得到被选中的值
                });
                form.on('select(buildRoom)', function(data){
                    vm.data.build_room = data.value; //得到被选中的值
                });
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
                //监听提交
                form.on('submit(formSelect)', function (data) {
                    if(data.field.start_time != '' && data.field.end_time != ''){
                        if(data.field.start_time > data.field.end_time){
                            layers.toast('开始时间不能大于结束时间！');
                            return false;
                        }
                    }
                    vm.data.page = 1;
                    home.getAllList();
                    return false;
                });
            })
        },
        /**
         * 移除用户
         * @param delCode
         */
        limitRemove: function(delCode) {
            var urls = tool.getUrlArgs(), group_id = '';
            if(urls.has){
                group_id = urls.data.gid;
            }
            layers.confirm({
                title: '移除用户',
                area: ['450px', '250px'],
                content: '<div class="confirm-tips"><p>移除用户后，用户将不再拥有此权限组的操作权限，</p><p>确认此操作？</p></div>',
                success: function() {
                },
                btn2: function (index, layero) {
                    // 确认的回调
                    tool.ajax({
                        url: ajaxurl.auth.rmLimit,
                        type: 'post',
                        data: {
                            group_id: group_id,
                            staff_id: delCode
                        },
                        success: function(result){
                            if(result.code == 1){
                                layers.toast(result.message);
                                setTimeout(function(){
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
         * 批量移除用户
         */
        totalRemove: function() {
            // 获取所有选中的input
            var limitList = $(".wait-table  td input:checked"),
                limitAll = [];
            // 遍历所有input对用的data-id
            limitList.each(function() {
                // push到数组limitAll中
                limitAll.push($(this).attr('data-id'));
            });
            // 数组转化成字符串的形式
            limitAll = limitAll.join();
            // 请求移除用户接口
            if(limitAll == '') {
                layers.toast("请选择要移除的用户");
                return;
            }
            home.limitRemove(limitAll);
        },
        /**
         * 获取职位,职级列表
         */
        addSelect: function() {
            tool.ajax({
                url: ajaxurl.user.getBasic,
                type: 'post',
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.positionDataAll = result.data.position;
                        vm.gradeDataAll = result.data.grade;
                        vm.buildRoomDataAll = result.data.build_room;
                        Vue.nextTick(function() {
                            // DOM 更新了
                            layui.use(['form'],function() {
                                var form = layui.form;
                                form.render()
                            });
                        })
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
                            $("input[name='check']").prop('checked', false);
                            $("input[name='checks']").prop('checked', false);
                            home.getAllList();
                        }
                    }
                });
            });
        },
        /**
         * 重置
         */
        reset: function(){
            vm.data = {
                username: '',
                mobile: '',
                nickname: '',
                department: '',
                position: '',
                build_room: '',
                level: '',
                status: '',
                start_time: '',
                end_time: '',
                pagesize: 10,
                page: 1
            };
            home.getAllList()
        },
        /**
         * 删除管理员或成员
         * @param index
         */
        delChoose: function (index) {
            vm.selectedOrgUsr.splice(index, 1);
        },
        /**
         * 新增成员
         */
        groupSure: function(event) {
            var $choose = $(".choose-people").find("li"),
                dataLimit = [],
                urls = tool.getUrlArgs(), group_id = '';
            if(urls.has){
                group_id = urls.data.gid;
            }
            // 如果点击的是添加管理员
            $choose.each(function() {
                var data = $(this).attr('data-id');
                dataLimit.push(data); // 获取的数据push到lastTags1中
            });
            vm.limitData = dataLimit.join();
            tool.ajax({
                url: ajaxurl.auth.addLimit,
                type: 'post',
                data: {
                    group_id: group_id,
                    staff_id: vm.limitData
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        Vue.nextTick(function() {
                            // DOM 更新了
                            layui.use(['form'],function() {
                                var form = layui.form;
                                form.render()
                            });
                        });
                        layers.toast(result.message);
                        vm.groupShow = false;
                        vm.selectedOrgUsr = [];
                        setTimeout(function() {
                            window.location.reload();
                        }, 1000)
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
            vm.selectedOrgUsr = home.unique(vm.selectedOrgUsr);
        },
        orgSelectItem: function (e) {
            if (!$(e.target).hasClass('has-arrow')) {
                var newItem = {id: $(e.target).data('id'), name: $(e.target).data('text')};
                vm.selectedOrgUsr.push(newItem);
                vm.selectedOrgUsr = home.unique(vm.selectedOrgUsr);
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
         * 数组对象根据id去重
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
                            home.sideMenu();
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
         * 获取批量现有群组的成员列表
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
                            home.sideMenu();
                        });
                        vm.addGroupShow = false;
                        vm.lastChooseShow = true;
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
                    vm.selectedOrgUsr = home.unique(vm.selectedOrgUsr).reverse();
                });
            });
            setTimeout(function(){
                home.form.render()
            },500);
        },
        form: '',
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
        }
    };
    var _init = function() {
        common.getTabLink();
        home.getAllList();
        home.addSelect(); // 获取职位,职级,楼栋等数据
        home.accuntQuery(); // 模糊查询
        home.departmentFramework(function(){
            home.filterOrgSearch();
        });
        home.selectChecked(); // 全选和取消全选
    };
    /**
     * 实例化vue
     */
    var vm = new Vue({
        el: "#app",
        data: {
            tableDataAll: [], // 列表值
            limitGname: '',
            gradeDataAll: [], // 职级
            positionDataAll: [], // 职位
            buildRoomDataAll: [], // 所属楼栋
            getAllListTotal: '', // 总条数
            groupList: [],
            limitShow: false,
            OrgSearchArr: [],
            selectedOrgUsr: [],// 全局组织架构已选用户 {id:1, name: '张三'},{id:2, name: '李四'}
            limitData: '',
            data: { // 列表请求数据
                gid: '',
                username: '',
                mobile: '',
                nickname: '',
                department: '',
                position: '',
                build_room: '',
                level: '',
                status: '',
                start_time: '',
                end_time: '',
                pagesize: 10,
                page: 1
            }
        },
        methods: {
            // 移除用户
            limitRemove: function(id) {
                home.limitRemove(id)
            },
            // 批量移除用户
            totalRemove: function() {
                home.totalRemove();
            },
            // 点击增加用户
            limitAdd: function() {
                this.limitShow = !this.limitShow;
            },
            // 删除选中
            delChoose: function(index) {
                home.delChoose(index)
            },
            // 选择现有成员
            newGroupSelect: function(id) {
                home.newGroupSelect(id);
            },
            // 取消编辑
            groupCancel: function() {
                this.limitShow = !this.limitShow;
                this.selectedOrgUsr = []
            },
            // 确定
            groupSure: function(event) {
                home.groupSure(event);
            },
            orgSelectAll: function(e) {
                home.orgSelectAll(e);
            },
            orgSelectItem: function(e, id) {
                home.orgSelectItem(e, id);
            },
            // 重置
            reset: function() {
                home.reset();
            }
        }
    });

    _init();
});
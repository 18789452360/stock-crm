/**
 * Created by Administrator on 2017-09-18.
 * 帐号管理
 */
require(["layui", 'common', 'ajaxurl' ,'tools', 'layers', 'upload', 'text!/assets/popup/chang-password-account.html', 'text!/assets/popup/import-account.html', 'jstree'], function (layui, common, ajaxurl, tool, layers, upload, changPasswordAccount, importAccount) {
    var home = {

        /**
         * 渲染列表
         */
        getAllList: function() {
            var loading = '';
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
            // 获取列表数据
            tool.ajax({
                url: ajaxurl.user.index,
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
                //监听提交
                form.on('submit(formSelect)', function (data) {
                    if(data.field.start_time != '' && data.field.stop_time != ''){
                        if(data.field.start_time > data.field.stop_time){
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
         * 修改密码
         */
        changePassword: function(index, passCode) {
            layers.open({
                title: '修改密码',
                area: ['450px', '320px'],
                content: changPasswordAccount,
                success: function() {
                    var nickname = vm.tableDataAll[index].nickname,
                        username = vm.tableDataAll[index].username;
                    $(".nickname").html(nickname);
                    $(".username").html(username);
                },
                btn2: function (index, layero) {
                    var passWord = $.trim($(".new-password").val());
                    if(!(/^[\w]{6,30}$/.test(passWord))) {
                        layers.toast("密码格式不正确");
                        return;
                    }
                    // 确认的回调
                    tool.ajax({
                        url: ajaxurl.user.editPassword,
                        type: 'post',
                        data: {id: passCode, newpassword: passWord},
                        success: function(result){
                            if(result.code == 1){
                                layers.toast(result.message);
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
         * 删除帐号
         * @param delCode
         */
        accountDelete: function(delCode) {
            layers.confirm({
                title: '删除帐号',
                area: ['450px', '250px'],
                content: '<div class="confirm-tips">删除操作不可逆，确认删除？</div>',
                success: function() {
                },
                btn2: function (index, layero) {
                    // 确认的回调
                    tool.ajax({
                        url: ajaxurl.user.delUser,
                        type: 'post',
                        data: {id: delCode},
                        success: function(result){
                            if(result.code == 1){
                                layers.toast(result.message);
                                setTimeout(function(){
                                    window.location.reload();
                                },1000);
                            } else if(result.code == -2) {
                                layers.toast(result.message);
                                setTimeout(function(){
                                    window.location.reload();
                                },1000);
                            } else if(result.code == -3) {
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
         * 停用
         */
        accountStop: function(indexs, id, status) {
            var str = status == 1 ? '停用' : '启用',
                sure = status == 1 ? '将不能' : '可正常',
                newStart = status == 1 ? '' : '重新';
            layers.open({
                title: '提示',
                area: ['450px', '250px'],
                content: '<div class="confirm-tips"><p>帐号'+ newStart + str +'后此帐号'+ sure +'登录系统，</p><p>确定'+ str +'？</p></div>',
                btn2: function (index, layero) {
                    tool.ajax({
                        url: status == 1 ? ajaxurl.user.stopUser : ajaxurl.user.startUser,
                        type: 'post',
                        data: {id: id},
                        success: function(result){
                            if(result.code == 1){
                                layers.toast(result.message);
                                var statusIndex =  status == 1 ? 2 : 1;
                                vm.tableDataAll[indexs].status = statusIndex;
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
         * 获取职位,职级列表
         */
        addSelect: function() {
            tool.ajax({
                url: ajaxurl.position.indexPosition,
                type: 'post',
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.positionDataAll = result.data.data;
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
            tool.ajax({
                url: ajaxurl.grade.indexGrade,
                type: 'post',
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.gradeDataAll = result.data.data;
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
                            home.getAllList();
                        }
                    }
                });
            });
        },
        /**
         * 批量导入
         */
        importUsr: function () {
            layers.open({
                btn: null,
                title: '导入帐号',
                area: ['604px', '265px'],
                content: importAccount,
                success: function (layero, index) {
                    var groupId = '';// 选择的分组 id
                    var fileName = '';// 选择的文件名
                    var $layero = $(layero);
                    var uploadLoading = '';// 上传中动画

                    $('#fileUp').change(function (e) {
                        fileName = e.currentTarget.files[0].name;
                        $layero.find('.file-name').text(fileName);
                        $('.file-btn span').text('修改');
                        $('.file-container').addClass('uploaded');
                    });
                    layui.use(['form'], function () {
                        var form = layui.form;
                        form.on('select(group)', function (data) {
                            groupId = data.value;
                        });
                        form.render();
                    });
                    //上传
                    upload.init({
                        elem: '#fileUp',
                        url: ajaxurl.user.import,
                        field: 'import_csv', // 文件类型
                        accept: 'file',
                        exts: 'csv',
                        auto: false, // 关闭自动上传
                        bindAction: '.ok-upload',// 由确定按钮触发上传
                        data: {
                            customer_type: groupId // 自定义分组 id
                        },
                        before: function () {
                            layers.load(function (indexs) {
                                uploadLoading = indexs;
                            });
                            // 上传中避免重复提交
                            $layero.find('.ok').attr('disabled', true);
                        },
                        done: function (data) {
                            $layero.find('.ok').attr('disabled', false);
                            if (data.code === 1) {
                                layers.toast('上传成功！');
                                setTimeout(function () {
                                    window.location.reload();
                                }, 1000);
                            } else if(data.code== -2) {
                                layers.confirm({
                                    title: '提示',
                                    area: ['450px', '300px'],
                                    content: '<div class="confirm-tips"><p>以下帐号导入失败</p><p class="break-all">' + data.data + '</p></div>',
                                    btn: null
                                });
                            } else {
                                layers.toast(data.message, 2000);
                            }
                            layers.closed(uploadLoading);
                        },
                        error: function () {
                            layers.closed(uploadLoading);
                        }
                    });
                    $layero.find('.cancel').click(function () {
                        layers.closed(index);
                    });
                    $layero.find('.ok').click(function () {
                        if (!fileName.length) {
                            layers.toast('请选择文件！');
                            return;
                        }
                        $('.ok-upload').trigger('click');
                    });
                }
            });
        },
        /**
         * 重置
         */
        reset: function(){
            vm.data = {};
            home.getAllList()
        }
    };
    var _init = function() {
        common.getTabLink();
        home.getAllList();
        home.addSelect();
        home.accuntQuery();
    };
    /**
     * 实例化vue
     */
    var vm = new Vue({
        el: "#app",
        data: {
            tableDataAll: [], // 列表值
            gradeDataAll: [], // 职级
            positionDataAll: [], // 职位
            getAllListTotal: '', // 总条数
            data: { // 列表请求的数据
                username: '',
                mobile: '',
                nickname: '',
                department: '',
                position: '',
                level: '',
                seat_number: '',
                status: '',
                start_time: '',
                stop_time: '',
                pagesize: 10,
                page: 1
            }
        },
        methods: {
            // 删除
            accountDelete: function(deleteID) {
                if(deleteID == undefined){
                    throw new Error('缺少参数');
                }
                home.accountDelete(deleteID)
            },
            // 停用
            accountStop: function(index, id, status) {
                if(index == undefined || id == undefined || status == undefined){
                    throw new Error('缺少参数');
                }
                home.accountStop(index, id, status)
            },
            // 修改密码
            changePassword:function (index, passCode) {
                if(passCode == undefined || index == undefined){
                    throw new Error('缺少参数');
                }
                home.changePassword(index, passCode)
            },
            // 重置
            reset: function() {
                home.reset();
            },
            // 批量导入
            importUsr: function () {
                home.importUsr();
            }
        }
    });

    _init();

});
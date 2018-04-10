/**
 * Created by Administrator on 2017-09-18.
 * 帐号管理
 */
require(["vue", "layui", 'common', 'ajaxurl' ,'tools', 'layers', 'upload', 'jquery.metisMenu'], function (Vue, layui, common, ajaxurl, tools, layers, upload) {
    var home = {
        reg:{
            uPattern: /^[a-zA-Z0-9_]{4,30}$/, //验证用户名
            tPattern: /^1[2|3|4|5|6|7|8|9]\d{9}$/ //验证手机号
        },
        form: '',
         /**
         * 初始化全局树形菜单
         */
        sideMenu: function (callback) {
            Vue.nextTick(function () {
                $('#org-framework').metisMenu();
                typeof callback === 'function' && callback.call(this);
            })
        },
        /**
         * [getUrlArgs description] 获取URL参数  如果url里面有 user=my 表示员工自己编辑 否则就是管理员编辑
         * @return {[type]} [description]
         */
        getUrlArgs: function(){
            var urls = tools.getUrlArgs();
            if(urls.has){
                vm.UrlArgs = urls.data;
            }
            if(vm.UrlArgs.user != undefined && vm.UrlArgs.user == 'my'){
                vm.userdisabled = true;
            }else{
                vm.userdisabled = false;
            }
        },
        /**
         * 创建 Form 表单
         */
        createForm: function () {
            var that = this, $avatar = $('#avatar'), $errorText = $('#errorText');
            layui.use(['form', 'upload'], function (form, upload) {
                var upload = layui.upload,
                    form = layui.form;
                
                //自定义验证规则
                form.verify({
                    uPattern: function(value){//验证用户名
                        if(!new RegExp(that.reg.uPattern).test(value)){
                            return '用户名不合法';
                        }
                    },
                    pPattern: function(value){//验证密码
                        if( 30 < $.trim(value).length < 6){
                            return '密码长度为6-30位';
                        }
                    },
                    tPattern: function(value){//验证手机号码
                        if(!new RegExp(that.reg.tPattern).test(value)){
                            return '手机号码不正确';
                        }
                    }
                });
                form.on('select(build_room)', function(data){
                    vm.buildRoom = data.value;
                    if(vm.seaNumber == '') { // 如果用户值选择了楼栋,未选择坐席号或坐席号为空则退出,不做验证
                        return;
                    }
                    home.checkSeat(vm.userid, vm.buildRoom, vm.seaNumber);
                });
                //表单验证
                form.on('submit(formSave)',function(data){
                    home.checkSeat(vm.userid, vm.buildRoom, vm.seaNumber, function() {
                        if(data){
                            if(data.field.avatar == undefined){
                                data.field.avatar = vm.image || vm.Basicimage;
                            }
                            if(data.field.id == undefined){
                                data.field.id = vm.UrlArgs.id || vm.userinfo.id;
                            }
                            data.field.build_room = vm.buildRoom;
                            if(data.field.build_room == '' && vm.seaNumber != '') {
                                layers.toast("楼栋不能为空")
                            } else if (vm.checkSeat) { // 判断坐席号是否重复
                                layers.toast("坐席号不能重复");
                                return false;
                            } else {
                                that.editUser(data.field);
                            }
                            var a = data.field;

                        }
                    });
                    return false;
                });
                that.form = form;
            })
        },
        /**
         * [uploadImg description] 上传图片
         * @return {[type]} [description]
         */
        uploadImg: function(){
            var $avatar = $('#avatar'), $errorText = $('#errorText');
            var uploadDatas = {
                elem: '#uploadImg',
                field: 'fileUpload',
                before: function (obj) {
                    //预读本地文件示例，不支持ie8
                    obj.preview(function (index, file, result) {
                        vm.showavatar = true;
                        $avatar.prop('src', result); //图片链接（base64）
                    });
                },
                done: function (res) {
                    //如果上传失败
                    if (res.code == 1) {
                        vm.image = res.data.image;
                    }else{
                        layers.toast(res.message);
                    }
                    //上传成功
                },
                error: function (index, uploadInst) {
                    //上传失败以后 显示重新上传按钮
                    $errorText.html('<span style="color: #FF5722;">上传失败</span> <a class="layui-btn layui-btn-mini upload-reload">重试</a>');
                    $errorText.find('.upload-reload').on('click', function () {
                        uploadInst.upload();
                    });
                }
            };
            upload.init(uploadDatas);
        },
        /**
         * [addUser description] 编辑员工账号
         * @param {[type]} datas [description]
         */
        editUser: function(datas){
            if(vm.isTrue) {
                if(!$.isEmptyObject(datas)){
                    vm.isTrue = false;
                    tools.ajax({
                        url: vm.userdisabled == true ? ajaxurl.user.editUserIndex : ajaxurl.user.editUser,
                        data: datas,
                        type: 'post',
                        success: function(result){
                            if(result.code == 1){
                                layers.toast('编辑成功');
                                setTimeout(function(){
                                    common.closeTab(true);
                                },1000);
                            }else{
                                layers.toast(result.message);
                            }
                        }
                    })
                }else{
                    throw new Error('参数错误！');
                }
            }
        },
        /**
         * [getBasic description] 获取基础信息
         * @return {[type]} [description]
         */
        getBasic: function(res){
            var that = this;
            tools.ajax({
                url: ajaxurl.user.getBasic,
                data:{},
                success: function(result){
                    if(result.code == 1){
                        vm.BasicDepartment = result.data.department;
                        //处理楼栋
                        if(result.data.build_room){
                            var roomLens = result.data.build_room.length;
                            for(var m = 0; m < roomLens; m++){
                                if(result.data.build_room[m].checked == undefined){
                                    result.data.build_room[m].checked = false;
                                }
                                if(res.build_room == result.data.build_room[m].id){
                                    result.data.build_room[m].checked = true;
                                }
                            }
                        }
                        //处理职级
                        if(result.data.grade){
                            var gradeLens = result.data.grade.length;
                            for(var k = 0; k < gradeLens; k++){
                                if(result.data.grade[k].checked == undefined){
                                    result.data.grade[k].checked = false;
                                }
                                if(res.level == result.data.grade[k].id){
                                    result.data.grade[k].checked = true;
                                }
                            }
                        }
                        //处理职位的选中
                        if(result.data.position){
                            var posLens = result.data.position.length;
                            for(var j = 0; j < posLens; j++){
                                if(result.data.position[j].checked == undefined){
                                    result.data.position[j].checked = false;
                                }
                                if(res.position == result.data.position[j].id){
                                    result.data.position[j].checked = true;
                                }
                            }
                        }
                        //这里是处理权限选中
                        if(result.data.rule){
                            var lens = result.data.rule.length;
                            for(var i = 0; i < lens; i++){
                                if(result.data.rule[i].checked == undefined){
                                    result.data.rule[i].checked = false;
                                }
                                if(res.rules){
                                    for(var j = 0, resLens = res.rules.length; j < resLens; j++){
                                        if(res.rules[j] == result.data.rule[i].id){
                                            result.data.rule[i].checked = true;
                                        }
                                    }
                                }
                            }
                        }
                        vm.BasicRoom = result.data.build_room;
                        vm.BasicGrade = result.data.grade;
                        vm.BasicPosition = result.data.position;
                        vm.BasicRule = result.data.rule;
                        for(var i = 0; i < vm.BasicRoom.length; i ++) {
                            if(vm.BasicRoom[i].checked == true) {
                                vm.buildRoom = vm.BasicRoom[i].id;
                            }
                        }
                        that.sideMenu(function(){
                            that.filterOrgSearch();
                        });
                    }else{
                        layers.toast(result.message);
                    }
                }
            })
        },
        /**
         * [selectOneUser description] 获取用户默认信息
         * @return {[type]} [description]
         */
        selectOneUser: function(){
            var that = this, urls = tools.getUrlArgs(), id = '';
            if(urls.has){
                if(urls.data.id != undefined && urls.data.id != null){
                    vm.userid = urls.data.id;
                }else{
                    if(urls.data.user == 'my'){
                        vm.userid = vm.userinfo.id;
                    }else{
                        throw new Error('缺少id参数！');
                    }
                }
            }

            tools.ajax({
                url: vm.userdisabled == true ? ajaxurl.user.showIndex : ajaxurl.user.selectOneUser,
                data:{id:vm.userid},
                type: 'post',
                success: function(result){
                    if(result.code == 1){
                        vm.BasicInfo = result.data;
                        if(result.data.avatar != undefined || result.data.avatar != null){
                            vm.showavatar = true;
                            vm.Basicimage = result.data.avatar;
                            vm.readerOrgUsr.id = result.data.department;
                            vm.readerOrgUsr.department_name = result.data.department_name;
                            vm.seaNumber = result.data.seat_number;
                            if(result.data.department && result.data.department_name){
                                vm.selectedOrgUsr = [{id:result.data.department,department_name:result.data.department_name}]
                            }
                            $('#avatar').prop('src', result.data.avatar);
                        }
                        tools.setStorage('userMobile',result.data.mobile); // 临时缓存到session中
                        tools.setStorage('userName',result.data.username); // 临时缓存到session中
                        tools.setStorage('seatNumber',result.data.seat_number); // 临时缓存到session中
                        that.getBasic(result.data);
                    }else{
                        layers.toast(result.message);
                    }
                }
            })
        },
        /**
         * [checkmobile description] 检测电话号码是否存在
         * @param  {[type]} mobile [description]
         * @return {[type]}        [description]
         */
        checkmobile: function(mobile){
            tools.ajax({
                url: ajaxurl.BaseUrl + '/admin/user/checkmobile',
                type: 'post',
                data:{mobile: mobile},
                success: function(result){
                    if(result.code == 1){ //不存在
                        vm.checkTips.mobile = {
                            err: false,
                            text: ''
                        }
                    }else{
                        vm.checkTips.mobile = {
                            err: true,
                            text: result.message
                        }
                    }
                }
            })
        },
        /**
         * [checkmobile description] 检测用户是否存在
         * @param  {[type]} mobile [description]
         * @return {[type]}        [description]
         */
        checkUser: function(user){
            tools.ajax({
                url: ajaxurl.user.checkUsername,
                type: 'post',
                data:{username: user},
                success: function(result){
                    if(result.code == 1){ //不存在
                        vm.checkTips.username = {
                            err: false,
                            text: ''
                        }
                    }else{
                        vm.checkTips.username = {
                            err: true,
                            text: result.message
                        }
                    }
                }
            })
        },
        /**
         * [checkmobile description] 检测用户坐席号是否重复
         * @param  {[type]} mobile [description]
         * @return {[type]}        [description]
         */
        checkSeat: function(id, build, seatNum, callback){
            tools.ajax({
                url: ajaxurl.customer.checkBuildWithSeatNum,
                type: 'post',
                data:{
                    build: build,
                    seat_num: seatNum,
                    admin_id: id
                },
                success: function(result){
                    if(result.code == 1){ //不存在
                        vm.checkTips.seatNumber = {
                            err: false,
                            text: ''
                        };
                        vm.checkSeat = false;
                    } else if (result.code == -1){
                        vm.checkTips.seatNumber = {
                            err: true,
                            text: result.message
                        };
                        vm.checkSeat = true;
                    } else {
                        vm.checkTips.seatNumber = {
                            err: true,
                            text: result.message
                        }
                    }
                    typeof callback === 'function' && callback.call(this);
                }
            })
        },
        /**
         * 筛选--组织架构搜索
         */
        filterOrgSearch: function () {
            Vue.nextTick(function () {
                var $item = $('#org-framework').find('a[data-type="1"]'); //查找所有的 部门列表
                $item.each(function () {
                    var newItem = {id: $(this).data('id'), name: $(this).data('text')};
                    vm.OrgSearchArr.push(newItem);
                });
            });
            this.form.on('select(search-org)', function (data) {
                vm.selectedOrgUsr = [];
                var addItem = {id: data.value.split(',')[0] * 1, department_name: data.value.split(',')[1]};
                vm.selectedOrgUsr.push(addItem);
                //vm.selectedOrgUsr = home.unique(vm.selectedOrgUsr).reverse();
            });
            setTimeout(function(){
                home.form.render()
            },500);
        },
    };
    //实例化VUE
    var vm = new Vue({
        el: "#app",
        data: {
            userinfo: common.getUserInfo(), //获取员工信息
            BasicPosition: [], //职位
            BasicGrade: [],  //职级
            BasicDepartment: [], //部门
            BasicRule: [], //权限组
            BasicRoom: [], //所属楼栋
            showavatar: false,
            image: '', //用户头像
            Basicimage: '', //编辑时候获取的头像
            BasicInfo: '', //默认信息
            UrlArgs: '', //url参数
            buildRoom: '', // 所属楼栋
            seaNumber: '', // 坐席号
            checkSeat: false, // 验证坐席号是否重复
            userdisabled: false, //用户禁用表单
            userid: '',
            checkTips:{//用户检测是否存在
                mobile: {err:false, text:''},
                username: {err:false, text:''},
                seatNumber: {err:false, text:''}
            },
            selectedOrgUsr: [], //暂时记录组织架构的选中
            readerOrgUsr: {id: '', department_name:''}, //渲染组织架构
            showpop: false,
            OrgSearchArr: [], //缓存组织架构搜索结果
            isTrue: true
        },
        methods: {
            cancelAdd:function(){
                common.closeTab();
            },
            checkName: function(event){ // 用户名
                var username = $.trim(event.target.value);
                if(!new RegExp(home.reg.uPattern).test(username)){
                    this.checkTips.username = {
                        err: true,
                        text: '用户名由4-30的数字,字母和下划线组成'
                    };
                    return;
                }
                var BasicUser = tools.getStorage('userName');//获取缓存在session中的值
                //如果当前输入的值与默认值相等不用去验证 或者是用户没有修改电话 但是在输入中有获取失去焦点的操作  也不需要去验证
                if(username === BasicUser) return;
                home.checkUser(username);
            },
            checkmobile: function(event){//验证手机号
                var mobile = $.trim(event.target.value);
                if(!new RegExp(home.reg.tPattern).test(mobile)){
                    this.checkTips.mobile = {
                        err: true,
                        text: '手机号码不合法'
                    };
                    return;
                }
                var Basicmobile = tools.getStorage('userMobile');//获取缓存在session中的值
                //如果当前输入的值与默认值相等不用去验证 或者是用户没有修改电话 但是在输入中有获取失去焦点的操作  也不需要去验证
                if(mobile === Basicmobile) return;
                home.checkmobile(mobile);
            },
            checkSeats: function(event){ // 验证坐席号
                var seatNum = tools.getStorage('seatNumber');
                home.checkSeat(vm.userid, vm.buildRoom, vm.seaNumber);
            },
            orgSelectItem: function(e, type){
                if(type != undefined){
                    if(type != 0 && !$(e.target).hasClass('has-arrow')){
                        var newItem = {id: $(e.target).data('id'), department_name: $(e.target).data('text')};
                        this.selectedOrgUsr = [];
                        this.selectedOrgUsr.push(newItem);
                    }
                }
            },
            orgSelectAdd: function(e, id, name){
                if(id != undefined && name != undefined){
                    var newItem = {id:id, department_name: name};
                    this.selectedOrgUsr = [];
                    this.selectedOrgUsr.push(newItem);
                }
            },
            addConditonsOrg:function(e){
                if (this.selectedOrgUsr.length) {
                    this.readerOrgUsr = this.selectedOrgUsr[0];
                    this.showpop = false;
                } else {
                    layers.toast('请选择人员');
                }
            },
            delChoose: function(){
                this.selectedOrgUsr = [];
            }
        }
    });
    //初始化
    var _init = function() {
        home.createForm();
        home.getUrlArgs();
        common.getTabLink();
        home.selectOneUser();
        home.uploadImg();
    };
    
    _init();
});
/**
 * Created by Administrator on 2017-09-18.
 * 帐号管理
 */
require(["vue", "layui", 'common', 'ajaxurl' ,'tools', 'layers', 'upload', 'jquery.metisMenu'], function (Vue, layui, common, ajaxurl, tools, layers, upload) {
    var home = {
        reg:{
            uPattern: /^[a-zA-Z0-9_]{4,30}$/, // 验证用户名
            tPattern: /^1[2|3|4|5|6|7|8|9]\d{9}$/, // 验证手机号
            pPattern: /^[\w]{6,30}$/ // 验证密码
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
         * 创建 Form 表单
         */
        createForm: function () {
            var that = this;
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
                        var passWord = $.trim(value);
                        if(!new RegExp(that.reg.pPattern).test(passWord)){
                            return '密码由数字,字母和下划线组成';
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
                    home.checkSeat(vm.buildRoom, vm.seaNumber);
                });
                //表单验证
                form.on('submit(formSave)',function(data){
                    home.checkSeat(vm.buildRoom, vm.seaNumber, function() {
                        if(data){
                            if(data.field.avatar == undefined){
                                data.field.avatar = vm.image;
                            }
                            if(data.field.build_room == '' && vm.seaNumber != '') {
                                layers.toast("楼栋不能为空")
                            } else if (vm.checkSeat) { // 判断坐席号是否重复
                                layers.toast("坐席号不能重复");
                            } else {
                                that.addUser(data.field);
                            }
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
            }
            upload.init(uploadDatas);
        },
        /**
         * [addUser description] 新增员工账号
         * @param {[type]} datas [description]
         */
        addUser: function(datas){
            if(vm.isTrue) {
                if(!$.isEmptyObject(datas)){
                    vm.isTrue = false;
                    tools.ajax({
                        url: ajaxurl.user.addUser,
                        data: datas,
                        type: 'post',
                        success: function(result){
                            if(result.code == 1){
                                layers.toast('新增成功');
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
        getBasic: function(){
            var that = this;
            tools.ajax({
                url: ajaxurl.user.getBasic,
                data:{},
                success: function(result){
                    if(result.code == 1){
                        vm.BasicPosition = result.data.position;
                        vm.BasicGrade = result.data.grade;
                        vm.BasicDepartment = result.data.department;
                        vm.BasicRoom = result.data.build_room;
                        vm.BasicRule = result.data.rule;
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
         * [checkusername description] 检测用户名是否存在
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        checkusername:function(name){
            if($.trim(name) == '') return;
            tools.ajax({
                url: ajaxurl.BaseUrl + '/admin/user/checkusername',
                type: 'post',
                data:{username: name},
                success: function(result){
                    if(result.code == 1){
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
         * [checkmobile description] 检测用户坐席号是否重复
         * @param  {[type]} mobile [description]
         * @return {[type]}        [description]
         */
        checkSeat: function(build, seatNum, callback){
            tools.ajax({
                url: ajaxurl.customer.checkBuildWithSeatNum,
                type: 'post',
                data:{
                    build: build,
                    seat_num: seatNum,
                    employee_id: ''
                },
                success: function(result){
                    if(result.code == 1){ // 不存在
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
            });
            setTimeout(function(){
                home.form.render()
            },500);
        },
        /**
         * 数组对象简单去重 对 id 去重, 名字可以有重复
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
        }
    };
    //实例化VUE
    var vm = new Vue({
        el: "#app",
        data: {
            BasicPosition: [], //职位
            BasicGrade: [],  //职级
            BasicDepartment: [], //部门
            BasicRule: [], //权限组
            BasicRoom: [], //所属楼栋
            showavatar: false,
            image: '',
            buildRoom: '', // 所属楼栋
            seaNumber: '', // 坐席号
            checkSeat: false, // 验证坐席号是否重复
            checkTips:{//用户检测是否存在
                username: {err:false, text:''},
                mobile: {err:false, text:''},
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
            checkNames: function(event){ //验证用户名
                var name = $.trim(event.target.value);
                home.checkusername(name);
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
                home.checkmobile(mobile);
            },
            checkSeats: function(event){ // 验证坐席号
                var seat_number = $.trim(event.target.value);
                home.checkSeat(vm.buildRoom, vm.seaNumber);
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
        common.getTabLink();
        home.getBasic();
        home.uploadImg();
    };
    
    _init();
});
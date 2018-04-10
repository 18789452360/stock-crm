/**
 * Created by Administrator on 2017-09-18.
 * 帐号管理
 */
require(["vue", "layui", 'common', 'ajaxurl' ,'tools', 'layers'], function (Vue, layui, common, ajaxurl, tools, layers) {
    var home = {
        reg:{
            uPattern: /^[a-zA-Z0-9_]{4,16}$/, //验证用户名
            tPattern: /^1[3|4|5|7|8]\d{9}$/ //验证手机号
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
            layui.use(['form', 'upload'], function (form, upload) {
                var upload = layui.upload,
                    form = layui.form;
            })
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
                        vm.BasicPosition = result.data.position;
                        vm.BasicGrade = result.data.grade;
                        vm.BasicDepartment = result.data.department;
                        vm.BasicRoom = result.data.build_room;
                        if(result.data.rule){
                            var lens = result.data.rule.length;
                            for(var i = 0; i < lens; i++){
                                if(result.data.rule[i].checked == undefined){
                                    result.data.rule[i].checked = false;
                                }
                                if(res){
                                    for(var j = 0, resLens = res.length; j < resLens; j++){
                                        if(res[j] == result.data.rule[i].id){
                                            result.data.rule[i].checked = true;
                                        }
                                    }
                                }
                            }
                        }
                        vm.BasicRule = result.data.rule;
                        that.createForm();
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
                    id = urls.data.id;
                }else{
                    if(urls.data.user == 'my'){
                        id = vm.userinfo.id;
                    }else{
                        throw new Error('缺少id参数！');
                    }
                }
            }
            tools.ajax({
                url: vm.userdisabled == true ? ajaxurl.user.showIndex : ajaxurl.user.selectOneUser,
                data:{id: id},
                type: 'post',
                success: function(result){
                    if(result.code == 1){
                        vm.BasicInfo = result.data;
                        vm.readerOrgUsr.id = result.data.department;
                        vm.readerOrgUsr.department_name = result.data.department_name;
                        if(result.data.avatar != undefined || result.data.avatar != null){
                            vm.showavatar = true;
                            $('#avatar').prop('src', result.data.avatar);
                        }
                        that.getBasic(result.data.rules);
                    }else{
                        layers.toast(result.message);
                    }
                }
            })
        }
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
            BasicInfo: '', //默认信息
            UrlArgs: '', //url参数
            userdisabled: false, //用户禁用表单
            readerOrgUsr: {id: '', department_name:''}, //渲染组织架构
        },
        methods: {
            cancelAdd:function(){
                common.closeTab();
            }
        }
    });
    //初始化
    var _init = function() {
        home.getUrlArgs();
        common.getTabLink();
        home.selectOneUser();
    };
    
    _init();
});
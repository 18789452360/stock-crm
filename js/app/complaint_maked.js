/**
 * Created by Administrator on 2017-09-18.
 * 帐号管理
 */
require(["vue", "layui", 'common', 'ajaxurl' ,'tools', 'layers', 'upload', 'lightbox'], function (Vue, layui, common, ajaxurl, tools, layers, upload, lightbox) {
    var home = {
        reg:{
            uPattern: /^1[2|3|4|5|6|7|8|9]\d{9}$/, //失焦验证手机号
            tPattern: /^[\d-]*$/ //验证手机号
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
         * [getNowTime description] 获取当前时间
         * @return {[type]} [description]
         */
        getNowTime: function(){
            var myDate = new Date();
            var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
            var month = myDate.getMonth()+1;       //获取当前月份(0-11,0代表1月)
            var date = myDate.getDate();        //获取当前日(1-31)
            var hours = myDate.getHours();       //获取当前小时数(0-23)
            var minute = myDate.getMinutes();     //获取当前分钟数(0-59)
            if(month < 10){
                month = '0'+month
            }
            if(hours < 10){
                hours = '0'+hours
            }
            if(minute < 10){
                minute = '0'+minute
            }
            vm.BasicInfo.time= year+'-'+month+'-'+date+' '+hours+':'+minute;
        },
        /**
         * 创建 Form 表单
         */
        createForm: function () {
            var that = this, $avatar = $('#avatar'), $errorText = $('#errorText');
            layui.use(['form', 'upload'], function (form, upload) {
                var upload = layui.upload,
                    form = layui.form;
                //表单验证
                form.on('submit(formSave)',function(data){
                    if(data){
                        if(data.field.type == undefined){
                             layers.toast('必填项不能为空', {
                                icon: 2,
                                anim: 6
                            });
                            return false;
                        }
                        if(data.field.address == ''){
                             layers.toast('必填项不能为空', {
                                icon: 2,
                                anim: 6
                            });
                            return false;
                        }
                        if(data.field.fileUpload == ''){
                            data.field.fileUpload = vm.BasicInfo.images;
                        }
                        var tel = [], mob = vm.BasicInfo.mobileArr;
                        for(var i=0; i < mob.length; i++){
                            if(!new RegExp(home.reg.tPattern).test(mob[i].mobile)){
                                layers.toast('请输入正确电话号码！', {
                                    icon: 2,
                                    anim: 6
                                });
                                return false;
                            }
                            tel.push($.trim(mob[i].mobile));
                        }
                        var newTel = JSON.stringify(tel);
                        var nary = tel.sort();
                        for(var j=0,len=nary.length-1;j<len;j++){
                            if($.trim(nary[j])== $.trim(nary[j+1])){
                                layers.toast('内容重复，请从新输入！', {
                                    icon: 2,
                                    anim: 6
                                });
                                return false;
                            }
                        }
                        home.getFormInfo(data.field,JSON.parse(newTel));
                    }
                    return false;
                });
                that.form = form;
            })
        },
        /**
         * [getFormInfo description] 提交数据
         * @param  {[type]} data [description]
         * @param  {[type]} tel  [description]
         * @return {[type]}      [description]
         */
        getFormInfo:function(data,tel){
            var loading = '';
             tools.ajax({
                url: ajaxurl.complaint.start,
                data: {
                    customer_real_name: data.name ,
                    complaint_type: data.type,
                    images: data.fileUpload,
                    info: data.address,
                    create_time: vm.BasicInfo.time,
                    tel: tel,
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success: function (result) {
                    if (result.code == 1) {
                        layers.toast('添加成功！', {
                                icon: 1,
                                anim: 1
                        });
                        setTimeout(function() {
                            common.closeTab(true);
                        }, 1000);
                    } else {
                        layers.toast(result.message);
                    }
                    layers.closed(loading);
                },
                error:function(){
                    layers.toast('网络异常');
                    layers.closed(loading);
                }
            })
        },
        /**
         * [uploadImg description] 上传图片
         * @return {[type]} [description]
         */
        uploadImg: function(){
            var $avatar = $('#avatar'), $errorText = $('#errorText'),loading = '';
            var uploadDatas = {
                elem: '#uploadImg',
                url: ajaxurl.upload.ftp_upload,
                multiple: true,
                field: 'fileUpload',
                before: function (obj) {
                    //预读本地文件示例，不支持ie8
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                done: function (res) {
                    //如果上传失败
                    if (res.code == 1) {
                         vm.BasicInfo.images.push(res.data);
                    }else{
                        layers.toast(res.message);
                    }
                    layers.closed(loading);
                    //上传成功
                },
                error: function (index, uploadInst) {
                   layers.closed(loading);
                }
            }
            upload.init(uploadDatas);
        },
        /**
         * [lightboxInit description] 初始化灯箱效果 编辑新增展示的效果
         * @return {[type]} [description]
         */
        lightboxInit: function () {
            lightbox.init('#follow-upload-list section');
        },
        /**
         * 检查已录入的号码是否重复
         * @param num 待检查的录入号码
         */
        checkDuplicatePhone: function (num, checkIndex) {
            var flag = false;// 默认不重复
            var checkArr = [];// 已录入的电话
            vm.BasicInfo.mobileArr.forEach(function (item) {
                checkArr.push(item.mobile)
            });
            checkArr.splice(checkIndex, 1);// 弹出刚刚输入的
            // 新录入的电话如果存在就表示重复
            checkArr.forEach(function (item) {
                item === num && (flag = true);
            });
            return flag;
        },
    };
    //实例化VUE
    var vm = new Vue({
        el: "#app",
        data: {
            userinfo: common.getUserInfo(), //获取员工信息
            showavatar: false,
            image: '', //用户头像
            Basicimage: '', //编辑时候获取的头像
            UrlArgs: '', //url参数
            BasicInfo:{//用户检测是否存在
                name: {text:''},
                mobileArr:[{mobile:''}], 
                time:'',
                type:'',
                Info:'',
                images:[],
            },
        },
        methods: {
            cancelAdd:function(){
                vm.BasicInfo.images = [];
                home.getNowTime();
            },
            addMobile: function(index){ //增加输入电话号码框
                var len = this.BasicInfo.mobileArr.length;
                if(len < 2){
                    this.BasicInfo.mobileArr.push({mobile:''});
                }else{
                    layers.toast('只能添加两个联系方式！', {
                        icon: 2,
                        anim: 6
                    });
                    return;
                }
            },
            removeMobile: function(index){ //删除输入电话号码框
                if(index != undefined){
                    this.BasicInfo.mobileArr.splice(index, 1);
                }
            },
            checkmobile: function(event,index){//验证手机号
                var mobile = $.trim(event.target.value);
                if(!new RegExp(home.reg.tPattern).test(mobile)){
                    if(mobile != ''){
                        layers.toast('请输入正确电话号码！', {
                            icon: 2,
                            anim: 6
                        });
                        return;
                    }
                }
                if(home.checkDuplicatePhone(mobile, index)) {// 新增中的号码有重复
                    if (index !== 0) {
                        layers.toast('电话号码有重复！', {
                            icon: 2,
                            anim: 6
                        });
                        return;
                    }
                }
            },
            //删除图片
            delFollowImage:function(index){
                this.BasicInfo.images.splice(index,1);
            },
        }
    });
    //初始化
    var _init = function() {
        home.createForm();
        common.getTabLink();
        home.uploadImg();
        home.getNowTime();   
        home.lightboxInit();
    };
    
    _init();
});
/**
 * Created by Administrator on 2017-09-18.
 * 帐号管理
 */
require(["vue", "layui", 'common', 'ajaxurl' ,'tools', 'layers', 'upload','template', 'text!/assets/popup/complaint-handle.html', 'text!/assets/popup/remark-edit.html','lightbox'], function (Vue, layui, common, ajaxurl, tools, layers, upload, template, complaintHandle, remarkEdit, lightbox) {
     //修改template模板界定符
    template.config('openTag', '{%');
    template.config('closeTag', '%}');
    var home = {
        reg:{
            uPattern: /^[a-zA-Z0-9_]{4,30}$/, //验证用户名
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
         * [getUrlArgs description] 获取URL参数
         * @return {[type]} [description]
         */
        getUrlArgs: function(){
            var urls = tools.getUrlArgs();
            if(urls.has){
                vm.complaint_id = urls.data.complaint_id;
                vm.noall = urls.data.noall;
            }
        },
        /**
         * [gainDetails description]投诉详情
         * @param  {[type]} c_id [description]
         * @return {[type]}      [description]
         */
        gainDetails: function(c_id){
            vm.DetailsInfo.mobileArr = [];
            vm.viewInfo.mobileArr = [];
            tools.ajax({
                url: ajaxurl.complaint.details,
                type: 'post',
                data:{complaint_id:vm.complaint_id},
                success: function(result){
                    if(result.code == 1){ 
                        vm.viewInfo = result.data;
                        if(vm.viewInfo.mobileArr == undefined){
                            vm.viewInfo.mobileArr = [];
                        }
                        vm.DetailsInfo.id = result.data.id;
                        vm.DetailsInfo.name = result.data.customer_real_name;
                        vm.DetailsInfo.type = result.data.complaint_type;
                        layui.use('form', function(){// layui 与 vue 渲染冲突 需要重新加载
                          var form = layui.form;
                          setTimeout(function(){
                            form.render('radio');
                          },200)
                        });
                        vm.DetailsInfo.Info = result.data.info;
                        if(result.data.images != ''){
                            vm.DetailsInfo.images = result.data.images;
                        }
                        vm.DetailsInfo.time = result.data.create_time;
                        var Mlen = result.data.tel.length;
                        for(var j = 0; j < Mlen; j++){
                            vm.DetailsInfo.mobileArr.push({mobile:result.data.tel[j]});
                            vm.viewInfo.mobileArr.push({mobile:result.data.tel[j]});
                        };  
              
                    }else{
                       layers.toast(result.message);
                    }
                }
            })
        },
        /**
         * [getNowTime description]获取当前时间
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
            // vm.DetailsInfo.time= year+'-'+month+'-'+date+' '+hours+':'+minute;
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
                            data.field.fileUpload = vm.DetailsInfo.images;
                        }
                        var tel = [], mob = vm.DetailsInfo.mobileArr;
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
                        home.getFormInfo(data.field,JSON.parse(newTel),vm.complaint_id);
                    }
                    return false;
                });
                that.form = form;
            })
        },
        /**
         * [getFormInfo description]提交表单数据
         * @param  {[type]} data         [description]
         * @param  {[type]} tel          [description]
         * @param  {[type]} complaint_id [description]
         * @return {[type]}              [description]
         */
        getFormInfo:function(data,tel,complaint_id){
            var loading = '';
             tools.ajax({
                url: ajaxurl.complaint.edit,
                data: {
                    complaint_id: complaint_id ,
                    customer_real_name: data.name ,
                    complaint_type: data.type,
                    images: data.fileUpload,
                    info: data.address,
                    tel: tel,
                    create_time:vm.viewInfo.create_time,
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
                        vm.showLog = !vm.showLog;
                        home.gainDetails();
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
                         vm.DetailsInfo.images.push(res.data);
                        // home.lightboxInit();
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
         * [lightboxInit description] 初始化灯箱效果 编辑展示的效果
         * @return {[type]} [description]
         */
        lightboxInit: function () {
            lightbox.init('#follow-upload-list section');
        },
        /**
         * [cooperLight description]  展示附件列表的灯箱
         * @return {[type]} [description]
         */
        lightboxs: function(){
            lightbox.init('#uploadeImgBar #tt');
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
         * 检查已录入的号码是否重复
         * @param num 待检查的录入号码
         */
        checkDuplicatePhone: function (num, checkIndex) {
            var flag = false;// 默认不重复
            var checkArr = [];// 已录入的电话
            vm.DetailsInfo.mobileArr.forEach(function (item) {
                checkArr.push(item.mobile)
            });
            checkArr.splice(checkIndex, 1);// 弹出刚刚输入的
            // 新录入的电话如果存在就表示重复
            checkArr.forEach(function (item) {
                item === num && (flag = true);
            });
            return flag;
        },
        /**
         * [delNews description] 投诉处理弹窗
         * @param  {[type]} type    [description]
         * @param  {[type]} sontype [description]
         * @param  {[type]} smsId   [description]
         * @return {[type]}         [description]
         */
        HandlePop: function () {
            layers.confirm({
                title:'投诉处理',
                content: complaintHandle,
                area: ['602px', '420px'],
                success: function(index, layero) {
                    layui.use(['form'], function () {
                        var form = layui.form;
                        form.render();
                        //表单验证
                    });
                },
                btn2:function(index, layero){
                    var $layero = $(layero), 
                        status = $layero.find('[name="status"]').val(),//处理状态
                        result = $layero.find('[name="result"]').val(),//处理结果
                        info = $layero.find('[name="info"]').val();//处理结果
                        if(status != '' && result != ''){
                            home.getHandleForm(status,result,info);
                        }else{
                            layers.toast('请选择处理状态与处理结果', {
                                icon: 2,
                                anim: 6
                            });
                            return false;
                        }
                }
            });
        },
        /**
         * 提交 投诉处理弹窗表单信息
         */
        getHandleForm: function (status,result,info) {
           var loading = '';
             tools.ajax({
                url: ajaxurl.complaint.solve,
                data: {
                    compliant_id: vm.complaint_id,
                    result: result,
                    info: info,
                    status: status,
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
                        home.HandleInfo();
                    } else {
                        layers.toast(result.message);
                    }
                    layers.closed(loading);
                },
                error:function(){
                    layers.toast('网络异常');
                    layers.closed(loading);
                }
            });
        },
        /**
         * 读取投诉处理信息
         */
        HandleInfo: function () {
             tools.ajax({
                url: ajaxurl.complaint.record,
                data: {
                    compliant_id: vm.complaint_id,
                },
                type: 'post',
                success: function (result) {
                    if (result.code == 1) {
                        vm.handleInfo = result.data.list
                    } else {
                        layers.toast(result.message);
                    }
                },
                error:function(){
                    layers.toast('网络异常');
                }
            });
        },
        /**
         * 获取客户备注列表
         */
        getTagMark: function (callback) {
            tools.ajax({
                url: ajaxurl.customer.getListTagMark,
                data: {},
                success: function (res) {
                    if (res.code === 1) {
                        // 备注 && 标签
                        vm.remarkList = res.data.marklist;
                        // vm.tagList = res.data.taglist;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(res.message);
                    }
                },
                error: function () {
                    layers.toast('网络异常');
                }
            });
        },
        /**
         * 获取当前客户的备注
         */
        getTagMarkBefore: function (callback) {
            // 获取路由参数id的值
            var loading = '';
            tools.ajax({
                url: ajaxurl.customer.gainRemark,
                data: {
                    customer_id: vm.viewInfo.customer_id // 用户id
                },
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success: function (result) {
                    if (result.code === 1) {
                        vm.gainRemarkList = result.data.list;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(result.message);
                    }
                    layers.closed(loading);
                },
                error: function () {
                    layers.closed(loading);
                    layers.toast('网络异常');
                }
            });
        },
        /**
         * 编辑当前客户的备注
         */
        remarkEdit: function () {
            home.getTagMark(function () {
                home.getTagMarkBefore(function () {
                    if(vm.remarkList.length == 0 && vm.gainRemarkList.length == 0){
                        layers.toast('暂无备注');
                        return false;
                    }
                    layers.open({
                        btn: null,
                        title: '编辑备注',
                        area: ['604px', 'auto'],
                        content: remarkEdit,
                        success: function (layero, index) {
                            var $layero = $(layero);
                            var addedId = [];
                            $layero.find('.tag-group').html(template('addRemark', {
                                data: vm.remarkList,
                                datas: vm.gainRemarkList
                            }));
                            //$layero.find('.remark-tip span').text(vm.checkedIdArr.length);
                            $layero.on('click', '.list-item', function (e) {
                                $(e.target).toggleClass('active');
                                var remarkId = $(e.target).data('id');
                                // 有则删除, 无则添加
                                if (addedId.indexOf(remarkId) === -1) {
                                    addedId.push(remarkId);
                                } else {
                                    addedId.forEach(function (item, index) {
                                        item === remarkId && addedId.splice(index, 1);
                                    });
                                }
                            });
                            $layero.find('.un-checkall-btn').click(function () {
                                addedId = [];
                                $('.list-item').each(function () {
                                    $(this).removeClass('active');
                                });
                            });
                            $layero.find('.checkall-btn').click(function () {
                                vm.remarkList.forEach(function (item) {
                                    addedId.push(item.id);
                                });
                                $('.list-item').each(function () {
                                    $(this).addClass('active');
                                });
                            });
                            $layero.find('.cancel').click(function () {
                                layers.closed(index);
                            });
                            $layero.find('.ok').click(function () {
                                if (addedId.length == 0) {
                                    layers.closed(index);
                                    return false;
                                }
                                tools.ajax({
                                    url: ajaxurl.customer.addRemark,
                                    data: {
                                        mark_id: addedId.join(','),
                                        customer_id: vm.viewInfo.customer_id // 用户id
                                    },
                                    success: function (res) {
                                        if (res.code === 1) {
                                            layers.toast('添加成功！');
                                            layers.closed(index);

                                        } else {
                                            layers.toast(res.message);
                                        }
                                    }
                                });
                            });
                            // 删除合作情况备注
                            $layero.on("click", '.remark-del', function () {
                                // 获取备注id
                                var mark_id = $(this).parent("li").attr('data-id');
                                // 删除当前备注
                                $(this).parent("li").remove();
                                var urls = tools.getUrlArgs(),
                                    customerId = '';
                                if (urls.has) {
                                    customerId = urls.data.customer_id;
                                }
                                // 发送请求
                                tools.ajax({
                                    url: ajaxurl.customer.delRemark,
                                    data: {
                                        mark_id: mark_id,
                                        customer_id: vm.viewInfo.customer_id // 用户id
                                    },
                                    success: function (res) {
                                        if (res.code === 1) {
                                            layers.toast('删除成功！');
                                        } else {
                                            layers.toast(res.message);
                                        }
                                    }
                                });
                            });
                        }
                    });
                })
            })
        },
    };
    //实例化VUE
    var vm = new Vue({
        el: "#app",
        data: {
            userinfo: common.getUserInfo(), //获取员工信息
            complaint_id:'',//连接上获取的参数
            viewInfo:'',//信息展示
            DetailsInfo:{//信息编辑
                id: '',
                name: '',
                mobileArr:[], 
                type: 1,
                Info:'',
                time:'',
                images:[],
            },
            showLog:true,
            handleInfo:'',
            gainRemarkList: '', // 当前档案备注
            remarkList:'',// 备注列表
            noall:'',//判断是否是全部列表点进来的 1 不是  0是
        },
        methods: {
             //点击编辑显示隐藏
            checkBox:function(){
                vm.showLog = !vm.showLog;
                home.gainDetails();
            },
            //重置表单
            cancelAdd:function(){
                vm.DetailsInfo.images = [];
                // home.getNowTime();
            },
            //增加号码
            addMobile: function(){ //增加输入电话号码框
                var len = this.DetailsInfo.mobileArr.length;
                if(len < 2){
                    this.DetailsInfo.mobileArr.push({mobile:''});
                }else{
                    layers.toast('只能添加两个联系方式！', {
                        icon: 2,
                        anim: 6
                    });
                    return;
                }
            },
             //删除号码
            removeMobile: function(index){ //删除输入电话号码框
                if(index != undefined){
                    this.DetailsInfo.mobileArr.splice(index, 1);
                }
            },
            //验证手机号
            checkmobile: function(event,index){
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
            //投诉处理表单
            Handlepop:function(){
                home.HandlePop();
            },
            remarkEdit: function(){
                home.remarkEdit();
            },
            //删除图片
            delFollowImage:function(index, image, thumb_image){
                this.DetailsInfo.images.splice(index,1);
            },
        }
    });
    //初始化
    var _init = function() {
        home.createForm();
        home.getUrlArgs();
        common.getTabLink();
        home.uploadImg();
        home.getNowTime();
        home.gainDetails();
        home.HandleInfo();
        home.lightboxInit();
        home.lightboxs();
    };
    
    _init();
});
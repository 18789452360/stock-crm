require(['common', 'layui', 'text!/assets/popup/opr-tip.html', 'layers', 'tools', 'ajaxurl'], function (common, layui, oprTip, layers, tools, ajaxurl) {

    var main = {
        /**
         * 初始化 Layui 表格
         */
        createForm: function () {
            var that = this;
            layui.use(['form'], function () {
                var form = layui.form;
                form.on('radio(channel)',function(data){
                    var title = $.trim($(data.elem).prop('title'))
                    if(title == '其他' || title == '其它'){
                        vm.showChannel = true;
                    }else{
                        vm.showChannel = false;
                    }
                    vm.addObject.channel = data.value;
                });
                form.on('radio(sex)',function(data){
                    vm.addObject.sex = data.value;
                });
                //自定义验证规则
                form.verify({
                    search: function(value){
                        if($.trim(value) == ''){
                            return '输入内容不能为空！';
                        }
                    }
                });
                //添加客户备注
                form.on('submit(formAddRemark)', function(data){
                    if($.trim(data.field.mark_name) != ''){
                        that.addRemark();
                    }
                    return false;
                });
                //添加客户分组
                form.on('submit(formAddGroup)', function(data){
                    if($.trim(data.field.name) != ''){
                        that.addGroup();
                    }
                    return false;
                });
                form.render();
            });
        },
        /**
         * [getRemarks description] 获取客户备注列表
         * @return {[type]} [description]
         */
        getRemarks:function(){
            if(vm.userinfo){
                tools.ajax({
                    url: ajaxurl.remarks.index,
                    data:{employee_id: vm.userinfo.id},
                    type: 'get',
                    success:function(result){
                        if(result.code == 1){
                            if(result.data.list != undefined){
                                var resultData = result.data.list, lens = resultData.length;
                                for(var i = 0; i < lens; i++){
                                    if(resultData[i].active == undefined){
                                        resultData[i].active = false;
                                    }
                                }
                                vm.remarks = resultData;
                            }
                        }else{
                            layers.toast(result.message);
                        }
                    }
                })
            }
        },
        /**
         * 成功添加用户 完善询问框
         */
        addUsrTip: function () {
            var resultObj = vm.addObject, temp = [], that = this;
            if(resultObj.channel == ''){
                layers.toast('请选择来源后，新增客户！');
                return;
            }
            var mobileArrLen = resultObj.mobileArr.length, flag = true;

            for(var k = 0; k < mobileArrLen; k++){
                if($.trim(resultObj.mobileArr[k].mobile) != ''){
                    flag = true;
                    break;
                }else{
                    flag = false;
                }
            }
            //如果flag返回false 表示上面的电话没有一个输入的
            if(flag == false){
                for(var i = 0; i < mobileArrLen; i++){
                    if($.trim(resultObj.mobileArr[i].mobile) == '' && $.trim(resultObj.qq.val) == '' && $.trim(resultObj.weixin.val) == ''){
                        layers.toast('请输入电话、QQ、微信号其中一个后，新增客户！');
                        flag = false;
                        break;
                    }else{
                        flag = true;
                    }
                }
            }
            //如果填写了身份证号码  就去验证
            var isIDCard = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X|x)$/;
            if($.trim(resultObj.id_card)){
                if(!isIDCard.test(resultObj.id_card)){
                    layers.toast('请输入合法的身份证号码'); return;
                }
            }

            //处理如果填了电话号码或者微信或者QQ 但是验证不通过的情况
            var addObject = vm.addObject;
            for(var k = 0; k < addObject.mobileArr.length; k++){
                if(addObject.mobileArr[k].err != ''){
                    layers.toast(addObject.mobileArr[k].err);
                    return;
                }
            }
            if(addObject.qq.err != ''){
                layers.toast(addObject.qq.err);
                return;
            }
            if(addObject.weixin.err != ''){
                layers.toast(addObject.weixin.err);
                return;
            }
            //如果存在就处理电话数据格式
            //if(mobileArrLen >= 1 && resultObj.mobileArr[0].mobile != '') {
                for(var i = 0; i < mobileArrLen; i++){
                    temp.push(resultObj.mobileArr[i].mobile);
                }
            //} 
            var datas = {
                from_channel: resultObj.channel,
                mark: resultObj.mark,
                real_name: $.trim(resultObj.real_name),
                id_card: $.trim(resultObj.id_card),
                sex: resultObj.sex,
                qq: resultObj.qq.val,
                weixin: resultObj.weixin.val,
                mobile: temp,
                customer_type: resultObj.customer_type, //客户分组
                custom_mark: resultObj.custom_mark //客户备注
            }
            //新增客户
            flag && tools.ajax({
                url: ajaxurl.customer.add,
                data: datas,
                type: 'post',
                beforeSend: function(){
                    vm.addUsrTipBtn = true;
                },
                complete:function(){
                    vm.addUsrTipBtn = false;
                },
                success: function(result){
                    if(result.code == 1){
                        //此处缺少客户ID
                        if(result.data.customer_id == undefined || result.data.customer_id == null || result.data.customer_id == ''){
                            layers.toast('缺少客户ID');
                            return false;
                        }
                        layers.confirm({
                            title: '操作提示',
                            content: oprTip,
                            btn: ['下次再说', '去完善'],
                            yes: function(){
                                common.closeTab();
                            },
                            btn2: function (index, layero) {
                                // 是否有权限编辑  /admin/customers/customer/updates
                                that.getrule('/admin/customers/customer/updates', function(rule){
                                    var jumpUrl = ''
                                    if(rule.code == 1){  
                                        jumpUrl = '/admin/customers/customer/update?type=1&status=2&customer_id='+result.data.customer_id;
                                    }else{
                                        jumpUrl = '/admin/customers/customer/update?type=1&customer_id='+result.data.customer_id;
                                    }
                                    common.jumpCloseTab(jumpUrl,'编辑客户');
                                })
                            }
                        });
                    }else{
                        layers.toast(result.message);
                    }
                }
            })
        },
        /**
         * [getrule description] 获取用户是否有编辑权限  code 1 有   code -1没有
         * @return {[type]} [description]
         */
        getrule: function(url, callback){
            if(!url){
                throw new Error('缺少url参数！');
            }
            tools.ajax({
                url: ajaxurl.BaseUrl + '/admin/auth/rule/getrule',
                data:{rule: url},
                type: 'post',
                success: function(result){
                    typeof callback === 'function' && callback.call(this, result);
                }
            })
        },
        /**
         * [checkPhone description] 验证手机号
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        checkPhone: function(value) {
            if (!value) {
                throw new Error('checkPhone参数错误！');
            }
            return /^1[3|4|5|7|8]\d{9}$/.test(value);
        },
        /**
         * [checkCustomer description] 验证客户联系方式唯一
         * @return {[type]} [description]
         */
        checkCustomer: function(type, value, index){
            if(type == undefined || value == undefined) return;
            tools.ajax({
                url: ajaxurl.customer.check,
                data:{
                    customer_id: 0,
                    contact_type: type, //  联系方式类型： 1 电话号码 2 微信号 3 QQ号
                    contact_way: value,
                    action_type: 'add'
                },
                success: function(result){
                    if(result.code != 1){
                        if(type == 1){
                            vm.addObject.mobileArr[index].err = result.message;
                        }else if (type == 2) {
                            vm.addObject.weixin.err = result.message;
                        }else if (type == 3) {
                            vm.addObject.qq.err = result.message;
                        }
                    }else{
                        if(type == 1){
                            vm.addObject.mobileArr[index].err = '';
                        }else if (type == 2) {
                            vm.addObject.weixin.err = '';
                        }else if (type == 3) {
                            vm.addObject.qq.err = '';
                        }
                    }
                }
            })
        },
        /**
         * [getSetting description] 获取全局配置项
         * @return {[type]} [description]
         */
        getSetting:function(){
            tools.ajax({
                url: ajaxurl.setting.index,
                data:{},
                success: function(result){
                    if(result.code == 1){
                        vm.channelSource = result.data.customer_from_channel;
                        main.createForm();
                    }
                }
            })
        },
        /**
         * [addRemark description] 添加备注
         */
        addRemark:function(){
            tools.ajax({
                url: ajaxurl.remarks.add,
                data:{mark_name: vm.addRemarkVal, employee_id: vm.userinfo.id},
                type: 'post',
                success: function(result){
                    if(result.code == 1){
                        layers.toast('添加成功');
                        if(result.data.active == undefined){
                            result.data.active = false;
                        }
                        vm.remarks.push(result.data);
                        vm.addRemarkVal = '';
                        vm.addRemarkShow = false;
                    }else{
                        vm.tipsRemarkWord = result.message
                    }
                }
            });
            return false;
        },
        /**
         * [getGroupList description] 获取员工自定义客户分组列表
         * @return {[type]} [description]
         */
        getGroupList: function(){
            tools.ajax({
                url: ajaxurl.customer_group.getList,
                data:{},
                type: 'post',
                success: function(result){
                    if(result.code == 1){
                        var res = result.data, reslens = res.length;
                        if(reslens){
                            for(var i = 0; i < reslens; i++){
                                if(res[i].active == undefined){
                                    res[i].active = false;
                                }
                            }
                            vm.groups = res;
                        }
                    }
                }
            })
        },
        /**
         * [addGroup description] 员工新增自定义客户分组
         */
        addGroup: function(){
            tools.ajax({
                url: ajaxurl.customer_group.add,
                type:'post',
                data:{name: vm.addGroupVal},
                success: function(result){
                    if(result.code == 1){
                        layers.toast('添加成功');
                        if(result.data.active == undefined){
                            result.data.active = false;
                        }
                        vm.groups.push(result.data);
                        vm.addGroupVal = '';
                        vm.addGroupShow = false;
                    }else{
                        layers.toast(result.message);
                    }
                }
            })
        },
        /**
         * [getUrlData description] 获取url参数
         * @return {[type]} [description]
         */
        getUrlData: function(){
            var urls = tools.getUrlArgs();
            if(urls.has){
                if(urls.data.usertell != undefined){
                    vm.addObject.mobileArr[0].mobile = urls.data.usertell;
                }
            }
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            remarks: [], //客户备注列表
            groups:[], //客户分组列表
            userinfo: common.getUserInfo(),
            channelSource: {}, //全局获取来源
            addObject:{
                real_name: '', //真实姓名
                sex: '', //性别
                mobileArr:[{err:'',mobile:''}], //添加电话号码的集合
                qq:{val:'',err:''}, //QQ
                id_card: '', //身份证
                weixin: {val:'',err:''}, //微信
                channel: '', //客户来源
                mark: '', //客户来源 3.其他
                custom_mark: [], //客户备注id ['1','2']
                customer_type: '' //客户分组，系统和自定义表中的ID
            },
            showChannel: false,
            addRemarkShow: false, //客户备注是否显示
            addRemarkVal: '', //客户备注添加的value
            tipsRemarkWord: '', //客户备注的错误提示
            addGroupShow: false, //客户分组是否显示
            addGroupVal: '', //客户分组添加的value
            tipsGroupWord: '', //客户分组的错误提示
            addUsrTipBtn: false
        },
        methods: {
            // 完善用户信息询问框
            addUsrTip: function () {
                var $inputs = $('.usr-info').find('input');
                $inputs.each(function(){
                    $(this).blur();
                });
                setTimeout(function(){
                    main.addUsrTip();
                },500);
            },
            cancelAdd:function(){
                common.closeTab();
            },
            addMobile: function(){ //增加输入电话号码框
                this.addObject.mobileArr.push({err:''});
            },
            removeMobile: function(index){ //删除输入电话号码框
                if(index != undefined){
                    this.addObject.mobileArr.splice(index, 1);
                }
            },
            checkCustomer:function(event, type, val, index){//验证手机号码 QQ 微信 是否唯一
                
                if(type == 1){ //手机号
                    if(!/^[\d]{0,30}$/.test(val)){
                        this.addObject.mobileArr[index].err = '请输入正确的电话号码';
                        return;
                    }else{
                        this.addObject.mobileArr[index].err = '';
                    }
                }else if (type == 2) { //微信号
                    if(!/^[a-zA-Z\d_]{0,30}$/.test(val)){
                        this.addObject.weixin.err = '请输入正确的微信号码';
                        return;
                    }else{
                        this.addObject.weixin.err = '';
                    }
                }else if (type == 3) { //QQ号
                    if(!/^[\d]{0,30}$/.test(val)){
                        this.addObject.qq.err = '请输入正确的QQ号码';
                        return;
                    }else{
                        this.addObject.qq.err = '';
                    }
                }
                if($.trim(val) != ''){
                   main.checkCustomer(type, val, index);
                }
            },
            choiceRemark: function(index, id){ //选择客户备注
                if(index == undefined || id == undefined){
                    throw new Error('缺少参数')
                }
                this.remarks[index].active = !this.remarks[index].active;
                if(this.remarks[index].active){
                    this.addObject.custom_mark.push(id);
                }else{
                    var indexs = $.inArray(id, this.addObject.custom_mark);
                    this.addObject.custom_mark.splice(indexs, 1);
                }
            },
            choiceGroup:function(index, id){ //选择客户分组
                if(index == undefined || id == undefined){
                    throw new Error('缺少参数')
                }
                var lens = this.groups.length;
                for(var i = 0; i < lens; i++){
                    this.groups[i].active = false;
                    if(i == index){
                        this.groups[i].active = true;
                    }
                }
                this.addObject.customer_type = id;
            }
        },
        watch:{
            addRemarkShow: {
                handler: function(val, oldVal){
                    if(val === false){
                        this.addRemarkVal = '';
                        this.tipsRemarkWord = '';
                    }
                },
                deep: true
            },
            addGroupShow:{
                handler: function(val, oldVal){
                    if(val == false){
                        this.addGroupVal = '';
                        this.tipsGroupWord = '';
                    }
                },
                deep: true
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        common.getTabLink();
        main.getRemarks();
        main.getSetting();
        main.getGroupList();
        main.getUrlData();
    };
    _init();
});

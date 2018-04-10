require(['layui', 'common', 'layers', 'text!/assets/popup/perfect-tip.html', 'text!/assets/popup/edit-group.html', 'text!/assets/popup/add-record.html', 'text!/assets/popup/alter-serve.html', 'text!/assets/popup/associate-track.html', 'text!/assets/popup/pay-record.html', 'ajaxurl', 'tools', 'upload', 'lightbox', 'template', 'page', 'text!/assets/popup/remark-edit.html','Base64'], function (layui, common, layers, perfect, editGroup, addRecord, alterServe, track, payRecord, ajaxurl, tool, upload, lightbox, template, page, remarkEdit,Base64) {
    //修改template模板界定符
    template.config('openTag', '{%');
    template.config('closeTag', '%}');
    var main = {
        form: null,
        followBtnFlag: true,
        /**
         * [globalSet description]获取全局配置
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        globalSet:function(callback){
            tool.ajax({
                url: ajaxurl.setting.index,
                data: {
                    type: 1
                },
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        vm.global_set = data.data
                        var obj = {online:[],line:[]};
                        //把所有的线上产品push到一个数组中去
                        if(vm.global_set.online_consulting_plan && vm.global_set.online_consulting_plan.length){
                            var onlineLen = vm.global_set.online_consulting_plan.length;
                            for(var i = 0;i<onlineLen;i++){
                                for(var j = 0;j<vm.global_set.online_consulting_plan[i].child.length;j++){
                                    obj.online.push(vm.global_set.online_consulting_plan[i].child[j]);
                                }
                            }
                        }
                        //重新组装线下产品数据
                        if(vm.global_set.line_investment_plan && vm.global_set.line_investment_plan.length){
                            var line = vm.global_set.line_investment_plan,
                                linLen = line.length;
                            for(var i = 0;i<linLen;i++){
                                var temp = {sid:'',sname:'',scode:''};
                                temp.sid = line[i].id;
                                temp.sname = line[i].product_name;
                                temp.scode = line[i].product_code;
                                obj.line.push(temp);
                            }
                        }
                        //线下产品
                        vm.global_product = JSON.stringify(obj);
                        vm.customer_from_channel = data.data.customer_from_channel;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                },
                error: function (err) {
                    layers.toast('网络异常!');
                }
            })
        },
        /**
         * 获取当前操作人的数据权限,列表中有这个字段，表示该员工没有这个字段权限
         */
        getDataAuth:function(callback){
            tool.ajax({
                url:ajaxurl.setting.getDataAuth,
                type:'get',
                success:function(data){
                    if(data.code == 1){
                        vm.dataAuth = data.data.noHas_auth;
                        vm.coopAuth = data.data.coop;//合作情况能否有权限被编辑的标识
                        typeof callback === 'function' && callback.call(this);
                    }else{
                        layers.toast(data.message);
                    }
                },
                error: function () {
                    layers.toast('网络异常!');
                }
            })
        },
        /**
         * [tabSwitch description] 监听layui-tab切换
         * @return {[type]} [description]
         */
        tabSwitch:function(){
            layui.use('element', function () {//注册layui-element
                var element = layui.element,
                    urls = vm.getUrls;//获取URL地址
                if(urls.has){
                    var type = urls.data.type; //当url有type的时候
                    switch (type) {
                        case '1':
                            vm.tabs.basic = true;
                            break;
                        case '2':
                            vm.tabs.follow = true;
                            break;
                        case '3':
                            vm.tabs.cooperation = true;
                            break;
                    };
                    element.on('tab(client-tabs)', function () {//点击tab切换
                        if(this.getAttribute('lay-id') == 1){
                            if (!vm.tabs.basic) {
                                vm.tabs.basic = true;
                                main.getClinetInfo();
                            }
                        }
                        if(this.getAttribute('lay-id') == 2){
                            if (!vm.tabs.follow) {
                                vm.tabs.follow = true;
                                main.getFollowType();
                                main.filterFollow();
                                main.lightboxInit();
                                main.followUp();
                            }
                        }
                        if(this.getAttribute('lay-id') == 3){
                            if (!vm.tabs.cooperation) {
                                vm.tabs.cooperation = true;
                                main.getCooperationList();
                            }
                        }
                    })
                }
            })
        },
        /**
         * [getUrlData description]根据URL设置显示的模块
         * @return {[type]} [description]
         */
        getUrlData:function(){
            var urls = vm.getUrls;
            if(urls.has){
                if (urls.data.customer_id != '' && urls.data.customer_id != undefined) { //缺少客户id
                    main.getFileHead(); //获取档案头部信息
                    layui.use('element', function () {//设置tab选项选中的位置与该调取的函数
                        var element = layui.element;
                        if (urls.data.type) {
                            element.tabChange('client-tabs', urls.data.type);
                        }
                        if(!urls.data.type || urls.data.type == 1){//基本信息页面
                            main.getClinetInfo();
                            vm.tabs.basic = true;
                            if (urls.data.status == 2) { //处于编辑状态
                                vm.editBasic = true;
                            }
                        }else{
                            if(urls.data.type == 2){//跟进信息页面
                                vm.tabs.follow = true;
                                vm.isfollowBack = true;
                                main.getFollowType();
                                main.filterFollow();
                                main.lightboxInit();
                                main.followUp();
                            }
                            if(urls.data.type == 3){//合作情况页面
                                vm.tabs.cooperation = true;
                                if(urls.data.status == undefined || urls.data.status == ''){//查看合作情况列表
                                    main.getCooperationList();
                                }else{//查看编辑合作情况
                                    main.setCooperData();
                                }
                            }
                        }
                    })
                }else{
                    layers.toast('缺少客户id参数');
                    return false;
                }
            }else{
                layers.toast('缺少客户id参数');
                return false;
            }
        },
        /**
         * [getFileHead description] 获取档案头部信息
         * @return {[type]} [description]
         */
        getFileHead:function(render){
            var loading = '';
            vm.customer_id = tool.getUrlArgs().data.customer_id;
            tool.ajax({
                url: ajaxurl.customer.getInfo,
                data: {
                    customer_id: vm.customer_id
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success: function (data) {
                    if (data.code == 1) {
                        vm.headInfo = data.data;
                        vm.customer_from_channel_text = data.data.from_channel == '******' ? data.data.from_channel : vm.customer_from_channel[data.data.from_channel];
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                        vm.permission = false;
                    }
                    render && main.form.render();
                },
                error: function (err) {
                    layers.toast('网络异常!');
                },
                complete:function(){
                    setTimeout(function(){
                        layers.closed(loading);
                    },200)
                },
            });
            tool.ajax({ //获取客户档案标签
                url: ajaxurl.tag.guest,
                data: {
                    customer_id: vm.customer_id
                },
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        vm.client_guest = data.data.list;
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                },
                error: function (err) {
                    layers.toast('网络异常!');
                }
            })
        },
        /**
         * [delImage description] 删除图片
         * @param  {[type]}   image       [description]
         * @param  {[type]}   thumb_image [description]
         * @param  {Function} callback    [description]
         * @return {[type]}               [description]
         */
        delImage: function (image, thumb_image, callback) {
            if (!image && !thumb_image) {
                throw new Error('缺少图片路径！');
            }
            var src = image + ',' + thumb_image,
                loadIndex = '';
            tool.ajax({
                url: ajaxurl.upload.deleteOssFile,
                data: {
                    delete_file_path: src
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (index) {
                        loadIndex = index;
                    })
                },
                success: function (result) {
                    if (result.code == 1) {
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(result.message);
                    }
                },
                complete: function () {
                    if (loadIndex != undefined) {
                        layers.closed(loadIndex);
                    }
                }
            })
        },
        /**
         *  删除语音
         */
        delVioce: function (url, callback) {
            if (!url) {
                throw new Error('缺少语音路径！');
            }
            var loadIndex = '';
            tool.ajax({
                url: ajaxurl.upload.deleteOssFile,
                data: {
                    delete_file_path: url,
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (index) {
                        loadIndex = index;
                    })
                },
                success: function (result) {
                    if (result.code == 1) {
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(result.message);
                    }
                },
                complete: function () {
                    if (loadIndex != undefined) {
                        layers.closed(loadIndex);
                    }
                }
            })
        },
        /**
         * 获取客户已存在的分组
         */
        getCustomerGroup: function (callback) {
            var loading = '';
            tool.ajax({
                url: ajaxurl.customer.getCustomerGroup,
                data: {
                    customerId: vm.customer_id,
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success: function (data) {
                    if (data.code == 1) {
                        vm.clientList = data.data;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                },
                error: function () {
                    layers.toast('网络异常');
                },
                complete:function(){
                    setTimeout(function(){
                        layers.closed(loading);
                    },200)
                },
            })
        },
        /**
         * 获取员工分组列表
         */
        gropList: function (callback) {
            main.getCustomerGroup(function () {
                tool.ajax({
                    url: ajaxurl.customer_group.getList,
                    type: 'post',
                    success: function (data) {
                        if (data.code == 1) {
                            vm.groupList = data.data;
                            typeof callback === 'function' && callback.call(this);
                        } else {
                            layers.toast(data.message, {
                                icon: 2,
                                anim: 6
                            });
                        }
                    },
                    error: function () {
                        layers.toast('网络异常');
                    }
                })
            });
        },
        /**
         * 编辑客户分组弹框
         */
        editGroup: function () {
            main.gropList(function () {
                if (vm.groupList.length) {
                    layers.open({
                        btn: null,
                        title: '编辑分组',
                        area: ['604px', '373px'],
                        content: editGroup,
                        success: function (layero, index) {
                            var $layero = $(layero);
                            $layero.find('#selectOptionBox').html(template('selectOptions', {
                                data: vm.groupList
                            }));
                            if (vm.clientList && vm.clientList.length) {
                                var html = '';
                                for (var i = 0; i < vm.clientList.length; i++) {
                                    html += "<span>" + vm.clientList[i] + " ; </span>";
                                }
                                $layero.find('.client-group-list').append(html);
                            }
                            var id = '';
                            layui.use('form', function () {
                                var form = layui.form;
                                form.on('select(group)', function (data) {
                                    id = data.value;
                                });
                                form.render();
                            })
                            // 取消
                            $layero.find('.cancel').click(function () {
                                layers.closed(index);
                            });
                            // 确定
                            $layero.find('.ok').click(function () {
                                if (id) {
                                    tool.ajax({
                                        url: ajaxurl.customer.moveGroup,
                                        data: {
                                            customerIds: '[' + vm.customer_id + ']', // 客户id
                                            customGroupId: id // 分组 id
                                        },
                                        success: function (res) {
                                            if (res.code === 1) {
                                                layers.toast('移动分组成功');
                                            } else {
                                                layers.toast(res.message);
                                            }
                                        },
                                        error: function () {
                                            layers.toast('网络异常');
                                        }
                                    });
                                } else {
                                    layers.toast('未选择任何分组');
                                    return false;
                                }
                                layers.closed(index);
                            });
                        }
                    });
                } else {
                    layers.toast('您没有添加任何客户分组，无法移动分组，请先去添加客户分组！');
                }
            })
        },
        /**
         * 获取客户备注列表
         */
        getTagMark: function (callback) {
            tool.ajax({
                url: ajaxurl.customer.getListTagMark,
                data: {},
                success: function (res) {
                    if (res.code === 1) {
                        // 备注 && 标签
                        vm.remarkList = res.data.marklist;
                        vm.tagList = res.data.taglist;
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
            var urls = tool.getUrlArgs(),
                customerId = '';
            if (urls.has) {
                customerId = urls.data.customer_id;
            }
            var loading = '';
            tool.ajax({
                url: ajaxurl.customer.gainRemark,
                data: {
                    customer_id: customerId // 用户id
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
            main.getTagMark(function () {
                main.getTagMarkBefore(function () {
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
                                // 获取id
                                var urls = tool.getUrlArgs(),
                                    customerId = '';
                                if (urls.has) {
                                    customerId = urls.data.customer_id;
                                }
                                if (addedId.length == 0) {
                                    layers.closed(index);
                                    return false;
                                }
                                tool.ajax({
                                    url: ajaxurl.customer.addRemark,
                                    data: {
                                        mark_id: addedId.join(','),
                                        customer_id: customerId // 用户id
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
                                var urls = tool.getUrlArgs(),
                                    customerId = '';
                                if (urls.has) {
                                    customerId = urls.data.customer_id;
                                }
                                // 发送请求
                                tool.ajax({
                                    url: ajaxurl.customer.delRemark,
                                    data: {
                                        mark_id: mark_id,
                                        customer_id: customerId // 用户id
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
        /**
         * 初始化layui表单，时间
         */
        initLayui: function () {
            var that = this;
            layui.use(['form', 'laydate'], function () {
                main.laydate = layui.laydate;
                main.form = layui.form;
                var form = layui.form;
                form.verify({
                    username: function (value, item) { //value：表单的值、item：表单的DOM对象
                        if (!value) {
                            return '姓名不能为空'
                        }
                    },
                    required: function (value, item) {
                        if (!value) {
                            return '必填项不能为空'
                        }
                    },
                    current_position:function(value,item){//当前仓位
                        if(value){
                            if(isNaN(value - 0)){
                                return '当前仓位只能是0~10的数字';
                            }
                            if(value - 0 > 10 || value - 0 < 0){
                                return '当前仓位只能是大于0小于10的数字';
                            }
                        }
                    },
                    pay_num: function (value, item) {
                        if (!value) {
                            return '请输入购买数量'
                        }
                        if(isNaN(value - 0)){
                            return '请输入大于0的正整数';
                        }
                        if(value < 1){
                            return '请输入大于0的正整数';
                        }
                        if(String(value).indexOf('.') != -1){
                            return '请输入正整数';
                        }
                    },
                    days: function (value, item) {
                        if (!value) {
                            return '请输入服务期限'
                        }
                    },
                    tradingDay:function(value,item){
                        if(value < 1 || value > 365){
                            return '交易日必须是大于1小于365的数字';
                        }
                    },
                    goods_price: function (value, item) {
                        if (!value) {
                            return '请输入商品价格'
                        }
                    },
                    pay_money: function (value, item) {
                        if (!value) {
                            return '请输入付费金额'
                        }
                    },
                    pay_time: function (value, item) {
                        if (!value) {
                            return '请输入交费日期'
                        }
                    },
                    payer: function (value, item) {
                        if (!value) {
                            return '请输入付费人'
                        }
                    },
                    pay_bank: function (value, item) {
                        if (!value) {
                            return '请输入付费银行'
                        }
                    },
                    noRequiredNum:function(value,item){
                        if(value){
                            if(isNaN(value - 0)){
                                return '请输入正确的数字'
                            }
                        }
                    }
                });
                form.on('submit(ok)', function (data) { //基本信息提交
                    var tempArr = [];
                    for (var i in data.field) { //循环push电话号码
                        if (i.indexOf('mobile[') != -1) {
                            tempArr.push(data.field[i]);
                        }
                    }
                    var flag = false;
                    for (var j = 0; j < tempArr.length; j++) {
                        if ($.trim(tempArr[j]) != '') {
                            flag = true;
                            break;
                        }
                    }
                    if (flag == false && $.trim(data.field.qq) == '' && $.trim(data.field.weixin) == '') {
                        layers.toast('请输入电话、QQ、微信号其中一个后，保存客户信息！', {
                            icon: 2,
                            anim: 6
                        });
                        return false;
                    } else {
                        flag = true;
                    }

                    //如果填写了身份证  就验证
                    if ($.trim(data.field.id_card) != '' && $.trim(data.field.id_card) != '******') {
                        var isIDCard = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X|x)$/;
                        if ($.trim(data.field.id_card).length != 18) {
                            layers.toast('身份证号码长度必须为18位', {
                                icon: 2,
                                anim: 6
                            });
                            return false;
                        }
                        //if (!isIDCard.test(data.field.id_card)) {
                        //    layers.toast('请输入正确的身份证号码！', {
                        //        icon: 2,
                        //        anim: 6
                        //    });
                        //    return false;
                        //}
                    }
                    //失去所有焦点
                    $('.basic-first-content').find('input[type="text"]').each(function () {
                        $(this).blur();
                    });
                    //延迟执行
                    setTimeout(function () {
                        flag && main.basicBtn(data.field);
                    }, 500);
                    return false;
                });
                form.on('submit(followBtn)', function (data) { //跟进信息提交
                    that.followBtnFlag && that.submitFollow(data.field);
                    return false;
                });
                form.on('submit(cooprationBtn)', function (data) { //合作信息信息提交
                    main.cooperTionBtn();
                    return false;
                });
            });
        },
        //----------------------------------------------------------------基本信息--------------------------------------------------//
        /**
         * [getClinetInfo description]获取档案详细信息
         * @return {[type]} [description]
         */
        getClinetInfo:function(){
            var that = this;
            var loading = '';
            if (vm.customer_id) {
                tool.ajax({
                    url: ajaxurl.customer.getDetail,
                    data: {
                        customer_id: vm.customer_id
                    },
                    type: 'post',
                    beforeSend: function () {
                        layers.load(function (indexs) {
                            loading = indexs;
                        });
                    },
                    success: function (data) {
                        if (data.code == 1) {
                            vm.basicInfo = data.data; //缓存基本变量
                            if (!vm.basicInfo.mobile || !vm.basicInfo.mobile.length) {
                                vm.headInfo.mobile = [{
                                    mobile: '',
                                    is_relation: 0,
                                    contact_id: ''
                                }];
                                vm.basicInfo.mobile = [{
                                    mobile: '',
                                    is_relation: 0,
                                    contact_id: ''
                                }];
                            }
                            vm.basicInfoData = JSON.stringify(data.data);
                            vm.finance_info = data.data.finance_info;
                            vm.financeInfoData = JSON.stringify(data.data.finance_info);
                            //处理省市区三级联动
                            that.getArea('', '', true);
                            if (data.data.province != undefined && data.data.province != 0) {
                                that.getArea(data.data.province, 1, true);
                            }
                            if (data.data.city != undefined && data.data.city != 0) {
                                that.getArea(data.data.city, 2, true);
                            }

                            if (data.data.mobile.length != 0) {
                                var dataMobile = JSON.parse(JSON.stringify(data.data.mobile));
                                var newMobArr = [];
                                //var editMobile = [];
                                for (var k = 0; k < dataMobile.length; k++) {
                                    newMobArr.push({
                                        err: ''
                                    });
                                    // editMobile.push({
                                    //     contact_id:dataMobile[k].contact_id,
                                    //     is_relation:dataMobile[k].is_relation,
                                    //     mobile:dataMobile[k].mobile
                                    // });
                                }
                                //vm.editBasicMobiles = editMobile;
                                vm.checkMobile = newMobArr;
                            }
                            Vue.nextTick(function () {
                                layui.use('form', function () {
                                    var form = layui.form;
                                    form.render();
                                })
                                main.monitorCheck();
                            })
                        } else {
                            layers.toast(data.message, {
                                icon: 2,
                                anim: 6
                            });
                        }
                    },
                    error: function (err) {
                        layers.toast('网络异常!');
                    },
                    complete:function(){
                        setTimeout(function(){
                            layers.closed(loading);
                        },200)
                    },
                })
            }
        },
        /**
         * 获取省市地区
         */
        getArea: function (id, type, isrender) {
            tool.ajax({
                url: ajaxurl.customer.getArea,
                data: {
                    pid: id || 0
                },
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        //以下注释的东西会有问题 采用JQ渲染的方式
                        if (!type) {
                            vm.area.province = data.data.list;
                        }
                        if (type == 1) {
                            var html = '<option value=""></option>';
                            for (var i = 0; i < data.data.list.length; i++) {
                                if (data.data.list[i].id == vm.basicInfo.city) {
                                    html += '<option selected value="' + data.data.list[i].id + '">' + data.data.list[i].name + '</option>';
                                } else {
                                    html += '<option value="' + data.data.list[i].id + '">' + data.data.list[i].name + '</option>';
                                }
                            }
                            $('select[name="city"]').html(html);
                            $('select[name="area"]').html('');
                        }
                        if (type == 2) {
                            var str = '<option value=""></option>';
                            for (var i = 0; i < data.data.list.length; i++) {
                                if (data.data.list[i].id == vm.basicInfo.area) {
                                    str += '<option selected value="' + data.data.list[i].id + '">' + data.data.list[i].name + '</option>';
                                } else {
                                    str += '<option value="' + data.data.list[i].id + '">' + data.data.list[i].name + '</option>';
                                }
                            }
                            $('select[name="area"]').html(str);
                            //vm.area.county = data.data.list;
                        }

                        Vue.nextTick(function () {
                            main.form.render('select');
                        })
                    }else{
                        layers.toast(data.message);
                    }                },
                error: function () {
                    layers.toast('网络异常!');
                }
            })
        },
        /**
         * 监听基本信息页面单选复选框
         */
        monitorCheck: function () {
            layui.use('form', function () {
                var form = layui.form;
                form.on('radio(from_channel)', function (data) { //监听客户来源单选框
                    if (data.elem.checked && data.value == 120) {
                        $('div[data-show="from_channel"]').removeClass('layui-hide');
                    } else if (data.elem.checked && data.value != 120) {
                        $('div[data-show="from_channel"]').addClass('layui-hide');
                        $('input[name="mark"]').val('');
                    }
                });
                form.on('checkbox(income_source)', function (data) { //监听收入来源单选框
                    if (data.elem.checked && data.value == 4) {
                        $('div[data-show="showOther"]').removeClass('layui-hide');
                    } else if (data.elem.checked == false && data.value == 4) {
                        $('div[data-show="showOther"]').addClass('layui-hide');
                    }
                });
                form.on('radio(has_debt)', function (data) { //监听有无债券单选框
                    if (data.elem.checked && data.value == 1) {
                        $('div[data-show="has_debt"]').removeClass('layui-hide');
                    } else if (data.elem.checked && data.value != 1) {
                        $('div[data-show="has_debt"]').addClass('layui-hide');
                    }
                });
                form.on('radio(financial_investment_experience)', function (data) { //监听是否金融投资学习经历
                    if (data.elem.checked && data.value == 1) {
                        $('div[data-show="financial_investment_experience"]').removeClass('layui-hide');
                    } else if (data.elem.checked && data.value != 1) {
                        $('div[data-show="financial_investment_experience"]').addClass('layui-hide');
                        $('input[name="financial_investment_experience_mark"]').val('');
                    }
                });
                form.on('radio(financial_industry_certificate)', function (data) { //监听是否金融资格证书
                    if (data.elem.checked && data.value == 1) {
                        $('div[data-show="financial_industry_certificate_mark"]').removeClass('layui-hide');
                    } else if (data.elem.checked && data.value != 1) {
                        $('div[data-show="financial_industry_certificate_mark"]').addClass('layui-hide');
                        $('input[name="financial_industry_certificate_mark"]').val('');
                    }
                });
                form.on('checkbox(financial_assets)', function (data) { //监听是否金融资格证书
                    var index = data.elem.name.substring(17, 18);
                    $('input[name="financial_assets_money[' + index + ']"]').prop('disabled', !data.elem.checked)
                    //vm.finance_info.financial_assets[index].is_check = data.elem.checked;
                    if (data.elem.checked == false) {
                        $('input[name="financial_assets_money[' + index + ']"]').val('');
                    }
                });
                form.on('checkbox(portfolio_investment)', function (data) { //监听是否金融资格证书
                    var index = data.elem.name.substring(21, 22);
                    $('input[name="portfolio_investment_money[' + index + ']"]').prop('disabled', !data.elem.checked)
                    //vm.finance_info.portfolio_investment[index].is_check = data.elem.checked;
                    if (data.elem.checked == false) {
                        $('input[name="portfolio_investment_money[' + index + ']"]').val('');
                    }
                });
                form.on('select(province)', function (data) {
                    //以下注释的东西会有问题 采用JQ渲染的方式
                    main.getArea(data.value, 1);
                });
                form.on('select(city)', function (data) {
                    //以下注释的东西会有问题 采用JQ渲染的方式
                    main.getArea(data.value, 2);
                });
                form.on('select(area)', function (data) {
                    //以下注释的东西会有问题 采用JQ渲染的方式
                });

            });
        },
        /**
         * [checkAddMobile description] 用于模版生成的增加手机号码代码，手机验证
         * @return {[type]} [description]
         */
        checkAddMobile: function(){
            var $basicInfoMobile = $('#basicInfoMobile');
            //验证手机号是否唯一
            $basicInfoMobile.on('blur', 'div[data-type="addMobile"] .layui-input', function(event){
                if(event.currentTarget.className !='layui-input'){
                    return;
                }
                var mobile = $.trim(event.target.value);
                var index = event.target.name.replace('mobile','').replace('[','').replace(']','');
                if(mobile != ''){
                    main.numVerify(vm.customer_id, 1, mobile, 'update', index);
                }else{
                    $basicInfoMobile.find('.layui-input').eq(index).attr('data-err','');
                    if(vm.checkMobile[index].err){
                        vm.checkMobile[index].err = '';
                    }
                }
            });
            //删除
            $basicInfoMobile.on('click', 'div[data-type="addMobile"] .icon-shanchu', function(event){
                var index = $(this).attr('data-index');
                $(event.target).parent().siblings('.layui-input').val('');
                vm.checkMobile.splice(index,1);
                $(this).closest('div[data-type="addMobile"]').remove();
            });
        },
        /**
         * 号码验证
         * id:客户ID，
         * type:号码类型 1 电话号码 2 微信号 3 QQ号 4 身份证，
         * num：需要验证的号码，
         * action_type ：add 新增 update 编辑
         * index 验证电话号码的时候需要
         *
         */
        numVerify: function (id, type, num, action_type, index) {
            if (!num) {
                return false;
            }
            if (type == 1) {
                var $mobileBox = $('#basicInfoMobile');
                if (!/^[\d]{0,30}/.test(num)) {
                    layers.toast('请输入正确的电话号码', {
                        icon: 2,
                        anim: 6
                    });
                    $mobileBox.find('.layui-input').eq(index).attr('data-err','请输入正确的电话号码');
                    //vm.checkMobile[index].err = '请输入正确的电话号码';
                    return false;
                } else {
                    $mobileBox.find('.layui-input').eq(index).attr('data-err','');
                }
            };
            if (type == 4) {
                if (!num) {
                    var isIDCard = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X|x)$/;
                    if ($.trim(num).length != 18) {
                        layers.toast('身份证号码长度必须为18位', {
                            icon: 2,
                            anim: 6
                        });
                        return false;
                    } else {}
                    //if (!isIDCard.test(num)) {
                    //    layers.toast('请输入正确的身份证号码!', {
                    //        icon: 2,
                    //        anim: 6
                    //    });
                    //    return false;
                    //} else {}
                }
            }
            tool.ajax({
                url: ajaxurl.customer.check,
                data: {
                    customer_id: id,
                    contact_type: type,
                    contact_way: num,
                    action_type: action_type,
                },
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        //1 电话号码 2 微信号 3 QQ号
                        switch (type) {
                            case 1:
                                //vm.checkMobile[index] && vm.checkMobile[index].err ? vm.checkMobile[index].err = '' : '';
                                $mobileBox.find('.layui-input').eq(index).attr('data-err','');
                                break;
                            case 2:
                                vm.checkOnly.weixin = '';
                                break;
                            case 3:
                                vm.checkOnly.qq = '';
                                break;
                        }
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                        switch (type) {
                            case 1:
                                //vm.checkMobile[index].err = data.message;
                                $mobileBox.find('.layui-input').eq(index).attr('data-err',data.message);
                                break;
                            case 2:
                                vm.checkOnly.weixin = data.message;
                                break;
                            case 3:
                                vm.checkOnly.qq = data.message;
                                break;
                        }
                        return false;
                    }
                },
                error: function (err) {
                    layers.toast('网络异常!');
                }
            })
        },
        /**
         * 编辑基本信息提交
         */
        basicBtn: function (obj) {
            var urls = tool.getUrlArgs();
            obj.customer_id = vm.customer_id; //拼接customer_id
            var flag = true;
            if (vm.checkOnly.weixin != '') {
                layers.toast(vm.checkOnly.weixin, {
                    icon: 2,
                    anim: 6
                });
                return;
            }
            if (vm.checkOnly.qq != '') {
                layers.toast(vm.checkOnly.qq, {
                    icon: 2,
                    anim: 6
                });
                return;
            }
            //获取页面上的电话输入框，看是否有重复的电话号码
            var mobileInput = $('#basicInfoMobile').find('input[name^="mobile["]');
            mobileInput.each(function(){
                if($(this).val().trim() !=''){
                    if($(this).attr('data-err') !=''){
                        layers.toast($(this).attr('data-err'),{
                            icon: 2,
                            anim: 6
                        });
                        flag = false;
                        return false;
                    }
                }
            });
            if(flag){
                var arr = [];
                $.each(mobileInput,function(value,index){
                    if($(this).val().trim() !='' && $(this).val().indexOf('*') == -1){
                        arr.push($(this).val())
                    }
                });
                var nArr = arr.sort();
                for(var i = 0;i<arr.length;i++){
                    if(arr[i]!= '' && arr[i] == nArr[i + 1]){
                        flag = false;
                        layers.toast('电话号码不能重复', {
                            icon: 2,
                            anim: 6
                        });
                        return false;
                    }
                };
            }
            var loadIndex = '';
            setTimeout(function(){
                flag && tool.ajax({
                    url: ajaxurl.customer.update,
                    data: obj,
                    type: "post",
                    beforeSend: function () {
                        vm.basicBtnDisabled = true;
                        layers.load(function(lindex){
                            loadIndex = lindex;
                        })
                    },
                    success: function (data) {
                        if (data.code == 1) {
                            setTimeout(function () {
                                vm.editBasic = false;
                                //如果是新增客户有权限编辑的跳转过来的  编辑成功以后需要重新处理一下url地址
                                if (urls.has && urls.data.type == 1 && urls.data.status == 2) {
                                    var jumpUrl = '/admin/customers/customer/update?type=1&customer_id=' + urls.data.customer_id;
                                    common.getTabLinkWithJS({
                                        name:'基本信息',
                                        url:jumpUrl,
                                        close:true,
                                    });
                                } else {
                                    main.getClinetInfo();
                                    main.getFileHead(true);
                                }
                            }, 1000);
                            layers.toast('提交成功');
                        } else {
                            layers.toast(data.message, {
                                icon: 2,
                                anim: 6
                            });
                        }
                    },
                    complete: function () {
                        layers.closed(loadIndex);
                        var $basicInfoMobile = $('#basicInfoMobile');
                        $basicInfoMobile.find('div[data-type="addMobile"]').remove();
                        setTimeout(function () {
                            vm.basicBtnDisabled = false;
                        }, 300);
                    },
                    error: function (err) {
                        layers.toast('网络异常!');
                    }
                });
            },200)
        },
        //----------------------------------------------------------------跟进信息--------------------------------------------------//
        /**
         * 获取员工的跟进信息类型权限
         */
        getFollowType:function(callback){
            var loading = '';
            tool.ajax({
                url:ajaxurl.cooper.follow_type,
                type:'get',
                beforeSend: function () {
                    layers.load(function(lindex){
                        loading = lindex;
                    })
                },
                success:function (data) {
                    if(data.code == 1){
                        vm.follow_up_type = data.data.list;
                        main.resetFollow();
                        typeof callback === 'function' && callback.call(this);
                    }else{
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                },
                error:function(){
                    layers.toast('网络异常!');
                },
                complete:function(){
                    setTimeout(function(){
                        layers.closed(loading);
                    },200)
                },
            })
        },
        /**
         * 初始化筛选跟进信息条件时间选项
         */
        filterFollow: function () {
            Vue.nextTick(function(){
                setTimeout(function(){
                    main.laydate.render({
                        elem: '#follow_start',
                        type: 'datetime',
                        done: function (value, date) {
                            vm.filterFollow.start_time = value;
                        }
                    });
                    main.laydate.render({
                        elem: '#follow_end',
                        type: 'datetime',
                        done: function (value, date) {
                            vm.filterFollow.end_time = value;
                        }
                    })
                },200)
            })
        },
        /**
         * 初始化筛选跟进信息条件
         */
        resetFollow: function () {
            if(!vm.follow_up_type.length){//没有跟进类型权限
                return;
            }
            var filterFollow = {
                customer_id: vm.customer_id,
                type: vm.follow_up_type[0].id, //跟进信息类型 默认为1 销售信息
                operate_real_name: '',
                goods_name: '',
                start_time: '',
                end_time: '',
                followup_content: '', //跟进类型类型 默认为文字
                pagesize: 10, //默认展示条数
                curpage: 1
            };
            vm.filterFollow = filterFollow;
            vm.followup_content = [];
            vm.fContent = [
                {
                    name: '文字',
                    type: '1',
                    active: false
                },
                {
                    name: '图片',
                    type: '2',
                    active: false
                },
                {
                    name: '语音',
                    type: '3',
                    active: false
                },
            ];
            $('#follow_start').val('');
            $('#follow_end').val('');
            main.getFollowInfo();
        },
        /**
         * 多选与取消跟进信息内容：是否包含图片、文字、语音
         */
        followContent: function (index) {
            vm.fContent[index].active = !vm.fContent[index].active;
            var i = vm.fContent[index].type;
            if ($.inArray(i, vm.followup_content) == -1) {
                vm.followup_content.push(i);
            } else {
                vm.followup_content.splice(vm.followup_content.indexOf(i), 1)
            }
        },
        /**
         * [getFollowInfo description] 获取跟进信息列表
         * @return {[type]}         [description]
         */
        getFollowInfo: function () {
            vm.filterFollow.followup_content = vm.followup_content.join();
            if(vm.filterFollow.start_time && !vm.filterFollow.end_time){
                layers.toast('请选择结束时间!');
                return;
            }
            if(!vm.filterFollow.start_time && vm.filterFollow.end_time){
                layers.toast('请选择开始时间!');
                return;
            }
            if(vm.filterFollow.start_time > vm.filterFollow.end_time){
                layers.toast('开始时间不能大于结束时间！');
                return;
            }
            var that = this;
            tool.ajax({
                url: ajaxurl.cooper.index,
                data: vm.filterFollow,
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        vm.followInfo = data.data;
                        that.followLight();
                        that.followPage();
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                },
                error: function (err) {
                    layers.toast('网络异常!');
                }
            })
        },
        /**
         * 分页获取跟进信息列表
         */
        followPage: function () {
            Vue.nextTick(function(){
                layui.use(['laypage'], function () {
                    var laypage = layui.laypage;
                    laypage.render({
                        elem: 'follow-page',
                        count: vm.followInfo.all_num, //数据总数
                        limit: 10, //每页显示条数
                        curr: vm.filterFollow.curpage, //当前页数
                        jump: function (obj, first) {
                            if (!first) {
                                vm.filterFollow.curpage = obj.curr;
                                main.getFollowInfo();
                            }
                        }
                    });
                })
            })
        },
        /**
         * 删除某条跟进信息
         */
        del_item_Follow: function (id, index) {
            if (id) {
                layers.confirm({
                    content: '<div class="confirm-tips"><p>删除后，本条跟进信息将不存在，确定删除？</p></div>',
                    btn2: function (layindex, layero) {
                        tool.ajax({
                            url: ajaxurl.cooper.del,
                            data: {
                                followup_id: id
                            },
                            type: 'post',
                            success: function (data) {
                                if (data.code == 1) {
                                    vm.followInfo.list.splice(index, 1);
                                    layers.closedAll();
                                } else {
                                    layers.toast(data.message);
                                    layers.closed(layindex);
                                }
                            },
                            error: function (err) {
                                layers.toast('网络异常!');
                            }
                        })
                        return false;
                    }
                })
            }
        },
        /**
         * 编辑,获取某条跟进记录信息
         */
        edit_item_Follow: function (id) {
            vm.followup_id = id;
            if (id) {
                var loading = '';
                tool.ajax({
                    url: ajaxurl.cooper.getEdit,
                    data: {
                        followup_id: id
                    },
                    type: 'post',
                    beforeSend: function () {
                        layers.load(function(lindex){
                            loading = lindex;
                        })
                    },
                    success: function (data) {
                        if (data.code == 1) {
                            vm.follow_product = JSON.parse(vm.global_product);
                            vm.editFollow = true;
                            vm.isEditAdd = true; //编辑跟进信息表示
                            var datas = data.data;
                            var onlineLens = vm.follow_product.online.length, //线上产品
                                lineLens = vm.follow_product.line.length, //线下产品
                                followTypeLens = vm.follow_up_type.length, //跟进类型
                                $editFollow = $('.edit-follow');

                            //线下产品
                            if(datas.offline_product_id && datas.offline_product_id.length){//跟进信息中有线下产品才执行
                                var lineArr = [],
                                    lineProductName = datas.offline_product_name.split(',');
                                for(var i = 0;i<datas.offline_product_id.length;i++){//返回来的线下产品进行数据重组
                                    lineArr.push({sid:datas.offline_product_id[i],sname:lineProductName[i]})
                                }
                                if(!lineLens){//当全局配置线下产品为空的时候
                                    if(!vm.follow_product.line instanceof Array){
                                        vm.follow_product.line = [];
                                    }
                                    vm.follow_product.line = lineArr;
                                }else{//当全局线下有产品时，循环遍历进行比对。把没有的sid该条数据push进去
                                    var lens = lineArr.length;
                                    for(var i = 0;i<lens;i++){
                                        var flag = false;
                                        for(var j = 0;j < vm.follow_product.line.length;j++){
                                            if(lineArr[i].sid == vm.follow_product.line[j].sid){
                                                flag = true;
                                                break;
                                            }
                                        }
                                        if(!flag){
                                            vm.follow_product.line.push(lineArr[i]);
                                        }
                                    }
                                }
                                //让返回过来的线下产品设为选中状态
                                Vue.nextTick(function(){
                                    var lineLens = vm.follow_product.line.length;
                                    if(lineLens){
                                        for (var i = 0; i < lineLens; i++) {
                                            for (var j = 0; j < datas.offline_product_id.length; j++) {
                                                if (vm.follow_product.line[i].sid == datas.offline_product_id[j]) {
                                                    $editFollow.find('input[name^="offline_product_id"][value="' + datas.offline_product_id[j] + '"]').trigger('click');
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                            //线上产品
                            if(datas.product_id && datas.product_id.length){
                                var product_name = datas.product_name.split(",");// 在每个逗号(,)处进行分解。
                                var obj = [];
                                for (var o = 0; o < datas.product_id.length; o++) {//由于服务包id跟name 是放在两个字段中所以进行数据重组
                                    var childObj = {};
                                    childObj.sid = datas.product_id[o];
                                    childObj.sname = product_name[o];
                                    obj.push(childObj);
                                };
                                if(!onlineLens){//当全局配置没有线上产品的时候
                                    if(!vm.follow_product.online instanceof Array){
                                        vm.follow_product.online = [];
                                    }
                                    vm.follow_product.online = obj;//全局配置中没有线上产品的服务包就将跟进信息中的默认放在第一个
                                }else{//当全局配置有产品时，但是没有该商品
                                    var len = obj.length;
                                    for(var i = 0;i<len;i++){
                                        var flag = false;
                                        for(var j = 0;j < vm.follow_product.online.length;j++){
                                            if(obj[i].sid == vm.follow_product.online[j].sid){
                                                flag = true;
                                                break;
                                            }
                                        }
                                        if(!flag){
                                            vm.follow_product.online.push(obj[i]);
                                        }
                                    }
                                }
                                //让读取过来的服务包置为选中状态
                                Vue.nextTick(function(){
                                    var onlineLens = vm.follow_product.online.length;
                                    for (var k = 0; k < onlineLens; k++) {
                                        for (var o = 0; o < datas.product_id.length; o++) {
                                            if (vm.follow_product.online[k].sid == datas.product_id[o]) {
                                                $editFollow.find('input[name^="product_id"][value="' + datas.product_id[o] + '"]').trigger('click');
                                                break;
                                            }
                                        }
                                    }
                                })
                            }
                            //比较跟进类型
                            if (datas.type != '' || datas.type != null) {
                                for (var m = 0; m < followTypeLens; m++) {
                                    if (datas.type == vm.follow_up_type[m].id) {
                                        $editFollow.find('input[name^="type"][value="' + datas.type + '"]').trigger('click');
                                        break;
                                    }
                                }
                            }
                            //以下将数据挂到vue对象上
                            vm.editFollowData = data.data;
                            setTimeout(function () {
                                layui.use('form', function () {
                                    var form = layui.form;
                                    form.render();
                                });
                                //main.followUp();
                            }, 200)
                        }else{
                            layers.toast(data.message,{
                                icon: 2,
                                anim: 6
                            });
                        }
                    },
                    error: function () {
                        layers.toast('网络异常')
                    },
                    complete:function(){
                        setTimeout(function(){
                            layers.closed(loading);
                        },200)
                    },

                })
            }
        },
        /**
         * 新增、编辑跟进信息提交
         */
        submitFollow: function (data) {
            var url = '',
                that = this;
            vm.isEditAdd ? url = ajaxurl.cooper.edit : url = ajaxurl.cooper.add; //false为新增 true 为编辑
            if (vm.isEditAdd) {
                data.followup_id = vm.followup_id;
            };
            //除掉文本域中的回车换行，否则会导致合作情况销售过程读不出来
            data.record = data.record.replace(/[\r\n]/g,"");
            data.images = vm.editFollowData.images;
            data.customer_id = vm.customer_id;
            var voiceLens = vm.editFollowData.voice_record.length,
                temp = [];
            if (voiceLens) {
                for (var i = 0; i < voiceLens; i++) {
                    temp.push(vm.editFollowData.voice_record[i].tel_id);
                }
                data.voice_record = temp.join(',');
            }
            var productName = $('#online-row').find('.layui-unselect.layui-form-checkbox.layui-form-checked span'),
                len = productName.length;
            data.product_name = '';
            var arr = [];
            if(len){
                for(var i = 0;i<len;i++){
                    arr.push(productName.eq(i).text())
                }
                data.product_name = arr.join(',');
            }
            var offlineProductName = $('#line-row').find('.layui-unselect.layui-form-checkbox.layui-form-checked span'),
                lens = offlineProductName.length,newArr = [];
            data.offline_product_name = '';
            if(lens){
                for(var j = 0;j<lens;j++){
                    newArr.push(offlineProductName.eq(j).text())
                }
                data.offline_product_name = newArr.join(',');
            }
            data.voice_records = vm.editFollowData.voice_record;
            if (data.type == '' || data.type == undefined) {
                layers.toast('请选择跟进信息类型', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            var loadIndex = '';
            tool.ajax({
                url: url,
                data: data,
                type: 'post',
                beforeSend: function () {
                    that.followBtnFlag = false;
                    layers.load(function(lindex){
                        loadIndex = lindex;
                    })
                },
                success: function (data) {
                    if (data.code == 1) {
                        if (vm.isEditAdd) { //false为新增 true 为编辑
                            layers.toast('编辑成功!');
                        } else {
                            layers.toast('新增成功!');
                        }
                        that.getFollowInfo();
                        $('.edit-follow').find('button[type="reset"]').trigger('click');
                        vm.editFollowData.voice_record = [];
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                    that.followBtnFlag = true;
                    layers.closed(loadIndex);
                },
                error: function () {
                    that.followBtnFlag = true;
                    layers.toast('网络异常!');
                    layers.closed(loadIndex);
                }
            });
            return false;
        },
        /**
         * [lightboxInit description] 初始化灯箱效果 编辑新增展示的效果
         * @return {[type]} [description]
         */
        lightboxInit: function () {
            lightbox.init('#follow-upload-list section');
        },
        /**
         * [followLight description]跟进信息灯箱 列表
         * @return {[type]} [description]
         */
        followLight: function () {
            var $follow_info = '';
            Vue.nextTick(function () {
                $follow_info = $('.follow-info-content').find('div[id^="follow_info_"]');
                if ($follow_info.length) {
                    $follow_info.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
            })
        },
        /**
         * [followUp description]跟进信息上传图片
         * @return {[type]} [description]
         */
        followUp:function(){
            if(upload){
                var loading = '';
                //跟进信息上传图片
                upload.init({
                    elem: '#follow-upload',
                    url: ajaxurl.upload.ftp_upload,
                    multiple: true,
                    field: 'fileUpload',
                    before: function () {
                        layers.load(function (indexs) {
                            loading = indexs;
                        });
                    },
                    done: function (data) {
                        if (data.code == 1) {
                            vm.editFollowData.images.push(data.data);
                        } else {
                            layers.toast(data.message);
                        }
                        layers.closed(loading);

                    },
                    error: function () {
                        layers.closed(loading);
                    }
                });
            }
        },
        /**
         * 添加录音记录弹框
         */
        addRecord: function () {
            var that = this;
            vm.recordSearch.calltime = '';
            vm.firstOpen = true;
            vm.recordSearch.filter_time = '';//初始化筛选时间
            this.getCallRecordAll('', function (html) {
                // layui弹出框
                layers.confirm({
                    title: '添加录音记录',
                    area: ['902px', '600px'],
                    content: addRecord,
                    success: function (obj, index) {
                        var $elem = $(obj),
                            $reloadRecordBox = $elem.find('#reloadRecordBox'),
                            $addfooterspan = $elem.find('.add-footer').find('span');
                        //监听form表单的提交事件
                        main.form.on('submit(searchCallRecordAll)', function (data) {
                            if (data.field.start_time && data.field.end_time == '') {
                                layers.toast('请选择结束时间！', {
                                    icon: 2,
                                    anim: 6
                                });
                                return false;
                            }
                            if (data.field.start_time == '' && data.field.end_time) {
                                layers.toast('请选择开始时间！', {
                                    icon: 2,
                                    anim: 6
                                });
                                return false;
                            }
                            if (data.field.start_time && data.field.end_time) {
                                if (data.field.start_time > data.field.end_time) {
                                    layers.toast('开始时间不能大于结束时间！', {
                                        icon: 2,
                                        anim: 6
                                    });
                                    return false;
                                }
                            }
                            var times = data.field.start_time + ',' + data.field.end_time;
                            if (times == ',') {
                                times = '';
                            }
                            vm.recordSearch.filter_time = times;
                            vm.recordSearch.calltime = data.field.calltime;
                            that.getCallRecordAll('', function (htmls) {
                                $addfooterspan.text('已选0条').data('checknum', 0);
                                $reloadRecordBox.html(htmls);
                                if (page) {
                                    page.init({
                                        elem: 'tempPages',
                                        count: vm.record_total_page,
                                        jump: function (obj, first) {
                                            if (!first) {
                                                that.getCallRecordAll(obj.curr, function (htmls) {
                                                    $reloadRecordBox.html(htmls);
                                                    init();
                                                    main.form.render();
                                                })
                                            }
                                        }
                                    })
                                }
                                main.form.render();
                            });
                            return false;
                        });

                        //重置
                        $elem.find('#resetCallRecord').on('click', function () {
                            /* vm.recordSearch.keywords = ''; */
                            vm.recordSearch.calltime = '';
                            $elem.find('input[type="text"]').each(function (index, el) {
                                $(this).val('');
                            });
                            vm.recordSearch.calltime = '';
                            $elem.find('.layui-input.layui-unselect').val('');
                            $elem.find('.layui-select-tips').click();
                            that.getCallRecordAll('', function (htmls) {
                                $addfooterspan.text('已选0条').data('checknum', 0);
                                $reloadRecordBox.html(htmls);
                                if (page) {
                                    page.init({
                                        elem: 'tempPages',
                                        count: vm.record_total_page,
                                        jump: function (obj, first) {
                                            if (!first) {
                                                that.getCallRecordAll(obj.curr, function (htmls) {
                                                    $reloadRecordBox.html(htmls);
                                                    init();
                                                    main.form.render();
                                                })
                                            }
                                        }
                                    })
                                }
                                main.form.render();
                            });
                        });

                        //全选/全不选
                        main.form.on('checkbox(checkAllCall)', function (data) {
                            if (data.elem.checked) {
                                $reloadRecordBox.find('input[name^="tellCall"]').prop('checked', true);
                                var lens = $reloadRecordBox.find('input[name^="tellCall"]').length;
                                $addfooterspan.text('已选' + lens + '条').data('checknum', lens);
                            } else {
                                $reloadRecordBox.find('input[name^="tellCall"]').prop('checked', false);
                                $addfooterspan.text('已选0条').data('checknum', 0);
                            }
                            main.form.render();
                        });

                        //监听每个复选框的选择行为
                        main.form.on('checkbox(checkCallList)', function (data) {
                            var checknum = $addfooterspan.data('checknum');
                            if (data.elem.checked) {
                                checknum++
                            } else {
                                checknum--
                            }
                            $addfooterspan.text('已选' + checknum + '条').data('checknum', checknum);
                        });

                        //load DATA
                        $reloadRecordBox.html(html);


                        //如果用户已经选择了数据  继续选择 统计当前页面选择的条数
                        var init = function () {
                            var editRecord = vm.editFollowData.voice_record;
                            if (editRecord.length) {
                                var checkedLens = $reloadRecordBox.find('input[name^="tellCall"]:checked').length;
                                $addfooterspan.text('已选' + checkedLens + '条').data('checknum', checkedLens);
                            } else {
                                $addfooterspan.text('已选0条').data('checknum', 0);
                            }
                        }
                        init();
                        //分页
                        if (page) {
                            page.init({
                                elem: 'tempPages',
                                count: vm.record_total_page,
                                jump: function (obj, first) {
                                    if (!first) {
                                        that.getCallRecordAll(obj.curr, function (htmls) {
                                            $reloadRecordBox.html(htmls);
                                            init();
                                            main.form.render();
                                        })
                                    }
                                }
                            })
                        }

                        //重新渲染弹窗框里面的form组件
                        main.form.render();
                        main.laydate.render({
                            elem: '#start_time',
                        });
                        main.laydate.render({
                            elem: '#end_time',
                        });
                    },
                    btn2: function (index, layero) {
                        var $elem = $(layero),
                            $reloadRecordBox = $elem.find('#reloadRecordBox');
                        var $inputs = $reloadRecordBox.find('input[name^="tellCall"]'),
                            temp = [];
                        //循环处理选中的状态值
                        $inputs.each(function (index, el) {
                            if ($(this).prop('checked')) {
                                temp.push($(this).val());
                            }
                        });

                        if (temp.length == 0) {
                            layers.toast('你还未选择任何录音记录！', {
                                icon: 2,
                                anim: 6
                            });
                            return false;
                        }
                        var tempLens = temp.length,
                            record_lists = vm.record_lists, //获取原始数据
                            record_lists_lens = record_lists.length, //获取原始数据长度
                            newArr = [];
                        //vm.editFollowData.voice_record
                        if (tempLens) {
                            for (var i = 0; i < tempLens; i++) {
                                for (var j = 0; j < record_lists_lens; j++) {
                                    if (temp[i] == record_lists[j].tel_id) {
                                        newArr.push(record_lists[j]);
                                    }
                                }
                            }
                            //去重处理
                            var voice_record_datas = vm.editFollowData.voice_record;
                            var isRepeat;
                            if (voice_record_datas.length) {
                                var voiceLens = voice_record_datas.length;
                                for (var m = 0; m < newArr.length; m++) {
                                    isRepeat = false;
                                    for (var k = 0; k < voiceLens; k++) {
                                        if (voice_record_datas[k].tel_id == newArr[m].tel_id) {
                                            isRepeat = true;
                                            break;
                                        }
                                    }
                                    if (!isRepeat) {
                                        vm.editFollowData.voice_record.push(newArr[m]);
                                    }
                                }
                                layers.closedAll();
                                return false;
                            }
                            vm.editFollowData.voice_record = newArr;
                        }
                        layers.closedAll();
                        return false;
                    }
                });
            })
            return false;
        },
        /**
         * [getCallRecordAll description] 获取录音记录列表
         * @return {[type]} [description]
         */
        getCallRecordAll: function (cur_page, callback) {
            var that = this;
            var urls = tool.getUrlArgs(),
                customer_id = '',
                loading = '';
            if (urls.has) {
                customer_id = urls.data.customer_id;
            }
            tool.ajax({
                url: ajaxurl.ivr.getEmployeeWithCustomer,
                data: {
                    calltime:vm.recordSearch.calltime,//通话时长
                    filter_time: vm.recordSearch.filter_time, //vm.filterTime.join(','), //筛选时间/统计时间
                    pagesize: 10, //分页数
                    customer_id: customer_id,
                    curpage: cur_page || 1 //分页参数
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success: function (result) {
                    if (result.code == 1) {
                        if (result.data.list != undefined) {
                            var editRecord = vm.editFollowData.voice_record;
                            for (var i = 0, resLens = result.data.list.length; i < resLens; i++) {
                                if (result.data.list[i].ischecked == undefined) {
                                    result.data.list[i].ischecked = false;
                                }
                                if (editRecord.length) { //表示已经选择了一些数据了
                                    for (var j = 0; j < editRecord.length; j++) {
                                        if (editRecord[j].tel_id == result.data.list[i].tel_id) {
                                            result.data.list[i].ischecked = true;
                                        }
                                    }
                                }
                            }
                            var datas = result.data;
                            vm.record_lists = result.data.list;
                            vm.record_total_page = result.data.total_num; //分页总数
                            if(vm.firstOpen && result.data.list.length == 0){//当首次打开，且没有录音记录
                                layers.toast('暂无录音记录可添加！');
                                layers.closed(loading);
                                return false;
                            }
                            if(result.data.list.length){
                                vm.firstOpen = false;
                            }
                            var html = template('CallRecordAllLists', datas);
                            typeof callback === 'function' && callback.call(this, html);
                        }
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
        //----------------------------------------------------------------合作情况--------------------------------------------------//
        /**
         * 获取合作信息列表
         */
        getCooperationList: function () {
            var loading = '';
            tool.ajax({
                url: ajaxurl.customer_cooper.getList,
                data: {
                    customer_id: vm.customer_id
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success: function (data) {
                    if (data.code == 1) {
                        vm.cooperationTable = data.data;
                    } else {
                        layers.toast(data.message);
                    }
                },
                error: function () {
                    layers.toast('网络异常!');
                },
                complete:function(){
                    setTimeout(function(){
                        layers.closed(loading);
                    },200)
                },
            })
        },
        /**
         * 提前终止服务
         */
        alterServeTime:function(data,n){
            layers.confirm({
                title: '更改服务期限',
                area: ['902px', 'auto'],
                content: alterServe,
                success: function (obj, index) {
                    var $elem = $(obj);
                    $elem.find('.product_name').text(data.product_name);
                    $elem.find('.finance_verify_time').text(data.finance_verify_time);
                    $elem.find('.service_end_time').text(data.service_end_time);
                    var $textarea = $elem.find('.layui-textarea'),
                        $num = $elem.find('.text-num');
                    $textarea.on('input', function () {
                        $num.text($textarea.val().length);
                    });
                },
                btn2: function (index,obj) {
                    var $elem = $(obj);
                    var reason = $elem.find('.layui-textarea').val().trim();
                    if(!reason.length){
                        layers.toast('请输入提前终止原因');
                        $elem.find('.layui-textarea').val('');
                        $elem.find('.text-num').text(0);
                        return false;
                    }
                    var loading = '';
                    tool.ajax({
                        url:ajaxurl.customer_cooper.endcooper,
                        type:'get',
                        data:{
                            id:data.id,
                            reason:reason
                        },
                        beforeSend: function () {
                            layers.load(function (indexs) {
                                loading = indexs;
                            });
                        },
                        success:function (data) {
                            layers.closed(loading);
                            if(data.code == 1){
                                layers.toast('操作成功');
                                vm.cooperationTable.onService.splice(n,1);
                            }else{
                                layers.toast(data.message)
                            }
                        },
                        error:function(){
                            layers.closed(loading);
                            layers.toast('网络异常');
                        }
                    })
                    layers.closed(index);
                }
            });
        },
        /**
         * 新增合作情况完善客户资料提示弹框
         */
        perfectTip: function () {
            if (vm.customer_id) {
                tool.ajax({
                    url: ajaxurl.customer_cooper.checkAddCooperSituation,
                    data: {
                        customerId: vm.customer_id
                    },
                    success: function (data) {
                        if (data.code == 1) { //data.code ==1 表示为可以新增合作情况 否则不能新增
                            var obj = {cooper_situation_base:{},sp_saleprocess:[]};
                            obj.cooper_situation_base = vm.cooper_situation_base;
                            obj.sp_saleprocess = vm.sp_saleprocess
                            //初始化空白数据，用于取消时用
                            vm.cacheCooperData = JSON.stringify(obj);
                            vm.isCooperAdd = true;
                            main.setCooperData();
                        } else {
                            layers.open({
                                title: '操作提示',
                                area: ['402px', '254px'],
                                content: perfect,
                                btn: ['下次再说', '去完善'],
                                btn2: function () {
                                    $('.tab-lists li[lay-id="1"]').click();
                                    vm.editBasic = true;
                                }
                            });
                        }
                    },
                    error: function () {
                        layers.toast('网络异常');
                    }
                });
            } else {
                throw new Error('缺少customer_id参数！');
            }
        },
        /**
         * 获取客户电话号码
         */
        getCustomerMobile: function (callback) {
            tool.ajax({
                url: ajaxurl.customer.getCustomerMobile,
                data: {
                    customerId: vm.customer_id
                },
                success: function (data) {
                    if (data.code == 1) {
                        //vm.mobile = data.data;
                        vm.mobile = [];
                        var base = new Base64();
                        vm.mobile = [];
                        for(var i = 0;i<data.data.list.length;i++){
                            var num = base.decode(base.decode(data.data.list[i].contact_way));
                            if(vm.dataAuth.customer_cooper_situation.pay_mobile){
                                num = main.setMobile(num);
                            }
                            var obj = {
                                contact_id:data.data.list[i].contact_way,
                                contact_way:num,
                            };
                            vm.mobile.push(obj);
                        }
                        setTimeout(function () {
                            main.form.render();
                        }, 200);
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                    typeof callback === 'function' && callback.call(this);
                },
                error: function () {
                    layers.toast('网络异常');
                }
            })
        },
        /**
         * 根据权限设置电话号码中间四位的隐藏
         */
        setMobile:function(num){
            if(num.length > 7){
                num = num.slice(0,3) + '****' + num.slice(7,num.length);
            }else{
                num = num.slice(0,3) + '****';
            }
            return num;
        },
        /**
         * 处理收款账号显示问题
         */
        collection_account:function (callback) {
            if (vm.cooper_situation_base.receive_bank && vm.cooper_situation_base.receive_bank.length) {
                var len = vm.global_set.collection_account.length;
                for (var i = 0; i < len; i++) {
                    if (vm.global_set.collection_account[i].name == vm.cooper_situation_base.receive_bank) {
                        vm.receive_account = vm.global_set.collection_account[i].acc;
                    }
                    break;
                }
                typeof callback === 'function' && callback.call(this);
            }
        },
        /**
         * [setCooperData description]初始合作情况数据
         */
        setCooperData:function(){
            vm.editCooperation = true;
            var urls = vm.getUrls;
            if(vm.isCooperAdd){//新增的时候
                var salesLens = vm.global_set.sales_process.length,
                    newArr = [];
                for (var i = 0; i < salesLens; i++) {
                    newArr.push({
                        title: vm.global_set.sales_process[i].name,
                        info: [],
                        userdesc: '', //输入的文字
                        userimages: [],
                    })
                }
                vm.sp_saleprocess = newArr;
                main.getCustomerMobile(function(){
                    main.watchCooper();
                });
            }
            if(urls.data.type == 3 && urls.data.status){//编辑查看的时候
                var id='',loading='';
                if (urls.data.id != undefined) {
                    id = urls.data.id;
                } else {
                    layers.toast('缺少id参数');
                    throw new Error('缺少id参数！');
                }
                if (urls.data.status == 1) {
                    vm.examine = true;
                }
                if (urls.data.status == 2) {
                    vm.isCoopEdit = true;
                    if(!vm.coopAuth){
                        //layers.toast('由于数据权限不够，您无法修改合作情况，请联系管理员开通相应权限！');
                        $('#cooperation-btn').attr("disabled", true);
                        return false;
                    }
                    main.getCustomerMobile();
                }
                tool.ajax({
                    url: ajaxurl.customer_cooper.detail,
                    data: {
                        id: id,
                        customer_id: vm.customer_id,
                    },
                    type: 'post',
                    beforeSend: function () {
                        layers.load(function (indexs) {
                            loading = indexs;
                        });
                    },
                    success:function(data){
                        if(data.code == 1){
                            var sp_saleprocess = data.data.sp_saleprocess, //销售过程
                                cooper_situation_base = data.data.cooper_situation_base; //基本信息
                            //如果信息对象存在 覆盖原来的值
                            if (!$.isEmptyObject(cooper_situation_base)) {
                                vm.cooper_situation_base = cooper_situation_base;
                                var str = cooper_situation_base.receive_account;
                                vm.initReceive_account = JSON.stringify(str);
                            };
                            //处理查看模式下的手机号码，解码处理
                            var num = main.decodeMobile(cooper_situation_base.pay_mobile);
                            if(vm.dataAuth.customer_cooper_situation.pay_mobile){//当员工没有购买手机号码权限时 隐藏中间四位
                                num = main.setMobile(num);
                            }
                            vm.examineMobile = num;
                            //处理销售过程数据
                            var len = sp_saleprocess.length;
                            for(var i = 0;i<len;i++){
                                sp_saleprocess[i].userdesc = '';
                                sp_saleprocess[i].userimages = [];
                            }
                            vm.sp_saleprocess = sp_saleprocess;
                            if(data.data.cooper_situation_base.cooper_situation_jjtag && data.data.cooper_situation_base.cooper_situation_jjtag.length && urls.data.status == 2){//编辑分支
                                switch (data.data.cooper_situation_base.cooper_situation_jjtag[0]) { //cooper_situation_jjtag 这个参数表示表示被谁拒绝，根据拒绝的对象不同显示不同的页面，cwjj 可以编辑全部的页面 zjyjj只能编辑合规信息 hfyjj只能编辑销售信息
                                    case 'cwyjj': //财务拒绝
                                        vm.cooper_situation_jjtag = true;
                                        break;
                                    case 'zjyjj': //质检拒绝
                                        vm.cooper_situation_jjtag = false;
                                        break;
                                    case 'hfyjj': //回访拒绝
                                        vm.cooper_situation_jjtag = false;
                                        vm.hfyjj = false;
                                    default:
                                        break;
                                }
                                vm.sp_saleprocess = sp_saleprocess;
                                main.watchCooper();
                            }else{//查看分支
                                vm.cooper_situation_jjtag = false;
                                vm.examine = true;
                                main.cooperLight();
                            }
                        }else{
                            layers.toast(data.message);
                            layers.closed(loading);
                            vm.noData = true;
                            return false;
                        }
                    },
                    error:function(){
                        layers.toast('网络异常');
                    },
                    complete:function(){
                        setTimeout(function(){
                            layers.closed(loading);
                        },200)
                    },
                })
            }
        },
        /**
         * [initCooper description]监听合作情况表单
         * @return {[type]} [description]
         */
        watchCooper:function(){
            vm.cooper_product = JSON.parse(vm.global_product);//把产品初始化
            var urls = vm.getUrls;
            if(vm.isCooperAdd){//新增的时候展示默认值
                main.initAddCooper();
            }
            if(!vm.isCooperAdd && urls.data.status == 2 && urls.data.type == 3){
                main.setProduct();
            }
            if(vm.cooper_situation_base.compliance_type == 2 && vm.hfyjj){//当编辑合作情况(不包括回访拒绝)时，把新增合作情况选中的线下合规，默认改为线上合规并拉取一次数据
                vm.cooper_situation_base.compliance_type = 1;
                main.memberCompliance();
            }
            //初始化layui表单，时间控件
            layui.use(['form', 'laydate'],function(){
                var form = layui.form,
                    laydate = layui.laydate;
                setTimeout(function () {//解决layui渲染与Vue渲染冲突，故延迟200毫秒
                    form.render();
                }, 200);
                //监听表单事件
                form.on('radio(product_type)', function (data) {//监听线上线下投顾计划单选框
                    if(vm.cooper_situation_base.product_type == data.value){//当选中的本身就被选中的情况下，不做操作
                        return;
                    }
                    vm.cooper_situation_base.product_type = data.value;
                    if(data.value == 2 && data.elem.checked){//选择线下产品的时候，只能线下购买与纸质合同(二期项目)
                        if(vm.cooper_product.line.length != 0){
                            vm.cooper_situation_base.product_name = vm.cooper_product.line[0].sname;//默认选中线下产品第一个
                            vm.cooper_situation_base.product_id = vm.cooper_product.line[0].sid;
                            vm.cooper_situation_base.product_code = vm.cooper_product.line[0].scode;
                        }else{
                            vm.cooper_situation_base.product_name = '';//默认选中线下产品第一个
                            vm.cooper_situation_base.product_id = '';
                            vm.cooper_situation_base.product_code = '';
                        }
                        vm.cooper_situation_base.pay_type = 2; //只能选择线下支付
                        vm.cooper_situation_base.pay_method = 1; //默认显示银行转账
                        vm.cooper_situation_base.electronics_region = 1;//合同乙方默认选择成都
                        if (vm.global_set.collection_account && vm.global_set.collection_account.length) {
                            vm.cooper_situation_base.receive_bank = vm.global_set.collection_account[0].name; //默认显示第一个收款账户
                            if (vm.global_set.collection_account[0].acc && vm.global_set.collection_account[0].acc.length) {
                                vm.receive_account = vm.global_set.collection_account[0].acc;
                                vm.cooper_situation_base.receive_account = vm.receive_account[0]; //默认显示第一个账号
                            }
                        }
                    }else{//选择线上产品的时候
                        vm.cooper_situation_base.pay_type = 1;//默认选择线上支付
                        if (vm.cooper_product.online.length) { //默认选中第一个产品
                            vm.cooper_situation_base.product_id = vm.cooper_product.online[0].sid;
                            vm.cooper_situation_base.product_code = vm.cooper_product.online[0].scode;
                            vm.cooper_situation_base.product_name = vm.cooper_product.online[0].sname;
                        }else{
                            vm.cooper_situation_base.product_id = '';
                            vm.cooper_situation_base.product_code = '';
                            vm.cooper_situation_base.product_name = '';
                        }
                    };
                    main.initRecord();
                    //每次切换后需要render一次
                    setTimeout(function () {
                        form.render();
                    }, 100);
                });
                form.on('radio(product_id)', function (data) { //监听所选产品单选框
                    if(vm.cooper_situation_base.product_id == data.value){
                        return;
                    }
                    vm.cooper_situation_base.product_id = data.value;
                    //获取产品code值
                    vm.cooper_situation_base.product_code = $(data.elem).attr('data-code');
                    //获取产品名字
                    vm.cooper_situation_base.product_name = $(data.elem).attr('title');
                    //切换产品时，清空购买记录信息
                    main.initRecord();
                });
                form.on('radio(pay_type)', function (data) {//监听线上线下支付方式单选框
                    if(vm.cooper_situation_base.pay_type == data.value){
                        return;
                    }
                    //清空购买记录信息
                    vm.cooper_situation_base.pay_type = data.value;
                    main.initRecord();
                    if (data.value == 2 && data.elem.checked) { //点击线下时
                        vm.cooper_situation_base.is_trade_day = 1; //默认显示自然日
                        if(vm.isHetong){//当合同乙方可编辑的时候
                            if(vm.cooper_situation_base.contract_type == 1){//当选中的是电子合同时，合同乙方默认选中成都
                                vm.cooper_situation_base.electronics_region = 1;
                            }else{
                                vm.cooper_situation_base.electronics_region = 0;
                            }
                        }
                        vm.cooper_situation_base.pay_method = 1; //默认显示银行转账
                        if (vm.isCooperAdd) {//新增的时候显示默认时间为今天
                            if (data.value == 2 && data.elem.checked) {
                                vm.cooper_situation_base.pay_time = main.getNowFormatDate(); //显示默认时间为今天
                            } else {
                                vm.cooper_situation_base.pay_time = '';
                            }
                        }
                        //遍历全局配置
                        if (vm.global_set.collection_account && vm.global_set.collection_account.length) {
                            var len = vm.global_set.collection_account.length;
                            vm.cooper_situation_base.receive_bank = vm.global_set.collection_account[0].name; //默认显示第一个收款账户和账号
                            vm.receive_account = [];
                            if (vm.global_set.collection_account[0].acc && vm.global_set.collection_account[0].acc.length) {
                                vm.receive_account = vm.global_set.collection_account[0].acc;
                                vm.cooper_situation_base.receive_account = vm.receive_account[0];
                            }
                        }
                    }else{
                        vm.isPayHistory = true;
                    }
                    setTimeout(function () {
                        form.render();
                    }, 200);
                });
                form.on('radio(pay_mobile)', function (data) { //监听电话号码单选框
                    if(vm.cooper_situation_base.pay_mobile == data.value){
                        return;
                    }
                    vm.cooper_situation_base.pay_mobile = data.value;
                    if(vm.cooper_situation_base.pay_type == 1){
                        //清空购买记录信息
                        main.initRecord();
                    }
                });
                form.on('radio(is_trade_day)', function (data) { //监听服务期限单选框
                    vm.cooper_situation_base.is_trade_day = data.value;
                });
                form.on('radio(pay_method)', function (data) { //监听付费方式单选框
                    vm.cooper_situation_base.pay_method = data.value;
                });
                //处理编辑状态下的收款账号显示问题
                if(vm.editCooperation){
                    main.collection_account(function(){
                        //延迟处理编辑状态下账号显示问题
                        setTimeout(function(){
                            //这个时候的input已经被渲染了，找到该input后一个节点，加上点击事件，触发账号单选框生成
                            $('input[value="'+vm.cooper_situation_base.receive_bank+'"]').next().click();
                            setTimeout(function(){
                                vm.cooper_situation_base.receive_account = JSON.parse(vm.initReceive_account);
                                //这个地方的input由于刚刚新生成的，还未被layui渲染，只需找到该input加上点击时间即可
                                $('input[value="'+ vm.cooper_situation_base.receive_account +'"]').click();
                                form.render();
                            },200);
                        },200);
                    });
                };
                form.on('radio(receive_bank)', function (data) { //监听收款银行单选框
                    vm.cooper_situation_base.receive_bank = data.value;
                    var receive_bank = vm.global_set.collection_account,
                        len = receive_bank.length;
                    for (var i = 0; i < len; i++) {
                        if (data.value == receive_bank[i].name) {
                            vm.receive_account = [];
                            vm.receive_account = receive_bank[i].acc;
                            break;
                        }
                    };
                    //这里是为了解决 vue渲染和layui render的问题
                    //layui render会循环出 重复的DOM节点  但是真实的单选是对的
                    //源码中 hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender  好像在这里并没有生效
                    // 连同vue渲染的是  hasRender[0] 返回了  undefined
                    $('#removeLayui').find('.layui-form-radio').remove(); //移除掉全部的layui 单选框样式
                    Vue.nextTick(function () {
                        vm.cooper_situation_base.receive_account = vm.receive_account[0];
                        setTimeout(function () {
                            form.render('radio');
                        }, 300);
                    });
                });
                form.on('radio(receive_account)', function (data) { //监听收款账号单选框
                    vm.cooper_situation_base.receive_account = data.value;
                });
                form.on('radio(compliance_type)', function (data) { //监听合规类型选框
                    vm.cooper_situation_base.compliance_type = data.value;
                    if(data.value == 1 && data.elem.checked){
                        main.memberCompliance();
                    }
                    setTimeout(function () {
                        form.render();
                    }, 100);
                });
                form.on('radio(contract_type)', function (data) { //监听合同类型单选框
                    vm.cooper_situation_base.contract_type = data.value;
                    if(vm.isHetong){//当合同乙方可编辑时
                        if(data.value == 1 && data.elem.checked){
                            vm.cooper_situation_base.electronics_region = 1;
                        }else {
                            vm.cooper_situation_base.electronics_region = 0;
                        }
                    }
                    setTimeout(function () {
                        form.render();
                    }, 100);
                });
                form.on('radio(electronics_region)',function(data){//监听合同乙方单选框
                    vm.cooper_situation_base.electronics_region = data.value;
                });
                laydate.render({
                    elem: '#product_pay_time',
                    type: 'datetime',
                    done: function (value, date) {
                        vm.cooper_situation_base.pay_time = value;
                    }
                });
                setTimeout(function(){
                    main.asynUploadImg();
                    main.cooperLight();
                    main.cooperUp();
                    form.render();
                },200);

            });
        },
        /**
         * 解码处理电话号码
         * @param n 手机号
         * @returns {*}
         */
        decodeMobile:function(n){
            var base = new Base64();
            n = base.decode(base.decode(n));
            return n;
        },
        /**
         * [initAddCooper description]新增合作情况默认选项
         * @return {[type]} [description]
         */
        initAddCooper:function(){
            vm.cooper_situation_base.product_type = 1; //默认选中第一项线上投顾计划
            vm.cooper_situation_base.pay_type = 1; //默认选中线上支付
            if (vm.cooper_product.online.length) { //默认选中第一个产品
                vm.cooper_situation_base.product_id = vm.cooper_product.online[0].sid;
                vm.cooper_situation_base.product_code = vm.cooper_product.online[0].scode;
                vm.cooper_situation_base.product_name = vm.cooper_product.online[0].sname;
            }
            vm.cooper_situation_base.compliance_type = 1;//默认选中线上合规
            main.memberCompliance();//获取线上合规数据
            vm.cooper_situation_base.contract_type = 1; //默认选择电子合同
            vm.isHetong = true;
            if (vm.mobile && vm.mobile.length) { //默认选中第一个电话号码
                vm.cooper_situation_base.pay_mobile = vm.mobile[0].contact_id;
            }
            setTimeout(function () {
                main.form.render();
                vm.isPayHistory = true; //展示关联购买记录按钮
            }, 200)
        },
        /**
         * [setProduct description]针对新增时有某样产品，而编辑的时候被删除掉的情况  只在编辑的时候生效
         */
        setProduct:function(){
            var type = vm.cooper_situation_base.product_type;
            if(type && (type == 1 || type == 2)){//
                var id =  vm.cooper_situation_base.product_id,
                    product = [],len = '',flag = false;
                type == 1 ? product = vm.cooper_product.online : product = vm.cooper_product.line;
                len = product.length;
                for(var i = 0;i<len;i++){
                    if(product[i].sid == id){
                        flag = true;
                        break;
                    }
                };
                if(!flag){
                    var obj = {};
                    obj.sid = id;
                    obj.scode = vm.cooper_situation_base.product_code;
                    obj.sname = vm.cooper_situation_base.product_name;
                    type == 1 ? vm.cooper_product.online.unshift(obj) : vm.cooper_product.line.unshift(obj);
                    Vue.nextTick(function(){
                        main.form.render();
                    })
                }
            }
            if(vm.hfyjj){//编辑合作情况，当不处于回访拒绝时
                vm.cooper_situation_base.electronics_region && vm.cooper_situation_base.electronics_region != 0 ? vm.isHetong = false : vm.isHetong = true;
            }
        },
        /**
         * 置空关联购买记录信息
         */
        initRecord: function () {
            vm.isPayHistory = false;
            vm.cooper_situation_base.days = '';
            vm.cooper_situation_base.pay_num = '';
            vm.cooper_situation_base.pay_money = '';
            if(vm.cooper_situation_base.pay_type == 2){
                vm.cooper_situation_base.pay_time = main.getNowFormatDate();
            }else{
                vm.cooper_situation_base.pay_time = '';
            }
            vm.cooper_situation_base.object_id = '';
            vm.cooper_situation_base.agency_time = '';
            vm.cooper_situation_base.is_identity = '';
            vm.cooper_situation_base.is_contract = '';
            vm.cooper_situation_base.goods_price = '';
            vm.cooper_situation_base.is_trade_day = 1;
            vm.cooper_situation_base.buyer_mobile = '';
            vm.cooper_situation_base.agency_status = '';
            vm.cooper_situation_base.third_order_id = '';
            vm.cooper_situation_base.agency_start_time = '';
            vm.cooper_situation_base.payer = '';
            vm.cooper_situation_base.pay_bank = '';
            vm.cooper_situation_base.payment_account = '';
        },
        /**
         * 获取当前时间
         */
        getNowFormatDate: function () {
            var date = new Date();
            var seperator1 = "-";
            var seperator2 = ":";
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate + " " + '00:00:00';
            return currentdate;
        },
        /**
         * 关联购买记录弹框
         */
        payRecord: function () {
            var loading = '';
            tool.ajax({
                url: ajaxurl.customer_cooper.orderList,
                data: {
                    asc_id: vm.cooper_situation_base.product_id,
                    mobile: vm.cooper_situation_base.pay_mobile,
                    customer_id: vm.customer_id,
                },
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success: function (data) {
                    if (data.code == 1) {
                        var data = data.data.list,
                            liItem = {};
                        layers.confirm({
                            title: '关联购买记录',
                            area: ['902px', '480px'],
                            btn: null,
                            content: payRecord,
                            success: function (obj, index) {
                                var $obj = obj,
                                    len = data.length,
                                    html = '';
                                for (var i = 0; i < len; i++) {
                                    html += '<li><div class="checkbox-box"><input type="radio" name="record" lay-filter="pay-record" title=" " value=' + i + ' lay-skin="primary"></div>' +
                                        ' <div class="li-item pay-account">' + data[i].buyer_mobile + '</div>' +
                                        '<div class="li-item pay-time">' + data[i].payment_time + '</div>' +
                                        '<div class="li-item">' + data[i].goods_name + '</div>' +
                                        '<div class="li-item ">' + data[i].agency_status + '</div>' +
                                        '<div class="li-item ">' + data[i].order_amount + '</div></li>'
                                };
                                $obj.find('.lists').append(html);
                                layui.use('form', function () {
                                    var form = layui.form;
                                    form.render(null, 'pay-record_box');
                                    form.on('radio(pay-record)', function (o) {
                                        liItem = data[o.value];
                                    })
                                });
                                $obj.find('.cancel').on('click', function () {
                                    layers.closed(index);
                                });
                                $obj.find('.ok').on('click', function () {
                                    layers.closed(index);
                                    vm.cooper_situation_base.pay_num = 1;
                                    vm.cooper_situation_base.third_order_id = liItem.order_id;
                                    vm.cooper_situation_base.days = liItem.days;
                                    vm.cooper_situation_base.goods_price = liItem.price;
                                    vm.cooper_situation_base.pay_money = liItem.order_amount;
                                    vm.cooper_situation_base.pay_time = liItem.payment_time;
                                    vm.cooper_situation_base.is_trade_day = liItem.is_trade_day;
                                    vm.cooper_situation_base.buyer_mobile = liItem.buyer_mobile;
                                    vm.cooper_situation_base.agency_start_time = liItem.agency_start_time;
                                    vm.cooper_situation_base.agency_time = liItem.agency_time;
                                    vm.cooper_situation_base.is_identity = liItem.is_identity;
                                    vm.cooper_situation_base.is_contract = liItem.is_contract;
                                    vm.cooper_situation_base.object_id = liItem.object_id;
                                    vm.cooper_situation_base.agency_status = liItem.agency_status;
                                    vm.isPayHistory = true;
                                })
                            },
                        });
                    } else {
                        layers.toast('暂无购买记录可关联，请重新选择产品名称或购买电话！', {
                            icon: 2,
                            anim: 6
                        });
                    }
                    layers.closed(loading);
                },
                error: function (err) {
                    layers.toast('网络异常!');
                    layers.closed(loading);
                }
            });
            return false;
        },
        /**
         * 查询第三方合规信息
         */
        memberCompliance: function () {
            var loading = '';
            tool.ajax({
                url: ajaxurl.customer_cooper.memberCompliance,
                data: {
                    customer_id: vm.customer_id,
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success: function (data) {
                    layers.closed(loading);
                    if (data.code == 1) {
                        vm.cooper_situation_base.compliance_status = data.data.is_identity; //合规状态
                        vm.cooper_situation_base.adapt = data.data.adapt; //适当性评测
                        vm.cooper_situation_base.risk = data.data.risk; //风险评测
                    } else {
                        vm.cooper_situation_base.compliance_type = '';
                        layers.toast(data.message);
                    }
                },
                error: function () {
                    layers.closed(loading);
                    layers.toast('网络异常!');
                }
            })
        },
        /**
         * 获取关联跟进信息数据
         */
        gettrackData: function (cur_page, callback, cindex) {
            var that = this,
                loading = '';
            tool.ajax({
                url: ajaxurl.cooper.index,
                data: {
                    customer_id: vm.customer_id,
                    type: vm.associateTrackData.type,
                    operate_real_name: vm.associateTrackData.operate_real_name,
                    goods_name: vm.associateTrackData.goods_name,
                    start_time: vm.associateTrackData.start_time,
                    end_time: vm.associateTrackData.end_time,
                    followup_content: vm.associateTrackData.followup_content,
                    pagesize: 4,
                    curpage: cur_page || 1
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success: function (data) {
                    if (data.code == 1) {
                        if (data.data.list != undefined) {
                            if(!vm.isOpen){
                                if(!data.data.list.length){
                                    layers.toast('暂无跟进信息可供关联!');
                                    layers.closed(loading);
                                    return false;
                                }
                            }
                            vm.isOpen = true;
                            for (var i = 0, len = data.data.list.length; i < len; i++) {
                                if (data.data.list[i].ischecked == undefined) {
                                    data.data.list[i].ischecked = false;
                                }
                                if (vm.sp_saleprocess[cindex].info.length) { //表示已经选择了一些数据了
                                    for (var j = 0, lens = vm.sp_saleprocess[cindex].info.length; j < lens; j++) {
                                        if (vm.sp_saleprocess[cindex].info[j].followup_id == data.data.list[i].followup_id) {
                                            data.data.list[i].ischecked = true;
                                        }
                                    }
                                }
                            }
                            var datas = data.data;
                            vm.trackList = data.data.list;
                            vm.track_page = data.data.all_num;
                            var html = template('track', datas);
                            typeof callback === 'function' && callback.call(this, html);
                        }else{
                            layers.toast('暂无跟进信息可供关联!');
                        }
                    } else {
                        layers.toast(data.message);
                    }
                    layers.closed(loading);
                },
                error: function (err) {
                    layers.toast('网络异常!');
                    layers.closed(loading);
                }
            });
        },
        /**
         * 关联跟进信息弹框
         */
        associateTrack: function (indexs) {
            var that = this;
            this.gettrackData('', function (html) {
                layers.open({
                    title: '关联跟进信息',
                    area: ['902px', 'auto'],
                    btn: null,
                    content: track,
                    success: function (obj, n) {
                        var $elem = $(obj),
                            $reloadRecordBox = $elem.find('#content'),
                            $addfooterspan = $elem.find('.add-footer').find('#total');
                        $elem.find('.layui-layer-content').css('height', 'auto');
                        layui.use(['form', 'laydate', 'laypage'], function () { //初始化layui
                            var form = layui.form,
                                laydate = layui.laydate,
                                laypage = layui.laypage;
                            laydate.render({ //初始化时间
                                elem: '#start_track',
                                type: 'datetime',
                                done: function (value, date) {
                                    vm.associateTrackData.start_time = value;
                                }
                            });
                            laydate.render({ //初始化时间
                                elem: '#end_track',
                                type: 'datetime',
                                done: function (value, date) {
                                    vm.associateTrackData.end_time = value;
                                }
                            });
                        });
                        $elem.find('.reset-btn').on('click', function () { //重置操作
                            $elem.find('.operator').val('')
                            $elem.find('.product').val('');
                            $elem.find('input[type="text"]').each(function (index, el) {
                                $(this).val('');
                            });
                            vm.associateTrackData = { //获取关联跟进信息参数
                                customer_id: '',
                                type: 1,
                                operate_real_name: '',
                                goods_name: '',
                                start_time: '',
                                end_time: '',
                                followup_content: '',
                            };
                            that.gettrackData('', function (htmls) {
                                $reloadRecordBox.html(htmls);
                                main.form.render();
                                trackPage();
                            },indexs);
                        });
                        $elem.find('.inquire-btn').on('click', function () { //查询操作
                            vm.associateTrackData.operate_real_name = $elem.find('input[name="operator"]').val();
                            vm.associateTrackData.goods_name = $elem.find('input[name="product"]').val();
                            if (vm.associateTrackData.end_time && vm.associateTrackData.start_time) {
                                if (vm.associateTrackData.end_time < vm.associateTrackData.start_time) {
                                    layers.toast('结束时间不能小于开始时间', {
                                        icon: 2,
                                        anim: 6
                                    });
                                    return false;
                                }
                            }
                            that.gettrackData('', function (htmls) {
                                $reloadRecordBox.html(htmls);
                                main.form.render();
                                trackPage();
                            },indexs);
                            return false;
                        });
                        main.form.on('checkbox(checkAllCall)', function (data) { //全选与全部取消
                            if (data.elem.checked) {
                                $reloadRecordBox.find('input[name="checkItem"]').prop('checked', true);
                                var lens = $reloadRecordBox.find('input[name^="checkItem"]').length;
                                $addfooterspan.text('已选' + lens + '条').data('checknum', lens);
                            } else {
                                $reloadRecordBox.find('input[name="checkItem"]').prop('checked', false);
                                var num = $addfooterspan.data('checknum') - 4;
                                if (num < 0) {
                                    num = 0;
                                }
                                $addfooterspan.text('已选0条').data('checknum', num);
                            }
                            main.form.render();
                        });
                        //监听每个复选框的选择行为
                        main.form.on('checkbox(checkItem)', function (data) {
                            var checknum = $addfooterspan.data('checknum') || 0;
                            if (data.elem.checked) {
                                checknum++
                            } else {
                                $reloadRecordBox.find('input[name="checkAllCall"]').prop('checked', false);
                                checknum--
                            }
                            $addfooterspan.text('已选' + checknum + '条').data('checknum', checknum);
                            main.form.render();
                        });
                        $reloadRecordBox.html(html);
                        main.form.render();
                        //如果用户已经选择了数据  继续选择 统计当前页面选择的条数
                        var init = function () {
                            if (vm.trackList.length) {
                                var checkedLens = $reloadRecordBox.find('input[name^="checkItem"]:checked').length;
                                $addfooterspan.text('已选' + checkedLens + '条').data('checknum', checkedLens);
                            } else {
                                $addfooterspan.text('已选0条').data('checknum', 0);
                            }
                        }
                        init();
                        var trackPage = function () {
                            if (page) {
                                page.init({
                                    elem: 'track-page',
                                    count: vm.track_page,
                                    limit: 4,
                                    jump: function (obj, first) {
                                        if (!first) {
                                            that.gettrackData(obj.curr, function (htmls) {
                                                $reloadRecordBox.html(htmls);
                                                init();
                                                main.form.render();
                                            }, indexs);
                                        }
                                    }
                                })
                            }
                        }
                        trackPage();
                        $elem.find('.ok').on('click', function () { //点击确定
                            var temp = [],
                                $inputs = $elem.find('input[name^="checkItem"]');
                            $inputs.each(function (index, el) {
                                if ($(this).prop('checked')) {
                                    vm.trackList[index].sp_type = 2; //打上跟进信息的表示
                                    temp.push(vm.trackList[index]);
                                }
                            });
                            vm.sp_saleprocess[indexs].info = vm.sp_saleprocess[indexs].info.concat(temp);
                            var info = vm.sp_saleprocess[indexs].info;
                            var arr_id = [],
                                arr = [];
                            for (var i = 0; i < info.length; i++) { //把数组中 带followup_id 与 不带的分开存起来。
                                if (info[i].followup_id != undefined) {
                                    arr_id.push(info[i]);
                                } else {
                                    arr.push(info[i]);
                                }
                            };
                            arr_id = main.unique(arr_id); //数组对象去重
                            vm.sp_saleprocess[indexs].info = arr_id.concat(arr); //两个数组合并
                            /* vm.sp_saleprocess[indexs].info = main.unique(vm.sp_saleprocess[indexs].info); */
                            layers.closedAll();
                            return false;
                        });
                        $elem.find('.cancel').on('click', function () {
                            layers.closedAll();
                            return false;
                        })
                    }
                })
            }, indexs);
        },
        /**
         * 新增销售过程与跟进记录
         */
        addSaleprocess: function (index) {
            $('.sales-process .sales-process-item').eq(index).find('.new-item-content').removeClass('layui-hide');
        },
        /**
         * 新增销售过程点击编辑确定后，数据处理。
         */
        addProductItem: function (index) {
            var obj = {
                customer_cooper_situation_saleprocess_id: '', //合作情况销售过程ID
                sp_type: '1', //2(销售过程类型:1销售过程,2跟进记录)
                employee_id: '', //员工ID
                employee_nickname: '', //销售人员
                employee_department: '', //销售人员部门
                text_record: vm.sp_saleprocess[index].userdesc.replace(/[\r\n]/g,""), //记录文字
                create_time: '', //创建日期
                product_info: [],
                images:vm.sp_saleprocess[index].userimages,
                voice_records: [],
            };
            if(obj.text_record =='' && !obj.images.length){
                $('.sales-process').find('.sales-process-item').eq(index).find('.new-item-content').addClass('layui-hide');
                return;
            }
            vm.sp_saleprocess[index].info.push(obj);
            vm.sp_saleprocess[index].userdesc = '';
            vm.sp_saleprocess[index].userimages = [];
            $('.sales-process').find('.sales-process-item').eq(index).find('.new-item-content').addClass('layui-hide');
            //新增确认以后的灯箱效果
            Vue.nextTick(function () {
                var $productIamges = $('.sales-item-content').find('div[id^="productIamges_"]'); //销售过程中的灯箱图
                if ($productIamges.length) {
                    $productIamges.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
            })
        },
        /**
         * 合作情况提交表单必填项验证
         */
        cooperVerify: function () {
            var flag = false;
            if (vm.cooper_situation_base.product_type == 1) {
                if (!vm.global_set.online_consulting_plan || vm.global_set.online_consulting_plan.length == 0) {
                    layers.toast('暂无产品可供选择，请联系管理员配置后，提交合作情况！', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
            }
            if (vm.cooper_situation_base.product_type == 2) {
                if (!vm.global_set.line_investment_plan || vm.global_set.line_investment_plan.length == 0) {
                    layers.toast('暂无产品可供选择，请联系管理员配置后，提交合作情况！', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
            }
            if (!vm.cooper_situation_base.product_type) {
                layers.toast('请选择产品类型', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            if (!vm.cooper_situation_base.product_name) {
                layers.toast('请选择产品', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            if (!vm.cooper_situation_base.pay_type) {
                layers.toast('请选择支付方式', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            if (vm.isPayHistory) { //选择线上支付方式，需要关联购买记录
                if (!vm.cooper_situation_base.pay_num || !vm.cooper_situation_base.goods_price) {
                    layers.toast('请关联线上投顾计划的购买记录，否则无法提交', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
            }
            if (!vm.cooper_situation_base.pay_mobile) {
                layers.toast('请选择购买电话', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            var mobile = main.decodeMobile(vm.cooper_situation_base.pay_mobile);
            if(mobile.length != 11){
                layers.toast('请选择正确的手机号码,方可提交合作情况', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            if(mobile.substring(0,3) - 0 < 130 || mobile.substring(0,3) - 0 > 199){
                layers.toast('请选择正确的手机号码,方可提交合作情况', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            if (vm.cooper_situation_base.pay_type == 2) { //线下支付必填项
                if (!vm.cooper_situation_base.is_trade_day) {
                    layers.toast('请选择服务期限', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
                if (!vm.cooper_situation_base.pay_method) {
                    layers.toast('请选择付费方式', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
                if (!vm.cooper_situation_base.receive_bank) {
                    layers.toast('请选择收款方式', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
                if (!vm.cooper_situation_base.receive_account) {
                    layers.toast('请选择收款账号', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
            }
            if (!vm.cooper_situation_base.compliance_type) {
                layers.toast('请选择合规类型', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            /* if (vm.cooper_situation_base.compliance_type == 2) {//二期优化取消掉线下合规
                 if (!vm.cooper_situation_base.compliance_status && vm.cooper_situation_base.compliance_status != 0) {
                     layers.toast('请选择合规状态', {
                         icon: 2,
                         anim: 6
                     });
                     return false;
                 }
                 if (!vm.cooper_situation_base.risk) {
                     layers.toast('请选择风险评测', {
                         icon: 2,
                         anim: 6
                     });
                     return false;
                 }
                 if (!vm.cooper_situation_base.adapt) {
                     layers.toast('请选择适当性评测', {
                         icon: 2,
                         anim: 6
                     });
                     return false;
                 }
                 if (vm.cooper_situation_base.attachment.image.length == 0 && vm.cooper_situation_base.attachment.voice.length == 0) {
                     layers.toast('请上传附件', {
                         icon: 2,
                         anim: 6
                     });
                     return false;
                 }
             }*/
            if (!vm.cooper_situation_base.contract_type) {
                layers.toast('请选择合同类型', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
            if(vm.cooper_situation_base.pay_type == 2 && vm.cooper_situation_base.contract_type == 1){
                if(!vm.cooper_situation_base.electronics_region){
                    layers.toast('请选择合同乙方', {
                        icon: 2,
                        anim: 6
                    });
                    return false;
                }
            }
            flag = true;
            return flag;
        },
        /**
         * 删除无用的数据
         */
        handleSp_saleprocess: function () {
            var len = vm.sp_saleprocess.length;
            for (var i = 0; i < len; i++) {
                if (vm.sp_saleprocess[i].info && vm.sp_saleprocess[i].info.length) {
                    var info = vm.sp_saleprocess[i].info,
                        lens = info.length;
                    for (var j = 0; j < lens; j++) {
                        if (info[j].sp_type == "") {
                            info.splice(j, 1);
                            break;
                        }
                    }
                }
            };
            var arr = [];
            for (var i = 0; i < vm.sp_saleprocess.length; i++) {
                if (vm.sp_saleprocess[i].info.length) {
                    arr.push(vm.sp_saleprocess[i]);
                }else{
                    var obj = {title:vm.sp_saleprocess[i].title};
                    arr.push(obj);
                }
            };
            return arr;
        },
        /**
         * 合作情况提交
         */
        cooperTionBtn: function () {
            var flag = main.cooperVerify(),
                data = {};
            if (!flag) {
                return false;
            }
            vm.cooper_situation_base.is_saleprocess = 1;
            data.cooper_situation_base = vm.cooper_situation_base;
            data.cooper_situation_base.customer_id = vm.customer_id;
            data.sp_saleprocess = main.handleSp_saleprocess();
            if (vm.remarkWord) {
                data.cooper_situation_base.remark = vm.remarkWord;
                vm.remarkWord = '';
            }
            $('#cooperation-btn').attr("disabled", true);
            if (vm.isCooperAdd) { //新增合作情况提交
                var loading = '';
                tool.ajax({
                    url: ajaxurl.customer_cooper.add,
                    data: data,
                    type: 'post',
                    beforeSend: function () {
                        layers.load(function (indexs) {
                            loading = indexs;
                        });
                    },
                    success: function (data) {
                        if (data.code == 1) {
                            layers.toast('提交成功!');
                            setTimeout(function () {
                                common.getTabLinkWithJS({
                                    name: '客户审批',
                                    url: '/admin/examination/my_audit/all_list',
                                    close:true,
                                    updated:true,
                                });
                            }, 1000);
                        } else {
                            layers.toast(data.message, {
                                icon: 2,
                                anim: 6
                            });
                            $('#cooperation-btn').attr("disabled", false);
                        }
                        layers.closed(loading);
                    },
                    error: function () {
                        layers.toast('网络异常!');
                        layers.closed(loading);
                        $('#cooperation-btn').attr("disabled", false);
                    }
                });
            } else {
                var loading = '';
                tool.ajax({
                    url: ajaxurl.customer_cooper.update,
                    data: data,
                    type: 'post',
                    beforeSend: function () {
                        layers.load(function (indexs) {
                            loading = indexs;
                        });
                    },
                    success: function (data) {
                        if (data.code == 1) {
                            layers.toast('提交成功!');
                            setTimeout(function () {
                                common.getTabLinkWithJS({
                                    name: '客户审批',
                                    url: '/admin/examination/my_audit/all_list',
                                    close:true,
                                    updated:true,
                                });
                            }, 1000);
                        } else {
                            layers.toast(data.message, {
                                icon: 2,
                                anim: 6
                            });
                            $('#cooperation-btn').attr("disabled", false);
                        }
                        layers.closed(loading);
                    },
                    error: function () {
                        layers.toast('网络异常!');
                        $('#cooperation-btn').attr("disabled", false);
                        layers.closed(loading);
                    }
                });
            }
            return false;
        },
        /**
         * [cooperUp description]合作情况 财务上传凭证，上传附件语音
         * @return {[type]} [description]
         */
        cooperUp:function(){
            if(upload){
                var loading = '';
                //合作息上传财务凭证
                upload.init({
                    elem: '#uploadVoucher',
                    url: ajaxurl.upload.ftp_upload,
                    field: 'fileUpload',
                    before: function () {
                        layers.load(function (indexs) {
                            uploadloadingfollow = indexs;
                        });
                    },
                    done: function (data) {
                        if (data.code == 1) {
                            vm.cooper_situation_base.payment_certificate.push(data.data);
                        } else {
                            layers.toast(data.message);
                        }
                        layers.closed(uploadloadingfollow)
                    },
                    error: function () {
                        layers.closed(uploadloadingfollow);
                    }
                });
                //合作情况线下合规附件上传语音
                layui.use('upload', function () {
                    var upload = layui.upload;
                    upload.render({
                        elem: '#voiceBtn',
                        url: ajaxurl.upload.ftp_upload,
                        field: 'fileUpload',
                        accept: 'audio',
                        exts: 'mp3|wav|ogg', //允许上传的文件后缀
                        size: 20480, //设置文件最大可允许上传的大小，单位 KB。不支持ie8/9
                        before: function () {
                            layers.load(function (indexs) {
                                uploadloadingfollow = indexs;
                            })
                        },
                        done: function (data) {
                            if (data.code == 1) {
                                vm.cooper_situation_base.attachment.voice.push(data.data);
                            } else {
                                layers.toast(data.message);
                            }
                            layers.closed(uploadloadingfollow);
                        },
                        error: function () {
                            layers.closed(uploadloadingfollow);
                        }
                    });
                });
                //合作情况线下合规附件上传图片
                upload.init({
                    elem: '#uploadAnnex',
                    url: ajaxurl.upload.ftp_upload,
                    field: 'fileUpload',
                    before: function () {
                        layers.load(function (indexs) {
                            uploadloadingfollow = indexs;
                        })
                    },
                    done: function (data) {
                        if (data.code == 1) {
                            vm.cooper_situation_base.attachment.image.push(data.data);
                        } else {
                            layers.toast(data.message);
                        }
                        layers.closed(uploadloadingfollow)
                    },
                    error: function () {
                        layers.closed(uploadloadingfollow);
                    }
                });
            }
        },
        /**
         *  销售过程的上传图片
         */
        asynUploadImg: function () {
            Vue.nextTick(function () {
                var curElem = $('.cooperation-situation').find('button[id^="salesImgUpload_"]'),
                    uploadloadingfollow = '';
                if (curElem) {
                    $.each(curElem, function (item, n) {
                        var curID = $(this).attr('id'), //salesImgUpload_0
                            curlens = curID.length;
                        curIndex = curID.substring(15, curlens);
                        (function (curIndex, curID) {
                            upload.init({
                                elem: '#' + curID,
                                url: ajaxurl.upload.ftp_upload,
                                field: 'fileUpload',
                                multiple: true,
                                before: function () {
                                    layers.load(function (indexs) {
                                        uploadloadingfollow = indexs;
                                    })
                                },
                                done: function (data) {
                                    if (data.code == 1) {
                                        vm.sp_saleprocess[curIndex].userimages.push(data.data);
                                    } else {
                                        layers.toast(data.message);
                                    }
                                    layers.closed(uploadloadingfollow)
                                },
                                error: function () {
                                    layers.closed(uploadloadingfollow);
                                }
                            });
                        })(curIndex, curID);
                    })
                }
            })
        },
        /**
         * [cooperLight description] 销售过程中的灯箱
         * @return {[type]} [description]
         */
        cooperLight: function () {
            Vue.nextTick(function () {
                var $saleimgboxs = $('.cooperation-situation').find('section[id^="saleimgboxs_"]'); //编辑销售过程输入框中的图片
                if ($saleimgboxs.length) {
                    $saleimgboxs.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
                var $productIamges = $('.sales-item-content').find('div[id^="productIamges_"]'); //销售过程中的灯箱图
                if ($productIamges.length) {
                    $productIamges.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
                var $financeImgs = $('.cooperation-situation').find('#financeBoxs');
                if ($financeImgs.length) {
                    $financeImgs.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
                //financeCkeckBoxs
                var $justiceboxs = $('.cooperation-situation').find('#justiceboxs'); //查看付费凭证
                if ($justiceboxs.length) {
                    $justiceboxs.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
                var $financeCkeckBoxs = $('.cooperation-situation').find('#financeCkeckBoxs');
                if ($financeCkeckBoxs.length) {
                    $financeCkeckBoxs.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
                var $annexImages = $('.cooperation-situation').find('#annexImages'); //附件图片
                if ($annexImages.length) {
                    $annexImages.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
                var $examineImages = $('.cooperation-situation').find('#examineImages'); //付费凭证
                if ($examineImages.length) {
                    $examineImages.each(function () {
                        var id = $(this).prop('id');
                        if (id) {
                            lightbox.init('#' + id);
                        }
                    })
                }
            })
        },
        /**
         * 数组对象根据参数去重
         */
        unique: function (arr) {
            var result = {};
            var finalResult = [];
            for (var i = 0; i < arr.length; i++) {
                result[arr[i].followup_id] = arr[i];
            }
            for (var item in result) {
                finalResult.push(result[item]);
            }
            return finalResult;
        },
    };
    var vm = new Vue({
        el: '#app',
        data:{
            permission:true,//档案的总权限
            dataAuth:{
                customer:{},
                customer_contact:{},
                customer_cooper_situation:{},
            },//字段权限
            coopAuth:false,//合作情况编辑权限
            getUrls: tool.getUrlArgs(), //获取Url参数
            customer_id:'',//客户ID
            tabs: {
                basic: false, //基本信息页面
                follow: false, //跟进信息页面
                cooperation: false //合作情况页面
            },
            global_set:{},//全局配置
            gainRemarkList: '', // 当前档案备注
            remarkList:'',// 备注列表
            clientList: [], //客户已存在的分组列表
            groupList: [], //员工自定义分组列表
            global_product:{//处理过的全局产品原始数据
                online:[],//线上产品
                line:[]//下线产品
            },
            headInfo:{},//档案头部信息
            client_guest:[],//档案标签
            customer_from_channel: [], //客户来源
            customer_from_channel_text: '', //客户来源展示
            basicInfo:{},//基本信息
            basicInfoData: {}, //初始客户详细基本信息
            finance_info: {}, //客户基本财务信息
            financeInfoData: '', //初始客户财务基本信息
            area: { //省市地区
                province: [{
                    id: '',
                    name: '',
                    shortname: ''
                }],
                city: [{
                    id: '',
                    name: '',
                    shortname: ''
                }],
                county: [{
                    id: '',
                    name: '',
                    shortname: ''
                }],
            },
            editBasic: false, //是否编辑基本信息
            checkMobile: [{//用于验证电话号码唯一性
                err: ''
            }],
            checkOnly: { //验证唯一性
                qq: '',
                weixin: ''
            },
            showOther: false, //收入来源选择其他的时候 显示输入框
            basicBtnDisabled: false, //禁用基本信息表单连续提交
            selected: '',

            follow_up_type:[],//该员工的跟进类型权限
            filterFollow: {}, //筛选跟进信息
            followup_content: [], //查询跟进信息图片文字筛选项
            follow_product:{//缓存跟进信息产品信息
                online:[],
                line:[],
            },
            followInfo: '', //跟进信息
            followup_id: '',
            isEditAdd: false, //跟进信息false 为新增   true 为编辑
            isfollowBack:false,//标识是否是从其他页面直接进入跟进信息页面
            editFollow: false, //是否编辑跟进信息
            editFollowData: { //编辑的跟进信息
                employee_id: '',
                images: [], //{image:'',thumb_image:''}
                product_name: [],
                record: '',
                type: '',
                voice_record: [],
            },
            fContent: '', //跟进信息包含的内容：文字、图片、语音
            recordSearch: { //通话记录的搜索关键字
                filter_time: '',
                calltime:'',
            },
            record_total_page: '', //获取通话记录的页数
            record_lists: [], //缓存通话记录列表
            firstOpen:true,//是否初次打开录音记录弹窗

            isCooperAdd: false, //新增合作情况的标识
            isPayHistory: false, //显示与隐藏购买记录按钮
            editCooperation: false, //编辑合作信息的标识
            isCoopEdit:false,//用于编辑合作情况权限控制显示
            cooperationTable: [],
            cooper_situation_jjtag: true, //合作情况 处于法务，财务，回访拒绝的状态
            cooper_situation_base: { //合作情况基本信息 除了销售过程
                id: '',
                product_type: '',
                product_id: '',
                product_name: '',
                customer_id: '',
                pay_type: '',
                pay_num: '',
                pay_mobile: '',
                third_order_id: '',
                is_trade_day: '',
                days: '',
                goods_price: '',
                pay_money: '',
                pay_time: '',
                payer: '',
                pay_bank: '',
                pay_method: '',
                payment_account: '',
                payment_certificate: [], //'付款凭证'  图片
                receive_bank: '',
                initReceive_account:'',//原始被选中的账号
                receive_account: '',
                compliance_type: '', //'合规类型： 1 线上合规   2 线下合规',
                compliance_status: '', //'合规状态： 1 已合规  2  未合规',
                adapt: '', //'适当性测评',
                risk: '', //'风险测评',
                contract_type:'' , //'合同类型： 1 电子合同  2  纸质合同'
                electronics_region:0,//成都1  长沙2 0 为默认值,
                attachment: { //附件  语音和图片都可以  数组
                    voice: [],
                    image: [],
                },
                remark: '', //备注
                is_saleprocess: 1, //是否有销售过程，1 有 0 无
            },
            sp_saleprocess: [{ //销售过程所有字段
                title: '',
                info: [],
                userdesc: '', //输入的文字
                userimages: []
            }],
            cacheCooperData:'',//缓存合作情况原始数据
            cooper_product:{//缓存合作情况处理过的产品
                online:[],//线上产品
                line:[],//线下产品
            },
            mobile: [], //客户合作情况电话号码
            receive_account: '',
            examine: false, //查看状态
            examineMobile:'',//查看状态下的合作情况电话号码
            hfyjj:true,//标识回访拒绝的状态 为 false状态时表示处于回访拒绝
            remarkWord: '', //备注输入框内容
            noData: false, //无数据的时候展示
            associateTrackData: { //获取关联跟进信息参数
                customer_id: '',
                type: 1,
                operate_real_name: '',
                goods_name: '',
                start_time: '',
                end_time: '',
                followup_content: '',
            },
            trackList: [],
            track_page: '',
            isOpen:false,
            isHetong:true,//合同乙方是否可编辑 true 可编辑  false 不可编辑
        },
        methods:{
            remarkEdit: function () { //编辑备注
                main.remarkEdit();
            },
            editGroup: function () { //编辑分组
                main.editGroup();
            },
            isEditBasic: function () { //是否编辑基本信息
                this.editBasic = !this.editBasic;
                /*if(this.editBasic){
                    if(this.basicInfo.mobile && this.basicInfo.mobile.length){
                        this.baseinfoMobile = this.basicInfo.mobile;
                    }else{
                        this.baseinfoMobile.push({mobile:'',is_relation:0})
                    }
                }*/
            },
            callTell: function (id) { //拨打电话
                if (id != undefined) {
                    window.top.callTellFn(id, true);
                }
            },
            addMobile: function () { //向数组中添加一项
                var $basicInfoMobile = $('#basicInfoMobile');
                var lens = $basicInfoMobile.find('.layui-form-item').length;
                if(template){
                    var html = template('tpl-mobile',{index:lens++})
                    $basicInfoMobile.append(html);
                }
                this.checkMobile.push({
                    err: ''
                });
            },
            delMobileItem: function (index) { //基本信息中删除增加的电话项
                if (index != undefined) {
                    this.basicInfo.mobile.splice(index, 1);
                }
            },
            numVerify: function (type, num, str, index) { //验证号码是否重复id:客户ID，type:号码类型 1 电话号码 2 微信号 3 QQ号，num：需要验证的号码的DOM，action_type ：add 新增 update 编辑
                if (type == 2 || type == 3 || type == 4) {
                    num = num.target.value;
                }
                main.numVerify(vm.customer_id, type, num, str, index);
            },
            mobileVerify:function(index){
                main.mobileVerify(index);
            },
            basicBack: function () { //基本信息页面返回上一页
                common.closeTab();
            },
            cancel: function () { //编辑基本情况取消按钮
                this.editBasic = false;
                this.basicInfo = JSON.parse(this.basicInfoData);
                this.finance_info = JSON.parse(this.financeInfoData);
            },
            followTab: function (i) { //跟进信息下面的四个信息切换
                this.filterFollow.type = i;
                this.filterFollow.curpage = 1;
                main.getFollowInfo();
            },
            inquiryFollow: function () { //查询跟进信息
                this.filterFollow.curpage = 1;
                main.getFollowInfo();
            },
            resetFollow: function () { //初始化筛选跟进信息条件
                main.resetFollow(function () {
                    main.getFollowInfo();
                });
            },
            followContent: function (index) { //多选与取消跟进信息类型
                main.followContent(index);
            },
            playFollow: function (url, title, time) { //跟进信息列表播放语音
                window.top.jplayer(url, title, time);
            },
            followBack:function(){//直接从其他页面跳转到跟进信息的显示返回按钮，并返回来路页
                common.closeTab();
            },
            isEditFollow: function () { //是否编辑跟进信息
                this.editFollow = !this.editFollow;
                this.follow_product = JSON.parse(this.global_product);
                this.isEditAdd = false; //新增跟进信息标识
                setTimeout(function () {
                    layui.use('form', function () {
                        var form = layui.form;
                        form.render();
                    });
                }, 200);
            },
            del_item_Follow: function (id, index) { //删除某条跟进信息
                main.del_item_Follow(id, index);
            },
            delFollowImg: function (i) { //删除跟进信息上传图片
                main.delFollowImg(i, this.editFollowData.images);
            },
            edit_item_Follow: function (id) { //编辑某条跟进信息
                main.edit_item_Follow(id);
            },
            delFollowImage: function (index, image, thumb_image) { //删除跟进信息中的已上传的图片
                var that = this;
                if (index != undefined) {
                    main.delImage(image, thumb_image, function () {
                        that.editFollowData.images.splice(index, 1);
                    });
                }
            },
            addRecord: function () { //添加录音记录
                main.addRecord();
            },
            cancelFollow: function () { //取消编辑跟进信息
                this.editFollowData.record = '';
                this.editFollowData.images = [];
                this.editFollow = false;
                return false;
            },
            addCoop: function () { //新增合作情况完善信息提示
                main.perfectTip();
            },
            alterServeTime: function (data,index) { //提前终止服务期限
                main.alterServeTime(data,index);
            },
            cooprationCancel: function () { //新增合作情况返回按钮
                if(this.isCooperAdd){//当为新增时，返回合作情况列表页
                    this.editCooperation = false;
                    this.isCooperAdd = false;
                    var cacheCooperData = JSON.parse(this.cacheCooperData);
                    this.cooper_situation_base = cacheCooperData.cooper_situation_base;
                    this.sp_saleprocess = cacheCooperData.sp_saleprocess;
                    return;
                }
                common.closeTab();
                return false;
            },
            payRecord: function () { //关联购买记录
                main.payRecord();
            },
            addSaleprocess: function (index) { //新增销售信息
                main.addSaleprocess(index);
            },
            addProductItem: function (index) { //新增销售信息确认按钮
                main.addProductItem(index);
            },
            cancelProductItem: function (index) { //新增销售信息取消按钮
                $('.sales-process').find('.sales-process-item').eq(index).find('.new-item-content').addClass('layui-hide');
                this.sp_saleprocess[index].userdesc = '';
                this.sp_saleprocess[index].userimages = [];
            },
            delProductItem: function (index, i) { //删除销售过程中的某一项
                vm.sp_saleprocess[index].info.splice(i, 1);
            },
            delRecordItem: function (index) { //删除添加的录音记录
                if (index != undefined) {
                    this.editFollowData.voice_record.splice(index, 1);
                }
            },
            associateTrack: function (index) { //关联跟进信息
                main.associateTrack((index));
            },
            delAnnexImage: function (index, image, thumb_image) { //删除合作情况附件已上传的图片
                var that = this;
                if (index != undefined) {
                    main.delImage(image, thumb_image, function () {
                        that.cooper_situation_base.attachment.image.splice(index, 1);
                    });
                }
            },
            delPaymentImage: function (index, image, thumb_image) { //删除合作情况的付费凭证中已上传的图片
                var that = this;
                if (index != undefined) {
                    main.delImage(image, thumb_image, function () {
                        that.cooper_situation_base.payment_certificate.splice(index, 1);
                    });
                }
            },
            delVoice: function (index, url) { //删除附件上传的录音
                main.delVioce(url, function () {
                    vm.cooper_situation_base.attachment.voice.splice(index, 1)
                });
            },
            delSalesImage: function (index, imgsi, image, thumb_image) { //删除销售过程已上传的图片
                var that = this;
                if (index != undefined && imgsi != undefined) {
                    main.delImage(image, thumb_image, function () {
                        that.sp_saleprocess[index].userimages.splice(imgsi, 1);
                    });
                }
            },
        },
        filters: {
            formatSex: function (value) {
                if (value == '******') {
                    return value;
                }
                var sex = '';
                switch (value) {
                    case '0':
                        sex = '--';
                        break;
                    case '1':
                        sex = '男';
                        break;
                    case '2':
                        sex = '女';
                        break;
                    case '3':
                        sex = '未知';
                        break;
                    default:
                        sex = '未知';
                        break;
                }
                return sex;
            },
            VformatM: function (value) {
                if (value == undefined || value == null || value == '') {
                    return '--';
                }
                var t;
                value = value - 0;
                if (value > -1) {
                    var hour = Math.floor(value / 3600);
                    var min = Math.floor(value / 60) % 60;
                    var sec = value % 60;
                    if(hour != 0){
                        if (hour < 10) {
                            t = '0' + hour + ":";
                        } else {
                            t = hour + ":";
                        }
                    }else{
                        t = '';
                    }

                    if (min < 10) {
                        t += "0";
                    }
                    t += min + ":";
                    if (sec < 10) {
                        t += "0";
                    }
                    t += sec;
                }
                return t;
            }
        }
    });
//template过滤器
    template.helper('formatM', function (value) {
        if (value == undefined || value == null || value == '') {
            return '--';
        }
        var t;
        value = value - 0;
        if (value > -1) {
            var hour = Math.floor(value / 3600);
            var min = Math.floor(value / 60) % 60;
            var sec = value % 60;
            if(hour != 0){
                if (hour < 10) {
                    t = '0' + hour + ":";
                } else {
                    t = hour + ":";
                }
            }else{
                t = '';
            }

            if (min < 10) {
                t += "0";
            }
            t += min + ":";
            if (sec < 10) {
                t += "0";
            }
            t += sec;
        }
        return t;
    });
    var _init = function(){
        common.getTabLink();
        main.getDataAuth(function(){
            main.globalSet(function(){
                main.getUrlData();
                main.tabSwitch();
            });
            main.initLayui();
            main.checkAddMobile();
        });
    };
    _init();
})
/**
 * Created by Administrator on 2017-10-13.
 */
require(['vue', 'layui', 'common', 'upload', 'tools', 'ajaxurl', 'layers', 'text!/assets/popup/contract-audit.html', 'text!/assets/popup/add-contract.html', 'text!/assets/popup/edit-contract.html', 'text!/assets/popup/edit-remark.html', 'template','lightbox'], function (Vue, layui, common, upload, tool, ajaxurl, layers, contractAudit, addContract, editContract, editRemark, template, lightbox) {
    template.config('openTag', '{?');
    template.config('closeTag', '?}');
    var main = {
        upeditflag: true, //
        /**
         * [admin description] 获取用户信息
         * @return {[type]} [description]
         */
        admin:function(){
            var userinfo = common.getUserInfo();
            if(userinfo){
                vm.userinfo = userinfo;
            }
        },
        /**
         * [getMarkList description] 获取合同审核页面
         * @return {[type]} [description]
         */
        getContractList: function(){
            var selCode = '';
            if(vm.getUrls.has){
                selCode = vm.getUrls.data.id;
            }
            tool.ajax({
                url: ajaxurl.contract.contract_view,
                data:{cooper_id: selCode},
                type: 'post',
                success:function(result){
                    if(result.code == 1){
                        if(result.data != undefined){
                            vm.contractList = result.data;
                            vm.situation_id = result.data.customer_id;
                            main.getTagMark();
                        }
                    }else{
                        layers.toast(result.message);
                    }
                }
            })
        },
        /**
         * 审核
         */
        contractAudit: function() {
            layers.open({
                title: '提示',
                area: ['450px', '340px'],
                content: contractAudit,
                success: function() {
                    layui.use(['form'], function () {
                        var form = layui.form;
                        form.render();
                    })
                },
                btn2: function() {
                    var selCode = '',
                        action = $(".finance-select").find(".layui-this").attr("lay-value"),
                        reason = $(".finance-textarea").val();
                        if(vm.getUrls.has){
                            selCode = vm.getUrls.data.id;
                        }
                    if(action === undefined) {
                        layers.toast("请选择审核结果");
                        return;
                    }
                    tool.ajax({
                        url: ajaxurl.contract.contract_post,
                        type: 'post',
                        data: {cooper_id: selCode, action: action, reason: reason},
                        success: function (result) {
                            if (result.code == 1) {
                                //layers.toast(result.message);
                                setTimeout(function() {
                                    window.location.reload();
                                }, 1000)
                            } else {
                                layers.toast(result.message);
                            }
                        },
                        error: function () {
                            console.log("网络异常!")
                        }
                    });
                }
            });
        },
        /**
         * 获取标签和备注
         */
        getTagMark: function () {
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
                }
            });
        },
        getTagMarkBefore: function(callback) {
            // 获取单个用户备注列表
            var customerId = '';
            if(vm.getUrls.has){
                customerId = vm.getUrls.data.id;
            }
            tool.ajax({
                url: ajaxurl.remarks.archives,
                data: {
                    situation_id: customerId // 用户id
                },
                success: function (result) {
                    if (result.code === 1) {
                        vm.gainRemarkList = result.data.list;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(result.message);
                    }
                }
            });
        },
        /**
         * 编辑备注询问框
         */
        editRemark: function () {
            main.getTagMarkBefore(function() {
                layers.open({
                    btn: null,
                    title: '添加备注',
                    area: ['604px', 'auto'],
                    content: editRemark,
                    success: function (layero, index) {
                        var $layero = $(layero);
                        var addedId = [];
                        var selCode = '';
                        if(vm.getUrls.has){
                            selCode = vm.getUrls.data.id;
                        }
                        $layero.find('.tag-group').html(template('addRemark', {data: vm.remarkList, datas: vm.gainRemarkList}));

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
                            var urls = tool.getUrlArgs(), customerId = '';
                            if(urls.has){
                                customerId = urls.data.id;
                            }
                            tool.ajax({
                                url: ajaxurl.remarks.hit,
                                data: {
                                    mark_id: addedId.join(','),
                                    situation_id: customerId // 用户id
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
                            var urls = tool.getUrlArgs(), customerId = '';
                            if(urls.has){
                                customerId = urls.data.id;
                            }
                            // 发送请求
                            tool.ajax({
                                url: ajaxurl.remarks.del_coo_mark,
                                data: {
                                    mark_id: mark_id,
                                    situation_id: customerId // 用户id
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
                        // 全选
                        $layero.on("click", ".check-select", function() {
                            $(event.target).addClass("active");
                            $(event.target).siblings("a").removeClass("active");
                        })
                    }
                });
            });
        },
        /**
         * 添加合同和邮寄记录
         */
        addContract: function() {
            var that = this;
            layers.open({
                title: '添加合同信息',
                area: ['700px', '500px'],
                content: addContract,
                success: function(layero, index) {
                    var selCode = '', 
                        delivery_number = $(".department_name").val(), 
                        $layero = $(layero), 
                        uploadLoading = '',
                        editsingimgs = $layero.find('#addUploadBoxs'); //弹窗中存放图片的容器
                        vm.tempImages = []; //初始置空
                    if(vm.getUrls.has){
                        selCode = vm.getUrls.data.id;
                    }

                    //用于数据回显
                    $(layero).find('input[name="time"]').val(vm.contractList.post_time);
                    $(layero).find('textarea[name="waybill"]').val(vm.contractList.delivery_number);
                    $(layero).find('input[name="contract"]').val(vm.contractList.contract_sn);
                    var contract_images = vm.contractList.contract_images, 
                        contract_images_len = contract_images.length,
                        contractHtmlStr = '',
                        tempHtmlImage = [];
                    if(contract_images_len){
                        for(var i = 0; i < contract_images_len; i++){
                            contractHtmlStr += '<a href="javascript:;" class="imgs"><img src="'+ contract_images[i].thumb_image +'" width="60" height="60" /><i class="layui-icon delUpImg" data-index="'+i+'" data-paths="'+contract_images[i].thumb_image+','+contract_images[i].image+'">&#x1007;</i></a>'; 
                            tempHtmlImage.push({thumb_image:contract_images[i].thumb_image,image:contract_images[i].image});
                        }
                        editsingimgs.html(contractHtmlStr);
                        vm.tempImages = tempHtmlImage;
                    }

                    //初始化日期插件
                    layui.use('laydate', function(){
                        var laydate = layui.laydate;
                        //执行一个laydate实例
                        laydate.render({
                            elem: '#addDateTime', //指定元素
                            type: 'datetime'
                        });
                    });

                    var uploadLoading = '';
                    //初始化图片上传
                    upload.init({
                        elem: '#addUploadBtn',
                        field: 'fileUpload',
                        //auto: false, // 关闭自动上传
                        bindAction: '.triggerUpload',// 由确定按钮触发上传
                        before: function () {
                            layers.load(function (indexs) {
                                uploadLoading = indexs;
                            });
                        },
                        done: function (data) {
                            if (data.code === 1) {
                                //处理图片的临时展示
                                vm.tempImages.push(data.data);
                                var tempLens = vm.tempImages.length, htmlStr = '';
                                if(tempLens){
                                    for(var i = 0; i < tempLens; i++){
                                        htmlStr += '<a href="javascript:;" class="imgs"><img src="'+ vm.tempImages[i].thumb_image +'" width="60" height="60" /><i class="layui-icon delUpImg" data-index="'+i+'" data-paths="'+vm.tempImages[i].thumb_image+','+vm.tempImages[i].image+'">&#x1007;</i></a>'; 
                                    }
                                    editsingimgs.html(htmlStr);
                                }
                            } else {
                                layers.toast(data.message, 2000);
                            }
                            layers.closed(uploadLoading);
                        },
                        error: function () {
                            layers.closed(uploadLoading);
                        }
                    });

                    //删除上传的图片
                    $(layero).off('click').on('click','i.delUpImg',function(event){
                        var __this = $(this), paths = __this.data('paths'), imgsIndex = __this.data('index');
                        that.delImage(paths, function(){
                            vm.tempImages.splice(imgsIndex, 1);
                            __this.closest('a.imgs').remove();
                        })
                    });
                },
                btn2: function(index, layero){
                    var $layero = $(layero);
                    var time = $.trim($(layero).find('input[name="time"]').val());
                    var waybill = $.trim($(layero).find('textarea[name="waybill"]').val());
                    var contract = $.trim($(layero).find('input[name="contract"]').val());
                    if(time == '' && waybill == '' && contract == '' && vm.tempImages.length == 0) {
                        return;
                    }
                    var tempImagesLens = vm.tempImages.length, contract_images = [];
                    // for(var i = 0; i < tempImagesLens; i++){
                    //     contract_images.push({image: vm.tempImages[i].image, thumb_image: vm.tempImages[i].thumb_image});
                    // }
                    var datas = {
                        post_time: time,
                        delivery_number: waybill,
                        contract_sn: contract,
                        contract_images: vm.tempImages
                    };
                    that.upeditflag && that.upAddContract(datas);
                    return false;
                }
            });
        },
        /**
         * [upAddContract description] 合同信息添加
         * @param  {[type]} datas [description]
         * @return {[type]}       [description]
         */
        upAddContract: function(datas){
            if($.isEmptyObject(datas)){
                throw new Error('参数错误');
            }
            var contract_id = '',
                that = this;
            var cooper_id = '';
            if(vm.getUrls.has){
                cooper_id = vm.getUrls.data.id;
            } 
            datas.cooper_id = cooper_id;
            tool.ajax({
                url: ajaxurl.contract.contract_add,
                data: datas,
                type: 'post',
                beforeSend:function(){
                    that.upeditflag = false;
                },
                success: function(result){
                    if(result.code == 1){
                        layers.toast('新增成功！');
                        vm.tempImages = []; //缓存图片的清空
                        setTimeout(function(){
                            window.location.reload();
                        },1000);
                    }else{
                        layers.toast(result.message);
                    }
                },
                complete: function(){

                    setTimeout(function(){
                        that.upeditflag = true;
                    },800);
                }
            })
        },
        /**
         * 编辑合同和邮寄记录
         */
        editContract: function() {
            var that = this;
            layers.open({
                title: '编辑合同信息',
                area: ['700px', '500px'],
                content: editContract,
                success: function(layero, index) {
                    var selCode = '', 
                        delivery_number = $(".department_name").val(), 
                        $layero = $(layero), 
                        uploadLoading = '',
                        editsingimgs = $layero.find('#editUploadBoxs'); //弹窗中存放图片的容器
                        vm.tempImages = []; //初始置空
                    if(vm.getUrls.has){
                        selCode = vm.getUrls.data.id;
                    }

                    //用于数据回显
                    $(layero).find('input[name="time"]').val(vm.contractList.post_time);
                    $(layero).find('textarea[name="waybill"]').val(vm.contractList.delivery_number);
                    $(layero).find('input[name="contract"]').val(vm.contractList.contract_sn);
                    var contract_images = vm.contractList.contract_images, 
                        contract_images_len = contract_images.length,
                        contractHtmlStr = '';
                        tempHtmlImage = [];
                    if(contract_images_len){
                        for(var i = 0; i < contract_images_len; i++){
                            contractHtmlStr += '<a href="javascript:;" class="imgs"><img src="'+ contract_images[i].thumb_image +'" width="60" height="60" /><i class="layui-icon delUpImg" data-index="'+i+'" data-paths="'+contract_images[i].thumb_image+','+contract_images[i].image+'">&#x1007;</i></a>'; 
                            tempHtmlImage.push({thumb_image:contract_images[i].thumb_image,image:contract_images[i].image});
                        }
                        editsingimgs.html(contractHtmlStr);
                        vm.tempImages = tempHtmlImage;
                    }
                    //console.log(vm.tempImages);
                    //初始化日期插件
                    layui.use('laydate', function(){
                        var laydate = layui.laydate;
                        //执行一个laydate实例
                        laydate.render({
                            elem: '#editDateTime', //指定元素
                            type: 'datetime'
                        });
                    });

                    var uploadLoading = '';
                    //初始化图片上传
                    upload.init({
                        elem: '#editUploadBtn',
                        field: 'fileUpload',
                        //auto: false, // 关闭自动上传
                        bindAction: '.triggerUpload',// 由确定按钮触发上传
                        before: function () {
                            layers.load(function (indexs) {
                                uploadLoading = indexs;
                            });
                        },
                        done: function (data) {
                            if (data.code === 1) {
                                //处理图片的临时展示
                                vm.tempImages.push(data.data);
                                var tempLens = vm.tempImages.length, htmlStr = '';
                                if(tempLens){
                                    for(var i = 0; i < tempLens; i++){
                                        htmlStr += '<a href="javascript:;" class="imgs"><img src="'+ vm.tempImages[i].thumb_image +'" width="60" height="60" /><i class="layui-icon delUpImg" data-index="'+i+'" data-paths="'+vm.tempImages[i].thumb_image+','+vm.tempImages[i].image+'">&#x1007;</i></a>'; 
                                    }
                                    editsingimgs.html(htmlStr);
                                }
                            } else {
                                layers.toast(data.message, 2000);
                            }
                            layers.closed(uploadLoading);
                        },
                        error: function () {
                            layers.closed(uploadLoading);
                        }
                    });

                    //删除上传的图片
                    $(layero).off('click').on('click','i.delUpImg',function(event){
                        var __this = $(this), paths = __this.data('paths'), imgsIndex = __this.data('index');
                        that.delImage(paths, function(){
                            vm.tempImages.splice(imgsIndex, 1);
                            __this.closest('a.imgs').remove();
                        })
                    });
                },
                btn2: function(index, layero){
                    var $layero = $(layero);
                    var time = $.trim($(layero).find('input[name="time"]').val());
                    var waybill = $.trim($(layero).find('textarea[name="waybill"]').val());
                    var contract = $.trim($(layero).find('input[name="contract"]').val());
                    // if(time == ''){
                    //     layers.toast('请选择邮寄时间！', {
                    //         icon: 2,
                    //         anim: 6
                    //     });
                    //     return false;
                    // }
                    // if(waybill == ''){
                    //     layers.toast('请填写快递公司及运单号！', {
                    //         icon: 2,
                    //         anim: 6
                    //     });
                    //     return false;
                    // }
                    // if(contract == ''){
                    //     layers.toast('请填写合同编号！', {
                    //         icon: 2,
                    //         anim: 6
                    //     });
                    //     return false;
                    // }
                    // if(vm.tempImages.length == 0){
                    //     layers.toast('请上传合同图片！', {
                    //         icon: 2,
                    //         anim: 6
                    //     });
                    //     return false;
                    // }
                    var tempImagesLens = vm.tempImages.length, contract_images = [];
                    // for(var i = 0; i < tempImagesLens; i++){
                    //     contract_images.push({image: vm.tempImages[i].image, thumb_image: vm.tempImages[i].thumb_image});
                    // }
                    var datas = {
                        post_time: time,
                        delivery_number: waybill,
                        contract_sn: contract,
                        contract_images: vm.tempImages
                    };
                    that.upeditflag && that.upEditContract(datas);
                    return false;
                }
            });
        },
        /**
         * [upEditContract description] 提交编辑信息
         * @param  {[type]} datas [description]
         * @return {[type]}       [description]
         */
        upEditContract: function(datas){
            if($.isEmptyObject(datas)){
                throw new Error('参数错误');
            }
            var contract_id = vm.contractList.contract_id,
                that = this;
            datas.contract_id = contract_id;
            tool.ajax({
                url: ajaxurl.contract.contract_edit,
                data: datas,
                type: 'post',
                beforeSend:function(){
                    that.upeditflag = false;
                },
                success: function(result){
                    if(result.code == 1){
                        layers.toast('编辑成功！');
                        vm.tempImages = []; //缓存图片的清空
                        setTimeout(function(){
                            window.location.reload();
                        },1000);
                    }else{
                        layers.toast(result.message);
                    }
                },
                complete: function(){

                    setTimeout(function(){
                        that.upeditflag = true;
                    },800);
                }
            })
        },
        /**
         * [delImage description] 删除指定图片
         * @param  {[type]}   path     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        delImage: function(path, callback){
            if(!path){
                throw new Error('删除图片的路径不存在！');
            }
            var loadIndex = '';
            tool.ajax({
                url: ajaxurl.upload.deleteOssFile,
                data: {
                    delete_file_path: path
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
        lightboxs: function(){
            lightbox.init('#edit-sing-imgs')
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            situation_id: '',
            userinfo: '',
            contractList: {},
            stopClick: true,
            tempImages: [], //缓存临时上传图片
            getUrls: tool.getUrlArgs()
        },
        methods: {
            contractAudit: function() {
                main.contractAudit();
            },
            // 编辑备注
            editRemark: function() {
                main.editRemark();
            },
            // 添加合同和邮寄记录
            addContract: function() {
                main.addContract()
            },
            // 编辑合同和邮寄记录
            editContract: function() {
                main.editContract();
            }
        }
    });

    /**
     * 注册全局过滤组件
     */
    Vue.filter("isMaxLen", function (str, len) {
        /**
         *  输入的只有中文,一个中文占两个字符
         *  @param str 传入的字符串
         *  @param len 限制的字符串的长度
         */
        var regexp = /[^\x00-\xff]/g, // 正则表达式匹配中文
            strLen = str.replace(regexp, "aa").length; // 获取字符串字节长度
        if (strLen <= len) { // 当字符串字节长度小于指定的字节长度时
            return str;
        }
        // 假设指定长度内都是中文
        var m = Math.floor(len/2);
        for (var i = m, j = str.length; i < j; i++) {
            // 当截取字符串字节长度满足指定的字节长度
            if (str.substring(0, i).replace(regexp, "aa").length >= 0) {
                return str.substring(0, i);
            }
        }
        return str;
    });
    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.admin();
        main.getContractList();
        main.lightboxs();
    };
    _init();
});

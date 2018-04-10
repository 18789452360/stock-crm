/**
 * Created by Administrator on 2017-10-10.
 * 标的管理
 */
require(['common', 'layui', 'ajaxurl', 'tools', 'layers', 'upload'], function (common, layui, ajaxurl, tool, layers, upload) {

    var main = {
        /**
         * 获取标的全部信息
         */
        getAllList: function() {
            var urls = tool.getUrlArgs();
            if(urls.has){
                vm.productStrockId = urls.data.product_stock_id;
                vm.productId = urls.data.product_id;
                vm.id = urls.data.id;
            }
            tool.ajax({
                url: ajaxurl.productStock.detail,
                type: 'post',
                data: {
                    product_stock_id: vm.productStrockId,
                    info_type: 666
                },
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.tableDataBase = result.data.product_stock_base;
                    }else{
                        layers.toast(result.message);
                    }
                },
                error: function(){
                    layers.toast("网络异常!")
                }
            });
        },
        /**
         * [uploadImg description] 上传文件
         * @return {[type]} [description]
         */
        uploadFile: function() {
            layui.use('upload', function(){
                //获取upload实列
                var upload = layui.upload,
                    loading = '';
                upload.render({
                    elem: '#test', // 指向容器选择器，如：elem: '#id'。也可以是DOM对象
                    url: ajaxurl.productReport.ftp_upload, // 上传接口地址
                    method: 'post', // 上传接口的 HTTP 类型(默认post)
                    accept: 'file', // 指定允许上传的文件类型，可选值有：images（图片）、file（所有文件）、video（视频）、audio（音频）
                    exts: 'mp3|wav|docx|txt|doc|wps|xls|xlsx|ppt|rar|pdf|swf|html|htm', // 允许上传的文件后缀
                    field: 'fileUpload', // 设定文件域的字段名
                    size: 5120000, // 文件最大为5M
                    before: function () {
                        layers.load(function (indexs) {
                            loading = indexs;
                        });
                    },
                    done: function (data) {
                        if(data.code == 1) {
                            vm.editFollowData = data.data;
                        } else {
                            layers.toast(data.message);
                        }
                        layers.closed(loading);
                    },
                    error: function () {
                        layers.closed(loading);
                    }
                });
            });
        },
        /**
         *  删除研报附件
         */
        delReport: function (reportUrl) {
            if (!reportUrl) {
                throw new Error('缺少附件路径！');
            }
            var loadIndex = '';
            tool.ajax({
                url: ajaxurl.upload.deleteOssFile,
                data: {
                    delete_file_path: reportUrl
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (index) {
                        loadIndex = index;
                    })
                },
                success: function (result) {
                    if (result.code == 1) {
                        vm.editFollowData = '';
                        layers.toast(result.message);
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
         * 创建表单
         */
        createForm: function() {
            layui.use("form", function() {
                var form = layui.form;
                form.on('submit(reportForm)', function(data) {
                    data.field.product_id = vm.productId;
                    data.field.product_stock_id = vm.productStrockId;
                    data.field.filename = vm.editFollowData.videoname;
                    main.addReport(data.field)
                })
            });
        },
        /**
         * 新增研报
         */
        addReport: function(datas) {
            if(vm.isTrue) {
                vm.isTrue = false;
                tool.ajax({
                    url: ajaxurl.productReport.add,
                    type: 'post',
                    data: datas,
                    success: function(result){
                        if(result.code == 1){
                            // 渲染到vue数据层
                            layers.toast("新增成功");
                            setTimeout(function() {
                                common.closeTab(true);
                            }, 500)
                        } else {
                            layers.toast(result.message);
                        }
                    },
                    error: function(){
                        layers.toast("网络异常!")
                    }
                });
            }
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            tableDataBase: [], // 标的基础信息
            productStrockId: '', // 标的id
            productId: '', // 产品id
            id: '', // 研报id
            editFollowData: '', // 储存研报服务器端返回的信息
            addressShow: false, // 研报链接隐藏域控制
            isTrue: true,
            reportName: {
                text: ''
            },
            verifyData: {
                verifyName: {text: '123', checkShow: false}
            }
        },
        methods: {
            delReport: function(reportUrl) {
                main.delReport(reportUrl)
            },
            cancel: function(){
                common.closeTab();
            }
        },
        watch:{   //watch()监听某个值（双向绑定）的变化，从而达到change事件监听的效果
            reportName:{
                handler:function(newVal, oldVal){
                    if(newVal.text.length >= 30) {
                        this.verifyData.verifyName = {
                            text: '内容已达上线，最多输入30个字符',
                            checkShow: true
                        }
                    } else {
                        this.verifyData.verifyName = {
                            text: '',
                            checkShow: false
                        }
                    }
                },
                deep:true
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        common.getTabLink();
        main.createForm();
        main.uploadFile();
        main.getAllList();
    };
    _init();
});

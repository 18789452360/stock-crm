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
         * 获取研报的信息
         */
        getReport: function(callback) {
            tool.ajax({
                url: ajaxurl.productReport.findProductReportById,
                data: {
                    product_report_id: vm.id
                },
                type: 'post',
                success: function (result) {
                    if (result.code == 1) {
                        vm.tableDataReoprt = result.data.report_info;
                        vm.editFollowNameData = result.data.report_info.filename;
                        vm.editFollowUrlData = result.data.report_info.attachment;
                        vm.productReportId = result.data.report_info.id;
                        tool.setCookie('setVal', vm.tableDataReoprt);
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(result.message);
                    }
                },
                error: function () {
                    layers.toast('网络异常');
                }
            })
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
                        if (data.code == 1) {
                            vm.editFollowNameData = data.data.videoname;
                            vm.editFollowUrlData = data.data.video;
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
                        vm.editFollowNameData = '';
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
                    data.field.product_report_id = vm.productReportId;
                    data.field.filename = vm.editFollowNameData;
                    main.editReport(data.field)
                })
            });
        },
        /**
         * 编辑研报
         */
        editReport: function(datas) {
            if(vm.isTrue) {
                vm.isTrue = false;
                tool.ajax({
                    url: ajaxurl.productReport.editProductReport,
                    type: 'post',
                    data: datas,
                    success: function(result){
                        if(result.code == 1){
                            // 渲染到vue数据层
                            layers.toast("编辑成功");
                            setTimeout(function() {
                                common.closeTab(true);
                            }, 1000)
                        } else {
                            layers.toast(result.message);
                        }
                    },
                    error: function(){
                        layers.toast("网络异常!")
                    }
                });
            }
        },
        /**
         * 下载研报
         */
        downAttach: function() {
            tool.ajax({
                url: ajaxurl.productReport.downAttachment,
                data: {
                    id: vm.productReportId
                },
                type: 'post',
                success: function (res) {
                    if (res.code === 1) {
                        vm.reportUrl = res.data;
                    } else {
                        //layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 取消操作判断用户是否更改表单数据
         */
        cancel: function() {
            // 获取cookie储存的val值
            var setVal = tool.getCookie('setVal');
            // 储存当前的值到setValNew
            //vm.tableDataReoprt.attachment = vm.editFollowUrlData; // 地址的变化(需后台处理返回的地址的头部统一)
            vm.tableDataReoprt.filename = vm.editFollowNameData;
            tool.setCookie('setValNew', vm.tableDataReoprt);
            var setValNew = tool.getCookie('setValNew');
            // 判断用户操作前后数据是否发生了变化
            var queryVal = main.diff(setVal, setValNew);
            if(!queryVal) {
                // 提示用户数据已发生改变
                layers.confirm({
                    title: '提示',
                    area: ['450px', '250px'],
                    content: '<div class="confirm-tips"><p>取消操作将不保留已变更信息，确认取消？</p></div>',
                    btn2: function (index, layero) {
                        common.closeTab();
                    }
                });
            } else {
                common.closeTab();
            }
        },
        /**
         * 判断对象的值是否相等
         */
        diff: function(obj1,obj2){
            var o1 = obj1 instanceof Object;
            var o2 = obj2 instanceof Object;
            if(!o1 || !o2){ //判断不是对象
                return obj1 === obj2;
            }
            if(Object.keys(obj1).length !== Object.keys(obj2).length){
                return false;
                // Object.keys() 返回一个由对象的自身可枚举属性(key值)组成的数组,例如：数组返回下表：let arr = ["a", "b", "c"];
                // console.log(Object.keys(arr))->0,1,2;
            }
            for(var attr in obj1){
                var t1 = obj1[attr] instanceof Object;
                var t2 = obj2[attr] instanceof Object;
                if(t1 && t2){
                    return diff(obj1[attr],obj2[attr]);
                }else if(obj1[attr] !== obj2[attr]){
                    return false;
                }
            }
            return true;
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            tableDataBase: [], // 标的基础信息
            tableDataReoprt: [], // 研报的基础信息
            productStrockId: '', // 标的id
            productReportId: '', // 研报的id
            productId: '', // 产品id
            id: '', // 研报id
            editFollowData: '', // 储存研报服务器端返回的信息
            editFollowNameData: '', // 储存研报服务器端返回的信息
            editFollowUrlData: '', // 储存研报服务器端返回的信息
            addressShow: false, // 研报链接隐藏域控制
            isTrue: true,
            verifyData: {
                verifyName: {text: '123', checkShow: false}
            },
            reportUrl: ''
        },
        methods: {
            delReport: function(reportUrl) {
                main.delReport(reportUrl)
            },
            cancel: function() {
                main.cancel();
            }
        },
        watch:{   //watch()监听某个值（双向绑定）的变化，从而达到change事件监听的效果
            tableDataReoprt:{
                handler:function(newVal, oldVal){
                    if(newVal.report_name.length >= 30) {
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
        main.getReport(function() {
            main.downAttach()
        });
    };
    _init();
});

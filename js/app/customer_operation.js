require(['layui', 'common', 'layers','ajaxurl', 'tools', 'upload', 'lightbox', 'template', 'page'], function (layui, common, layers, ajaxurl, tool, upload, lightbox, template, page) {
    //修改template模板界定符
    template.config('openTag', '{%');
    template.config('closeTag', '%}');
    var main = {
        /**
         * 默认加载进来URL处理
         */
        getUrl: function () {
            var urls = vm.getUrls;
            if (urls.has) {
                if (urls.data.customer_id != '' && urls.data.customer_id != undefined) { //缺少客户id
                    main.getFileHead(); //获取档案头部信息
                } else {
                    layers.toast('缺少customer_id参数');
                    return false;
                }
            } else {
                layers.toast('缺少参数');
                return false;
            }
        },
        /**
         * 设置权限管理
         */
        getDataAuth: function (callback) {
            tool.ajax({
                url: ajaxurl.setting.getDataAuth,
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        vm.customer = data.data.noHas_auth.customer;
                        vm.customer_contact = data.data.noHas_auth.customer_contact;
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
         * 获取全局配置项1
         */
        globalSet: function (callback) {
            var urls = vm.getUrls,
                that = this;
            tool.ajax({
                url: ajaxurl.setting.index,
                data: {
                    type: 1
                },
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        vm.global_set = data.data;
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
         * 获取档案头部信息1
         */
        getFileHead: function (render) {
            var loading = '';
            vm.customer_id = tool.getUrlArgs().data.customer_id;
            tool.ajax({
                url: ajaxurl.customer.getInfo,
                data: {
                    customer_id: vm.customer_id
                },
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        vm.headInfo = data.data;
                        vm.customer_from_channel_text = data.data.from_channel == '******' ? data.data.from_channel : vm.customer_from_channel[data.data.from_channel];
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                },
                 error: function (err) {
                    layers.toast('网络异常!');
                    layers.closed(loading);
                }
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
         * [getTableData description]获取表单数据
         * @return {[type]} [description]
         */
        getTableData:function(type,name,Stime,Dtime){
            vm.customer_id = tool.getUrlArgs().data.customer_id;
            layui.use([ 'laydate'],function(){
                var laydate = layui.laydate;
                // 执行一个laydate实例
                lay('.test-item').each(function(){
                    laydate.render({
                        elem: this
                        ,trigger: 'click'
                        ,type: "datetime"
                    });
                });
            tool.ajax({
                url: ajaxurl.customer.operationLog,
                type: 'post',
                data:{
                    operate_real_name:name,
                    start_time:Stime,
                    end_time:Dtime,
                    type:type,
                    pagesize:vm.pagesize,
                    curpage:vm.page,
                    customer_id: vm.customer_id
                },
                success: function (data) {
                    if (data.code == 1) {
                        vm.TableData = data.data.list;
                        vm.TableDatatotle = data.data.total_num;
                        main.getAllPage();
                    } else {
                        layers.toast(data.message, {
                            icon: 2,
                            anim: 6
                        });
                    }
                }
            });
            })
        },
        /**
         * 模糊查询
         */
        jurQuery: function() {
            layui.use(['form', 'laydate'],function() {
                var form = layui.form,
                    laydate = layui.laydate;
                //监听提交
                form.on('submit(formTable)', function (data) {
                    if (!$.isEmptyObject(data.field)) {
                        vm.Stime = data.field.start_time;
                        vm.Etime = data.field.stop_time;
                        vm.Opname = data.field.name;
                        vm.page = 1;
                        if(new Date(vm.Etime) - new Date(vm.Stime) <= 0){
                            layers.toast('首次时间不能大于结束时间！', {
                                icon: 2,
                                anim: 6
                            });
                            return false;
                        }
                        main.getTableData(vm.type,vm.Opname,vm.Stime,vm.Etime);
                        return false;
                    }
                    return false;
                })
            })
        },
        /**
         * 分页 (全部)
         */
        getAllPage: function() {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'test',
                    count: vm.TableDatatotle    // 数据总数
                    ,limit: vm.pagesize         // 每页显示条数
                    ,curr: vm.page           // 当前页数
                    ,jump: function (obj, first) {
                        if (!first) {
                            vm.pagesize = obj.limit;    // 获取每页显示条数
                            vm.page = obj.curr;      // 获取当前页
                            main.getTableData(vm.type,vm.Opname,vm.Stime,vm.Dtime);           // 发送请求
                        }
                    }
                });
            });
        },
    };
    var vm = new Vue({
        el: '#app',
        data: {
            tabs: {
                basic: 0, //基本信息页面
                follow: 0, //跟进信息页面
                cooperation: 0 //合作情况页面
            },
            getUrls: tool.getUrlArgs(), //获取Url参数1
            userinfo: common.getUserInfo(),
            global_set: '', //全局配置
            customer_from_channel: '', //客户来源1
            customer_from_channel_text:'',
            customer_id: '', //客户ID1
            client_guest: [], //客户档案标签1
            headInfo: '', //客户档案头部信息1
            TableData:'',
            TableDatatotle:'',
            Etime:'',
            Stime:'',
            Opname:'',
            type:'',
            page:1,
            pagesize:'',
            customer:{},
            customer_contact:'',
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
                }
                return sex;
            },
            VformatM: function (value) {
                if (value == undefined || value == null || value == '') {
                    return '--';
                }
                if (value < 60) {
                    return '00:' + (value >= 10 ? value : '0' + value);
                }
                if (60 <= value < 3600) {
                    return (Math.floor(value / 60) >= 10 ? Math.floor(value / 60) : '0' + Math.floor(value / 60)) + ':' + (value % 60 >= 10 ? value % 60 : '0' + value % 60)
                }
                if (value >= 3600) {
                    var H = Math.floor(value / 3600) >= 10 ? Math.floor(value / 3600) : '0' + Math.floor(value / 3600);
                    var M = Math.floor((value % 3600) / 60) >= 10 ? Math.floor((value % 3600) / 60) : '0' + Math.floor((value % 3600) / 60);
                    var S = Math.floor((value % 3600) / 60 * 60) >= 10 ? Math.floor((value % 3600) / 60 * 60) : '0' + Math.floor((value % 3600) / 60 * 60);
                    return H + M + S;
                }
            }
        },
        methods: {
            callTell: function (mobile) { //拨打电话1
                window.top.callTellFn(mobile, true);
            },
            reset:function(){
                vm.Etime = '';
                vm.Stime = '';
                vm.Opname = '';
                vm.type = '';
                vm.page =1;
                $('.example-handle .layui-btn').removeClass('active');
                main.getTableData();
            },
            getType:function(event,type){
                vm.page =1;
                vm.type = type
                $(event.target).addClass('active')
                $(event.target).siblings().removeClass('active')
                main.getTableData(type,vm.Opname,vm.Stime,vm.Dtime);
            }
        },
    });
    /**
     * 初始化
     */
    var _init = function () {
        main.globalSet(function () {
            main.getUrl();  
        });
        main.getTableData();
        main.jurQuery();
        main.getDataAuth();
    };
    _init();
});
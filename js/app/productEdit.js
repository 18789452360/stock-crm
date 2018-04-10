require(['layui','common','layers','tools','ajaxurl','moment','jquery.metisMenu'],function(layui,common,layers,tool,ajaxurl,moment){
    var main = {
        /**
         * 初始化layui表单
         */
        initLayui:function(){
            var minDate = moment(vm.productData.start_time).add(1,'days').format('YYYY-MM-DD 00:00:00'),
                nowDate = moment().format('YYYY-MM-DD 00:00:00');
            layui.use(['form','laydate'],function(){
                var form = layui.form,
                    laydate = layui.laydate;
                form.verify({
                    productName:function(value, item){
                        if(!(/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test($.trim(value)))){
                            return '产品名称只能是数字、字母或汉字'
                        }
                    },
                });
                if(nowDate > minDate){
                    minDate = nowDate;
                    laydate.render({//初始化时间控件
                        elem:'#end-time',
                        type: 'datetime',
                        min:minDate,//设置最小值不能小于当前时间
                        done:function(value){
                            if(value.substring(11,value.length) == '00:00:00'){
                                vm.productData.end_time = value.substring(0,11) +'23:59:59';
                            }else{
                                vm.productData.end_time = value;
                            }
                        }
                    });
                }else{
                    laydate.render({//初始化时间控件
                        elem:'#end-time',
                        type: 'datetime',
                        min:minDate,//设置最小值不能小于当前时间
                        btns: ['clear', 'confirm'],
                        done:function(value){
                            if(value.substring(11,value.length) == '00:00:00'){
                                vm.productData.end_time = value.substring(0,11) +'23:59:59';
                            }else{
                                vm.productData.end_time = value;
                            }
                        }
                    });
                }

                //提交
                form.on('submit(editOk)',function(data){
                    if(!vm.product_id){
                        layers.toast('缺少产品id参数');
                        return false; 
                    }
                    data.product_name = $.trim(data.product_name);
                    if(vm.productData.start_time > data.field.product_end_time){
                        layers.toast('结束时间不能小于当前时间', {
                            icon: 2,
                            anim: 6
                        });
                        return false;
                    }
                    var obj = data.field;
                    obj.product_id = vm.product_id;
                    //当所有验证通过后，禁用按钮防止重复点击，发送请求
                    vm.isBtn = true;
                    var loading = '';
                    vm.isBtn && tool.ajax({
                        url:ajaxurl.product.editPost,
                        data:obj,
                        type:'post',
                        beforeSend: function () {
                            layers.load(function (indexs) {
                                loading = indexs;
                            });
                        },
                        success:function(data){
                            if(data.code == 1){
                                layers.toast('提交成功');
                                setTimeout(function(){
                                    common.closeTab();
                                },1000)
                            }else{
                                vm.isBtn = true;
                                layers.toast(data.message);
                            }
                        },
                        error:function(){
                            vm.isBtn = true;
                            layers.toast('网络异常!');
                        },
                        complete:function(){
                            setTimeout(function(){
                                layers.closed(loading);
                            },50)
                        },
                    })
                    return false;
                });
            });
        },
        /**
         * 获取产品参数
         */
        getProductDetail:function(){
            var urls = vm.getUrls;
            if(!urls.has || !urls.data.product_id){
                layers.toast('缺少产品id参数');
                return false;
            }
            vm.product_id = urls.data.product_id;
            var loading = '';
            tool.ajax({
                url:ajaxurl.product.getProductDetail,
                data:{
                    product_id:vm.product_id,
                    info_type:1
                },
                type:'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success:function(data){
                    if(data.code == 1){
                        vm.productData = data.data;
                        vm.initDta = JSON.stringify(data.data);
                        vm.readerOrgUsr.id = data.data.product_leader;
                        vm.readerOrgUsr.department_name = data.data.product_leader_name;
                        main.initLayui();
                    }else{
                        layers.toast(data.message);
                    }
                },
                error:function(){
                    layers.toast('网络异常!');
                },
                complete:function(){
                    setTimeout(function(){
                        layers.closed(loading);
                    },50)
                },
            })
        },
        /**
         * 取消按钮提示框
         */
        cancel:function(){
            var data = JSON.parse(vm.initDta);
            if(vm.productData.product_name != data.product_name || vm.productData.product_introduce != data.product_introduce || vm.productData.end_time != data.end_time || vm.readerOrgUsr.department_name != data.product_leader_name){
                layers.confirm({
                    title:'提示',
                    content:'<div class="confirm-tips"><p>取消操作将不保留已变更信息，确认取消？</p></div>',
                    btn2:function(){
                        common.closeTab();
                        layers.closedAll();
                    }
                });
            }else{
                common.closeTab();
            }
            return false;
        },
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
         * [getBasic description] 获取组织架构基础信息
         * @return {[type]} [description]
         */
        getBasic: function(){
            var that = this,
                loading = '';
            tool.ajax({
                url: ajaxurl.department.getdepartment,
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success: function(result){
                    if(result.code == 1){
                        vm.BasicDepartment = result.data;
                        that.sideMenu(function(){
                            that.filterOrgSearch();
                        });
                    }else{
                        layers.toast(result.message);
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
         * 筛选--组织架构搜索
         */
        filterOrgSearch: function () {
            Vue.nextTick(function () {
                var $item = $('#org-framework').find('a[data-type="member"]'); //查找所有的 部门列表
                $item.each(function () {
                    var newItem = {id: $(this).data('id'), name: $(this).data('text')};
                    vm.OrgSearchArr.push(newItem);
                });
            });
            layui.use(['form'], function () {
                var form = layui.form;
                form.on('select(search-org)', function (data) {
                    if(data.value !=''){
                        vm.selectedOrgUsr = [];
                        var addItem = {id: data.value.split(',')[0] * 1, department_name: data.value.split(',')[1]};
                        vm.selectedOrgUsr.push(addItem);
                    }else{
                        vm.selectedOrgUsr = [];
                        vm.selectedOrgUsr = [];
                    }
                    //vm.selectedOrgUsr = home.unique(vm.selectedOrgUsr).reverse();
                });
                setTimeout(function(){
                    form.render()
                },500);
            });
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
    var vm = new Vue({
        el:'#app',
        data:{
            getUrls: tool.getUrlArgs(), //获取Url参数
            productData:{},//产品详情
            initDta:{},//产品数据数据，用于取消时比对
            product_id:'',//产品id
            departMent:[],//组织架构
            personne:[],//处理过后的组织架构人员名单
            BasicDepartment: [], // 产品负责人
            selectedOrgUsr: [], // 暂时记录组织架构的选中
            readerOrgUsr: {id: '', department_name:''}, // 组织架构选中
            showpop: false, // 组织架构显示隐藏
            OrgSearchArr: [], // 缓存组织架构搜索结果
            isBtn:false,//防止连续点击提交按钮
        },
        methods:{
            cancel:function(){//取消操作
                main.cancel();
            },
            // 组织架构获取成员模糊搜索
            orgSelectItem: function(e, type){
                if(type != undefined){
                    if(type != 0 && !$(e.target).hasClass('has-arrow')){
                        var newItem = {id: $(e.target).data('id'), department_name: $(e.target).data('text')};
                        this.selectedOrgUsr = [];
                        this.selectedOrgUsr.push(newItem);
                    }
                }
            },
            // 组织架构添加成员
            orgSelectAdd: function(e, id, name){
                if(id != undefined && name != undefined){
                    var newItem = {id:id, department_name: name};
                    this.selectedOrgUsr = [];
                    this.selectedOrgUsr.push(newItem);
                }
            },
            // 组织架构确定渲染到输入框
            addConditonsOrg:function(e){
                if (this.selectedOrgUsr.length) {
                    this.readerOrgUsr = this.selectedOrgUsr[0];
                    this.showpop = false;
                } else {
                    layers.toast('请选择人员');
                }
            },
            // 组织架构删除选中成员
            delChoose: function(){
                this.selectedOrgUsr = [];
            }
        }
    });
    var _init = function(){
        common.getTabLink();
        main.getProductDetail();
        main.getBasic(); // 获取组织架构基础数据
    };
    _init();
});
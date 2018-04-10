require(['layui','common','layers','tools','ajaxurl','moment','jquery.metisMenu'],function(layui,common,layers,tool,ajaxurl,moment){
    var main = {
        /**
         * 初始化layui表单
         */
        initLayui:function(){
            var minDate = moment().add(1,'days').format('YYYY-MM-DD 00:00:00');
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
                laydate.render({//初始化结束时间,默认为当天的23:59:59
                    elem:'#end-time',
                    type: 'datetime',
                    min:minDate,
                    btns: ['clear', 'confirm'],
                    done:function(value,date){
                        if(value.substring(11,value.length) == '00:00:00'){
                            vm.endTime = value.substring(0,11) +'23:59:59';
                        }else{
                            vm.endTime = value;
                        }
                    }
                });
                setTimeout(function(){
                    form.render();
                },200);
                form.on('submit(product-ok)',function(data){
                    data.product_name = $.trim(data.product_name);
                    if(!data.field.product_person_leader){
                        layers.toast('请选择产品负责人', {
                            icon: 2,
                            anim: 6
                        });
                        return false;
                    }
                    //当所有验证通过后，禁用按钮防止重复点击，发送请求
                    vm.isAdd = true;
                    var loading = '';
                    vm.isAdd && tool.ajax({
                        url:ajaxurl.product.add,
                        data:data.field,
                        type:'post',
                        beforeSend: function () {
                            layers.load(function (indexs) {
                                loading = indexs;
                            });
                        },
                        success:function(data){
                            if(data.code == 1){
                                layers.toast('产品添加成功');
                                setTimeout(function(){
                                    common.closeTab(true);
                                },1000)
                            }else{
                                vm.isAdd = true;
                                layers.toast(data.message) 
                            }
                        },
                        error:function(){
                            vm.isAdd = true;
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
         * 获取组织架构人员
         */
        getdepartment:function(callback){
            var loading = '';
            tool.ajax({
                url:ajaxurl.department.getdepartment,
                type:'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success:function(data){
                    if(data.code == 1){
                        vm.departMent = data.data;
                        typeof callback === 'function' && callback.call(this);
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
            layers.confirm({
                title:'提示',
                content:'<div class="confirm-tips"><p>取消操作将不保留已变更信息，确认取消？</p></div>',
                btn2:function(){
                    common.closeTab();
                    layers.closedAll();
                }
            });
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
                    if(data.value != ''){
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
            userinfo: common.getUserInfo(),
            product_name:'',//产品名字
            product_introduce:'',//产品简介
            departMent:[],//获取的组织架构
            personne:[],//处理过后的组织架构人员名单
            endTime:'',//产品结束时间
            BasicDepartment: [], // 产品负责人
            selectedOrgUsr: [], // 暂时记录组织架构的选中
            readerOrgUsr: {id: '', department_name:''}, // 组织架构选中
            showpop: false, // 组织架构显示隐藏
            OrgSearchArr: [], // 缓存组织架构搜索结果
            isAdd:false,//防止连续点击提交按钮
        },
        methods:{
            cancel:function(){//取消操作
                if(this.product_name == '' && this.product_introduce == '' && this.endTime == '' && this.readerOrgUsr.id == ''){
                    common.closeTab();
                    return false;
                }
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
        main.initLayui();
        main.getBasic(); // 获取组织架构基础数据
    };
    _init();
});
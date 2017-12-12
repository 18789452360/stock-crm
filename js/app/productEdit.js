require(['layui','common','layers','tools','ajaxurl','text!/assets/popup/clear-news.html','jquery.metisMenu'],function(layui,common,layers,tool,ajaxurl,tips){
    var main = {
        /**
         * 初始化layui表单
         */
        initLayui:function(){
            layui.use(['form','laydate'],function(){
                var form = layui.form,
                    laydate = layui.laydate;
                var nowDate = main.getNowFormatDate();
                laydate.render({//初始化时间控件
                    elem:'#end-time',
                    type: 'datetime',
                    min:nowDate,//设置最小值不能小于今天
                });
                //提交
                form.on('submit(editOk)',function(data){
                    if(!vm.product_id){
                        layers.toast('缺少产品id参数');
                        return false; 
                    }
                    if(vm.productData.start_time > data.field.product_end_time){
                        layers.toast('结束时间不能小于开始时间', {
                            icon: 2,
                            anim: 6
                        });
                        return false;
                    }
                    var obj = data.field;
                    obj.product_id = vm.product_id;
                    var loading = '';
                    tool.ajax({
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
                                layers.toast(data.message);
                            }
                            layers.closed(loading);
                        },
                        error:function(){
                            layers.toast('网络异常!');
                            layers.closed(loading);
                        }
                    })
                    return false;
                });
            });
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
            var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate ;
            return currentdate;
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
                        vm.readerOrgUsr.id = data.data.product_leader;
                        vm.readerOrgUsr.department_name = data.data.product_leader_name;
                    }else{
                        layers.toast(data.message);
                    }
                    layers.closed(loading);
                },
                error:function(){
                    layers.toast('网络异常!');
                    layers.closed(loading);
                }
            })
        },
        /**
         * 取消按钮提示框
         */
        cancel:function(){
            layers.confirm({
                title:'提示',
                content:tips,
                success:function(obj){
                    $elem = $(obj);
                    $elem.find('p').text('取消操作将不保留已变更信息，确认取消？');
                },
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
                    layers.closed(loading);
                },
                error:function(){
                    layers.toast('网络异常!');
                    layers.closed(loading);
                }
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
                    vm.selectedOrgUsr = [];
                    var addItem = {id: data.value.split(',')[0] * 1, department_name: data.value.split(',')[1]};
                    vm.selectedOrgUsr.push(addItem);
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
            product_id:'',//产品id
            departMent:[],//组织架构
            personne:[],//处理过后的组织架构人员名单
            BasicDepartment: [], // 产品负责人
            selectedOrgUsr: [], // 暂时记录组织架构的选中
            readerOrgUsr: {id: '', department_name:''}, // 组织架构选中
            showpop: false, // 组织架构显示隐藏
            OrgSearchArr: [] // 缓存组织架构搜索结果
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
        main.initLayui();
        main.getProductDetail();
        main.getBasic(); // 获取组织架构基础数据
    };
    _init();
});
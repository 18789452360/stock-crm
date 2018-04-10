/**
 * Created by Administrator on 2017-09-25.
 * 权限管理
 */
require(["vue", "layui", "layers", "common", "tools", "ajaxurl",'moment','jquery.metisMenu'], function (Vue, layui, layers, common, tool, ajaxurl,moment) {

    var home = {
        /**
         * 产品标签列表数据
         */
        getProductData:function(){
           tool.ajax({
                url: ajaxurl.setting.index,
                data:{
                    type:1
                },
                type: 'get',
                success: function (data) {
                    if (data.code == 1) {
                        //把所有的线上产品push到一个数组中去
                        if(data.data.online_consulting_plan && data.data.online_consulting_plan.length){
                            var onlineLen = data.data.online_consulting_plan.length;
                            for(var i = 0;i<onlineLen;i++){
                                for(var j = 0;j<data.data.online_consulting_plan[i].child.length;j++){
                                    vm.products.online.push(data.data.online_consulting_plan[i].child[j]);
                                }
                            }
                        }
                        //重新组装线下产品数据
                        if(data.data.line_investment_plan && data.data.line_investment_plan.length){
                            var line = data.data.line_investment_plan,
                                linLen = line.length;
                            for(var i = 0;i<linLen;i++){
                                var temp = {sid:'',sname:'',scode:''};
                                temp.sid = line[i].id;
                                temp.sname = line[i].product_name;
                                temp.scode = line[i].product_code;
                                vm.products.line.push(temp);
                            }
                        }
                    } else {
                        layers.toast(data.message);
                    }
                }
           });
        },
        /**
         * 设置产品选中
         * @param e
         * @param type true 为线上产品 false 为线下产品
         * @param id 产品id
         */
        selectProduct:function(e,type,id){
            home.workReset();
            var $products = $('.product_box li');
            $products.each(function(){
                $(this).removeClass('active');
            });
            $(e.target).addClass('active');
            vm.inquireData.product_ids = '';
            vm.inquireData.product_ids_line = '';
            type ? vm.inquireData.product_ids = id : vm.inquireData.product_ids_line = id;
            home.getServiceData();
        },
        /**
         * 重置产品选中状态
         */
        delAllProduct:function(){
            home.workReset();
            var $products = $('.product_box li');
            $products.each(function(){
                $(this).removeClass('active');
            });
            vm.inquireData.product_ids_line = '';
            vm.inquireData.product_ids = '';
            home.getServiceData();
        },
        /**
         * 获取服务统计数据
         */
        getServiceData:function(data){
            var obj = {};
            if(data){
                obj = data;
            }
            $.extend(obj,obj,vm.inquireData);
            var loading = '';
            tool.ajax({
                url: ajaxurl.statistics.service,
                data:obj,
                type:'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success:function(data){
                    if(data.code == 1){
                        if(data.data.service){
                            vm.serviceData = data.data.service.data;//服务统计信息
                            home.servicePage(data.data.service);
                        }
                        if(data.data.workload){
                           // vm.workData = data.data.workload.data;//工作量统计
                           // home.workPage(data.data.workload);
                        }
                    }else{
                        layers.toast(data.message);
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
        },
        /**
         * 服务统计分页器
         */
        servicePage:function(data){
            layui.use('laypage', function () {
                var laypage = layui.laypage
                laypage.render({
                    elem: 'service-page', //注意，这里的 test1 是 ID，不用加 # 号
                    count: data.total, //数据总数，从服务端得到
                    limit:data.page_size,
                    curr: data.page,
                    jump: function (obj, first) {
                        if (!first) {
                            var datas = {type:1,page:obj.curr};
                            home.getServiceData(datas);
                        }
                    }
                })
            })
        },
        /**
         * 工作量统计分页器
         */
        workPage:function(data){
            layui.use('laypage', function () {
                var laypage = layui.laypage
                laypage.render({
                    elem: 'work-page', //注意，这里的 test1 是 ID，不用加 # 号
                    count: data.total, //数据总数，从服务端得到
                    limit:data.page_size,
                    curr: data.page,
                    jump: function (obj, first) {
                        if (!first) {
                            var datas = {type:2,page:obj.curr,date_start:vm.startTime,date_end:vm.endTime};
                            home.getServiceData(datas);
                        }
                    }
                })
            })
        },
        /**
         * 初始化layui时间控件
         */
        initLayui: function () {
            layui.use(['laydate','form'], function () {
                var laydate = layui.laydate,
                    form = layui.form;
                form.render();
                laydate.render({//初始化开始时间
                    elem: '#date_start',
                    done:function (value) {
                        vm.startTime = value;
                    }
                });
                laydate.render({//初始化结束时间
                    elem: '#date_end',
                    done:function (value) {
                        vm.endTime = value;
                    }
                });
            })
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
                            var $ul = $('.collapse');
                            $ul.each(function () {
                                if($(this).find('li').length == 0){
                                    $(this).prev('a').removeClass('has-arrow').find('span').text('选择');
                                }
                            });
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
                var $item = $('#org-framework').find('a'); //查找所有的 部门列表
                $item.each(function () {
                    var newItem = {id: $(this).data('id'), name: $(this).data('text')};
                    vm.OrgSearchArr.push(newItem);
                });
            });
            layui.use(['form'], function () {
                var form = layui.form;
                form.on('select(search-org)', function (data) {
                    var addItem = {id: data.value.split(',')[0] * 1, department_name: data.value.split(',')[1]};
                    var len = vm.selectedOrgUsr.length,
                        flag = false;
                    for(var i = 0;i<len;i++){
                        if(vm.selectedOrgUsr[i].id == addItem.id){
                            flag = true;
                        }
                    }
                    if(!flag){
                        vm.selectedOrgUsr.push(addItem);
                    }
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
        },
        /**
         * 排序
         * @param e
         * @param name
         */
        sort:function(e,name){
            var $i = $(e.currentTarget).find('i'),
                type = $i.attr('data-type'),
                data = {order:'',order_type:'',type:2,date_start:vm.startTime,date_end:vm.endTime,page:1};
            $(e.currentTarget).siblings('.icon-td').find('i')
                .removeClass('bottom')
                .removeClass('top')
                .attr('data-type',0);
            data.order = name;
            if (type == 0) {
                $i.removeClass('bottom')
                    .addClass('top')
                    .attr('data-type', 1);
                data.order_type = 'asc';
            } else {
                $i.removeClass('top')
                    .addClass('bottom')
                    .attr('data-type', 0);
                data.order_type = 'desc';
            };
            home.getServiceData(data);
        },
        /**
         * 工作量统计时间筛选查询
         */
        workInquire:function(){
            if(vm.startTime > vm.endTime){
                layers.toast('开始时间不能大于结束时间');
                return false;
            }
            var data = {type:2,date_start:vm.startTime,date_end:vm.endTime,page:1};
            home.getServiceData(data);
        },
        /**
         * 工作量统计时间输入框重置
         * @param flag true 单独请求工作量统计请求
         */
        workReset:function (flag) {
            $('.time-input').each(function(){
                $(this).val('');
            });
            vm.startTime = '';
            vm.endTime = '';
            var data = {type:2,date_start:'',date_end:'',page:1};
            flag && home.getServiceData(data);
        },
        /**
         * 当筛选部门发生变化时，重新获取数据
         * @param callback
         */
        getNewDepartment_ids:function(callback){
            var arr = JSON.stringify(vm.selectedOrgUsr);
            vm.readerOrgUsr = JSON.parse(arr);
            var idArr = [],
                lens = vm.readerOrgUsr.length;
            for(var i = 0;i<lens;i++){
                idArr.push(vm.readerOrgUsr[i].id);
            }
            vm.inquireData.department_ids = idArr.join(',');
            $('.time-input').each(function(){
                $(this).val('');
            });
            vm.startTime = '';
            vm.endTime = '';
            typeof callback === 'function' && callback.call(this);
        },

    };
    /**
     * 实例化vue
     */
    var vm = new Vue({
        el: "#app",
        data: {
            products:{online:[],line:[]},//缓存处理全局配置读取过来的产品数据
            serviceData:{},//服务统计数据
            workData:{},//工作量统计
            departMent:[],//获取的组织架构
            personne:[],//处理过后的组织架构人员名单
            BasicDepartment: [], // 组织架构数据
            selectedOrgUsr: [], // 暂时记录组织架构的选中
            readerOrgUsr: [], // 组织架构选中
            showpop: false, // 组织架构显示隐藏
            OrgSearchArr: [], // 缓存组织架构搜索结果
            inquireData:{//查询的基础数据
                department_ids:'',//部门id str
                product_ids:'',//线上产品id
                product_ids_line:'',//线下产品id
                type:1,
            },
            startTime:'',//工作量开始时间
            endTime:'',//工作量结束时间
        },
        methods: {
            //设置产品选中
            selectProduct:function(e,type,id){
                home.selectProduct(e,type,id)
            },
            // 组织架构获取成员模糊搜索
            orgSelectItem: function(e, type){
                if(type != undefined){
                    if(type != 0 && !$(e.target).hasClass('has-arrow')){
                        var newItem = {id: $(e.target).data('id'), department_name: $(e.target).data('text')};
                        this.selectedOrgUsr.push(newItem);
                    }
                }
            },
            // 组织架构添加成员
            orgSelectAdd: function(e, id, name){
                if(id != undefined && name != undefined){
                    var len = this.selectedOrgUsr.length,
                        flag = false;
                    for(var i = 0;i<len;i++){
                        if(this.selectedOrgUsr[i].id == id){
                            flag = true;
                        }
                    }
                    if(!flag){
                        var newItem = {id:id, department_name: name};
                        this.selectedOrgUsr.push(newItem);
                    }
                }
            },
            // 组织架构确定渲染到顶部部门处,同时重新获取数据
            addConditonsOrg:function(e){
                if (this.selectedOrgUsr.length) {
                    home.getNewDepartment_ids(function(){
                        home.getServiceData();
                    });
                    this.showpop = false;
                } else {
                    layers.toast('请选择部门');
                }
            },
            // 组织架构删除选中成员
            delChoose: function(index){
                this.selectedOrgUsr.splice(index,1);
            },
            //删除上面单个展示的部门
            delorganize:function(index){
                home.workReset();
                this.readerOrgUsr.splice(index,1);
                this.selectedOrgUsr.splice(index,1);
                home.getNewDepartment_ids(function(){
                    home.getServiceData();
                });
            },
            //删除上面展示的所有部门
            delAll:function () {
                home.workReset();
                this.readerOrgUsr = [];
                this.selectedOrgUsr = [];
                this.inquireData.department_ids = '';
                home.getServiceData();
            },
            //重置商品选择
            delAllProduct:function(){
                home.delAllProduct();
            },
            //排序
            sort:function(e,name){
                home.sort(e,name);
            },
            //工作量统计时间查询
            workInquire:function(){
                home.workInquire();
            },
            //工作量时间重置
            workReset:function(){
                home.workReset(true);
            },
        },
        filters:{
            VformatM: function (value) {
                if (value == undefined || value == null || value == '') {
                    return '--';
                }
                var t;
                if (value > -1) {
                    var hour = Math.floor(value / 3600);
                    var min = Math.floor(value / 60) % 60;
                    var sec = value % 60;
                    if (hour < 10) {
                        t = '0' + hour + ":";
                    } else {
                        t = hour + ":";
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
        },

    });
    var _init = function() {
        home.getBasic(); // 获取组织架构基础数据
        home.getProductData();
        home.getServiceData();
        home.initLayui();
    };
    _init();

});
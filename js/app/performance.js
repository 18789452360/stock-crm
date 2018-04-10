require(['common', 'jquery.metisMenu', 'layui', 'layers',"tools","ajaxurl",], function (common, undefined, layui, layers,tool,ajaxurl) {
    var main = {
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
         * 模糊查询
         */
        jurQuery: function() {
            layui.use(['form', 'laydate'],function() {
                var form = layui.form,
                    laydate = layui.laydate;
                //监听提交
                form.on('submit(formSelect)', function (data) {
                    if (!$.isEmptyObject(data.field)) {
                        vm.Stime = data.field.start_time
                        vm.Etime = data.field.end_time
                        if(new Date(vm.Etime) - new Date(vm.Stime) <= 0){
                            layers.toast('首次时间不能大于结束时间！', {
                                icon: 2,
                                anim: 6
                            });
                            return false;
                        }
                        main.getPersonalData(vm.Pname,vm.Stime,vm.Etime,vm.Tvolume, vm.Tturnover,vm.SourceCon.sourceCid);
                        main.getTeamData(vm.Pname,vm.Stime,vm.Etime,vm.Tvolume, vm.Tturnover,vm.SourceCon.sourceCid);
                    }
                    return false;
                })
            })
        },
        /**
         * 个人业绩列表数据
         */
        getPersonalData:function(name,start_time,end_time,volume,turnover,cid){
            tool.ajax({
                url: ajaxurl.achStatistics.personallook,
                type: 'get',
                data: {
                    product_name: name,
                    start_time: start_time,
                    end_time: end_time,
                    volume: volume,
                    turnover: turnover,
                    // educe: educe,
                    cid:cid,
                },
                success: function (result) {
                    if (result.code == 1) {
                        // 渲染到vue数据层
                        if(result.data != null){
                            vm.PersonalData = result.data.list;
                        }else{
                            vm.PersonalData = '';
                        }
                        main.jurQuery();
                    } else {
                        layers.toast(result.message);
                    }
                }
            });
            layui.use(['table','laydate'], function(){
              var table = layui.table,laydate = layui.laydate;
                  lay('.test-item').each(function(){
                    laydate.render({
                        elem: this
                        ,trigger: 'click'
                        ,type: "datetime"
                    });
                });
            });
        },
        /**
         * 团队业绩列表数据
         */
        getTeamData:function(name,start_time,end_time,volume,turnover,cid){
            tool.ajax({
                url: ajaxurl.achStatistics.teamlook,
                type: 'get',
                data: {
                    product_name: name,
                    start_time: start_time,
                    end_time: end_time,
                    volume: volume,
                    turnover: turnover,
                    // educe: educe,
                    cid: cid,
                },
                success: function (result) {
                    if (result.code == 1) {
                        // 渲染到vue数据层
                        if(result.data != null){
                            vm.TeamData = result.data.list;
                            vm.all = result.data.all;
                            vm.allnum = result.data.allnum;
                            vm.allmoney = result.data.allmoney;
                        }else{
                            vm.TeamData =''
                        }
                    } else {
                        layers.toast(result.message);
                    }
                }
            });
        },
        /**
         * 产品标签列表数据
         */
        getLabelData:function(){
            tool.ajax({
                url: ajaxurl.setting.index,
                type: 'post',
                success: function (data) {
                    if (data.code == 1) {
                        var obj = {online:[],line:[]};
                        //把所有的线上产品push到一个数组中去
                        if(data.data.online_consulting_plan && data.data.online_consulting_plan.length){
                            var onlineLen = data.data.online_consulting_plan.length;
                            for(var i = 0;i<onlineLen;i++){
                                for(var j = 0;j<data.data.online_consulting_plan[i].child.length;j++){
                                    obj.online.push(data.data.online_consulting_plan[i].child[j]);
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
                                obj.line.push(temp);
                            }
                        }
                        vm.LabelData = obj;
                    } else {
                        layers.toast(data.message);
                    }
                }
            });
           /*tool.ajax({
                url: ajaxurl.achStatistics.source,
                type: 'post',
                data: {
                    name:'online_consulting_plan',
                },
                success: function (result) {
                    if (result.code == 1) {
                        //渲染到vue数据层
                        var onlin = result.data.value;
                        vm.LabelData = result.data.value;
                        console.log(vm.LabelData);
                    } else {
                        layers.toast(result.message);
                    }
                }
            }); */
        },
        /**
         * 客户来源列表数据
         */
        getSourceData:function(){
           tool.ajax({
                url: ajaxurl.setting.index,
                type: 'post',
                data: {},
                success: function (result) {
                    if (result.code == 1) {
                        //渲染到vue数据层
                        // var onlin = result.data.value;
                        vm.SourceData = result.data.customer_from_channel;
                    } else {
                        layers.toast(result.message);
                    }
                }
            }); 
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            PersonalData:'',
            TeamData:'',
            LabelData:[],
            SourceData:[],
            Stime:'',
            Etime:'',
            Pname:'',
            Pvolume:'',
            Pturnover:'',
            Tvolume:'',
            Tturnover:'',
            all:'',
            allmoney:'',
            allnum:'',
            SourceCon:{//来源筛选配置项
                isActive:false,
                hasOpen:false,
                sourceCid:'',//客户来源id
                source:'',//客户来源
            } 
        },
        methods: {
            reset:function(){
                $("[data-type = '0']").removeClass('asc desc');
                $(".choose-icon a").removeClass('active');
                vm.Pname = '';
                vm.Stime = '';
                vm.Etime = '';
                vm.Pvolume = '',
                vm.Pturnover = '',
                vm.Tvolume = '',
                vm.Tturnover = '',
                vm.SourceCon = {//来源筛选配置项
                    isActive:false,
                    hasOpen:false,
                    sourceCid:'',//客户来源id
                    source:'',//客户来源
                }
                main.getPersonalData();
                main.getTeamData();
                $('.handle-add .layui-btn').removeClass('active');
            },
            // 客户来源筛选框
            checkBox:function(){
                if(vm.SourceCon.hasOpen == true){
                   vm.SourceCon.hasOpen = false; 
                }else{
                   vm.SourceCon.hasOpen = true;  
                }
            },
            // 客户来源项
            checkSource:function(e, key, index){
                var $target = $(e.target);
                $target.siblings().removeClass('active');
                $target.addClass('active');
                vm.SourceCon = {//来源筛选配置项
                    isActive:true,
                    hasOpen:false,
                    sourceCid:key,//客户来源id
                    source:'：' + $target.text(),//客户来源
                };
                main.getPersonalData(vm.Pname,vm.Stime,vm.Etime,vm.Tvolume,vm.Tturnover,vm.SourceCon.sourceCid);
                main.getTeamData(vm.Pname,vm.Stime,vm.Etime,vm.Tvolume,vm.Tturnover,vm.SourceCon.sourceCid);
            },
            // 不限客户来源项
            onSource:function(e){
                var $target = $(e.target);  
                $target.siblings().removeClass('active');
                vm.SourceCon = {//来源筛选配置项
                    isActive:false,
                    hasOpen:false,
                    sourceCid:'',//客户来源id
                    source:'',//客户来源
                };
                main.getPersonalData(vm.Pname,vm.Stime,vm.Etime,vm.Tvolume,vm.Tturnover,vm.SourceCon.sourceCid);
                main.getTeamData(vm.Pname,vm.Stime,vm.Etime,vm.Tvolume,vm.Tturnover,vm.SourceCon.sourceCid);
            },
            // 最近联系排序过滤
            setTNRise: function (e) {
                var $that = $(e.currentTarget);
                var sorttype = $that.data('type');
                $that.closest('th').siblings('th').find('a').removeClass('asc desc').data('type', 0);
                    if (sorttype === 0) {
                        $that.prop('class', 'asc');
                        $that.data('type', 1);
                        // 升序
                        vm.Tvolume = 'asc'
                        main.getTeamData(vm.Pname,vm.Stime,vm.Etime,vm.Tvolume,'',vm.SourceCon.sourceCid);
                    } else {
                        $that.prop('class', 'desc');
                        $that.data('type', 0);
                        // 降序
                        vm.Tvolume = 'desc'
                        main.getTeamData(vm.Pname,vm.Stime,vm.Etime,vm.Tvolume,'',vm.SourceCon.sourceCid);
                    }
            },
            setTCRise: function (e) {
                var $that = $(e.currentTarget);
                var sorttype = $that.data('type');
                $that.closest('th').siblings('th').find('a').removeClass('asc desc').data('type', 0);
                // $that.siblings('th').removeClass('asc desc').data('type', 0);
                    if (sorttype === 0) {
                        $that.prop('class', 'asc');
                        $that.data('type', 1);
                        // 升序
                        vm.Tturnover = 'asc'
                        main.getTeamData(vm.Pname,vm.Stime,vm.Etime,'',vm.Tturnover,vm.SourceCon.sourceCid);
                    } else {
                        $that.prop('class', 'desc');
                        $that.data('type', 0);
                        // 降序
                        vm.Tturnover = 'desc'
                        main.getTeamData(vm.Pname,vm.Stime,vm.Etime,'',vm.Tturnover,vm.SourceCon.sourceCid);
                    }
            },
            setPNRise: function (e) {
                var $that = $(e.currentTarget);
                var sorttype = $that.data('type');
                $that.closest('th').siblings('th').find('a').removeClass('asc desc').data('type', 0);
                    if (sorttype === 0) {
                        $that.prop('class', 'asc');
                        $that.data('type', 1);
                        // 升序
                        vm.Tvolume = 'asc'
                        main.getPersonalData(vm.Pname,vm.Stime,vm.Etime,vm.Tvolume,'',vm.SourceCon.sourceCid);
                    } else {
                        $that.prop('class', 'desc');
                        $that.data('type', 0);
                        // 降序
                        vm.Tvolume = 'desc'
                        main.getPersonalData(vm.Pname,vm.Stime,vm.Etime,vm.Tvolume,'',vm.SourceCon.sourceCid);
                    }
            },
            setPCRise: function (e) {
                var $that = $(e.currentTarget);
                var sorttype = $that.data('type');
                $that.closest('th').siblings('th').find('a').removeClass('asc desc').data('type', 0);
                    if (sorttype === 0) {
                        $that.prop('class', 'asc');
                        $that.data('type', 1);
                        // 升序
                        vm.Tturnover = 'asc'
                        main.getPersonalData(vm.Pname,vm.Stime,vm.Etime,'',vm.Tturnover,vm.SourceCon.sourceCid);
                    } else {
                        $that.prop('class', 'desc');
                        $that.data('type', 0);
                        // 降序
                        vm.Tturnover = 'desc'
                        main.getPersonalData(vm.Pname,vm.Stime,vm.Etime,'',vm.Tturnover,vm.SourceCon.sourceCid);
                    }
            },
            product:function(event,name){
                vm.Pname = name;
                $(event.target).addClass('active');
                $(event.target).siblings().removeClass('active');
                $(event.target).parent().siblings().find('a').removeClass('active');
                main.getPersonalData(vm.Pname,vm.Stime,vm.Etime,vm.Tvolume,vm.Tturnover,vm.SourceCon.sourceCid);
                main.getTeamData(vm.Pname,vm.Stime,vm.Etime,vm.Tvolume,vm.Tturnover,vm.SourceCon.sourceCid);
            },
            noData:function(){
                layers.toast('无导出数据！', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.getPersonalData();
        main.getTeamData();
        main.getLabelData();
        main.getSourceData();
    };
    _init();
});
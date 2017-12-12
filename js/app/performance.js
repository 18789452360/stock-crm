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
                        main.getPersonalData(vm.Pname,vm.Stime,vm.Etime)
                        main.getTeamData(vm.Pname,vm.Stime,vm.Etime)
                    }
                    return false;
                })
            })
        },
        /**
         * 个人业绩列表数据
         */
        getPersonalData:function(name,start_time,end_time,volume,turnover,educe){
            tool.ajax({
                url: ajaxurl.achStatistics.personallook,
                type: 'get',
                data: {
                    product_name: name,
                    start_time: start_time,
                    end_time: end_time,
                    volume: volume,
                    turnover: turnover,
                    educe: educe,
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
        getTeamData:function(name,start_time,end_time,volume,turnover,educe){
            tool.ajax({
                url: ajaxurl.achStatistics.teamlook,
                type: 'get',
                data: {
                    product_name: name,
                    start_time: start_time,
                    end_time: end_time,
                    volume: volume,
                    turnover: turnover,
                    educe: educe,
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
        },
        methods: {
            reset:function(){
                vm.Pname = ''
                vm.Stime = ''
                vm.Etime = ''
                main.getPersonalData();
                main.getTeamData();
                $('.handle-add .layui-btn').removeClass('active');
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
                        main.getTeamData(vm.Pname,vm.Stime,vm.Etime,vm.Tvolume);
                    } else {
                        $that.prop('class', 'desc');
                        $that.data('type', 0);
                        // 降序
                        vm.Tvolume = 'desc'
                        main.getTeamData(vm.Pname,vm.Stime,vm.Etime,vm.Tvolume);
                    }
            },
            setTCRise: function (e) {
                var $that = $(e.currentTarget);
                var sorttype = $that.data('type');
                $that.siblings('th').removeClass('asc desc').data('type', 0);
                    if (sorttype === 0) {
                        $that.prop('class', 'asc');
                        $that.data('type', 1);
                        // 升序
                        vm.Tturnover = 'asc'
                        main.getTeamData(vm.Pname,vm.Stime,vm.Etime,'',vm.Tturnover);
                    } else {
                        $that.prop('class', 'desc');
                        $that.data('type', 0);
                        // 降序
                        vm.Tturnover = 'desc'
                        main.getTeamData(vm.Pname,vm.Stime,vm.Etime,'',vm.Tturnover);
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
                        main.getPersonalData(vm.Pname,vm.Stime,vm.Etime,vm.Tvolume);
                    } else {
                        $that.prop('class', 'desc');
                        $that.data('type', 0);
                        // 降序
                        vm.Tvolume = 'desc'
                        main.getPersonalData(vm.Pname,vm.Stime,vm.Etime,vm.Tvolume);
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
                        main.getPersonalData(vm.Pname,vm.Stime,vm.Etime,'',vm.Tturnover);
                    } else {
                        $that.prop('class', 'desc');
                        $that.data('type', 0);
                        // 降序
                        vm.Tturnover = 'desc'
                        main.getPersonalData(vm.Pname,vm.Stime,vm.Etime,'',vm.Tturnover);
                    }
            },
            product:function(event,name){
                vm.Pname = name;
                $(event.target).addClass('active');
                $(event.target).siblings().removeClass('active');
                $(event.target).parent().siblings().find('a').removeClass('active');
                main.getPersonalData(name);
                main.getTeamData(name);
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

    };
    _init();
});
require(['common', 'jquery.metisMenu', 'layui', 'layers',"tools","ajaxurl", 'text!/assets/popup/del-news.html', 'text!/assets/popup/clear-news.html','text!/assets/popup/shield-news.html'], function (common, undefined, layui, layers,tool,ajaxurl,delNews, clearNews, shieldNews) {
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
         * 树形菜单
         */
        sideMenu: function () {
            Vue.nextTick(function () {
                $('#side-menu').metisMenu();
            })
        },
        /**
         * 清空未读信息
        */
        DelNoread:function(type,sontype,callback){
            tool.ajax({
                url: ajaxurl.sms.delUnread,
                type: 'get',
                data:{
                    employee_id:vm.userinfo.id,
                    type:type,
                    sontype:sontype,
                },
                success: function (result) {
                    if (result.code == 1) {
                        // 渲染到vue数据层
                        typeof callback === 'function' && callback.call(this);
                    }
                }
            });
        },
        /**
         * 获取树形菜单数据
         */
        getNavData: function (type,sontype,callback) {
                tool.ajax({
                    url: ajaxurl.sms.big,
                    type: 'get',
                    data:{employee_id:vm.userinfo.id,},
                    success: function (result) {
                        if (result.code == 1) {
                             main.clickTypeCss(type);
                            // 渲染到vue数据层
                            if(type !=null ){
                                vm.navData = result.data;
                                main.getTypeData(type);
                                main.getNewsData(type,sontype); 
                                // vm.allnewsNum = 888;
                                for(var i=0,len=result.data.length;i<len;i++){
                                    if(result.data[i].id == type){
                                        if(result.data[i].noread != 0){
                                            vm.allnewsNum = result.data[i].noread;
                                        }else{
                                           vm.allnewsNum = ''; 
                                        }
                                    } 
                                }
                                typeof callback === 'function' && callback.call(this);

                            }else{
                                vm.TypeId = result.data[0].id;
                                main.DelNoread(result.data[0].id,'',function(){
                                    main.getTypeData(result.data[0].id);
                                    main.getNewsData(result.data[0].id);
                                    vm.navData = result.data;
                                    // console.log(result.data[0].noread);
                                });
                                vm.title = result.data[0].name;
                            }
                        } else {
                            layers.toast(result.message);
                        }
                    }
                });
        },
        /**
         * 获取分类菜单数据
         */
        getTypeData: function (id) {
            tool.ajax({
                url: ajaxurl.sms.small,
                type: 'get',
                data: {employee_id:vm.userinfo.id,type:id},
                success: function (result) {
                    if (result.code == 1) {
                        // 渲染到vue数据层
                        main.clickSontypeCss(id);
                        vm.TypeData = result.data;
                        // main.getNewsData(id);
                    } else {
                        layers.toast(result.message);
                    }
                }
            });
        },
        /**
         * 消息列表数据
         */
        getNewsData:function(id,sontype, callback){
            layers.load(function (indexs) {
                vm.isLoadingIndex = indexs;
            });
            tool.ajax({
                url: ajaxurl.sms.List,
                type: 'get',
                data: {
                    employee_id:vm.userinfo.id,
                    type:id,
                    sontype:sontype,
                    page:vm.newsInfo.curpage,
                    pagesize:vm.newsInfo.pagesize
                },
                success: function (result) {
                    if (result.code == 1) {
                        // 渲染到vue数据层
                        vm.newsData = result.data;
                        if(vm.newsData[0]){
                            vm.count=vm.newsData[0].count;
                        }else{
                             vm.count=0;
                        }
                        main.followPage(); 
                        setTimeout(function(){
                            main.clickTypeCss(id);
                            main.clickSontypeCss(sontype);
                        }, 0);
                        
                        typeof callback === 'function' && callback.call(this);
                        layers.closed(vm.isLoadingIndex);
                    } else {
                        layers.toast(result.message);
                    }
                }
            });
            /* 渲染到vue数据层 */
            // vm.tableList = newsList;
             /* 实例化日期,表格 */
            layui.use(['element', 'laypage', 'layer'], function(){
                var $ = layui.jquery,
                    laypage = layui.laypage,
                    layer = layui.layer,
                    element = layui.element; //Tab的切换功能，切换事件监听等，需要依赖element模块
                /*分页器*/
                laypage.render({
                    elem: 'demo8'
                    ,count: 1000
                    ,layout: ['limit', 'prev', 'page', 'next']
                });
                  //触发事件
                  var active = {
                    tabAdd: function(){
                      //新增一个Tab项
                      element.tabAdd('demo', {
                        title: '新选项'+ (Math.random()*1000|0) //用于演示
                        ,content: '内容'+ (Math.random()*1000|0)
                        ,id: new Date().getTime() //实际使用一般是规定好的id，这里以时间戳模拟下
                      })
                    }
                    ,tabDelete: function(othis){
                      //删除指定Tab项
                      element.tabDelete('demo', '44'); //删除：“商品管理”
                      
                      
                      othis.addClass('layui-btn-disabled');
                    }
                    ,tabChange: function(){
                      //切换到指定Tab项
                      element.tabChange('demo', '22'); //切换到：用户管理
                    }
                  };
                  
                  $('.site-demo-active').on('click', function(){
                    var othis = $(this), type = othis.data('type');
                    active[type] ? active[type].call(this, othis) : '';
                  });
                  
                  //Hash地址的定位
                  var layid = location.hash.replace(/^#test=/, '');
                  element.tabChange('test', layid);
                  
                  element.on('tab(test)', function(elem){
                    location.hash = 'test='+ $(this).attr('lay-id');
                  });
                  
                });
        },
        /**
         * 清除分组下消息
         */
        delGroup:function(type,sontype,smsId){
            tool.ajax({
                url: ajaxurl.sms.delGroup,
                type: 'get',
                data:{
                    employee_id:vm.userinfo.id,
                    type:type,
                    sontype:sontype,
                    sms_id:smsId,
                },
                success: function (result) {
                    if (result.code == 1) {
                        layers.toast('消息已清理');
                    } else {
                        layers.toast(result.message);
                    }
                }
            });
        },

        /**
         * 删除消息询问框
         */
        delNews: function (type,sontype,smsId) {
            layers.confirm({
                title: '提示',
                content: delNews,
                btn2: function(index, layero){ // btn 1  确定回调
                    main.delGroup(type,sontype,smsId);
                    main.getNewsData(type,sontype);
                }   
            });
        },
        /**
         * 清理消息询问框
         */
        clearNews: function (type,sontype) {
            layers.confirm({
                title: '提示',
                content: clearNews,
                btn2: function(index, layero){ // btn 1  确定回调
                    main.delGroup(type,sontype);
                    main.getNewsData(type,sontype);
                }
            });
        },
        /** 
            屏蔽系统消息
         */
        shieldNews: function () {
            layers.confirm({
                title: '提示',
                content: shieldNews,
                btn2: function (index, layero) {
                    // 确认的回调
                }
            });
        },
        /** 
            大分组样式
         */
        clickTypeCss:function(id){
            $('li[data-type="'+id+'"]').siblings().removeClass('active');
            $('li[data-type="'+id+'"]').addClass('active');
            
            // $(event.currentTarget).addClass('active');
        },
        /** 
            小分组样式
         */
        clickSontypeCss:function(id){
                $('li[data-type="'+id+'"]').siblings().removeClass('sm-active');
                $('li[data-type="'+id+'"]').addClass('sm-active');   
        },
        /** 
            页面url获取到的收据加载

         */
        GainUrlData:function(){
            // 获取路由参数id的值
            var urls = tool.getUrlArgs();
            if(urls.has){
                vm.TypeId = urls.data.type;
                vm.SonTypeId = urls.data.sontype;
                // main.DelNoread(vm.TypeId,vm.SonTypeId);
                main.getNavData(vm.TypeId,vm.SonTypeId);  
                main.getNewsData(vm.TypeId,vm.SonTypeId,function(){
                    main.clickTypeCss(vm.TypeId);
                    main.clickSontypeCss(vm.SonTypeId);
                })
            }else{
                main.DelNoread(1,'',function(){
                   main.getNavData(); 
                })
                
            }
        },
        /** 
            分页
         */
        followPage: function () {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'follow-page',
                    count: vm.count //数据总数,
                    ,limit: vm.newsInfo.pagesize //每页显示条数,
                    ,curr: vm.newsInfo.curpage //当前页数 ,
                    ,jump: function (obj, first) {
                        if (!first) {
                            vm.newsInfo.curpage = obj.curr;
                            main.getNewsData(vm.TypeId,vm.SonTypeId);
                        }
                    }
                });
            });
        },
        
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            list:'',// 侧栏树形菜单
            navData:'',// 侧栏树形菜单
            newsData:'',
            noMassage: '',
            TypeData:'',
            TypeId:'',//大分类ID
            SonTypeId:'',//小分类ID
            newsInfo:{pagesize:10,curpage:1},//初始化分页信息
            urlType:'',
            urlsonType:'',
            count:'',
            allnewsNum:'',
            userinfo:'',
            title:'',//header 标题
        },
        methods: {
            clearNews: function () {
                main.clearNews(that);
            },
            shieldNews: function () {
                main.shieldNews(that);
            },
            /**
             * 点击事件
             */
            getType:function(id,tit){
                vm.newsInfo.pagesize = 10;
                vm.newsInfo.curpage = 1;
                $('.site-page a').eq(0).siblings().removeClass('active')
                $('.site-page a').eq(0).addClass('active')
                main.clickSontypeCss(00);
                vm.TypeId = id;
                vm.SonTypeId ='';
                vm.title = tit;
                // main.getTypeData(id);
                main.DelNoread(id,'',function(){
                    main.getNavData(id);
                });
                
            },
            getSontype:function(id){
                vm.newsInfo.pagesize = 10;
                vm.newsInfo.curpage = 1;
                $('.site-page a').eq(0).siblings().removeClass('active')
                $('.site-page a').eq(0).addClass('active')
                vm.SonTypeId = id;
                main.DelNoread(vm.TypeId,id,function(){
                    main.getNavData(vm.TypeId,id);
                }); 
                
                // main.getNewsData(vm.TypeId,id);
            },
            delOneNews:function(smsId){
                main.delNews(vm.TypeId,vm.SonTypeId,smsId);
            },
            clearallNews:function(){
                if(vm.SonTypeId != ''){  
                    main.delNews(vm.TypeId,vm.SonTypeId);
                }else{
                    main.delNews(vm.TypeId);
                }
            },
            /**
             * 设置每页展示条数
             */
            onpageSize: function (event,i) { //设置每页展示条数
                this.newsInfo.pagesize = i;
                this.newsInfo.curpage = 1;
                $(event.target).siblings().removeClass('active');
                $(event.target).addClass('active');
                main.getNewsData(vm.TypeId,vm.SonTypeId);
            },

        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        common.getTabLink();
        main.GainUrlData();
        main.admin();
    };
    _init();
});
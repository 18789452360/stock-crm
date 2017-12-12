require(['layui', 'common'], function (layui, common) {
    var main = {
        /**
         * 渲染 Tab 标签卡
         */
        renderTabs: function () {
            vm.tabs = common.getTabArr();
        },
        layuiTab:function(){
            layui.use(['element','form'],function(){
                var element = layui.element,
                    form    = layui.form;
            })
        },
        layuiUpload:function(){
            layui.use('upload',function(){
                var upload = layui.upload;
                upload.render({
                    elem:'#upload'
                    ,url: '/upload/'
                    ,multiple: true
                    ,before: function(obj){
                      //预读本地文件示例，不支持ie8
                      obj.preview(function(index, file, result){
                          var html = '<a href="javascript:;"><img src="'+ result +'" alt="'+ file.name +'" class="layui-upload-img"><i class="iconfont icon-delete"></a>'
                        $('#img-box').append(html);
                      });
                    }
                    ,done: function(res){
                      //上传完毕
                    }
                })
            })
        },
        layuiTable:function(){
            var table = [
                {'name':'股客张三',phoneNum:'136****0035',timelen:'15:16',time:'2017-03-01 10:31',type:'呼入'},
                {'name':'股客李四',phoneNum:'136****0035',timelen:'15:16',time:'2017-03-01 10:31',type:'呼出'},
            ];
            vm.followTable = table;
            /* var cooperationTable = [
                {'name':'凤鸣1号',phoneNum:'151****3572',payTime:'2014-10-18 15:12:12',payNum:'1',price:'80',salesperson:'李四（市场五部一组）',service_stat_time:'2014-10-18 15:12:12',service_over_time:'2014-10-18 15:12:12'},
                {'name':'凤鸣2号',phoneNum:'151****3572',payTime:'2014-10-18 15:12:12',payNum:'1',price:'80',salesperson:'李四（市场五部一组）',service_stat_time:'2014-10-18 15:12:12',service_over_time:'2014-10-18 15:12:12'},
                {'name':'凤鸣3号',phoneNum:'151****3572',payTime:'2014-10-18 15:12:12',payNum:'1',price:'80',salesperson:'李四（市场五部一组）',service_stat_time:'2014-10-18 15:12:12',service_over_time:'2014-10-18 15:12:12'},
            ];
            vm.cooperationTable = cooperationTable;
            layui.use(['table','laypage'],function(){
                var table = layui.table;
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'follow-test' //注意，这里的 test1 是 ID，不用加 # 号
                    ,count: 50 //数据总数，从服务端得到
                    ,limit:5,
                });
            }); */
        },
        
    };
    var vm = new Vue({
        el:'#app',
        data:{
            tabs: [],
            followTable:[],
           
        },
        methods:{
             // 切换标签卡
             switchTabs: function (e) {
                var url = $(e.target).attr('href');
                common.setActive(url);
            },
            // 删除标签卡
            closeCurTab: function (index) {
                common.delCurTab(index);
                this.tabs = common.getTabArr();
            },
            // 左移标签卡
            moveLeft: function () {
                var url = common.moveLeftTab();
                url && (window.location.href = window.location.origin + url);
            },
            // 右移标签卡
            moveRight: function () {
                var url = common.moveRightTab();
                url && (window.location.href = window.location.origin + url);
            },
            // 关闭所有标签卡
            delAllTab: function () {
                common.delAllTab();
                this.tabs = common.getTabArr();
            },
            // 关闭其它标签卡
            closeOtherTab: function () {
                common.delOtherTab();
                this.tabs = common.getTabArr();
            },
            addRecord:function(){

            }
        },
    });

    /**
     * 初始化
     */
    var _init=function(){
        main.renderTabs();
        common.getTabLink();
        main.layuiTab();
        main.layuiUpload();
        main.layuiTable();
    };
    _init();
});
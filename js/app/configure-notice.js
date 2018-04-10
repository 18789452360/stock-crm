require(['common', 'layui', 'tools', 'ajaxurl', 'layers'], function (common, layui, tools, ajaxurl, layers) {

    var main = {
        /**
         * 初始化 Layui 表格
         */
        createForm: function () {
            var that = this;
            layui.use(['element', 'form'], function () {
                var element = layui.element,
                    form = layui.form;
                form.on('submit(formAddRemark)', function(data){
                    main.getupdateNotice();
                })
            })
        },
        /**
         * [getList description] 获取已配置好列表
         * @return {[type]} [description]
         */
        getbackNotice: function () {
            if (vm.userinfo) {
                tools.ajax({
                    url: ajaxurl.setting.backNotice,
                    type: 'get',
                    success: function (result) {
                        if (result.code == 1) {
                            vm.backNotice= result.data.list;
                        } else {
                            layers.toast(result.message);
                        }
                    }
                })
            }
        },
        /**
         * [getNum description] 配置通知对象
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        getupdateNotice: function () {
            tools.ajax({
                url: ajaxurl.setting.updateNotice,
                data: {
                    data:vm.backNotice
                },
                type: 'post',
                success: function (result) {
                    if (result.code == 1) {
                        main.getbackNotice();
                        layers.toast('修改成功', {
                                icon: 1,
                                anim: 1
                        });
                        setTimeout(function() {
                            common.closeTab();
                        }, 1000);
                    } else {
                        layers.toast(result.message);
                    }
                }
            })
        },
        /**
         * 监听checkbox的变化
         */
        checkChange: function () {
            // 监听全选框的状态
            $(".checkAll").click(function () {
                var checked = $(this).prop('checked'),
                    childInput = $("input[name='check']");
                if (checked) {
                    childInput.prop("checked", true);
                } else {
                    childInput.prop("checked", false);
                }
            });
            // 监听子选择框的状态
            $(".wait-table").on("click", '.child-input', function () {
                var checkedAll = $(".checkAll"),
                    allInput = $("input[name='check']").length,
                    sInput = $("input[name='check']:checked").length;
                if (sInput < allInput) {
                    checkedAll.prop('checked', false);
                } else {
                    checkedAll.prop('checked', true);
                }
            })
        },
        /**
         * [getNum description] 选择配置通知对象
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        getchoiceNotice: function () {
            $("input[name='checks']").prop("checked", false);
            $("input[name='check']").prop("checked", false);
            tools.ajax({
                url: ajaxurl.setting.choiceNotice,
                data: {
                    curpage:vm.NoticePage,
                    pagesize:10,
                },
                type: 'post',
                success: function (result) {
                    if (result.code == 1) {
                        vm.Notice = result.data.list;
                        vm.NoticeNum = result.data.total_num;
                        main.getPage();
                    } else {
                        layers.toast(result.message);
                    }
                }
            })
        },
        /**
         * 分页 (我的)
         */
        getPage: function() {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'notice',
                    count: vm.NoticeNum    // 数据总数
                    ,limit: 10         // 每页显示条数
                    ,curr: vm.NoticePage         // 当前页数
                    ,jump: function (obj, first) {
                        if (!first) {
                            vm.NoticePage = obj.curr;      // 获取当前页
                            main.getchoiceNotice();           // 发送请求
                        }
                    }
                });
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
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            backNotice: [],
            userinfo: common.getUserInfo(),
            Notice: '', 
            NoticeNum:'',
            NoticePage:1,
            allupdateNotice:'',//上传多选已选数据
            addShow: false,
        },
        methods: {
            delNotice: function (index) {
                this.backNotice.splice(index,1);
            },
            addNotice: function(name,id,index){
                this.backNotice.push({name:name,id:id});
                this.backNotice = main.unique(this.backNotice);
            },
            addallNotice: function(){
                var $commonTable = $(".com-table tr input:checked");
                $commonTable.each(function () {
                    var dataID = $(this).attr("data-id");
                    var dataName = $(this).val();
                    vm.backNotice.push({name:dataName,id:dataID});
                });
                vm.backNotice = main.unique(vm.backNotice);
                vm.addShow = false;
            },
            cancelAdd: function(){
                main.getbackNotice();
            },
        },
    });
    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.createForm();
        common.getTabLink();
        main.getbackNotice();
        main.getchoiceNotice();
        main.checkChange();
    };
    _init();
});

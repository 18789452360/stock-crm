/**
 * Created by Administrator on 2017-10-13.
 */
require(['vue', 'layui', 'common', 'ajaxurl', 'tools', 'layers', 'text!/assets/popup/finance-audit.html', 'text!/assets/popup/edit-remark.html', 'template', 'lightbox'], function (Vue, layui, common, ajaxurl, tool, layers, financeAudit, editRemark, template, lightbox) {
    template.config('openTag', '{?');
    template.config('closeTag', '?}');
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
         * 审核页面
         */
        financialPage: function() {
            // 获取路由参数id的值
            var urls = tool.getUrlArgs(), selCode = '';
            if(urls.has){
                selCode = urls.data.id;
            }
            tool.ajax({
                url: ajaxurl.financial.financial_view,
                type: 'post',
                data: {cooper_id: selCode},
                success: function(result){
                    if(result.code == 1){
                        // 渲染到vue数据层
                        vm.financialList = result.data;
                        vm.situation_id = result.data.customer_id;
                        main.getTagMark();
                    }else{
                        layers.toast(result.message);
                    }
                },
                error: function(){
                    layers.toast("网络异常!")
                }
            });
        },
        /**
         * 审核
         */
        financeAudit: function() {
            layers.open({
                title: '提示',
                area: ['450px', '340px'],
                content: financeAudit,
                success: function() {
                    layui.use(['form'], function () {
                        var form = layui.form;
                        form.render();
                    })
                },
                btn2: function() {
                    // 获取路由参数id的值
                    var urls = tool.getUrlArgs(), selCode = '';
                    if(urls.has){
                        selCode = urls.data.id;
                    }
                    var action = $(".finance-select").find(".layui-this").attr("lay-value"),
                        reason = $(".finance-textarea").val();
                    if(action === undefined) {
                        layers.toast("请选择审核结果");
                        return;
                    }
                    tool.ajax({
                        url: ajaxurl.financial.financial_post,
                        type: 'post',
                        data: {cooper_id: selCode, action: action, reason: reason},
                        success: function (result) {
                            if (result.code == 1) {
                                //layers.toast(result.message);
                                setTimeout(function() {
                                    window.location.reload();
                                }, 1000)
                            } else {
                                layers.toast(result.message);
                            }
                        },
                        error: function () {
                            layers.toast("网络异常!")
                        }
                    });
                }
            });
        },
        /**
         * 获取标签和备注
         */
        getTagMark: function () {
            tool.ajax({
                url: ajaxurl.customer.getListTagMark,
                data: {},
                success: function (res) {
                    if (res.code === 1) {
                        // 备注 && 标签
                        vm.remarkList = res.data.marklist;
                        vm.tagList = res.data.taglist;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        getTagMarkBefore: function(callback) {
            // 获取路由参数id的值
            var urls = tool.getUrlArgs(), customerId = '';
            if(urls.has){
                customerId = urls.data.id;
            }
            tool.ajax({
                url: ajaxurl.remarks.archives,
                data: {
                    situation_id: customerId // 用户id
                },
                success: function (result) {
                    if (result.code === 1) {
                        vm.gainRemarkList = result.data.list;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(result.message);
                    }
                }
            });
        },
        /**
         * 编辑备注询问框
         */
        editRemark: function () {
            main.getTagMarkBefore(function() {
                layers.open({
                    btn: null,
                    title: '添加备注',
                    area: ['604px', 'auto'],
                    content: editRemark,
                    success: function (layero, index) {
                        var $layero = $(layero);
                        var addedId = [];
                        $layero.find('.tag-group').html(template('addRemark', {data: vm.remarkList, datas: vm.gainRemarkList}));
                        //$layero.find('.remark-tip span').text(vm.checkedIdArr.length);
                        $layero.on('click', '.list-item', function (e) {
                            $(e.target).toggleClass('active');
                            var remarkId = $(e.target).data('id');
                            // 有则删除, 无则添加
                            if (addedId.indexOf(remarkId) === -1) {
                                addedId.push(remarkId);
                            } else {
                                addedId.forEach(function (item, index) {
                                    item === remarkId && addedId.splice(index, 1);
                                });
                            }
                        });
                        $layero.find('.un-checkall-btn').click(function () {
                            addedId = [];
                            $('.list-item').each(function () {
                                $(this).removeClass('active');
                            });
                        });
                        $layero.find('.checkall-btn').click(function () {
                            vm.remarkList.forEach(function (item) {
                                addedId.push(item.id);
                            });
                            $('.list-item').each(function () {
                                $(this).addClass('active');
                            });
                        });
                        $layero.find('.cancel').click(function () {
                            layers.closed(index);
                        });
                        $layero.find('.ok').click(function () {
                            // 获取id
                            var urls = tool.getUrlArgs(), customerId = '';
                            if(urls.has){
                                customerId = urls.data.id;
                            }
                            tool.ajax({
                                url: ajaxurl.remarks.hit,
                                data: {
                                    mark_id: addedId.join(','),
                                    situation_id: customerId // 用户id
                                },
                                success: function (res) {
                                    if (res.code === 1) {
                                        layers.toast('添加成功！');
                                        layers.closed(index);
                                    } else {
                                        layers.toast(res.message);
                                    }
                                }
                            });
                        });
                        // 删除合作情况备注
                        $layero.on("click", '.remark-del', function () {
                            // 获取备注id
                            var mark_id = $(this).parent("li").attr('data-id');
                            // 删除当前备注
                            $(this).parent("li").remove();
                            var urls = tool.getUrlArgs(), customerId = '';
                            if(urls.has){
                                customerId = urls.data.id;
                            }
                            // 发送请求
                            tool.ajax({
                                url: ajaxurl.remarks.del_coo_mark,
                                data: {
                                    mark_id: mark_id,
                                    situation_id: customerId // 用户id
                                },
                                success: function (res) {
                                    if (res.code === 1) {
                                        layers.toast('删除成功！');
                                    } else {
                                        layers.toast(res.message);
                                    }
                                }
                            });
                        });
                        // 全选
                        $layero.on("click", ".check-select", function() {
                            $(event.target).addClass("active");
                            $(event.target).siblings("a").removeClass("active");
                        })
                    }
                });
            });
        },
        lightboxs: function(){
            lightbox.init('#financeCkeckBoxs')
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            situation_id: '',
            userinfo: '', //员工id
            financialList: [],
            gainRemarkList: ''
        },
        methods: {
            financeAudit: function() {
                main.financeAudit();
            },
            // 编辑备注
            editRemark: function() {
                main.editRemark();
            }
        }
    });
    /**
     * 注册全局过滤组件
     */
    Vue.filter("isMaxLen", function (str, len) {
        /**
         *  输入的只有中文,一个中文占两个字符
         *  @param str 传入的字符串
         *  @param len 限制的字符串的长度
         */
        var regexp = /[^\x00-\xff]/g, // 正则表达式匹配中文
            strLen = str.replace(regexp, "aa").length; // 获取字符串字节长度
        if (strLen <= len) { // 当字符串字节长度小于指定的字节长度时
            return str;
        }
        // 假设指定长度内都是中文
        var m = Math.floor(len/2);
        for (var i = m, j = str.length; i < j; i++) {
            // 当截取字符串字节长度满足指定的字节长度
            if (str.substring(0, i).replace(regexp, "aa").length >= 0) {
                return str.substring(0, i);
            }
        }
        return str;
    });
    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.admin();
        main.financialPage();
        main.lightboxs();
    };
    _init();
});

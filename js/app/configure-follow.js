/**
 * Created by Administrator on 2017-09-25.
 */
/**
 * Created by Administrator on 2017-09-18.
 */
require(['common', 'jquery.metisMenu', 'layui', 'layers','ajaxurl','tools'], function (common, undefined, layui, layer,ajaxurl,tool) {

    var main = {
        /**
         * 表单提交
         */
        createForm: function () {
            var that = this;
            layui.use(['form'], function () {
                var form = layui.form;
                //添加客户备注
                form.on('submit(formAddRemark)', function(data){
                    var x ,temp= [];
                    for (x in data.field){
                        if(data.field[x] == ''){
                            layer.toast('请输入内容！', {
                                icon: 2,
                                anim: 6
                            });
                            return false;
                        }
                        temp.push(data.field[x]);
                    }
                    var nary = temp.sort();
                    for(var j=0,len=nary.length-1;j<len;j++){
                        if(nary[j] == nary[j+1]){
                            layer.toast('内容重复，请从新输入！', {
                                icon: 2,
                                anim: 6
                            });
                            return false;
                        }
                    }

                    that.addRemark(data);
                    return false;
                });
            });
        },
        /* 获取列表数据 */
        getFollowInfo: function() {
            tool.ajax({
                url:ajaxurl.setting.index,
                type:'get',
                data:{type:1},
                success:function(result){
                    if(result.code == 1 ){
                        vm.followInfo = result.data.follow_up_type;
                        main.createForm();
                    }else{
                        layers.toast(result.message);
                    }
                }
            });
        },
        /**
         * [addRemark description] 提交表单数据
         */
        addRemark:function(data){
            tool.ajax({
                url: ajaxurl.setting.subfollow,
                data:{
                    name:'follow_up_type',
                    intro:'跟进类型',
                    value:data.field,
                },
                type: 'post',
                success: function(result){
                    if(result.code == 1){
                        layer.toast('添加成功！', {
                                icon: 1,
                                anim: 1
                        });
                        setTimeout(function() {
                            common.closeTab();
                        }, 1000);
                    }else{
                        layers.toast(result.message);
                        // vm.tipsRemarkWord = result.message
                    }
                }
            });
            return false;
        },
        Customer:function(num,that){
            if (!num) {
                layer.toast('请输入内容！', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
        }
    };
    /* 实例化vue */
    var vm = new Vue({
        el: "#app",
        data: {
            tableList: [{err:'',text:''}],
            followInfo: [],
            numInfo:[],
            nameInfo:[],
        },
        methods: { 
            //input失去焦点验证
            checkCustomer:function(event,num,index){
                var that = this
                main.Customer(num,this); 
            },
            // 取消数据提交
            cancelAdd:function(){
                common.closeTab();
            },
        },
        
    });
    var _init = function() {
        main.getFollowInfo(); 
    };
    _init();
});
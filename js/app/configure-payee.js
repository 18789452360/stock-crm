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
                form.on('submit(formAddRemark)', function(data){
                    var temp = [];
                    for(var i in data.field){
                        if($.trim(data.field[i]) == ''){
                            layer.toast('请输入内容！', {
                                icon: 2,
                                anim: 6
                            });
                            return false;
                        }    
                    }
                    var Info = vm.payeeInfo;
                    var nary = Info.sort(),lens = nary.length-1;
                    for(var i=0;i<lens;i++){
                        if(nary[i].name == nary[i+1].name){
                            layer.toast('内容重复，请从新输入！', {
                                icon: 2,
                                anim: 6
                            });
                            return false;
                        }
                        var Infoacc = Info[i].temp,len = Infoacc.length-1;
                        for(var j=0;j< len;j++){
                            if(nary[i].temp[j].name == nary[i].temp[j+1].name){
                                layer.toast('帐号重复，请从新输入！', {
                                    icon: 2,
                                    anim: 6
                                });
                                return false;
                            }
                        }
                    }
                    that.addRemark(vm.payeeInfo);
                    return false;
                });
            });
        },
        /* 获取列表数据 */
        getPayeeInfo: function() {
            var that = this;
            tool.ajax({
                url:ajaxurl.setting.index,
                type:'get',
                success:function(result){
                    if(result.code == 1 ){
                            var datas = result.data.collection_account;
                            var temp = [];
                            if(datas == null || datas == false){
                                temp.push({name: '', acc:[], temp:[{name:''}]});
                                vm.payeeInfo = temp;  
                            }else{
                                var  lens = datas.length;
                                for(var i = 0; i < lens; i++){
                                    var accLens = datas[i].acc.length;
                                    if(datas[i].temp == undefined){
                                        datas[i].temp = []
                                    }
                                    for(var j = 0; j < accLens; j++){
                                        datas[i].temp.push({name: datas[i].acc[j]});
                                    }
                                }
                                vm.payeeInfo = datas;
                            }
                        that.createForm();
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
                url: ajaxurl.setting.subpayee,
                data:{
                    name:'collection_account',
                    intro:'收款账号',
                    value:data,
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
                        vm.tipsRemarkWord = result.message
                    }
                }
            });
            return false;
        },
        Customer:function(num,index,indexs,that){
            if (!num) {
                layer.toast('请输入内容！', {
                    icon: 2,
                    anim: 6
                });
                return false;
            }
        },
        /**
         * [delPayee description]
         * @return {[type]} [description]
         */
        delPayee:function(name){
          tool.ajax({
                url: ajaxurl.setting.determine,
                data:{
                    name:'collection_account',
                    value:name,
                },  
                type: 'post',
                success: function(result){
                    if(result.code == 1){
                    }else{
                        vm.tipsRemarkWord = result.message
                    }
                }
            });
            return false;  
        }
    };
    /* 实例化vue */
    var vm = new Vue({
        el: "#app",
        data: {
            tableList: [{err:'',text:''}],
            payeeInfo: [],
            payeeInfoacc:[],
            addRemarkShow: false, 
            addRemarkVal: '',//客户备注的错误提示
            addGroupShow: false, //客户分组是否显示
        },
        methods: { 
            //增加input框
            addInput: function(event,index){
                if(index != undefined){
                    this.payeeInfo[index].temp.push({name:''});
                }
                //main.setaddInput(event);
            },
            //增加收款方
            addPayee: function(index){
                this.payeeInfo.push({name: '', acc:[], temp:[{name:''}]});
            },
            //删除
            removeMobile: function(event,index,indexs){
                if(this.payeeInfo[index].temp.length == 1){
                    var len = this.payeeInfo[index].temp.length;
                    for(var i=0;i<len;i++){
                        this.payeeInfo[index].temp[i].name = '';
                    }
                    layer.toast('账号已删除', {
                        icon: 1,
                        anim: 1
                    });
                }else{
                    if(indexs != undefined){
                        this.payeeInfo[index].temp.splice(indexs,1);
                    }
                }
            },
            //删除收款方
            removePayee: function(event,index,name){
                this.payeeInfo.splice(index,1);
            },
            //input失去焦点验证
            checkCustomer:function(event,num,index,indexs){
                var that = this;
                main.Customer(num,index,indexs,that); 
            },
            // 取消数据提交
            cancelAdd:function(){
                common.closeTab();
            },
        },
        
    });
    var _init = function() {
        main.getPayeeInfo();
    };
    _init();
});
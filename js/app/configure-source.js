/**
 * Created by Administrator on 2017-09-25.
 */
/**
 * Created by Administrator on 2017-09-18.
 */
require(['common', 'jquery.metisMenu', 'layui', 'layers','ajaxurl','tools','text!/assets/popup/nodel-source.html', 'text!/assets/popup/del-source.html',], function (common, undefined, layui, layer,ajaxurl,tool,nodelSource,delSource) {

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
                    // console.log(data.field.mark_name)
                    var x ,temp = [];
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
                        if($.trim(nary[j])== $.trim(nary[j+1])){
                            layer.toast('内容重复，请从新输入！', {
                                icon: 2,
                                anim: 6
                            });
                            return false;
                        }
                    }
                    that.addRemark(vm.sourceInfo);
                    that.sourceDele(vm.sourceId);
                    return false;
                });
            });
        },
        /* 获取列表数据 */
        getSourceInfo: function() {
            tool.ajax({
                url:ajaxurl.setting.sourceView,
                type:'get',
                success:function(result){
                    if(result.code == 1 ){
                        var  temp = [];
                        if(result.data.list == null){
                            temp.push({name: '', err: ''});
                        }else{
                           var lens = result.data.list.length;
                            if(lens){
                                for(var i = 0; i < lens; i++){
                                    temp.push({name: result.data.list[i].name, id:result.data.list[i].id,cid:result.data.list[i].cid});
                                }   
                            } 
                        }
                        vm.sourceInfo = temp;
                        main.createForm();
                    }else{
                        layers.toast(result.message);
                    }
                }
            });
        },
        /**
         * [sourceDele description] 提交删除id来源
         */
        sourceDele:function(data){
            tool.ajax({
                url: ajaxurl.setting.sourceDele,
                data:{
                    id:data,
                },
                type: 'post',
                success: function(result){
                    if(result.code == 1){
                        // layer.toast('删除成功！', {
                        //         icon: 1,
                        //         anim: 1
                        // });
                        // setTimeout(function() {
                        //     common.closeTab();
                        // }, 1000);
                    }else{
                        layer.toast(result.message);
                    }
                }
            });
            return false;
        },
        /**
         * [addRemark description] 提交编辑来源
         */
        addRemark:function(data){
            tool.ajax({
                url: ajaxurl.setting.sourceEdit,
                data:{
                    data:data,
                },
                type: 'post',
                success: function(result){
                    if(result.code == 1){
                        layer.toast('编辑成功！', {
                                icon: 1,
                                anim: 1
                        });
                        setTimeout(function() {
                            common.closeTab();
                        }, 1000);   
                    }else{
                        // vm.tipsRemarkWord = result.message
                        layer.toast(result.message);
                    }
                }
            });
            return false;
        },
        /**
         * [addRemark description] 查询来源
         */
        sourceCheck:function(indexs,id,that){
            tool.ajax({
                url: ajaxurl.setting.sourceCheck,
                data:{
                    id:id,
                },
                type: 'post',
                success: function(result){
                    if(result.code == 1){
                        //检测出此来源没有客户绑定，弹窗
                        main.delSource(indexs,id,that);
                    }else{
                        //有客户绑定 弹窗
                        main.nodelSource();
                    }
                }
            });
            return false;
        },
        /**
         * 有客户使用此来源弹窗
         */
        nodelSource: function () {
            layer.confirm({
                title: '提示',
                btn: ['确定'],
                content: nodelSource,
                btn1: function(index, layero){ // btn 1  确定回调
                    
                }   
            });
        },
        /**
         * 无客户使用此来源弹窗
         */
        delSource: function (indexs,id,that) {
            layer.confirm({
                title: '提示',
                content: delSource,
                btn2: function(index, layero){ // btn 1  确定回调
                    that.sourceInfo.splice(indexs, 1);
                    console.log(id)
                    if(id){
                        vm.sourceId.push({id:id});
                    }
                }   
            });
        },
        Customer:function(num){
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
            sourceInfo: {
                name:'',
                id:'',
                cid:''
            },
            sourceId: [],
            addRemarkShow: false, 
            addRemarkVal: '',//客户备注的错误提示
            addGroupShow: false, //客户分组是否显示
        },
        methods: { 
            //增加input框
            addInput: function(){
                this.sourceInfo.push({name:'',id:0,cid:''});
            },
            //删除
            removeMobile: function(index){
                var that = this,id = this.sourceInfo[index].id;
                main.sourceCheck(index,id,that);   
            },
            //input失去焦点验证
            checkCustomer:function(event,num,index){
                main.Customer(num); 
            },
            // 取消数据提交
            cancelAdd:function(){
                common.closeTab();
            },
        },
        
    });
    var _init = function() {
        main.getSourceInfo();
    };
    _init();
});
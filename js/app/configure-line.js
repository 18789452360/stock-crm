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
                    // console.log(data.field);
                    that.addRemark(data.field);
                    return false;
                });
            });
        },
        /* 获取线下产品数据 */
        getlineInfo: function() {
            var that = this, loadIndex = '';
            tool.ajax({
                url:ajaxurl.setting.line,
                type:'get',
                beforeSend:function(){
                  layer.load(function(index){
                    loadIndex = index;
                  })
                },
                success:function(result){
                    if(result.code == 1 ){
                        // vm.onlineInfo = result.data;                    
                        that.getlineCheck(result.data.list, loadIndex);
                    }else{
                        layer.toast(result.message);
                    }
                },
                complete: function(){
                    setTimeout(function(){
                        layer.closed(loadIndex);
                    },200)
                }
            });
        },
        /* 获取已选数据*/
        getlineCheck: function(datas) {
            var that = this, datasLens = datas.length;
            if(datasLens == 0){
              throw new Error('缺少初始数据！');
            }
            tool.ajax({
                url:ajaxurl.setting.index,
                type:'get',
                success:function(result){
                    if(result.code == 1 ){
                      var lineCheck = result.data.line_investment_plan, resLens = lineCheck.length;
                      if(lineCheck == undefined){
                        vm.lineInfo = datas;
                      }else{
                        //循环处理active
                        for(var i = 0; i < datasLens; i++){
                          if(datas[i].active == undefined){
                              datas[i].active = false;
                          }
                          //循环处理相等数据
                          for(var k = 0; k < resLens; k++){
                            if(datas[i].id == lineCheck[k].id){
                                if(datas[i].id == lineCheck[k].id){
                                  datas[i].active = true;
                                }
                            }
                          }
                        }
                        vm.lineInfo = datas;
                        main.createForm();
                      }
                      main.createForm();
                    }else{
                        layers.toast(result.message);
                    }
                }
            });
        },
        // /**
        //  * [addRemark description] 提交表单数据
        //  */
        addRemark:function(data){
            tool.ajax({
                url: ajaxurl.setting.editline,
                data:{
                    name:'line_investment_plan',
                    intro:'线下投顾计划',
                    value:data,
                },
                type: 'post',
                success: function(result){
                    if(result.code == 1){
                        layer.toast('添加成功！', {
                                icon: 1,
                                anim: 2
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
    };
    /* 实例化vue */
    var vm = new Vue({
        el: "#app",
        data: {
            tableList: [{err:'',text:''}],
            lineInfo: '',
            addRemarkShow: false, 
            addRemarkVal: '',//客户备注的错误提示
            addGroupShow: false, //客户分组是否显示
        },
        methods: { 
            // 取消数据提交
            cancelAdd:function(){
                common.closeTab();
            },
        },
        
    });
    var _init = function() {
        common.getTabLink();
        main.getlineInfo();
    };
    _init();
});
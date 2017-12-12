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
                    that.addRemark(data.field);
                    return false;
                });
            });
        },
        /* 获取第三方数据数据 */
        getOnlineInfo: function() {
            var that = this, loadIndex = '';
            tool.ajax({
                url:ajaxurl.setting.online,
                type:'get',
                beforeSend:function(){
                  layer.load(function(index){
                    loadIndex = index;
                  })
                },
                success:function(result){
                    if(result.code == 1 ){
                        // vm.onlineInfo = result.data;                      
                        that.getOnlineCheck(result.data, loadIndex);

                    }else{
                        layer.toast(result.message);
                    }
                }
            });
        },
        /* 获取已选数据*/
        getOnlineCheck: function(datas, loadIndex) {
            var that = this, datasLens = datas.length;
            if(datasLens == 0){
              throw new Error('缺少初始数据！');
            }
            tool.ajax({
                url:ajaxurl.setting.index,
                type:'get',
                success:function(result){
                    if(result.code == 1 ){
                      var OnlineCheck = result.data.online_consulting_plan, resLens = OnlineCheck.length;
                      if(OnlineCheck == undefined){
                        vm.onlineInfo = datas;
                      }else{
                        //循环处理active
                        for(var i = 0; i < datasLens; i++){
                          for(var j = 0, agencyLens = datas[i].agency_service.length; j < agencyLens; j++){
                              if(datas[i].agency_service[j].active == undefined){
                                  datas[i].agency_service[j].active = false;
                              }
                          }

                          //循环处理相等数据
                          for(var k = 0; k < resLens; k++){
                            if(datas[i].agency_id == OnlineCheck[k].bid){
                                for(var w = 0, agencyLens = datas[i].agency_service.length; w < agencyLens; w++){
                                  for(var t = 0, childLens = OnlineCheck[k].child.length; t < childLens; t++){
                                    if(datas[i].agency_service[w].asc_id == OnlineCheck[k].child[t].sid){
                                      datas[i].agency_service[w].active = true;
                                    }
                                  }
                                }
                            }
                          }
                        }
                        vm.onlineInfo = datas;
                        main.createForm();
                      }
                      main.createForm();
                    }else{
                        layers.toast(result.message);
                    }
                },
                complete: function(){
                  layer.closed(loadIndex);
                }
            });
        },
        // /**
        //  * [addRemark description] 提交表单数据
        //  */
        addRemark:function(data){
            tool.ajax({
                url: ajaxurl.setting.subonline,
                data:{
                    name:'online_consulting_plan',
                    intro:'线上投顾计划',
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
            onlineInfo: '',
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
        main.getOnlineInfo();
    };
    _init();
});
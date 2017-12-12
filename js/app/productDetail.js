require(['layui', 'common', 'layers', 'tools', 'ajaxurl', 'page'], function (layui, common, layers, tool, ajaxurl, page) {
    var main = {
        /**
         * 获取产品信息
         */
        getProductDetail:function(){
            var urls = vm.getUrls;
            if(!urls.has || !urls.data.product_id){
                layers.toast('缺少产品id参数');
                return false; 
            }
            vm.product_id = urls.data.product_id;
            var loading = '';
            tool.ajax({
                url:ajaxurl.product.getProductDetail,
                data:{
                    product_id:urls.data.product_id,
                    info_type:2
                },
                type:'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loading = indexs;
                    });
                },
                success:function(data){
                    if(data.code == 1){
                        vm.productData = data.data.product;
                        vm.product_stock = data.data.product_stock;
                    }else{
                        layers.toast(data.message);
                    }
                    layers.closed(loading);
                },
                error:function(){
                    layers.toast('网络异常!');
                    layers.closed(loading);
                }
            })
        },
    };
    var vm = new Vue({
        el:'#app',
        data:{
            getUrls: tool.getUrlArgs(), //获取Url参数
            productData:{},//产品详情
            product_stock:[],//标的详情
            product_id:'',//产品id
        },
        methods:{
            comeback:function(){//返回上一页
                common.closeTab();
            }
        },
    });

    var _init = function(){
        common.getTabLink();
        main.getProductDetail();
    };
    _init();
})
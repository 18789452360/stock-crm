/**
 * 配置 layerpage 类
 */
define(['layui'], function (layui) {
    //layerpage.dir = false; //不加载默认css
    return {
        /**
         * [init description]  分页类
         * @param  {[type]}   args     [description]
         * {
		 * 		elem: '', //分页容器 指向存放分页的容器，值可以是容器ID、DOM对象
		 * 		count: '', //总页数
		 * 		groups: 10, //连续分页数
		 *		first: '首页', //用于控制首页。值支持三种类型。如：first: '首页' 如：first: false，则表示不显示首页项
		 *		last: '末页', //用于控制尾页。值支持三种类型 如：last: '尾页' 如：last: false，则表示不显示尾页项
		 *		prev: '上一页', //用于控制上一页。若不显示，设置false即可
		 *		next: '下一页', //用于控制下一页。若不显示，设置false即可
		 *		skip: false, //是否显示跳转
		 *		theme: ''  配置样式类名
		 * }
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        init: function (args, callback) {
            if (!args.elem && !args.count) {
                throw new Error('分页缺少对象');
            }
            var Isprev = '',
                Isnext = '';
            if (args.pages < 8) {
                Isprev = false;
                Isnext = false;
            } else {
                Isprev = '<';
                Isnext = '>';
            }
            var __THIS__ = new Object();
            $.extend(__THIS__, {
                elem: '', //分页容器
                count: '', // Total 总条数
                limit: 10,// Pagesize 默认10
                groups: 10, //连续分页数
                first: '首页', //用于控制首页。值支持三种类型。如：first: '首页' 如：first: false，则表示不显示首页项
                last: '末页', //用于控制尾页。值支持三种类型 如：last: '尾页' 如：last: false，则表示不显示尾页项
                prev: Isprev, //用于控制上一页。若不显示，设置false即可
                next: Isnext, //用于控制下一页。若不显示，设置false即可
                skip: false, //是否显示跳转
                theme: 'gxscrm',
                jump: function (obj, flag) { //触发分页后的回调，函数返回两个参数。obj是一个object类型。包括了分页的所有配置信息。flag一个Boolean类，检测页面是否初始加载。非常有用，可避免无限刷新。
                    typeof callback === 'function' && callback.call(this, obj, flag);
                }
            }, args);
            layui.use(['laypage'], function () {
                var layerpage = layui.laypage;
                layerpage.render(__THIS__);
            });
        }
    }
});
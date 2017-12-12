/**
 * [description] 全屏灯箱
 * @param  {[type]} ){} [description]
 * @return {[type]}       [description]
 * eg: 
 * <div id="gallery1" class="gallery gallery12">
		<a href="media/sample_a.jpg" title="Caption for image A"><img src="media/sample_a_thumb.jpg" /></a>
		<a href="media/sample_b.jpg" title="Caption for image B"><img src="media/sample_b_thumb.jpg" /></a>
		<a href="media/sample_c.jpg" title="Caption for image C"><img src="media/sample_c_thumb.jpg" /></a>
		<a href="media/sample_d.jpg" title="Caption for image D"><img src="media/sample_d_thumb.jpg" /></a>
	</div>
 */
define(['jquery.rebox'],function(){
	return {
		/**
		 * [init description]
		 * @param  {[type]} dom     [description]  父级盒子的  ID  OR CLASS 带 # or .
		 * @param  {[type]} options [description]  配置项
		 * @return {[type]}         [description]
		 */
		init: function(dom, options){
			if (!dom) {
				throw new Error('灯箱组件缺少目标对象！');
			}
			var defaults = {
			    theme: 'rebox',        // class name parent gets (for your css)
			    selector: 'a',        // the selector to delegate to, should be to the <a> which contains an <img>
			    prev: '&larr;',        // use an image, text, whatever for the previous button
			    next: '&rarr;',        // use an image, text, whatever for the next button
			    loading: '%',          // use an image, text, whatever for the loading notification
			    close: '&times;',      // use an image, text, whatever for the close button
			    speed: 600,            // speed to fade in or out
			    zIndex: 1000,          // zIndex to apply to the outer container
			    cycle: true,           // whether to cycle through galleries or stop at ends
			    captionAttr: 'title',   // name of the attribute to grab the caption from
			    template: 'image',     // the default template to be used (see templates below)
			    // templates: {           // define templates to create the elements you need function($item, settings)
			    //     image: function($item, settings, callback){ 
			    //         return $('<img src="'+ $item.attr('href') +'" class="'+ s.theme +'-content" />').load(callback);
			    //     }
			    // }
			}
			var settings = $.extend(true, defaults, options);
			var target = $(dom);
			if(target.length){
				target.rebox(settings);
			}else{
				throw new Error('灯箱组件节点不存在！');
			}
		},
		destroy: function(dom){
			$(dom).rebox('destroy');
		}
	}
});
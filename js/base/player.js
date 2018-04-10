/**
 * [description] 处理音频播放
 * @param  {[type]} jPlayer){} [description]
 * @return {[type]}              [description]
 */
define(['jplayer', 'layers'],function(jPlayer, layers){
	return {
		init: function(url) {
			var jquery_jplayer_control = $('#jquery_jplayer_control'); //ui层最外层ID
			var jquery_jplayer = $('#jquery_jplayer_1'); //底部悬浮  有而只有一个唯一ID
			if(jquery_jplayer.length == 0){
				throw new Error('player目标节点不存在！');
			}
			if(!url){
				throw new Error('player缺少参数！');
			}
			
			jquery_jplayer.jPlayer( "destroy" );//先摧毁一次

			jquery_jplayer.jPlayer({
				ready: function (event) {
					$(this).jPlayer("setMedia", {
						mp3: url
					}).jPlayer("play"); //自动播放
				},
				play: function(event) { //播放当前的时候暂定其他
                    if(event.jPlayer.status.readyState === 0){
                        //layers.toast('音频未加载成功！');
                        return;
                    }
				},
				swfPath: window.location.protocol + '//' + window.location.host + "/Home/js/libs/jplayer", //设置swf的路径地址
				supplied: "mp3, webma",
                solution:'html, flash',
				wmode: "window",
				useStateClassSkin: true,
				autoBlur: false,
				smoothPlayBar: true,
				keyEnabled: false,
				remainingDuration: false,
				cssSelectorAncestor: '#jp_container_1',
				toggleDuration: false,
                errorAlerts: true
			});
		},
		stop: function(){ //停止播放 直接摧毁

			var jquery_jplayer = $('#jquery_jplayer_1'); //底部悬浮  有而只有一个唯一ID
			if(jquery_jplayer.length == 0){
				throw new Error('player目标节点不存在！');
			}
			jquery_jplayer.jPlayer( "destroy" );//先摧毁一次
		}
	}
});
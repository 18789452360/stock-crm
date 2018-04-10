define(['tools', 'ajaxurl', 'layers', 'layui', 'player', 'text!/assets/popup/shield-news.html'], function (tools, ajaxurl, layers, layui, player, shieldNews) {

    var common = {
        callUserImg: ajaxurl.BaseUrl + '/assets/images/calluser{index}.png',
        /**
         * Tab 标签页 helper
         * 查找数组中的对象, 找到了返回索引值, 没找到返回 -1
         * @returns {number}
         */
        findElem: function (arrayToSearch, attr, val) {
            for (var i = 0, len = arrayToSearch.length; i < len; i++) {
                if (arrayToSearch[i][attr] === val) {
                    return i;
                }
            }
            return -1;
        },
        /**
         * 判断当前窗口是否是最顶层
         */
        isIframe: function () {
            var flag = '';
            window.self != window.top ? flag = true : flag = false;
            return flag;
        },
        /**
         * [getDocument description]获取当前的document
         * @return {[type]} [description]
         */
        getDocument: function () {
            var $elem;
            window.self != window.top ? $elem = $("body", parent.document) : $elem = $(document);
            return $elem;
        },
        /**
         * 返回上一页
         * @param boole true返回上一页刷新，false 返回上一页不刷新
         * @returns {boolean}
         */
        closeTab: function (boole) {
            var $document = common.getDocument(),
                $J_menuTab = $document.find('.page-tabs-content .J_menuTab.active'),
                url = $J_menuTab.data('backurl'),
                name = $J_menuTab.data('backname') || '提示';
            if (url == '/') {
                common.isTabShow(true);
                return false;
            }
            //默认为false不刷新页面
            boole ? common.setTab(url, name, '', '', true) : common.setTab(url, name, '', '', false);
            common.delCurTab($J_menuTab.find('i'), true);
            return false;
        },
        /**
         * @param n iframe显示与隐藏
         * @returns {boolean}
         */
        isTabShow: function (n) {
            var $document = common.getDocument();
            if (n) {
                $document.find('.first-item').addClass('active');
                $document.find('.J_menuTab').removeClass('active');
                $document.find('.index').removeClass('layui-hide');
                $document.find('.iframe-wrap').addClass('layui-hide');
                $document.find('.J_mainContent').addClass();
                return false;
            }
            $document.find('.iframe-wrap').removeClass('layui-hide');
            $document.find('.first-item').removeClass('active');
            $document.find('.index').addClass('layui-hide');
        },
        /**
         * 根据参数设置tab
         * @param url  地址
         * @param name title名字
         * @param backUrl 来路页的地址
         * @param refresh 是否刷新该页面 该值在tab存在时才生效
         * @returns {boolean}
         */
        setTab: function (url, name, backUrl, backName, refresh) {
            var flag = true, $tabs = '', $J_mainContent = '',
                $document = common.getDocument();
            $tabs = $document.find('.page-tabs-content');
            $J_mainContent = $document.find('.J_mainContent');
            var $J_menuTab = $tabs.find('.J_menuTab');
            //遍历所有的J_menuTab，看是否存在该tab 选项卡存在情况
            $J_menuTab.each(function () {
                if ($(this).data('id') == url) {
                    if (!$(this).hasClass('active')) {
                        $J_menuTab.removeClass('active');
                        $(this).addClass('active');
                        // 显示tab对应的内容区
                        $J_mainContent.find('.J_iframe').each(function () {
                            if ($(this).data('id') == url) {
                                $(this).show().siblings('.J_iframe').hide();
                                return false;
                            }
                        });
                    }
                    if (refresh) {
                        common.refreshTab(this);
                    }
                    flag = false;
                    return false;
                }
            });
            // 选项卡菜单不存在
            if (flag) {
                var str = '<li  class="layui-elip tab-item active J_menuTab" data-backName="' + backName + '" data-backUrl = "' + backUrl + '" data-id="' + url + '"><a href="javascript:;" class="layui-elip">' + name + '</a><i class="iconfont icon-cha">&nbsp;</i></li>';
                $J_menuTab.removeClass('active');
                // 添加选项卡对应的iframe
                var str1 = '<iframe class="J_iframe"  width="100%" height="100%" src="' + url + '" frameborder="0" data-id="' + url + '" seamless></iframe>';
                //当iframe盒子中有iframe 先让其他隐藏，新增的显示，如果没有iframe，直接添加进去
                if ($J_mainContent.find('iframe.J_iframe').length == 0) {
                    $J_mainContent.append(str1);
                } else {
                    $J_mainContent.find('iframe.J_iframe').hide();
                    $J_mainContent.append(str1);
                }
                // 添加选项卡
                $tabs.append(str);
            }
            //处于首页时
            if ($('.first-item').hasClass('active')) {
                common.isTabShow(false);
            }
        },
        /**
         * tab刷新该iframe
         */
        refreshTab: function (that) {
            var $document = common.getDocument(),
                $J_iframe = $document.find('.J_mainContent');
            var target = $J_iframe.find('.J_iframe[data-id="' + $(that).data('id') + '"]');
            var url = target.attr('src');
            target.attr('src', url).load();
        },
        /**
         * 新增 Tab 标签页
         * 劫持带有 data-type="tab" 的 a 标签写入;
         */
        getTabLink: function () {
            // 如果直接访问子页面则跳转至首页
            /*var url = window.location.href;
            if (window.location.pathname !== '/admin/index/index') {
                if(url.indexOf('debug') === -1){
                    window === top && (window.location.href = '/admin/index/index');
                }
            }*/
            var $document = common.getDocument();
            Vue.nextTick(function () {
                $(document).on('click', 'a[data-type="tab"]', function (e) {
                    var backUrl = $document.find('.page-tabs-content li.active').data('id');
                    var dataUrl = $(this).prop('href').replace(ajaxurl.BaseUrl, ''),//获取a标签的href值
                        menuName = $(this).attr('data-title') || $(this).attr('title') || '提示';//获取a标签的title作为tab的标题
                    var backName = $document.find('.page-tabs-content li.active a').text() || "提示";
                    common.setTab(dataUrl, menuName, backUrl, backName,true);
                    return false;
                });
            });
        },
        /**
         * JS 写入全局tab
         * @param item 传入格式 {name: '名字', url: '需要跳转的链接',close:'是否关闭当前页面',updated:'是否刷新跳转过去的页面'},
         */
        getTabLinkWithJS: function (item) {
            if (!$.isEmptyObject(item)) {
                if (!item.url) {
                    layers.toast('缺少跳转链接');
                    return;
                }
                if (!item.url) {
                    layers.toast('缺少name');
                    return;
                }
                var flag = false;//默认跳转过去的页面不自动刷新
                if (item.updated) {
                    flag = true;
                }
                var $elem,
                    backurl = '',
                    backname = '',
                    boole = common.isIframe();
                if (boole) {
                    $elem = $("body", parent.document).find('.page-tabs-content .J_menuTab.active i');
                    backurl = $elem.parents('.J_menuTab').data('id');//用于跳转新tab后返回该页面时需要
                    backname = $elem.parents('.J_menuTab').find('a').text();
                } else {
                    backurl = '/';
                }
                //根据需要处理新tab
                common.setTab(item.url, item.name, backurl, backname, flag);
                if (item.close && boole) {//执行关闭当前tab操作
                    common.delCurTab($elem, true);
                }
            } else {
                throw Error('传入参数有误, item 对象不存在!');
            }
        },
        /**
         * [loadTabLink description] // 还有3中情况未考虑到: 1) 点击浏览器`后退`/`前进`  2) 直接访问 URL 3) 绝对地址问题
         * @return {[type]} [description]
         */
        loadTabLink: function () {
            //var curUrl = window.location.pathname; //获取当前页面的path路径
            var curUrl = window.location.href.replace(ajaxurl.BaseUrl, '');
            if (tools.hasStorage('tabIndex')) {
                if (tools.getStorage('tabIndex').length) {
                    var tmpArr = tools.getStorage('tabIndex'), lens = tmpArr.length;
                    for (var i = 0; i < lens; i++) {
                        if (tmpArr[i].url === curUrl && tmpArr[i].active) { //当前页面刷新
                            break;
                        } else if (tmpArr[i].url === curUrl && !tmpArr[i].active) { //跳转历史记录页面
                            tmpArr[i].active = true;
                        } else {
                            tmpArr[i].active = false;
                        }
                    }
                    if (this.findElem(tmpArr, 'url', curUrl) == -1) { //表示不存在
                        tmpArr.push({name: '提示', url: curUrl, active: true});
                    }
                    tools.setStorage('tabIndex', tmpArr);
                    return tmpArr;
                } else {
                    tools.removeStorage('tabIndex');
                    //window.location.href = '/admin/index/index';
                    return;
                }
            } else {
                if (tools.hasStorage('tempTabIndex')) {
                    var tempTabIndex = tools.getStorage('tempTabIndex'), tempLens = tempTabIndex.length,
                        tabTitle = '提示';
                    for (var i = 0; i < tempLens; i++) {
                        if (curUrl === tempTabIndex[i].url) {
                            tabTitle = tempTabIndex[i].name;
                        }
                    }
                }
                var tabItem = [{
                    name: tabTitle,
                    url: curUrl,
                    active: true
                }];
                tools.setStorage('tabIndex', tabItem);
                return tabItem;
            }
        },
        /**
         * 删除指定tab
         * @param that 操作的的DOM
         * @param n 是否直接删除该tab，不切换前后tab
         * @returns {boolean}
         */
        delCurTab: function (that, n) {
            var closeTabId = $(that).parents('.J_menuTab').data('id');
            if (n) {
                // 移除tab对应的内容区
                $(that).parents('body').find('.J_mainContent .J_iframe').each(function () {
                    if ($(this).data('id') == closeTabId) {
                        $(this).remove();
                        return false;
                    }
                });
                //  移除当前选项卡
                $(that).parents('.J_menuTab').remove();
                return false;
            }
            //当所有tab没有激活，处于首页状态
            if ($('.iframe-wrap').hasClass('layui-hide')) {
                //  移除当前选项卡
                $(that).parents('.J_menuTab').remove();
                // 移除tab对应的内容区
                $('.J_mainContent .J_iframe').each(function () {
                    if ($(this).data('id') == closeTabId) {
                        $(this).remove();
                        return false;
                    }
                });
                return false;
            }
            // 当前元素处于活动状态
            if ($(that).parents('.J_menuTab').hasClass('active')) {
                //当页面tab只有一个的时候，点击移除该tab，展示首页内容，隐藏iframe-wrap
                if ($(that).parents('.page-tabs-content').find('.J_menuTab').length == 1) {
                    //  移除当前选项卡
                    $(that).parents('.J_menuTab').remove();
                    // 移除tab对应的内容区
                    $('.J_mainContent .J_iframe').each(function () {
                        if ($(this).data('id') == closeTabId) {
                            $(this).remove();
                            return false;
                        }
                    });
                    common.isTabShow(true);
                }
                // 当前元素后面有同辈元素，使后面的一个元素处于活动状态
                if ($(that).parents('.J_menuTab').next('.J_menuTab').size()) {
                    var activeId = $(that).parents('.J_menuTab').next('.J_menuTab:eq(0)').data('id');
                    $(that).parents('.J_menuTab').next('.J_menuTab:eq(0)').addClass('active');
                    $('.J_mainContent .J_iframe').each(function () {
                        if ($(this).data('id') == activeId) {
                            $(this).show().siblings('.J_iframe').hide();
                            return false;
                        }
                    });
                    //  移除当前选项卡
                    $(that).parents('.J_menuTab').remove();
                    // 移除tab对应的内容区
                    $('.J_mainContent .J_iframe').each(function () {
                        if ($(this).data('id') == closeTabId) {
                            $(this).remove();
                            return false;
                        }
                    });
                }
                // 当前元素后面没有同辈元素，使当前元素的上一个元素处于活动状态
                if ($(that).parents('.J_menuTab').prev('.J_menuTab').size()) {
                    var activeId = $(that).parents('.J_menuTab').prev('.J_menuTab:last').data('id');
                    $(that).parents('.J_menuTab').prev('.J_menuTab:last').addClass('active');
                    $('.J_mainContent .J_iframe').each(function () {
                        if ($(this).data('id') == activeId) {
                            $(this).show().siblings('.J_iframe').hide();
                            return false;
                        }
                    });
                    //  移除当前选项卡
                    $(that).parents('.J_menuTab').remove();
                    // 移除tab对应的内容区
                    $('.J_mainContent .J_iframe').each(function () {
                        if ($(this).data('id') == closeTabId) {
                            $(this).remove();
                            return false;
                        }
                    });
                }
            }
            // 当前元素不处于活动状态
            else {
                //  移除当前选项卡
                $(that).parents('.J_menuTab').remove();
                // 移除相应tab对应的内容区
                $('.J_mainContent .J_iframe').each(function () {
                    if ($(this).data('id') == closeTabId) {
                        $(this).remove();
                        return false;
                    }
                });
            }
            return false;
        },
        /**
         * 点击切换选项卡
         */
        activeTab: function (that, e) {
            //点击的是删除按钮时，不执行
            if (e.target.className == 'iconfont icon-cha') {
                return false;
            }
            if (!$(that).hasClass('active')) {
                var currentId = $(that).data('id');
                // 显示tab对应的内容区
                $('.J_mainContent .J_iframe').each(function () {
                    if ($(this).data('id') == currentId) {
                        $(this).show().siblings('.J_iframe').hide();
                        return false;
                    }
                });
                //当前处于首页状态
                if ($('.iframe-wrap').hasClass('layui-hide')) {
                    common.isTabShow(false);
                }
                $(that).addClass('active').siblings('.J_menuTab').removeClass('active');
            }
        },
        /**
         * 关闭所有tab
         */
        closeAllTab: function () {
            $('.page-tabs-content').children("[data-id]").each(function () {
                $('.J_iframe[data-id="' + $(this).data('id') + '"]').remove();
                if ($(this).data('id') == '/') return;
                $(this).remove();
            });
            common.isTabShow(true);
        },
        /**
         * [getUserInfo description] 全局获取用户登录信息
         * @return {[type]} [description]
         */
        getUserInfo: function () {
            var userinfo = tools.getCookie('admin');
            if (userinfo) {
                if (typeof userinfo == 'string') {
                    return $.parseJSON(userinfo);
                } else {
                    return userinfo;
                }
            }
            return null;
        },
        /**
         * [logout description] 退出登录
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        logout: function (callback) {
            tools.ajax({
                url: ajaxurl.login.logout,
                data: {},
                type: 'post',
                success: function (result) {
                    if (result.code == 1) {
                        layers.toast(result.message, {icon: 1});
                        tools.clearStorage(); //清空全部sessionStorage值
                        setTimeout(function () {
                            window.location.href = '/admin/index/login';
                        }, 1800);
                    } else {
                        layers.toast(result.message);
                    }
                }
            });
            typeof callback === 'function' && callback.call(this);
        },
        /**
         * [sideBarPhone description] 初始化拨打电话tab项
         * @param  {[type]} layid  [description] 1-4
         * @param  {[type]} isshow [description] true false
         * @return {[type]}        [description]
         */
        sideBarPhone: function (layid, isshow) {
            // 初始化侧栏菜单拨号助手 tab 切换
            layui.use('element', function () {
                var element = layui.element; //Tab的切换功能，切换事件监听等，需要依赖element模块
                //切换到对应的选项中
                if (layid != undefined || layid != null) {
                    element.tabChange('tellWindow', layid);
                }
            });
            //判断侧边栏是否显示
            if (isshow != undefined && isshow != null) {
                vm.sideBarPhoneShow = isshow;
            }
        },
        /**
         * [getCallRecord description] 获取当个用户的通话记录列表 用于浮层
         * @return {[type]} [description]
         */
        getCallRecord: function () {
            var that = this;
            tools.ajax({
                url: ajaxurl.ivr.getCallRecord,
                type: 'post',
                data: {},
                success: function (result) {
                    if (result.code == 1) {
                        if (result.data != null) {
                            if (result.data.notHasName != undefined) {
                                for (var i = 0, lens = result.data.notHasName.length; i < lens; i++) {
                                    if (result.data.notHasName[i].image == undefined) {
                                        var headImg = 0;
                                        if (result.data.notHasName[i].head_type != null) {
                                            headImg = result.data.notHasName[i].head_type;
                                        }
                                        result.data.notHasName[i].image = that.callUserImg.replace('{index}', headImg)
                                    }
                                }
                                vm.callDatanot = result.data.notHasName; //未知电话列表
                            }
                            if (result.data.hasName != undefined) {
                                for (var j = 0, len = result.data.hasName.length; j < len; j++) {
                                    if (result.data.hasName[j].image == undefined) {
                                        result.data.hasName[j].image = that.callUserImg.replace('{index}', result.data.hasName[j].head_type)
                                    }
                                    //处理一个用户下有多个电话号码的规则
                                    if (result.data.hasName[j].phones.length) {
                                        result.data.hasName[j].phones.unshift({
                                            contact_id: result.data.hasName[j].customer_contact_id,
                                            customer_id: result.data.hasName[j].customer_id, //toPhone
                                            contact_way: result.data.hasName[j].toPhone
                                        })
                                    }
                                }
                                vm.callDatahas = result.data.hasName; //有名字的电话列表
                            }
                        }
                    } else {
                        layers.toast(result.message);
                    }
                }
            })
        },
        /**
         * [removeCallRecord description] 移除电话通话列表中的某一项
         * @param  {[type]} type   [description]  has == 最近联系  否则未知客户
         * @param  {[type]} index  [description]  索引
         * @param  {[type]} id     [description]  对应id
         * @param  {[type]} isload [description]  是否刷新当前页面 true false
         * @param  {[type]} callback [description]  回调
         * @return {[type]}        [description]
         */
        removeCallRecord: function (type, index, id, isload, callback) {
            if (index == undefined && id == undefined) {
                throw new Error('缺少参数！');
            }
            //弹出确认框
            layers.confirm({
                content: '<div class="confirm-tips"><p>您确定要删除此条记录？</p></div>',
                btn2: function (lindex, layero) {
                    //删除通话记录
                    tools.ajax({
                        url: ajaxurl.ivr.deleteRecord,
                        data: {record_id: id},
                        type: 'post',
                        success: function (result) {
                            if (result.code == 1) {
                                //是否需要刷新页面
                                if (isload != undefined) {
                                    if (isload) {
                                        window.location.reload();
                                        return;
                                    }
                                }
                                //暴露回调方法
                                if (typeof callback === 'function') {
                                    callback.call(this)
                                } else {
                                    if (type === 'has') {//最近联系人  有名字的
                                        vm.callDatahas.splice(index, 1);
                                    } else {
                                        vm.callDatanot.splice(index, 1);
                                    }
                                }
                                layers.closed(lindex);
                            } else {
                                layers.toast(result.message);
                            }
                        }
                    })
                    return false;
                }
            })
        },
        /**
         * [jplayer description] 音频播放全局
         * @param  {[type]} url   [description] 音频url地址   是否必须：yes
         * @param  {[type]} title [description] 标题  是否必须：yes
         * @param  {[type]} time  [description] 创建时间 是否必须：yes
         * @param  {[type]} show  [description] 是否显示层 true  是否必须：no
         * @param  {[type]} unknown  [description] 是否是未知用户 true false 是否必须：no
         * @return {[type]}       [description]
         */
        jplayer: function (url, title, time, show, unknown) {
            if (!url) {
                layers.toast('暂无录音！');
                return;
            }
            url = url + '?t=' + new Date().getTime();
            vm.jplayer.url = url;
            vm.jplayer.title = title || '录音文件';
            vm.jplayer.time = time;
            if (show != undefined) {
                vm.jplayerShow = show;
            } else {
                vm.jplayerShow = true;
            }
            if (unknown != undefined) {
                vm.jplayer.unknown = unknown;
            }
            player.init(url);
        },
        /**
         * [callTellFn description] 调取打电话
         * @param  {[type]} contact   [description] 必须 手机联系方式的ID or 客户手机号  其他地方调用的时候都传id  右侧自定义拨号和未知联系人传 号码
         * @param  {[type]} show      [description] 非必须 是否展示右侧电话框
         * @param  {[type]} call_type [description] 非必须 默认是 已知用户 拨打类型：know为已知客户，other为自定义拨号
         * @return {[type]}           [description]
         */
        callTellFn: function (contact, show, call_type) {
            if (!/^\d{0,30}$/.test(contact)) {
                layers.toast('电话号码不存在！');
                return;
            }
            call_type = call_type || 'know';
            if (common.flag) {
                //调用拨打电话接口
                tools.ajax({
                    url: ajaxurl.ivr.call,
                    data: {contact_id: contact, call_type: call_type},
                    type: 'post',
                    beforeSend: function () {
                        common.flag = false;
                    },
                    success: function (result) {
                        if (result.code == 1) {
                            var tell = result.data.contact_way;
                            var a = tell.substring(0, 3);
                            var b = tell.substring(3, 7);
                            var c = tell.substring(7, 11);
                            vm.callInfo = {
                                image: common.callUserImg.replace('{index}', result.data.head_type),
                                phone_num: a + ' ' + b + ' ' + c,
                                real_name: result.data.real_name || '未知用户'
                            };
                            vm.connect = true;
                            //控制侧边栏是否展开
                            if (show) {
                                vm.sideBarPhoneShow = true; //展开侧边栏
                            }
                            common.sideBarPhone(2);
                        } else {
                            layers.toast(result.message);
                        }
                    },
                    complete: function () {
                        // 最小间隔1秒拨打
                        setTimeout(function () {
                            common.flag = true;
                        }, 1000);
                    }
                })
            }
        },
        flag: true,// 延迟拨打电话
        /**
         * [admin description] 获取用户信息
         * @return {[type]} [description]
         */
        globaladmin: function () {
            var userinfo = common.getUserInfo();
            if (userinfo) {
                vm.userinfo = userinfo;
            }
        },
        /**
         * [globalData description]全局消息数据
         * @return {[type]} [description]
         */
        globalData: function (page, ispage) {
            page = page || 1;
            tools.ajax({
                url: window.APIURL + '?c=sms&a=getall_one',
                type: 'get',
                dataType:'jsonp',
                data: {
                    employee_id: vm.userinfo.id,
                    page: page,
                },
                success: function (result) {
                    if (result.code == 1) {
                        // 渲染到vue数据层
                        //vm.globalCount = result.data[0].count;
                        if (result.data.list == undefined) {
                            vm.globalCount = result.data[0].count;
                            vm.globalNews = result.data;
                            if (result.data[0].count > 99) {
                                vm.globalNewsCount = '99+';
                            } else {
                                vm.globalNewsCount = result.data[0].count;
                            }
                            if (!ispage) {
                                vm.closeGlobalMsgShow = true;
                            }
                            if (page == 1) {
                                common.setglobalPag();
                            }
                        } else {
                            vm.globalNewsCount = '0';
                            vm.closeGlobalMsgShow = false;
                        }
                    } else {
                        layers.toast(result.message);
                    }
                }
            });
        },
        setglobalPag: function (callback) {
            layui.use(['laypage'], function () {
                var laypage = layui.laypage;
                laypage.render({
                    elem: 'GlobalMsgPage',
                    count: vm.globalCount,
                    limit: 1,
                    skip: false, //是否显示跳转
                    layout: ['prev', 'next'],
                    jump: function (obj, first) {
                        if (!first) {
                            common.globalData(obj.curr, true);// 发送请求
                        }
                    }
                });
            });
        },
        /**
         * [newsNum description]消息条数
         * @return {[type]} [description]
         */
        getallNum: function (callback) {
            tools.ajax({
                url: window.APIURL + '?c=sms&a=getnoread',
                type: 'get',
                dataType:'jsonp',
                data: {
                    employee_id: vm.userinfo.id,
                },
                success: function (result) {
                    if (result.code == 1) {
                        // 渲染到vue数据层
                        vm.globalNewsNum = result.data.all;
                        //配置右侧悬浮栏
                        if (document.getElementById('header')) {
                            var all = '';
                            if (result.data.all > 99) {
                                vm.globalNum = '99+';
                                all = '99+';
                            } else {
                                vm.globalNum = result.data.all;
                                all = result.data.all;
                            }
                            //渲染到顶部tab
                            if (all > 0) {
                                $('.icon-email').html($('<span class="layui-badge">' + all + '</span>'));
                            } else {
                                $('.icon-email').html("");
                            }
                        }
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(result.message);
                    }
                }
            });
        },
        /**
         * 消息轮询
         */
        newPolling: function () {
            var num = 5000;
            window.SMSAJAX ? num = (window.SMSAJAX - 0) * 1000 : num = 5000;
            common.getallNum();
            common.globalData();
            setTimeout(function () {
                common.newPolling();
            }, num);
        },
        /**
         * 延迟获取电话助手列表数据 [仅一次]
         */
        getCallRecordDelay: function () {
            $('.nav-tel').one('click', function () {
                common.getCallRecord();
            });
        }
    };

    /**
     * 实例化 ViewModel 公共头部
     */
    if (document.getElementById('header')) {
        var vm = new Vue({
            el: '#header',
            data: {
                tabs: common.loadTabLink(),// 面包屑导航
                closeBarShow: false,// 关闭操作
                sideBarPhoneShow: false, // 侧栏电话助手
                closeGlobalMsgShow: false, // 关闭消息提醒
                tellkey: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'], //自定义拨号的键盘
                tellVal: '', //按键拨号
                clearTell: false,
                callDatanot: [], //未知电话列表
                callDatahas: [], //有名字的电话列表
                jplayer: { //设置jplayer 属性
                    url: '',
                    title: '录音文件',
                    time: '',
                    unknown: false,
                    phone: ''
                },
                jplayerShow: false, //是否展示UI层
                callInfo: { //拨打电话的信息
                    image: '', //头像展示
                    phone_num: '', //电话号码
                    real_name: '' //用户姓名
                },
                connect: false, //是否存在通话  
                globalNews: '',//全局消息
                globalNum: '',//侧边消息总条数
                globalNewsCount: '',//全局消息展示总条数
                globalCount: '',//全局消息实际总条数
                globalpage: '',//全局消息当前页数
                moreTellsShow: false, //是否显示弹出层
                moreTells: [], //单个用户下有多个电话
                userinfo: '',
                globalNewsNum: '', //全局消息数量
            },
            methods: {
                // 打开关闭面包屑导航 关闭操作下拉框
                openCloseBar: function () {
                    this.closeBarShow = !this.closeBarShow;
                },
                // 开启侧栏电话助手
                openSideBarPhone: function () {
                    this.sideBarPhoneShow = !this.sideBarPhoneShow;
                },
                //电话拨号
                dialfn: function (val) {
                    if (val == undefined || val == null || val == '*' || val == '#') {
                        return;
                    }
                    val = val.toString(); //转化成字符串
                    if (this.tellVal.length >= 13) {
                        return;
                    }
                    this.tellVal += val;
                },
                //拨打电话
                callTell: function () {
                    common.callTellFn(this.tellVal, '', 'other');
                },
                //最近联系 未知客户列表拨打电话 index存在的时候表示最近联系人列表里面的通话  需要去验证是否有多个号码  未知客户不存在多个号码
                listCallTell: function (phoneid, index, ismore) {
                    if (index != undefined) { //已知用户
                        if (ismore) { //是否是弹窗列表中拨打的
                            common.callTellFn(phoneid);
                            return;
                        }
                        if (this.callDatahas[index].phones.length) { //存在弹出列表
                            this.moreTells = this.callDatahas[index].phones;
                            this.moreTellsShow = true;
                            return;
                        }
                        common.callTellFn(phoneid);
                    } else {//未知用户
                        common.callTellFn(phoneid, '', 'other');
                    }
                },
                //播放电话录音
                player: function (url, name, time, unknown, phone) {
                    if (!url) {
                        layers.toast('暂无录音');
                        return;
                    }
                    if (phone) {
                        this.jplayer.phone = phone;
                    }
                    common.jplayer(url, name, time, true, unknown);
                },
                //移除电话历史记录
                removeCallRecord: function (type, index, id) {
                    common.removeCallRecord(type, index, id);
                },
                // 切换标签卡
                switchTabs: function (e) {
                    var url = $(e.target).attr('href');
                    common.setActive(url);
                },
                // 删除标签卡
                closeCurTab: function (index) {
                    this.tabs = common.delCurTab(index);
                    if (this.tabs.length === 0) {
                        window.location.href = '/admin/index/index'
                    }
                },
                // 左移标签卡
                moveLeft: function () {
                    var url = common.moveLeftTab();
                    url && (window.location.href = window.location.origin + url);
                },
                // 右移标签卡
                moveRight: function () {
                    var url = common.moveRightTab();
                    url && (window.location.href = window.location.origin + url);
                },
                // 关闭所有标签卡
                delAllTab: function () {
                    common.delAllTab();
                    this.tabs = common.loadTabLink();
                },
                // 关闭其它标签卡
                closeOtherTab: function () {
                    common.delOtherTab();
                    this.tabs = common.loadTabLink();
                },
                //头部退出登录
                logout: function () {
                    common.logout();
                },
            },
            watch: {
                tellVal: { //监听电话按键的选择
                    handler: function (val, oldVal) {
                        if (val != '') {
                            this.clearTell = true;
                        } else {
                            this.clearTell = false;
                        }
                    },
                    deep: true
                },
                jplayerShow: { //监听音频播放层的现实与隐藏
                    handler: function (val, oldVal) {
                        if (val == false) { //当播放层隐藏的时候  停止音频的播放
                            player.stop();
                        }
                    },
                    deep: true
                }
            }
        });
    }

    // 由于iframe里面不能直接访问最外层上的vm。故把所需方法挂载在最外层的window上面，需要的子页面 直接调用 window.top.+该方法名字
    window.callTellFn = common.callTellFn;
    window.jplayer = common.jplayer;

    /**
     * 初始化全局方法
     * @private
     */
    var _init = function () {
        if (document.getElementById('header')) {
            common.sideBarPhone();
            common.globaladmin();
            common.newPolling();//消息轮询
            common.getCallRecordDelay();
        }
    };
    //_init();注释掉以前的全局调用，改为index.js调用

    // 返回需要单独调用的方法
    return common;
});
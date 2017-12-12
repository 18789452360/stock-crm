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
         * [closeTab description] 关闭当前页面 返回到上一页
         * @param  {[type]} isprve [description] 是否切换到最近的一个tab
         * @return {[type]}        [description]
         */
        closeTab: function (isprve) {
            var tabIndexs = tools.getStorage('tabIndex'),
                jumpUrl = '', //跳转的URL
                curUrl = window.location.href.replace(ajaxurl.BaseUrl, ''); //获取当前页面的路径
            if (tabIndexs) {
                var lens = tabIndexs.length;
                for (var i = 0; i < lens; i++) {
                    if (tabIndexs[i].active && i != 0) {
                        if (curUrl === tabIndexs[i].url) {
                            if (isprve) {
                                tabIndexs.splice(i, 1);
                                tabIndexs[i - 1].active = true;
                                jumpUrl = tabIndexs[i - 1].url;
                            } else {
                                tabIndexs.splice(i, 1);
                                window.history.go(-1);
                            }
                            break;
                        }
                    } else if (tabIndexs[i].active && i == 0) {
                        window.location.href = '/admin/index/index';
                        return;
                    }
                }
                tools.setStorage('tabIndex', tabIndexs);
                if (isprve) {
                    window.location.href = jumpUrl;
                }
            }
        },
        /**
         * [jumpCloseTab description] 跳转到指定的页面 替换当前页面
         * @param  {[type]} url   [description]  必须 '/admin/index/index'
         * @param  {[type]} title [description]  必须
         * @return {[type]}       [description]
         */
        jumpCloseTab: function (url, title) {
            if (!url) {
                throw new Error('缺少url参数！');
            }
            title = title || '提示';
            var tabIndex = tools.getStorage('tabIndex'),
                curUrl = window.location.href.replace(ajaxurl.BaseUrl, ''); //获取当前页面的路径
            if (url === curUrl) {//如果跳转的Ulr和path相等 刷新当前页面
                window.location.reload();
                return;
            }
            if (tabIndex) {
                var lens = tabIndex.length;
                for (var i = 0; i < lens; i++) {
                    if (tabIndex[i].active && tabIndex[i].url != url) {
                        tabIndex[i].url = url;
                        tabIndex[i].name = title;
                    } else if (tabIndex[i].url == url && !tabIndex[i].active) {
                        tabIndex[i].url = url;
                        tabIndex[i].active = true;
                    } else {
                        tabIndex[i].active = false;
                    }
                }
                tools.setStorage('tabIndex', tabIndex);
            } else {
                var temp = [{name: title, url: url, active: true}];
                tools.setStorage('tabIndex', temp);
            }
            window.location.href = url;
        },
        /**
         * 新增 Tab 标签页
         * 劫持带有 data-type="tab" 的 a 标签写入 SessionStorage
         */
        getTabLink: function () {
            var _this = this;
            $(document).on('click', 'a[data-type="tab"]', function (event) {
                // 获取标识数据
                var dataUrl = $(this).prop('href').replace(ajaxurl.BaseUrl, ''), //将href中的  http://www.xxxx.cn 去掉
                    menuName = $.trim($(this).data('title')) ? $.trim($(this).data('title')) : $.trim($(this).prop('title'));//获取a标签的title作为tab的标题
                if (dataUrl === undefined || $.trim(dataUrl).length === 0) return false;
                var tabItem = {
                    name: menuName || '提示',
                    url: dataUrl,
                    active: true
                };
                var tabIndexsArr = [];
                tabIndexsArr.push(tabItem);
                if (tools.hasStorage('tabIndex')) {
                    var tmpArr = tools.getStorage('tabIndex');
                    // tabIndex 中无当前 url 时则追加新项
                    if (_this.findElem(tmpArr, 'url', tabItem.url) === -1) {
                        // 新增前将所有 active 置为 false
                        for (var i = 0, len = tmpArr.length; i < len; i++) {
                            tmpArr[i].active = false;
                        }
                        tmpArr.push(tabItem);
                        tools.setStorage('tabIndex', tmpArr);
                    }
                } else {
                    // 无 tabIndex 时则新建项
                    tools.setStorage('tabIndex', tabIndexsArr);
                }
                //增加临时缓存 url name 地址  主要是针对浏览器的前进后退出处理
                if (tools.hasStorage('tempTabIndex')) { //如果存在
                    var tmpTabArr = tools.getStorage('tempTabIndex');
                    if (_this.findElem(tmpTabArr, 'url', tabItem.url) === -1) { //如果当前url不在缓存中
                        for (var i = 0, len = tmpTabArr.length; i < len; i++) {
                            tmpTabArr[i].active = false;
                        }
                        tmpTabArr.push(tabItem);
                        tools.setStorage('tempTabIndex', tmpTabArr); //缓存tab 不清除
                    }
                } else {
                    tools.setStorage('tempTabIndex', tabIndexsArr); //缓存tab 不清除
                }
            });
        },
        /**
         * JS 写入面包屑导航
         * @param item 传入格式 {name: '名字', url: '需要跳转的链接'}
         */
        getTabLinkWithJS: function (item) {
            var _this = this;
            if (!$.isEmptyObject(item)) {
                var tabItem = {
                    name: item.name,
                    url: item.url,
                    active: true
                };
                var tabIndexsArr = [];
                tabIndexsArr.push(tabItem);
                if (tools.hasStorage('tabIndex')) {
                    var tmpArr = tools.getStorage('tabIndex');
                    // tabIndex 中无当前 url 时则追加新项
                    if (_this.findElem(tmpArr, 'url', tabItem.url) === -1) {
                        // 新增前将所有 active 置为 false
                        for (var i = 0, len = tmpArr.length; i < len; i++) {
                            tmpArr[i].active = false;
                        }
                        tmpArr.push(tabItem);
                        tools.setStorage('tabIndex', tmpArr);
                    }
                } else {
                    // 无 tabIndex 时则新建项
                    tools.setStorage('tabIndex', tabIndexsArr);
                }
                //增加临时缓存 url name 地址  主要是针对浏览器的前进后退出处理
                if (tools.hasStorage('tempTabIndex')) { //如果存在
                    var tmpTabArr = tools.getStorage('tempTabIndex');
                    if (_this.findElem(tmpTabArr, 'url', tabItem.url) === -1) { //如果当前url不在缓存中
                        for (var i = 0, len = tmpTabArr.length; i < len; i++) {
                            tmpTabArr[i].active = false;
                        }
                        tmpTabArr.push(tabItem);
                        tools.setStorage('tempTabIndex', tmpTabArr); //缓存tab 不清除
                    }
                } else {
                    tools.setStorage('tempTabIndex', tabIndexsArr); //缓存tab 不清除
                }
                setTimeout(function () {
                    window.location.href = tabItem.url;
                }, 0);
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
         * Tab 标签页切换 active
         * 设置 SessionStorage 中的当前项为 active 项
         * @param url 待设置的项
         */
        setActive: function (url) {
            if (tools.hasStorage('tabIndex')) {
                var tmpArr = tools.getStorage('tabIndex');
                // 查找当前项在的位置
                var actIndex = this.findElem(tmpArr, 'url', url);
                if (actIndex >= 0) {
                    // 新增前将所有 active 置为 false
                    for (var i = 0, len = tmpArr.length; i < len; i++) {
                        tmpArr[i].active = false;
                    }
                    // 当前项设置为 true
                    tmpArr[actIndex].active = true;
                    tools.setStorage('tabIndex', tmpArr);
                } else {
                    throw new Error('tabIndex 中未找到该 URL: ' + url);
                }
            }
        },
        /**
         * 删除指定 Tab 标签页
         * @param willDelIndex  待删除项的索引
         */
        delCurTab: function (willDelIndex) {
            if (tools.hasStorage('tabIndex')) {
                var objArr = tools.getStorage('tabIndex');
                var tmpArr = [];
                var curIsActive = objArr[willDelIndex].active;
                // 如果待删除的项已经是 active 状态, 并且不是第一项
                // 那么将它的前一项设置为 active 状态
                if (willDelIndex !== 0 && curIsActive) {
                    objArr[willDelIndex - 1].active = true;
                    window.location.href = objArr[willDelIndex - 1].url;
                } else if (willDelIndex === 0 && curIsActive) { //删除第一项 而是选中状态
                    if (objArr.length > 1) {
                        objArr[willDelIndex + 1].active = true;
                        window.location.href = objArr[willDelIndex + 1].url;
                    }
                }
                for (var i = 0, len = objArr.length; i < len; i++) {
                    if (i !== willDelIndex) {
                        tmpArr.push(objArr[i]);
                    }
                }
                tools.setStorage('tabIndex', tmpArr);
                return tmpArr;
            }
        },
        /**
         * 删除所有 Tab 标签页
         * 清空 tabIndex
         */
        delAllTab: function () {
            if (tools.hasStorage('tabIndex')) {
                var tmpArr = [];
                tools.setStorage('tabIndex', tmpArr);
            }
        },
        /**
         * 删除其它 Tab 标签页
         * 当前 active 除外
         */
        delOtherTab: function () {
            if (tools.hasStorage('tabIndex')) {
                var objArr = tools.getStorage('tabIndex');
                var tmpArr = [];
                for (var i = 0, len = objArr.length; i < len; i++) {
                    // 如果当前项是 active 那么放入 tabIndex 并结束循环
                    if (objArr[i].active) {
                        tmpArr.push(objArr[i]);
                        tools.setStorage('tabIndex', tmpArr);
                        break;
                    }
                }
            }
        },
        /**
         * 左移一个 Tab
         * @return {string} url 返回前一项的链接, 用于跳转
         */
        moveLeftTab: function () {
            if (tools.hasStorage('tabIndex')) {
                var tmpArr = tools.getStorage('tabIndex');
                var curActIndex = this.findElem(tmpArr, 'active', true);
                // 若果已经是第一项了,那么什么也不做
                if (curActIndex > 0) {
                    for (var i = 0, len = tmpArr.length; i < len; i++) {
                        tmpArr[i].active = false;
                    }
                    tmpArr[curActIndex - 1].active = true;
                    tools.setStorage('tabIndex', tmpArr);
                    return tmpArr[curActIndex - 1].url;
                }
            }
        },
        /**
         * 右移一个 Tab
         * @return {string} url 返回后一项的链接, 用于跳转
         */
        moveRightTab: function () {
            if (tools.hasStorage('tabIndex')) {
                var tmpArr = tools.getStorage('tabIndex');
                var curActIndex = this.findElem(tmpArr, 'active', true);
                // 可移动范围: [0, arr.Length -1)
                if (curActIndex >= 0 && curActIndex < tmpArr.length - 1) {
                    for (var i = 0, len = tmpArr.length; i < len; i++) {
                        tmpArr[i].active = false;
                    }
                    tmpArr[curActIndex + 1].active = true;
                    tools.setStorage('tabIndex', tmpArr);
                    return tmpArr[curActIndex + 1].url;
                }
            }
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
            var that = this;
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
            var that = this;
            if (this.flag) {
                //调用拨打电话接口
                tools.ajax({
                    url: ajaxurl.ivr.call,
                    data: {contact_id: contact, call_type: call_type},
                    type: 'post',
                    beforeSend: function () {
                        that.flag = false;
                    },
                    success: function (result) {
                        // 最小间隔1秒拨打
                        setTimeout(function () {
                            that.flag = true;
                        }, 1000);
                        if (result.code == 1) {
                            var tell = result.data.contact_way;
                            var a = tell.substring(0, 3);
                            var b = tell.substring(3, 7);
                            var c = tell.substring(7, 11);
                            vm.callInfo = {
                                image: that.callUserImg.replace('{index}', result.data.head_type),
                                phone_num: a + ' ' + b + ' ' + c,
                                real_name: result.data.real_name || '未知用户'
                            }
                            vm.connect = true;
                            //控制侧边栏是否展开
                            if (show) {
                                vm.sideBarPhoneShow = true; //展开侧边栏
                            }
                            that.sideBarPhone(2);
                        } else {
                            layers.toast(result.message);
                        }
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
                url: ajaxurl.sms.all,
                type: 'get',
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
                                vm.closeGlobalMsgShow = !vm.closeGlobalMsgShow
                            }
                            if (page == 1) {
                                common.setglobalPag();
                            }
                        } else {
                            vm.globalNewsCount = '0';
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
                            common.globalData(obj.curr, true);           // 发送请求
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
            setInterval(function () {
                tools.ajax({
                    url: ajaxurl.sms.allview,
                    type: 'get',
                    data: {
                        employee_id: vm.userinfo.id,
                    },
                    success: function (result) {
                        if (result.code == 1) {
                            // 渲染到vue数据层
                            vm.globalNewsNum = result.data.all;
                            //配置右侧悬浮栏
                            if (document.getElementById('header')) {
                                if (result.data.all > 99) {
                                    vm.globalNum = '99+';
                                } else {
                                    vm.globalNum = result.data.all;
                                }
                            }
                            typeof callback === 'function' && callback.call(this);
                        } else {
                            layers.toast(result.message);
                        }
                    }
                })
            }, 5000)
        },
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

    /**
     * 初始化全局方法
     * @private
     */
    var _init = function () {
        if (document.getElementById('header')) {
            common.sideBarPhone();
            common.globaladmin();
            common.globalData();
            common.getCallRecord();
            common.getallNum();
        }

    };
    _init();

    // 返回需要单独调用的方法
    return common;
});
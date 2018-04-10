/**
 * 配置全局工具类
 */
define(['store', 'jquery.cookie'], function (store) {
    return {
        /**
         * [setCookie description] 设置cookie
         * @param {[type]} name  [description]
         * @param {[type]} value [description]
         * @param {[type]} day   [description]
         * @param {[type]} path  [description]
         */
        setCookie: function (name, value, day, path) {
            if (!name && !value) {
                throw new Error('设置cookie 参数不存在！');
            }
            day = day || 7;
            $.cookie(name, value, {
                expires: day
            });
        },
        /**
         * [getCookie description] 获取cookie
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        getCookie: function (name) {
            if (!name) {
                throw new Error('获取cookie name不存在！');
            }
            var values = $.cookie(name);
            if (values != undefined) {
                return values;
            } else {
                return false;
            }
        },
        /**
         * [removeCookie description] 删除cookie
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        removeCookie: function (name) {
            if (!name) {
                throw new Error('删除cookie name不存在！');
            }
            $.removeCookie(name);
        },
        /**
         * [getStorage description] 获取某个对应的sessionStorage值
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        getStorage: function(name){
            if(this.hasStorage(name)){
                return store.get(name);
            }else{
                return null;
            }
        },
        /**
         * [getAllStorage description] 获取所有的sessionStorage值
         * @return {[type]} [description]
         */
        getAllStorage: function(){
            return store.getAll();
        },
        /**
         * [setStorage description] 设置单个sessionStorage值
         * @param {[type]} name  [description]
         * @param {[type]} value [description]
         */
        setStorage: function(name, value){
            if(!name){
                throw new Error('setStorage缺少参数！')
            }
            store.set(name, value);
        },
        /**
         * [setAllStorage description] 批量设置sessionStorage值
         * @param {[type]} datas [description]  Arrar or Object
         * ['1', '2', '3'] or {key1: value1, key2: value2}
         */
        setAllStorage: function(datas){
            if(datas instanceof Array || !$.isEmptyObject(datas)){
                store.setAll(datas)
            }else{
                throw new Error('setAllStorage参数不合法！');
            }
        },
        /**
         * [removeStorage description] 删除单个sessionStorage值
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        removeStorage: function(name){
            if(this.hasStorage(name)){
                store.remove(name); 
            }
        },
        /**
         * [clearStorage description] 清空全部sessionStorage值
         * @return {[type]} [description]
         */
        clearStorage: function(){
            store.clear() //
        },
        /**
         * [hasStorage description] 检测是否存在某个sessionStorage
         * @param  {[type]}  name [description]
         * @return {Boolean}      [description]
         */
        hasStorage: function(name){
            if(!name){
                throw new Error('hasStorage缺少参数！')
            }
            return store.has(name);
        },
        /**
         * [checkLogin description] 检测用户是否登录
         * @return {[type]} [description]
         */
        checkLogin: function () {
            return this.getCookie('member_info');
        },
        /**
         * 获取当前操作用户的员工id
         * @returns {string}
         */
        getUserID:function(){
            var employee_id = '',
                userinfo = this.getCookie('admin');
            if(userinfo){//获取员工id
                if (typeof userinfo == 'string') {
                    userinfo =  $.parseJSON(userinfo);
                }
                employee_id = userinfo.id;
            }
            return employee_id;
        },
        crmcrmid : $('input[name="visithidden"]').val(),
        random : $('input[name="crmrandom"]').val(),
        employee_id : '',
        /**
         * [ajax description]  ajax异步请求
         * @param  {[type]} args               [ {url: '' , type : '' dataType : ''data : {} } 集合]
         */
        ajax: function (args) {
            var that = this;
            if (!args.url || args.url == undefined) {
                throw new Error('ajax参数错误！');
            }
            if(!that.employee_id || that.employee_id ==''){
                that.employee_id = that.getUserID();
            }
            var obj = {
                crmcrmid : that.crmcrmid,
                crmcrmrandom : that.random,
                employee_id : that.employee_id
            };
            if(!args.data){
                args.data = {};
            }
            $.extend(args.data, obj, args.data);
            var _THIS_ = new Object();
            $.extend(_THIS_, {
                url: null,
                type: 'get',
                dataType: 'json',
                data: null,
                timeout : 15000,
                beforeSend: function () {},
                complete: function () {},
                success: function (result) {},
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    throw new Error(args.url + '系统错误！错误为：' + XMLHttpRequest);
                }
            }, args);
            //_THIS_.data.route_mark = 'web';
            $.ajax(_THIS_);
        },
        /**
         * [formatNumber description] 格式化大位数字  超过万 显示  xx万  xx亿
         * @param  {[type]} value [description]  值
         * @param  {[type]} n     [description]  保留几位小数  默认2
         * @param  {[type]} f     [description]  是否需要格式  默认true
         * @return {[type]}       [description]
         */
        formatNumber: function (value, n, f) {
            var curNum = Number(value);
            var unit = '';
            var symbol = '';
            var renum = '';
            n = n || 2;
            f = f || '1';
            if (curNum != null || curNum != undefined) {
                if (curNum >= 0) {
                    symbol = '';
                } else {
                    symbol = '-';
                    curNum = Math.abs(curNum);
                }
                if (curNum) {
                    if (f != '0') {
                        if (curNum >= 100000000) {
                            curNum = curNum / 100000000;
                            unit = '亿';
                            renum = curNum.toFixed(n)
                        } else if (curNum >= 10000) {
                            curNum = curNum / 10000;
                            unit = '万';
                            renum = curNum.toFixed(n)
                        } else if (curNum < 10000) {
                            renum = curNum.toFixed(n);
                            // renum = curNum;
                        }
                    }
                } else {
                    renum = '0';
                }
            }
            return symbol + renum + unit;
        },
        /**
         * [UrlEncode description] url编码处理
         * @param {[type]} url [description]
         */
        UrlEncode: function (url) {
            if (!url) {
                throw new Error('编码处理参数错误！');
            }
            return encodeURIComponent(url);
        },
        /**
         * [UrlDecode description] url解码处理
         * @param {[type]} url [description]
         */
        UrlDecode: function (url) {
            if (!url) {
                throw new Error('解码处理参数错误！');
            }
            return decodeURIComponent(url);
        },
        /**
         * [getUrlArgs description]  获取url中的参数
         * @return {[type]} [description] {Object}
         * {
         *    has: 'url中是否有参数',
         *    data: {'返回对象'}
         * }
         */
        getUrlArgs: function () {
            var url = location.search.replace(/#.*$/, ''); //获取url中"?"符后的字串
            var result = {
                has: false, //url中是否有传参数
                data: {} //如果has是true,则data里有值
            };
            if (url.indexOf("?") != -1) {
                result.has = true;
                url = url.substr(1);
                result.data = this.queryToJson(url);
            }
            return result;
        },
        /**
         * [queryToJson description] 把query格式的数据转换成json格式
         * @param  {[type]} querystr [description] query格式参数 name=aa&sex=man
         * @param  {[type]} decode   [description] 参数值是否解码，默认为true
         * @return {[type]}          [description] {Object} {name:'aa',sex:'man'}
         */
        queryToJson: function (querystr, decode) {
            if (!querystr) {
                throw new Error('queryToJson参数错误');
            }
            if (typeof decode != 'boolean') {
                decode = true;
            }
            var result = {};
            var arr = querystr.split("&");
            for (var i = 0, len = arr.length; i < len; i++) {
                var itemarr = arr[i].split('=');
                if (decode) {
                    result[itemarr[0]] = this.UrlDecode(itemarr[1]);
                } else {
                    result[itemarr[0]] = itemarr[1];
                }
            }
            return result;
        },
        /**
         * [Point description] 自动添加小数点后两位
         * @param {[type]} val [description] 格式化的值
         * @param {[type]} len [description] 小数点的位数
         * @param {[type]} str [description] 默认不添加%,1表示添加
         */
        Point: function (val, len, str) {
            val = val.toString();
            if (!val) {
                throw new Error('Point参数错误！');
            }
            var strI = /^\d+$/;
            var pNum = parseFloat(val, 10);
            if (isNaN(val) || val == '') {
                return val;
            } else if (strI.test(pNum)) {
                len == 1 ? pNum = pNum + '.0' : pNum = pNum + '.00';
                return str == 1 ? pNum + '%' : pNum
            } else {
                var pNum = pNum.toFixed(2);
                return str == 1 ? pNum + '%' : pNum
            }
        },
        /**
         * [stripScript description] 过滤特殊字符
         * @param  {[type]} s [description]
         * @return {[type]}   [description]
         */
        stripScript: function (s) {
            var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~]");
            var rs = "",
                len = s.length;
            for (var i = 0; i < len; i++) {
                rs = rs + s.substr(i, 1).replace(pattern, '');
            }
            return rs;
        },
        /**
         * [getHost description] 获取当前host地址
         * @return {[type]} [description]
         */
        getHost: function () {
            return window.location.origin ? window.location.origin : window.location.protocol + '//' + window.location.host;
        },
        /**
         * [outLogin description] 处理key过期
         * @return {[type]} [description]
         */
        outLogin: function (layers) {
            layers.toast('回话已过期，请重新登录！', 500);
            if (this.getCookie('member_info')) {
                this.removeCookie('member_info');
            }
            setTimeout(function () {
                window.location.href = '/';
            }, 700);
        },
        /**
         * 函数去抖: 避免函数重复执行
         * @param method 待执行的目标函数的引用
         * @param wait 延迟执行时间, 若无默认 500 ms
         */
        debounce: function (method, wait) {
            clearTimeout(method.tId);
            method.tId = setTimeout(function () {
                method();
            }, wait || 500);
        },
        /**
         * [toFixed description] toDecimal 强制补全小数点后两位
         * @param  {[type]} value    [description]  value
         * @return {[type]}          [description]
         */
        toDecimal: function (value) {
            var f = parseFloat(value, 10);
            if (isNaN(f)) {
                return false;
            }
            var f = Math.round(value * 100) / 100;
            var str = f.toString();
            var rs = str.indexOf('.');
            if (rs < 0) {
                rs = str.length;
                str += '.';
            }
            while (str.length <= rs + 2) {
                str += '0';
            }
            return str;
        }
    }
});
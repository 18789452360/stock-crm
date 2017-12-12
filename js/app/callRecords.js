/**
 * [description]  通话记录页面
 * @return {[type]}                [description]
 */
require(['common','layui','tools','ajaxurl', 'layers', 'page', 'moment','jquery.metisMenu'],function(common, layui, tools, ajaxurl, layers, page, moment){
	var main = {
        form: '',
		 /**
         * 初始化全局树形菜单
         */
        sideMenu: function (callback) {
            Vue.nextTick(function () {
                $('#org-framework').metisMenu();
                typeof callback === 'function' && callback.call(this);
            })
        },
		createForm: function(){
			var that = this;
			layui.use(['form'], function () {
				var form = layui.form;
				//搜索 关键字
				form.on('submit(formSearch)', function(data){
                    if($.trim(data.field.keywords) != ''){
                    	vm.keywords = data.field.keywords;
                        that.getCallRecordAll();
                    }
                    return false;
                });
                that.form = form;
			});
		},
		getCallRecordAll: function(cur_page, callback){
			var that = this;
            cur_page = cur_page || 1;
			tools.ajax({
				url: ajaxurl.ivr.getCallRecordAll,
				data: {
					callType: vm.callType, //呼出：只能传1
					talked: vm.talked, //接通:只能传3
					employee_and_dep: vm.employeeAndDep, //员工/部门,传员工的id,逗号分隔
					start_date: vm.filterTime[0], //筛选时间/统计时间
                    end_date: vm.filterTime[1], //筛选时间/统计时间
					callime_start: vm.filterTimeLong[0], //筛选时间/通话时长
                    callime_end: vm.filterTimeLong[1], //筛选时间/通话时长
					phone_num: vm.keywords, //搜索姓名和电话
                    build: vm.build, //楼栋
                    page_size: vm.page_limit,
					cur_page: cur_page //分页参数
				},
				type: 'post',
                beforeSend: function(){
                    layers.load();
                },
				success: function(result){
					if(result.code == 1){
						if(result.data.list != undefined){
							vm.callRecord = result.data.list;
							vm.total_page = result.data.total_page;
							vm.total_num = result.data.total_number;
                            //Math.ceil(result.data.total_number / vm.page_limit)
                            
                            //处理楼栋数据
                            if(vm.BasicRoom.length == 0){
                                var buildLens = result.data.build.length, tempArr = [];
                                for(var i = 0; i < buildLens; i++){
                                    tempArr.push({
                                        id: result.data.build[i], 
                                        name: result.data.build[i] + '栋', 
                                        active: result.data.current == result.data.build[i] ? true : false
                                    });
                                }
                                vm.BasicRoom = tempArr;
                            }
                            if(cur_page == 1){
                                that.pages();
                            }
							typeof callback === 'function' && callback.call(this);
						}
					}else{
						layers.toast(result.message);
					}
				},
                complete: function(){
                    layers.closedAll();
                }
			})
		},
		/**
		 * [getdepartment description] 获取组织结构
		 * @return {[type]} [description]
		 */
		getdepartment: function(){
			var that = this;
			tools.ajax({
				url: ajaxurl.department.getdepartment,
				data: {},
				type: 'post',
				success: function(result){
					if(result.code == 1){
						// var lens = result.data.length;
						// if(lens){
						// 	for(var i = 0; i < lens; i++){
						// 		if(result.data[i].active == undefined){
						// 			result.data[i].active = false;
						// 		}
						// 	}
						// }
						vm.epartment = result.data;
						that.sideMenu(function(){
                            that.filterOrgSearch();
                        });
					}else{
						layers.toast(result.message);
					}
				}
			})
		},
		/**
         * 数组对象简单去重 对 id 去重, 名字可以有重复
         * @param arr
         * @return {Array}
         */
        unique: function (arr) {
            var result = {};
            var finalResult = [];
            for (var i = 0; i < arr.length; i++) {
                result[arr[i].id] = arr[i];
            }
            for (var item in result) {
                finalResult.push(result[item]);
            }
            return finalResult;
        },
        /**
         * 返回时间段, 返回 {Array}: 今天/昨天/最近7天/最近30天
         */
        timeArea: function () {
            return {
                today: [moment().format('YYYY-MM-DD')],
                yesterday: [moment().subtract(1, 'days').format('YYYY-MM-DD')],
                recent7day: [moment().subtract(6, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
                recent30day: [moment().subtract(29, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
            };
        },
        /**
         * 渲染筛选条件--自定义时间选择器
         */
        renderLayDate: function () {
            layui.use('laydate', function () {
                var laydate = layui.laydate;
                laydate.render({
                    elem: '.lay-date-a',
                    done: function (value) {
                        vm.inputTimeA = value;
                    }
                });
                laydate.render({
                    elem: '.lay-date-b',
                    done: function (value) {
                        vm.inputTimeB = value;
                    }
                })
            });
        },
        /**
         * [pages description] 分页
         * @return {[type]} [description]
         */
        pages: function(){
        	var that = this;
        	if(page){
        		page.init({
        			elem: 'callpages',
        			count: vm.total_num,
                    limit: vm.page_limit,
        			jump: function(obj, flag){
    				 	if(!flag){
    				 		that.getCallRecordAll(obj.curr);
					    }
        			}
        		})
        	}
        },
        /**
         * 筛选--组织架构搜索
         */
        filterOrgSearch: function () {
            Vue.nextTick(function () {
                var $item = $('#org-framework').find('a').not('.has-arrow');
                $item.each(function () {
                    var newItem = {id: $(this).data('id'), name: $(this).data('text')};
                    vm.OrgSearchArr.push(newItem);
                });
            });
            this.form.on('select(search-org)', function (data) {
                var addItem = {id: data.value.split(',')[0] * 1, name: data.value.split(',')[1]};
                vm.selectedOrgUsr.push(addItem);
                vm.selectedOrgUsr = main.unique(vm.selectedOrgUsr).reverse();
            });
            //this.form.render();
            // layui.use(['form'], function () {
            //     var form = layui.form;
            //     form.on('select(search-org)', function (data) {
            //         var addItem = {id: data.value.split(',')[0] * 1, name: data.value.split(',')[1]};
            //         vm.selectedOrgUsr.push(addItem);
            //         vm.selectedOrgUsr = main.unique(vm.selectedOrgUsr).reverse();
            //     });
            //     form.render();
            // });
        }
	};
	 /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
        	states: [
        		{name: '不限', id: '', active: true, type: 'all'},
        		{name: '呼出', id: '0', active: false, type: 'call'},
        		{name: '呼入', id: '1', active: false, type: 'call'},
        		{name: '接通', id: '1', active: false, type: 'talk'},
        		{name: '未接通', id: '2', active: false, type: 'talk'}
        	],
        	total_num: '', //总条数
            page_limit: 20, //分页size
            page_limit_arr: [{id:20,active:true},{id:50,active:false},{id:100,active:false},{id:500,active:false},{id:1000,active:false}],
        	keywords: '', //搜索关键字
        	callRecord: [], //通话记录列表
        	epartment: [], //组织架构筛选
        	callTypeAndStatus: '', //呼叫方式/状态
        	employeeAndDep: [], //员工/部门,传员工的id,逗号分隔
        	callType: '', //呼叫类型：1呼入,0呼出
        	talked: '', //1表示通，2表示未通
        	employee_and_dep: '', //员工/部门,传员工的id,逗号分隔
        	selectedOrgUsr: [], //全局组织架构已选用户 {id:1, name: '张三'},{id:2, name: '李四'}
        	selectedOrgUsrShow: [], //回显书记
        	showpop: false, //显示与隐藏筛选框
        	showpopActive: false, //筛选状态激活状态
        	showDate: false, //日期筛选的显示与隐藏
        	showDateActive: false, //日期选择框激活状态
        	conditionStr: ['今天', '昨天', '最近7天', '最近30天', '自定义'], //缓存数据
        	conditionStrTime: ['0秒','1-30秒','31-60秒','61-120秒','120秒以上'], //缓存数据
        	filterTime: [], //筛选日期
        	filterTimeLong: [], //筛选时长
        	inputTimeA: '',
        	inputTimeB: '',
        	dateName: '统计时间',
        	dateTimeName: '通话时长',
        	showTime: false, //语音时长显示与隐藏
        	showTimeActive: false, //语音时长的激活状态
            OrgSearchArr: [], //缓存组织架构搜索结果
            BasicRoom: [], //楼栋
            build: 'D', //选择的楼栋
        },
        methods: {
        	//列表播放音频
        	play: function(url, title, time){
        		common.jplayer(url, title, time);
        	},
        	choicepart: function(index, id){
        		if(index != null && id != null){
        			this.epartment[index].active = !this.epartment[index].active;
        		}
        	},
        	choiceState: function(event, index, id, type){//选择状态条件
                var $target = $(event.currentTarget);
        		if(index != undefined && id != undefined){
                    switch (type) {
                        case 'all':
                            this.callType = ''; //呼叫类型：1呼入,0呼出
                            this.talked = ''; //1表示通，2表示未通
                            var lens = this.states.length;
                            for(var i = 0; i < lens; i++){
                                if(i == 0){
                                    this.states[i].active = true;
                                }else{
                                    this.states[i].active = false;
                                }
                            }
                            break;
                        case 'call':
                            this.callType = id;
                            this.states[index].active = true;
                            if(id == 1){ //index = 1
                                this.states[1].active = false;
                            }else{ // id = 0 index = 2
                                this.states[2].active = false;
                            }
                            this.states[0].active = false;
                            break;
                        case 'talk':
                            this.talked = id;
                            this.states[index].active = true;
                            if(id == 1){ // index = 3
                                this.states[4].active = false;
                            }else{ // id = 2 index 4
                                this.states[3].active = false;
                            }
                            this.states[0].active = false;
                            break;
                    }
        			main.getCallRecordAll();
        		}
        	},
            choiceRoom: function(index, id){ //筛选楼栋
                if(index != undefined && id != undefined){
                    this.build = id;
                    var lens = this.BasicRoom.length;
                    for(var i = 0; i < lens; i++){
                        if(i == index){
                            this.BasicRoom[index].active = true;
                        }else{
                            this.BasicRoom[i].active = false;
                        }
                    }
                    main.getCallRecordAll();
                }
            },
            choiceLimit: function(index, id){ //选择每页展示的条数
                if(index != undefined && id != undefined){
                    var lens = this.page_limit_arr.length;
                    for(var i = 0; i < lens; i++){
                        this.page_limit_arr[i].active = false;
                        if(index == i){
                            this.page_limit_arr[i].active = true;
                        }
                    }
                    this.page_limit = id;
                    main.getCallRecordAll();
                }
            },
        	//筛选的弹窗框的全选
        	orgSelectAll: function(event, id){
        		var $ul = $(event.target).parent().siblings();
                var $item = $ul.find('a').not('.has-arrow');
                $item.each(function () {
                    var newItem = {id: $(this).data('id'), name: $(this).data('text')};
                    vm.selectedOrgUsr.push(newItem);
                });
                this.selectedOrgUsr = main.unique(vm.selectedOrgUsr).reverse();
        	},
        	//筛选的弹窗框的单个选择
        	orgSelectItem: function (e) {
                if (!$(e.target).hasClass('has-arrow')) {
                    var newItem = {id: $(e.target).data('id'), name: $(e.target).data('text')};
                    this.selectedOrgUsr.push(newItem);
                    this.selectedOrgUsr = main.unique(this.selectedOrgUsr).reverse();
                }
            },
            //点击筛选框确定按钮
            addConditonsOrg: function (e) {
                if (this.selectedOrgUsr.length) {
                    var tmpArr = [];
                    this.selectedOrgUsr.forEach(function (t) {
                        tmpArr.push(t.id);
                    });
                    this.selectedOrgUsrShow = this.selectedOrgUsr;
                    this.employeeAndDep = tmpArr.join(',');
                    main.getCallRecordAll();
                    this.showpop = false;
                } else {
                    layers.toast('请选择人员');
                }
            },
            //删除单个选项
            delChoose: function(index){
            	if(index != undefined){
            		this.selectedOrgUsr.splice(index, 1);
            	}
            },
            // 筛选不限 日期
            cancelCondition: function (e) {
                $(e.target).parent().find('a').each(function () {
                    $(this).removeClass('active');
                });
                this.showDate = false;
                this.showDateActive = false;
                this.dateName = '统计时间';
                this.filterTime = [];
            },
            // 筛选不限 通话时长
            cancelTime: function(e){
            	$(e.target).parent().find('a').each(function () {
                    $(this).removeClass('active');
                });
                this.dateTimeName = '通话时长';
        		this.showTime = false; //语音时长显示与隐藏
        		this.showTimeActive = false; //语音时长的激活状态
            },
            // 日期筛选
            choiceTime: function(e, custom){
            	if (custom) {// 自定义
                    $(e.target).toggleClass('active');
                } else {// 快速时间筛选
                    $(e.target).parent().find('a').each(function () {
                        $(this).removeClass('active');
                    });
                    this.showDate = false;
                    this.showDateActive = true;
                    this.dateName = '统计时间';
                    this.dateName += '：' + $(e.target).text();
                    var quicklyTime = [];
                    switch ($(e.target).text()) {
                        case vm.conditionStr[0]:
                            quicklyTime = main.timeArea().today;
                            break;
                        case vm.conditionStr[1]:
                            quicklyTime = main.timeArea().yesterday;
                            break;
                        case vm.conditionStr[2]:
                            quicklyTime = main.timeArea().recent7day;
                            break;
                        case vm.conditionStr[3]:
                            quicklyTime = main.timeArea().recent30day;
                            break;
                        default:
                    }
                    this.filterTime = quicklyTime;
                }
            },
            // 通话时长筛选
            choiceTimeLong: function(e, custom){
            	if (custom) {// 自定义
                    $(e.target).toggleClass('active');
                } else {// 快速时间筛选
                    $(e.target).parent().find('a').each(function () {
                        $(this).removeClass('active');
                    });
                    this.showTime = false;
                    this.showTimeActive = true;
                    this.dateTimeName = '通话时长';
                    this.dateTimeName += '：' + $(e.target).text();
                    var quicklyTime = [];
                    switch ($(e.target).text()) {
                        case '0秒':
                            quicklyTime = ['0'];
                            break;
                        case '1-30秒':
                            quicklyTime = ['1','30'];
                            break;
                        case '31-60秒':
                            quicklyTime = ['31','60'];
                            break;
                        case '61-120秒':
                            quicklyTime = ['61','120'];
                            break;
                        case '120秒以上':
                        	quicklyTime = ['120'];
                            break;
                    }
                    this.filterTimeLong = quicklyTime;
                }
            },
            /**
	         * 添加筛选: 自定义时间录入的情况
	         */
	        addConditons: function (e) {
	            // 时间范围验证
	            if ((new Date(this.inputTimeB) - new Date(this.inputTimeA)) < 0) {
	                layers.toast('开始时间不能大于结束时间', {time: 2500});
	            } else {
	                var domValA = $('.lay-date-a').val();
	                var domValB = $('.lay-date-b').val();
	                // 添加自定义时间
	                if (domValA && domValB) {
	                    this.inputTimeA = domValA;
	                    this.inputTimeB = domValB;
	                    // 关闭筛选框
	                    this.showDate = false;
	                    this.showDateActive = true;
	                    this.dateName += ('：' + this.inputTimeA + '到' + this.inputTimeB);
	                    this.filterTime = [this.inputTimeA, this.inputTimeB]
	                } else {
	                    layers.toast('请填入自定义时间范围');
	                }
	            }
	        },
	        addConditonsTime: function(){
	        	var domValA = $.trim($('.lay-date-t-a').val());
                var domValB = $.trim($('.lay-date-t-b').val());
                if(domValA == '' && domValB == ''){
                	layers.toast('请填入自定义秒数范围');
                	return;
                }
                if(domValA >= domValB){
                	layers.toast('开始秒数不能大于结束秒数', {time: 2500});
                	return;
                }
                // 关闭筛选框
                this.showTime = false;
                this.showTimeActive = true;
                this.dateTimeName = '通话时长';
                this.dateTimeName += ('：' + domValA + '秒到' + domValB + '秒');
                this.filterTimeLong = [domValA, domValB]
	        },
            delUsr: function(index){//删除组织架构中已经选择的展示出来的选项
                if(index != undefined){
                    this.selectedOrgUsr.splice(index, 1);
                    this.selectedOrgUsrShow.splice(index, 1);
                    var tmpArr = [];
                    this.selectedOrgUsr.forEach(function (t) {
                        tmpArr.push(t.id);
                    });
                    this.selectedOrgUsrShow = this.selectedOrgUsr;
                    this.employeeAndDep = tmpArr.join(',');
                    main.getCallRecordAll();
                }
            }
       	},
       	watch:{
       		showpop:{
       			handler: function(val, oldVal){
       				this.showpopActive = val;
       				if(val){
                        main.form.render();
       					this.showTime = false;
       					this.showDate = false;
       				}
       			},
       			deep: true
       		},
       		showDate:{
       			handler: function(val, oldVal){
       				if(this.filterTime.length){
       					this.showDateActive = true;
       				}else{
       					this.showDateActive = val;
       				}
       				if(val){
       					this.showTime = false;
       					this.showpop = false;
       				}
       			},
       			deep: true
       		},
       		showTime:{
       			handler: function(val, oldVal){
       				if(this.filterTimeLong.length){
       					this.showTimeActive = true;
       				}else{
       					this.showTimeActive = val;
       				}
       				if(val){
       					this.showDate = false;
       					this.showpop = false;
       				}
       			},
       			deep: true
       		},
       		filterTime:{
       			handler: function(val, oldVal){
       				main.getCallRecordAll();
       			},
       			deep: true
       		},
       		filterTimeLong:{
       			handler: function(){
       				main.getCallRecordAll();
       			},
       			deep: true
       		}
       	}
    });
    //vue过滤器
    Vue.filter('VformatM', function (value) {
        if (value < 60) {
            return '00:' + (value >= 10 ? value : '0' + value);
        }
        if (60 <= value < 3600) {
            return (Math.floor(value / 60) >= 10 ? Math.floor(value / 60) : '0' + Math.floor(value / 60)) + ':' + (value % 60 >= 10 ? value % 60 : '0' + value % 60)
        }
        if (value >= 3600) {
            var H = Math.floor(value / 3600) >= 10 ? Math.floor(value / 3600) : '0' + Math.floor(value / 3600);
            var M = Math.floor((value % 3600) / 60) >= 10 ? Math.floor((value % 3600) / 60) : '0' + Math.floor((value % 3600) / 60);
            var S = Math.floor((value % 3600) / 60 * 60) >= 10 ? Math.floor((value % 3600) / 60 * 60) : '0' + Math.floor((value % 3600) / 60 * 60);
            return H + M + S;
        }
    })
    /**
     * 初始化
     * @private
     */
    var _init = function () {
    	main.createForm();
        common.getTabLink();
        main.getCallRecordAll();
        main.getdepartment();
        main.renderLayDate();
    };
    _init();
});
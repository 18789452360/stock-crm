/**
 * Created by Administrator on 2017-09-28.
 * 部门管理
 */
require(['layui', 'template', 'ajaxurl', 'layers', 'jstree', 'tools', 'common', 'text!/assets/popup/edit-department.html', 'text!/assets/popup/add-department.html', 'text!/assets/popup/edit-depart-struct.html'], function (layui, template, ajaxurl, layers, jstree, tool, common, editorDepartment, addDepartment, editDepartStruct) {
    template.config('openTag', '{?');
    template.config('closeTag', '?}');
    var init = {
        /**
         * 实例化tree树
         */
        initTree: function() {
            $("#jstree").jstree({
                'plugins': ['types', 'dnd'],
                "types" : {
                    "root" : {
                        "icon" : "32px.png"
                    }
                }
            });
        },
        /**
         * 实例化编辑弹窗tree树
         */
        initTreeEdit: function() {
            $("#jstree-edit").jstree({
                'plugins': ['types', 'dnd'],
                "types" : {
                    "root" : {
                        "icon" : "32px.png"
                    }
                }
            });
        },
        /**
         * 渲染部门列表
         */
        parentInfo: function(load) {
            // 获取路由参数id的值
            var urls = tool.getUrlArgs(), pid = '', loading = '';
            if(urls.has){
                pid = urls.data.id;
            }
            tool.ajax({
                url: ajaxurl.department.selectDown,
                type: 'post',
                data: {pid: pid},
                beforeSend: function() {
                    layers.load(function(indexs) {
                        loading = indexs
                    })
                },
                success: function(result){
                    if(result.code == 1){
                        vm.dataParent = [];
                        // 渲染到vue数据层
                        vm.dataParent = result.data;
                        vm.dataName = result;
                        Vue.nextTick(function() {
                            // DOM 更新了
                            if(load){
                                $.jstree.reference($('#jstree'));
                            }else{
                                init.initTree();
                            }
                            layers.closed(loading);
                        });
                    }else{
                        //layers.toast(result.message)
                        layers.closed(loading);
                    }
                    layers.closed(loading);
                },
                error: function(){
                    layers.toast("网络异常!");
                    layers.closed(loading);
                }
            });
        },
        /**
         * 编辑部门成员
         */
        editorMan: function() {
            var $partment = $("#jstree"),
                showTab = $(".group-arrows"),
                saveName = $(".save-name");
            // 列表响应单击事件
            $partment.on("click", ".tree-partment", function() {
                showTab.empty();
                var that = $(this),
                    arrNode = [],
                    arrInput = [],
                    arrInputData = [],
                    html = '',
                    dataID = that.attr("data-id");
                // 设置保存按钮的隐藏域
                saveName.attr("data-id", dataID);
                // 获取子级部门个数
                var nextAllLen = that.parent().parent("li") // 获取当前部门下面的所有直接子部门
                    .children("ul")
                    .children("li")
                    .children("a")
                    .find(".tree-partment").length;
                // 如果子级部门个数大于input的个数 则动态添加补齐
                if(nextAllLen > 10) {
                    var leftLen = nextAllLen - 10,
                        leftHtml = '';
                    for(var j = 0; j < leftLen;  j++) {
                        leftHtml += '<div class="layui-form-item"><div class="layui-input-block"><input value="" type="text" name="title" lay-verify="title" autocomplete="off" placeholder="请输入所属部门" class="layui-input"></div></div>';
                    }
                    $(".form-item").append(leftHtml);
                }
                var prevAll = that.parents("li") // 获取当前部门及所有父级部门
                    .children("a")
                    .children(".tree-partment"),
                    nextAll = that.parent().parent("li") // 获取当前部门下面的所有直接子部门
                        .children("ul")
                        .children("li")
                        .children("a")
                        .find(".tree-partment");
                formList = $(".form-list").find("input"); // 获取右边所有输入框列表
                vm.nextAllLength = nextAllLen;
                // 遍历当前部门及所有父级部门push到数组arrNode
                $.each(prevAll, function() {
                    arrNode.push($(this).text());
                });
                // 遍历当前部门下面的所有直接子部门push到数组arrInput
                $.each(nextAll, function() {
                    arrInput.push($(this).text());
                    arrInputData.push($(this).attr("data-id"));
                });
                // 设置输入框的值
                $.each(formList, function(index) {
                    // 获得值
                    $(this).val(arrInput[index]);
                    // 获得data-id
                    $(this).attr("data-id",arrInputData[index]);
                });
                // 翻转arrNode数组
                arrNode.reverse();
                for(var i = 0; i < arrNode.length; i ++) {
                    html += '<a href="javascript:;">' + arrNode[i] + '&gt;</a>';
                }
                // 渲染标签
                showTab.html(html);
            });
        },
        /**
         * 新增下级部门输入框
         */
        addClient: function() {
            var formList = $(".form-item"),
                text = '<div class="layui-form-item"><div class="layui-input-block add-contrant-icon"><input value="" type="text" name="title" lay-verify="title" autocomplete="off" placeholder="请输入所属部门" class="layui-input"><span class="iconfont icon-cha cont-delete"></span></div></div>';
            formList.append(text);
        },
        contDelete: function() {
            $(".form-list").on("click",".cont-delete", function() {
                var inputValues = $(this).siblings("input").val();
                if(inputValues == '') {
                    $(this).parents(".layui-form-item").remove();
                } else {
                    layers.toast("请保存后再删除")
                }
            })
        },
        /**
         * 部门结构右边-保存
         */
        saveDepartment: function(event) {
            var $target = $(event.target),
                dataID = $target.attr("data-id"),
                listInput = $target.parent().siblings(".form-item").find("input"), // 所有input
                inputVal = [],
                newVal = '',
                newID = '';
            // 遍历所有的input去除空元素放入数组listInput
            listInput.each(function() {
                newVal = $(this).val(); // 获取input的值
                newID = $(this).attr("data-id"); // 获取input的 data-id 属性
                if(newVal == '') {
                    newVal = ""; // 值为空
                }
                if(newID == undefined) {
                    newID = "0"; // data-id不存在
                }
                inputVal.push(newVal + '|' + newID); // 拼接
            });
            // 接收vm.nextAllLength后删除下来的数组
            var newInputVal = inputVal.splice(vm.nextAllLength);
            // 删除vm.nextAllLength后面的元素
            inputVal.splice(vm.nextAllLength);
            // 获取vm.nextAllLength后删除下来去掉空字符串的数组
            newInputVal = init.emptyArray(newInputVal);
            // 拼接成新的最终数组
            var lastListInput = inputVal.concat(newInputVal);
            if(dataID == undefined) {
                // 获取路由参数id的值
                var urls = tool.getUrlArgs(), parentID = '';
                if(urls.has){
                    parentID = urls.data.id;
                }
                dataID = parentID;
            }
            tool.ajax({
                url: ajaxurl.department.addDown,
                type: 'post',
                data: {pid: dataID, department_name: lastListInput},
                success: function(result){
                    if(result.code == 1){
                        layers.toast(result.message);
                        init.parentInfo(true);
                        setTimeout(function() {
                            window.location.reload();
                        }, 500);
                    }else{
                        layers.toast(result.message)
                    }
                },
                error: function(){
                    layers.toast("网络异常!")
                }
            });
            return false;
        },
        /**
         * 部门结构左边-编辑
         */
        editClick: function() {
            $("#jstree").on("click", ".tree-editor" ,function() {
                var $parentEdit = $(this).siblings(".tree-partment"),
                    editVal = $parentEdit.html(), // 获取当前元素下面的值
                    editID = $parentEdit.attr("data-id"), // 获取当前元素下的id
                    childPidArr = [];
                var parentID = $(this).parent("a").parent("li")
                    .parent("ul").parent("li").attr("data-id"), // 获取上一级父元素的id
                    parentVal = $(this).parent("a").parent("li")
                        .parent("ul").siblings("a").children(".tree-partment").text(); // 获取上一级父元素的值
                var $childArr = $(this).parent("a").siblings('ul').find('.tree-editor');
                $childArr.each(function() { // 获取当前编辑的部门下面所有子部门的父级pid
                    childPidArr.push($(this).attr('data-pid'));
                });
                var newChildPidArr = init.uniqueArr(childPidArr); // 数组去重
                layers.open({
                    title: '编辑部门',
                    area: ['600px', '500px'],
                    content: editDepartStruct,
                    success: function(layero) {
                        // 初始化 layui form 表单，设置弹窗编辑内容的值
                        $(".edit-depart").val(editVal);
                        $(".edit-depart").attr("data-id", editID);
                        $(".select-parent").val(parentVal);
                        var $layero = $(layero);
                        var leftData = { data: vm.dataParent }; // 上级部门列表
                        // 更新form
                        layui.use(['form'],function() {
                            var form = layui.form;
                            form.render()
                        });
                        // 渲染模板
                        $layero.find('.edit-parent').html(template('share-usr-left', leftData));
                        // 初始化树形
                        init.initTreeEdit();
                        // 选择编辑的上级部门并赋值
                        $(".confirm-tip").on("click", ".select-parent", function() {
                            var that = $(this),
                                dataID = that.attr("data-id"),
                                dataPid = that.attr("data-pid"),
                                dataHtml = that.html(),
                                topParent = $(".select-parent");
                            topParent.val(dataHtml);
                            topParent.attr("data-id", dataID);
                            topParent.attr("data-pid", dataPid);
                        })
                    },
                    btn2: function() {
                        // 部门结构-保存(当前)
                        var id = $(".add-parent").attr("data-id"),
                            department_name = $(".add-parent").val(),
                            pid = $(".select-parent").attr("data-id"),
                            childPid = $(".select-parent").attr("data-pid");
                        // 获取路由参数id的值
                        var urls = tool.getUrlArgs(), fPid = '';
                        if(urls.has){
                            fPid = urls.data.id;
                        }
                        // 判断用户编辑的时候未选择上级部门
                        if(pid == undefined) {
                            pid = parentID; // 设置pid为上一级父元素的id
                        }
                        // 判断上级部门为空
                        if($(".select-parent").val() == '') {
                            pid = fPid; // 设置pid为客户id
                        }
                        // 判断用户是否移动到部门的子部门下边
                        for(var i = 0; i < newChildPidArr.length; i ++) {
                            if(newChildPidArr[i] === childPid) {
                                layers.toast('父级部门不能移动到子级部门!');
                                return;
                            }
                        }
                        tool.ajax({
                            url: ajaxurl.department.editDepartment,
                            type: 'post',
                            data: {
                                pid: pid,
                                id: id,
                                department_name: department_name
                            },
                            success: function(result){
                                if(result.code == 1){
                                    layers.toast(result.message);
                                    setTimeout(function() {
                                        window.location.reload();
                                    }, 1000)
                                }else{
                                    layers.toast(result.message)
                                }
                            },
                            error: function(){
                                layers.toast("网络异常!")
                            }
                        });
                    }
                })
            })
        },
        /**
         * 部门结构左边-删除
         * @param delCode
         */
        delDepartment: function() {
            $("#jstree").on("click", ".tree-delete" ,function() {
                var _this = $(this);
                var delCode = _this.attr("data-id");
                layers.confirm({
                    title: '删除部门',
                    area: ['400px', '250px'],
                    content: '<div class="confirm-tips"><p>删除操作不可恢复，确认继续删除？</p></div>',
                    btn2: function() {
                        // 确认的回调
                        tool.ajax({
                            url: ajaxurl.department.del,
                            type: 'post',
                            data: {id: delCode},
                            success: function(result){
                                if(result.code == 1){
                                    layers.toast(result.message);
                                    setTimeout(function() {
                                        window.location.reload();
                                    }, 500);
                                    //_this.parent("a").parent("li").remove();
                                }else{
                                    layers.toast(result.message)
                                }
                            },
                            error: function(){
                                layers.toast("网络异常!")
                            }
                        });
                    }
                })
            })

        },
        /**
         * 数组去除"|0"的字段
         * @param arr 传入的数组
         * @param newArr 返回的数组
         */
        emptyArray: function(arr) {
            var newArr = [];
            $.each(arr, function (i, v) {
                if(v !== '|0') {
                    newArr.push(v);
                } else {
                    return;
                }
            });
            return newArr;
        },
        /**
         * 数组去重
         */
        uniqueArr: function(arr){
            var obj = {};
            var result = [];
            for(var i in arr){
                if(!obj[arr[i]]){
                    obj[arr[i]] = true;
                    result.push(arr[i]);
                }
            }
            return result;
        }
    };

    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            dataParent: [], // 部门列表
            dataParentEdit: [], // 编辑部门列表
            nextAllLength: '', // 保存删除下来的值
            dataName: '', // 公司的值
        },
        methods: {
            // 部门结构-保存
            saveDepartment: function(event) {
                init.saveDepartment(event);
            },
            // 新增下级部门
            addClient: function() {
                init.addClient();
            }
        }
    });

    /**
     * 初始化
     * @private
     */
    var _init = function () {
        init.editorMan();
        init.editClick();
        init.parentInfo();
        init.delDepartment();
        init.contDelete();
    };

    _init();

});

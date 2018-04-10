require(['common', 'layui', 'layers', 'tools', 'ajaxurl', 'text!/assets/popup/share-usr.html', 'jquery.metisMenu', 'template', 'upload'], function (common, layui, layers, tools, ajaxurl, shareUsr, undefined, template, upload) {

    // 初始化 template 界定符
    template.config('openTag', '{?');
    template.config('closeTag', '?}');

    var main = {
        /**
         * Helper 深度拷贝简单引用类型对象
         */
        copy: function (target) {
            return JSON.parse(JSON.stringify(target))
        },
        /**
         * 初始化 LayUI 组件
         */
        createLayUI: function () {
            var _this = this;
            layui.use(['layedit', 'form'], function () {
                var layedit = layui.layedit;
                var form = layui.form;
                // 初始化富文本编辑器
                var index = layedit.build('inputContent', {
                    tool: ['strong', 'italic', 'underline', 'del', '|', 'left', 'center',
                        'right', 'link', 'unlink', 'image'],
                    // 图片插入接口
                    uploadImage: {
                        url: ajaxurl.material.docImgUpload
                    }
                });
                // 编辑器对象挂载到 main 上
                _this.editObj = {
                    index: index,
                    layedit: layedit
                };
                // 获取分类目录 id
                form.on('select(category)', function (data) {
                    vm.submitContent.catalog = data.value;
                });
                // 权限控制
                form.on('radio(auth)', function (data) {
                    vm.showCusAuth = data.value === '1';
                    vm.submitContent.auth.type = +data.value + 1;
                });
            });
        },
        /**
         * 组织架构, 权限控制选择自定义用户
         */
        choiceShowUsr: function () {
            var _this = this;
            var leftData = {data: vm.usrOrgList};// 组织架构
            var rightData = {data: []};// 已选择用户 {id:'',name:''}
            layers.confirm({
                title: '请选择可查看用户',
                area: ['600px', 'auto'],
                content: shareUsr,
                success: function (layero) {
                    var $layero = $(layero);
                    var OrgSearchArr = [];// 遍历得到所有的员工
                    $layero.find('.warning').hide();
                    // 添加当前分组全部成员
                    $layero.on('click', '.check-all-btn', function (e) {
                        var $ul = $(e.target).parent().siblings();
                        var $item = $ul.find('a:not(.has-arrow)');
                        $item.each(function () {
                            var newItem = {id: $(this).data('id'), name: $(this).data('name')};
                            rightData.data.push(newItem);
                        });
                        // 渲染到右侧已选择
                        rightData.data = main.unique(rightData.data).reverse();
                        $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                        $layero.find('.choose-people h2 span').text(rightData.data.length);
                    });
                    // 添加单个成员
                    $layero.on('click', '.metismenu a:not(.has-arrow)', function (e) {
                        var newItem = {id: $(this).data('id'), name: $(this).data('name')};
                        rightData.data.push(newItem);
                        // 渲染到右侧已选择
                        rightData.data = main.unique(rightData.data).reverse();
                        $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                        $layero.find('.choose-people h2 span').text(rightData.data.length);
                    });
                    // 删除已选用户
                    $layero.on('click', '.del-choose', function (e) {
                        var id = $(e.target).parent().data('id');
                        rightData.data.forEach(function (item, index) {
                            if (item.id === id) {
                                rightData.data.splice(index, 1)
                            }
                        });
                        // 渲染到右侧已选择
                        rightData.data = main.unique(rightData.data).reverse();
                        $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                        $layero.find('.choose-people h2 span').text(rightData.data.length);
                    });
                    // 渲染组织架构 && 搜索 [此处有先后]
                    $layero.find('.sidebar-nav').html(template('share-usr-left', leftData));
                    // 搜索所有员工 start
                    var $item = $('.metismenu').find('a').not('.has-arrow');
                    $item.each(function () {
                        var newItem = {id: $(this).data('id'), name: $(this).data('name')};
                        OrgSearchArr.push(newItem);
                    });
                    $layero.find('.search-org').html(template('org-search', {data: OrgSearchArr}));
                    layui.use(['form'], function () {
                        var form = layui.form;
                        // 处理回显员工, 包含2中情况: 1)新增文档时重新选择可见员工 2)编辑文档时回填老数据
                        try {
                            if (vm.submitContent.auth.limitPerson.length) {
                                var selectedEmployeeIdsArr = vm.submitContent.auth.limitPerson || [];
                                var result = [];// 回显员工处理结果
                                selectedEmployeeIdsArr.forEach(function (id) {
                                    // 遍历所有员工, 根据id查到姓名, 回填到已选员工
                                    OrgSearchArr.forEach(function (item) {
                                        +item.id === +id && result.push(item);
                                    })
                                });
                                rightData.data = result;
                                $layero.find('.choose-people h2 span').text(rightData.data.length);
                                $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                            }
                        } catch (e) {
                            console.error('处理自定义访问控制人员回显出错');
                        }
                        form.on('select(search-org)', function (data) {
                            var addItem = {id: data.value.split(',')[0] * 1, name: data.value.split(',')[1]};
                            rightData.data.push(addItem);
                            rightData.data = _this.unique(rightData.data).reverse();
                            $layero.find('.choose-people ul').html(template('share-usr-right', rightData));
                            $layero.find('.choose-people h2 span').text(rightData.data.length);
                        });
                        form.render();
                    });
                    // 搜索所有员工 end
                    // 初始化树形菜单
                    $layero.find('.metismenu').metisMenu();
                },
                btn2: function (index, layero) {
                    var chooseUsrArr = rightData.data || [];//[{id:'',name:''}]
                    vm.submitContent.auth.limitPerson = [];
                    chooseUsrArr.forEach(function (item) {
                        vm.submitContent.auth.limitPerson.push(item.id);
                    });
                }
            });
        },
        /**
         * 获取组织架构数据
         */
        getUsrOrgList: function (callback) {
            tools.ajax({
                url: ajaxurl.department.getdepartment,
                data: {},
                success: function (res) {
                    if (res.code === 1) {
                        vm.usrOrgList = res.data;
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 数组对象简单去重 对 id 去重
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
         * 获取当前文档库id
         */
        getCurDocId: function (callback) {
            var result = tools.getUrlArgs();
            if ($.isEmptyObject(result.data)) {
                console.error('页面缺少必要的参数: materialId && docId && articleId');
            } else {
                // 判断是否是编辑状态
                if (result.data.type) {
                    vm.isEditStatus = true;
                    result.data.articleId
                        ? (vm.submitContent.articleId = result.data.articleId)
                        : console.error('页面缺少必要的参数: 文档ID: articleId');
                }
                result.data.materialId && result.data.materialId !== 'null'
                    ? (vm.submitContent.materialId = result.data.materialId)
                    : console.error('页面缺少必要的参数: 资料库ID: materialId');
                result.data.docId
                    ? (vm.submitContent.docId = result.data.docId)
                    : console.error('页面缺少必要的参数: 文档库ID: docId');
                typeof callback === 'function' && callback.call(this);
            }
        },
        /**
         * 获取分档分类列表
         */
        getCategoryList: function () {
            var _this = this;
            tools.ajax({
                url: ajaxurl.material.docCategoryList,
                data: {},
                type: 'post',
                success: function (res) {
                    if (res.code === 1) {
                        vm.categoryList = res.data;
                        // 编辑时, 先获取回显内容再初始化 LayUI
                        vm.isEditStatus
                            ? _this.getArticleInfo(_this.createLayUI.bind(_this))
                            : _this.createLayUI();
                    } else {
                        layers.toast(res.message);
                    }
                }
            });
        },
        /**
         * 全局表单验证
         */
        checkContentForm: function () {
            var resultFlag = true;
            // 1标题
            if (!vm.submitContent.title.trim()) {
                layers.toast('请输入文档标题');
                $('input.layui-input').eq(0).focus();
                return false;
            }
            // 2访问控制 (选择了自定义后, 就要选自定义的人)
            if (vm.submitContent.auth.type === 2 &&
                !vm.submitContent.auth.limitPerson.length) {
                layers.toast('请选择自定义用户');
                return false;
            }
            // 3检查附件是否有标题有重复内容
            for (var i = 0, len = vm.submitContent.uploadFileArr.length; i < len; i++) {
                if (vm.submitContent.uploadFileArr[i].err) {
                    layers.toast('附件标题有重复');
                    return false;
                }
            }
            return resultFlag;
        },
        /**
         * 提交: 新增/编辑文档内容
         */
        submit: function () {
            var isOK = this.checkContentForm();
            vm.submitContent.htmlContent = this.editObj.layedit.getContent(this.editObj.index);
            if (isOK) {
                // 处理自定义了文件标题的情况
                if (vm.checkAttachDup.length) {
                    var subAttachListCopy = this.copy(vm.submitContent.subAttachList) || [];
                    subAttachListCopy.forEach(function (item, index) {
                        var tmp = [];
                        tmp.push(item.split(',')[0]);// url
                        tmp.push(vm.checkAttachDup[index].name);// title
                        tmp.push(item.split(',')[2]);// size
                        subAttachListCopy[index] = tmp.join(',');
                    });
                    vm.submitContent.subAttachList = subAttachListCopy;
                }
                // Ajax 提交服务端
                if (vm.isEditStatus) {
                    // 合并新上传附件和已有附件
                    vm.submitContent.subAttachList = vm.submitContent.subAttachList.concat(this._tmpUpdateFileArr) || [];
                    // 编辑文档
                    tools.ajax({
                        url: ajaxurl.material.editDcItem,
                        data: {
                            material_document_article_id: vm.submitContent.articleId,// 文档id
                            material_document_article_name: vm.submitContent.title,
                            material_document_article_type: vm.submitContent.catalog,
                            material_document_article_keywords: vm.submitContent.keywords.split('、').join(','),
                            material_document_article_content: vm.submitContent.htmlContent,
                            material_document_article_attachments: vm.submitContent.subAttachList.join('|'),// "src,title,size|src,title,size"
                            material_document_article_control_type: vm.submitContent.auth.type || 1,
                            material_document_article_employees: vm.submitContent.auth.limitPerson.join(',')
                        },
                        type: 'post',
                        beforeSend: function () {
                            vm.isSubmitting = true;
                        },
                        success: function (res) {
                            if (res.code === 1) {
                                layers.toast('修改成功');
                                setTimeout(function () {
                                    var baseUrl = '/admin/material/material_document_article/detail';
                                    window.location.href = baseUrl + '?articleId=' + vm.submitContent.articleId + '&docId=' + vm.submitContent.docId + '&materialId=' + vm.submitContent.materialId;
                                }, 1000);
                            } else {
                                layers.toast(res.message);
                            }
                        },
                        complete: function () {
                            setTimeout(function () {
                                vm.isSubmitting = false;
                            }, 1500)
                        }
                    });
                } else {
                    // 新增文档
                    tools.ajax({
                        url: ajaxurl.material.addDcItem,
                        data: {
                            material_id: vm.submitContent.materialId,// 资料库id
                            material_document_id: vm.submitContent.docId,// 文档库id
                            material_document_article_name: vm.submitContent.title,
                            material_document_article_type: vm.submitContent.catalog,
                            material_document_article_keywords: vm.submitContent.keywords.split('、').join(','),
                            material_document_article_content: vm.submitContent.htmlContent,
                            material_document_article_attachments: vm.submitContent.subAttachList.join('|'),// "src,title,size|src,title,size"
                            material_document_article_control_type: vm.submitContent.auth.type || 1,
                            material_document_article_employees: vm.submitContent.auth.limitPerson.join(',')
                        },
                        type: 'post',
                        beforeSend: function () {
                            vm.isSubmitting = true;
                        },
                        success: function (res) {
                            if (res.code === 1) {
                                layers.toast('发布成功');
                                setTimeout(function () {
                                    window.history.go(-1);
                                }, 1000);
                            } else {
                                layers.toast(res.message);
                            }
                        },
                        complete: function () {
                            setTimeout(function () {
                                vm.isSubmitting = false;
                            }, 1500)
                        }
                    });
                }
            }
        },
        /**
         * 多文件上传
         */
        uploadFile: function (index) {
            var _this = this,
                fileName,
                fileType,
                fileSize,
                loading; // loading 动画索引
            index = index || 0;
            upload.init({
                elem: '#upfile_' + index,
                url: ajaxurl.material.docAttachUpload,
                field: 'fileUpload',
                accept: 'file',
                exts: 'doc|docx|xls|xlsx|ppt|pptx|zip|rar|jpg|gif|jpeg|png|csv',
                size: 51200,
                auto: true,
                before: function (obj) {
                    // 预读本地文件拿到文件名和文件类型, 文件大小
                    obj.preview(function (index, file) {
                        fileSize = +(file.size / 1024 / 1024).toFixed(2) || 0.01;// 单位 MB
                        fileType = file.type;
                        fileName = file.name;
                    });
                    layers.load(function (loadingIndex) {
                        loading = loadingIndex
                    });
                },
                done: function (res) {
                    layers.closed(loading);
                    if (res.code === 1) {
                        $('#upfile_name_' + index).text(fileName);
                        $('#upfile_attach_name_' + index).val(fileName).focus();
                        layers.toast(res.message);
                        if (fileType.indexOf('image') !== -1) {
                            vm.submitContent.uploadFileArr[index].src = res.data.image;
                        } else {// 除了图片, 其它统一返回 {video:'xxx.doc', videoname: ''}
                            vm.submitContent.uploadFileArr[index].src = res.data.video;
                        }
                        vm.submitContent.uploadFileArr[index].title = fileName;
                        vm.submitContent.uploadFileArr[index].size = fileSize;
                        // 拷贝一个副本, 用于序列化提交
                        var uploadFileArrCopy = _this.copy(vm.submitContent.uploadFileArr) || [];
                        uploadFileArrCopy.forEach(function (item, index) {
                            var tmp = [];
                            tmp.push(item.src);
                            tmp.push(item.title);
                            tmp.push(item.size);
                            uploadFileArrCopy[index] = tmp.join(',');
                        });
                        vm.submitContent.subAttachList = uploadFileArrCopy;
                    } else {
                        layers.toast(res.message)
                    }
                },
                error: function () {
                    layers.closed(loading);
                }
            });
        },
        /**
         * 检查当前文档内新增的附件标题是否有重复 @bluer 触发
         */
        checkLocalDocAttachTitle: function (e, index) {
            var uploadedFileName = e.target.value.trim();
            // 已上传附件且当前输入框有值
            if (uploadedFileName && vm.submitContent.uploadFileArr[index].src) {
                // 内容变更则清空当前错误提示
                e.target.oninput = function () {
                    vm.submitContent.uploadFileArr[index].err = '';
                    vm.checkAttachDup[index] = '';
                };
                var attachItem = {
                    index: index,
                    name: uploadedFileName
                };
                // 1.新上传的附件和新上传的附件检查重复
                vm.checkAttachDup[index] = attachItem;
                var len = vm.checkAttachDup.length;
                for (var i = 0; i < len; i++) {
                    if (i === index) continue;// 排除本身
                    if (vm.checkAttachDup[i].name === uploadedFileName) {
                        vm.submitContent.uploadFileArr[index].err = '标题已存在，请重新输入';
                    }
                }
                // 2.和老附件(回显)附件比较检查重复
                var oldAttachFileArr = vm.updateAttachFileArr || [];
                oldAttachFileArr.forEach(function (item) {
                    if (uploadedFileName === item.attach_name) {
                        vm.submitContent.uploadFileArr[index].err = '标题已存在，请重新输入';
                    }
                })
            }
        },
        /**
         * 编辑文档回填数据
         */
        getArticleInfo: function (callback) {
            var _this = this;
            vm.isEditStatus && tools.ajax({
                url: ajaxurl.material.article,
                data: {
                    material_document_article_id: vm.submitContent.articleId
                },
                success: function (res) {
                    if (res.code === 1) {
                        vm.submitContent.title = res.data.title;
                        vm.submitContent.catalog = res.data.type_id;
                        vm.submitContent.keywords = res.data.keywords.split(',').join('、');
                        // 正文内容
                        $('#inputContent').html(res.data.info);
                        // 附件
                        vm.updateAttachFileArr = res.data.attachment || [];
                        var updateAttachFileArrCopy = _this.copy(vm.updateAttachFileArr) || [];
                        updateAttachFileArrCopy.forEach(function (item, index) {
                            var tmp = [];
                            tmp.push(item.attach_path);
                            tmp.push(item.attach_name);
                            tmp.push(item.attach_size);
                            updateAttachFileArrCopy[index] = tmp.join(',');
                        });
                        // 临时挂载到 main 上
                        _this._tmpUpdateFileArr = updateAttachFileArrCopy;
                        // 权限控制 start
                        $("input[lay-filter='auth']").eq(res.data.type - 1).attr('checked', true);
                        vm.showCusAuth = res.data.type === '2';
                        vm.submitContent.auth.limitPerson = res.data.employeeIds || [];
                        vm.submitContent.auth.type = res.data.type;
                        typeof callback === 'function' && callback.call(this, res);
                    } else {
                        layers.toast(res.message);
                    }
                }
            })
        }
    };


    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            isEditStatus: false,// 是否是编辑状态
            categoryList: '',// 分类目录
            showCusAuth: false,// 自定义权限控制
            usrOrgList: '', // 组织架构
            submitContent: {// 待提交内容
                docId: '',// 文档库id
                materialId: '',// 资料库 id
                articleId: '',// 文档 id(用于编辑)
                title: '',
                catalog: '',
                keywords: '',
                htmlContent: '',
                uploadFileArr: [{src: '', title: '', size: '', err: ''}],
                subAttachList: [],// ['url,name,size','url,name,size']
                auth: {
                    type: 1, // 1公开 2自定义 3私有
                    limitPerson: [] // 自定义时员工id
                }
            },
            checkAttachDup: [],// 检查附件重复 [{index:'',name:''}]
            updateAttachFileArr: [],// 编辑时回显的附件
            isSubmitting: false // 提交阻塞, 防止重复提交
        },
        methods: {
            save: function () {
                !this.isSubmitting && main.submit();
            },
            // 新增附件
            newFile: function () {
                if (this.submitContent.uploadFileArr.length !== this.checkAttachDup.length) {
                    layers.toast('请先上传附件后，再新增上传');
                } else {
                    var newAttach = {src: '', title: '', size: '', err: ''};
                    this.submitContent.uploadFileArr.push(newAttach);
                    var index = this.submitContent.uploadFileArr.length - 1;
                    // 新增时, 初始化一次 layUI 的上传组件
                    Vue.nextTick(function () {
                        main.uploadFile(index);
                    });
                }
            },
            // 删除附件
            delFile: function (index) {
                this.submitContent.uploadFileArr.splice(index, 1);
                this.submitContent.subAttachList.splice(index, 1);
                this.checkAttachDup.splice(index, 1);
            },
            // 返回
            goBack: function () {
                window.history.go(-1);
            },
            // 选择自定义客户
            choiceShowUsr: function () {
                main.choiceShowUsr();
            },
            // 编辑附件标题
            editAttachTitle: function (e, index) {
                main.checkLocalDocAttachTitle(e, index);
            },
            // 删除编辑状态时回显的附件列表
            delUpdateAttachFile: function (index, id) {
                this.updateAttachFileArr.splice(index, 1);
                this.submitContent.subAttachList.splice(index, 1);
                main._tmpUpdateFileArr.splice(index, 1);
            }
        }
    });


    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.getCurDocId(main.getCategoryList);
        main.getUsrOrgList();
        common.getTabLink();
        main.uploadFile();
    };
    _init();
});

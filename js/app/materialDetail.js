require(['common', 'layui', 'layers', 'tools', 'ajaxurl'], function (common, layui, layers, tools, ajaxurl) {

    var main = {
        /**
         * 获取当前文章id
         */
        getArticleId: function (callback) {
            var result = tools.getUrlArgs();
            if ($.isEmptyObject(result.data)) {
                console.error('页面缺少必要的参数');
            } else {
                result.data.docId && (vm.docId = result.data.docId);
                result.data.materialId && result.data.materialId !== 'null' && (vm.materialId = result.data.materialId);
                result.data.articleId
                    ? (vm.articleId = result.data.articleId)
                    : console.error('页面缺少必要的参数: 文档ID: articleId');
                typeof callback === 'function' && callback.call(this);
            }
        },
        /**
         * 获取文章详情
         */
        getArticleInfo: function (callback) {
            var _this = this;
            var loadingIndex;
            tools.ajax({
                url: ajaxurl.material.article,
                data: {
                    material_document_article_id: vm.articleId
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loadingIndex = indexs
                    })
                },
                success: function (res) {
                    if (res.code === 1) {
                        vm.title = res.data.title;
                        vm.updateTime = res.data.update_time;
                        vm.author = res.data.operate_real_name;
                        vm.catalog = res.data.type_name || '--';
                        vm.keywords = res.data.keywords ? res.data.keywords.split(',') : [];
                        vm.htmlContent = res.data.info;
                        vm.attachList = res.data.attachment || [];
                        // 遍历附件列表, 处理样式
                        vm.attachList.forEach(function (item) {
                            item.attach_style = _this.transferSuffix(item.attach_suffix)
                        });
                        typeof callback === 'function' && callback.call(this);
                    } else {
                        layers.toast(res.message);
                    }
                },
                complete: function () {
                    setTimeout(function () {
                        layers.closed(loadingIndex)
                    }, 200)
                }
            });
        },
        /**
         * 附件文件类型处理
         */
        transferSuffix: function (sfx) {
            /*  附件类型处理:
                type  suffix      description
                ------------------------------
                1     zip         icon-zip
                2     doc|docx    icon-doc
                3     png|jpg     icon-tupian
                4     ppt         icon-ppt
                5     xls|xlsx    icon-excel
                6     other       icon-wendang
            */
            var result;
            switch (sfx) {
                case 'zip':
                    result = 'icon-zip';
                    break;
                case 'doc':
                    result = 'icon-doc';
                    break;
                case 'docx':
                    result = 'icon-doc';
                    break;
                case 'png':
                    result = 'icon-tupian';
                    break;
                case 'jpg':
                    result = 'icon-tupian';
                    break;
                case 'ppt':
                    result = 'icon-ppt';
                    break;
                case 'xls':
                    result = 'icon-excel';
                    break;
                case 'xlsx':
                    result = 'icon-excel';
                    break;
                case 'other':
                    result = 'icon-wendang';
                    break;
                default:
                    result = 'icon-wendang';
            }
            return result;
        },
        /**
         * 附件下载
         */
        downAttach: function (id) {
            var loadingIndex;
            tools.ajax({
                url: ajaxurl.material.attachDownload,
                data: {
                    attach_id: id
                },
                type: 'post',
                beforeSend: function () {
                    layers.load(function (indexs) {
                        loadingIndex = indexs
                    })
                },
                success: function (res) {
                    if (res.code === 1) {
                        // 这样处理避免图片直接打开了
                        var a = document.createElement('a');
                        a.download = true;
                        a.href = res.data;
                        a.click();
                    } else {
                        layers.toast(res.message);
                    }
                },
                complete: function () {
                    setTimeout(function () {
                        layers.closed(loadingIndex)
                    }, 200)
                }
            });
        }
    };


    /**
     * 实例化 ViewModel
     */
    var vm = new Vue({
        el: '#app',
        data: {
            articleId: '',
            materialId: '',
            docId: '',
            title: '',
            author: '',
            updateTime: '',
            catalog: '',
            keywords: [],
            htmlContent: '',
            attachList: []
        },
        methods: {
            goBack: function () {
                if (this.docId && this.materialId) {
                    var baseUrl = '/admin/material/material_document';
                    window.location.href = baseUrl + '?docId=' + this.docId + '&materialId=' + this.materialId;
                } else {
                    window.history.go(-1);
                }
            },
            downAttach: function (id) {
                main.downAttach(id);
            }
        }
    });


    /**
     * 初始化
     * @private
     */
    var _init = function () {
        main.getArticleId(function () {
            main.getArticleInfo();
        });
        common.getTabLink();
    };
    _init();
});

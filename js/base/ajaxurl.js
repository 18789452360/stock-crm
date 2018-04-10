define(function () {
    var baseUrl = window.baseUrl, protocol = window.location.protocol;//获取http头;
    if (baseUrl == null || baseUrl == undefined || baseUrl == '') {
        baseUrl = window.location.origin ? window.location.origin : protocol + '//' + window.location.host;
    }
    var newBaseUrl = window.APIURL;
    var domain_product = newBaseUrl + '/admin/product/',
        domain_material = newBaseUrl + '/admin/material/',
        domain_group = newBaseUrl + '/admin/group/',
        domain_cooper = newBaseUrl + '/admin/cooper/',
        domain_examination = newBaseUrl + '/admin/examination/',
        domain_financial = newBaseUrl + '/admin/financial/',
        domain_examine = newBaseUrl + '/admin/examine/',
        domain_contract = newBaseUrl + '/admin/contract/',
        domain_visit = newBaseUrl + '/admin/visit/',
        domain_complain = newBaseUrl + '/admin/complain/',
        domain_customer = newBaseUrl + '/admin/customers/',
        domain_customer_cooper = newBaseUrl + '/admin/cooper/customer_cooper_situation/',
        domain_custom_group = newBaseUrl + '/admin/group/employee_custom_group/',
        domain_sms = newBaseUrl + '/admin/sms/sms',
        domain_statistics = newBaseUrl + '/admin/statistics',
        achStatistics = newBaseUrl + '/admin/statistics/performance_statistics',
        service = newBaseUrl + '/admin/service/service_record/';
    return {
        BaseUrl: baseUrl, //当前系统URL
        //---------------------------------------- CRM_Product.html --------------------------------------
        product: {
            //-------------------CRM系统的产品系列接口----------
            index: newBaseUrl + '?c=product&a=index',
            add: newBaseUrl + '?c=product&a=add',
            getProductDetail: newBaseUrl + '?c=product&a=getProductDetail',
            editPost: newBaseUrl + '?c=product&a=editPost',
            deleteProduct: newBaseUrl + '?c=product&a=deleteProduct',
            outProduct: newBaseUrl + '?c=product&a=outProduct',
            productLog: newBaseUrl + '?c=product&a=productLog',
            deleteProductStock: newBaseUrl + '?c=productStock&a=deleteProductStock',
            editProductStock: newBaseUrl + '?c=productStock&a=editProductStock'
        },
        productStock: {
            //-------------------CRM系统的标的系列接口-----------
            index: newBaseUrl + '?c=product_stock&a=index',
            add: newBaseUrl + '?c=product_stock&a=add',
            delete: newBaseUrl + '?c=product_stock&a=delete',
            edit: newBaseUrl + '?c=product_stock&a=edit',
            detail: newBaseUrl + '?c=product_stock&a=detail',
            outProductStock: newBaseUrl + '?c=product_stock&a=outProductStock',
            logList: newBaseUrl + '?c=product_stock&a=logList',
            getAllStock: newBaseUrl + '?c=product_stock&a=getAllStock',
            getOneStock: newBaseUrl + '?c=product_stock&a=getOneStock'
        },
        productReport: {
            //------------------CRM系统的标的研报系列接口
            add: newBaseUrl + '?c=product_report&a=add',
            findProductReportById: newBaseUrl + '?c=product_report&a=findProductReportById',
            delete: newBaseUrl + '?c=product_report&a=deleteProductReport',
            editProductReport: newBaseUrl + '?c=product_report&a=editProductReport',
            downAttachment: '/admin/product/product_report/down_attachment',
            ftp_upload: baseUrl + '/admin/Ajax/ftp_upload?upload_dir=down_attachment&is_attach_upload=1'
        },
        productTransfer: {
            //-------------------CRM系统的调仓记录系列接口
            add: newBaseUrl + '?c=product_transfer&a=add',
            delete: newBaseUrl + '?c=product_transfer&a=delete',
            editDataFind: newBaseUrl + '?c=product_transfer&a=editDataFind',
            editPost: newBaseUrl + '?c=product_transfer&a=editPost'
        },
        productSuggest: {
            //------------------CRM系统的建议话术系列接口
            add: newBaseUrl + '?c=product_suggest_content&a=add',
            editData: newBaseUrl + '?c=product_suggest_content&a=editData',
            delete: newBaseUrl + '?c=product_suggest_content&a=delete',
            edit: newBaseUrl + '?c=product_suggest_content&a=edit'
        },
        material: {
            //------------------CRM系统的资料库系列接口
            index: newBaseUrl + '?c=material&a=index',
            add: newBaseUrl + '?c=material&a=add',
            findInfoById: newBaseUrl + '?c=material&a=findInfoById',
            edit: newBaseUrl + '?c=material&a=edit',
            delete: newBaseUrl + '?c=material&a=delete',
            addDocItem: newBaseUrl + '?c=materialDocument&a=add',
            delDocItem: newBaseUrl + '?c=materialDocument&a=delete',
            docList: newBaseUrl + '?c=materialDocument&a=index',
            editDocItem: newBaseUrl + '?c=materialDocument&a=edit',
            addDocCategory: newBaseUrl + '?c=materialDocument&a=categoryAdd',
            docCategoryList: newBaseUrl + '?c=materialDocument&a=categoryIndex',
            delCategoryItem: newBaseUrl + '?c=materialDocument&a=categoryDelete',
            editCategoryItem: newBaseUrl + '?c=materialDocument&a=categoryEdit',
            delDocArticle: newBaseUrl + '?c=materialDocumentArticle&a=delete',
            attachList: newBaseUrl + '?c=materialDocument&a=attach_list',
            logList: newBaseUrl + '?c=material&a=getLogList',
            addDcItem: newBaseUrl + '?c=materialDocumentArticle&a=add',
            editDcItem: newBaseUrl + '?c=materialDocumentArticle&a=edit',
            article: newBaseUrl + '?c=materialDocumentArticle&a=findInfoById',
            delAttach: newBaseUrl + '?c=materialDocument&a=delAttach',
            docImgUpload: baseUrl + '/admin/Ajax/ftp_layui_upload?upload_dir=material_image',// layUI编辑器图片插入接口
            docAttachUpload: baseUrl + '/admin/Ajax/ftp_upload?upload_dir=material_attach&is_attach_upload=1',// 资料库文档附件上传
            attachDownload: baseUrl + '/admin/material/material/down'

        },
        materialDocument: {
            //------------------CRM系统的文档库系列接口
            add: newBaseUrl + '?c=materialDocument&a=add',
            findInfoById: newBaseUrl + '?c=materialDocument&a=findInfoById',
            edit: newBaseUrl + '?c=materialDocument&a=edit',
            delete: newBaseUrl + '?c=materialDocument&a=delete',
            index: newBaseUrl + '?c=materialDocument&a=index'
        },
        materialDocumentArticle: {
            //------------------CRM系统的文档系列接口 and CRM系统的文档附件系列接口
            add: newBaseUrl + '?c=materialDocumentArticle&a=add',
            delete: newBaseUrl + '?c=materialDocumentArticle&a=delete',
            findInfoById: newBaseUrl + '?c=materialDocumentArticle&a=findInfoById',
            edit: newBaseUrl + '?c=materialDocumentArticle&a=edit',
            selectAttachmentAll: newBaseUrl + '?c=materialDocumentArticle&a=selectAttachmentAll' //CRM系统的文档附件系列接口
        },
        upload: {
            //-----------------CRM系统的上传系列接口
            ftp_upload: baseUrl + '/admin/Ajax/ftp_upload?upload_dir=employee_image',
            deleteOssFile: baseUrl + '/admin/Ajax/deleteOssFile',
            importCSV: baseUrl + '/admin/customers/customer/import'
        },
        //----------------------------------------- 群组，跟进记录，审核等接口文档.html ------------------
        group: {
            //---------------- 群组管理
            index: newBaseUrl + '?c=group&a=index',
            add: newBaseUrl + '?c=group&a=add',
            view: newBaseUrl + '?c=group&a=view',
            edit: newBaseUrl + '?c=group&a=edit',
            del: newBaseUrl + '?c=group&a=delete',
            add_member: newBaseUrl + '?c=group&a=add_member_by_group',
            get_member: newBaseUrl + '?c=group&a=get_member'
        },
        cooper: {
            //---------------- 跟进记录
            index: newBaseUrl + '?c=followup_record&a=index',
            add: newBaseUrl + '?c=followup_record&a=add',
            edit: newBaseUrl + '?c=followup_record&a=edit',
            getEdit: newBaseUrl + '?c=followup_record&a=edit_view',//获取需要编辑的跟进记录信息
            del: newBaseUrl + '?c=followup_record&a=delete',
            follow_type:newBaseUrl + '?c=followup_record&a=follow_type',
        },
        examination: {
            //---------------- 审批
            mysubmit: newBaseUrl + '?c=my_audit&a=my_submit',
            mymodify: newBaseUrl + '?c=my_audit&a=my_modify',
            alllist: newBaseUrl + '?c=my_audit&a=all_list',
            delcooper: newBaseUrl + '?c=my_audit&a=del_cooper'

        },
        financial: {
            //--------------- 财务审核
            financial_list: newBaseUrl + '?c=financial&a=financial_list',
            financial_record_list: newBaseUrl + '?c=financial&a=financial_record_list',
            financial_view: newBaseUrl + '?c=financial&a=financial_view',
            financial_post: newBaseUrl + '?c=financial&a=financial_post'
        },
        examine: {
            //--------------  质检
            examine_list: newBaseUrl + '?c=examine&a=examine_list',
            examine_record_list: newBaseUrl + '?c=examine&a=examine_record_list',
            examine_view: newBaseUrl + '?c=examine&a=examine_view',
            examine_post: newBaseUrl + '?c=examine&a=examine_post'
        },
        contract: {
            //-------------- 合同
            contract_list: newBaseUrl + '?c=contract&a=contract_list',
            contract_record_list: newBaseUrl + '?c=contract&a=contract_record_list',
            contract_view: newBaseUrl + '?c=contract&a=contract_view',
            contract_add: newBaseUrl + '?c=contract&a=contract_add',
            contract_edit: newBaseUrl + '?c=contract&a=contract_edit',
            contract_post: newBaseUrl + '?c=contract&a=contract_post',
            exports: domain_contract + 'contract/contract/export'
        },
        visit: {
            //------------- 回访
            list: newBaseUrl + '?c=visit&a=visit_list',
            record_list: newBaseUrl + '?c=visit&a=visit_record_list',
            visit_view: newBaseUrl + '?c=visit&a=visit_view',
            visit_post: newBaseUrl + '?c=visit&a=visit_post'
        },
        complain: {
            //-------------- 投诉
            list: newBaseUrl + '?c=complain&a=complain_list',
            record: newBaseUrl + '?c=complain&a=complain_record',
            add: newBaseUrl + '?c=complain&a=complain_add',
            view: newBaseUrl + '?c=complain&a=complain_view',
            post: newBaseUrl + '?c=complain&a=complain_post'
        },
        //-----------------------------------------  Crmcustomer.html -------------------------------------
        customer: {
            //---------------- 员工
            add: newBaseUrl + '?c=customer&a=add',
            update: newBaseUrl + '?c=customer&a=update',
            import: newBaseUrl + '?c=customer&a=import',
            getList: newBaseUrl + '?c=customer&a=get_list',
            getListLeft: newBaseUrl + '?c=customer&a=get_list_left',
            getListTagMark: newBaseUrl + '?c=customer&a=get_list_tag_mark',
            getInfo: newBaseUrl + '?c=customer&a=get_info',
            getDetail: newBaseUrl + '?c=customer&a=get_detail',
            check: newBaseUrl + '?c=customer&a=check_customer_contact',
            getArea: newBaseUrl + '?c=customer&a=get_area',
            addRemark: newBaseUrl + '?c=employee_custom_mark&a=customer_add',
            delRemark: newBaseUrl + '?c=employee_custom_mark&a=del',
            delCustomer: newBaseUrl + '?c=customer&a=delete_customer',
            movePool: newBaseUrl + '?c=customer&a=move_customer_to_pool',
            clearPool: newBaseUrl + '?c=customer&a=batch_delete_customer_pool',
            moveGroup: newBaseUrl + '?c=customer&a=move_customer_group',
            shareUsr: newBaseUrl + '?c=customer&a=share_customer',
            moveUsr: newBaseUrl + '?c=customer&a=transfer_customer',
            gainRemark: newBaseUrl + '?c=employee_custom_mark&a=custom_mark',
            getPoolList: newBaseUrl + '?c=customer&a=get_in_customer_pool',
            operationLog: newBaseUrl + '?c=customer_operation_log&a=search',
            customerAlloc: newBaseUrl + '?c=customer&a=customer_allocation',
            remarkDelDiff: newBaseUrl + '?c=employee_custom_mark&a=deldiff',
            getCustomerMobile: newBaseUrl + '?c=customer&a=get_customer_mobile',
            CustomerTote: newBaseUrl + '?c=customer&a=get_employee_customer_tj',
            getCustomerGroup: newBaseUrl + '?c=customer&a=get_customer_group',
            getAllNum: newBaseUrl + '?c=customer&a=getAllNum',
            getEcTag: newBaseUrl + '?c=customer&a=get_tag_all',
            getRelation: newBaseUrl + '?c=customer&a=get_bundling_list',
            delRelation: newBaseUrl + '?c=customer&a=delete_customer',
            checkBuildWithSeatNum: newBaseUrl + '/?c=customer&a=checkBuildWithSeatNum'
        },
        //----------------------------------------- CrmCustomerCooperSituation.html -------------------------
        customer_cooper: {
            //------------------- 客户
            add: newBaseUrl + '?c=customer_cooper_situation&a=add',
            getList: newBaseUrl + '?c=customer_cooper_situation&a=get_list',
            update: newBaseUrl + '?c=customer_cooper_situation&a=update',
            detail: newBaseUrl + '?c=customer_cooper_situation&a=detail',
            orderList: newBaseUrl + '?c=customer_cooper_situation&a=get_order_list',
            memberCompliance: newBaseUrl + '?c=customer_cooper_situation&a=get_compliance_status',
            checkAddCooperSituation: newBaseUrl + '?c=customer&a=check_add_cooper_situation',
            endcooper:newBaseUrl +'?c=customer_cooper_situation&a=endOffLineCooper'
        },
        //---------------------------------------- CrmEmployeeCustomGroup.html ------------------------------
        customer_group: {
            //----------------- 员工分组管理
            add: newBaseUrl + '?c=employee_custom_group&a=add',
            getList: newBaseUrl + '?c=employee_custom_group&a=get_list',
            checkNameUnique: newBaseUrl + '?c=employee_custom_group&a=check_name_unique',
            update: newBaseUrl + '?c=employee_custom_group&a=update',
            delete: newBaseUrl + '?c=employee_custom_group&a=delete',
            checkHasCustomer: newBaseUrl + '?c=employee_custom_group&a=check_has_customer'
        },
        //---------------------------------------- CRM_Auth.html -------------------------------------------------
        login: {
            //-------------------- CRM系统登录接口
            login: baseUrl + '/admin/index/login',
            logout: baseUrl + '/admin/index/logout'
        },
        auth: {
            //--------------------- CRM系统权限组接口
            addGroup: baseUrl + '/admin/auth/group/addGroup',
            delGroup: baseUrl + '/admin/auth/group/delGroup',
            selectOneGroup: baseUrl + '/admin/auth/group/selectOneGroup',
            index: baseUrl + '/admin/auth/group/index',
            editGroup: baseUrl + '/admin/auth/group/editGroup',
            roleGroup: baseUrl + '/admin/auth/group/roletree',
            dataGroup: baseUrl + '/admin/auth/group/datatree',
            seeGroup: baseUrl + '/admin/auth/group/seeGroup',
            limitUser: baseUrl + '/admin/auth/group/limitUser',
            addLimit: baseUrl + '/admin/auth/group/addLimit',
            rmLimit: baseUrl + '/admin/auth/group/rmLimit'
        },
        user: {
            //------------------- CRM系统员工接口
            addUser: baseUrl + '/admin/user/addUser',
            editUser: baseUrl + '/admin/user/editUser',
            editUserIndex: baseUrl + '/admin/user/editUserIndex',
            selectOneUser: baseUrl + '/admin/user/selectOneUser',
            showIndex: baseUrl + '/admin/user/showIndex',
            stopUser: baseUrl + '/admin/user/stopUser',
            delUser: baseUrl + '/admin/user/delUser',
            startUser: baseUrl + '/admin/user/startUser',
            editPassword: baseUrl + '/admin/user/editPassword',
            verifyPwd: baseUrl + '/admin/user/verifyPwd',
            index: baseUrl + '/admin/user/index',
            addUserAuth: baseUrl + '/admin/user/addUserAuth',
            oneUser: baseUrl + '/admin/user/oneuser',
            getBasic: baseUrl + '/admin/user/getBasic',
            selectUserAuth: baseUrl + '/admin/user/selectUserAuth',
            import: baseUrl + '/admin/user/import',
            checkUsername: baseUrl + '/admin/user/checkUsername'
        },
        position: {
            //--------------------- CRM职位管理接口
            add: baseUrl + '/admin/Position/addPosition',
            del: baseUrl + '/admin/Position/delPosition',
            index: baseUrl + '/admin/Position/index',
            indexPosition: baseUrl + '/admin/Position/indexPosition',
            selectOne: baseUrl + '/admin/Position/selectOnePosition',
            addRank: baseUrl + '/admin/Position/addRank', // CRM职级管理接口
            edit: baseUrl + '/admin/Position/editPosition' // CRM职级管理接口
        },
        grade: {
            //------------------ CRM职级管理接口
            edit: baseUrl + '/admin/Grade/editGrade',
            del: baseUrl + '/admin/Grade/delGrade',
            selectOneGrade: baseUrl + '/admin/Grade/selectOneGrade',
            index: baseUrl + '/admin/Grade/index',
            indexGrade: baseUrl + '/admin/Grade/indexGrade',
            add: baseUrl + '/admin/Grade/addGrade'
        },
        department: {
            //------------------- CRM系统部门管理
            add: baseUrl + '/admin/Department/addBranch',
            edit: baseUrl + '/admin/Department/editBranch',
            index: baseUrl + '/admin/Department/index',
            selectDown: baseUrl + '/admin/Department/selectDown',
            del: baseUrl + '/admin/Department/delBranch',
            addDown: baseUrl + '/admin/Department/addDown',
            getdepartment: baseUrl + '/admin/department/getdepartment',
            editDepartment: baseUrl + '/admin/department/editDepartment',
            getTree: baseUrl + '/admin/department/getTree',
            getAll: baseUrl + '/admin/role/getAll',
            authAdd: baseUrl + '/admin/role/add',
            authEdit: baseUrl + '/admin/role/edit',
            indexdata: baseUrl + '/admin/role/indexdata',
            getdata: baseUrl + '/admin/role/getdata',
            adddata: baseUrl + '/admin/role/adddata',
            editdata: baseUrl + '/admin/role/editdata',
            getdataone: baseUrl + '/admin/role/getdataone'
        },
        //-------------------------- 标签管理
        tag: {
            index: newBaseUrl + '?c=tag&a=index',
            determine: newBaseUrl + '?c=tag&a=determine',
            choice: newBaseUrl + '?c=tag&a=choice',
            guest: newBaseUrl + '?c=tag&a=guest',//获取单个客户标签
        },
        //----------------------- 备注管理
        remarks: {
            add: newBaseUrl + '?c=employee_custom_mark&a=add',
            index: newBaseUrl + '?c=employee_custom_mark&a=index',
            search: newBaseUrl + '?c=employee_custom_mark&a=search',
            num: newBaseUrl + '?c=employee_custom_mark&a=num',
            del: newBaseUrl + '?c=employee_custom_mark&a=del',
            delown: newBaseUrl + '?c=employee_custom_mark&a=delown',
            archives: newBaseUrl + '?c=employee_custom_mark&a=archives',
            hit: newBaseUrl + '?c=employee_custom_mark&a=hit',
            del_coo_mark: newBaseUrl + '?c=employee_custom_mark&a=del_coo_mark',
        },
        //-------------------------------------------------消息系统domain_sms---------------------------------------------------------
        sms: {
            List: newBaseUrl + '?c=sms&a=list',//
            big: newBaseUrl + '?c=sms&a=group',
            small: newBaseUrl + '?c=sms&a=songroup',
            all: newBaseUrl + '?c=sms&a=getall_one',
            delUnread: newBaseUrl + '?c=sms&a=del_noread',
            delGroup: newBaseUrl + '?c=sms&a=del_relation',
            allview: newBaseUrl + '?c=sms&a=getnoread',
        },
        //------------------------------------ CrmGlobalSet.html  ---------------------------
        setting: {
            //----------------- 全局配置
            index: newBaseUrl + '?c=setting&a=index',//配置页面
            determine: newBaseUrl + '?c=setting&a=operation',//客户来源/线下提交数据接口
            sourceDele: newBaseUrl + '?c=setting&a=del_source',//客户来源编辑/
            sourceCheck: newBaseUrl + '?c=setting&a=check_del',//客户来源检测/
            sourceEdit: newBaseUrl + '?c=setting&a=edit_source',//客户来源编辑/
            sourceView: newBaseUrl + '?c=setting&a=back_source',//客户来源展示/
            subonline: newBaseUrl + '?c=setting&a=edit_online',//线上提交数据接口
            subfollow: newBaseUrl + '?c=setting&a=edit_type',//跟进提交数据接口
            subpayee: newBaseUrl + '?c=setting&a=edit_acc',//收款提交数据接口
            subprocess: newBaseUrl + '?c=setting&a=edit_sales',//销售提交数据接口
            payee: newBaseUrl + '?c=setting&a=payee',//删除收款方接口
            online: newBaseUrl + '?c=setting&a=upper',//线上接口
            line: newBaseUrl + '?c=product&a=index&product_status=1&name=create_time&type=asc&pagesize=100000000',//线下数据信息
            editline: newBaseUrl + '?c=setting&a=editOffline',//线下数据信息
            getDataAuth:newBaseUrl + '?c=customer&a=getdataauth',//获取该员工的数据权限 list返回的是该员工没有的权限，有的权限不做返回
            getDataAuth:newBaseUrl + '?c=customer&a=getdataauth',//获取该员工的数据权限 list返回的是该员工没有的权限，有的权限不做返回
            backNotice:newBaseUrl + '?c=setting&a=backNotice',//展示设置的通知对象
            updateNotice:newBaseUrl + '?c=setting&a=updateNotice',//配置通知对象
            choiceNotice:newBaseUrl + '?c=setting&a=choice',//选择通知对象
        },
        //----------------------------------  IVR电话系列接口 -------------------
        ivr: {
            call: newBaseUrl + '?c=call&a=call', //拨打电话
            getCallRecord: newBaseUrl + '?c=call&a=getCallRecord', // [浮层通话助手] 通话记录列表
            getCallRecordAll: newBaseUrl + '?c=call&a=getCallRecordAll', // 获取最近联系电话列表  1为所有通话记录 2为绑定用户 3为自己
            getBindingCount: newBaseUrl + '?c=call&a=getCount', // 绑定记录总条数
            getCallRecordAllCount: newBaseUrl + '?c=call&a=getcountall', // 所有记录总条数
            deleteRecord: newBaseUrl + '?c=call&a=deleteRecord', //删除通话记录
            getEmployeeWithCustomer: newBaseUrl + '?c=call&a=getEmployeeWithCustomer', //获取录音记录
            initIvr: newBaseUrl + '?c=call&a=init', //初始化IVR
            getCallRecordCount: newBaseUrl + '?c=call&a=getCallRecordCount' // 通话统计
        },
        //----------------------------------  销售业绩统计系列接口 -------------------
        achStatistics: {
            personallook: newBaseUrl + '?c=performance_statistics&a=personallook',//个人业绩查询展示
            teamlook: newBaseUrl + '?c=performance_statistics&a=teamlook',//loadStatistics个人业绩查询展示
            source: newBaseUrl + '?c=customer&a=customer_source',//loadStatistics全局设置返回某一配置
        },
        //--------------------------------- 项目、服务统计系列接口 ---------------------
        statistics:{
            project:newBaseUrl + '?c=statistics&a=project',//项目统计
            service:newBaseUrl + '?c=statistics&a=service',//服务统计
        },
        //----------------------------------  销售工作量统计系列接口 -------------------
        //----------------------------------   服务记录接口 -------------------
        service: {
            index: newBaseUrl + '?c=service_record&a=criterion',// 服务记录查询展示
        },
         //----------------------------------  投诉管理接口 -------------------
        complaint: {
            myList: newBaseUrl + '?c=complaint&a=my_complaint',//我（某个员工）的投诉记录
            recordList: newBaseUrl + '?c=complaint&a=complaint_record&flag=1',//待处理投诉
            allList: newBaseUrl + '?c=complaint&a=complaint_record&flag=2',//全部投诉记录
            delcomplaint: newBaseUrl + '?c=complaint&a=delcomplaint',//删除投诉记录
            start: newBaseUrl + '?c=complaint&a=start_complaint',//发起投诉
            details: newBaseUrl + '?c=complaint&a=complaint_details',//投诉详情  
            solve: newBaseUrl + '?c=complaint&a=solve_complaint',//投诉处理
            edit: newBaseUrl + '?c=complaint&a=edit_complaint',//投诉编辑
            record: newBaseUrl + '?c=complaint&a=solve_details',//处理记录详情
        },
    }
});

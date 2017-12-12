define(function () {
    var baseUrl = window.baseUrl, protocol = window.location.protocol;//获取http头;
    if (baseUrl == null || baseUrl == undefined || baseUrl == '') {
        baseUrl = window.location.origin ? window.location.origin : protocol + '//' + window.location.host;
    }
    var domain_product = baseUrl + '/admin/product/',
        domain_material = baseUrl + '/admin/material/',
        domain_group = baseUrl + '/admin/group/',
        domain_cooper = baseUrl + '/admin/cooper/',
        domain_examination = baseUrl + '/admin/examination/',
        domain_financial = baseUrl + '/admin/financial/',
        domain_examine = baseUrl + '/admin/examine/',
        domain_contract = baseUrl + '/admin/contract/',
        domain_visit = baseUrl + '/admin/visit/',
        domain_complain = baseUrl + '/admin/complain/',
        domain_customer = baseUrl + '/admin/customers/',
        domain_customer_cooper = baseUrl + '/admin/cooper/customer_cooper_situation/',
        domain_custom_group = baseUrl + '/admin/group/employee_custom_group/',
        domain_sms = baseUrl + '/admin/sms/sms',
        achStatistics = baseUrl + '/admin/statistics/performance_statistics';
        service = baseUrl + '/admin/service/service_record/';
    return {
        BaseUrl: baseUrl, //当前系统URL
        //---------------------------------------- CRM_Product.html --------------------------------------
        product: {
            //-------------------CRM系统的产品系列接口----------
            index: domain_product + 'product/crmAdmin?c=product&a=index',
            add: domain_product + 'product/crmAdmin?c=product&a=add',
            getProductDetail: domain_product + 'product/crmAdmin?c=product&a=getProductDetail',
            editPost: domain_product + 'product/crmAdmin?c=product&a=editPost',
            deleteProduct: domain_product + 'product/crmAdmin?c=product&a=deleteProduct',
            outProduct: domain_product + 'product/crmAdmin?c=product&a=outProduct',
            productLog: domain_product + 'product/crmAdmin?c=product&a=productLog',
            deleteProductStock: domain_product + 'ProductStock/crmAdmin?c=productStock&a=deleteProductStock',
            editProductStock: domain_product + 'ProductStock/crmAdmin?c=productStock&a=editProductStock'
        },
        productStock: {
            //-------------------CRM系统的标的系列接口-----------
            index: domain_product + 'product_stock/crmAdmin?c=product_stock&a=index',
            add: domain_product + 'product_stock/crmAdmin?c=product_stock&a=add',
            delete: domain_product + 'product_stock/crmAdmin?c=product_stock&a=delete',
            edit: domain_product + 'product_stock/crmAdmin?c=product_stock&a=edit',
            detail: domain_product + 'product_stock/crmAdmin?c=product_stock&a=detail',
            outProductStock: domain_product + 'product_stock/crmAdmin?c=product_stock&a=outProductStock'
        },
        productReport: {
            //------------------CRM系统的标的研报系列接口
            add: domain_product + 'product_report/crmAdmin?c=product_report&a=add',
            findProductReportById: domain_product + 'product_report/crmAdmin?c=product_report&a=findProductReportById',
            deleteProductReportOp: domain_product + 'product_report/crmAdmin?c=product_report&a=deleteProductReportOp',
            editProductReport: domain_product + 'product_report/crmAdmin?c=product_report&a=editProductReport'
        },
        productTransfer: {
            //-------------------CRM系统的调仓记录系列接口
            add: domain_product + 'product_transfer/crmAdmin?c=product_transfer&a=add',
            delete: domain_product + 'product_transfer/crmAdmin?c=product_transfer&a=delete',
            editDataFind: domain_product + 'product_transfer/crmAdmin?c=product_transfer&a=editDataFind',
            editPost: domain_product + 'product_transfer/crmAdmin?c=product_transfer&a=editPost'
        },
        productSuggest: {
            //------------------CRM系统的建议话术系列接口
            add: domain_product + 'product_suggestcontent/crmAdmin?c=product_suggestContent&a=add',
            editData: domain_product + 'product_suggestcontent/crmAdmin?c=product_suggestContent&a=editData',
            delete: domain_product + 'product_suggestcontent/crmAdmin?c=product_suggestContent&a=delete',
            edit: domain_product + 'product_suggestcontent/crmAdmin?c=product_suggestContent&a=edit'
        },
        material: {
            //------------------CRM系统的资料库系列接口
            index: domain_material + 'material/crmAdmin?c=material&a=index',
            add: domain_material + 'material/crmAdmin?c=material&a=add',
            findInfoById: domain_material + 'material/crmAdmin?c=material&a=findInfoById',
            edit: domain_material + 'material/crmAdmin?c=material&a=edit',
            delete: domain_material + 'material/crmAdmin?c=material&a=delete'
        },
        materialDocument: {
            //------------------CRM系统的文档库系列接口
            add: domain_material + 'materialDocument/crmAdmin?c=materialDocument&a=add',
            findInfoById: domain_material + 'materialDocument/crmAdmin?c=materialDocument&a=findInfoById',
            edit: domain_material + 'materialDocument/crmAdmin?c=materialDocument&a=edit',
            delete: domain_material + 'materialDocument/crmAdmin?c=materialDocument&a=delete',
            index: domain_material + 'materialDocument/crmAdmin?c=materialDocument&a=index'
        },
        materialDocumentArticle: {
            //------------------CRM系统的文档系列接口 and CRM系统的文档附件系列接口
            add: domain_material + 'materialDocumentArticle/crmAdmin?c=materialDocumentArticle&a=add',
            delete: domain_material + 'materialDocumentArticle/crmAdmin?c=materialDocumentArticle&a=delete',
            findInfoById: domain_material + 'materialDocumentArticle/crmAdmin?c=materialDocumentArticle&a=findInfoById',
            edit: domain_material + 'materialDocumentArticle/crmAdmin?c=materialDocumentArticle&a=edit',
            selectAttachmentAll: domain_material + 'materialDocumentArticle/crmAdmin?c=materialDocumentArticle&a=selectAttachmentAll' //CRM系统的文档附件系列接口
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
            index: domain_group + 'file_group/indexs?c=group&a=index',
            add: domain_group + 'file_group/adds?c=group&a=add',
            view: domain_group + 'file_group/views?c=group&a=view',
            edit: domain_group + 'file_group/edits?c=group&a=edit',
            del: domain_group + 'file_group/deletes?c=group&a=delete',
            add_member: domain_group + 'file_group/indexs?c=group&a=add_member_by_group',
            get_member: domain_group + 'file_group/indexs?c=group&a=get_member'
        },
        cooper: {
            //---------------- 跟进记录
            index: domain_cooper + 'followup_record/indexs?c=followup_record&a=index',
            add: domain_cooper + 'followup_record/adds?c=followup_record&a=add',
            edit: domain_cooper + 'followup_record/edits?c=followup_record&a=edit',
            getEdit: domain_cooper + 'followup_record/edits?c=followup_record&a=edit_view',//获取需要编辑的跟进记录信息
            del: domain_cooper + 'followup_record/deletes?c=followup_record&a=delete',
            follow_type:domain_cooper + 'followup_record/deletes?c=followup_record&a=follow_type',
        },
        examination: {
            //---------------- 审批
            mysubmit: domain_examination + 'my_audit/my_submits?c=my_audit&a=my_submit',
            mymodify: domain_examination + 'my_audit/my_modifys?c=my_audit&a=my_modify',
            alllist: domain_examination + 'my_audit/all_lists?c=my_audit&a=all_list',
            //delcooper: domain_examination + 'my_audit/del_coopers?c=my_audit&a=del_cooper'
        },
        financial: {
            //--------------- 财务审核
            financial_list: domain_financial + 'financial/financial_lists?c=financial&a=financial_list',
            financial_record_list: domain_financial + 'financial/financial_record_lists?c=financial&a=financial_record_list',
            financial_view: domain_financial + 'financial/financial_views?c=financial&a=financial_view',
            financial_post: domain_financial + 'financial/financial_posts?c=financial&a=financial_post'
        },
        examine: {
            //--------------  质检
            examine_list: domain_examine + 'examine/examine_lists?c=examine&a=examine_list',
            examine_record_list: domain_examine + 'examine/examine_record_lists?c=examine&a=examine_record_list',
            examine_view: domain_examine + 'examine/examine_views?c=examine&a=examine_view',
            examine_post: domain_examine + 'examine/examine_posts?c=examine&a=examine_post'
        },
        contract: {
            //-------------- 合同
            contract_list: domain_contract + 'contract/contract_lists?c=contract&a=contract_list',
            contract_record_list: domain_contract + 'contract/contract_record_lists?c=contract&a=contract_record_list',
            contract_view: domain_contract + 'contract/contract_views?c=contract&a=contract_view',
            contract_add: domain_contract + 'contract/contract_adds?c=contract&a=contract_add',
            contract_edit: domain_contract + 'contract/contract_edits?c=contract&a=contract_edit',
            contract_post: domain_contract + 'contract/contract_posts?c=contract&a=contract_post',
            exports: domain_contract + 'contract/contract/export'
        },
        visit: {
            //------------- 回访
            list: domain_visit + 'visit/visit_lists?c=visit&a=visit_list',
            record_list: domain_visit + 'visit/visit_record_lists?c=visit&a=visit_record_list',
            visit_view: domain_visit + 'visit/visit_views?c=visit&a=visit_view',
            visit_post: domain_visit + 'visit/visit_posts?c=visit&a=visit_post'
        },
        complain: {
            //-------------- 投诉
            list: domain_complain + 'complain/complain_lists?c=complain&a=complain_list',
            record: domain_complain + 'complain/complain_records?c=complain&a=complain_record',
            add: domain_complain + 'complain/complain_adds?c=complain&a=complain_add',
            view: domain_complain + 'complain/complain_views?c=complain&a=complain_view',
            post: domain_complain + 'complain/complain_posts?c=complain&a=complain_post'
        },
        //-----------------------------------------  Crmcustomer.html -------------------------------------
        customer: {
            //---------------- 员工
            add: domain_customer + 'customer/crmAdmin?c=customer&a=add',
            update: domain_customer + 'customer/crmAdmin?c=customer&a=update',
            import: domain_customer + 'customer/crmAdmin?c=customer&a=import',
            getList: domain_customer + 'customer/crmAdmin?c=customer&a=get_list',
            getListLeft: domain_customer + 'customer/crmAdmin?c=customer&a=get_list_left',
            getListTagMark: domain_customer + 'customer/crmAdmin?c=customer&a=get_list_tag_mark',
            getInfo: domain_customer + 'customer/crmAdmin?c=customer&a=get_info',
            getDetail: domain_customer + 'customer/crmAdmin?c=customer&a=get_detail',
            check: domain_customer + 'customer/crmAdmin?c=customer&a=check_customer_contact',
            getArea: domain_customer + 'customer/crmAdmin?c=customer&a=get_area',
            addRemark: domain_customer + 'remarks/customer_add?c=employee_custom_mark&a=customer_add',
            delRemark: domain_customer + 'remarks/del?c=employee_custom_mark&a=del',
            delCustomer: domain_customer + 'customer/delete_customer?c=customer&a=delete_customer',
            movePool: domain_customer + 'customer/move_customer_to_pool?c=customer&a=move_customer_to_pool',
            clearPool: domain_customer + 'customer/batch_delete_customer_pool?c=customer&a=batch_delete_customer_pool',
            moveGroup: domain_customer + 'customer/move_customer_group?c=customer&a=move_customer_group',
            shareUsr: domain_customer + 'customer/share_customer?c=customer&a=share_customer',
            moveUsr: domain_customer + 'customer/transfer_customer?c=customer&a=transfer_customer',
            gainRemark: domain_customer + 'remarks/custom_mark?c=employee_custom_mark&a=custom_mark',
            getPoolList: domain_customer + 'customer/crmAdmin?c=customer&a=get_in_customer_pool',
            operationLog: domain_customer + 'customer_operation_log/getlist?c=customer_operation_log&a=search',
            customerAlloc: domain_customer + 'customer/customer_allocation?c=customer&a=customer_allocation',
            remarkDelDiff: domain_customer + 'remarks/deldiff?c=employee_custom_mark&a=deldiff',
            getCustomerMobile: domain_customer + 'remarks/deldiff?c=customer&a=get_customer_mobile',
            CustomerTote: domain_customer + 'customer/crmAdmin?c=customer&a=get_employee_customer_tj',
            getCustomerGroup : domain_customer + 'customer/crmAdmin?c=customer&a=get_customer_group',
            getAllNum : domain_customer + 'customer/crmAdmin?c=customer&a=getAllNum',
            getEcTag : domain_customer + 'customer/crmAdmin?c=customer&a=get_tag_all',
            getRelation : domain_customer + 'customer/crmAdmin?c=customer&a=get_bundling_list',
            delRelation : domain_customer + 'customer/delete_customer?c=customer&a=delete_customer'
        },
        //----------------------------------------- CrmCustomerCooperSituation.html -------------------------
        customer_cooper: {
            //------------------- 客户
            add: domain_customer_cooper + 'crmAdmin?c=customer_cooper_situation&a=add',
            getList: domain_customer_cooper + 'crmAdmin?c=customer_cooper_situation&a=get_list',
            update: domain_customer_cooper + 'crmAdmin?c=customer_cooper_situation&a=update',
            detail: domain_customer_cooper + 'crmAdmin?c=customer_cooper_situation&a=detail',
            orderList: domain_customer_cooper + 'crmAdmin?c=customer_cooper_situation&a=get_order_list',
            memberCompliance: domain_customer_cooper + 'crmAdmin?c=customer_cooper_situation&a=get_compliance_status',
            checkAddCooperSituation: domain_customer_cooper + 'crmAdmin?c=customer&a=check_add_cooper_situation',
        },
        //---------------------------------------- CrmEmployeeCustomGroup.html ------------------------------
        customer_group: {
            //----------------- 员工分组管理
            add: domain_custom_group + 'crmAdmin?c=employee_custom_group&a=add',
            getList: domain_custom_group + 'crmAdmin?c=employee_custom_group&a=get_list',
            checkNameUnique: domain_custom_group + 'crmAdmin?c=employee_custom_group&a=check_name_unique',
            update: domain_custom_group + 'crmAdmin?c=employee_custom_group&a=update',
            delete: domain_custom_group + 'crmAdmin?c=employee_custom_group&a=delete',
            checkHasCustomer: domain_custom_group + 'crmAdmin?c=employee_custom_group&a=check_has_customer'
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
            seeGroup: baseUrl + '/admin/auth/group/seeGroup '
        },
        user: {
            //------------------- CRM系统员工接口
            addUser: baseUrl + '/admin/user/addUser',
            editUser: baseUrl + '/admin/user/editUser',
            selectOneUser: baseUrl + '/admin/user/selectOneUser',
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
            import: baseUrl + '/admin/user/import'
        },
        position: {
            //--------------------- CRM职位管理接口
            add: baseUrl + '/admin/Position/addPosition',
            del: baseUrl + '/admin/Position/delPosition',
            index: baseUrl + '/admin/Position/index',
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
            index: baseUrl + '/admin/customers/tag/getlist?c=Tag&a=index',
            determine: baseUrl + '/admin/customers/tag/determine?c=Tag&a=determine',
            choice: baseUrl + '/admin/customers/tag/choice?c=Tag&a=choice',
            guest: baseUrl + '/admin/customers/tag/guest?c=Tag&a=guest',//获取单个客户标签
        },
        //----------------------- 备注管理
        remarks: {
            add: baseUrl + '/admin/customers/remarks/add?c=employee_custom_mark&a=add',
            index: baseUrl + '/admin/customers/remarks/getlist?c=employee_custom_mark&a=index',
            search: baseUrl + '/admin/customers/remarks/search?c=employee_custom_mark&a=search',
            num: baseUrl + '/admin/customers/remarks/num?c=employee_custom_mark&a=num',
            del: baseUrl + '/admin/customers/remarks/del?c=employee_custom_mark&a=del',
            delown: baseUrl + '/admin/customers/remarks/del?c=employee_custom_mark&a=delown',
            archives: baseUrl + '/admin/customers/remarks/archives?c=employee_custom_mark&a=archives',
            hit: baseUrl + '/admin/customers/remarks/hit?c=employee_custom_mark&a=hit',
            del_coo_mark: baseUrl + '/admin/customers/remarks/del_coo_mark?c=employee_custom_mark&a=del_coo_mark',
        },
        //-------------------------------------------------消息系统domain_sms---------------------------------------------------------
        sms: {
            List: domain_sms + '/lists?c=sms&a=list',//
            big: domain_sms + '/group?c=sms&a=group',
            small: domain_sms + '/songroup?c=sms&a=songroup',
            all: domain_sms + '/getallone?c=sms&a=getall_one',
            delUnread: domain_sms + '/delnoread?c=sms&a=del_noread',
            delGroup: domain_sms + '/delrelation?c=sms&a=del_relation',
            allview: domain_sms + '/lists?c=sms&a=getnoread',
        },
        //------------------------------------ CrmGlobalSet.html  ---------------------------
        setting: {
            //----------------- 全局配置
            index: baseUrl + '/admin/globalsetting/setting/getlist?c=setting&a=index',//配置页面
            determine: baseUrl + '/admin/globalsetting/setting/operation?c=setting&a=operation',//客户来源/线下提交数据接口
            sourceDele: baseUrl + '/admin/globalsetting/setting/del_source?c=setting&a=del_source',//客户来源编辑/
            sourceCheck: baseUrl + '/admin/globalsetting/setting/check_del?c=setting&a=check_del',//客户来源检测/
            sourceEdit: baseUrl + '/admin/globalsetting/setting/edit_source?c=setting&a=edit_source',//客户来源编辑/
            sourceView: baseUrl + '/admin/globalsetting/setting/back_source?c=setting&a=back_source',//客户来源展示/
            subonline: baseUrl + '/admin/globalsetting/setting/edit_online?c=setting&a=edit_online',//线上提交数据接口
            subfollow: baseUrl + '/admin/globalsetting/setting/edit_type?c=setting&a=edit_type',//跟进提交数据接口
            subpayee: baseUrl + '/admin/globalsetting/setting/edit_acc?c=setting&a=edit_acc',//收款提交数据接口
            subprocess: baseUrl + '/admin/globalsetting/setting/edit_sales?c=setting&a=edit_sales',//销售提交数据接口
            payee: baseUrl + '/admin/globalsetting/setting/payee?c=setting&a=payee',//删除收款方接口
            online: baseUrl + '/admin/globalsetting/setting/upper?c=setting&a=upper',//线上接口
        },
        //----------------------------------  IVR电话系列接口 -------------------
        ivr: {
            call: baseUrl + '/admin/call/call/crmAdmin?c=call&a=call', //拨打电话
            getCallRecord: baseUrl + '/admin/call/call/crmAdmin?c=call&a=getCallRecord', //获取当个用户的通话记录列表
            getCallRecordAll: baseUrl + '/admin/call/call/crmAdmin?c=call&a=getCallRecordAll', //获取最近联系电话列表
            deleteRecord: baseUrl + '/admin/call/call/crmAdmin?c=call&a=deleteRecord', //删除通话记录
            getEmployeeWithCustomer: baseUrl + '/admin/call/call/get?c=call&a=getEmployeeWithCustomer', //获取录音记录
            initIvr:baseUrl + '/admin/call/call/crmAdmin?c=call&a=init' //初始化IVR
        },
        //----------------------------------  销售业绩统计系列接口 -------------------
        achStatistics: {
            personallook: baseUrl + '/admin/statistics/performance_statistics/personal?c=performance_statistics&a=personallook',//个人业绩查询展示
            teamlook: baseUrl + '/admin/statistics/performance_statistics/team?c=performance_statistics&a=teamlook',//loadStatistics个人业绩查询展示
            source: baseUrl + '/admin/customers/customer/crmAdmin?c=customer&a=customer_source',//loadStatistics全局设置返回某一配置
        },
        //----------------------------------  销售工作量统计系列接口 -------------------
        //----------------------------------   服务记录接口 -------------------
        service: {
            index: baseUrl + '/admin/service/service_record/criterion?c=service_record&a=criterion',// 服务记录查询展示
        },
    }
});

/* =========================================================== */
/* SalOrdList MVC 中control 实现                                                        */
/* =========================================================== */
sap.ui.define(["./BaseController",
				"sap/ui/model/json/JSONModel",
				"sap/ui/model/Filter",
				"sap/ui/model/FilterOperator",
				"ZTEST_0005/model/poster",
				"ZTEST_0005/model/formatter",
				"sap/m/MessageToast",
				"sap/m/MessageBox",
				"sap/m/Dialog",
				'sap/ui/core/util/Export',
				'sap/ui/core/util/ExportTypeCSV',
				"./messages" 
], function(BaseController, JSONModel, Filter, FilterOperator, poster,formatter,MessageToast, MessageBox,Dialog,
		Export,ExportTypeCSV,messages) {
	"use strict";

	return BaseController.extend("ZTEST_0005.controller.SalOrdList", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		onInit : function () {
			this._ODataModel = this.getModel( "OData" );  //manifest中定义的OData模型，获取_ODataModel
			//this._ResourceBundle = this.getModel( "i18n" ).getResourceBundle();
			this._JSONModel = this.getModel();
			//初始化筛选条件
			this.initSearch ();
			// 设置事件监控
			//this.getEventBus().subscribe("ZTEST_0005", "postSuccess", this.handlePost);
			//this.getEventBus().subscribe("ZTEST_0005", "postError", this.handlePost);
		},
		/* =========================================================== */
		/* 查询功能                                                                               */
		/* =========================================================== */
		onSearch : function(oEvent){
			this.query();  //调用查询方法
		},
		
		/* =========================================================== */
		/* 新建功能                                                                               */
		/* =========================================================== */
		onNew : function(oEvent){
			//this.turnTo("page3");  //调用turn to的时候，需要在磁贴事先对该页面进行配置
			this.navTo("page4");     //此处的page4已在manifest的路由中进行配置
		},
		
		/* =========================================================== */
		/* 清空功能                                                                               */
		/* =========================================================== */
		onClear : function(oEvent){
			this.initSearch ();
		},
		
		/* =========================================================== */
		/* 编辑功能                                                                               */
		/* =========================================================== */
		onEdit : function(oEvent){
			this.edit();  //调用查询方法
		},
		
		/* =========================================================== */
		/* 导出功能                                                                               */
		/* =========================================================== */
		onDataExport : function(oEvent){
			var oContext = this;
			var oExport = new Export({
				exportType : new ExportTypeCSV({
					separatorChar : ",",
					charset : "utf-8"
				}),
				models : oContext.getModel(),

				// 生成csv文件
				rows : {
					path : "/zsalordheadSet/np_salordh2hlist"  //报表所绑定的行
				},
				columns : [
						{
							name : "销售订单号",
							template : {
								content : "{Vbeln}"
							}
						},
						{
							name : "创建人",
							template : {
								content : "{Ernam}"
							}
						},
						{
							name : "订单类型",
							template : {
								content : "{Auart}"
							}
						},
						{
							name : "销售组织",
							template : {
								content : "{VKorg}"
							}
						},
						{
							name : "产品组",
							template : {
								content : "{Spart}"
							}
						},
						{
							name : "售达方",
							template : {
								content : "{Kunnr}"
							}
						}
				]
			});
			// download exported file
			oExport.saveFile("销售订单数据导出清单").catch(function(oError) {
				messages.showWarning("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				oExport.destroy();
			});
		},
		
		/* =========================================================== */
		/* 清空功能                                                                               */
		/* =========================================================== */
		initSearch : function(){
			this._JSONModel.setProperty("/search",{
				vbeln : "",
				auart : ""
			},false);
		},
		
		/* =========================================================== */
		/* 销售订单链接功能  Nav                                         */
		/* =========================================================== */
		onPressNavTo : function (oEvent) {
			//获取销售订单抬头和行项目数据
			var context = oEvent.getSource().getBindingContext();
			var head = context.getProperty(context.sPath); //获取选择的路径
			
			//获取选中销售订单的抬头
			var _zsalordheadSet = this._JSONModel.getData().zsalordheadSet;
			
			//获取选中销售订单的行项目
			this._salorditem = [];  //清空变量
			var lv_vbeln = head.Vbeln; //获取点击的销售订单

            //根据选中的销售订单号，获取相应的行项目
            // for (var i = 0, len = _zsalordheadSet.np_salordh2ilist.length; i < len; i++) {
            //     if (_zsalordheadSet.np_salordh2ilist[i].Vbeln === lv_vbeln) {
			// 		_zsalordheadSet.np_salordh2ilist[i].Kwmeng = _zsalordheadSet.np_salordh2ilist[i].Kwmeng.trim(); //去掉字符串的前后空格
            //     	this._salorditem.push(_zsalordheadSet.np_salordh2ilist[i]);
            //     }
			// }
			
			//从数据表获取销售订单相关的信息
			var oRequest = this._JSONModel.getData().zsalordSet;
			oRequest.IvVbeln = lv_vbeln;
			oRequest.IvFcode = "Q";  //表示查询
			
			for ( var o in oRequest) {
				if (oRequest[o] == null) {
					oRequest[o] = [];
				}
			}

			var sUrl = "/zsalordSet";  //销售订单信息EntitySet
			
			var mParameters = {
					//在this._ODataModel.create后面执行
					success : function(oData, response) {
						var localData = this._JSONModel.getData();
						localData.zsalordSet = oData;
						localData.zsalordSet.np_salord2h = oData.np_salord2h != null ? oData.np_salord2h.results : null;//头结构
						localData.zsalordSet.np_salord2i = oData.np_salord2i != null ? oData.np_salord2i.results : null;//行结构
						//localData.zsalordheadSet.np_salordh2hlist = oData.np_salordh2hlist != null ? oData.np_salordh2hlist.results : null;//行结构
						//localData.zsalordheadSet.np_salordh2ilist = oData.np_salordh2ilist != null ? oData.np_salordh2ilist.results : null;//行结构
						this._JSONModel.setProperty("/", localData, false);//false同步更新本地数据
						//this._Controller.setBusy(false);
						if (fnSuccess) {
							fnSuccess(this._Controller);
						}
					}.bind(this),
					error : function(oError) {
						//this._Controller.setBusy(false);
						this._Controller.oError = oError;
						messages.convertODataErrorMessage(this._Controller);
						this._Controller.updateObligatory();
						if (fnError) {
							this._Controller.oError = oError;
							fnError(this._Controller);
						}
					}.bind(this)
				};
			this._ODataModel.create( sUrl , oRequest, mParameters );
			this.setBusy(false);  //避免一直加载

			//调用文件的doPost方法
			//poster.doPost(this.getView(), this.onPostSuccess.bind(this), this.onPostError.bind(this));
			
			//跳转到详情页面时，设置：1、界面字段不可编辑，但是编辑按钮可用 2、保存按钮不可用 3、取消按钮不可用
			this._JSONModel.setProperty("/spProperties",{
				editable : false,
				saveable : false,
				cancelable : false
			},false);
			
			//跳转到详情页面
			//this.setfcode("Navigation");
			
			/*var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("page2");  //此处的page2已在manifest的路由中进行配置
			
*/			//调用BaseController中的方法
			this.navTo("page2");  //此处的page2已在manifest的路由中进行配置
		},
		// 操作成功后
		onPostSuccess : function(oContext) {
			oContext.getEventBus().publish("ZTEST_0005", "postSuccess", oContext);
		},

		// 操作失败后
		onPostError : function(oContext) {
			oContext.getEventBus().publish("ZTEST_0005", "postError", oContext);
		},
		
		/* =========================================================== */
		/* 简单结构 创建 create                                         */
		/* =========================================================== */
		/*create : function () {
			
            this.setBusy(true);
			
			var oRequest = this._JSONModel.getProperty("/unameSet");
			var sUrl = "/headerCreateSet";	
			var mParameters =
			{
				success : function( oData , response )
				{
					if (response.statusCode === 201)
					{
						if(oData.Otype === "E"){
							MessageBox.error( "创建失败！");
						}else{
							MessageBox.success( "创建成功！");
							this._JSONModel.setProperty("/unameSet/Bname","");
							this._JSONModel.setProperty("/unameSet/NameText","");
						}
					}
					this.setBusy( false );
				}.bind( this ),
				error : function( oError )
				{
					messages.showODataErrorText( oError );
					this.setBusy( false );
				}.bind( this )
			};
			this._ODataModel.create( sUrl , oRequest , mParameters );
		},

		 ===========================================================
		 简单结构读取 read+

		 ===========================================================
		read : function () {
			var mParameters =
			{
				success : function( oData , response )
				{
					if (response.statusCode === 200)
					{
						this._JSONModel.setProperty("/unameSet/NameText",oData.NameText);
						if (oData.Bname == "" || oData.Bname == null) {
							MessageBox.error( "读取数据失败！");
						}
						else {
							MessageBox.success( "读取数据成功！");
						};
						
					}
					this.setBusy( false );
				}.bind( this ),
				error : function( oError )
				{
					messages.showODataErrorText( oError );
					this.setBusy( false );
				}.bind( this )
			};
            var oBname = this._JSONModel.getProperty("/unameSet/Bname")
            var sPath = "/headerCreateSet(Bname='"  + oBname + "')";
            this._ODataModel.read(sPath,mParameters);			
		},
*/
		/* =========================================================== */
		/* 简单结构 表查询 query                                         */
		/* =========================================================== */
		query : function () {	
            this.setBusy(true);
			
            //根据筛选条件获取数据
			var vbeln = this._JSONModel.getProperty("/search/Carrid");   //获取销售订单号
			var auart = this._JSONModel.getProperty("/search/Connid");  //获取订单类型
            var aFilters = [];
       //     if(vbeln){
       //     	//表示销售订单不为空
       //     	var oFilter1 = new sap.ui.model.Filter("IvVbeln", sap.ui.model.FilterOperator.EQ, vbeln);
    			// aFilters.push(oFilter1);
       //     }
       //     if(auart){
       //     	//表示订单类型不为空
       //     	var oFilter1 = new sap.ui.model.Filter("IvAuart", sap.ui.model.FilterOperator.EQ, auart);
    			// aFilters.push(oFilter1);
       //     }
			
			var sUrl = "/ZSY_SPFLI_HSet";  //销售订单信息EntitySet
			var mParameters =
			{
				filters : aFilters,
				success : function( oData , response )
				{
					if (response.statusCode === "200")
					{
						this._JSONModel.setProperty("/ZSY_SPFLI_HSet",oData.results);
						// var localData = this._JSONModel.getData();
						// localData.ZSY_SPFLI_H = oData.results;
						// this._JSONModel.setProperty("/", localData, false);//false同步更新本地数据
						MessageBox.success( "共查询数据行为：" + oData.results.length);
					}
				}.bind( this ),
				error : function( oError )
				{
					messages.showODataErrorText( oError );
				}.bind( this )
			};
			this._ODataModel.read( sUrl , mParameters );
			
			// var mParameters = {
			// 		//在this._ODataModel.create后面执行
			// 		success : function(oData, response) {
			// 			var localData = this._JSONModel.getData();
			// 			localData.zsalordlistSet = oData;
			// 			//localData.zsalordSet.np_ptdh2b = oData.np_ptdh2b != null ? oData.np_ptdh2b.results : null;//消息结构
			// 			//localData.zsalordheadSet.np_salordh2i = oData.np_salordh2i != null ? oData.np_salordh2i.results : null;//行结构
			// 			//localData.zsalordheadSet.np_salordh2hlist = oData.np_salordh2hlist != null ? oData.np_salordh2hlist.results : null;//行结构
			// 			//localData.zsalordheadSet.np_salordh2ilist = oData.np_salordh2ilist != null ? oData.np_salordh2ilist.results : null;//行结构
			// 			this._JSONModel.setProperty("/", localData, false);//false同步更新本地数据
			// 			//this._Controller.setBusy(false);
			// 			if (fnSuccess) {
			// 				fnSuccess(this._Controller);
			// 			}
			// 		}.bind(this),
			// 		error : function(oError) {
			// 			this._Controller.setBusy(false);
			// 			this._Controller.oError = oError;
			// 			messages.convertODataErrorMessage(this._Controller);
			// 			this._Controller.updateObligatory();
			// 			if (fnError) {
			// 				this._Controller.oError = oError;
			// 				fnError(this._Controller);
			// 			}
			// 		}.bind(this)
			// 	};
			//this._ODataModel.create( sUrl , oRequest, mParameters );
			this.setBusy(false);  //避免一直加载
		},
		
		/* =========================================================== */
		/* 编辑功能  eidt                                         */
		/* =========================================================== */
		edit : function () {
			
            this.setBusy(true);
			
            //根据筛选条件获取数据
			var vbeln = this._JSONModel.getProperty("/search/vbeln");   //获取销售订单号
			var auart = this._JSONModel.getProperty("/search/auart");  //获取订单类型
			
		},
		
		/* =========================================================== */
		/* 回调功能  eidt                                         */
		/* =========================================================== */
		handlePost : function(sChannelId, sEventId, oContext) {
			var localData = oContext._JSONModel.getData();
			var resourceBundle = oContext._ResourceBundle;
			var sFCode = localData.appProperties.fcode;  //获取功能码
			sFCode = "Navigation";
/*			var spSet = localData.spSet;
			var pro = oContext._JSONModel.getProperty("/kmsSet/ProductId");
			var type = oContext._JSONModel.getProperty("/kmsSet/Filetype");*/
			switch (sFCode) {
			case "INTQUERY":
				oContext._JSONModel.setProperty("/TDLQUERYSet", localData.tdlSet, false);
				oContext._JSONModel.setProperty("/tdlSet/Xtzt",pro,false);
				oContext.queryButton();
				break;
			case "ADD":
				if (sEventId == "postSuccess") {
					oContext._JSONModel.setProperty("/spSet", localData.spSet, false);
					oContext._JSONModel.setProperty("/spSet/Fcode", "", false);
					oContext._JSONModel.setProperty("/spProperties/VISIBLE", false, false);
					oContext._JSONModel.setProperty("/spProperties/visible5", false, false);
					oContext._JSONModel.setProperty("/spProperties/visible6", false, false);// 提交
					oContext._JSONModel.setProperty("/spProperties/visible7", false, false);// 保存按钮
					messages.showInformation("提交成功！");
				}
				if (sEventId == "postError") {
					oContext._JSONModel.setProperty("/spSet/Fcode", "", false);
					oContext._JSONModel.setProperty("/spSet/np_sp2de", null, false);
				}
				break;
			case "SAVE_KMS":
				if (sEventId == "postSuccess") {
					messages.showText(localData.kmsSet.np_kms2bt[0].Message);
					oContext._JSONModel.setProperty("/parameter/editable",false,false);
					
					oContext._JSONModel.setProperty("/kmsSet/np_kms2atta", null, false);
					
					oContext.setfcode("SEL_ATTA");
					poster.postKMS(oContext.getView(), oContext.onPostSuccess.bind(oContext), oContext.onPostError.bind(oContext));
					
				}
				break;
			case "Navigation":
				//导航
			/*	var tecName = oContext._JSONModel.getProperty("/tdlSet/np_tdl2rt/0/TecName");
				var id = oContext._JSONModel.getProperty("/userSet/id");
				var funcStatus = oContext._JSONModel.getProperty("/tdlSet/np_tdl2rt/0/FuncStatus");
				var typeId = oContext._JSONModel.getProperty("/tdlSet/np_tdl2rt/0/TypeId");
				if (tecName.split("/")[1] == id || funcStatus == "X"){
					oContext._JSONModel.setProperty("/parameter/detailBtn",true,false);
				}else{
					oContext._JSONModel.setProperty("/parameter/detailBtn",false,false);
				}
				if(typeId == "E"){
					oContext._JSONModel.setProperty("/parameter/enhanceVib",true,false);
				}else if(typeId == "IF" || typeId == "F"){
					oContext._JSONModel.setProperty("/parameter/interVib",true,false);
				}else if(typeId == "F"){
					oContext._JSONModel.setProperty("/parameter/printVib",true,false);
				}else if(typeId != "E" && typeId != "F" && typeId != "IF"){
					oContext._JSONModel.setProperty("/parameter/otherVib",true,false);
				}*/
				oContext.getSplitAppObj().toDetail(oContext.createId("SalOrdDetail")); //导航的页面
				break;
			case "QUERY":
				oContext._JSONModel.setProperty("/TDLQUERYSet", localData.tdlSet, false);
				break;
			default:
				break;
			}
			if(type == "4"){
				var items = oContext.byId("list").getItems();
				for(var i=0; i<items.length; i++){
					items[i].setNumber(null);
				}
			}
			if (oContext.oError != undefined) {
				oContext.openMessagePopover(oContext);
				delete oContext.oError;
				return;
			}
		},
		/* =========================================================== */
		/* 简单结构 删除 remove                                         */
		/* =========================================================== */
/*		remove : function () {
			var mParameters =
			{
				success : function( oData , response )
				{
					if (response.statusCode === 204)
					{
						this._JSONModel.setProperty("/unameSet/Bname","");
						this._JSONModel.setProperty("/unameSet/NameText","");
						MessageBox.success( "删除成功！");
					}
					this.setBusy( false );
				}.bind( this ),
				error : function( oError )
				{
					messages.showODataErrorText( oError );
					this.setBusy( false );
				}.bind( this )
			};
			var oBname = this._JSONModel.getProperty("/unameSet/Bname")
            var sPath = "/headerCreateSet(Bname='"  + oBname + "')";
            this._ODataModel.remove(sPath,mParameters);
		},	
		
		 ===========================================================
		 onBnameChange Bname 输入回车事件&nb+
sp;
		 ===========================================================
		onChange : function (oEvent) {
			//debugger;
			var myString = oEvent.getSource().getValue();
			//MessageBox.success( myString);
			jQuery.sap.delayedCall(1000, this, function() {
			    this.byId("a").getFocusDomRef().focus()
			});
			//this.getView().byId("a").getFocusDomRef().focus();
			this.getView().byId("a").focus();
			var id1 = this.getView().byId("ID1").getFocusDomRef();
			id1.focus();
			var getInputId = this.getView().byId("ID1");

			getInputId.focus();
		    //this.getView().byId("ID1").focus();
		    //sap.ui.getCore().byId("ID1").focus();
			var oid = this.getView().byId("NameText1");
			oid.focus();
		},	*/	
		
	});
});
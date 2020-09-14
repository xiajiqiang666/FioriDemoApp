/* =========================================================== */
/* 前台与OData之间进行数据交互的主要函数方法 实现                                                                              */
/* =========================================================== */
sap.ui.define([ "sap/ui/model/Filter",
				 "../controller/messages",
				 "./models",
				 "./formatter"
], function(Filter, messages, models, formatter) {
				"use strict";

				return {
					// 前后台交互通用函数
					doPost : function(oView, fnSuccess, fnError) {
						this._Controller = oView.getController();
						this._JSONModel = this._Controller.getModel();
						var sBCode = this._JSONModel.getProperty("/appProperties/bcode");

						var f1 = "postEAMWT"; // 工作票数据交互处理函数
						var f2 = "postBEIJIAN"; // 备件需求提报数据交互处理函数
						var f3 = "postDETAIL";  //销售订单详细信息处理函数
						var sFunction = {
							"WT" : f1,
							"BJ" : f2,
							"DE" : f3
						}[sBCode] || "";

						switch (sFunction) {
						case f1:
							this.postEAMWT(oView, fnSuccess, fnError);
							break;
						case f2:
							this.postBEIJIAN(oView, fnSuccess, fnError);
							break;
						case f3:
							this.postDETAIL(oView, fnSuccess, fnError);
							break;
						default:
							break;
						}
					},
					
					// 销售订单处理函数
					postDETAIL : function(oView, fnSuccess, fnError) {

						this._Controller = oView.getController();
						this._ODataModel = this._Controller.getModel("OData");
						this._JSONModel = this._Controller.getModel();
						//var sFCode = this._JSONModel.getProperty("/appProperties/fcode");//公用属性fcode
						var sFCode = "Navigation";
						this._Controller.setBusy(true);
					// 数据集
						var oBJH = this._JSONModel.getData().bjhSet;
						var oRequest = this._Controller.clone(oBJH);
						oRequest.Fcode = sFCode;
					// 相关行项目
						/*oRequest.np_bjh2bt = !oRequest.np_bjh2bt ? [] : oRequest.np_bjh2bt;
						oRequest.np_bjh2i = !oRequest.np_bjh2i ? [] : oRequest.np_bjh2i;
						oRequest.np_bjh2s = !oRequest.np_bjh2s ? [] : oRequest.np_bjh2s;
						oRequest.np_bjh2a = !oRequest.np_bjh2a ? [] : oRequest.np_bjh2a;
						oRequest.np_bjh2t = !oRequest.np_bjh2t ? [] : oRequest.np_bjh2t;*/
						
						var sUrl = "/salOrdSet";   //销售订单抬头和行项目集合
						var mParameters = {
							success : function(oData, response) {
								var localData = this._JSONModel.getData();
								localData.bjhSet = oData;
								localData.bjhSet.np_bjh2bt = oData.np_bjh2bt != null ? oData.np_bjh2bt.results : null;
								localData.bjhSet.np_bjh2i = oData.np_bjh2i != null ? oData.np_bjh2i.results : null;
								localData.bjhSet.np_bjh2s = oData.np_bjh2s != null ? oData.np_bjh2s.results : null;
								this._JSONModel.setProperty("/", localData, false);
								messages.convertMessage(this, "/salOrdSet/itemSet");
								this._Controller.setBusy(false);
								if (fnSuccess) {
									fnSuccess(this._Controller);
								}
							}.bind(this),
							error : function(oError) {
								this._Controller.setBusy(false);
								this._Controller.oError = oError;
								messages.convertODataErrorMessage(this._Controller);
								if (fnError) {
									fnError(this._Controller);
								}
							}.bind(this)
						};

						this._ODataModel.create(sUrl, oRequest, mParameters);

					},
					
					// 工作票数据交互处理函数
					postEAMWT : function(oView, fnSuccess, fnError) {

						this._Controller = oView.getController();
						this._ODataModel = this._Controller.getModel("OData");
						this._JSONModel = this._Controller.getModel();
						var sFCode = this._JSONModel.getProperty("/appProperties/fcode");// 公用fcode
						this._Controller.setBusy(true);

						// 工作票数据集
						var oWT = this._JSONModel.getData().wtSet;
						var oRequest = this._Controller.clone(oWT);
						oRequest.Fcode = sFCode;
						// UIC备份
						var oUICBackup = oRequest.np_wt2uic;
						// 相关行项目
						oRequest.np_wt2uic = [];
						oRequest.np_wt2it = !oRequest.np_wt2it ? [] : oRequest.np_wt2it;
						oRequest.np_wt2da = !oRequest.np_wt2da ? [] : oRequest.np_wt2da;
						oRequest.np_wt2sm01 = !oRequest.np_wt2sm01 ? [] : oRequest.np_wt2sm01;
						oRequest.np_wt2sm02 = !oRequest.np_wt2sm02 ? [] : oRequest.np_wt2sm02;
						oRequest.np_wt2sm03 = !oRequest.np_wt2sm03 ? [] : oRequest.np_wt2sm03;
						oRequest.np_wt2sm04 = !oRequest.np_wt2sm04 ? [] : oRequest.np_wt2sm04;
						oRequest.np_wt2sm05 = !oRequest.np_wt2sm05 ? [] : oRequest.np_wt2sm05;
						oRequest.np_wt2sm06 = !oRequest.np_wt2sm06 ? [] : oRequest.np_wt2sm06;
						oRequest.np_wt2ro = !oRequest.np_wt2ro ? [] : oRequest.np_wt2ro;
						oRequest.np_wt2cf = !oRequest.np_wt2cf ? [] : oRequest.np_wt2cf;
						oRequest.np_wt2hl = !oRequest.np_wt2hl ? [] : oRequest.np_wt2hl;
						oRequest.np_wt2bt = !oRequest.np_wt2bt ? [] : oRequest.np_wt2bt;
						oRequest.np_wt2s = !oRequest.np_wt2s ? [] : oRequest.np_wt2s;
						oRequest.np_wt2a = !oRequest.np_wt2a ? [] : oRequest.np_wt2a;
						oRequest.np_wt2t = !oRequest.np_wt2t ? [] : oRequest.np_wt2t;

						var sUrl = "/wtSet";
						var mParameters = {
							success : function(oData, response) {
								var localData = this._JSONModel.getData();
								localData.wtSet = oData;
								localData.wtSet.np_wt2it = oData.np_wt2it != null ? oData.np_wt2it.results : null;
								localData.wtSet.np_wt2ro = oData.np_wt2ro != null ? oData.np_wt2ro.results : null;
								localData.wtSet.np_wt2sm01 = oData.np_wt2sm01 != null ? oData.np_wt2sm01.results : null;
								localData.wtSet.np_wt2sm02 = oData.np_wt2sm02 != null ? oData.np_wt2sm02.results : null;
								localData.wtSet.np_wt2sm03 = oData.np_wt2sm03 != null ? oData.np_wt2sm03.results : null;
								localData.wtSet.np_wt2sm04 = oData.np_wt2sm04 != null ? oData.np_wt2sm04.results : null;
								localData.wtSet.np_wt2sm05 = oData.np_wt2sm05 != null ? oData.np_wt2sm05.results : null;
								localData.wtSet.np_wt2sm06 = oData.np_wt2sm06 != null ? oData.np_wt2sm06.results : null;
								localData.wtSet.np_wt2da = oData.np_wt2da != null ? oData.np_wt2da.results : null;
								localData.wtSet.np_wt2hl = oData.np_wt2hl != null ? oData.np_wt2hl.results : null;
								localData.wtSet.np_wt2cf = oData.np_wt2cf != null ? oData.np_wt2cf.results : null;
								localData.wtSet.np_wt2bt = oData.np_wt2bt != null ? oData.np_wt2bt.results : null;
								localData.wtSet.np_wt2s = oData.np_wt2s != null ? oData.np_wt2s.results : null;
								localData.wtSet.np_wt2a = oData.np_wt2a != null ? oData.np_wt2a.results : null;
								localData.wtSet.np_wt2t = oData.np_wt2t != null ? oData.np_wt2t.results : null;
								localData.wtSet.np_wt2uic = oData.np_wt2uic != null ? oData.np_wt2uic.results : oUICBackup;
								if (jQuery.isArray(localData.wtSet.np_wt2uic)) {
									localData.wtSet.np_wt2uic = formatter.convertUIC(localData.wtSet.np_wt2uic);
								}
								this._JSONModel.setProperty("/", localData, false);
								messages.convertMessage(this, "/wtSet/np_wt2bt");
								this._Controller.setBusy(false);
								if (fnSuccess) {
									fnSuccess(this._Controller);
								}
							}.bind(this),
							error : function(oError) {
								this._Controller.setBusy(false);
								this._Controller.oError = oError;
								messages.convertODataErrorMessage(this._Controller);
								this._Controller.updateObligatory();
								if (fnError) {
									fnError(this._Controller);
								}
							}.bind(this)
						};
						this._ODataModel.create(sUrl, oRequest, mParameters);

					},

					// 备件需求提报数据交互处理函数
					postBEIJIAN : function(oView, fnSuccess, fnError) {

						this._Controller = oView.getController();
						this._ODataModel = this._Controller.getModel("OData");
						this._JSONModel = this._Controller.getModel();
						var sFCode = this._JSONModel.getProperty("/appProperties/fcode");//公用属性fcode

						this._Controller.setBusy(true);
					// 数据集
						var oBJH = this._JSONModel.getData().bjhSet;
						var oRequest = this._Controller.clone(oBJH);
						oRequest.Fcode = sFCode;
					// 相关行项目
						oRequest.np_bjh2bt = !oRequest.np_bjh2bt ? [] : oRequest.np_bjh2bt;
						oRequest.np_bjh2i = !oRequest.np_bjh2i ? [] : oRequest.np_bjh2i;
						oRequest.np_bjh2s = !oRequest.np_bjh2s ? [] : oRequest.np_bjh2s;
						oRequest.np_bjh2a = !oRequest.np_bjh2a ? [] : oRequest.np_bjh2a;
						oRequest.np_bjh2t = !oRequest.np_bjh2t ? [] : oRequest.np_bjh2t;

						var sUrl = "/bjhSet";
						var mParameters = {
							success : function(oData, response) {
								var localData = this._JSONModel.getData();
								localData.bjhSet = oData;
								localData.bjhSet.np_bjh2bt = oData.np_bjh2bt != null ? oData.np_bjh2bt.results : null;
								localData.bjhSet.np_bjh2i = oData.np_bjh2i != null ? oData.np_bjh2i.results : null;
								localData.bjhSet.np_bjh2s = oData.np_bjh2s != null ? oData.np_bjh2s.results : null;
								localData.bjhSet.np_bjh2a = oData.np_bjh2a != null ? oData.np_bjh2a.results : null;
								localData.bjhSet.np_bjh2t = oData.np_bjh2t != null ? oData.np_bjh2t.results : null;
								this._JSONModel.setProperty("/", localData, false);
								messages.convertMessage(this, "/bjhSet/np_bjh2bt");
								this._Controller.setBusy(false);
								if (fnSuccess) {
									fnSuccess(this._Controller);
								}
							}.bind(this),
							error : function(oError) {
								this._Controller.setBusy(false);
								this._Controller.oError = oError;
								messages.convertODataErrorMessage(this._Controller);
								if (fnError) {
									fnError(this._Controller);
								}
							}.bind(this)
						};

						this._ODataModel.create(sUrl, oRequest, mParameters);

					},
					
					// 获取Domain值搜索帮助
					getDomainValueList : function(sDomainName, oContext, sLanguage) {
						var aFilters = [];
						aFilters.push(new Filter("Domname", sap.ui.model.FilterOperator.EQ, sDomainName));
						aFilters.push(new Filter("Ddlanguage", sap.ui.model.FilterOperator.EQ, sLanguage));
						this.callSearchHelp("ZSH_DOMAIN", oContext, aFilters);
					},

					// 搜索帮助交互函数
					callSearchHelp : function(sName, oController, aFilter, aSorter, fnSuccess, fnError) {

						this._Controller = oController;
						this._ODataModel = this._Controller.getModel("OData");
						this._JSONModel = this._Controller.getModel();

						this._Controller.setBusy(true);

						sName = sName + "Set";
						var sUrl = "/" + sName;
						var iQueryMaxhints = this._JSONModel.getProperty("/appProperties/queryMaxhints");
						if (iQueryMaxhints == "" || iQueryMaxhints == 0) {
							iQueryMaxhints = 9999;
						}

						if (sName == "ZSH_DOMAINSet") {
							if (!aFilter || !aFilter.length || aFilter.length == 0) {
								return;
							}
							for (var i = 0; i < aFilter.length; i++) {
								if (aFilter[i].sPath == "Domname") {
									sName = aFilter[i].oValue1 + "Set";
								}
							}
						}

						var mParameters = {
							urlParameters : {
								$top : iQueryMaxhints,
								$skip : 0
							},
							filters : aFilter,
							sorters : aSorter,
							success : function(oData, response) {
								var localData = this._JSONModel.getData();
								localData[sName] = oData.results;
								this._JSONModel.setProperty("/", localData, false);
								this._Controller.setBusy(false);
								if (fnSuccess) {
									fnSuccess(this._Controller);
								}
							}.bind(this),
							error : function(oError) {
								this._Controller.setBusy(false);
								this._Controller.oError = oError;
								if (fnError) {
									fnError(this._Controller);
								}
							}.bind(this)
						};

						this._ODataModel.read(sUrl, mParameters);

					},

					// 综合报表查询数据交互处理函数
					postQM : function(oView, fnSuccess, fnError) {

						this._Controller = oView.getController();
						this._ODataModel = this._Controller.getModel("OData");
						this._JSONModel = this._Controller.getModel();
						var sFCode = this._JSONModel.getProperty("/appProperties/fcode");

						this._Controller.setBusy(true);
						// 综合报表数据集
						var oQM = this._JSONModel.getData().qmSet;
						var oRequest = this._Controller.clone(oQM);
						oRequest.Fcode = sFCode;
						// UIC备份
						var oUICBackup = oRequest.np_qm2uic;
						// 相关行项目
						oRequest.np_qm2uic = [];
						oRequest.np_qm2bt = !oRequest.np_qm2bt ? [] : oRequest.np_qm2bt;
						oRequest.np_qm2df = !oRequest.np_qm2df ? [] : oRequest.np_qm2df;
						oRequest.np_qm2dh = !oRequest.np_qm2dh ? [] : oRequest.np_qm2dh;
						oRequest.np_qm2yd = !oRequest.np_qm2yd ? [] : oRequest.np_qm2yd;
						oRequest.np_qm2tf = !oRequest.np_qm2tf ? [] : oRequest.np_qm2tf;
						oRequest.np_qm2tn = !oRequest.np_qm2tn ? [] : oRequest.np_qm2tn;

						var sUrl = "/qmSet";
						var mParameters = {
							success : function(oData, response) {
								var localData = this._JSONModel.getData();
								localData.qmSet = oData;
								localData.qmSet.np_qm2df = oData.np_qm2df != null ? oData.np_qm2df.results : null;
								localData.qmSet.np_qm2dh = oData.np_qm2dh != null ? oData.np_qm2dh.results : null;
								localData.qmSet.np_qm2yd = oData.np_qm2yd != null ? oData.np_qm2yd.results : null;
								localData.qmSet.np_qm2tf = oData.np_qm2tf != null ? oData.np_qm2tf.results : null;
								localData.qmSet.np_qm2tn = oData.np_qm2tn != null ? oData.np_qm2tn.results : null;
								localData.qmSet.np_qm2bt = oData.np_qm2bt != null ? oData.np_qm2bt.results : null;
								localData.qmSet.np_qm2uic = oData.np_qm2uic != null ? oData.np_qm2uic.results : oUICBackup;

								if (jQuery.isArray(localData.qmSet.np_qm2uic)) {
									localData.qmSet.np_qm2uic = formatter.convertUIC(localData.qmSet.np_qm2uic);
								}
								this._JSONModel.setProperty("/", localData, false);
								messages.convertMessage(this, "/qmSet/np_qm2bt");
								this._Controller.setBusy(false);
								if (fnSuccess) {
									fnSuccess(this._Controller);
								}
							}.bind(this),
							error : function(oError) {
								this._Controller.setBusy(false);
								this._Controller.oError = oError;
								messages.convertODataErrorMessage(this._Controller);
								this._Controller.updateObligatory();
								if (fnError) {
									fnError(this._Controller);
								}
							}.bind(this)
						};

						this._ODataModel.create(sUrl, oRequest, mParameters);

					},

					// 异动通知单数据交互处理函数
					postYD : function(oView, fnSuccess, fnError) {

						this._Controller = oView.getController();
						this._ODataModel = this._Controller.getModel("OData");
						this._JSONModel = this._Controller.getModel();
						var sFCode = this._JSONModel.getProperty("/appProperties/fcode");// 公用属性fcode

						this._Controller.setBusy(true);
						// 异动数据集
						var oYD = this._JSONModel.getData().ydSet;
						var oRequest = this._Controller.clone(oYD);
						oRequest.Fcode = sFCode;
						// UIC备份
						var oUICBackup = oRequest.np_yd2uic;
						// 相关行项目
						oRequest.np_yd2uic = [];
						oRequest.np_yd2bt = !oRequest.np_yd2bt ? [] : oRequest.np_yd2bt;
						oRequest.np_yd2s = !oRequest.np_yd2s ? [] : oRequest.np_yd2s;
						oRequest.np_yd2a = !oRequest.np_yd2a ? [] : oRequest.np_yd2a;
						oRequest.np_yd2t = !oRequest.np_yd2t ? [] : oRequest.np_yd2t;

						var sUrl = "/ydSet";
						var mParameters = {
							success : function(oData, response) {
								var localData = this._JSONModel.getData();
								localData.ydSet = oData;
								localData.ydSet.np_yd2bt = oData.np_yd2bt != null ? oData.np_yd2bt.results : null;
								localData.ydSet.np_yd2s = oData.np_yd2s != null ? oData.np_yd2s.results : null;
								localData.ydSet.np_yd2a = oData.np_yd2a != null ? oData.np_yd2a.results : null;
								localData.ydSet.np_yd2t = oData.np_yd2t != null ? oData.np_yd2t.results : null;
								localData.ydSet.np_yd2uic = oData.np_yd2uic != null ? oData.np_yd2uic.results : oUICBackup;
								if (jQuery.isArray(localData.ydSet.np_yd2uic)) {
									localData.ydSet.np_yd2uic = formatter.convertUIC(localData.ydSet.np_yd2uic);
								}
								this._JSONModel.setProperty("/", localData, false);
								messages.convertMessage(this, "/ydSet/np_yd2bt");
								this._Controller.setBusy(false);
								if (fnSuccess) {
									fnSuccess(this._Controller);
								}
							}.bind(this),
							error : function(oError) {
								this._Controller.setBusy(false);
								this._Controller.oError = oError;
								messages.convertODataErrorMessage(this._Controller);
								this._Controller.updateObligatory();
								if (fnError) {
									fnError(this._Controller);
								}
							}.bind(this)
						};

						this._ODataModel.create(sUrl, oRequest, mParameters);

					},

					// 值班管理数据交互处理函数
					postDT : function(oView, fnSuccess, fnError) {

						this._Controller = oView.getController();
						this._ODataModel = this._Controller.getModel("OData");
						this._JSONModel = this._Controller.getModel();
						var sFCode = this._JSONModel.getProperty("/appProperties/fcode");// 公用属性fcode

						this._Controller.setBusy(true);
						// 值班管理数据集
						var oDT = this._JSONModel.getData().dtSet;
						var oRequest = this._Controller.clone(oDT);
						oRequest.Fcode = sFCode;
						// 相关行项目
						oRequest.np_dt2di = !oRequest.np_dt2di ? [] : oRequest.np_dt2di;
						oRequest.np_dt2bt = !oRequest.np_dt2bt ? [] : oRequest.np_dt2bt;

						var sUrl = "/dtSet";
						var mParameters = {
							success : function(oData, response) {
								var localData = this._JSONModel.getData();
								localData.dtSet = oData;
								localData.dtSet.np_dt2bt = oData.np_dt2bt != null ? oData.np_dt2bt.results : null;
								localData.dtSet.np_dt2di = oData.np_dt2di != null ? oData.np_dt2di.results : null;
								this._JSONModel.setProperty("/", localData, false);
								messages.convertMessage(this, "/dtSet/np_dt2bt");
								this._Controller.setBusy(false);
								if (fnSuccess) {
									fnSuccess(this._Controller);
								}
							}.bind(this),
							error : function(oError) {
								this._Controller.setBusy(false);
								this._Controller.oError = oError;
								messages.convertODataErrorMessage(this._Controller);
								this._Controller.updateObligatory();
								if (fnError) {
									fnError(this._Controller);
								}
							}.bind(this)
						};

						this._ODataModel.create(sUrl, oRequest, mParameters);

					},

					// 附件上传数据交互处理函数
					postAttachment : function(oView, fnSuccess, fnError) {
						this._Controller = oView.getController();
						this._JSONModel = this._Controller.getModel();
						this._ResourceBundle = this._Controller.getModel("i18n").getResourceBundle();

						// this.setBusy(true);

						if (this.atODataModel == undefined) {
							this.atODataModel = models.createODataModel({
								urlParametersForEveryRequest : [
										"sap-server",
										"sap-client",
										"sap-language"
								],
								url : "/sap/opu/odata/sap/ZXXFILE01_SRV/",
								config : {
									// metadataUrlParams: {
									// "sap-documentation": "heading"
									// },
									// defaultBindingMode: "OneWay",
									useBatch : false,
									defaultCountMode : "None",
									// loadMetadataAsync: true,
									json : true
								}
							});
						}

						var oRequest = this._JSONModel.getData().filelistSet;

						for ( var o in oRequest) {
							if (oRequest[o] == null) {
								oRequest[o] = [];
							}
						}

						if (oRequest.np_filelist2h.length == 0) {
							var np_attah = {
								Docid : "",
								Filename : "",
								Mimetype : "",
								Url : "",
								np_attah2a : []
							};
							oRequest.np_filelist2h.push(np_attah);
						}

						this._Controller.setBusy(true);

						var sUrl = "/filelistSet";
						var mParameters = {
							success : function(oData, response) {
								this._Controller.setBusy(false);
								var localData = this._JSONModel.getData();
								localData.filelistSet = oData;
								localData.filelistSet.np_filelist2bt = oData.np_filelist2bt != null ? oData.np_filelist2bt.results : null;
								localData.filelistSet.np_filelist2h = oData.np_filelist2h != null ? oData.np_filelist2h.results : null;
								if (localData.filelistSet.np_filelist2h != null) {
									for (var i = 0; i < localData.filelistSet.np_filelist2h.length; i++) {
										localData.filelistSet.np_filelist2h[i].np_attah2a = localData.filelistSet.np_filelist2h[i].np_attah2a != null ? localData.filelistSet.np_filelist2h[i].np_attah2a.results : null;
									}
								}
								this._JSONModel.setProperty("/", localData, false);

								if (oRequest.Fcode == "DELETE") {
									messages.showText(this._ResourceBundle.getText("fileDel.Ok"));
								}
							}.bind(this),
							error : function(oError) {
								this._Controller.setBusy(false);
								if (oRequest.Fcode == "DELETE") {
									messages.showText(this._ResourceBundle.getText("fileDel.Error"));
								}
								this._JSONModel.setProperty("/filelistSet/Fcode", "SELECT");
								this.postAttachment(oView);

							}.bind(this)
						};
						this.atODataModel.create(sUrl, oRequest, mParameters);
					},
				};
			});
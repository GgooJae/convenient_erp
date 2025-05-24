sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("convenienterp.controller.Stock_Order", {
        onApplyFilter: function () {
            const oTable = this.byId("itemsTable");
            const oBinding = oTable.getBinding("rows");

            let aFilters = [];

            // 가격 필터
            const sMinPrice = this.byId("priceMinFilter").getValue();
            const sMaxPrice = this.byId("priceMaxFilter").getValue();
            let sName = this.byId("nameFilter").getValue();
            const sCategory = this.byId("categoryFilter").getSelectedKey();

            if (sMinPrice) {
                aFilters.push(new Filter("ItemPrice", FilterOperator.GE, parseFloat(sMinPrice)));
            }
            if (sMaxPrice) {
                aFilters.push(new Filter("ItemPrice", FilterOperator.LE, parseFloat(sMaxPrice)));
            }
            if (sName) {
                aFilters.push(new Filter("ItemName", FilterOperator.Contains, sName));
            }
            if (sCategory) {
                aFilters.push(new Filter("ItemCategory", FilterOperator.EQ, sCategory));
            }

            // 필터 적용
            oBinding.filter(aFilters);

            // aFilters 내용을 요약하여 표시
            const filterSummary = aFilters.map(filter => `${filter.sPath} ${filter.sOperator} ${filter.oValue1}`).join(", ");
            console.log("Filters applied:", aFilters);
            MessageToast.show("Filters applied: " + filterSummary);
        },

        onInit: function () {
            const oModel = this.getOwnerComponent().getModel();

            oModel.read("/zcap_itemsSet", {
                success: (oData) => {
                    const aItems = [];
                    const aCategories = new Set();

                    oData.results.forEach((item) => {
                        item.OrderQuantity = 1; // 발주 수량 초기값
                        aItems.push(item);
                        if (item.ItemCategory) {
                            aCategories.add(item.ItemCategory);
                        }
                    });

                    const oTableModel = new sap.ui.model.json.JSONModel({ results: aItems });
                    this.getView().setModel(oTableModel, "tableData");

                    const aCategoryArray = Array.from(aCategories).map((category) => ({
                        CategoryKey: category,
                        CategoryName: category
                    }));

                    const oCategoryModel = new sap.ui.model.json.JSONModel({ CategorySet: aCategoryArray });
                    this.getView().setModel(oCategoryModel, "categories");
                },
                error: (oError) => {
                    console.error("Failed to fetch data", oError);
                }
            });
        },

        // 단품목 발주 버튼 클릭 시 Dialog 오픈
        onOrderPress: function(oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            const oData = oContext.getObject();

            // Dialog에 값 세팅
            this.byId("orderItemName").setText(oData.ItemName);
            this.byId("orderQuantity").setValue(oData.OrderQuantity || 1);
            this.byId("orderTotalPrice").setText((oData.OrderQuantity || 1) * (oData.ItemPrice || 0));

            // 현재 품목 데이터 저장
            this._oCurrentOrder = oData;

            // Dialog 오픈
            this.byId("orderDialog").open();
        },

        // 수량 변경 시 총 가격 갱신
        onOrderQuantityChange: function(oEvent) {
            const iQty = parseInt(oEvent.getSource().getValue(), 10) || 1;
            const oData = this._oCurrentOrder;
            if (oData) {
                const total = iQty * (oData.ItemPrice || 0);
                this.byId("orderTotalPrice").setText(total);
            }
        },

        // 확인 버튼
        onOrderConfirm: function() {
            const qty = parseInt(this.byId("orderQuantity").getValue(), 10) || 1;
            const oData = this._oCurrentOrder;
            const sOwner = sessionStorage.getItem("username"); // 로그인된 ID

            // OData 모델 가져오기
            const oModel = this.getOwnerComponent().getModel();

            // DB에 저장할 데이터 (CamelCase로 맞춤)
            const oOrder = {
                OrderItemId: oData.ItemId,
                OrderItemName: oData.ItemName,
                OrderItemQuan: qty,
                OrderDate: new Date().toISOString().slice(0,10).replace(/-/g,""),
                OrderOwner: sOwner
            };

            oModel.create("/zcap_stock_orderSet", oOrder, {
                success: () => {
                    MessageToast.show("발주 완료!");
                    this.byId("orderDialog").close();
                },
                error: (oError) => {
                    MessageToast.show("발주 실패");
                }
            });
        },

        // 취소 버튼
        onOrderCancel: function() {
            this.byId("orderDialog").close();
        },

        // 다품목 발주 버튼 클릭 시 Dialog 오픈
        onApplyOrder: function() {
            // 선택된 행 가져오기
            const oTable = this.byId("itemsTable");
            const aSelectedIndices = oTable.getSelectedIndices();
            if (aSelectedIndices.length === 0) {
                MessageToast.show("발주할 품목을 선택하세요.");
                return;
            }
            const oTableModel = this.getView().getModel("tableData");
            const aItems = oTableModel.getProperty("/results");
            // 선택된 품목만 추출
            const aSelectedItems = aSelectedIndices.map(idx => {
                const oItem = Object.assign({}, aItems[idx]);
                oItem.OrderQuantity = oItem.OrderQuantity || 1;
                return oItem;
            });
            // 다이얼로그용 모델 세팅
            const oMultiOrderModel = new sap.ui.model.json.JSONModel({ multiOrderItems: aSelectedItems });
            this.getView().setModel(oMultiOrderModel);
            // 총합계 표시
            this._updateMultiOrderTotal();
            // Dialog 오픈
            this.byId("multiOrderDialog").open();
        },

        // 다품목 발주 수량 변경 시 총합계 갱신
        onMultiOrderQuantityChange: function(oEvent) {
            // Input에서 직접 값 읽어서 모델에 반영
            const oInput = oEvent.getSource();
            const oContext = oInput.getBindingContext();
            const sPath = oContext.getPath();
            const oModel = oContext.getModel();
            const value = parseInt(oInput.getValue(), 10) || 1;
            oModel.setProperty(sPath + "/OrderQuantity", value);

            this._updateMultiOrderTotal();
        },

        _updateMultiOrderTotal: function() {
            const aItems = this.getView().getModel().getProperty("/multiOrderItems");
            let total = 0;
            aItems.forEach(item => {
                total += (parseInt(item.OrderQuantity, 10) || 1) * (item.ItemPrice || 0);
            });
            this.byId("multiOrderTotalPrice").setText(total);
        },

        // 다품목 발주 확인
        onMultiOrderConfirm: function() {
            const aItems = this.getView().getModel().getProperty("/multiOrderItems");
            const sOwner = sessionStorage.getItem("username");
            const oModel = this.getOwnerComponent().getModel();
            const sDate = new Date().toISOString().slice(0,10).replace(/-/g,"");

            let successCount = 0;
            let failCount = 0;
            let totalCount = aItems.length;

            aItems.forEach(item => {
                const oOrder = {
                    OrderItemId: item.ItemId,
                    OrderItemName: item.ItemName,
                    OrderItemQuan: item.OrderQuantity,
                    OrderDate: sDate,
                    OrderOwner: sOwner
                };
                oModel.create("/zcap_stock_orderSet", oOrder, {
                    success: () => {
                        successCount++;
                        if (successCount + failCount === totalCount) {
                            if (failCount > 0) {
                                MessageToast.show(`일부 품목 발주 실패 (${failCount}건), 성공: ${successCount}건`);
                            } else {
                                MessageToast.show(`총 ${successCount}개 품목 발주 완료`);
                            }
                            this.byId("multiOrderDialog").close();
                        }
                    },
                    error: () => {
                        failCount++;
                        if (successCount + failCount === totalCount) {
                            MessageToast.show(`발주 실패: ${failCount}건, 성공: ${successCount}건`);
                            this.byId("multiOrderDialog").close();
                        }
                    }
                });
            });
        },

        // 다품목 발주 취소
        onMultiOrderCancel: function() {
            this.byId("multiOrderDialog").close();
        },
    });
});
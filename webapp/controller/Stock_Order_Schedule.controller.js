sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("convenienterp.controller.Stock_Order_Schedule", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteStock_Order_Schedule").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var sUserId = sessionStorage.getItem("username").padEnd(10, ' ');
            var bFilters = [];
            bFilters.push(new sap.ui.model.Filter("OrderOwner", sap.ui.model.FilterOperator.Contains, sUserId));
            bFilters.push(new sap.ui.model.Filter("OrderStatus", sap.ui.model.FilterOperator.Contains, "승인".padEnd(10, ' ')));
            var oTable = this.byId("orderHistoryTableSCH");

            setTimeout(function () {
                var oBinding = oTable.getBinding("rows");
                if (oBinding) {
                    oBinding.filter(bFilters);
                    console.log("Filters applied:", bFilters);
                } else {
                    console.warn("rows 바인딩이 아직 준비되지 않았습니다.");
                }
            }, 300);
        },

        onApplyFilter: function () {
            const oTable = this.byId("orderHistoryTableSCH");
            const oBinding = oTable.getBinding("rows");

            let aFilters = [];

            // 품목명 필터
            const sOrderItemName = this.byId("orderItemNameFilterSCH").getValue().padEnd(20, ' ');
            if (sOrderItemName) {
                aFilters.push(new sap.ui.model.Filter("OrderItemName", sap.ui.model.FilterOperator.Contains, sOrderItemName));
            }

            // 주문 날짜 필터
            const oDateRange = this.byId("orderDateFilterSCH").getDateValue();
            const oEndDate = this.byId("orderDateFilterSCH").getSecondDateValue();
            if (oDateRange && oEndDate) {
                aFilters.push(new sap.ui.model.Filter({
                    path: "OrderDate",
                    operator: sap.ui.model.FilterOperator.BT,
                    value1: oDateRange,
                    value2: oEndDate
                }));
            }

            // 수량 필터
            const sMinQuantity = this.byId("quantityMinFilterSCH").getValue();
            const sMaxQuantity = this.byId("quantityMaxFilterSCH").getValue();

            if (sMinQuantity) {
                aFilters.push(new sap.ui.model.Filter("OrderItemQuan", sap.ui.model.FilterOperator.GE, parseInt(sMinQuantity, 10)));
            }
            if (sMaxQuantity) {
                aFilters.push(new sap.ui.model.Filter("OrderItemQuan", sap.ui.model.FilterOperator.LE, parseInt(sMaxQuantity, 10)));
            }

            // 상태 필터
            const sStatus = this.byId("orderStatusFilterSCH").getValue().padEnd(10, ' ');
            if (sStatus) {
                aFilters.push(new sap.ui.model.Filter("OrderStatus", sap.ui.model.FilterOperator.Contains, sStatus));
            }
            aFilters.push(new sap.ui.model.Filter("OrderOwner", sap.ui.model.FilterOperator.Contains, sUserId));

            oBinding.filter(aFilters);

            console.log("Filters applied:", sStatus, sOrderItemName, oDateRange, oEndDate, sUserId, sMinQuantity, sMaxQuantity);
        },

        onCompletePress: function (oEvent) {
            const oButton = oEvent.getSource();
            const oContext = oButton.getBindingContext();
            var sUserId = sessionStorage.getItem("username").toUpperCase();

            if (!oContext) {
                MessageToast.show("선택된 데이터가 없습니다.");
                return;
            }

            const oData = oContext.getObject();
            const sOrderPath = oContext.getPath();
            const oModel = this.getView().getModel();

            MessageBox.confirm("정말로 해당 주문을 완료하시겠습니까?", {
                title: "주문 완료 확인",
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        const oPayload = { OrderStatus: "완료" };

                        oModel.update(sOrderPath, oPayload, {
                            success: (oResponseData) => {
                                console.log("주문 상태가 '완료'로 업데이트되었습니다.");
                                console.log(oData);
                                const iNewStockQty =oData.OrderItemQuan;
                                const sStockPath = `/zcap_stocksSet(StockId='${oData.OrderItemId}',UserId='${sUserId}')`;
                                const oPayload2 = { StockQuan: iNewStockQty };
                                console.log(oPayload2);
                                oModel.update(sStockPath, oPayload2, {
                                    success: function() {
                                        console.log("재고 업데이트 성공");
                                        
                                    },
                                    error: function(e) {
                                        console.log("재고 업데이트 실패");
                                        console.error(sStockPath);
                                    }
                                });
                                // ====== 재고 증가 로직 끝 ======

                                // 알람 생성
                                const sOwner = sessionStorage.getItem("username");
                                const qty = oData.OrderItemQuan || 1;
                                const arlam = {
                                    UserId: sOwner,
                                    Content: `${sOwner}님이 ${oData.OrderItemName} ${qty}개 주문을 완료`
                                };
                                oModel.create("/zcap_alarmSet", arlam, {
                                    success: function () {
                                        window.setBellIconState('active');
                                    },
                                    error: function (e) { console.error("알람 생성 실패", e); }
                                });

                                oModel.refresh();
                            },
                            error: (oError) => {
                                let sErrorMessage = "주문 상태 업데이트에 실패했습니다.";
                                if (oError.responseText) {
                                    try {
                                        const oErrorResponse = JSON.parse(oError.responseText);
                                        if (oErrorResponse && oErrorResponse.error && oErrorResponse.error.message && oErrorResponse.error.message.value) {
                                            sErrorMessage = oErrorResponse.error.message.value;
                                        }
                                    } catch (e) {}
                                }
                                MessageBox.error(sErrorMessage);
                            }
                        });
                    }
                }
            });
        }
    });
});
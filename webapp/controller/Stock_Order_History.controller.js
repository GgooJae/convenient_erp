sap.ui.define([
    "sap/ui/core/mvc/Controller"
    , "sap/m/MessageBox"
], function (Controller) {
    "use strict";

    return Controller.extend("convenienterp.controller.Stock_Order_History", {
        onInit: function () {
            const oModel = this.getOwnerComponent().getModel(); // OData 모델 가져오기  

            // 필터 조건 정의
            const aFilters = [
                new sap.ui.model.Filter("OrderStatus", sap.ui.model.FilterOperator.EQ, "Pending")
            ];

            // 데이터 로드 확인
            oModel.read("/zcap_stock_orderSet", {
                filters: aFilters,
                success: (oData) => {
                    console.log("Data loaded successfully:", oData);
                },
                error: (oError) => {
                    console.error("Failed to load data:", oError);
                }
            });
        },
        onApplyFilter: function () {
            const oTable = this.byId("orderHistoryTable");
            const oBinding = oTable.getBinding("rows");

            let aFilters = [];

            // 품목명 필터
            const sOrderItemName = this.byId("orderItemNameFilter").getValue().padEnd(20, ' ');
            if (sOrderItemName) {
                aFilters.push(new sap.ui.model.Filter("OrderItemName", sap.ui.model.FilterOperator.Contains, sOrderItemName));
            }

            // 주문 날짜 필터
            const oDateRange = this.byId("orderDateFilter").getDateValue();
            const oEndDate = this.byId("orderDateFilter").getSecondDateValue();
            if (oDateRange && oEndDate) {
                aFilters.push(new sap.ui.model.Filter({
                    path: "OrderDate",
                    operator: sap.ui.model.FilterOperator.BT,
                    value1: oDateRange,
                    value2: oEndDate
                }));
            }

            // 주문자 필터
            const sOrderOwner = this.byId("orderOwnerFilter").getValue().padEnd(10, ' ');
            if (sOrderOwner) {
                aFilters.push(new sap.ui.model.Filter("OrderOwner", sap.ui.model.FilterOperator.Contains, sOrderOwner));
            }

            // 수량 필터
            const sMinQuantity = this.byId("quantityMinFilter").getValue();
            const sMaxQuantity = this.byId("quantityMaxFilter").getValue();

            if (sMinQuantity) {
                aFilters.push(new sap.ui.model.Filter("OrderItemQuan", sap.ui.model.FilterOperator.GE, parseInt(sMinQuantity, 10)));
            }
            if (sMaxQuantity) {
                aFilters.push(new sap.ui.model.Filter("OrderItemQuan", sap.ui.model.FilterOperator.LE, parseInt(sMaxQuantity, 10)));
            }

            // 필터 적용
            oBinding.filter(aFilters);

            // 필터 적용 로그
            console.log("Filters applied:", aFilters);
        },
        onCancelPress: function (oEvent) {
            // 선택된 행의 컨텍스트 가져오기
            const oContext = oEvent.getSource().getBindingContext();
            const sPath = oContext.getPath(); // 업데이트할 항목의 경로
            const oModel = this.getView().getModel(); // OData 모델 가져오기

            // 선택된 항목의 데이터 가져오기
            const oData = oContext.getObject();

            // 취소 확인 메시지
            sap.m.MessageBox.confirm("정말로 취소하시겠습니까?", {
                onClose: function (sAction) {
                    if (sAction === sap.m.MessageBox.Action.OK) {
                        // OData 모델에서 항목 상태 업데이트
                        const oPayload = {
                            OrderId: oData.OrderId,
                            OrderStatus: "취소"
                        };

                        oModel.update(sPath, oPayload, {
                            success: function () {
                                sap.m.MessageToast.show("상태가 '취소'로 업데이트되었습니다.");
                            },
                            error: function () {
                                sap.m.MessageToast.show("상태 업데이트에 실패했습니다.");
                            }
                        });
                    }
                }
            });
        }

    });
});
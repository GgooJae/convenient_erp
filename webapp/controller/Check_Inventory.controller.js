sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast" // MessageToast 추가
], function (Controller, MessageBox, MessageToast) { // MessageToast 매개변수 추가
    "use strict";

    return Controller.extend("convenienterp.controller.Check_Inventory", {
        onInit: function () {
            // 라우터에서 현재 View의 route 이름을 정확히 입력해야 합니다.
             var oRouter = this.getOwnerComponent().getRouter();
             oRouter.getRoute("RouteCheck_Inventory").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            // 기존 onInit의 필터 적용 로직
            var bFilters = [
                new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.Contains, sessionStorage.getItem("username").toUpperCase().padEnd(20, ' '))
            ];
            var oTable = this.byId("orderHistoryTableCI");

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
            const oTable = this.byId("orderHistoryTableCI");
            const oBinding = oTable.getBinding("rows");
            
            let aFilters = [];

            // 품목명 필터
            const sOrderItemName = this.byId("orderItemNameFilterCI").getValue().padEnd(20, ' ');
            if (sOrderItemName) {
                aFilters.push(new sap.ui.model.Filter("StockName", sap.ui.model.FilterOperator.Contains, sOrderItemName));
            }

            // 수량 필터
            const sMinQuantity = this.byId("quantityMinFilterCI").getValue();
            const sMaxQuantity = this.byId("quantityMaxFilterCI").getValue();

            if (sMinQuantity) {
                aFilters.push(new sap.ui.model.Filter("StockQuan", sap.ui.model.FilterOperator.GE, parseInt(sMinQuantity, 10)));
            }
            if (sMaxQuantity) {
                aFilters.push(new sap.ui.model.Filter("StockQuan", sap.ui.model.FilterOperator.LE, parseInt(sMaxQuantity, 10)));
            }
                aFilters.push(new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.Contains,  sessionStorage.getItem("username").toUpperCase().padEnd(20, ' ')));
            // 정렬 항상 유지
            oBinding.filter(aFilters);
            console.log("Filters applied:", aFilters);

        }
    });
});

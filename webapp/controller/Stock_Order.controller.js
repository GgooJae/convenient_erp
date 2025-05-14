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
            let sName = this.byId("nameFilter").getValue().padEnd(20, " "); // 이름 필터

            if (sMinPrice) {
                aFilters.push(new Filter("ItemPrice", FilterOperator.GE, parseFloat(sMinPrice))); // 필드 이름 수정
            }
            if (sMaxPrice) {    
                aFilters.push(new Filter("ItemPrice", FilterOperator.LE, parseFloat(sMaxPrice))); // 필드 이름 수정
            }
            
            if (sName) {
                sName = sName.padEnd(20, " "); // 20글자가 되도록 뒤에 공백 추가
                aFilters.push(new Filter("ItemName", FilterOperator.Contains, sName)); // 필드 이름 수정
            }

            // 필터 적용
            oBinding.filter(aFilters);

            // aFilters 내용을 요약하여 표시
            const filterSummary = aFilters.map(filter => `${filter.sPath} ${filter.sOperator} ${filter.oValue1}`).join(", ");
            console.log("Filters applied:", aFilters);
            MessageToast.show("Filters applied: " + filterSummary);
        }
    });
});
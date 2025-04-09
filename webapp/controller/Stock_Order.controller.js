sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("convenienterp.controller.Stock_Order", {
        onCategoryFilterChange: function () {
            this._applyFilters();
        },

        onPriceFilterChange: function () {
            this._applyFilters();
        },

        onNameFilterChange: function () {
            this._applyFilters();
        },

        _applyFilters: function () {
            const oTable = this.byId("itemsTable");
            const oBinding = oTable.getBinding("rows");

            let aFilters = [];

            // 카테고리 필터
            const sCategoryKey = this.byId("categoryFilter").getSelectedKey();
            if (sCategoryKey && sCategoryKey !== "all") {
                aFilters.push(new Filter("ItemCategory", FilterOperator.EQ, sCategoryKey));
            }

            // 가격 필터
            const sMinPrice = this.byId("priceMinFilter").getValue();
            const sMaxPrice = this.byId("priceMaxFilter").getValue();
            if (sMinPrice) {
                aFilters.push(new Filter("ItemPrice", FilterOperator.GE, parseFloat(sMinPrice)));
            }
            if (sMaxPrice) {
                aFilters.push(new Filter("ItemPrice", FilterOperator.LE, parseFloat(sMaxPrice)));
            }

            // 아이템 이름 필터
            const sName = this.byId("nameFilter").getValue();
            if (sName) {
                aFilters.push(new Filter("ItemName", FilterOperator.Contains, sName));
            }

            // 필터 적용
            oBinding.filter(aFilters);

            // 필터 적용 결과 메시지
            MessageToast.show("필터가 적용되었습니다.");
        }
    });
});
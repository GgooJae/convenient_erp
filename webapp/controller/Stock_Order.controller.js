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
            const sName = this.byId("nameFilter").getValue();
            const sCategory = this.byId("categoryFilter").getSelectedKey(); // 카테고리 필터

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
    const oModel = this.getOwnerComponent().getModel(); // OData 모델 가져오기

    // zcap_itemsSet 데이터 가져오기
    oModel.read("/zcap_itemsSet", {
        success: (oData) => {
            const aItems = [];
            const aCategories = new Set(); // 중복 제거를 위한 Set 사용

            // 데이터를 분리하고 중복 제거
            oData.results.forEach((item) => {
                // 일반 데이터
                aItems.push(item);

                // 카테고리 중복 제거
                if (item.ItemCategory) {
                    aCategories.add(item.ItemCategory);
                }
            });

            // 테이블 데이터 모델 설정
            const oTableModel = new sap.ui.model.json.JSONModel({ results: aItems });
            this.getView().setModel(oTableModel, "tableData");

            // 중복 제거된 카테고리 데이터를 배열로 변환
            const aCategoryArray = Array.from(aCategories).map((category) => ({
                CategoryKey: category,
                CategoryName: category
            }));

            // Fixed Value 데이터 모델 설정
            const oCategoryModel = new sap.ui.model.json.JSONModel({ CategorySet: aCategoryArray });
            this.getView().setModel(oCategoryModel, "categories");
        },
        error: (oError) => {
            console.error("Failed to fetch data", oError);
        }
    });
}
    });
});
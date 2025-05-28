sap.ui.define([
    "sap/ui/model/json/JSONModel", //의존성 순서 중요
    "sap/ui/core/mvc/Controller",
    "sap/m/Popover",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/MessageBox",
], function (JSONModel,Controller, Popover, List, StandardListItem,MessageBox) {
  "use strict";

  return Controller.extend("convenient.controller.Launchpad", {
    onInit: function () {
            // 라우터 가져오기
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteLaunchpad").attachMatched(this.onRouteMatched, this); // 라우트 매칭 이벤트 핸들러 등록

            // 초기 데이터 로드
            this._updatePendingCount();
        },

        onRouteMatched: function () {
            // 라우트가 매칭될 때마다 숫자 업데이트
            this._updatePendingCount();
        },

        _updatePendingCount: function () {
            const oModel = this.getOwnerComponent().getModel(); // OData 모델 가져오기

            // 필터 조건 정의
            const aFilters = [
                new sap.ui.model.Filter("OrderStatus", sap.ui.model.FilterOperator.Contains, "대기".padEnd(10, ' '))
            ];

            // 데이터 읽기 및 개수 계산
            oModel.read("/zcap_stock_orderSet", {
                filters: aFilters,
                success: (oData) => {
                    const pendingCount = oData.results.length; // "대기" 상태의 항목 개수 계산
                    console.log("성공", oData);

                    // 모델 생성 및 바인딩
                    const oViewModel = new JSONModel({ pendingCount });
                    this.getView().setModel(oViewModel, "viewModel");
                    console.log("Pending Count:", pendingCount);
                },
                error: (oError) => {
                    MessageBox.error("데이터를 불러오는 중 오류가 발생했습니다.");
                    console.error("Failed to load data:", oError);
                }
            });
        },

      onPressInventoryOrder: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteStock_Order");
      },

      onPressCheckInventoryOrder: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteStock_Order_History");
      },

      // onPressInventory: function () {
      //   var oRouter = this.getOwnerComponent().getRouter();
      //   oRouter.navTo("Stock");
      // },

      // onPressSchedule: function () {
      //   var oRouter = this.getOwnerComponent().getRouter();
      //   oRouter.navTo("Schedule");
      // },

      // onPressExpirationDate: function () {
      //   var oRouter = this.getOwnerComponent().getRouter();
      //   oRouter.navTo("ExpirationDate");
      // },

      // onPressSalesDetail: function () {
      //   var oRouter = this.getOwnerComponent().getRouter();
      //   oRouter.navTo("SalesDetail");
      // },

      // onPressPromotion: function () {
      //   var oRouter = this.getOwnerComponent().getRouter();
      //   oRouter.navTo("Promotion");
      // },

      // onPressSalesProfit: function () {
      //   var oRouter = this.getOwnerComponent().getRouter();
      //   oRouter.navTo("SalesProfit");
      // },

      // onPressExpenditureDetails: function () {
      //   var oRouter = this.getOwnerComponent().getRouter();
      //   oRouter.navTo("ExpenditureDetails");
      // }
  });
});
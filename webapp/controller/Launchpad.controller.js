sap.ui.define([
  "sap/ui/model/json/JSONModel", //의존성 순서 중요
  "sap/ui/core/mvc/Controller",
  "sap/m/Popover",
  "sap/m/List",
  "sap/m/StandardListItem",
  "sap/m/MessageBox",
], function (JSONModel, Controller, Popover, List, StandardListItem, MessageBox) {
  "use strict";

  return Controller.extend("convenient.controller.Launchpad", {
    onInit: function () {
      // 라우터 가져오기
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("RouteLaunchpad").attachMatched(this.onRouteMatched, this); // 라우트 매칭 이벤트 핸들러 등록
    },

    onRouteMatched: function () {
      [
        "inventoryOrderTile", "inventoryOrderHistoryTile", "inventoryTile",
        "scheduleTile", "expirationDateTile",
        "hoOrderHistoryTile", "factoryOrderTile", "deliveryTile",
        "factoryScheduleTile", "managerDeliveryScheduleTile"
      ].forEach(id => {
        const tile = this.byId(id);
        if (tile) tile.setVisible(true);
      });

      // 사용자 역할 확인
      const role = (sessionStorage.getItem("userrole") || "").trim().toUpperCase();
      console.log("현재 사용자 ROLE:", role);

      if (role === "HO") {
        // 점주용 타일 숨기기
        this.byId("inventoryOrderTile")?.setVisible(false);
        this.byId("inventoryOrderHistoryTile")?.setVisible(false);
        this.byId("inventoryTile")?.setVisible(false);
        this.byId("scheduleTile")?.setVisible(false);
        this.byId("expirationDateTile")?.setVisible(false);
      }
      //본사용 타일 숨기기기
      else if (role === "MANAGER") {
        this.byId("hoOrderHistoryTile")?.setVisible(false);
        this.byId("factoryOrderTile")?.setVisible(false);
        this.byId("deliveryTile")?.setVisible(false);
        this.byId("factoryScheduleTile")?.setVisible(false);
        this.byId("managerDeliveryScheduleTile")?.setVisible(false);
      }

      // 초기 데이터 로드
      this._updatePendingCount();
    },

    _updatePendingCount: function () {
      const oModel = this.getOwnerComponent().getModel(); // OData 모델 가져오기
      const sUserId = sessionStorage.getItem("username").padEnd(10, ' '); // 사용자 ID 가져오기

      // 필터 조건 정의
      const aFilters = [
        new sap.ui.model.Filter("OrderStatus", sap.ui.model.FilterOperator.Contains, "대기".padEnd(10, ' ')),
        new sap.ui.model.Filter("OrderOwner", sap.ui.model.FilterOperator.Contains, sUserId)
      ];

      const bFilters = [
        new sap.ui.model.Filter("OrderStatus", sap.ui.model.FilterOperator.Contains, "승인".padEnd(10, ' ')),
        new sap.ui.model.Filter("OrderOwner", sap.ui.model.FilterOperator.Contains, sUserId)
      ];

      // 하나의 모델에 두 값을 저장하고 setModel은 한 번만!
      let oViewModel = this.getView().getModel("viewModel");
      if (!oViewModel) {
        oViewModel = new JSONModel({ pendingCount: 0, pendingCount2: 0 });
        this.getView().setModel(oViewModel, "viewModel");
      }

      // 첫 번째 read (대기)
      oModel.read("/zcap_stock_orderSet", {
        filters: aFilters,
        success: (oData) => {
          oViewModel.setProperty("/pendingCount", oData.results.length);
        },
        error: (oError) => {
          MessageBox.error("데이터를 불러오는 중 오류가 발생했습니다.");
          console.error("Failed to load data:", oError);
        }
      });

      // 두 번째 read (승인)
      oModel.read("/zcap_stock_orderSet", {
        filters: bFilters,
        success: (oData) => {
          oViewModel.setProperty("/pendingCount2", oData.results.length);
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

    onPressHOOrderHistory: function () {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("RouteStock_Order_History_HO");
    },

    onPressSchedule: function () {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("RouteStock_Order_Schedule");
    }

    // onPressInventory: function () {
    //   var oRouter = this.getOwnerComponent().getRouter();
    //   oRouter.navTo("Stock");
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
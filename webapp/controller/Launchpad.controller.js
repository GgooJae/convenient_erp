sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Popover",
    "sap/m/List",
    "sap/m/StandardListItem"
], function (Controller, Popover, List, StandardListItem) {
  "use strict";

  return Controller.extend("convenient.controller.Launchpad", {

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
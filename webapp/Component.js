/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "convenienterp/model/models",
        "sap/m/MessageToast"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("convenienterp.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                var oRouter = this.getRouter();
                oRouter.initialize();

                // 로그인 상태 확인 및 라우팅 제한
                oRouter.attachRouteMatched(function (oEvent) {
                    var sRouteName = oEvent.getParameter("name");
                    var bIsLoggedIn = !!sessionStorage.getItem("isLoggedIn"); // 로그인 상태 확인

                    // 로그인되지 않은 상태에서 Launchpad로 이동 시도 차단
                    if (sRouteName === "RouteLaunchpad" && !bIsLoggedIn) {
                        console.warn("Unauthorized access to Launchpad. Redirecting to Login.");
                        oRouter.navTo("RouteLogin", {}, true); // 로그인 화면으로 리다이렉트
                    }
                });

                // URL 변경 감지
                window.onhashchange = function () {
                    var sHash = window.location.hash;
                    console.log("URL changed to:", sHash);

                    // 로그인 화면에서만 URL 입력 차단
                    if (sHash.includes("RouteLogin") && sHash !== "#/") {
                        console.warn("URL navigation to RouteLogin is not allowed.");
                        oRouter.navTo("RouteLogin_2"); // 강제로 로그인 화면으로 리다이렉트
                        
                    }
                };

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
            }
            
        });
    }
);
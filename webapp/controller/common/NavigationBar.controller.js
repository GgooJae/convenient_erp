sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Popover",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Input"
], function (Controller, Popover, List, StandardListItem, Input) {
    "use strict";

    return Controller.extend("convenienterp.controller.common.NavigationBar", {
        onHomeIconPress: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteLaunchpad");
        },

        onSearchIconPress: function (oEvent) {
            var oButton = oEvent.getSource();
            var oView = this.getView();

            if (!this._oSearchPopover) {
                this._oSearchPopover = new Popover({
                    title: "검색",
                    placement: "Bottom",
                    content: [
                        new Input({
                            placeholder: "검색어를 입력하세요",
                            liveChange: this.onSearchLiveChange.bind(this)
                        })
                    ]
                });
                oView.addDependent(this._oSearchPopover);
            }
            this._oSearchPopover.openBy(oButton);
        },

        onSearchLiveChange: function (oEvent) {
            var sSearchValue = oEvent.getParameter("value");
            var oLaunchpadView = this.getView().getParent().getParent(); // Launchpad View 가져오기
            var aTiles = oLaunchpadView.getContent()[0].getItems()[0].getItems(); // 타일 목록 가져오기

            aTiles.forEach(function (oPanel) {
                var oTile = oPanel.getContent()[0];
                if (oTile.getHeader().includes(sSearchValue) && sSearchValue !== "") {
                    // 타일이 보이도록 스크롤
                    oTile.getDomRef().scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                        inline: "nearest"
                    });
                }
            });
            if (sSearchValue !== "") {
                this._oSearchPopover.close();
            }
        },

        onBellIconPress: function (oEvent) {
            var oButton = oEvent.getSource();
            var oView = this.getView();

            if (!this._oBellPopover) {
                this._oBellPopover = new Popover({
                    title: "최근 알림",
                    placement: "Bottom",
                    content: new List({
                        items: [
                            new StandardListItem({ title: "알림1" }),
                            new StandardListItem({ title: "알림2" }),
                            new StandardListItem({ title: "알림3" }),
                            new StandardListItem({ title: "알림4" }),
                            new StandardListItem({ title: "알림5" })
                        ]
                    })
                });

                oView.addDependent(this._oBellPopover);
            }

            this._oBellPopover.openBy(oButton);
        },

        onAccountIconPress: function (oEvent) {
            var oButton = oEvent.getSource();
            var oView = this.getView();

            if (!this._oAccountPopover) {
                this._oAccountPopover = new Popover({
                    title: "사용자 정보",
                    placement: "Bottom",
                    content: new List({
                        items: [
                            new StandardListItem({ title: "정보" }),
                            new StandardListItem({ title: "설정" }),
                            new StandardListItem({ title: "로그아웃" })
                        ]
                    })
                });
                oView.addDependent(this._oAccountPopover);
            }

            this._oAccountPopover.openBy(oButton);
        }
    });
});
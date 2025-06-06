sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast" // MessageToast 추가
], function (Controller, MessageBox, MessageToast) { // MessageToast 매개변수 추가
    "use strict";

    return Controller.extend("convenienterp.controller.Stock_Order_Schedule", {
        onInit: function () {
            // 라우터에서 현재 View의 route 이름을 정확히 입력해야 합니다.
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteStock_Order_Schedule").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            // 기존 onInit의 필터 적용 로직
            var sUserId = sessionStorage.getItem("username").padEnd(10, ' ');
            var bFilters = [
            ];
            bFilters.push(new sap.ui.model.Filter("OrderOwner", sap.ui.model.FilterOperator.Contains, sUserId))
            bFilters.push(new sap.ui.model.Filter("OrderStatus", sap.ui.model.FilterOperator.Contains, "승인".padEnd(10, ' ')) )
            var oTable = this.byId("orderHistoryTableSCH"); //  ID 수정

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
            const oTable = this.byId("orderHistoryTableSCH"); //  ID 수정
            const oBinding = oTable.getBinding("rows");

            let aFilters = [];

            // 품목명 필터
            const sOrderItemName = this.byId("orderItemNameFilterSCH").getValue().padEnd(20, ' '); // ✔ ID 수정
            if (sOrderItemName) {
                aFilters.push(new sap.ui.model.Filter("OrderItemName", sap.ui.model.FilterOperator.Contains, sOrderItemName));
            }

            // 주문 날짜 필터
            const oDateRange = this.byId("orderDateFilterSCH").getDateValue(); // ✔ ID 수정
            const oEndDate = this.byId("orderDateFilterSCH").getSecondDateValue(); // ✔ ID 수정
            if (oDateRange && oEndDate) {
                aFilters.push(new sap.ui.model.Filter({
                    path: "OrderDate",
                    operator: sap.ui.model.FilterOperator.BT,
                    value1: oDateRange,
                    value2: oEndDate
                }));
            }

            // 수량 필터
            const sMinQuantity = this.byId("quantityMinFilterSCH").getValue(); // ✔ ID 수정
            const sMaxQuantity = this.byId("quantityMaxFilterSCH").getValue(); // ✔ ID 수정

            if (sMinQuantity) {
                aFilters.push(new sap.ui.model.Filter("OrderItemQuan", sap.ui.model.FilterOperator.GE, parseInt(sMinQuantity, 10)));
            }
            if (sMaxQuantity) {
                aFilters.push(new sap.ui.model.Filter("OrderItemQuan", sap.ui.model.FilterOperator.LE, parseInt(sMaxQuantity, 10)));
            }

            // 상태 필터
            const sStatus = this.byId("orderStatusFilterSCH").getValue().padEnd(10, ' '); // ✔ ID 수정
            if (sStatus) {
                aFilters.push(new sap.ui.model.Filter("OrderStatus", sap.ui.model.FilterOperator.Contains, sStatus));
            }
            aFilters.push(new sap.ui.model.Filter("OrderOwner", sap.ui.model.FilterOperator.Contains, sUserId));

            // 정렬 항상 유지
            oBinding.filter(aFilters);

            // 필터 적용 로그
            console.log("Filters applied:", sStatus, sOrderItemName, oDateRange, oEndDate, sOrderOwner, sMinQuantity, sMaxQuantity);
        },

        onCompletePress: function (oEvent) {
            const oButton = oEvent.getSource();
            // 버튼이 속한 행의 바인딩 컨텍스트를 가져옵니다.
            // 이 컨텍스트는 UI에 표시하기 위해 이미 로드된 데이터에 대한 참조입니다.
            const oContext = oButton.getBindingContext();

            if (!oContext) {
                MessageToast.show("선택된 데이터가 없습니다.");
                return;
            }

            // 컨텍스트에서 실제 데이터 객체를 가져옵니다.
            // 이것은 새로운 서버 요청(GET)을 보내는 것이 아니라,
            // UI5 모델이 메모리에 가지고 있는 데이터를 가져오는 것입니다.
            const oData = oContext.getObject();
            // 업데이트할 엔티티의 경로를 가져옵니다. 예: /ZCAP_STOCK_ORDERSet('123')
            const sPath = oContext.getPath();
            const oModel = this.getView().getModel(); // OData 모델 가져오기

            // 사용자에게 취소 여부를 확인합니다.
            MessageBox.confirm("정말로 해당 주문을 완료하시겠습니까?", {
                title: "주문 완료 확인",
                onClose: (sAction) => { // 화살표 함수를 사용하여 'this' 컨텍스트 유지 (필요시)
                    if (sAction === MessageBox.Action.OK) {
                        // 서버로 보낼 페이로드(payload)를 구성합니다.
                        // OrderStatus만 변경하므로, 해당 필드만 포함합니다.
                        // OrderId는 sPath를 통해 서버에서 식별합니다.
                        const oPayload = {
                            OrderStatus: "완료"
                        };

                        console.log("Update Request Path:", sPath);
                        console.log("Update Payload:", JSON.stringify(oPayload));

                        // OData 모델의 update 메소드를 호출하여 서버에 변경사항을 전송합니다.
                        // HTTP MERGE 또는 PUT 요청을 통해 UPDATE_ENTITY가 호출됩니다.
                        oModel.update(sPath, oPayload, {
                            success: (oResponseData) => {
                                console.log("Update successful:", oResponseData);
                                MessageToast.show("주문 상태가 '완료'로 업데이트되었습니다.");
                                // 알람 생성 (완료)
                                const sOwner = sessionStorage.getItem("username");
                                const qty = oData.OrderItemQuan || 1;
                                const arlam = {
                                    UserId: sOwner,
                                    Content: `${sOwner}님이 ${oData.OrderItemName} ${qty}개 주문을 완료`
                                };
                                oModel.create("/zcap_alarmSet", arlam, {
                                    success: function () {
                                        window.setBellIconState('active');
                                    },
                                    error: function (e) { console.error("알람 생성 실패", e); }
                                });
                                // UI의 데이터를 최신 상태로 반영하기 위해 모델을 새로고침합니다.
                                // 이는 일반적으로 GET_ENTITYSET 요청을 다시 트리거합니다.
                                oModel.refresh();
                            },
                            error: (oError) => {
                                console.error("Update failed:", oError);
                                let sErrorMessage = "주문 상태 업데이트에 실패했습니다.";
                                // 서버에서 구체적인 오류 메시지를 보냈다면 표시합니다.
                                if (oError.responseText) {
                                    try {
                                        const oErrorResponse = JSON.parse(oError.responseText);
                                        if (oErrorResponse && oErrorResponse.error && oErrorResponse.error.message && oErrorResponse.error.message.value) {
                                            sErrorMessage = oErrorResponse.error.message.value;
                                        }
                                    } catch (e) {
                                        // JSON 파싱 실패 시 기본 오류 메시지 사용
                                        console.warn("Failed to parse error responseText:", e);
                                    }
                                }
                                MessageBox.error(sErrorMessage);
                            }
                        });
                    }
                }
            });
        }
    });
});

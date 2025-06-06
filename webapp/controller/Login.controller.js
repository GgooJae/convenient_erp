sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("convenienterp.controller.Login", {
        onLogin: function () {
            // 사용자 이름과 비밀번호 가져오기
            let sUsername = this.byId("username").getValue();
            let sPassword = this.byId("password").getValue();

            if (!sUsername || !sPassword) {
                MessageToast.show("아이디와 비밀번호를 입력하세요.");
                return;
            }

            // OData 모델 가져오기
            const oModel = this.getOwnerComponent().getModel();

            // 필터 생성
            const aFilters = [
                new sap.ui.model.Filter("User_Id", sap.ui.model.FilterOperator.EQ, sUsername.toUpperCase()) // UserId는 엔티티 속성과 일치
            ];

            // OData 요청
            oModel.read("/zcap_userSet", {
                filters: aFilters,
                success: (oData) => {
                    if (oData.results.length === 0) {
                        // 아이디가 없는 경우
                        MessageToast.show(sUsername + "는 존재하지 않는 아이디입니다.");
                    } else {
                        const oUser = oData.results[0];
                        if (oUser.User_Password === sPassword.toUpperCase()) { // UserPassword는 엔티티 속성과 일치
                            // 로그인 성공
                            MessageToast.show("로그인 성공!");

                            //로그인 세션 초기화
                            sessionStorage.clear();

                            // 로그인 상태 저장
                            sessionStorage.setItem("isLoggedIn", "true");
                            sessionStorage.setItem("username", sUsername); // 필요 시 사용자 이름 저장
                            console.log("ROLE FROM DB:", oUser.User_Role);  // 여기가 null이라면 DB 문제
                            sessionStorage.setItem("userrole", oUser.User_Role); // 역할 저장

                            // Launchpad 화면으로 이동
                            const oRouter = this.getOwnerComponent().getRouter();
                            oRouter.navTo("RouteLaunchpad");
                        } else {
                            // 비밀번호가 틀린 경우
                            MessageToast.show("비밀번호가 틀렸습니다.");
                        }
                    }
                },
                error: (oError) => {
                    console.error("로그인 요청 실패:", oError);
                    MessageToast.show("로그인 중 오류가 발생했습니다.");
                }
            });
        },
        onOpenRegisterDialog: function () {
            // 회원가입 Dialog 열기
            this.byId("registerDialog").open();
        },

        onCloseRegisterDialog: function () {
            // 회원가입 Dialog 닫기
            this.byId("registerDialog").close();
        },
        onRegister: async function () {
            // 회원가입 정보 가져오기
            const sUserNum = this.byId("registerUserNum").getValue();
            const sUserId = this.byId("registerUserId").getValue();
            const sUserPassword = this.byId("registerUserPassword").getValue();

            if (!sUserNum || !sUserId || !sUserPassword) {
                MessageToast.show("모든 필드를 입력하세요.");
                return;
            }

            // 비밀번호 암호화 (SHA-256)
            // const sHashedPassword = await this._hashPassword(sUserPassword);

            // OData 모델 가져오기
            const oModel = this.getOwnerComponent().getModel();

            // 데이터베이스에 저장
            const oNewUser = {
                USER_NUM: sUserNum.trim(), // USER_NUM 필드 이름과 길이 확인
                USER_ID: sUserId.trim(),   // USER_ID 필드 이름과 길이 확인
                USER_PASSWORD: sUserPassword.trim() // USER_PASSWORD 필드 이름과 길이 확인
            };
            console.log("전송될 데이터:", oNewUser);
            oModel.create("/zcap_userSet", oNewUser, {
                // headers: {
                //     "X-CSRF-Token": "토큰값"
                // },
                success: () => {
                    MessageToast.show("회원가입이 완료되었습니다.");
                    this.byId("registerDialog").close();
                },
                error: (oError) => {
                    console.error("회원가입 실패:", oError);
                    MessageToast.show("회원가입 중 오류가 발생했습니다.");
                }
            });
        },

        // _hashPassword: async function (password) {
        //     // SHA-256 해시 생성
        //     const encoder = new TextEncoder();
        //     const data = encoder.encode(password);
        //     const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        //     const hashArray = Array.from(new Uint8Array(hashBuffer));
        //     const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        //     return hashHex;
        // }
    });
});
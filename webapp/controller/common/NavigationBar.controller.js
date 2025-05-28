sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Popover",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Input",
    "sap/m/MessageToast"
], function (Controller, Popover, List, StandardListItem, Input, MessageToast) {
    "use strict";

    return Controller.extend("convenienterp.controller.common.NavigationBar", {
        onHomeIconPress: function () {
            // ✅ 홈으로 가기 전에 이전 강조 제거
            setTimeout(() => {
                const highlighted = document.querySelectorAll(".blinkingHighlight");
                highlighted.forEach(el => el.classList.remove("blinkingHighlight"));
            }, 0);
            
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteLaunchpad");
        },

        onInit: function () {
            // 깜빡임 애니메이션용 스타일을 한 번만 추가
            if (!document.getElementById("highlight-style")) {
                var style = document.createElement('style');
                style.id = "highlight-style";
                style.innerHTML = `
                    @keyframes blinkHighlight {
                        0% { background-color: gray; }
                        50% { background-color: transparent; }
                        100% { background-color: gray; }
                    }

                    .blinkingHighlight {
                        animation: blinkHighlight 1s ease-in-out 3;
                        border-radius: 10px;
                        transition: background-color 0.3s ease-in-out;
                    }
                `;
                document.head.appendChild(style);
            }
        },

        // ✅ 검색창에서 Enter로 검색
        onSearchSubmitEnter: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            this._searchAndScroll(sValue);
        },

        // ✅ 검색 아이콘 클릭 시 검색
        onSearchSubmitButton: function () {
            var sValue = this.byId("searchField").getValue();
            this._searchAndScroll(sValue);
        },

        // ✅ 공통 검색 로직
        _searchAndScroll: function (sSearchValue) {
            sSearchValue = sSearchValue.trim().toLowerCase();
            if (!sSearchValue) return;

            var oLaunchpadView = this.getView().getParent().getParent();
            var oMainVBox = oLaunchpadView.$().find(".sapUiSmallMargin")[0];
            var matchingElement = null;

            oMainVBox.querySelectorAll(".sapMGenericTile, .sapMGT, div").forEach(function (el) {
                if (el.textContent && el.textContent.toLowerCase().includes(sSearchValue)) {
                    matchingElement = el;
                }
            });

            if (matchingElement) {
                matchingElement.scrollIntoView({ behavior: "smooth", block: "center" });

                matchingElement.classList.remove("blinkingHighlight");
                void matchingElement.offsetWidth;
                matchingElement.classList.add("blinkingHighlight");
            } else {
                MessageToast.show("검색 결과가 없습니다.");
            }

            // 검색어 초기화
            var oInput = this.byId("searchField");
            if (oInput) oInput.setValue("");
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
                            new StandardListItem({
                                title: "로그아웃",
                                type: "Active", // 클릭 가능하도록 설정
                                press: this.onLogout.bind(this) // 로그아웃 핸들러 연결
                            })
                        ]
                    })
                });
                oView.addDependent(this._oAccountPopover);
            }

            this._oAccountPopover.openBy(oButton);
        },

        onLogout: function () {
            // 로그아웃 상태로 설정
            sessionStorage.removeItem("isLoggedIn"); // 로그인 상태 제거
            sessionStorage.removeItem("username"); // 필요 시 사용자 이름도 제거

            MessageToast.show("로그아웃되었습니다.");

            // 로그인 화면으로 이동
            var oRouter = this.getOwnerComponent().getRouter();
            if (oRouter) {
                oRouter.navTo("RouteLogin_2");
            } else {
                console.error("Router not found. Navigation failed.");
            }
        },
        onInit: function () {
            // 플로팅 버튼 추가
            if (!document.getElementById("floatingFab")) {
                var btn = document.createElement("button");
                btn.id = "floatingFab";
                btn.innerText = "AI";
                btn.className = "sapMBtn sapMBtnEmphasized";
                btn.onclick = this.onFloatingFabPress.bind(this);
                document.body.appendChild(btn);
            }
            // 채팅창 div 미리 생성(숨김)
            if (!document.getElementById("aiChatBox")) {
                var chatBox = document.createElement("div");
                chatBox.id = "aiChatBox";
                chatBox.style.display = "none";
                chatBox.innerHTML = `
                    <div id="aiChatHeader">
                        AI 상담 챗봇
                        <button id="aiChatCloseBtn" title="닫기">×</button>
                    </div>
                    <div id="aiChatBody">
                        <div style="color:#888; text-align:center; margin-top:20px;">AI 챗봇과의 상담을 시작하세요.</div>
                    </div>
                    <div id="aiChatInputArea">
                        <input id="aiChatInput" type="text" placeholder="메시지를 입력하세요" autocomplete="off"/>
                        <button id="aiChatSendBtn">전송</button>
                    </div>
                `;
                document.body.appendChild(chatBox);

                // 닫기 버튼 이벤트
                document.getElementById("aiChatCloseBtn").onclick = function() {
                    chatBox.style.display = "none";
                };

                // 채팅 전송 함수
                function sendChat() {
                    var input = document.getElementById("aiChatInput");
                    var body = document.getElementById("aiChatBody");
                    var msg = input.value.trim();
                    if (msg) {
                        // 안내 메시지 있으면 지우기
                        var guide = body.querySelector("div[style*='color:#888']");
                        if (guide) guide.remove();
                        // 채팅 메시지 추가
                        var msgDiv = document.createElement("div");
                        msgDiv.className = "aiChatMsgUser";
                        msgDiv.textContent = msg;
                        body.appendChild(msgDiv);
                        body.scrollTop = body.scrollHeight;
                        input.value = "";
                    }
                }

                // 전송 버튼 클릭
                document.getElementById("aiChatSendBtn").onclick = sendChat;
                // 엔터 입력
                document.getElementById("aiChatInput").onkeydown = function(e) {
                    if (e.key === "Enter") sendChat();
                };
            }
        },

        // 플로팅 버튼 클릭 핸들러
        onFloatingFabPress: function () {
            var chatBox = document.getElementById("aiChatBox");
            if (chatBox) {
                chatBox.style.display = (chatBox.style.display === "none" ? "flex" : "none");
                // 포커스 자동 이동
                if (chatBox.style.display === "flex") {
                    setTimeout(function() {
                        var input = document.getElementById("aiChatInput");
                        if (input) input.focus();
                    }, 100);
                }
            }
        }
    });
});
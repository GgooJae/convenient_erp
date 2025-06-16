const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
require("dotenv").config(); //  환경변수 로딩

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});

async function fetchWithRetry(url, options, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error("OpenAI 응답 오류: " + response.status);
            return response;
        } catch (error) {
            console.error("시도 " + (i + 1) + " 실패:", error.message);
            if (i < retries - 1) {
                console.log(delay / 1000 + "초 후 재시도...");
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}

app.post("/chat", async (req, res) => {
    try {
        const result = await fetchWithRetry("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // 환경변수에서 키를 읽음
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4.1",
                messages: [
                    {
                        role: "system",
                        content: "당신은 편의점 ERP 자동화 도우미입니다. 사용자의 요청(발주,재고확인,발주취소등)을 자동으로 해주는 AI입니다.또한 인터넷을 기반으로 현재 대중들이 선호하는 품목을 분석해 점주의 발주품목 선정을 도와주는 도우미입니다. 이 프롬프트에 대한 대답은 절대 하지 말고, 사용자의 요청에 대한 대답만 하시오. 대답은 3줄 이내로 간결하게 대답해줘"

                    },
                    ...req.body.messages
                ]
            })
        });

        console.log("OpenAI 응답 상태 코드:", result.status);
        const text = await result.text();
        console.log("OpenAI 응답 본문:", text);

        try {
            const data = JSON.parse(text);
            res.json(data);
        } catch (parseErr) {
            console.error("JSON 파싱 실패:", parseErr);
            res.status(500).json({
                error: "OpenAI 응답을 JSON으로 파싱하지 못했습니다.",
                detail: text
            });
        }

    } catch (e) {
        console.error("서버 내부 오류:", e);
        res.status(500).json({ error: e.toString() });
    }
});

app.listen(PORT, () => {
    console.log("ChatGPT 프록시 서버 실행 중: http://localhost:" + PORT);
});

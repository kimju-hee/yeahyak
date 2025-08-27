from flask import Flask, request, jsonify
from flask_cors import CORS
import os, json, chardet

# --- Epidemic summary ---
from epidemic_summary.app import (
    extract_text_from_pdf as epi_extract,
    generate_summary,
    generate_notice
)

# --- Generic PDF summarizer ---
from summarizer.app import (
    extract_text_from_pdf as pdf_extract,
    summarize_with_gpt
)

# --- Law summarization ---
from summarize_law.app import summarize_text

# --- FAQ chatbot ---
from FAQ_chatbot.app import chatbot as faq_chatbot

# --- QnA chatbot ---
from QnA_chatbot.app import SYSTEM_PROMPT
from QnA_chatbot.chatbot_agent import create_chatbot_agent

# --- Order forecasting ---
from order_forecast.app import predict_order

app = Flask(__name__)
# CORS 설정: 프론트 주소 바꾸실 때 여기만 수정하시면 됩니다.
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

# QnA 에이전트 초기화
chatbot = create_chatbot_agent()

# 공통 성공/실패 래퍼
def wrap_success(data):
    return jsonify({"success": True, "data": data, "error": None})

def wrap_error(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg}), code

# 1) 전염병 요약
@app.route('/summarize/epidemic', methods=['POST'])
def epidemic():
    file = request.files.get("file")
    if not file or not file.filename.lower().endswith(".pdf"):
        return wrap_error("PDF 파일을 업로드 해주세요", 400)
    try:
        text    = epi_extract(file)
        summary = generate_summary(text)
        notice  = generate_notice(summary)
        return wrap_success({"summary": summary, "notice": notice})
    except Exception as e:
        return wrap_error(str(e), 500)

# 2) 일반 PDF 요약
@app.route('/summarize/pdf', methods=['POST'])
def summarize_pdf():
    file = request.files.get("file")
    if not file or not file.filename.lower().endswith(".pdf"):
        return wrap_error("PDF 파일을 업로드 해주세요", 400)
    try:
        text   = pdf_extract(file)
        result = summarize_with_gpt(text)
        return wrap_success({"summary": result})
    except Exception as e:
        return wrap_error(str(e), 500)

# 3) 법률 텍스트 요약
@app.route('/summarize/law', methods=['POST'])
def summarize_law_route():
    file = request.files.get("file")
    if not file or not file.filename.lower().endswith(".txt"):
        return wrap_error("TXT 파일을 업로드 해주세요", 400)
    try:
        raw      = file.read()
        detect   = chardet.detect(raw)
        encoding = detect['encoding'] or 'utf-8'
        content  = raw.decode(encoding, errors="replace")
        summary  = summarize_text(content)
        return wrap_success({"summary": summary})
    except Exception as e:
        return wrap_error(str(e), 500)

# 4) FAQ 챗
@app.route('/chat/faq', methods=['POST'])
def faq_chat():
    try:
        data    = request.get_json(force=True)
        query   = data.get("query") or data.get("question")
        history = data.get("history", [])
        if not query:
            return wrap_error("질문이 비어있습니다.", 400)

        result = faq_chatbot.invoke({"question": query})
        answer = result.get("answer", str(result))
        return wrap_success({
            "reply":   answer,
            "history": history + [
                {"type": "human", "content": query},
                {"type": "ai",    "content": answer}
            ]
        })
    except Exception as e:
        return wrap_error(str(e), 500)

# 5) QnA 챗
@app.route('/chat/qna', methods=['POST'])
def qna_chat():
    if not request.is_json:
        return wrap_error("요청 형식이 application/json이 아닙니다.", 400)
    try:
        data    = request.get_json(force=True)
        query   = data.get("query")
        history = data.get("history", [])
        if not query:
            return wrap_error("query가 비어있습니다.", 400)

        from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
        messages = [SystemMessage(content=SYSTEM_PROMPT)]
        for msg in history:
            if msg["type"] == "human":
                messages.append(HumanMessage(content=msg["content"]))
            else:
                messages.append(AIMessage(content=msg["content"]))
        messages.append(HumanMessage(content=query))

        result = chatbot.invoke({"messages": messages})
        answer = result["messages"][-1].content
        return wrap_success({
            "reply":   answer,
            "history": history + [
                {"type": "human", "content": query},
                {"type": "ai",    "content": answer}
            ]
        })
    except Exception as e:
        return wrap_error(str(e), 500)

# 6) 주문 예측
@app.route('/forecast/order', methods=['POST'])
def order_forecast_route():
    if 'file' not in request.files:
        return wrap_error("CSV file is missing", 400)
    try:
        return predict_order(request.files['file'])
    except Exception as e:
        return wrap_error(str(e), 500)

# --- 헬스체크 ---
@app.get("/health")
def health(): 
    return "ok", 200

if __name__ == '__main__':
    print("🚀 Gateway 서버 실행 중... http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)

# --- add: 기본 설정(파일 업로드 크기/타임아웃 대비) ---
app.config["MAX_CONTENT_LENGTH"] = 15 * 1024 * 1024   # 15MB 업로드 제한


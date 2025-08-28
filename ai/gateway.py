import chardet
import fitz
from chatbot_faq.app import get_chatbot, vectordb
from chatbot_qna.app import SYSTEM_PROMPT
from chatbot_qna.chatbot_agent import create_chatbot_agent
from flask import Flask, jsonify, request
from flask_cors import CORS
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from openai import APIError
from order_forecast.app import predict_order
from summarize_epidemic.app import generate_notice, generate_summary
from summarize_law.app import summarize_text
from summarize_newproduct.app import summarize_pdf

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 30 * 1024 * 1024  # 30MB 업로드 제한
# CORS 설정(프론트 주소 변경 시 수정)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

qna_chatbot = create_chatbot_agent()


def extract_text_from_pdf(file_storage):
    print("📚 PDF 텍스트 추출 함수 시작")
    text = ""
    try:
        print("📖 PDF 파일 열기 시도...")
        with fitz.open(stream=file_storage.read(), filetype="pdf") as doc:
            print(f"📄 PDF 페이지 수: {len(doc)}")
            for i, page in enumerate(doc):
                page_text = page.get_text()
                text += page_text
                print(f"📄 페이지 {i+1}: {len(page_text)} 문자 추출")
        print(f"✅ 총 텍스트 추출 완료: {len(text)} 문자")
        return text
    except Exception as e:
        print(f"🚨 PDF 추출 에러: {e}")
        raise e


def wrap_success(data, code=200):
    return jsonify({"success": True, "data": data, "error": None}), code


def wrap_error(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg}), code


# 1) 감염병 요약
@app.route("/summarize/epidemic", methods=["POST"])
def epidemic():
    file = request.files.get("file")

    if not file or not file.filename.lower().endswith(".pdf"):
        return wrap_error("PDF 파일을 업로드 해주세요.", 400)
    try:
        text = extract_text_from_pdf(file)
        summary = generate_summary(text)
        notice = generate_notice(summary)
        return wrap_success({"summary": summary, "notice": notice})
    except APIError as api_e:
        return wrap_error(str(api_e), 502)
    except Exception as e:
        return wrap_error(str(e), 500)


# 2) 법령 요약
@app.route("/summarize/law", methods=["POST"])
def law():
    file = request.files.get("file")

    if not file or not file.filename.lower().endswith(".txt"):
        return wrap_error("TXT 파일을 업로드 해주세요.", 400)
    try:
        raw = file.read()
        detect = chardet.detect(raw)
        encoding = detect["encoding"] or "utf-8"
        content = raw.decode(encoding, errors="replace")
        summary = summarize_text(content)
        return wrap_success({"summary": summary})
    except APIError as api_e:
        return wrap_error(str(api_e), 502)
    except Exception as e:
        return wrap_error(str(e), 500)


# 3) 약품 요약
@app.route("/summarize/new-product", methods=["POST"])
def new_product():
    print("🚀 신제품 요약 요청 받음")

    file = request.files.get("file")
    print(f"📁 파일 정보: {file}")

    if file:
        print(f"📄 파일명: {file.filename}")
        print(f"📊 파일 크기: {len(file.read())} bytes")
        file.seek(0)  # 파일 포인터 리셋

    if not file or not file.filename.lower().endswith(".pdf"):
        print("❌ PDF 파일이 아님")
        return wrap_error("PDF 파일을 업로드 해주세요.", 400)

    try:
        print("📖 PDF에서 텍스트 추출 시작...")
        text = extract_text_from_pdf(file)
        print(f"📝 추출된 텍스트 길이: {len(text)} 문자")
        print(f"📝 텍스트 미리보기: {text[:200]}...")

        print("🤖 AI 요약 시작...")
        summary = summarize_pdf(text)
        print(f"✅ AI 요약 완료: {len(summary)} 문자")
        print(f"📋 요약 미리보기: {summary[:100]}...")

        return wrap_success({"summary": summary})
    except APIError as api_e:
        print(f"🚨 OpenAI API 에러: {api_e}")
        return wrap_error(str(api_e), 502)
    except Exception as e:
        print(f"🚨 일반 에러: {e}")
        print(f"🚨 에러 타입: {type(e)}")
        import traceback

        print(f"🚨 스택 트레이스: {traceback.format_exc()}")
        return wrap_error(str(e), 500)


# 4) FAQ 챗봇
@app.route("/chat/faq", methods=["POST"])
def faq_chat():
    try:
        data = request.get_json(force=True)
        question = data.get("question")
        history = data.get("history", [])

        if not question:
            return wrap_error("질문이 없습니다.", 400)

        pairs = []
        pending_user_msg = None
        for item in history:
            if item.get("type") == "user":
                pending_user_msg = item.get("content", "")
            elif item.get("type") == "ai" and pending_user_msg is not None:
                pairs.append((pending_user_msg, item.get("content", "")))
                pending_user_msg = None

        faq_chatbot = get_chatbot(vectordb)
        result = faq_chatbot.invoke({"question": question, "chat_history": pairs})
        answer = result.get("answer", str(result))
        return wrap_success(
            {
                "answer": answer,
                "history": history
                + [
                    {"type": "user", "content": question},
                    {"type": "ai", "content": answer},
                ],
            }
        )
    except APIError as api_e:
        return wrap_error(str(api_e), 502)
    except Exception as e:
        return wrap_error(str(e), 500)


# 5) QNA 챗봇
@app.route("/chat/qna", methods=["POST"])
def qna_chat():
    try:
        data = request.get_json(force=True)
        question = data.get("question")
        history = data.get("history", [])

        if not question:
            return wrap_error("질문이 없습니다.", 400)

        messages = [SystemMessage(content=SYSTEM_PROMPT)]
        for message in history:
            if message["type"] == "user":
                messages.append(HumanMessage(content=message["content"]))
            else:
                messages.append(AIMessage(content=message["content"]))
        messages.append(HumanMessage(content=question))

        result = qna_chatbot.invoke({"messages": messages})
        answer = result["messages"][-1].content
        return wrap_success(
            {
                "answer": answer,
                "history": history
                + [
                    {"type": "user", "content": question},
                    {"type": "ai", "content": answer},
                ],
            }
        )
    except APIError as api_e:
        return wrap_error(str(api_e), 502)
    except Exception as e:
        return wrap_error(str(e), 500)


# 6) 발주 예측
@app.route("/forecast/order", methods=["POST"])
def order_forecast():
    file = request.files.get("file")

    if not file or not file.filename.lower().endswith(".csv"):
        return wrap_error("CSV 파일을 업로드 해주세요.", 400)
    try:
        return predict_order(file)
    except Exception as e:
        return wrap_error(str(e), 500)


@app.get("/health")
def health():
    return "ok", 200


if __name__ == "__main__":
    print("🚀 Gateway 서버 실행 중... http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)

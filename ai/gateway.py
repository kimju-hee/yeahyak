from flask import Flask, request, jsonify
from epidemic_summary.app import *
from summarizer.app import *
from FAQ_chatbot.app import chatbot as faq_chatbot
from QnA_chatbot.app import chatbot
from order_forecast.app import *

import json
import chardet

app = Flask(__name__)

@app.route('/summarize/epidemic', methods=['POST'])
def epidemic():
    file = request.files.get("file")
    if not file or not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "PDF 파일을 업로드 해주세요"}), 400

    try:
        text = extract_text_from_pdf(file)
        summary = generate_summary(text)
        notice = generate_notice(summary)
        return jsonify({"summary": summary, "notice": notice})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/summarize/pdf', methods=['POST'])
def summarize_pdf():
    file = request.files.get("file")
    if not file or not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "PDF 파일을 업로드 해주세요"}), 400

    try:
        text = extract_text_from_pdf(file)
        result = summarize_with_gpt(text)
        return jsonify({"summary": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/summarize/law', methods=['POST'])
def summarize_law_route():
    import chardet
    try:
        file = request.files.get("file")
        if not file or not file.filename.lower().endswith(".txt"):
            return jsonify({"error": "TXT 파일을 업로드 해주세요"}), 400

        # 자동 인코딩 감지
        raw_data = file.read()
        detected = chardet.detect(raw_data)
        encoding = detected['encoding'] or 'utf-8'
        print(f"[INFO] Detected encoding: {encoding}")

        content = raw_data.decode(encoding, errors="replace") # 디코딩 시 오류 발생 시 대체 문자 사용

        summary = summarize_text(content)
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/chat/faq', methods=['POST'])
def faq_chat():
    import traceback
    from langchain_core.messages import HumanMessage, AIMessage

    try:
        try:
            data = request.get_json(force=True)
        except Exception:
            raw = request.get_data()
            detect = chardet.detect(raw)
            encoding = detect['encoding'] or 'utf-8'
            print(f"[INFO] Detected Encoding: {encoding}")

            try:
                data = json.loads(raw.decode(encoding))
            except Exception as e:
                return jsonify({
                    "error": f"JSON 디코딩 실패 - 감지된 인코딩: {encoding}, 에러: {str(e)}"
                }), 400

        query = data.get("query") or data.get("question")
        history = data.get("history", [])

        if not query:
            return jsonify({"error": "질문이 비어있습니다."}), 400

        # ✅ FAQ 모델은 messages 지원 X → 마지막 질문만 추출해 단독으로 사용
        result = faq_chatbot.invoke({"question": query})

        answer = result["answer"] if isinstance(result, dict) else str(result)

        return jsonify({
            "reply": answer,
            "history": history + [
                {"type": "human", "content": query},
                {"type": "ai", "content": answer}
            ]
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/chat/qna', methods=['POST'])
def qna_chat():
    if not request.is_json:
        return jsonify({"error": "요청 형식이 application/json이 아닙니다."}), 400

    try:
        data = request.get_json(force=True) 
        query = data.get("query")
        history = data.get("history", [])

        if not query:
            return jsonify({"error": "query가 비어있습니다."}), 400

        from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
        from QnA_chatbot.app import chatbot, SYSTEM_PROMPT

        messages = [SystemMessage(content=SYSTEM_PROMPT)]
        for msg in history:
            if msg["type"] == "human":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["type"] == "ai":
                messages.append(AIMessage(content=msg["content"]))
        messages.append(HumanMessage(content=query))

        result = chatbot.invoke({"messages": messages})
        answer = result["messages"][-1].content

        return jsonify({
            "reply": answer,
            "history": history + [
                {"type": "human", "content": query},
                {"type": "ai", "content": answer}
            ]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/forecast/order', methods=['POST'])
def order_forecast():
    if 'file' not in request.files:
        return jsonify({'error': 'CSV file is missing'}), 400

    file = request.files['file']
    return predict_order(file)  

# gateway.py 최상단에 import 추가
from summarize_law.app import summarize_text
import os


if __name__ == '__main__':
    print("🚀 Gateway 서버 실행 중... http://localhost:5000")
    app.run(port=5000)

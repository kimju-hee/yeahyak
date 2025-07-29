from flask import Flask, request, jsonify
from epidemic_summary.app import *
from summarizer.app import *
# from FAQ_chatbot.app import chatbot
from QnA_chatbot.app import chatbot

from order_forecast.app import *
import pandas as pd

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

# @app.route('/faq/query', methods=['POST'])
# def faq():
#     question = request.json.get("question")
#     result = chatbot.invoke({'question': question})
#     return jsonify({"answer": result['answer']})

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


if __name__ == '__main__':
    print("🚀 Gateway 서버 실행 중... http://localhost:5000")
    app.run(port=5000)

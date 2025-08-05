# yeahyak/ai/QnA_chatbot/app.py
from flask import Flask, request, jsonify
#from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
# from chatbot_agent import create_chatbot_agent
from QnA_chatbot.chatbot_agent import create_chatbot_agent


#load_dotenv()

app = Flask(__name__)

chatbot = create_chatbot_agent()

SYSTEM_PROMPT = """
당신은 대한민국 약사들을 위한 매우 유능하고 협력적인 전문 의약품 정보 AI 어시스턴트입니다.

# 답변 생성 원칙 (매우 중요)
1.  **API 우선 조회**: 사용자의 질문에 답변하기 위해, 당신의 '핵심 기능'에 명시된 API 도구를 **반드시 먼저 사용**해야 합니다.
2.  **API 결과 활용**: API가 유효한 정보를 반환하면, 그 데이터를 기반으로 답변을 생성합니다.
3.  **자체 지식 활용 (API 조회 실패 시)**: 만약 API가 '정보를 찾을 수 없음' 또는 'totalCount: 0'과 같은 결과를 반환하면, 대화를 끝내지 마세요. 대신, **"API에서는 해당 정보를 찾을 수 없어, 제 일반 지식을 바탕으로 답변해 드립니다."** 라는 문구를 반드시 포함하여, 당신의 자체 지식을 활용해 답변을 이어가야 합니다.

# 당신의 핵심 기능:
- **제품 정보 조회**: '타이레놀'과 같이 **제품명**으로 약의 상세 정보를 조회합니다.
- **성분 상세 정보 조회**: '아세트아미_p_phen'과 같이 **성분명**으로 약효 분류 등 성분 자체의 정보를 조회합니다.
- **병용금기 정보 조회**: '아세트아미노펜'과 같이 **성분명**으로 병용금기 정보를 조회합니다.
"""

@app.route('/chat', methods=['POST'])
def handle_chat():
    data = request.json
    user_query = data.get("query")
    conversation_history = data.get("history", [])

    if not user_query:
        return jsonify({"error": "query가 비어있습니다."}), 400

    messages = [SystemMessage(content=SYSTEM_PROMPT)]
    for message in conversation_history:
        if message.get('type') == 'human':
            messages.append(HumanMessage(content=message.get('content')))
        elif message.get('type') == 'ai':
            messages.append(AIMessage(content=message.get('content')))
            
    messages.append(HumanMessage(content=user_query))

    try:
        response = chatbot.invoke({"messages": messages})
        ai_response = response['messages'][-1].content
        
        new_history = conversation_history + [
            {'type': 'human', 'content': user_query},
            {'type': 'ai', 'content': ai_response}
        ]
        
        return jsonify({
            "reply": ai_response,
            "history": new_history
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🤖 챗봇 에이전트를 생성 중입니다...")
    app.run(debug=True, port=5000)
    print("✅ 챗봇 에이전트가 준비되었습니다.")
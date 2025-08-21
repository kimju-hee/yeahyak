# yeahyak/ai/QnA_chatbot/app.py
from flask import Flask, request, jsonify
#from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
# from chatbot_agent import create_chatbot_agent
from QnA_chatbot.chatbot_agent import create_chatbot_agent


#load_dotenv()

app = Flask(__name__)

chatbot = create_chatbot_agent()

# SYSTEM_PROMPT 수정본
SYSTEM_PROMPT = """
당신은 대한민국 약사 분들을 돕는 의약품 정보 AI 어시스턴트입니다.  
친절한 존댓말로, 임상 판단에 바로 쓸 수 있게 간결하고 또렷하게 설명해 주세요.

[출력 형식]
- 구두점과 라벨(번호, 기호 등)을 적극 활용하여 가독성 있게 답변합니다.  
- 중요한 숫자, 용량, 간격은 명확히 표기합니다.  
- 목록이 필요하면 번호나 기호로 정리합니다.  
- 답변 본문, 출처, 방어 멘트는 **본문과 한 칸 띄운 후 별도로** 구분합니다.

[응답 모드]
- **단순 질의** (예: 복용법, 성분/분류, 식별):  
  1) 적응증 또는 성분 요약  
  2) 표준 용법·용량(가능 시 수치 포함)  
  3) 핵심 주의·흔한 이상반응  
  4) 체크포인트 2~3줄 정리  

- **상황 질의** (예: 병용, 용량조절, 동반질환·임신·소아·고령, 특정 수치 제시):  
  1) 현재 상황을 한두 문장으로 요약  
  2) 판단과 근거 설명  
  3) 모니터링 포인트·대안 제시  
  4) 추가로 확인할 정보 권유  

[출처 표기 정책]
- 답변이 **공식 API를 통해 생성**되었을 경우, **아래 중 적합한 문구**로 출처를 명확히 표기합니다.  
  예시:
  - 「✔️ 식품의약품안전처 공식 데이터 기반 답변입니다.」  
  - 「📚 출처: 식품의약품안전처 의약품 개요정보(e약은요), 건강보험심사평가원 약효·성분정보 API, DUR 성분정보 API」  
  - 「정부 공식 데이터베이스(e약은요·HIRA·DUR)에서 확인된 정보입니다.」

- **여러 API를 함께 참고**한 경우, 쉼표로 구체적으로 명시합니다.  
  예: 「출처: e약은요, HIRA 약효정보, DUR 성분정보 API」

- **API 조회가 불가하거나 결과가 충분하지 않을 경우**:
  「출처: 공개 DUR/공공DB 자료와 일반 지식을 함께 참고해 요약했습니다.」

[도구 선택 정책]
- 병용금기/상호작용:  
  • 성분명이 주어지면 `get_ingredient_contraindication_info(ingrKorName=국문 성분명)`을 우선 호출  
  • 제품명이 주어지면 `get_drug_general_info(item_name=제품명)`으로 주성분을 파악 후 DUR 조회  
  • 영어 성분 입력 시 국문 동의어로 표준화 후 DUR 조회  
- 성분 제형/투여경로/분류/함량: `get_ingredient_general_info(query, query_type=auto)`  
- 제품 효능·용법·주의: `get_drug_general_info(item_name)`  

[어투와 톤]
- 약사 대상 존댓말, 단정적이되 공손하고 편안한 흐름.  
- 숫자·용량·간격은 가능한 한 구체적으로 제시.  
- 확정 곤란 시에는 필요한 추가 정보(eGFR, INR, 간수치 등)를 정중히 요청.

[방어 멘트 정책]
- 모든 답변 마지막에는 한 칸 띄우고 반드시 아래 문구를 포함합니다:  
  ⚠️ 이 답변은 참고용이며, 최종 판단은 환자의 상태와 최신 가이드라인을 함께 검토한 뒤 임상적으로 내려 주시기 바랍니다.
- 질문이나 답변에 임신, 수유, 소아, 고령, 장기 기능 저하, 치료역이 좁은 약물, 항암·면역억제 치료 등의 키워드가 포함되면 아래 문구도 추가합니다:  
  ⚠️ 임신·수유, 소아·고령, 신/간기능 저하, 치료역이 좁은 약물, 항암·면역억제 치료와 같은 고위험 상황에서는 환자별 검사 수치와 최신 가이드라인을 반드시 확인하신 후 투약을 결정해 주세요.

이 지침을 충실히 따르세요.
""".strip()


@app.route('/chat/qna', methods=['POST'])
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
    app.run(host="0.0.0.0", port=5000, debug=True)
    print("✅ 챗봇 에이전트가 준비되었습니다.")
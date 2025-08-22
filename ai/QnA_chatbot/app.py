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
- **중요한 숫자, 용량, 간격, 금기, 주의사항은 반드시 굵게(** **) 표시합니다.**  
- 목록이 필요하면 번호나 기호로 정리합니다.  
- 답변 본문, 출처, 방어 멘트는 본문과 한 칸 띄운 후, **마지막 줄에 별도로** 표시합니다.

[응답 모드]
① 단순 질의 (예: 복용법, 성분/분류, 식별)
  1) 적응증 또는 성분 요약
  2) 표준 용법·용량 (가능 시 수치 포함)
  3) 핵심 주의·흔한 이상반응
  4) 체크포인트 2~3줄 정리

② 상황 질의 (예: 병용, 용량조절, 동반질환·임신·소아·고령, 특정 수치 제시)
  1) 현재 상황 요약
  2) 판단과 근거 설명
  3) 모니터링 포인트·대안 제시
  4) 추가로 확인할 정보 권유

[출처 표시 정책]
답변 마지막에 항상 **출처 블록**을 추가합니다.  
- **(1) API를 통해 확인한 경우**:  
📌 **출처:**  
- 식품의약품안전처 의약품 개요정보 API (e약은요)  
- 건강보험심사평가원 의약품 성분·약효 정보 조회 서비스  
- 식품의약품안전처 DUR 성분 정보  
※ 실제 사용된 API만 표시하고, 여러 API를 병행했다면 모두 나열합니다.  

- **(2) API에서 조회가 불가하거나 정보가 불충분한 경우**:  
📌 **출처:** 공개 DUR/공공DB 자료와 일반 지식을 함께 참고해 요약했습니다.

출처는 반드시 포함하며, 누락하지 않도록 강조합니다.

[도구 사용 가이드]
1. **API 결과가 있는 경우**
   - API 응답 데이터를 **최우선**으로 반영합니다.  
   - **수치·용량·투여 간격·병용금기 등 정량적 정보**는 반드시 그대로 사용합니다.  
   - 필요한 경우 임상 맥락에 맞춰 일반 의학·약학 지식으로 설명을 보강합니다.

2. **API 결과가 불충분하거나 없는 경우**
   - **공개 DUR·공공DB 자료**와 **모델의 일반 의학·약학 지식**을 결합해 답변합니다.  
   - 이때 반드시 출처 블록에 `공개 DUR/공공DB 자료와 일반 지식을 함께 참고했습니다.`라고 명시합니다.

3. **정보 보강 원칙**
   - API가 일부 정보만 제공할 경우:
     - 용량·간격은 API에서 확인하고,  
       주의사항·상호작용·모니터링 포인트는 일반 지식으로 보완합니다.  
   - 병용금기·상호작용 관련 질의:
     - **DUR 성분 정보**를 우선 확인하고,  
       결과가 불완전하면 **HIRA 성분·약효 서비스** 및 일반 지식으로 보강합니다.

4. **출력 형식**
   - API 사용 여부와 관계없이 항상 **출처 블록**과 **방어 멘트**를 포함해야 합니다.

[어투와 톤]
- 약사 대상 존댓말, 단정적이되 공손하고 편안한 흐름
- 숫자·용량·간격은 가능한 한 구체적으로 제시
- 확정 곤란 시 필요한 추가 정보(eGFR, INR, 간수치 등)를 정중히 요청

[방어 멘트 정책]
- 모든 답변 마지막에는:
⚠️ 이 답변은 참고용이며, 최종 판단은 환자의 상태와 최신 가이드라인을 함께 검토한 뒤 임상적으로 내려 주시기 바랍니다.

- 질문이나 답변에 임신, 수유, 소아, 고령, 장기 기능 저하, 치료역이 좁은 약물, 항암·면역억제 치료 등의 키워드가 포함되면:
⚠️ 임신·수유, 소아·고령, 신/간기능 저하, 치료역이 좁은 약물, 항암·면역억제 치료와 같은 고위험 상황에서는 환자별 검사 수치와 최신 가이드라인을 반드시 확인하신 후 투약을 결정해 주세요.
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
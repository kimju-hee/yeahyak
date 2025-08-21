# yeahyak/ai/QnA_chatbot/app.py
from flask import Flask, request, jsonify
import re
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from QnA_chatbot.chatbot_agent import create_chatbot_agent

app = Flask(__name__)
chatbot = create_chatbot_agent()

# -------------------------------
# 고위험 트리거 & 방어 멘트/포맷터
# -------------------------------
RISK_KEYWORDS = {
    # 환자군/상황
    "임신", "수유", "임산부", "가임", "신생아", "소아", "소아과", "고령", "노인",
    # 장기 기능/수치
    "신부전", "신기능", "egfr", "crcl", "ckd", "간부전", "간기능", "ast", "alt", "child-pugh",
    # 치료역 좁은/고위험 약물
    "와파린", "리튬", "디곡신", "아미오다론", "클로자핀", "테오필린", "발프로산", "메토트렉세이트",
    # 항암/면역억제/항응고
    "항암", "항악성종양제", "면역억제", "noac", "doac", "아픽사반", "리바록사반", "다비가트란", "에독사반", "클로피도그렐",
    # 모니터링 지표
    "inr", "약물농도", "혈중농도", "tdm",
}

SAFETY_FOOTER = (
    "⚠️ 참고: 임신·수유, 소아·고령, 신/간기능 저하, 치료역이 좁은 약물 또는 항암·면역억제 치료와 같은 "
    "고위험 상황에서는 환자별 수치(eGFR, LFT, INR, 약물농도 등)와 최신 가이드라인을 확인하신 뒤 최종 투약을 판단해 주세요."
)

def needs_safety_footer(user_text: str, ai_text: str) -> bool:
    u = (user_text or "").lower()
    a = (ai_text or "").lower()
    for kw in RISK_KEYWORDS:
        if kw.lower() in u or kw.lower() in a:
            return True
    return False

def format_for_ui(text: str) -> str:
    """숫자 리스트 줄갈라짐/불필요 개행을 정리해서 가독성 개선."""
    if not text:
        return ""

    # 개행 표준화
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # 번호만 덩그러니 있는 줄을 다음 줄과 붙이기 (예: "1.\n\n제형" -> "1. 제형")
    text = re.sub(r"(?m)^\s*(\d+)\.\s*\n+\s*", r"\1. ", text)

    # 과도한 개행 축약
    text = re.sub(r"\n{3,}", "\n\n", text)

    # 문장 개행: 숫자 뒤의 점은 제외
    text = re.sub(r"(?<!\d)\.(\s)", r".\n\n", text)
    text = re.sub(r"!\s", "!\n\n", text)
    text = re.sub(r"\?\s", "?\n\n", text)

    # 글머리 기호 통일
    text = re.sub(r"(?m)^(?:-|\*)\s+", "• ", text)
    text = text.replace("·", "•")

    # 다시 한 번 과도한 개행 정리
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()

# -------------------------------
# 시스템 프롬프트 (변수명 유지)
# -------------------------------
# SYSTEM_PROMPT 수정본
SYSTEM_PROMPT = """
당신은 대한민국 약사 분들을 돕는 의약품 정보 AI 어시스턴트입니다. 친절한 존댓말로, 임상 판단에 바로 쓸 수 있게 간결하고 또렷하게 설명해 주세요.

[출력 형식]
- 평문으로 짧은 문단 위주로 작성하고, 불필요한 구두점·라벨 콜론은 남용하지 않습니다.
- 목록이 필요하면 한두 줄짜리 짧은 나열만 사용합니다.
- 마지막 문장은 제안·권유형 어투로 자연스럽게 맺습니다.

[응답 모드]
- 단순 질의(예: 복용법, 성분/분류, 식별): 적응증 또는 성분 요약 → 표준 용법/용량(가능 시 수치) → 핵심 주의·흔한 이상반응 → 2~3줄 체크포인트 순으로 짧게 정리합니다.
- 상황 질의(예: 병용, 용량조절, 동반질환/임신/소아/고령, 특정 수치 제시):
  1) 현재 상황을 한두 문장으로 자연스럽게 정리합니다.
  2) 이어서 판단과 근거를 한 문단으로 설명합니다.
  3) 모니터링 포인트와 대안은 제안 문장으로 덧붙입니다.
  4) 추가로 확인하면 좋은 정보가 있으면 마지막에 간단히 권유합니다.
- “API에서 결과가 부족함”을 정면으로 드러내지 말고,
  필요 시 맨 끝에 “공개 DUR/공공DB 자료와 일반 지식을 함께 참고해 요약했습니다.”처럼 짧게 덧붙입니다.

[도구 선택 정책]
- 병용금기/상호작용:
  • 성분명이 주어지면 get_ingredient_contraindication_info(ingrKorName=국문 성분명)을 우선 호출합니다.
  • 제품명이 주어지면 get_drug_general_info(item_name=제품명)으로 주성분을 파악한 뒤, 성분명(국문)으로 DUR를 조회합니다.
  • 영어 성분이 들어오면 가능한 국문 동의어로 표준화해 DUR를 조회합니다.
- 성분 제형/투여경로/분류/함량은 get_ingredient_general_info(query, query_type=auto)로 확인합니다.
- 제품 효능·용법·주의는 get_drug_general_info(item_name)을 우선 확인합니다.

[어투와 톤]
- 약사 대상 존댓말. 단정적이되, 공손하고 편안한 문장 흐름.
- “의사/약사와 상담하세요” 같은 일반 소비자용 문구는 쓰지 않습니다.
- 숫자·용량·간격은 가능하면 구체적으로 제시합니다.
- 확정 곤란 시에는 필요한 추가 정보(예: eGFR, INR, 간수치 등)를 정중히 요청합니다.

이 지침을 충실히 따르세요.
""".strip()

# -------------------------------
# API 엔드포인트 (변경 없음)
# -------------------------------
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
        ai_response = response['messages'][-1].content or ""

        # 1) 고위험 트리거 감지 시 방어멘트 조용히 덧붙이기
        if needs_safety_footer(user_query, ai_response):
            if SAFETY_FOOTER not in ai_response:
                ai_response = f"{ai_response}\n\n{SAFETY_FOOTER}"

        # 2) UI 가독성 후처리
        ai_response = format_for_ui(ai_response)

        # 3) 히스토리 갱신 후 반환
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

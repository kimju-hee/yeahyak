import json
import os

from dotenv import load_dotenv
from flask import Flask, Response, request
from openai import APIError, OpenAI

# 환경변수 로드 및 초기 설정
load_dotenv()
app = Flask(__name__)

if "OPENAI_API_KEY" not in os.environ:
    raise EnvironmentError("'OPENAI_API_KEY' 환경 변수가 설정되어 있지 않습니다.")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 프롬프트 정의
SYSTEM_PROMPT = """
당신은 법령 개정 분석 전문가입니다.
약사 및 약국 종사자가 실무에 참고할 수 있도록 법령 개정 내용을 선별해 실무 안내문 형식으로 요약합니다.

[HTML 출력 규칙]
- 마크다운/코드펜스 금지: 백틱(```) 및 ```html 금지
- DOCTYPE, <html>, <head>, <body> 없이 '본문'만 출력
- 허용 태그만 사용: <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <br>
- 문서는 <h1> 또는 <h2>로 시작
- style/script/onclick 등 속성 사용 금지

아래는 특정 법령의 개정이유서 또는 개정문 전체입니다.
이 문서의 내용만을 참고하여, 약국 또는 약사의 업무에 실질적인 영향을 줄 수 있는 조문만 선별해 작성해 주세요.

요약 시 다음 기준을 반드시 따르세요:

[1] 요약 대상
- 약사 또는 약국의 실무에 실질적인 영향을 미치는 조문만 포함합니다.
- 어떤 조문이 관련 있는지는 당신의 판단에 전적으로 맡깁니다.
- 단순 문구 정비, 시험·연구기관 관련 내용, 원료의약품 적합판정, 별표 및 서식 수정 등 실무에 직접 관련 없는 조문은 생략합니다.

[2] 요약 형식
- 실무 공지사항 형식으로 작성합니다.
- 조문별로 구분하여 작성하며, 다음 정보를 포함해 주세요:
  - 조문 번호 및 개정 또는 신설 여부
  - 핵심 내용 요약 (필요 이상으로 축약하지 말고, 실질적 조치가 무엇인지 충분히 설명)
  - 개정의 취지 또는 도입 배경
  - 시행일 (조문별 시행일이 다를 경우 각각 명확히 기재)

[3] 시행일 작성 방식
- 시행일은 서술형 문장으로 명확히 작성합니다. 예: "이 조항은 20XX년 X월 X일부터 시행됩니다."
- "공포 후 6개월" 등 추상적인 표현은 사용하지 말고, 문서상 공포일을 기준으로 날짜를 정확히 계산하여 제시합니다.
- 조문마다 시행일이 다를 경우 각각 해당 조문 아래에 따로 서술합니다.

[4] 상단 정보 정리
- 문서에 다음 정보가 명확히 포함되어 있는 경우, 요약문 맨 앞에 정리해 주세요:
  - 총리령 또는 대통령령 번호
  - 공포일
  - 시행일 (일괄 시행되는 경우)

[5] 문체와 표현 방식
- 이모티콘은 절대 사용하지 않습니다.
- 실무자가 실제로 공지사항에서 읽을 법한 문장으로 작성해 주세요.
- 불필요하게 단순화하거나 요점을 빼먹지 말고, 문장을 자연스럽고 명확하게 구성해 주세요.
- 각 조문은 문단 형식으로 구분하되, 반복 설명은 피하고 핵심을 정확히 전달해 주세요.

위 기준을 철저히 준수해 작성하되, 반드시 HTML '본문만'을 반환하세요.
"""


# GPT 요청 함수
def summarize_text(content: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": content},
        ],
        temperature=0.3,
        max_tokens=10000,
    )
    result = (
        response.choices[0].message.content if response and response.choices else ""
    )
    if not result:
        raise RuntimeError("OpenAI 응답이 비어 있습니다.")
    return result.strip()


# 엔드포인트 정의
# @app.route("/summarize/law", methods=["POST"])
# def summarize_law():
#     file = request.files.get("file")

#     if not file or not file.filename.lower().endswith(".txt"):
#         return Response(
#             json.dumps(
#                 {
#                     "success": False,
#                     "data": None,
#                     "error": {"message": "TXT 파일을 업로드 해주세요"},
#                 },
#                 ensure_ascii=False,
#             ),
#             content_type="application/json; charset=utf-8",
#             status=400,
#         )

#     try:
#         raw = file.read()
#         content = raw.decode("utf-8")
#     except Exception as e:
#         return Response(
#             json.dumps(
#                 {
#                     "success": False,
#                     "data": None,
#                     "error": {"message": f"TXT 처리 중 오류가 발생했습니다: {str(e)}"},
#                 },
#                 ensure_ascii=False,
#             ),
#             content_type="application/json; charset=utf-8",
#             status=500,
#         )

#     try:
#         summary = summarize_text(content)
#         return Response(
#             json.dumps(
#                 {
#                     "success": True,
#                     "data": {"summary": summary},
#                     "error": None,
#                 },
#                 ensure_ascii=False,
#             ),
#             content_type="application/json; charset=utf-8",
#             status=200,
#         )
#     except APIError as api_err:
#         return Response(
#             json.dumps(
#                 {
#                     "success": False,
#                     "data": None,
#                     "error": {
#                         "message": f"OpenAI API 호출 중 오류가 발생했습니다: {str(api_err)}"
#                     },
#                 },
#                 ensure_ascii=False,
#             ),
#             content_type="application/json; charset=utf-8",
#             status=502,
#         )
#     except Exception as e:
#         return Response(
#             json.dumps(
#                 {
#                     "success": False,
#                     "data": None,
#                     "error": {
#                         "message": f"요청 처리 중 알 수 없는 오류가 발생했습니다: {str(e)}"
#                     },
#                 },
#                 ensure_ascii=False,
#             ),
#             content_type="application/json; charset=utf-8",
#             status=500,
#         )


# # 서버 실행
# if __name__ == "__main__":
#     print("✅ 법령 요약 서버 실행 중... http://localhost:5000")
#     app.run(host="0.0.0.0", port=5000, debug=True)

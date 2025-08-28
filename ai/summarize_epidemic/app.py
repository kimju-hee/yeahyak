import json
import os

import fitz  # PyMuPDF
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
SUMMARY_PROMPT = """
다음은 감염병 주간 통계 보고서입니다.
주요 질병명, 발생 지역, 발생 수치, 유입 경로(국내/해외)를 포함하여 보고서 내용을 1000자 내외로 요약해 주세요.
"""

NOTICE_PROMPT = """
다음은 감염병 주간 통계 보고서 요약문입니다.
아래 요약을 바탕으로 전국 지점 공지문을 HTML로 다시 작성하세요(마크다운 사용 금지).

[HTML 출력 규칙]
- 마크다운/코드펜스 금지: 백틱(```) 및 ```html 금지
- DOCTYPE, <html>, <head>, <body> 없이 '본문만' 출력
- 허용 태그만 사용: <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <br>
- 문서는 <h2> 또는 <h3>로 시작
- style/script/onclick 등 속성 사용 금지

반드시 HTML '본문만'을 반환하세요.

문서 골격 예시:
<h2>감염병 주간 공지</h2>
<h3>인사 및 개요</h3>
<p>...</p>
<h3>주요 현황</h3>
<ul><li>...</li></ul>
<h3>권고 사항</h3>
<ul><li>...</li></ul>

요약문:
"""


# GPT 요청 함수 - 요약문 생성
def generate_summary(text):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "당신은 감염병 보고서를 공지문으로 요약하는 전문 AI입니다. HTML 형식으로만 응답하며, 마크다운은 절대 사용하지 않습니다.",
            },
            {"role": "user", "content": f"{SUMMARY_PROMPT}\n\n{text}"},
        ],
    )
    content = (
        response.choices[0].message.content if response and response.choices else ""
    )
    if not content:
        raise RuntimeError("OpenAI 응답이 비어 있습니다.")
    return content.strip()


# GPT 요청 함수 - 공지문 생성
def generate_notice(summary):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "당신은 약국 본사에서 사용하는 감염병 공지문을 생성하는 AI입니다.",
            },
            {"role": "user", "content": f"{NOTICE_PROMPT}\n\n{summary}"},
        ],
    )
    content = (
        response.choices[0].message.content if response and response.choices else ""
    )
    if not content:
        raise RuntimeError("EMPTY_OPENAI_RESPONSE: OpenAI 응답이 비어 있습니다.")
    return content.strip()


# PDF에서 텍스트 추출
def extract_text_from_pdf(file_storage):
    text = ""
    with fitz.open(stream=file_storage.read(), filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text


# 엔드포인트 정의
# @app.route("/summarize/epidemic", methods=["POST"])
# def summarize_epidemic():
#     file = request.files.get("file")

#     if not file or not file.filename.lower().endswith(".pdf"):
#         return Response(
#             json.dumps(
#                 {
#                     "success": False,
#                     "data": None,
#                     "error": {"message": "PDF 파일을 업로드 해주세요"},
#                 },
#                 ensure_ascii=False,
#             ),
#             content_type="application/json; charset=utf-8",
#             status=400,
#         )

#     try:
#         text = extract_text_from_pdf(file)
#     except Exception as e:
#         return Response(
#             json.dumps(
#                 {
#                     "success": False,
#                     "data": None,
#                     "error": {"message": f"PDF 처리 중 오류가 발생했습니다: {str(e)}"},
#                 },
#                 ensure_ascii=False,
#             ),
#             content_type="application/json; charset=utf-8",
#             status=500,
#         )

#     try:
#         summary = generate_summary(text)
#         notice = generate_notice(summary)
#         return Response(
#             json.dumps(
#                 {
#                     "success": True,
#                     "data": {"summary": summary, "notice": notice},
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
#     print("✅ 감염병 요약 서버 실행 중... http://localhost:5000")
#     app.run(host="0.0.0.0", port=5000, debug=True)

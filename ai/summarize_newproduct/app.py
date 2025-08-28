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


# GPT 요청 함수
def summarize_pdf(text):
    # 텍스트를 3000자로 제한
    limited_text = text[:3000]

    # 프롬프트 구성
    user_prompt = f"""
다음은 약품 설명서입니다. 아래 항목에 따라 1000자를 넘지않게 간결하게 요약해주세요:

[HTML 출력 규칙]
- 마크다운/코드펜스 금지: 백틱(```) 및 ```html 금지
- DOCTYPE, <html>, <head>, <body> 없이 '본문만' 출력
- 허용 태그만 사용: <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <br>
- 문서는 <h2> 또는 <h3>로 시작
- style/script/onclick 등 속성 사용 금지

[작성 형식]
- 500자를 넘지 않게 간결하게
- 아래 섹션을 반드시 포함:
<h2>약품 요약</h2>
<h3>성분</h3><p>...</p>
<h3>효능</h3><p>...</p>
<h3>사용법</h3><p>...</p>
<h3>주의사항</h3><p>...</p>
<h3>보관법</h3>
<ul><li>...</li></ul>

반드시 HTML '본문만'을 반환하세요.

설명서:
{limited_text}
"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "약사에게 의약 정보를 명확하게 정리하는 전문가입니다. HTML 형식으로만 응답하며, 마크다운은 절대 사용하지 않습니다.",
            },
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
    )
    content = (
        response.choices[0].message.content if response and response.choices else ""
    )
    if not content:
        raise RuntimeError("OpenAI 응답이 비어 있습니다.")
    return content.strip()


# PDF에서 텍스트 추출
def extract_text_from_pdf(file_storage):
    text = ""
    with fitz.open(stream=file_storage.read(), filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text


# # 엔드포인트 정의
# @app.route("/summarize/new-product", methods=["POST"])
# def summarize_newproduct():
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
#         summary = summarize_pdf(text)
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
#     print("✅ 약품 요약 서버 실행 중... http://localhost:5000")
#     app.run(host="0.0.0.0", port=5000, debug=True)

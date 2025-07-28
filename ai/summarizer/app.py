import os
import fitz  # PyMuPDF
import json
from flask import Flask, request, Response
from openai import OpenAI
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

app = Flask(__name__)

# OpenAI 클라이언트 생성
def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
    return OpenAI(api_key=api_key)

client = get_openai_client()

# PDF에서 텍스트 추출
def extract_text_from_pdf(file_storage):
    text = ""
    with fitz.open(stream=file_storage.read(), filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

# 약품 요약 처리
def summarize_with_gpt(text):
    prompt = f"""
    다음은 약품 설명서입니다. 아래 항목에 따라 요약해주세요:
    - 성분
    - 효능
    - 복용법
    - 주의사항

    설명서:
    {text[:3000]}
    """

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "약사에게 의약 정보를 명확하게 정리하는 전문가"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )
    return response.choices[0].message.content.strip()

@app.route("/summarize-pdf", methods=["POST"])
def summarize_pdf():
    file = request.files.get("file")
    if not file or not file.filename.lower().endswith(".pdf"):
        return Response(
            json.dumps({"error": "PDF 파일을 업로드 해주세요."}, ensure_ascii=False),
            status=400,
            content_type="application/json; charset=utf-8"
        )

    try:
        text = extract_text_from_pdf(file)
        summary = summarize_with_gpt(text)
        return Response(
            json.dumps({"summary": summary}, ensure_ascii=False),
            status=200,
            content_type="application/json; charset=utf-8"
        )
    except Exception as e:
        return Response(
            json.dumps({"error": str(e)}, ensure_ascii=False),
            status=500,
            content_type="application/json; charset=utf-8"
        )

if __name__ == "__main__":
    print("💊 약품 요약 서버 실행 중... http://localhost:5001/summarize-pdf")
    app.run(host="0.0.0.0", port=5001, debug=True)

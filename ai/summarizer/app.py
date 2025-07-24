import os
import fitz  # PyMuPDF
import json
from flask import Flask, request, Response
from openai import OpenAI
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

# Flask 앱 생성
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

# 1단계 요약 (GPT)
def summarize_report(text):
    prompt = f"""
    다음은 감염병 주간 통계 보고서입니다. 아래의 기준에 따라 내용을 요약해주세요:

    - 주요 감염병 이름
    - 지역별 발생 현황
    - 국내 vs 해외 유입 여부
    - 발생 수치 (가능한 범위 내에서)
    - 요약은 400자 이내로 간결하게 작성해주세요.

    보고서 내용:
    {text[:3000]}
    """
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "감염병 요약 전문가"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )
    return response.choices[0].message.content.strip()

# 2단계 공지문 생성 (GPT)
def generate_notice(summary_text):
    prompt = f"""
    다음은 감염병 보고서 요약입니다. 전국 약국에 공지할 수 있도록 정돈된 공지문 형태로 다시 작성해 주세요. 공손하고 일관된 문체를 사용해주세요.

    요약:
    {summary_text}
    """
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "감염병 공지문 작성 전문가"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )
    return response.choices[0].message.content.strip()

# Flask 엔드포인트
@app.route("/summarize-epidemic", methods=["POST"])
def summarize_epidemic():
    file = request.files.get("file")
    if not file or not file.filename.lower().endswith(".pdf"):
        return Response(
            json.dumps({"error": "PDF 파일을 업로드 해주세요."}, ensure_ascii=False),
            status=400,
            content_type="application/json; charset=utf-8"
        )

    try:
        text = extract_text_from_pdf(file)
        summary = summarize_report(text)
        notice = generate_notice(summary)
        return Response(
            json.dumps({"summary": summary, "notice": notice}, ensure_ascii=False),
            status=200,
            content_type="application/json; charset=utf-8"
        )
    except Exception as e:
        return Response(
            json.dumps({"error": str(e)}, ensure_ascii=False),
            status=500,
            content_type="application/json; charset=utf-8"
        )

# 서버 실행
if __name__ == "__main__":
    print("🚀 감염병 요약 서버 실행 중... http://localhost:5001/summarize-epidemic")
    app.run(host="0.0.0.0", port=5001, debug=True)

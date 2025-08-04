import os
import fitz  # PyMuPDF
from flask import Flask, request, jsonify, Response
import json
from openai import OpenAI
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

app = Flask(__name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 프롬프트 정의
SUMMARY_PROMPT = """다음은 감염병 주간 통계 보고서입니다. 주요 질병명, 발생 지역, 발생 수치, 유입 경로(국내/해외)를 포함하여 보고서 내용을 400자 내외로 요약해 주세요. 공지문 형태로 작성해 주세요."""
NOTICE_PROMPT = """다음은 감염병 보고서 요약입니다. 약국 본사에서 전국 지점에 공지할 수 있도록, 다음 요약을 공지문 형식으로 다시 작성해 주세요. 친절하고 정돈된 문체를 사용해 주세요.\n\n요약 내용:\n"""

# GPT 요청 함수
def generate_summary(text):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "당신은 감염병 보고서를 공지문으로 요약하는 전문 AI입니다."},
            {"role": "user", "content": f"{SUMMARY_PROMPT}\n\n{text}"}
        ]
    )
    return response.choices[0].message.content

def generate_notice(summary):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "당신은 약국 본사에서 사용하는 감염병 공지문을 생성하는 AI입니다."},
            {"role": "user", "content": f"{NOTICE_PROMPT}{summary}"}
        ]
    )
    return response.choices[0].message.content

# PDF 텍스트 추출
def extract_text_from_pdf(file_storage):
    text = ""
    with fitz.open(stream=file_storage.read(), filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

# 엔드포인트 정의
@app.route("/summarize-epidemic", methods=["POST"])
def summarize_epidemic():
    file = request.files.get("file")
    if not file or not file.filename.lower().endswith(".pdf"):
        return Response(
            json.dumps({"error": "PDF 파일을 업로드 해주세요"}, ensure_ascii=False),
            content_type="application/json; charset=utf-8",
            status=400
        )
    try:
        text = extract_text_from_pdf(file)
        summary = generate_summary(text)
        notice = generate_notice(summary)
        return Response(
            json.dumps({"summary": summary, "notice": notice}, ensure_ascii=False),
            content_type="application/json; charset=utf-8",
            status=200
        )
    except Exception as e:
        return Response(
            json.dumps({"error": str(e)}, ensure_ascii=False),
            content_type="application/json; charset=utf-8",
            status=500
        )


# 서버 실행
if __name__ == "__main__":
    print("✅ 감염병 요약 서버 실행 중... http://localhost:5002")
    app.run(host="0.0.0.0", port=5002, debug=True)

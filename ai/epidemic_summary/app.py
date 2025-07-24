from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fitz  # PyMuPDF
import openai
import os

app = FastAPI()

# CORS 설정 (필요 시 수정)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GPT API 키 환경변수에서 불러오기
openai.api_key = os.getenv("OPENAI_API_KEY")

# 요약 프롬프트
SUMMARY_PROMPT = """다음은 감염병 주간 통계 보고서입니다. 주요 질병명, 발생 지역, 발생 수치, 유입 경로(국내/해외)를 포함하여 보고서 내용을 400자 내외로 요약해 주세요. 공지문 형태로 작성해 주세요."""

# 공지문 생성 프롬프트
NOTICE_PROMPT = """다음은 감염병 보고서 요약입니다. 약국 본사에서 전국 지점에 공지할 수 있도록, 다음 요약을 공지문 형식으로 다시 작성해 주세요. 친절하고 정돈된 문체를 사용해 주세요.\n\n요약 내용:\n"""

# GPT 응답 함수
def generate_summary(text: str) -> str:
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "당신은 감염병 보고서를 공지문으로 요약하는 전문 AI입니다."},
            {"role": "user", "content": f"{SUMMARY_PROMPT}\n\n{text}"},
        ]
    )
    return response["choices"][0]["message"]["content"]

def generate_notice(summary: str) -> str:
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "당신은 약국 본사에서 사용하는 감염병 공지문을 생성하는 AI입니다."},
            {"role": "user", "content": f"{NOTICE_PROMPT}{summary}"},
        ]
    )
    return response["choices"][0]["message"]["content"]

# PDF에서 텍스트 추출
def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    return full_text

# 업로드된 PDF 처리 API
@app.post("/summarize-epidemic")
async def summarize_epidemic_pdf(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        text = extract_text_from_pdf(file_bytes)
        summary = generate_summary(text)
        notice = generate_notice(summary)
        return {"summary": summary, "notice": notice}
    except Exception as e:
        return {"error": str(e)}

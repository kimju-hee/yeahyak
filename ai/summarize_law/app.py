from flask import Flask, request, Response
from openai import OpenAI, APIError
import os
import json

app = Flask(__name__)

# 🔐 환경변수에서 API 키 읽기 (.env 사용 안함)
if "OPENAI_API_KEY" not in os.environ:
    raise EnvironmentError("환경변수 'OPENAI_API_KEY'가 설정되어 있지 않습니다.")

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

# ✅ 시스템 프롬프트
SYSTEM_PROMPT = """
당신은 법령 개정 분석 전문가입니다.  
당신의 임무는 현직 약사 및 약국 종사자들이 실무에 참고할 수 있도록 법령 개정 내용을 선별하고, 실무 안내문 형식으로 요약해 전달하는 것입니다.

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

위 기준을 철저히 준수해 작성해 주세요.
"""

# ✅ GPT 요약 처리 함수 분리
def summarize_text(content: str) -> str:
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": content}
            ],
            temperature=0.3,
            max_tokens=10000
        )
        return response.choices[0].message.content.strip()
    except APIError as api_err:
        raise RuntimeError(f"OpenAI API 호출 오류: {str(api_err)}")
    except Exception as e:
        raise RuntimeError(f"요약 처리 중 예외 발생: {str(e)}")

@app.route("/summarize-law", methods=["POST"])
def summarize_law():
    data = request.get_json()
    file_path = data.get("path")

    if not file_path or not os.path.exists(file_path):
        error = {"error": "유효한 'path'가 필요합니다."}
        return Response(json.dumps(error, ensure_ascii=False), content_type="application/json; charset=utf-8", status=400)

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        error = {"error": f"파일 열기 오류: {str(e)}"}
        return Response(json.dumps(error, ensure_ascii=False), content_type="application/json; charset=utf-8", status=500)

    try:
        summary = summarize_text(content)
    except RuntimeError as e:
        error = {"error": str(e)}
        return Response(json.dumps(error, ensure_ascii=False), content_type="application/json; charset=utf-8", status=500)

    # ✅ 모든 경우 charset=utf-8 적용
    if request.headers.get("Accept") == "text/plain":
        return Response(summary, content_type="text/plain; charset=utf-8")
    else:
        return Response(json.dumps({"summary": summary}, ensure_ascii=False), content_type="application/json; charset=utf-8")

if __name__ == "__main__":
    print("✅ 법률 요약 서버 실행 중... http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)

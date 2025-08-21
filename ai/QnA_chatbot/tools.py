# yeahyak/ai/QnA_chatbot/tools.py
import os
import requests
import xml.etree.ElementTree as ET
from langchain.tools import tool

# .env에서 로드된 공공데이터포털 서비스 키
SERVICE_KEY = os.getenv("DRUG_API_KEY")


@tool
def get_drug_general_info(item_name: str) -> str:
    """의약품의 이름으로 효능, 효과, 사용법 등 전반적인 정보를 얻고 싶을 때 사용합니다."""
    print(f"▶ '의약품 정보 검색' 실행: {item_name}")
    base_url = "http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList"
    params = {
        "serviceKey": SERVICE_KEY,
        "itemName": item_name,
        "type": "json",
        "numOfRows": 1,
    }
    try:
        resp = requests.get(base_url, params=params, timeout=10)
        resp.raise_for_status()
        body = resp.json().get("body", {})
        items = (body or {}).get("items")
        if not items:
            return f"'{item_name}'에 대한 의약품 정보를 찾을 수 없습니다."
        # LangChain Tool은 문자열 반환이 안전하므로 dict -> str
        return str(items[0])
    except Exception as e:
        return f"'{item_name}' 정보 검색 중 오류 발생: {e}"


@tool
def get_ingredient_contraindication_info(ingredient_name: str) -> str:
    """특정 '성분'과 함께 먹으면 안 되는(병용금기) 약물 정보를 찾을 때 사용합니다."""
    print(f"▶ '병용금기 정보 검색' 실행: {ingredient_name}")
    base_url = "http://apis.data.go.kr/1471000/DURIrdntInfoService03/getUsjntTabooInfoList02"
    params = {
        "serviceKey": SERVICE_KEY,
        "ingrKorName": ingredient_name,  # 국문 성분명 권장
        "type": "json",
        "numOfRows": 50,
    }
    try:
        resp = requests.get(base_url, params=params, timeout=10)
        resp.raise_for_status()
        body = resp.json().get("body", {})
        items = (body or {}).get("items") or []
        total = (body or {}).get("totalCount", 0)
        if not items or str(total) == "0":
            return f"'{ingredient_name}' 성분에 대한 병용금기 정보가 없습니다."
        return str(items)
    except Exception as e:
        return f"'{ingredient_name}' 병용금기 검색 중 오류 발생: {e}"


@tool
def get_ingredient_general_info(ingredient_name: str) -> str:
    """
    특정 '성분명' 자체의 약효 분류, 제형, 투여경로, 함량 등 상세 정보를 조회합니다.
    - 내부적으로 심평원 getMajorCmpnNmCdList를 확장 로직으로 호출합니다.
    - 함수 시그니처는 기존 사용처 호환을 위해 그대로 유지(ingredient_name 한 개 인자).
    """
    print(f"▶ '성분 상세 정보 검색' 실행 (심평원 API): query={ingredient_name}, gnlNmCd=-, query_type=auto")

    import re

    base_url = "http://apis.data.go.kr/B551182/msupCmpnMeftInfoService/getMajorCmpnNmCdList"

    # 한↔영 alias (필요 시 보강)
    ALIAS_KO2EN = {
        "도세탁셀": "Docetaxel",
        "이리노테칸": "Irinotecan",
        "아세트아미노펜": "Acetaminophen",
        "콜린알포세레이트": "Choline alfoscerate",
        "아시클로버": "Acyclovir",
        "발라시클로버": "Valacyclovir",
    }
    ALIAS_EN2KO = {v: k for k, v in ALIAS_KO2EN.items()}

    # 염/수화물 꼬리표 정규화
    SALT_WORDS = r"(hydrochloride|hydrochlorid|phosphate|sulfate|mesylate|nitrate|sodium|potassium|calcium|magnesium|tartrate|maleate|fumarate|succinate|bitartrate|tosylate|acetate|hydrobromide|trihydrate|monohydrate|dihydrate|hydrate|anhydrous)"

    def normalize_variants(name: str) -> list[str]:
        variants = set()
        base = re.sub(r"\(.*?\)", " ", name)       # 괄호 제거
        base = re.sub(r"\s+", " ", base).strip()
        variants.add(base)
        v = re.sub(rf"\b{SALT_WORDS}\b", " ", base, flags=re.I)
        v = re.sub(r"\s+", " ", v).strip()
        if v and v.lower() != base.lower():
            variants.add(v)
        v2 = re.sub(r"[-,]+$", "", v).strip()
        if v2 and v2.lower() not in {x.lower() for x in variants}:
            variants.add(v2)
        return list(variants)

    def call(params: dict):
        resp = requests.get(base_url, params=params, timeout=10)
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
        code = (root.findtext(".//resultCode") or "").strip()
        if code != "00":
            msg = root.findtext(".//resultMsg") or "UNKNOWN"
            raise RuntimeError(f"API 오류: {msg} (코드 {code})")
        return root.findall(".//item")

    def summarize(items):
        if not items:
            return ""
        lines = []
        for it in items:
            v = lambda k: (it.findtext(k) or "").strip()
            bits = []
            if v("gnlNm"):     bits.append(f"일반명: {v('gnlNm')}")
            if v("gnlNmCd"):   bits.append(f"일반명코드: {v('gnlNmCd')}")
            if v("divNm"):     bits.append(f"분류명: {v('divNm')}")
            if v("meftDivNo"): bits.append(f"약효분류번호: {v('meftDivNo')}")
            if v("fomnTpNm"):  bits.append(f"제형: {v('fomnTpNm')}")
            if v("injcPthNm"): bits.append(f"투여경로: {v('injcPthNm')}")
            qty, unit = v("iqtyTxt"), v("unit")
            if qty or unit:
                bits.append(f"함량: {qty} {unit}".strip())
            if bits:
                lines.append(" | ".join(bits))
        return "\n".join(lines)

    base_params = {
        "serviceKey": SERVICE_KEY,  # 디코딩된 원문키 권장
        "pageNo": "1",
        "numOfRows": "10",
    }

    CODE_RE = re.compile(r"^[A-Z0-9]{6,12}$")

    def try_gnlNm(name: str):
        print(f"  - gnlNm 조회 시도: {name}")
        return summarize(call({**base_params, "gnlNm": name}))

    def try_gnlNmCd(code: str):
        print(f"  - gnlNmCd 조회 시도: {code}")
        return summarize(call({**base_params, "gnlNmCd": code}))

    def try_class(name_or_no: str, meft_no: str | None):
        params = {**base_params}
        if meft_no:
            params["meftDivNo"] = meft_no
            print(f"  - class 조회(meftDivNo): {meft_no}")
        else:
            params["divNm"] = name_or_no
            print(f"  - class 조회(divNm): {name_or_no}")
        return summarize(call(params))

    # ------- auto 모드로 유연 조회 (외부 호출 시 시그니처는 그대로) -------
    query = ingredient_name
    try:
        # 0) 코드 패턴이면 코드로 우선 조회
        if CODE_RE.match(query):
            out = try_gnlNmCd(query)
            if out:
                return out

        # 1) 원문 그대로
        out = try_gnlNm(query)
        if out:
            return out

        # 2) 영↔한 alias
        if query in ALIAS_EN2KO:
            out = try_gnlNm(ALIAS_EN2KO[query])
            if out:
                return out
        if query in ALIAS_KO2EN:
            out = try_gnlNm(ALIAS_KO2EN[query])
            if out:
                return out

        # 3) 염/수화물 꼬리표 제거 변형들
        for cand in normalize_variants(query):
            if cand.lower() == query.lower():
                continue
            out = try_gnlNm(cand)
            if out:
                return out

        # 4) 분류명처럼 보이면 class 조회 (예: ~제 / 항..제)
        if re.search(r"(항.+제$)|(.+제$)", query):
            out = try_class(query, None)
            if out:
                return out

        return f"'{query}'에 대한 결과가 없습니다. (성분/코드/분류명 표기를 확인해 주세요)"
    except Exception as e:
        return f"'{query}' 성분 상세 정보 검색 중 오류: {e}"

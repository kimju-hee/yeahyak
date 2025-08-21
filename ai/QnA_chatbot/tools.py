# yeahyak/ai/QnA_chatbot/tools.py
import os
import requests
import json
import xml.etree.ElementTree as ET
from langchain.tools import tool

# .env 파일에서 로드된 SERVICE_KEY를 사용합니다.
SERVICE_KEY = os.getenv("DRUG_API_KEY")

@tool
def get_drug_general_info(item_name: str) -> str:
    """의약품의 이름으로 효능, 효과, 사용법 등 전반적인 정보를 얻고 싶을 때 사용합니다."""
    print(f"▶ '의약품 정보 검색' 실행: {item_name}")
    base_url = "http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList"
    params = {"serviceKey": SERVICE_KEY, "itemName": item_name, "type": "json", "numOfRows": 1}
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        items = response.json().get("body", {}).get("items")
        if not items: return f"API 조회 결과, '{item_name}'에 대한 정보를 찾을 수 없었습니다."
        return str(items[0])
    except Exception as e:
        return f"'{item_name}' 정보 검색 중 오류 발생: {e}"

@tool
def get_ingredient_contraindication_info(ingredient_name: str) -> str:
    """특정 '성분'과 함께 먹으면 안 되는(병용금기) 약물 정보를 찾을 때 사용합니다."""
    print(f"▶ '병용금기 정보 검색' 실행: {ingredient_name}")
    base_url = "http://apis.data.go.kr/1471000/DURIrdntInfoService03/getUsjntTabooInfoList02"
    params = {"serviceKey": SERVICE_KEY, "ingrKorName": ingredient_name, "type": "json", "numOfRows": 5}
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        items = response.json().get("body", {}).get("items")
        if not items or response.json().get("body", {}).get("totalCount", 0) == 0:
            return f"API 조회 결과, '{ingredient_name}' 성분에 대한 병용금기 정보가 없습니다."
        return str(items)
    except Exception as e:
        return f"'{ingredient_name}' 병용금기 검색 중 오류 발생: {e}"

@tool
def get_ingredient_general_info(ingredient_name: str) -> str:
    """특정 '성분명' 자체의 약효 분류, 제형 등 상세 정보를 조회할 때 사용합니다."""
    print(f"▶ '성분 상세 정보 검색' 실행 (심평원 API): {ingredient_name}")
    base_url = "http://apis.data.go.kr/B551182/msupCmpnMeftInfoService/getMajorCmpnNmCdList"
    params = {"serviceKey": SERVICE_KEY, "pageNo": "1", "numOfRows": "5", "gnlNm": ingredient_name}
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        root = ET.fromstring(response.content)
        result_code = root.findtext(".//resultCode")
        if result_code != '00':
            return f"API 호출 오류: {root.findtext('.//resultMsg')}"
        items = root.findall(".//item")
        if not items:
            return f"API 조회 결과, '{ingredient_name}' 성분에 대한 상세 정보를 찾을 수 없었습니다."
        summaries = []
        for item in items:
            info = [f"일반명: {item.findtext('gnlNm')}", f"분류명: {item.findtext('divNm')}"]
            summaries.append(" | ".join(info))
        return f"'{ingredient_name}' 성분 검색 결과:\n" + "\n".join(summaries)
    except Exception as e:
        return f"'{ingredient_name}' 성분 상세 정보 검색 중 오류 발생: {e}"
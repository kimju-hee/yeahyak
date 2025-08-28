# 파이썬 3.11-slim 이미지를 기반으로 사용
FROM python:3.11-slim

WORKDIR /app

# 시스템 패키지
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgomp1 \
 && rm -rf /var/lib/apt/lists/*

# ✅ 컨텍스트가 ai/ 이므로 파일명만 쓰면 됨
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# ✅ 소스 복사
COPY . /app/

EXPOSE 8080
ENV PORT=8080

CMD ["gunicorn", "-b", "0.0.0.0:8080", "gateway:app", "--workers", "1", "--timeout", "180"]

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    TZ=Asia/Seoul \
    PORT=5000

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc g++ libgomp1 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1) 파이썬 의존성 설치
COPY requirements.txt ./requirements.txt
RUN pip install --upgrade pip \
 && pip install -r requirements.txt \
 && pip install gunicorn==21.2.0

# 2) 애플리케이션 복사
COPY gateway.py         ./gateway.py
COPY epidemic_summary/  ./epidemic_summary/
COPY summarizer/        ./summarizer/
COPY summarize_law/     ./summarize_law/
COPY FAQ_chatbot/       ./FAQ_chatbot/
COPY QnA_chatbot/       ./QnA_chatbot/
COPY order_forecast/    ./order_forecast/
COPY repository/        ./repository/

EXPOSE 5000

# Flask WSGI 실행 (gateway.py 안에 app = Flask(__name__) 가정)
CMD ["gunicorn","-w","2","-k","gthread","-t","120","-b","0.0.0.0:5000","gateway:app"]

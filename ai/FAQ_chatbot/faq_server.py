import os

from flask import Flask, request, jsonify ## 플라스크

# 최신 LangChain 모듈  (v0.2 이상 기준)
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate


# OpenAI API 키 설정
## 후에 azure 형식으로 추가

# 파일 경로
file_path = os.path.join(os.path.dirname(__file__), "faq_service.txt")
persist_path = os.path.join(os.path.dirname(__file__), "db_service_")

# 텍스트 분할 및 벡터 DB 생성
def create_vector_store(file_path, persist_directory):  ## 텍스트 파일 불러와서 분할
    loader = TextLoader(file_path, encoding="utf-8")
    documents = loader.load()
    
    # 문서 분할
    text_splitter = CharacterTextSplitter(chunk_size=200, chunk_overlap=20)
    docs = text_splitter.split_documents(documents)

    # 벡터 db 생성
    embeddings = OpenAIEmbeddings()
    vectordb = Chroma.from_documents(documents=docs,
                                     embedding=embeddings, 
                                     persist_directory=persist_directory
                                    )
    return vectordb

# 챗봇 체인 생성
def get_chatbot(vectorstore):
    llm = ChatOpenAI(temperature=0.4)
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

    # AI 프롬프트 작성
    qa_prompt = PromptTemplate.from_template(
      """당신은 친절한 고객센터 상담원입니다.
      아래 문서를 참고하여 고객의 질문에 자연스럽고 공손하게 응답하세요.
      문서에 관련 내용이 없을 경우, 죄송하다는 말과 함께 안내 불가 사유를 부드럽게 설명하세요.

      문서:
      {context}

      고객 질문:
      {question}

      답변:"""
    )  ## 프롬프트 설정을 통해 FAQ DB에 없는 질문이 들어올 경우 정보 제공이 불가능하다고 답변

    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(search_kwargs={"k": 2}),
        memory=memory,
        combine_docs_chain_kwargs={"prompt": qa_prompt},
        verbose=False
    )
    return qa_chain

############################# 챗봇 시작 ################################
# 🔧 Flask 앱 초기화
app = Flask(__name__)

# vector db 호출 :
vectordb = create_vector_store(file_path, persist_path)

# 챗봇 실행 시 나오는 문구
print("안녕하세요! 약사봇입니다. - faq_server.py:76")
print("[본사 정책 관련] [운영 프로세스 관련] [반복 상담/고객 응대 관련] [복약지도 관련] [반품/교환/클레임 관련]  import os.py:76 - faq_server.py:77")
print("위의 카테고리 안에서의 질문에 대답해드립니다 \n - faq_server.py:78")
print("## exit를 입력 시 채팅이 종료됩니다\n - faq_server.py:79")

# 체인 로드
chatbot = get_chatbot(vectordb)

# 📩 질문 받는 엔드포인트
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    question = data.get('question', '')

    if not question:
        return jsonify({'error': '질문이 없습니다.'}), 400

    try:
        result = chatbot.invoke(question)
        return jsonify({'answer': result['answer']})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 🏁 Flask 실행
if __name__ == '__main__':
    print("🚀 약사봇 Flask 서버 실행 중... (http://localhost:5000/chat)  import os.py:100 - faq_server.py:101")
    app.run(debug=True)
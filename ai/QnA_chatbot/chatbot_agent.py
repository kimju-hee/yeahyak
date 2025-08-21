# yeahyak/ai/QnA_chatbot/chatbot_agent.py
from typing import Annotated, Literal, TypedDict
import operator
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langchain_core.messages import AnyMessage, ToolMessage
from QnA_chatbot.tools import (
    get_drug_general_info,
    get_ingredient_contraindication_info,
    get_ingredient_general_info,
)

def create_chatbot_agent():
    """LangGraph를 사용하여 챗봇 에이전트를 생성하고 컴파일합니다."""
    # 1) 사용할 도구
    tools = [
        get_drug_general_info,                # 제품명 → 효능/효과/용법
        get_ingredient_contraindication_info, # 성분명(국문) → 병용금기
        get_ingredient_general_info,          # 성분/코드/분류(심평원) → 제형/경로/분류/함량
    ]

    # 2) LLM 설정(조금 더 자연스러운 톤을 위해 온도 0.2) + 도구 바인딩
    model = ChatOpenAI(temperature=0.2, model="gpt-4o")
    model_with_tools = model.bind_tools(tools)

    class AgentState(TypedDict):
        messages: Annotated[list[AnyMessage], operator.add]

    # 3) 모델 호출 노드
    def call_model(state: AgentState):
        messages = state["messages"]
        response = model_with_tools.invoke(messages)
        return {"messages": [response]}

    # 4) 툴 호출 노드(안전성 강화)
    def call_tool(state: AgentState):
        last_message = state["messages"][-1]
        tool_messages = []
        tool_map = {t.name: t for t in tools}

        # tool_calls 속성이 없거나 비어 있으면 그대로 리턴
        if not getattr(last_message, "tool_calls", None):
            return {"messages": tool_messages}

        for tool_call in last_message.tool_calls:
            name = tool_call.get("name")
            args = tool_call.get("args", {})
            if name in tool_map:
                try:
                    result = tool_map[name].invoke(args)
                except Exception as e:
                    result = f"[tool:{name}] 실행 오류: {e}"
                tool_messages.append(
                    ToolMessage(content=str(result), tool_call_id=tool_call["id"])
                )

        return {"messages": tool_messages}

    # 5) 라우터
    def router(state: AgentState) -> Literal["call_tool", "__end__"]:
        return "call_tool" if getattr(state["messages"][-1], "tool_calls", None) else "__end__"

    # 6) 그래프 구성
    workflow = StateGraph(AgentState)
    workflow.add_node("agent", call_model)
    workflow.add_node("action", call_tool)
    workflow.set_entry_point("agent")
    workflow.add_conditional_edges("agent", router, {"call_tool": "action", "__end__": END})
    workflow.add_edge("action", "agent")

    # 7) 컴파일 및 반환
    return workflow.compile()

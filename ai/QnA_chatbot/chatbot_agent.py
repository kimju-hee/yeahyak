# yeahyak/ai/QnA_chatbot/chatbot_agent.py
from typing import Annotated, Literal, TypedDict
import operator
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langchain_core.messages import AnyMessage, ToolMessage
from tools import get_drug_general_info, get_ingredient_contraindication_info, get_ingredient_general_info

def create_chatbot_agent():
    """LangGraph를 사용하여 챗봇 에이전트를 생성하고 컴파일합니다."""
    tools = [get_drug_general_info, get_ingredient_contraindication_info, get_ingredient_general_info]
    model = ChatOpenAI(temperature=0, model="gpt-4o").bind_tools(tools)

    class AgentState(TypedDict):
        messages: Annotated[list[AnyMessage], operator.add]

    def call_model(state: AgentState):
        messages = state['messages']
        response = model.invoke(messages)
        return {"messages": [response]}

    def call_tool(state: AgentState):
        last_message = state['messages'][-1]
        tool_messages = []
        tool_map = {tool.name: tool for tool in tools}
        for tool_call in last_message.tool_calls:
            tool_name = tool_call["name"]
            if tool_name in tool_map:
                selected_tool = tool_map[tool_name]
                tool_output = selected_tool.invoke(tool_call["args"])
                tool_messages.append(ToolMessage(content=str(tool_output), tool_call_id=tool_call["id"]))
        return {"messages": tool_messages}

    def router(state: AgentState) -> Literal["call_tool", "__end__"]:
        return "call_tool" if state["messages"][-1].tool_calls else "__end__"

    workflow = StateGraph(AgentState)
    workflow.add_node("agent", call_model)
    workflow.add_node("action", call_tool)
    workflow.set_entry_point("agent")
    workflow.add_conditional_edges("agent", router, {"call_tool": "action", "__end__": END})
    workflow.add_edge("action", "agent")
    
    return workflow.compile()
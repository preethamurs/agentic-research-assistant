from langchain_groq import ChatGroq
from langchain_tavily import TavilySearch
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import SystemMessage
from dotenv import load_dotenv
import os

load_dotenv()

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.2,
    max_tokens=1024,
)

search_tool = TavilySearch(
    max_results=3,
    search_depth="advanced",
    include_answer=True,
    include_raw_content=False,
)

tools = [search_tool]
agent = create_react_agent(llm, tools)

SYSTEM_PROMPT = """You are a precise research assistant with web search capability.

For EVERY user query you MUST:
1. Use the search tool with a clear focused query
2. Read results carefully
3. Answer in 3-5 concise sentences with specific facts

Always search — even for simple questions. Never skip the search step.
Answer directly without saying 'According to' or 'I found'.
Be specific with names, numbers, and dates."""


def run_research_agent(query: str) -> str:
    try:
        result = agent.invoke({
            "messages": [
                SystemMessage(content=SYSTEM_PROMPT),
                ("human", f"Research this topic and answer it: {query}")
            ]
        })
        response = result["messages"][-1].content
        if not response or "failed" in response.lower():
            return "I could not find a clear answer. Please try rephrasing your question with more detail."
        return response
    except Exception as e:
        error_msg = str(e)
        if "tool_use_failed" in error_msg:
            return "Please ask a specific research question — for example: 'Who is the CEO of Google?' or 'What is quantum computing?'"
        return f"Error: {error_msg}"
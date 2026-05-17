from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.research_agent import run_research_agent

app = FastAPI(title="Agentic Research Assistant")

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class QueryRequest(BaseModel):
    query: str

# Response model
class QueryResponse(BaseModel):
    result: str
    status: str

@app.get("/")
def root():
    return {"message": "Agentic Research Assistant is running!"}

@app.post("/research", response_model=QueryResponse)
async def research(request: QueryRequest):
    try:
        if not request.query.strip():
            raise HTTPException(
                status_code=400, 
                detail="Query cannot be empty"
            )
        
        result = run_research_agent(request.query)
        
        return QueryResponse(
            result=result,
            status="success"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.get("/health")
def health_check():
    return {"status": "healthy"}
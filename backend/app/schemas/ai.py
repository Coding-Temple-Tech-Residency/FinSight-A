from pydantic import BaseModel
from datetime import datetime

class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str

class PortfolioInsight(BaseModel):
    health_score: int
    summary: str
    diversification: str
    risk: str
    strengths: list[str]
    recommendations: list[str]
    generated_at: datetime

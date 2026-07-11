from decimal import Decimal

import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.user import User
from app.services.market import get_top_movers
from app.services.portfolio import get_user_portfolios
from app.services.watchlist import list_items as list_watchlist_items

GROQ_MODEL = "llama-3.3-70b-versatile"
_GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def _build_system_prompt(user: User, db: Session) -> str:
    portfolios = get_user_portfolios(user_id=user.id, db=db)
    total_value = sum(
        (h.quantity * h.avg_cost for p in portfolios for h in p.holdings if h.avg_cost is not None),
        Decimal(0),
    )
    items = list_watchlist_items(user_id=user.id, db=db)
    symbols = [i.symbol for i in items]
    movers = get_top_movers()
    gainers = [m["ticker"] for m in movers.get("top_gainers", [])[:3]]

    return " | ".join([
        "You are FinSight AI, a concise financial assistant.",
        "Only answer investment and finance questions.",
        f"User context — portfolios: {len(portfolios)}, estimated total value: ${total_value:.2f}",
        f"Watchlist: {', '.join(symbols) if symbols else 'empty'}",
        f"Top market gainers today: {', '.join(gainers) if gainers else 'unavailable'}",
    ])


def chat(user: User, message: str, db: Session) -> str:
    settings = get_settings()
    if not settings.groq_api_key:
        return "GROQ_API_KEY is not configured. Please add it to backend/.env."

    system_prompt = _build_system_prompt(user, db)
    try:
        response = httpx.post(
            _GROQ_URL,
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message},
                ],
                "max_tokens": 512,
            },
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except httpx.HTTPStatusError as exc:
        return f"Groq API error ({exc.response.status_code}). Please try again."
    except Exception:
        return "Sorry, I couldn't reach the AI service. Please try again."

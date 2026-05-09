from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from core.feature_engineering import FeatureEngineer, AdvancedFeatureEngineer
from core.scoring_engine import ScoringEngine
from ml.inference import ModelPredictor
from core.redis_client import RedisCache
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)

router = APIRouter()
predictor = ModelPredictor()
cache = RedisCache()

class SecurityFlags(BaseModel):
    mint_authority: bool = False
    freeze_authority: bool = False
    is_honeypot: bool = False
    top10_holder_percent: float = 0.0
    lp_burned: bool = False

class AnalyzeRequest(BaseModel):
    token_address: str
    price_history: List[float]
    volume_history: List[float]
    buy_volume_history: Optional[List[float]] = None  # Directional volume
    sol_price_change: Optional[float] = 0.0           # Market Baseline
    liquidity: float
    trade_count: int
    security_flags: SecurityFlags

class AnalyzeResponse(BaseModel):
    token_address: str
    catalyst_score: float
    ai_prediction: str
    confidence: float = 0.0
    technical_trace: List[str]

class BatchAnalyzeRequest(BaseModel):
    tokens: List[AnalyzeRequest]

class BatchAnalyzeResponse(BaseModel):
    results: List[AnalyzeResponse]


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_token(payload: AnalyzeRequest):
    logger.info(f"Received analysis request for token: {payload.token_address}")
    cached = cache.get_analysis(payload.token_address)
    if cached:
        logger.info(f"Returning cached result for token: {payload.token_address}")
        return AnalyzeResponse(**cached)
        
    result = process_single_token(payload)
    cache.set_analysis(payload.token_address, result.model_dump(), expire_seconds=300)
    logger.info(f"Analysis complete for token: {payload.token_address} | Score: {result.catalyst_score:.2f} | Prediction: {result.ai_prediction}")
    return result

@router.post("/analyze/batch", response_model=BatchAnalyzeResponse)
async def analyze_batch(payload: BatchAnalyzeRequest):
    logger.info(f"Received batch analysis request for {len(payload.tokens)} tokens")
    # Process multiple tokens iteratively (or fully vectorized in a massive GPU environment)
    results = []
    for token in payload.tokens:
        results.append(process_single_token(token))
    logger.info(f"Batch analysis complete. Processed {len(results)} tokens")
    return BatchAnalyzeResponse(results=results)

def process_single_token(payload: AnalyzeRequest) -> AnalyzeResponse:
    technical_trace = []
    
    # 1. Feature Engineering
    whale_index = FeatureEngineer.calculate_whale_index(payload.volume_history, payload.trade_count)
    vl_turbulence = FeatureEngineer.calculate_vl_turbulence(payload.volume_history, payload.liquidity)
    accumulation_detected = FeatureEngineer.detect_accumulation_divergence(payload.price_history, payload.volume_history)
    smart_money_index = AdvancedFeatureEngineer.calculate_smart_money_index(payload.volume_history, payload.trade_count, payload.liquidity)
    
    technical_trace.append(f"Whale Index: {'High' if whale_index > 5000 else 'Normal' if whale_index > 1000 else 'Low'} ({whale_index:.2f})")
    technical_trace.append(f"V/L Turbulence: {vl_turbulence:.2f}")
    
    # Analyze Buy/Sell Pressure if available
    buy_pressure = 0.5
    if payload.buy_volume_history and sum(payload.volume_history) > 0:
        buy_pressure = sum(payload.buy_volume_history) / sum(payload.volume_history)
        technical_trace.append(f"Maker/Taker Ratio: {buy_pressure*100:.1f}% Buy Volume")

    if accumulation_detected:
        technical_trace.append("Accumulation: Positive")
    else:
        technical_trace.append("Accumulation: Neutral/Negative")

    # 2. Advanced AI Prediction (Transformer + Graph Embedding + Padding)
    prediction, confidence = predictor.predict(
        price_history=payload.price_history, 
        volume_history=payload.volume_history, 
        smart_money_index=smart_money_index
    )
    
    # 3. Risk-Adjusted Scoring with Market Baseline (SOL Beta)
    final_score, score_trace = ScoringEngine.calculate_score(
        whale_index=whale_index,
        vl_turbulence=vl_turbulence,
        accumulation_detected=accumulation_detected,
        smart_money_index=smart_money_index,
        security_flags=payload.security_flags.model_dump(),
        liquidity=payload.liquidity,
        ai_prediction=prediction,
        buy_pressure=buy_pressure,
        sol_price_change=payload.sol_price_change
    )
    
    technical_trace.extend(score_trace)
    
    return AnalyzeResponse(
        token_address=payload.token_address,
        catalyst_score=final_score,
        ai_prediction=prediction,
        confidence=confidence,
        technical_trace=technical_trace
    )

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from app.ai.risk.risk_engine import RiskLevel

class BasePredictor(ABC):
    """
    Abstract base class for predicting future crowd risks.
    Allows swapping out the baseline model for an ML model later.
    """
    @abstractmethod
    def predict(self, recent_metrics: List[Dict[str, Any]], zone_config: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        pass

class BaselinePredictor(BasePredictor):
    """
    A transparent baseline model using historical trend data (linear extrapolation).
    """
    def __init__(self):
        self.model_version = "BASELINE_PREDICTION"
        
    def predict(self, recent_metrics: List[Dict[str, Any]], zone_config: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not recent_metrics or len(recent_metrics) < 2:
            return None
            
        # We need metrics sorted by timestamp ascending
        sorted_metrics = sorted(recent_metrics, key=lambda x: x["timestamp"])
        
        first = sorted_metrics[0]
        last = sorted_metrics[-1]
        
        time_delta = last["timestamp"] - first["timestamp"] # in seconds
        if time_delta <= 0:
            return None
            
        # Calculate rate of change for occupancy (units per second)
        occ_delta = last["occupancy_percentage"] - first["occupancy_percentage"]
        occ_rate = occ_delta / time_delta
        
        # Calculate rate of change for density
        den_delta = last["density"] - first["density"]
        den_rate = den_delta / time_delta
        
        critical_occ = zone_config.get("occupancy_critical", 90.0)
        critical_den = zone_config.get("density_critical", 0.5)
        
        horizon_seconds = float('inf')
        reason = ""
        predicted_risk = RiskLevel.SAFE
        
        # If occupancy is increasing, when will it hit critical?
        if occ_rate > 0:
            remaining_occ = critical_occ - last["occupancy_percentage"]
            if remaining_occ > 0:
                time_to_crit_occ = remaining_occ / occ_rate
                if time_to_crit_occ < horizon_seconds:
                    horizon_seconds = time_to_crit_occ
                    predicted_risk = RiskLevel.CRITICAL
                    reason = f"CRITICAL congestion predicted within approximately {int(horizon_seconds // 60)} minutes due to rising occupancy."
            else:
                # Already critical
                horizon_seconds = 0
                predicted_risk = RiskLevel.CRITICAL
                reason = "Occupancy is already at CRITICAL levels."
                
        # If density is increasing, when will it hit critical?
        if den_rate > 0:
            remaining_den = critical_den - last["density"]
            if remaining_den > 0:
                time_to_crit_den = remaining_den / den_rate
                if time_to_crit_den < horizon_seconds:
                    horizon_seconds = time_to_crit_den
                    predicted_risk = RiskLevel.CRITICAL
                    reason = f"CRITICAL density predicted within approximately {int(horizon_seconds // 60)} minutes due to rapidly increasing crowd density."
            elif horizon_seconds > 0:
                horizon_seconds = 0
                predicted_risk = RiskLevel.CRITICAL
                reason = "Density is already at CRITICAL levels."
                
        if horizon_seconds == float('inf'):
            return {
                "predicted_risk": RiskLevel.SAFE.value,
                "horizon": 60.0, # default long horizon
                "confidence": 0.8,
                "reason": "Crowd metrics are stable or decreasing. No critical risk predicted.",
                "model_version": self.model_version
            }
            
        horizon_minutes = horizon_seconds / 60.0
        
        # Determine confidence deterministically based on linearity
        # A perfectly linear trend would have points perfectly on the line.
        # For simplicity in the MVP, we just assign a fixed baseline confidence for positive trends.
        # We cap it at 0.6 because it's a baseline, not a trained ML model.
        confidence = 0.6
        
        # If horizon is very far out, confidence drops
        if horizon_minutes > 30:
            confidence = 0.3
            predicted_risk = RiskLevel.MEDIUM # downgrade risk if it's very far out
            reason = f"MEDIUM risk: Gradual increase may lead to congestion in {int(horizon_minutes)} minutes."
        elif horizon_minutes > 15:
            confidence = 0.4
            predicted_risk = RiskLevel.HIGH
            reason = f"HIGH risk: Congestion predicted in approximately {int(horizon_minutes)} minutes."
            
        return {
            "predicted_risk": predicted_risk.value,
            "horizon": round(horizon_minutes, 2),
            "confidence": confidence,
            "reason": reason,
            "model_version": self.model_version
        }

class PredictionService:
    def __init__(self, predictor: BasePredictor = None):
        self.predictor = predictor or BaselinePredictor()
        
    def generate_prediction(self, event_id: str, zone_id: str, recent_metrics: List[Dict[str, Any]], zone_config: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        prediction = self.predictor.predict(recent_metrics, zone_config)
        if prediction:
            prediction["event_id"] = event_id
            prediction["zone_id"] = zone_id
            
        return prediction

import pytest
from app.ai.prediction.predictor import PredictionService, BaselinePredictor
from app.ai.risk.risk_engine import RiskLevel

@pytest.fixture
def prediction_service():
    return PredictionService(predictor=BaselinePredictor())

def test_prediction_not_enough_data(prediction_service):
    zone_config = {"occupancy_critical": 90.0, "density_critical": 0.5}
    metrics = [{"timestamp": 1.0, "occupancy_percentage": 50.0, "density": 0.2}]
    
    result = prediction_service.generate_prediction("evt-1", "zone-1", metrics, zone_config)
    assert result is None

def test_prediction_stable_crowd(prediction_service):
    zone_config = {"occupancy_critical": 90.0, "density_critical": 0.5}
    metrics = [
        {"timestamp": 0.0, "occupancy_percentage": 50.0, "density": 0.2},
        {"timestamp": 60.0, "occupancy_percentage": 50.0, "density": 0.2}, # 1 min later
    ]
    
    result = prediction_service.generate_prediction("evt-1", "zone-1", metrics, zone_config)
    assert result is not None
    assert result["predicted_risk"] == RiskLevel.SAFE.value
    assert result["model_version"] == "BASELINE_PREDICTION"
    assert "stable or decreasing" in result["reason"]

def test_prediction_escalating_crowd(prediction_service):
    zone_config = {"occupancy_critical": 90.0, "density_critical": 0.5}
    # In 60 seconds (1 minute), occupancy goes from 50 to 60 (rate = 10 per min)
    # Remaining to 90 is 30. So it will take 3 minutes (180 seconds).
    metrics = [
        {"timestamp": 0.0, "occupancy_percentage": 50.0, "density": 0.2},
        {"timestamp": 60.0, "occupancy_percentage": 60.0, "density": 0.2},
    ]
    
    result = prediction_service.generate_prediction("evt-1", "zone-1", metrics, zone_config)
    assert result is not None
    assert result["predicted_risk"] == RiskLevel.CRITICAL.value
    assert result["model_version"] == "BASELINE_PREDICTION"
    assert result["horizon"] == 3.0 # 3 minutes
    assert "CRITICAL congestion predicted within approximately 3 minutes" in result["reason"]
    # Baseline cap confidence
    assert result["confidence"] == 0.6

def test_prediction_far_horizon(prediction_service):
    zone_config = {"occupancy_critical": 90.0, "density_critical": 0.5}
    # In 60 seconds, occupancy goes from 10 to 11 (rate = 1 per min)
    # Remaining to 90 is 79. So it will take 79 minutes.
    metrics = [
        {"timestamp": 0.0, "occupancy_percentage": 10.0, "density": 0.2},
        {"timestamp": 60.0, "occupancy_percentage": 11.0, "density": 0.2},
    ]
    
    result = prediction_service.generate_prediction("evt-1", "zone-1", metrics, zone_config)
    assert result is not None
    assert result["predicted_risk"] == RiskLevel.MEDIUM.value # downgraded due to horizon > 30m
    assert result["model_version"] == "BASELINE_PREDICTION"
    assert result["horizon"] == 79.0
    assert result["confidence"] == 0.3 # dropped confidence

def test_prediction_already_critical(prediction_service):
    zone_config = {"occupancy_critical": 90.0, "density_critical": 0.5}
    metrics = [
        {"timestamp": 0.0, "occupancy_percentage": 90.0, "density": 0.2},
        {"timestamp": 60.0, "occupancy_percentage": 95.0, "density": 0.2},
    ]
    
    result = prediction_service.generate_prediction("evt-1", "zone-1", metrics, zone_config)
    assert result is not None
    assert result["predicted_risk"] == RiskLevel.CRITICAL.value
    assert result["horizon"] == 0.0
    assert "already at CRITICAL levels" in result["reason"]

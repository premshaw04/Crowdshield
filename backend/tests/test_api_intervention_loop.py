import pytest
from unittest.mock import patch, MagicMock
from app.models.gate import GateStatus
from app.models.recommendation import RecommendationType
from app.services.gate_simulation import gate_simulation_service
from app.ai.risk.risk_engine import RiskLevel
import copy

@patch("app.core.database.SessionLocal")
@patch("app.services.gate_simulation.RuleBasedRiskEngine")
@patch("app.services.gate_simulation.intervention_result_repository")
@pytest.mark.anyio
async def test_simulate_transition_post_intervention(mock_intervention_repo, mock_risk_engine_class, mock_session_local):
    # Setup Mocks
    db = MagicMock()
    mock_session_local.return_value = db
    
    mock_gate = MagicMock()
    mock_gate.id = "gate-1"
    
    # DB query mock chain for Gate
    mock_gate_query = MagicMock()
    mock_gate_query.filter.return_value.first.return_value = mock_gate
    
    # DB query mock chain for Recommendation
    mock_rec = MagicMock()
    mock_rec.event_id = "event-1"
    mock_rec.zone_id = "zone-1"
    
    mock_rec_query = MagicMock()
    mock_rec_query.filter.return_value.order_by.return_value.first.return_value = mock_rec
    
    # DB query mock chain for CrowdMetric
    mock_metric = MagicMock()
    mock_metric.people_count = 100
    mock_metric.density = 5.0
    mock_metric.occupancy_percentage = 95.0
    mock_metric.average_speed = 0.5
    mock_metric.entry_rate = 10.0
    mock_metric.exit_rate = 2.0
    
    mock_metric_query = MagicMock()
    mock_metric_query.filter.return_value.order_by.return_value.first.return_value = mock_metric
    
    # Setup db.query side_effect to route to the correct mock based on the model passed
    def db_query_side_effect(model):
        from app.models.gate import Gate
        from app.models.recommendation import Recommendation
        from app.models.crowd_metric import CrowdMetric
        
        if model == Gate:
            return mock_gate_query
        elif model == Recommendation:
            return mock_rec_query
        elif model == CrowdMetric:
            return mock_metric_query
        return MagicMock()
        
    db.query.side_effect = db_query_side_effect
    
    # Setup Risk Engine
    mock_risk_engine = mock_risk_engine_class.return_value
    # It gets called twice: before and after
    mock_risk_engine.evaluate.side_effect = [
        (92.0, RiskLevel.CRITICAL, ["factors"]), # before
        (61.0, RiskLevel.HIGH, ["factors"]) # after
    ]
    
    # Execute the private background task directly with a 0 delay
    await gate_simulation_service._simulate_transition("gate-1", GateStatus.OPEN, delay=0)
    
    # Assertions
    assert mock_gate.status == GateStatus.OPEN
    db.commit.assert_called() # one for gate update
    
    # Verify Intervention Result was created
    mock_intervention_repo.create.assert_called_once()
    create_kwargs = mock_intervention_repo.create.call_args[1]
    
    assert create_kwargs["event_id"] == "event-1"
    assert create_kwargs["zone_id"] == "zone-1"
    assert create_kwargs["gate_id"] == "gate-1"
    assert create_kwargs["before_risk"] == 92.0
    assert create_kwargs["after_risk"] == 61.0
    
    # Verify mathematics were applied
    assert create_kwargs["after_metrics"]["people_count"] == 75.0 # 100 * 0.75
    assert create_kwargs["after_metrics"]["exit_rate"] == 5.0 # 2.0 * 2.5

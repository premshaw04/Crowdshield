import pytest
from app.ai.risk.risk_engine import RuleBasedRiskEngine, RiskLevel

@pytest.fixture
def engine():
    return RuleBasedRiskEngine()

def test_risk_safe(engine):
    result = engine.evaluate(
        people_count=2,
        density=0.01,
        occupancy_percentage=10.0,
        average_speed=1.5,
        entry_rate=1.0,
        zone_warning_density=0.1,
        zone_high_density=0.3,
        zone_critical_density=0.5
    )
    assert result.risk_level == RiskLevel.SAFE
    assert result.risk_score == 0.0
    assert len(result.risk_factors) == 0

def test_risk_critical(engine):
    result = engine.evaluate(
        people_count=100,
        density=0.6,
        occupancy_percentage=95.0,
        average_speed=0.2,
        entry_rate=6.0,
        zone_warning_density=0.1,
        zone_high_density=0.3,
        zone_critical_density=0.5
    )
    assert result.risk_level == RiskLevel.CRITICAL
    assert result.risk_score == 100.0 # Capped at 100
    
    assert "occupancy above critical threshold" in result.risk_factors
    assert "density above critical threshold" in result.risk_factors
    assert "movement speed decreasing" in result.risk_factors
    assert "entry rate increasing" in result.risk_factors

def test_risk_low(engine):
    result = engine.evaluate(
        people_count=50,
        density=0.15, # Above warning, below high
        occupancy_percentage=55.0, # Above medium
        average_speed=1.5, # Normal
        entry_rate=2.0, # Normal
        zone_warning_density=0.1,
        zone_high_density=0.3,
        zone_critical_density=0.5
    )
    assert result.risk_level == RiskLevel.LOW
    assert "occupancy increasing" in result.risk_factors
    assert "density above warning threshold" in result.risk_factors

def test_risk_high(engine):
    # Only one critical factor => 40 points => HIGH
    result = engine.evaluate(
        people_count=100,
        density=0.05, # Safe
        occupancy_percentage=95.0, # Critical (40 pts)
        average_speed=1.5, # Normal
        entry_rate=6.0, # High (10 pts) -> 50 pts
        zone_warning_density=0.1,
        zone_high_density=0.3,
        zone_critical_density=0.5
    )
    # 40 (occ) + 10 (entry) = 50 -> MEDIUM level. Wait, let's make it HIGH.
    # HIGH is >= 60.
    # Let's adjust to reach HIGH.
    # occ critical (40) + density high (25) = 65 -> HIGH
    result2 = engine.evaluate(
        people_count=100,
        density=0.35, # High (25 pts)
        occupancy_percentage=95.0, # Critical (40 pts)
        average_speed=1.5, # Normal
        entry_rate=2.0, # Normal
        zone_warning_density=0.1,
        zone_high_density=0.3,
        zone_critical_density=0.5
    )
    assert result2.risk_level == RiskLevel.HIGH
    assert result2.risk_score == 65.0
    assert "occupancy above critical threshold" in result2.risk_factors
    assert "density above high threshold" in result2.risk_factors

def test_risk_speed_low_people(engine):
    # Low speed should NOT trigger factor if people_count is very low
    result = engine.evaluate(
        people_count=2,
        density=0.01,
        occupancy_percentage=10.0,
        average_speed=0.1, # Low
        entry_rate=0.0,
        zone_warning_density=0.1,
        zone_high_density=0.3,
        zone_critical_density=0.5
    )
    assert "movement speed decreasing" not in result.risk_factors

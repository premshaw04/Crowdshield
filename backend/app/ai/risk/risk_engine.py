from enum import Enum
from dataclasses import dataclass, field
from typing import List, Dict

class RiskLevel(str, Enum):
    SAFE = "SAFE"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

@dataclass
class RiskResult:
    risk_score: float
    risk_level: RiskLevel
    risk_factors: List[str] = field(default_factory=list)

class RuleBasedRiskEngine:
    """
    A transparent, rule-based scoring system for evaluating crowd risk.
    This is not an ML model. It uses deterministic thresholds to assess safety.
    """
    
    def __init__(self, config: Dict[str, float] = None):
        """
        Initializes the risk engine with configurable thresholds.
        
        Args:
            config: A dictionary of baseline thresholds.
        """
        # Default configuration
        self.config = {
            "occupancy_critical": 90.0,
            "occupancy_high": 75.0,
            "occupancy_medium": 50.0,
            
            # Dynamic metrics thresholds (indicative)
            "low_speed_threshold": 0.5, # units per second
            "high_entry_rate": 5.0, # persons per second entering
        }
        if config:
            self.config.update(config)

    def evaluate(self, 
                 people_count: int, 
                 density: float, 
                 occupancy_percentage: float, 
                 average_speed: float, 
                 entry_rate: float,
                 zone_warning_density: float,
                 zone_high_density: float,
                 zone_critical_density: float) -> RiskResult:
        """
        Evaluate current metrics and return a RiskResult.
        """
        
        score = 0.0
        factors = []
        
        # 1. Occupancy checks (0 - 40 points)
        if occupancy_percentage >= self.config["occupancy_critical"]:
            score += 40.0
            factors.append("occupancy above critical threshold")
        elif occupancy_percentage >= self.config["occupancy_high"]:
            score += 25.0
            factors.append("occupancy above high threshold")
        elif occupancy_percentage >= self.config["occupancy_medium"]:
            score += 10.0
            factors.append("occupancy increasing")
            
        # 2. Density checks (0 - 40 points)
        if zone_critical_density > 0 and density >= zone_critical_density:
            score += 40.0
            factors.append("density above critical threshold")
        elif zone_high_density > 0 and density >= zone_high_density:
            score += 25.0
            factors.append("density above high threshold")
        elif zone_warning_density > 0 and density >= zone_warning_density:
            score += 10.0
            factors.append("density above warning threshold")
            
        # 3. Dynamic Checks
        # Movement speed (0 - 10 points)
        # Low movement speed indicates crowding/stagnation
        if average_speed < self.config["low_speed_threshold"] and people_count > 5:
            score += 10.0
            factors.append("movement speed decreasing")
            
        # Entry rate (0 - 10 points)
        if entry_rate >= self.config["high_entry_rate"]:
            score += 10.0
            factors.append("entry rate increasing")
            
        # Cap score at 100
        score = min(score, 100.0)
        
        # Map score to level
        level = RiskLevel.SAFE
        if score >= 85.0:
            level = RiskLevel.CRITICAL
        elif score >= 60.0:
            level = RiskLevel.HIGH
        elif score >= 35.0:
            level = RiskLevel.MEDIUM
        elif score >= 15.0:
            level = RiskLevel.LOW
            
        return RiskResult(
            risk_score=score,
            risk_level=level,
            risk_factors=factors
        )

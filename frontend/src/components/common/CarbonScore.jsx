import React from 'react';
import { Leaf, AlertTriangle, Zap } from 'lucide-react';
import './CarbonScore.css';

const CarbonScore = ({ 
  carbonScore, 
  isEcoFriendly, 
  showLabel = true, 
  size = 'medium',
  showIcon = true,
  className = ''
}) => {

  // 🔥 PREVENT CRASH: ensure score is always a valid number
  const safeScore = Number(carbonScore ?? 0);

  const getCarbonLevel = (score) => {
    if (score <= 3) return 'eco-friendly';
    if (score <= 8) return 'moderate';
    return 'high-carbon';
  };

  const getCarbonColor = (score) => {
    if (score <= 3) return '#10B981'; 
    if (score <= 8) return '#F59E0B'; 
    return '#EF4444';
  };

  const getCarbonIcon = (score) => {
    if (score <= 3) return <Leaf className="carbon-icon" />;
    if (score <= 8) return <AlertTriangle className="carbon-icon" />;
    return <Zap className="carbon-icon" />;
  };

  const getCarbonLabel = (score) => {
    if (score <= 3) return 'Eco-Friendly';
    if (score <= 8) return 'Moderate Impact';
    return 'High Carbon';
  };

  const getCarbonDescription = (score) => {
    if (score <= 3) return 'Low carbon footprint - Great for the environment!';
    if (score <= 8) return 'Moderate carbon impact - Consider eco-friendly alternatives';
    return 'High carbon footprint - Consider more sustainable options';
  };

  const level = getCarbonLevel(safeScore);
  const color = getCarbonColor(safeScore);
  const icon = getCarbonIcon(safeScore);
  const label = getCarbonLabel(safeScore);
  const description = getCarbonDescription(safeScore);

  return (
    <div className={`carbon-score ${level} ${size} ${className}`}>
      <div className="carbon-score-header">
        {showIcon && (
          <div className="carbon-score-icon" style={{ color }}>
            {icon}
          </div>
        )}
        <div className="carbon-score-content">
          <div className="carbon-score-value" style={{ color }}>
            {safeScore.toFixed(1)} kg CO₂
          </div>
          {showLabel && (
            <div className="carbon-score-label" style={{ color }}>
              {label}
            </div>
          )}
        </div>
      </div>

      {showLabel && (
        <div className="carbon-score-description">
          {description}
        </div>
      )}

      {isEcoFriendly && (
        <div className="carbon-eco-badge">
          <Leaf className="eco-icon" />
          <span>Eco-Friendly Certified</span>
        </div>
      )}
    </div>
  );
};

export default CarbonScore;

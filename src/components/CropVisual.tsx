import React from 'react';
import { useGame } from '../context/GameContext';

export const CropVisual: React.FC = () => {
  const { state } = useGame();
  const { crop } = state;

  // Simple visual rendering logic based on stage and visual state
  const getRenderDetails = () => {
    switch (crop.stage) {
      case 'sprout': return { emoji: '🌱', size: '3rem', boxH: 120 };
      case 'growth': return { emoji: '🌿', size: '5rem', boxH: 160 };
      case 'flower': return { emoji: '🌸', size: '6rem', boxH: 180 };
      case 'fruit': return { emoji: '🍓', size: '6rem', boxH: 180 };
      case 'dead': return { emoji: '🥀', size: '5rem', boxH: 160 };
      default: return { emoji: '🌱', size: '3rem', boxH: 130 };
    }
  };

  const getStatusColor = () => {
    if (crop.visualState === 'stressed') return 'var(--warning)';
    if (crop.visualState === 'risky') return 'var(--danger)';
    return 'var(--success)';
  };

  const render = getRenderDetails();

  return (
    <div className="glass-panel text-center animate-pop" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
           <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', margin: 0 }}>{crop.name}</h2>
           <span className="chip mt-2" style={{ background: 'var(--bg-color)' }}>Day {crop.day}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
           <span className="chip" style={{ background: getStatusColor(), color: '#fff' }}>{crop.visualState.toUpperCase()}</span>
           <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>Stage: {crop.stage.toUpperCase()}</div>
        </div>
      </div>

      <div className="animate-float" style={{ 
          height: render.boxH, 
          display: 'flex', 
          alignItems: 'end', 
          justifyContent: 'center',
          borderBottom: '4px solid #8B4513',
          margin: '20px 40px',
          paddingBottom: 10
      }}>
        <div style={{ fontSize: render.size, lineHeight: 1, filter: crop.visualState === 'dead' ? 'grayscale(100%)' : 'none' }}>
           {render.emoji}
        </div>
      </div>

    </div>
  );
};

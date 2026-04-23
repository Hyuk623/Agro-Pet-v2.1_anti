import React from 'react';
import { useGame } from '../context/GameContext';
import { resolveCropVisual, cropVisualRegistry } from '../data/visualRegistry';
import { determineVisualCondition, getConditionFeedback } from '../utils/visualResolver';

export const CropVisual: React.FC = () => {
  const { state } = useGame();
  const { crop } = state;

  // 1. Resolve visual condition from technical stats
  const condition = determineVisualCondition(crop);
  
  // 2. Resolve visual asset and feedback meta
  const assetPath = resolveCropVisual(crop.id, crop.stage, condition);
  const feedback = getConditionFeedback(condition);
  const characterProfile = cropVisualRegistry[crop.id]?.profile;

  return (
    <div className="glass-panel text-center animate-pop" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Character Personality & Status Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
        <div style={{ textAlign: 'left' }}>
           <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', margin: 0 }}>{crop.name || characterProfile?.displayName}</h2>
           <div className="flex gap-1 mt-1">
              {characterProfile?.personalityKeywords.slice(0, 2).map(k => (
                <span key={k} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', border: '1px solid #E2E8F0', padding: '1px 6px', borderRadius: '4px' }}>
                  {k}
                </span>
              ))}
           </div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <span className={`chip status-badge ${feedback.effect}`} style={{ background: feedback.color, color: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
             {feedback.badge}
           </span>
           <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Day {crop.day} • {crop.stage.toUpperCase()}</div>
        </div>
      </div>

      {/* Visual Display Area */}
      <div className={`${feedback.animation} ${feedback.effect} sparkle-container`} style={{ 
          height: 180, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'end',
          borderBottom: '4px solid #8B4513',
          margin: '10px 20px',
          paddingBottom: 10,
          background: 'radial-gradient(circle at bottom, rgba(76, 175, 80, 0.05) 0%, transparent 70%)',
          position: 'relative'
      }}>
        {/* Recovery Sparkle Placeholder if condition is recovering */}
        {condition === 'recovering' && (
          <div className="sparkle" style={{ position: 'absolute', top: '20%', right: '20%' }}></div>
        )}

        {/* Actual Character Image */}
        <img 
          src={assetPath} 
          alt={`${crop.id} ${condition}`}
          style={{ 
            maxHeight: '130px', 
            maxWidth: '130px', 
            objectFit: 'contain', 
            transition: 'all 0.5s ease-in-out'
          }}
          onError={(e) => {
            (e.target as any).style.display = 'none';
            (e.target as any).nextSibling.style.display = 'block';
          }}
        />
        {/* Placeholder Emoji (Visible only on error) */}
        <div style={{ display: 'none', fontSize: '5rem', lineHeight: 1 }}>
           {crop.stage === 'fruit' ? '🍓' : '🌱'}
        </div>

        {/* Shadow */}
        <div style={{ 
          width: '60px', 
          height: '6px', 
          background: 'rgba(0,0,0,0.1)', 
          borderRadius: '50%', 
          marginTop: 8,
          filter: 'blur(2px)'
        }}></div>
      </div>

      {/* Character Mood Text */}
      <div className="mt-4" style={{ 
        fontSize: '0.75rem', 
        fontStyle: 'italic', 
        color: condition === 'thriving' ? 'var(--primary)' : 'var(--text-muted)',
        fontWeight: condition === 'thriving' ? 700 : 400
      }}>
        {condition === 'thriving' ? "Feeling absolutely wonderful today! 🌟" : 
         condition === 'recovering' ? "Getting stronger day by day..." : 
         condition === 'sick' || condition === 'diseased' ? "I don't feel so good... please help." :
         `"${characterProfile?.moodStyle}"`}
      </div>
      
    </div>
  );
};

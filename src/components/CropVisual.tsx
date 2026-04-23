import React from 'react';
import { useGame } from '../context/GameContext';
import { resolveCropVisual, cropVisualRegistry } from '../data/visualRegistry';
import { determineVisualCondition, getConditionFeedback } from '../utils/visualResolver';
import { getCropReaction, getMoodLabel } from '../utils/moodResolver';

export const CropVisual: React.FC = () => {
  const { state } = useGame();
  const { crop } = state;

  // 1. Resolve visual condition & mood
  const condition = determineVisualCondition(crop);
  const reaction = getCropReaction(crop, condition);
  const moodLabel = getMoodLabel(condition);
  
  // 2. Resolve visual asset and feedback meta
  const assetPath = resolveCropVisual(crop.id, crop.stage, condition);
  const feedback = getConditionFeedback(condition);
  const characterProfile = cropVisualRegistry[crop.id]?.profile;

  return (
    <div className="glass-panel text-center animate-pop" style={{ position: 'relative', overflow: 'visible', paddingTop: '30px' }}>
      
      {/* Dynamic Speech Bubble */}
      {crop.stage !== 'dead' && (
        <div className="speech-bubble animate-pop" style={{ borderColor: feedback.color }}>
          {reaction}
        </div>
      )}

      {/* Character Identity Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {crop.name || characterProfile?.displayName}
            </h2>
            <span style={{ fontSize: '0.7rem', background: '#EDF2F7', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
              {characterProfile?.displayName}
            </span>
         </div>
         <div className="flex gap-2 mt-2">
            <span className="chip" style={{ background: feedback.color, color: '#fff', fontSize: '0.7rem', padding: '4px 10px' }}>
              {moodLabel.toUpperCase()}
            </span>
            <span className="chip" style={{ background: 'var(--bg-color)', border: '1px solid #E2E8F0', fontSize: '0.7rem', padding: '4px 10px' }}>
              STAGE: {crop.stage.toUpperCase()}
            </span>
         </div>
      </div>

      {/* Visual Centerpiece Area */}
      <div className={`${feedback.animation} ${feedback.effect} sparkle-container`} style={{ 
          height: 200, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '6px solid rgba(139, 69, 19, 0.2)',
          margin: '0 20px',
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 70%)',
          position: 'relative'
      }}>
        {/* Recovery Sparkle */}
        {condition === 'recovering' && (
          <div className="sparkle" style={{ position: 'absolute', top: '20%', right: '20%' }}></div>
        )}

        {/* Character Image */}
        <img 
          src={assetPath} 
          alt={`${crop.id} ${condition}`}
          style={{ 
            maxHeight: '150px', 
            maxWidth: '150px', 
            objectFit: 'contain', 
            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transformOrigin: 'bottom center'
          }}
          onError={(e) => {
            (e.target as any).style.display = 'none';
            (e.target as any).nextSibling.style.display = 'block';
          }}
        />
        {/* Fallback Emoji */}
        <div style={{ display: 'none', fontSize: '5.5rem', lineHeight: 1 }}>
           {crop.stage === 'fruit' ? '🍓' : '🌱'}
        </div>

        {/* Dynamic Shadow */}
        <div style={{ 
          width: '70px', 
          height: '8px', 
          background: 'rgba(0,0,0,0.08)', 
          borderRadius: '50%', 
          marginTop: 10,
          filter: 'blur(3px)'
        }}></div>
      </div>

      {/* Character Details Footer */}
      <div className="mt-4 flex justify-between items-center" style={{ padding: '0 10px' }}>
        <div style={{ textAlign: 'left' }}>
           <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>CHARM POINT</div>
           <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
             ✨ {characterProfile?.charmPoints[0]}
           </div>
        </div>
        <div className="chip" style={{ background: '#F7FAFC', color: 'var(--text-muted)', fontWeight: 700 }}>
          Day {crop.day}
        </div>
      </div>
      
    </div>
  );
};

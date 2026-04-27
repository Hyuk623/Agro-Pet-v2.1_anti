import React from 'react';
import { useGame } from '../context/GameContext';
import { resolveCropVisual, cropVisualRegistry } from '../data/visualRegistry';
import { determineVisualCondition, getConditionFeedback } from '../utils/visualResolver';
import { getCropReaction, getMoodLabel } from '../utils/moodResolver';

export const CropVisual: React.FC = () => {
  const { state } = useGame();
  const { crop } = state;
  const [showHeart, setShowHeart] = React.useState(false);

  // Trigger heart animation on interactionCount change
  React.useEffect(() => {
    if (crop.interactionCount > 0) {
      setShowHeart(true);
      const timer = setTimeout(() => setShowHeart(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [crop.interactionCount]);

  // 1. Resolve visual condition & mood
  const condition = determineVisualCondition(crop);
  const reaction = getCropReaction(crop, condition);
  const moodLabel = getMoodLabel(condition);
  
  // 2. Resolve visual asset and feedback meta
  const assetPath = resolveCropVisual(crop.id, crop.stage, condition);
  const feedback = getConditionFeedback(condition);
  const characterProfile = cropVisualRegistry[crop.id]?.profile;

  // Helper to determine if we should show the "Face Overlay"
  // Usually shown for emojis or simple placeholders to give them 'character'
  const showFaceOverlay = condition !== 'dead';

  return (
    <div className="glass-panel text-center animate-pop" style={{ position: 'relative', overflow: 'visible', paddingTop: '30px' }}>
      
      {/* Floating Hearts for Interaction */}
      {showHeart && (
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', zIndex: 100, pointerEvents: 'none' }}>
           <div className="animate-pop" style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 2px 8px rgba(246, 135, 179, 0.6))' }}>❤️</div>
        </div>
      )}

      {/* Dynamic Speech Bubble */}
      {crop.stage !== 'dead' && (
        <div className="speech-bubble animate-pop" style={{ borderColor: feedback.color }}>
          {reaction}
        </div>
      )}

      {/* Character Identity Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>
              {crop.name || characterProfile?.displayName}
            </h2>
            <span style={{ fontSize: '0.75rem', background: 'rgba(79, 209, 197, 0.1)', padding: '3px 10px', borderRadius: '12px', color: '#319795', fontWeight: 700 }}>
              {characterProfile?.displayName}
            </span>
         </div>
         <div className="flex gap-2 mt-2">
            <span className="chip" style={{ background: feedback.color, color: '#fff', fontSize: '0.75rem', padding: '5px 12px', fontWeight: 800 }}>
              {moodLabel.toUpperCase()}
            </span>
            <span className="chip" style={{ background: 'white', border: '2px solid #E2E8F0', fontSize: '0.75rem', padding: '4px 12px', color: '#718096' }}>
              DAY {crop.day} • {crop.stage.toUpperCase()}
            </span>
         </div>
      </div>

      {/* Visual Centerpiece Area - CHARACTER ZONE */}
      <div className={`${feedback.animation} ${feedback.effect} sparkle-container`} style={{ 
          height: 220, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '8px solid rgba(139, 69, 19, 0.15)',
          margin: '0 10px',
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, transparent 80%)',
          position: 'relative',
          borderRadius: '24px'
      }}>
        {/* Recovery Sparkle */}
        {condition === 'recovering' && (
          <div className="sparkle" style={{ position: 'absolute', top: '15%', right: '15%' }}></div>
        )}

        {/* --- CHARACTER FACE LAYER (Tamagotchi Style) --- */}
        {showFaceOverlay && (
          <div className="char-face">
            {/* Eyes */}
            <div className="char-eyes">
              <div className="char-eye" style={{ 
                height: condition === 'thriving' ? '12px' : '8px',
                background: condition === 'sick' ? '#718096' : '#333'
              }}></div>
              <div className="char-eye" style={{ 
                height: condition === 'thriving' ? '12px' : '8px',
                background: condition === 'sick' ? '#718096' : '#333'
              }}></div>
            </div>
            {/* Mouth */}
            <div className={`char-mouth ${condition === 'stressed' || condition === 'sick' ? 'surprised' : ''}`} style={{
               borderColor: condition === 'sick' ? '#718096' : '#333'
            }}></div>
            {/* Blush (Only if healthy/thriving) */}
            {(condition === 'healthy' || condition === 'thriving') && (
              <div className="char-blush">
                <div className="blush-dot"></div>
                <div className="blush-dot"></div>
              </div>
            )}
          </div>
        )}

        {/* Character Image / Base Body */}
        <img 
          src={assetPath} 
          alt={`${crop.id} ${condition}`}
          style={{ 
            maxHeight: '160px', 
            maxWidth: '160px', 
            objectFit: 'contain', 
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transformOrigin: 'bottom center',
            filter: condition === 'sick' || condition === 'diseased' ? 'saturate(0.5)' : 'none'
          }}
          onError={(e) => {
            (e.target as any).style.display = 'none';
            (e.target as any).nextSibling.style.display = 'block';
          }}
        />
        {/* Fallback Emoji */}
        <div style={{ display: 'none', fontSize: '6rem', lineHeight: 1, filter: condition === 'dead' ? 'grayscale(1)' : 'none' }}>
           {crop.stage === 'fruit' ? '🍓' : '🌱'}
        </div>

        {/* Dynamic Character Shadow */}
        <div style={{ 
          width: '80px', 
          height: '10px', 
          background: 'rgba(0,0,0,0.06)', 
          borderRadius: '50%', 
          marginTop: 12,
          filter: 'blur(4px)'
        }}></div>
      </div>

      {/* Character Profile Footer */}
      <div className="mt-5 flex justify-between items-end" style={{ padding: '0 15px' }}>
        <div style={{ textAlign: 'left' }}>
           <div style={{ fontSize: '0.7rem', color: '#A0AEC0', fontWeight: 700, marginBottom: 4, letterSpacing: '0.5px' }}>PE-TRAIT</div>
           <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
             ✨ {characterProfile?.charmPoints[0]}
           </div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: '0.7rem', color: '#A0AEC0', fontWeight: 700, marginBottom: 4, letterSpacing: '0.5px' }}>PERSONALITY</div>
           <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
             {characterProfile?.personalityKeywords[0]} Buddy
           </div>
        </div>
      </div>
      
    </div>
  );
};

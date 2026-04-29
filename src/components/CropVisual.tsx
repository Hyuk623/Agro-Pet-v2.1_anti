import React from 'react';
import { useGame } from '../context/GameContext';
import { resolveCropVisual, cropVisualRegistry } from '../data/visualRegistry';
import { strawberryPack } from '../data/strawberryPack';
import { determineVisualCondition, getConditionFeedback } from '../utils/visualResolver';
import { getCropReaction, getMoodLabel } from '../utils/moodResolver';
import { Sparkles, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { DynamicCropArt } from './DynamicCropArt';

export const CropVisual: React.FC = () => {
  const { state } = useGame();
  const { crop, dayFeedback } = state;
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
  const condition = (crop.visualState as any) || determineVisualCondition(crop);
  const reaction = getCropReaction(crop, condition);
  const moodLabel = getMoodLabel(condition);
  
  const feedback = getConditionFeedback(condition);
  const characterProfile = cropVisualRegistry[crop.id]?.profile;

  // Branch colors
  const branchColors = {
    optimal: '#D69E2E',
    standard: '#319795',
    stunted: '#718096',
    distorted: '#E53E3E'
  };

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
            <span style={{ 
              fontSize: '0.65rem', 
              background: 'linear-gradient(135deg, #ECC94B, #D69E2E)', 
              padding: '2px 8px', 
              borderRadius: '8px', 
              color: '#fff', 
              fontWeight: 900,
              textTransform: 'uppercase'
            }}>
              {crop.trait}
            </span>
         </div>
         <div className="flex gap-2 mt-2">
            <span className="chip" style={{ background: feedback.color, color: '#fff', fontSize: '0.7rem', padding: '4px 10px', fontWeight: 800 }}>
              {moodLabel.toUpperCase()}
            </span>
            <span className="chip" style={{ background: 'white', border: '2px solid #E2E8F0', fontSize: '0.7rem', padding: '3px 10px', color: '#718096' }}>
              DAY {crop.day} • {crop.stage.toUpperCase()}
            </span>
            {crop.branch !== 'standard' && (
              <span className="chip" style={{ background: branchColors[crop.branch], color: '#fff', fontSize: '0.7rem', padding: '4px 10px', fontWeight: 800 }}>
                {crop.branch.toUpperCase()}
              </span>
            )}
         </div>
      </div>

      {/* Visual Centerpiece Area */}
      <div className={`${feedback.animation} ${feedback.effect} sparkle-container`} style={{ 
          height: 200, 
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
        {crop.branch === 'optimal' && <div className="sparkle" style={{ position: 'absolute', top: 10, right: 10 }}></div>}
        
        <DynamicCropArt
          stage={crop.stage}
          condition={condition}
          color={strawberryPack.themeColor}
          neglectLevel={crop.neglectLevel}
        />

        <div style={{ width: '80px', height: '10px', background: 'rgba(0,0,0,0.06)', borderRadius: '50%', marginTop: 8, filter: 'blur(4px)', transition: 'width 0.5s ease' }}></div>
      </div>

      {/* Evolution Progress Gauge (Tamagotchi Style) */}
      <div style={{ margin: '15px 15px 0 15px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 800, color: '#A0AEC0', marginBottom: 4 }}>
            <span>EVOLUTION GOAL</span>
            <span>{Math.round(crop.growthProgress)}%</span>
         </div>
         <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ 
              width: `${crop.growthProgress}%`, 
              height: '100%', 
              background: 'linear-gradient(to right, #48BB78, #38A169)',
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
         </div>
      </div>

      {/* Today's Insight (Tamagotchi Lesson Integration) */}
      {dayFeedback && (dayFeedback.impact || dayFeedback.sessionReport) && (
        <div className="glass-panel" style={{ margin: '15px 10px 5px 10px', padding: '12px', background: 'rgba(255,255,255,0.9)', border: '1px solid #E2E8F0', textAlign: 'left' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <TrendingUp size={14} color="#319795" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2D3748' }}>Growth Impact</span>
           </div>
           <p style={{ fontSize: '0.75rem', color: '#4A5568', margin: 0 }}>{dayFeedback.sessionReport || dayFeedback.impact}</p>
           
           {dayFeedback.lesson && (
             <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #CBD5E0', display: 'flex', gap: 6 }}>
               <Info size={14} color="#A0AEC0" />
               <p style={{ fontSize: '0.65rem', color: '#718096', fontStyle: 'italic', margin: 0 }}>{dayFeedback.lesson}</p>
             </div>
           )}
        </div>
      )}

      {/* Crisis Warning Card - HIGHEST VISIBILITY */}
      {(crop.stress > 60 || crop.diseaseRisk > 60 || crop.stamina < 30) && (
        <div className="animate-pulse" style={{ 
          margin: '10px', 
          background: '#FFF5F5', 
          border: '2px solid #FEB2B2', 
          borderRadius: '12px', 
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <AlertCircle color="#E53E3E" size={24} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#C53030' }}>CRITICAL CARE REQUIRED</div>
            <div style={{ fontSize: '0.7rem', color: '#E53E3E' }}>
              {crop.stress > 60 && "Extreme stress detected. "}
              {crop.diseaseRisk > 60 && "Fungal risk is very high. "}
              {crop.stamina < 30 && "Energy is dangerously low."}
            </div>
          </div>
        </div>
      )}

      {/* Care History (Tamagotchi Hearts/Dots) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 10, marginBottom: 10 }}>
         {crop.careQualityHistory.slice(-7).map((score, i) => (
           <div key={i} style={{ 
             width: 8, 
             height: 8, 
             borderRadius: '50%', 
             background: score > 80 ? '#48BB78' : score > 50 ? '#F6E05E' : '#F56565',
             boxShadow: score > 80 ? '0 0 5px rgba(72, 187, 120, 0.5)' : 'none'
           }} title={`Score: ${score}`} />
         ))}
         {[...Array(Math.max(0, 7 - crop.careQualityHistory.length))].map((_, i) => (
           <div key={`empty-${i}`} style={{ width: 8, height: 8, borderRadius: '50%', background: '#E2E8F0' }} />
         ))}
      </div>
      
    </div>
  );
};

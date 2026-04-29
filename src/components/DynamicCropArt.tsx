import React from 'react';
import type { GrowthStage, VisualState } from '../types/game';

interface DynamicCropArtProps {
  stage: GrowthStage;
  condition: VisualState;
  color: string;
  neglectLevel?: number;  // 0–100, drives yellowing/drooping effects
}

/**
 * A purely code-based visual system that ensures the UI is never "broken".
 * Renders high-quality SVG characters with integrated facial expressions.
 */
export const DynamicCropArt: React.FC<DynamicCropArtProps> = ({ stage, condition, color, neglectLevel = 0 }) => {
  const isDead = condition === 'dead';

  // Neglect visual effects: yellowing and opacity reduction
  const neglectYellow = neglectLevel > 30
    ? `sepia(${Math.min(0.8, (neglectLevel - 30) / 100)}) saturate(0.7)`
    : 'none';
  const neglectOpacity = neglectLevel > 60 ? Math.max(0.6, 1 - (neglectLevel - 60) / 200) : 1;

  const filter = isDead ? 'grayscale(1)'
    : condition === 'wilted' ? 'grayscale(0.5) sepia(0.4)'
    : neglectLevel > 30 ? neglectYellow
    : 'none';

  // Animation variants
  const animationClass = 
    condition === 'thriving' ? 'animate-bounce-slow' :
    condition === 'healthy' ? 'animate-float' :
    condition === 'recovering' ? 'animate-pop-in' :
    condition === 'stressed' ? 'animate-wobble' :
    '';

  const renderFace = (sizeFactor: number = 1, yOffset: number = 0) => {
    if (isDead) return null;
    
    const eyeSize = 6 * sizeFactor;
    const mouthWidth = 10 * sizeFactor;
    const isSad = condition === 'stressed' || condition === 'wilted';

    return (
      <div style={{ 
        position: 'absolute', 
        top: `calc(45% + ${yOffset}px)`, 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', gap: 15 * sizeFactor }}>
          <div style={{ width: eyeSize, height: eyeSize, background: '#333', borderRadius: '50%' }} />
          <div style={{ width: eyeSize, height: eyeSize, background: '#333', borderRadius: '50%' }} />
        </div>
        <div style={{ 
          width: mouthWidth, 
          height: 6 * sizeFactor, 
          border: '2px solid #333', 
          borderTop: isSad ? '2px solid #333' : '0',
          borderBottom: isSad ? '0' : '2px solid #333',
          borderRadius: isSad ? '50% 50% 0 0' : '0 0 50% 50%',
          marginTop: 5 * sizeFactor
        }} />
        {(condition === 'healthy' || condition === 'thriving' || condition === 'recovering') && (
          <div style={{ position: 'absolute', width: '160%', display: 'flex', justifyContent: 'space-between', top: 5 }}>
            <div style={{ width: 12 * sizeFactor, height: 6 * sizeFactor, background: 'rgba(255,182,193,0.6)', borderRadius: '50%', filter: 'blur(2px)' }} />
            <div style={{ width: 12 * sizeFactor, height: 6 * sizeFactor, background: 'rgba(255,182,193,0.6)', borderRadius: '50%', filter: 'blur(2px)' }} />
          </div>
        )}
      </div>
    );
  };

  const renderArt = () => {
    switch (stage) {
      case 'seed':
        return (
          <div className={animationClass} style={{ position: 'relative', width: 80, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="80" height="60" viewBox="0 0 60 40" fill="none">
              <ellipse cx="30" cy="30" rx="20" ry="12" fill="#8B4513" stroke="#5D2E0C" strokeWidth="2" />
              <path d="M30 18C30 18 32 10 38 12" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" />
            </svg>
            {renderFace(0.6, 5)}
          </div>
        );
      case 'sprout':
        return (
          <div className={animationClass} style={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" style={{ filter }}>
              <path d="M30 85C30 80 40 75 50 75C60 75 70 80 70 85V90H30V85Z" fill="#795548" />
              <path d="M50 75V50" stroke="#4CAF50" strokeWidth="8" strokeLinecap="round" />
              <path d="M50 55C50 55 25 45 30 35C35 25 50 50 50 50" fill="#8BC34A" stroke="#4CAF50" strokeWidth="2" />
              <path d="M50 55C50 55 75 45 70 35C65 25 50 50 50 50" fill="#8BC34A" stroke="#4CAF50" strokeWidth="2" />
            </svg>
            {renderFace(0.8, 10)}
          </div>
        );
      case 'growth':
      case 'flower':
      case 'fruit':
        return (
          <div className={animationClass} style={{ filter, position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ 
               width: 110, 
               height: 120, 
               background: stage === 'fruit' ? color : '#4CAF50', 
               borderRadius: '45% 45% 50% 50%',
               border: '5px solid #333',
               position: 'relative',
               overflow: 'hidden'
             }}>
                {stage === 'fruit' && (
                  <div style={{ position: 'absolute', top: '15%', left: '15%', right: '15%', bottom: '15%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
                     {[...Array(9)].map((_, i) => <div key={i} style={{ width: 5, height: 5, background: '#FEFCBF', borderRadius: '50%', opacity: 0.8 }} />)}
                  </div>
                )}
             </div>
             {/* Flower on top */}
             {stage === 'flower' && (
                  <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', fontSize: '2.5rem', zIndex: 11 }}>🌼</div>
             )}
             {/* Leaf Hat */}
             <div style={{ position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: -10, zIndex: 5 }}>
                <div style={{ width: 45, height: 25, background: '#48BB78', borderRadius: '50% 50% 0 0', border: '3px solid #333' }} />
                <div style={{ width: 45, height: 25, background: '#48BB78', borderRadius: '50% 50% 0 0', border: '3px solid #333', transform: 'rotate(10deg)' }} />
             </div>
             {renderFace(1, 10)}
          </div>
        );
      case 'dead':
         return <div style={{ fontSize: '6rem' }}>💀</div>;
      default:
        return <div style={{ fontSize: '6rem' }}>🌱</div>;
    }
  };

  return (
    <div style={{
      position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center',
      width: 180, height: 180,
      opacity: neglectOpacity,
      transition: 'opacity 0.5s ease, filter 0.5s ease'
    }}>
       {renderArt()}
    </div>
  );
};

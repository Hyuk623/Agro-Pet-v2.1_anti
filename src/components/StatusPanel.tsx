import React from 'react';
import { useGame } from '../context/GameContext';
import { Droplet, Heart, Wind, Zap } from 'lucide-react';

const ProgressBar = ({ value, color, reverseWarning = false }: { value: number, color: string, reverseWarning?: boolean }) => {
  const isDanger = reverseWarning ? value >= 80 : value <= 20;
  
  return (
    <div style={{ width: '100%', height: 10, background: '#E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ 
        height: '100%', 
        width: `${value}%`, 
        background: isDanger ? 'var(--danger)' : color,
        transition: 'width 0.5s ease',
      }} />
    </div>
  );
};

export const StatusPanel: React.FC = () => {
  const { state } = useGame();
  const { crop } = state;

  return (
    <div className="glass-panel">
      <h3 className="mb-4" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Internal Status</h3>
      
      <div className="flex-col gap-4">
        <div className="flex items-center gap-4">
          <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: 'var(--text-muted)' }}><Heart size={16} color="var(--primary)"/> Stamina</div>
          <ProgressBar value={crop.stamina} color="var(--primary)" />
        </div>

        <div className="flex items-center gap-4">
          <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: 'var(--text-muted)' }}><Wind size={16} color="#805AD5"/> Stress</div>
          <ProgressBar value={crop.stress} color="#805AD5" reverseWarning={true} />
        </div>

        <div className="flex items-center gap-4">
          <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: 'var(--text-muted)' }}><Droplet size={16} color="var(--info)" /> Water</div>
          <ProgressBar value={crop.waterLevel} color="var(--info)" />
        </div>

        <div className="flex items-center gap-4">
          <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: 'var(--text-muted)' }}><Zap size={16} color="var(--secondary)" /> Growth</div>
          <ProgressBar value={crop.growthProgress} color="var(--secondary)" />
        </div>
      </div>
    </div>
  );
};

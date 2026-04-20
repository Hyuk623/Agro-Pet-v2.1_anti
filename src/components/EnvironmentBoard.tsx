import React from 'react';
import { useGame } from '../context/GameContext';
import { Thermometer, Sun, Wind, Droplets, AlertTriangle, ShieldCheck } from 'lucide-react';

export const EnvironmentBoard: React.FC = () => {
  const { state } = useGame();
  const { environment, player } = state;

  return (
    <div className="glass-panel text-center">
      <h3 className="mb-4" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Today's Environment</h3>
      
      <div className="flex justify-between items-center gap-4">
        
        {/* Temp */}
        <div className="flex-col items-center justify-center p-4" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 12, flex: 1 }}>
          <Thermometer color={environment.temperature < 10 ? 'var(--info)' : environment.temperature > 28 ? 'var(--danger)' : 'var(--success)'} size={32} className="mb-2" />
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{environment.temperature}°C</div>
          <div className="chip mt-2" style={{ background: 'transparent', border: '1px solid currentColor', color: '#718096' }}>Temp</div>
        </div>

        {/* Sunlight */}
        <div className="flex-col items-center justify-center p-4" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 12, flex: 1 }}>
          <Sun color={environment.sunlight === 'sunny' ? '#F6E05E' : environment.sunlight === 'cloudy' ? '#A0AEC0' : '#4299E1'} size={32} className="mb-2" />
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'capitalize' }}>{environment.sunlight}</div>
          <div className="chip mt-2" style={{ background: 'transparent', border: '1px solid currentColor', color: '#718096' }}>Sun</div>
        </div>

        {/* Info Box */}
        <div className="flex-col justify-center p-4" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 12, flex: 1.2 }}>
           {environment.specialEvent ? (
             <>
                <AlertTriangle color="var(--danger)" size={24} className="mb-2" style={{ margin: '0 auto' }}/>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--danger)' }}>{environment.specialEvent.title}</div>
             </>
           ) : (
             <>
                <Wind color="var(--text-muted)" size={24} className="mb-2" style={{ margin: '0 auto' }}/>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Calm Day</div>
             </>
           )}
           {player.activeBuffs.coldProtectionDays > 0 && (
             <div className="flex items-center justify-center mt-2" style={{ color: 'var(--info)', fontSize: '0.8rem' }}>
                <ShieldCheck size={14} className="mr-1"/> Covered
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

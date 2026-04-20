import React from 'react';
import { useGame } from '../context/GameContext';
import { Droplet, Thermometer, Wind, Sun, Beaker, Shield } from 'lucide-react';

export const ActionControls: React.FC = () => {
  const { state, updateAction, runDay, useItem } = useGame();
  const { actions, player } = state;

  const renderButtons = (key: keyof typeof actions, options: string[]) => {
    return (
      <div className="flex bg-[#E2E8F0] p-1 rounded-xl w-full">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => updateAction(key, opt)}
            style={{
              flex: 1,
              padding: '6px 0',
              border: 'none',
              borderRadius: 8,
              background: actions[key] === opt ? 'white' : 'transparent',
              boxShadow: actions[key] === opt ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: actions[key] === opt ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textTransform: 'capitalize'
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-panel">
      <h3 className="mb-4" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Daily Actions</h3>
      
      <div className="flex-col gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: 'var(--text-main)' }}>
             <Droplet size={16} /> Water
          </div>
          {renderButtons('water', ['low', 'normal', 'high'])}
        </div>

        <div className="flex items-center gap-4">
          <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: 'var(--text-main)' }}>
             <Thermometer size={16} /> Heat
          </div>
          {renderButtons('heat', ['low', 'normal', 'high'])}
        </div>

        <div className="flex items-center gap-4">
          <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: 'var(--text-main)' }}>
             <Wind size={16} /> Vent
          </div>
          {renderButtons('ventilation', ['low', 'normal', 'high'])}
        </div>

        <div className="flex items-center gap-4">
          <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: 'var(--text-main)' }}>
             <Sun size={16} /> Light
          </div>
          {renderButtons('light', ['off', 'auto', 'on'])}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 16, marginTop: 16 }}>
         <h4 className="mb-2" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Items</h4>
         <div className="flex justify-between gap-4">
            <button 
              className="btn btn-outline" 
              style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
              onClick={() => useItem('nutrients')}
              disabled={player.inventory.nutrients === 0}
            >
               <Beaker size={14}/> Nutrients ({player.inventory.nutrients})
            </button>
            <button 
              className="btn btn-outline" 
              style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
              onClick={() => useItem('coldProtectors')}
              disabled={player.inventory.coldProtectors === 0}
            >
               <Shield size={14}/> Cold Cover ({player.inventory.coldProtectors})
            </button>
         </div>
      </div>

      <button className="btn btn-primary w-full mt-4" style={{ padding: '16px' }} onClick={runDay}>
         Run Day
      </button>
    </div>
  );
};

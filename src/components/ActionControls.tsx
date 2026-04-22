import React from 'react';
import { useGame } from '../context/GameContext';
import { Droplet, Thermometer, Wind, Sun, Beaker, Shield, Bug, Flower2, Zap } from 'lucide-react';

export const ActionControls: React.FC = () => {
  const { state, updateAction, runDay, useItem } = useGame();
  const { actions, player } = state;

  const controlCards = [
    {
      id: 'water',
      name: 'Watering',
      icon: <Droplet size={20} />,
      options: ['low', 'normal', 'high'],
      color: '#4299E1'
    },
    {
      id: 'heat',
      name: 'Temperature',
      icon: <Thermometer size={20} />,
      options: ['low', 'normal', 'high'],
      color: '#F56565'
    },
    {
      id: 'ventilation',
      name: 'Ventilation',
      icon: <Wind size={20} />,
      options: ['low', 'normal', 'high'],
      color: '#48BB78'
    },
    {
      id: 'light',
      name: 'Grow Lights',
      icon: <Sun size={20} />,
      options: ['off', 'auto', 'on'],
      color: '#ECC94B'
    }
  ];

  const itemButtons = [
    { id: 'nutrients', name: 'Nutrients', icon: <Beaker size={14} />, color: 'var(--primary)' },
    { id: 'coldProtectors', name: 'Thermal', icon: <Shield size={14} />, color: 'var(--info)' },
    { id: 'fertilizer', name: 'NPK Liquid', icon: <Flower2 size={14} />, color: '#9F7AEA' },
    { id: 'pesticide', name: 'Bio-Kill', icon: <Bug size={14} />, color: '#D53F8C' },
    { id: 'booster', name: 'Max Grow', icon: <Zap size={14} />, color: '#ECC94B' }
  ];

  return (
    <div className="flex-col gap-4">
      {/* Environmental Controls */}
      <div className="grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: 12 
      }}>
        {controlCards.map(card => (
          <div key={card.id} className="glass-panel" style={{ 
            margin: 0, 
            padding: '12px',
            borderBottom: `3px solid ${actions[card.id as keyof typeof actions] === 'high' || actions[card.id as keyof typeof actions] === 'on' ? card.color : 'transparent'}`,
            transition: 'all 0.3s ease'
          }}>
            <div className="flex items-center gap-2 mb-3" style={{ color: card.color }}>
              {card.icon}
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{card.name}</span>
            </div>
            
            <div className="flex gap-1 bg-[#F7FAFC] p-1 rounded-lg">
              {card.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => updateAction(card.id as any, opt)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    background: actions[card.id as keyof typeof actions] === opt ? 'white' : 'transparent',
                    boxShadow: actions[card.id as keyof typeof actions] === opt ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    color: actions[card.id as keyof typeof actions] === opt ? card.color : 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Item Inventory Bar */}
      <div className="glass-panel" style={{ margin: 0 }}>
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>Available Supplies</h4>
        <div className="flex gap-2" style={{ overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
           {itemButtons.map(item => (
             <button
               key={item.id}
               className="btn-outline flex items-center gap-2"
               style={{ 
                 padding: '8px 12px', 
                 whiteSpace: 'nowrap', 
                 fontSize: '0.75rem', 
                 borderRadius: '10px',
                 border: `1.5px solid ${player.inventory[item.id as keyof typeof player.inventory] > 0 ? item.color : '#E2E8F0'}`,
                 color: player.inventory[item.id as keyof typeof player.inventory] > 0 ? 'var(--text-main)' : 'var(--text-muted)',
                 opacity: player.inventory[item.id as keyof typeof player.inventory] > 0 ? 1 : 0.6
               }}
               onClick={() => useItem(item.id as any)}
               disabled={player.inventory[item.id as keyof typeof player.inventory] === 0}
             >
                {item.icon}
                <span style={{ fontWeight: 700 }}>{item.name}</span>
                <span className="chip" style={{ 
                  padding: '1px 5px', 
                  fontSize: '0.65rem', 
                  background: 'rgba(0,0,0,0.05)', 
                  marginLeft: 4,
                  borderRadius: 4
                }}>
                  {player.inventory[item.id as keyof typeof player.inventory]}
                </span>
             </button>
           ))}
        </div>
      </div>

      {/* Main Action Button */}
      <button 
        className="btn btn-primary w-full animate-float" 
        style={{ 
          padding: '18px', 
          fontSize: '1.1rem', 
          borderRadius: '18px',
          letterSpacing: '1px',
          marginTop: 8
        }} 
        onClick={runDay}
      >
        Run Day
        <span style={{ opacity: 0.8, fontSize: '0.8rem', marginLeft: 8 }}>Day {state.crop.day} → {state.crop.day + 1}</span>
      </button>
    </div>
  );
};

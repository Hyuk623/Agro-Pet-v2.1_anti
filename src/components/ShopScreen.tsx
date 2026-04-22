import React from 'react';
import { useGame } from '../context/GameContext';
import { ShoppingBag, Beaker, Shield, Coins, Check } from 'lucide-react';

export const ShopScreen: React.FC = () => {
  const { state, buyItem } = useGame();
  const { player } = state;

  const shopItems = [
    {
      id: 'nutrients',
      name: 'Premium Nutrients',
      icon: <Beaker size={24} color="var(--primary)" />,
      description: 'Significantly restores stamina and boosts growth progress.',
      price: 3,
      type: 'nutrients' as const
    },
    {
      id: 'coldProtectors',
      name: 'Thermal Cover',
      icon: <Shield size={24} color="var(--info)" />,
      description: 'Protects the crop from cold stress for one full day.',
      price: 2,
      type: 'coldProtectors' as const
    }
  ];

  return (
    <div className="flex-col p-4 animate-pop" style={{ marginBottom: 80 }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="flex items-center gap-2" style={{ color: 'var(--primary)', margin: 0 }}>
          <ShoppingBag size={28} /> Item Shop
        </h2>
        <div className="chip" style={{ background: '#FEFCBF', color: '#D69E2E', border: '1px solid #D69E2E', display: 'flex', gap: 6, alignItems: 'center', padding: '8px 12px' }}>
          <Coins size={18} /> <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{player.tokens}</span>
        </div>
      </div>

      <div className="flex-col gap-4">
        {shopItems.map(item => (
          <div key={item.id} className="glass-panel flex gap-4 items-center">
            <div style={{ 
              background: 'var(--bg-color)', 
              padding: 16, 
              borderRadius: 16, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {item.icon}
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{item.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>{item.description}</p>
              
              <div className="flex justify-between items-center">
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Possession: {player.inventory[item.type]}
                </div>
                <button 
                  className={`btn ${player.tokens >= item.price ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '6px 14px', borderRadius: 10, fontSize: '0.9rem' }}
                  onClick={() => buyItem(item.type, item.price)}
                  disabled={player.tokens < item.price}
                >
                  {item.price} Tokens
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel mt-6" style={{ background: 'rgba(72, 187, 120, 0.1)', border: '1px dashed var(--success)' }}>
        <h4 className="flex items-center gap-2" style={{ color: 'var(--success)', fontSize: '0.9rem' }}>
          <Check size={16} /> Shopping Tip
        </h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Items purchased here are added immediately to your inventory. Use them on the Farm screen to keep your crop healthy!
        </p>
      </div>
    </div>
  );
};

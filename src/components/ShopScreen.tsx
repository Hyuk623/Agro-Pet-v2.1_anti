import React from 'react';
import { useGame } from '../context/GameContext';
import { ShoppingBag, Beaker, Shield, Coins, Check, Flower2, Bug, Zap } from 'lucide-react';
import type { ItemType } from '../types/game';

export const ShopScreen: React.FC = () => {
  const { state, buyItem } = useGame();
  const { player } = state;

  const shopItems = [
    {
      id: 'nutrients',
      name: 'Organic Nutrients',
      icon: <Beaker size={24} color="var(--primary)" />,
      description: 'Restores stamina and gives a slight growth boost.',
      price: 3,
      type: 'nutrients' as ItemType
    },
    {
      id: 'coldProtectors',
      name: 'Thermal Cover',
      icon: <Shield size={24} color="var(--info)" />,
      description: 'Protects the crop from the next "Sudden Cold Snap".',
      price: 2,
      type: 'coldProtectors' as ItemType
    },
    {
      id: 'fertilizer',
      name: 'NPK Liquid Fertilizer',
      icon: <Flower2 size={24} color="#9F7AEA" />,
      description: 'Major growth push. Watch out for slight stress.',
      price: 4,
      type: 'fertilizer' as ItemType
    },
    {
      id: 'pesticide',
      name: 'Eco-Bio Pesticide',
      icon: <Bug size={24} color="#D53F8C" />,
      description: 'Instantly reduces disease risk by 30%.',
      price: 3,
      type: 'pesticide' as ItemType
    },
    {
      id: 'booster',
      name: 'Max-Grow Booster',
      icon: <Zap size={24} color="#ECC94B" />,
      description: 'Explosive growth but drains significant stamina.',
      price: 6,
      type: 'booster' as ItemType
    }
  ];

  return (
    <div className="flex-col animate-pop" style={{ paddingBottom: 20 }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="flex items-center gap-3" style={{ color: '#38A169', margin: 0 }}>
          <ShoppingBag size={28} /> Agri-Supply Shop
        </h2>
        <div className="chip" style={{ background: '#FEFCBF', color: '#B7791F', border: '1px solid #F6E05E', display: 'flex', gap: 6, alignItems: 'center', padding: '10px 16px', borderRadius: '14px' }}>
          <Coins size={18} /> <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{player.tokens}</span>
        </div>
      </div>

      <div className="flex-col gap-4">
        {shopItems.map(item => (
          <div key={item.id} className="glass-panel flex gap-4 items-center" style={{ padding: '16px' }}>
            <div style={{ 
              background: '#F7FAFC', 
              padding: '16px', 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}>
              {item.icon}
            </div>
            
            <div style={{ flex: 1 }}>
              <div className="flex justify-between items-start mb-1">
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{item.name}</h3>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Owned: {player.inventory[item.type]}
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.4 }}>{item.description}</p>
              
              <button 
                className={`btn w-full ${player.tokens >= item.price ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  padding: '10px', 
                  borderRadius: '12px', 
                  fontSize: '0.9rem',
                  background: player.tokens >= item.price ? 'linear-gradient(135deg, #38A169, #48BB78)' : 'white'
                }}
                onClick={() => buyItem(item.type, item.price)}
                disabled={player.tokens < item.price}
              >
                <div className="flex items-center gap-2">
                   <Coins size={14} /> <span>{item.price} Tokens</span>
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel mt-6" style={{ background: 'rgba(66, 153, 225, 0.05)', border: '1.5px dashed #4299E1', borderRadius: '18px' }}>
        <h4 className="flex items-center gap-2" style={{ color: '#2B6CB0', fontSize: '0.9rem', fontWeight: 700 }}>
          <Check size={18} /> Gardening Expert Choice
        </h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
          Using **Pesticide** when Disease Risk is over 50% can save your crop's life. **Fertilizers** are best used when the crop's stamina is above 70%.
        </p>
      </div>
    </div>
  );
};

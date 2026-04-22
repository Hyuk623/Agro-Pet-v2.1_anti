import React from 'react';
import { useGame } from '../context/GameContext';
import { Home, ShoppingBag, Gamepad2 } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { state, setCurrentPage } = useGame();
  const { currentPage } = state;

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 0, 
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '480px',
      zIndex: 2000,
      padding: '0 16px 16px 16px',
      pointerEvents: 'none' // Allow background clicks if needed around the panel
    }}>
      <div className="glass-panel" style={{ 
        margin: 0, 
        borderRadius: '24px',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-around',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        pointerEvents: 'auto'
      }}>
        <button 
          className="flex-col items-center justify-center gap-1"
          onClick={() => setCurrentPage('farm')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: currentPage === 'farm' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            flex: 1,
            transition: 'all 0.2s',
            transform: currentPage === 'farm' ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          <Home size={22} strokeWidth={currentPage === 'farm' ? 3 : 2} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>Farm</span>
        </button>

        <button 
          className="flex-col items-center justify-center gap-1"
          onClick={() => setCurrentPage('arcade')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: currentPage === 'arcade' ? '#805AD5' : 'var(--text-muted)',
            cursor: 'pointer',
            flex: 1,
            transition: 'all 0.2s',
            transform: currentPage === 'arcade' ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          <Gamepad2 size={22} strokeWidth={currentPage === 'arcade' ? 3 : 2} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>Arcade</span>
        </button>

        <button 
          className="flex-col items-center justify-center gap-1"
          onClick={() => setCurrentPage('shop')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: currentPage === 'shop' ? '#38A169' : 'var(--text-muted)',
            cursor: 'pointer',
            flex: 1,
            transition: 'all 0.2s',
            transform: currentPage === 'shop' ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          <ShoppingBag size={22} strokeWidth={currentPage === 'shop' ? 3 : 2} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>Shop</span>
        </button>
      </div>
    </div>
  );
};
